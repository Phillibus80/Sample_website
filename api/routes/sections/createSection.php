<?php

require_once __DIR__ . '/../../utils.php';

$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'section_name' => 'string'
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: section_name.', $validationErrors);
}

// Add the section
try {
    $db = Flight::db();

    $new_section_name = Flight::request()->data->section_name;

    // Check if the section already exists
    $section_check_query = '
            SELECT * FROM SECTIONS WHERE NAME = ?;
        ';
    $section_check_result = runQuery($db, $section_check_query, [$new_section_name]);
    if ($section_check_result) {
        sendResponse(409, 'Section already exists.');
    }

    // Create the section
    $statement = '
            INSERT INTO SECTIONS (NAME) 
            VALUES (?)
            ';
    $section_creation_results = runQuery($db, $statement, [$new_section_name]);

    $db = null;
    writeLog('POST /sections', 'success', 'Section created.', $decodedToken->user->username);
    sendResponse(200, 'Section: ' . $new_section_name . ' created.');
} catch (Exception $e) {
    $db = null;
    writeLog('POST /sections', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}