<?php

require_once __DIR__ . '/../../utils.php';

try {
    $imageId = Flight::get('image_id');
    $db = Flight::db();

    // check if the image exists
    $image_search_query = 'SELECT * FROM IMAGES WHERE ID = ?';
    $image_search_results = runQuery($db, $image_search_query, [$imageId]);
    if (!$image_search_results) {
        sendResponse(404, 'Image not found');
    }

    $imageRemoveQuery = '
                    DELETE FROM IMAGES
                    WHERE IMAGES.ID = ?
            ';
    runQuery($db, $imageRemoveQuery, [$imageId]);

    $db = null;
    sendResponse(200, 'Image id:: ' . $imageId . ' removed.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
}