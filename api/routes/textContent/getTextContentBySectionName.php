<?php

require_once __DIR__ . '/../../utils.php';

try {
    $currentSection = Flight::get('currentSection');
    $db = Flight::db();
    $statement = '
                    SELECT DISTINCT tc.TXT, s.NAME
                    FROM TEXT_CONTENT AS tc
                    JOIN COMPONENT_CONTENT as cc on tc.ID = cc.TEXT_CONTENT_ID
                    JOIN PAGE_SECTION_COMPONENTS as psc on cc.PAGE_SECTION_COMPONENTS_ID = psc.ID
                    JOIN PAGES_SECTIONS as ps on psc.PAGE_SECTION_ID = ps.ID
                    JOIN SECTIONS as s on ps.SECTION_ID = s.ID
                    WHERE s.NAME = ?
                    ';

    $textContentResult = runQuery($db, $statement, [$currentSection]);

    // Check that the section exists
    if (!$textContentResult) {
        writeLog('GET /textcontent/{section_name}', 'critical', 'Section not found.', $decodedToken->user->username);
        sendResponse(404, 'Section not found');
    }

    $textResponse = [
        'section' => '',
        'text_content' => []
    ];
    foreach ($textContentResult as $row) {
        $textResponse['section'] = $row['NAME'];

        $textResponse['text_content'][] = [
            'text' => $row['TXT']
        ];
    }

    $db = null;
    writeLog('GET /textcontent/{section_name}', 'success', 'Text content by section retrieved.', $decodedToken->user->username);
    sendResponse(200, null, $textResponse);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /textcontent/{section_name}', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}