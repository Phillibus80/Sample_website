<?php
require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('currentComponent');
    $requestData = Flight::request()->data;

    $validationRules = [
        'component_name' => 'alphaNumeric'
    ];

    $updateErrors = validatePatchRequestData($requestData, $validationRules);
    if (count($updateErrors) > 0) {
        writeLog('PATCH /components', 'warning', 'Validation failed.', $decodedToken->user->username);
        sendResponse(400, 'Bad request', $updateErrors);
        exit();
    }

    $db = Flight::db();

    // check if the Component exists
    $component_search_query = 'SELECT * FROM COMPONENTS WHERE ID = ?';
    $component_search_results = runQuery($db, $component_search_query, [$pathParam]);
    if (!$component_search_results) {
        sendResponse(404, 'Component not found');
    }

    // Update the Sections table
    $fields = [];
    $values = [];

    if (isset($requestData['component_name'])) {
        $fields[] = 'NAME = ?';
        $values[] = $requestData['component_name'];
    }

    if (empty($fields)) {
        writeLog('PATCH /components', 'warning', 'No updatable fields sent.', $decodedToken->user->username);
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $update_component_sql = 'UPDATE COMPONENTS SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $stmt = $db->prepare($update_component_sql);
    $stmt->execute($values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT ID as id, NAME as name FROM COMPONENTS WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Component updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /components', 'success', 'Component updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /components', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}