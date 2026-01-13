<?php
require_once __DIR__ . '/utils.php';

try {
    $db = Flight::db();
    getEvents($db);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
}