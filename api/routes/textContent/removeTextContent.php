<?php

require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('text_content_id');
    $db = Flight::db();

    // check if the text content exists
    $text_search_query = 'SELECT * FROM TEXT_CONTENT WHERE ID = ?';
    $text_search_results = runQuery($db, $text_search_query, [$pathParam]);
    if (!$text_search_results) {
        sendResponse(404, 'Text Content not found');
    }

    $textContentRemoveQuery = '
                    DELETE FROM TEXT_CONTENT
                    WHERE ID = ?
            ';
    runQuery($db, $textContentRemoveQuery, [$pathParam]);

    $db = null;
    writeLog('DELETE /textcontent', 'success', 'Text content removed.', $decodedToken->user->username);
    sendResponse(200, 'Text Content id:: ' . $pathParam . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /textcontent', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
