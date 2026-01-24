<?php

require_once __DIR__ . '/../../utils.php';

try {
    $page_id = Flight::get('currentPage');
    $db = Flight::db();

    // Check that the page exists
    $page_search_query = 'SELECT * FROM PAGES WHERE ID = ?';
    $page_search_results = runQuery($db, $page_search_query, [$page_id]);
    if (!$page_search_results) {
        sendResponse(404, 'Page not found');
    }

    $pageRemoveQuery = '
            DELETE FROM PAGES
            WHERE ID = ?
            ';

    $pageRemoveResults = runQuery($db, $pageRemoveQuery, [$page_id]);

    $db = null;
    writeLog('DELETE /pages', 'success', 'Page removed.', $decodedToken->user->username);
    sendResponse(200, 'Page: ' . $page_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /pages', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
