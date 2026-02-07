<?php

require_once __DIR__ . '/../../utils.php';

try {
    $link_id = Flight::get('linkId');
    $db = Flight::db();

    // Check that the link exists
    $link_search_query = 'SELECT * FROM LINKS WHERE ID = ?';
    $link_search_results = runQuery($db, $link_search_query, [$link_id]);
    if (!$link_search_results) {
        writeLog('DELETE /links', 'critical', 'Link not found.', $decodedToken->user->username);
        sendResponse(404, 'Link not found');
    }

    $linkRemoveQuery = '
            DELETE FROM LINKS
            WHERE ID = ?
            ';

    $linkRemoveResults = runQuery($db, $linkRemoveQuery, [$link_id]);

    $db = null;
    writeLog('DELETE /links', 'success', 'Link removed.', $decodedToken->user->username);
    sendResponse(200, 'Link:: ' . $link_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /links', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}
