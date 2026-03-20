<?php
require_once __DIR__ . '/../../utils.php';

$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'component_name' => 'string',
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    writeLog('POST /components', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(422, 'All fields are required: component_name.', $validationErrors);
}

try {
    $db = Flight::db();

    $new_component_name = $requestData->component_name;

    // Check if the component already exists
    $component_check_query = '
            SELECT * FROM COMPONENTS WHERE NAME = ?;
        ';
    $component_check_result = runQuery($db, $component_check_query, [$new_component_name]);
    if ($component_check_result) {
        writeLog('POST /components', 'critical', 'Component already exists.', $decodedToken->user->username);
        sendResponse(409, 'Component already exists.');
    }

    // Create the component
    $statement = '
            INSERT INTO COMPONENTS (NAME) 
            VALUES (?)
            ';
    $component_creation_results = runQuery($db, $statement, [$new_component_name]);

    $db = null;
    writeLog('POST /components', 'success', 'Component created.', $decodedToken->user->username);
    sendResponse(200, 'Component: ' . $new_component_name . ' created.');
} catch (Exception $e) {
    $db = null;
    writeLog('POST /components', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}