<?php

require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('text_content_id');
    $requestData = Flight::request()->data;

    $validationRules = [
        'text_content' => 'string'
    ];

    $updateErrors = validatePatchRequestData($requestData, $validationRules);
    if (count($updateErrors) > 0) {
        sendResponse(400, 'Bad request', $updateErrors);
        exit();
    }

    $db = Flight::db();

    // check if the Text Content exists
    $search_query = 'SELECT * FROM TEXT_CONTENT WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);
    if (!$search_results) {
        sendResponse(404, 'Text Content not found');
    }

    $fields = [];
    $values = [];

    if (isset($requestData['text_content'])) {
        $fields[] = 'TXT = ?';
        $values[] = $requestData['text_content'];
    }

    if (empty($fields)) {
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $sql = 'UPDATE TEXT_CONTENT SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT ID as id, TXT as text  FROM TEXT_CONTENT WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Text Content updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /textcontent', 'success', 'Text content updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /textcontent', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}