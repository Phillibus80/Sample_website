<?php

require_once __DIR__ . '/../../utils.php';

try {
    $section_id = Flight::get('currentSection');
    $db = Flight::db();

    // Check that the Section exists
    $section_search_query = 'SELECT * FROM SECTIONS WHERE ID = ?';
    $section_search_results = runQuery($db, $section_search_query, [$section_id]);
    if (!$section_search_results) {
        writeLog('DELETE /sections', 'critical', 'Section not found.', $decodedToken->user->username);
        sendResponse(404, 'Section not found');
    }

    $section_removal_query = 'DELETE FROM SECTIONS WHERE ID = ?';

    $sectionRemoveResults = runQuery($db, $section_removal_query, [$section_id]);

    $db = null;
    writeLog('DELETE /sections', 'success', 'Section removed.', $decodedToken->user->username);
    sendResponse(200, 'Section:: ' . $section_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /sections', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
