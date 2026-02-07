<?php
require_once __DIR__ . '/../../utils.php';

try {
    $component_id = Flight::get('currentComponent');
    $db = Flight::db();

    // Check that the Component exists
    $component_search_query = 'SELECT * FROM COMPONENTS WHERE ID = ?';
    $component_search_results = runQuery($db, $component_search_query, [$component_id]);
    if (!$component_search_results) {
        writeLog('DELETE /components', 'critical', 'Component not found.', $decodedToken->user->username);
        sendResponse(404, 'Component not found');
    }

    $component_removal_query = 'DELETE FROM COMPONENTS WHERE ID = ?';

    $component_removal_results = runQuery($db, $component_removal_query, [$component_id]);

    $db = null;
    writeLog('DELETE /components', 'success', 'Component removed.', $decodedToken->user->username);
    sendResponse(200, 'Component:: ' . $component_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /components', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}