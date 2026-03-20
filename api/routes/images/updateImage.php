<?php
require_once __DIR__ . '/../../utils.php';

$pathParam = Flight::get('image_id');
$requestData = Flight::request()->data;

$validationRules = [
    'image_text' => 'string',
    'src' => 'imageLink',
    'alt' => 'string'
];

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    writeLog('PATCH /images', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(400, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the image exists
    $image_search_query = 'SELECT * FROM IMAGES WHERE ID = ?';
    $image_search_results = runQuery($db, $image_search_query, [$pathParam]);
    if (!$image_search_results) {
        writeLog('PATCH /images', 'critical', 'Image not found.', $decodedToken->user->username);
        sendResponse(404, 'Image not found');
    }

    $fields = [];
    $values = [];

    if (isset($requestData['image_text'])) {
        $fields[] = 'IMAGE_TEXT = ?';
        $values[] = $requestData['image_text'];
    }

    if (isset($requestData['src'])) {
        $fields[] = 'SRC = ?';
        $values[] = $requestData['src'];
    }

    if (isset($requestData['alt'])) {
        $fields[] = 'ALT = ?';
        $values[] = $requestData['alt'];
    }

    if (empty($fields)) {
        writeLog('PATCH /images', 'warning', 'No updatable fields sent.', $decodedToken->user->username);
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $sql = 'UPDATE IMAGES SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT ID as id, IMAGE_TEXT as caption_text, SRC as image_url, ALT as image_alt FROM IMAGES WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Image updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /images', 'success', 'Image updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /images', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}