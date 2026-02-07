<?php

require_once __DIR__ . '/../../utils.php';

$requestData = Flight::request()->data;

$validationRules = [
    'page_name' => 'alphaNumeric'
];

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    writeLog('PATCH /pages', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(400, 'Bad request', $updateErrors);
    exit();
}

try {
    $pathParam = Flight::get('currentPage');
    $db = Flight::db();

    // check if the Page exists
    $page_search_query = 'SELECT * FROM PAGES WHERE ID = ?';
    $page_search_results = runQuery($db, $page_search_query, [$pathParam]);
    if (!$page_search_results) {
        writeLog('PATCH /pages', 'critical', 'Page not found.', $decodedToken->user->username);
        sendResponse(404, 'Page not found');
    }

    // Update the Pages table
    $fields = [];
    $values = [];

    if (isset($requestData['page_name'])) {
        $fields[] = 'NAME = ?';
        $values[] = toKebabCase($requestData['page_name']);
    }

    if (empty($fields)) {
        writeLog('PATCH /pages', 'warning', 'No updatable fields sent.', $decodedToken->user->username);
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $update_page_sql = 'UPDATE PAGES SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $update_page_stmt = $db->prepare($update_page_sql);
    $update_page_stmt->execute($values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT ID as id, NAME as name FROM PAGES WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Page updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /pages', 'success', 'Page updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /pages', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}