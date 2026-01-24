<?php
require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('event_id');
    $db = Flight::db();

    // check if the event exists
    $event_search_query = 'SELECT * FROM EVENTS WHERE ID = ?';
    $event_search_results = runQuery($db, $event_search_query, [$pathParam]);
    if (!$event_search_results) {
        sendResponse(404, 'Event not found');
    }

    $event_remove_query = '
                    DELETE FROM EVENTS
                    WHERE ID = ?
            ';
    runQuery($db, $event_remove_query, [$pathParam]);

    $db = null;
    writeLog('DELETE /events', 'success', 'Event removed.', $decodedToken->user->username);
    sendResponse(200, 'Event id:: ' . $pathParam . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /events', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}
