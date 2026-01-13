<?php

require_once __DIR__ . '/../../../utils.php';

try {
    $pathParam = Flight::get('currentPageSection');
    $db = Flight::db();

    // check if the page section exists
    $search_query = 'SELECT * FROM PAGES_SECTIONS WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);
    if (!$search_results) {
        sendResponse(404, 'Page Section not found');
    }

    $removeQuery = '
                    DELETE FROM PAGES_SECTIONS
                    WHERE ID = ?
            ';
    runQuery($db, $removeQuery, [$pathParam]);

    $db = null;
    sendResponse(200, 'Page Section id:: ' . $pathParam . ' removed.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}
