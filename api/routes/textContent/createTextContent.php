<?php

require_once __DIR__ . '/../../utils.php';

$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'text_content' => 'string'
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: text_content.', $validationErrors);
}

try {
    $db = Flight::db();

    $textContentCreationQuery = '
            INSERT INTO TEXT_CONTENT (TXT) 
            VALUES (?)
            ';

    $linkCreationResult = runQuery($db, $textContentCreationQuery, [
        Flight::request()->data->text_content
    ]);

    $db = null;
    sendResponse(200, 'Text Content Created.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}
