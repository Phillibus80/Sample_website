<?php

require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('location_id');
    $db = Flight::db();

    // check if the location exists
    $location_search_query = 'SELECT * FROM LOCATIONS WHERE ID = ?';
    $location_search_results = runQuery($db, $location_search_query, [$pathParam]);
    if (!$location_search_results) {
        sendResponse(404, 'Location not found');
    }

    $location_remove_query = '
                    DELETE FROM LOCATIONS
                    WHERE ID = ?
            ';
    runQuery($db, $location_remove_query, [$pathParam]);

    $db = null;
    sendResponse(200, 'Location id:: ' . $pathParam . ' removed.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}
