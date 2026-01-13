<?php

try {
    $db = Flight::db();
    $statement = 'SELECT * FROM IMAGES';
    $response = runQuery($db, $statement, null);

    $getImageResponse = [];
    foreach ($response as $raw) {
        $getImageResponse[] = array(
            'image_id' => $raw['ID'],
            'image_text' => $raw['IMAGE_TEXT'],
            'src' => $raw['SRC'],
            'alt' => $raw['ALT']
        );
    }

    $db = null;
    sendResponse(200, null, [
        'count' => count($response),
        'data' => $getImageResponse
    ]);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
}