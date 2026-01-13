<?php

require_once __DIR__ . '/../../utils.php';

$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'page_name' => 'alphaNumeric'
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: page_name.', $validationErrors);
}

try {
    $db = Flight::db();

    $new_page_name = toKebabCase($requestData->page_name);
    $new_page_title = kebabToTitleCase($requestData->page_name);

    // Check if the page already exists
    $page_check_query = '
            SELECT ID FROM PAGES WHERE NAME = ?;
        ';
    $page_check_result = runQuery($db, $page_check_query, [$new_page_name]);
    if ($page_check_result) {
        sendResponse(409, 'Page already exists.');
    }

    // Create the page
    $statement = '
            INSERT INTO PAGES (NAME) 
            VALUES (?)
            ';
    $page_creation_results = runQuery($db, $statement, [$new_page_name]);

    // Add the page as a link
    $page_link_statement = '
            INSERT INTO LINKS (LINK_TEXT, URL)
            VALUES (?, ?)
        ';
    $page_link_query = runQuery($db, $page_link_statement, [$new_page_title, '/' . $new_page_name]);

    $db = null;
    sendResponse(200, 'Page: ' . $new_page_name . ' created.');
} catch (Exception $e) {
    error_log('Page creation error: ' . $e->getMessage());
    $db = null;

    if (Flight::get('IN_DEVELOPMENT')) {
        sendResponse(500, 'There was an error.', ['errorMessage' => $e->getMessage()]);
    } else {
        sendResponse(500, 'An unexpected error occurred. Please try again.');
    }
    exit;
}