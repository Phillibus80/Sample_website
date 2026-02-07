<?php

require_once __DIR__ . '/../../utils.php';

$pathParam = Flight::get('linkId');
$requestData = Flight::request()->data;

$validationRules = [
    'link_text' => 'alpha',
    'link_url' => 'string'
];

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    writeLog('PATCH /links', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(400, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the link exists
    $link_search_query = 'SELECT * FROM LINKS WHERE ID = ?';
    $link_search_results = runQuery($db, $link_search_query, [$pathParam]);
    if (!$link_search_results) {
        writeLog('PATCH /links', 'critical', 'Link not found.', $decodedToken->user->username);
        sendResponse(404, 'Link not found');
    }

    $fields = [];
    $values = [];

    if (isset($requestData['link_text'])) {
        $fields[] = 'LINK_TEXT = ?';
        $values[] = $requestData['link_text'];
    }

    if (isset($requestData['link_url'])) {
        $fields[] = 'URL = ?';
        $values[] = $requestData['link_url'];
    }

    if (empty($fields)) {
        writeLog('PATCH /links', 'warning', 'No updatable fields sent.', $decodedToken->user->username);
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $sql = 'UPDATE LINKS SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT ID as id, LINK_TEXT as text, URL as url FROM LINKS WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Link updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /links', 'success', 'Link updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /links', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}