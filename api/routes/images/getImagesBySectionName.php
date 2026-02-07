<?php

require_once __DIR__ . '/../../utils.php';

try {
    $currentSection = Flight::get('currentSection');
    $db = Flight::db();

    $statement = '
                    SELECT DISTINCT i.IMAGE_TEXT, i.SRC, i.ALT, s.NAME
                    FROM IMAGES AS i
                    JOIN COMPONENT_CONTENT as cc on i.ID = cc.IMAGE_ID
                    JOIN PAGE_SECTION_COMPONENTS as psc on cc.PAGE_SECTION_COMPONENTS_ID = psc.ID
                    JOIN PAGES_SECTIONS as ps on psc.PAGE_SECTION_ID = ps.ID
                    JOIN SECTIONS as s on ps.SECTION_ID = s.ID
                    WHERE s.NAME = ?
                    ';

    $statementResult = runQuery($db, $statement, [$currentSection]);

    // Check that the section exists
    if (!$statementResult) {
        writeLog('GET /images/{section_name}', 'critical', 'Section not found.', $decodedToken->user->username);
        sendResponse(404, 'Section not found');
    }

    $imagesResponse = [
        'section' => '',
        'images' => []
    ];
    foreach ($statementResult as $row) {
        $imagesResponse['section'] = $row['NAME'];

        $imagesResponse['images'][] = [
            'imageName' => $row['IMAGE_TEXT'],
            'src' => $row['SRC'],
            'alt' => $row['ALT']
        ];
    }

    $db = null;
    writeLog('GET /images/{section_name}', 'success', 'Images by section retrieved.', $decodedToken->user->username);
    sendResponse(200, null, $imagesResponse);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /images/{section_name}', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}