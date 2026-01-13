<?php

require_once __DIR__ . '/../../utils.php';

// Missing required fields
$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'link_text' => 'string',
    'url' => 'string'
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: link_text, and url.', $validationErrors);
}

try {
    $db = Flight::db();

    $linkCreationQuery = '
            INSERT INTO LINKS (link_text, url) 
            VALUES (?, ?)
            ';

    $linkCreationResult = runQuery($db, $linkCreationQuery, [
        Flight::request()->data->link_text,
        Flight::request()->data->url
    ]);

    $db = null;
    sendResponse(200, 'Link Created.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
}
