<?php

try {
    $db = Flight::db();
    $statement = 'SELECT * FROM TEXT_CONTENT';
    $response = runQuery($db, $statement, null);

    $getTextContentResponse = [];
    foreach ($response as $raw) {
        $getTextContentResponse[] = array(
            'id' => $raw['ID'],
            'text' => $raw['TXT']
        );
    }

    $db = null;
    writeLog('GET /textcontent', 'success', 'Text content retrieved.', null);
    sendResponse(200, null, [
        'count' => count($response),
        'data' => $getTextContentResponse
    ]);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /textcontent', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
    exit;
}