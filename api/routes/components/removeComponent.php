<?php
require_once __DIR__ . '/../../utils.php';

try {
    $component_id = Flight::get('currentComponent');
    $db = Flight::db();

    // Check that the Component exists
    $component_search_query = 'SELECT * FROM COMPONENTS WHERE ID = ?';
    $component_search_results = runQuery($db, $component_search_query, [$component_id]);
    if (!$component_search_results) {
        sendResponse(404, 'Component not found');
    }

    $component_removal_query = 'DELETE FROM COMPONENTS WHERE ID = ?';

    $component_removal_results = runQuery($db, $component_removal_query, [$component_id]);

    $db = null;
    sendResponse(200, 'Component:: ' . $component_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
}