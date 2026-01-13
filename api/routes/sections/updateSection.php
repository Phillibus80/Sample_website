<?php

require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('currentSection');
    $requestData = Flight::request()->data;

    $validationRules = [
        'section_name' => 'alphaNumeric'
    ];

    $updateErrors = validatePatchRequestData($requestData, $validationRules);
    if (count($updateErrors) > 0) {
        sendResponse(400, 'Bad request', $updateErrors);
        exit();
    }

    $db = Flight::db();

    // check if the Section exists
    $section_search_query = 'SELECT * FROM SECTIONS WHERE ID = ?';
    $section_search_results = runQuery($db, $section_search_query, [$pathParam]);
    if (!$section_search_results) {
        sendResponse(404, 'Section not found');
    }

    // Update the Sections table
    $section_fields = [];
    $section_values = [];

    if (isset($requestData['section_name'])) {
        $section_fields[] = 'NAME = ?';
        $section_values[] = $requestData['section_name'];
    }

    if (empty($section_fields)) {
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $section_values[] = $pathParam;

    // Dynamically build the query
    $update_section_sql = 'UPDATE SECTIONS SET ' . implode(', ', $section_fields) . ' WHERE ID = ?';
    $stmt = $db->prepare($update_section_sql);
    $stmt->execute($section_values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT ID as id, NAME as name FROM SECTIONS WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Section updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}