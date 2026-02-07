<?php

require_once __DIR__ . '/../../../utils.php';

try {
    $pathParam = Flight::get('currentPageSection');
    $db = Flight::db();

    // check if the page section exists
    $search_query = 'SELECT * FROM PAGES_SECTIONS WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);
    if (!$search_results) {
        writeLog('DELETE /pages_sections', 'critical', 'Page section not found.', $decodedToken->user->username);
        sendResponse(404, 'Page Section not found');
    }

    $removeQuery = '
                    DELETE FROM PAGES_SECTIONS
                    WHERE ID = ?
            ';
    runQuery($db, $removeQuery, [$pathParam]);

    $db = null;
    writeLog('DELETE /pages_sections', 'success', 'Page section removed.', $decodedToken->user->username);
    sendResponse(200, 'Page Section id:: ' . $pathParam . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /pages_sections', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
