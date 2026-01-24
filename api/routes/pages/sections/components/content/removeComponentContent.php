<?php

require_once __DIR__ . '/../../../../../utils.php';

try {
    $pathParam = Flight::get('currentComponentContentId');
    $db = Flight::db();

    // check if the page section exists
    $search_query = 'SELECT * FROM COMPONENT_CONTENT WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);
    if (!$search_results) {
        sendResponse(404, 'Component Content not found');
    }

    $removeQuery = '
                    DELETE FROM COMPONENT_CONTENT
                    WHERE ID = ?
            ';
    runQuery($db, $removeQuery, [$pathParam]);

    $db = null;
    writeLog('DELETE /pages_sections_components_content', 'success', 'Component content removed.', $decodedToken->user->username);
    sendResponse(200, 'Component Content id:: ' . $pathParam . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /pages_sections_components_content', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
