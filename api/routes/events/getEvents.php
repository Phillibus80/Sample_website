<?php
require_once __DIR__ . '/utils.php';

try {
    $db = Flight::db();
    getEvents($db, null);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /events', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
}