<?php

require_once __DIR__ . '/../../../../utils.php';

try {
    $psc_id = Flight::get('pscId');
    $db = Flight::db();

    // Check that the page section component entry exists
    $search_query = 'SELECT * FROM PAGE_SECTION_COMPONENTS WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$psc_id]);
    if (!$search_results) {
        writeLog('DELETE /pages_sections_components', 'critical', 'Page section component not found.', $decodedToken->user->username);
        sendResponse(404, 'Page Section Component not found');
    }

    $remove_query = '
            DELETE FROM PAGE_SECTION_COMPONENTS
            WHERE ID = ?
            ';

    $pageRemoveResults = runQuery($db, $remove_query, [$psc_id]);

    $db = null;
    writeLog('DELETE /pages_sections_components', 'success', 'Page section component removed.', $decodedToken->user->username);
    sendResponse(200, 'Page Section Component: ' . $psc_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /pages_sections_components', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
