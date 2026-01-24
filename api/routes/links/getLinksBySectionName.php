<?php

try {
    $db = Flight::db();

    $get_links_statement = '
            SELECT DISTINCT l.ID, l.LINK_TEXT, l.URL, s.NAME
            FROM LINKS as l
            JOIN COMPONENT_CONTENT as cc on l.ID = cc.LINK_ID
            JOIN PAGE_SECTION_COMPONENTS as psc on cc.PAGE_SECTION_COMPONENTS_ID = psc.ID
            JOIN PAGES_SECTIONS as ps on psc.PAGE_SECTION_ID = ps.ID
            JOIN SECTIONS as s on ps.SECTION_ID = s.ID
            WHERE s.NAME = ?
            ';

    $statementResult = runQuery($db, $get_links_statement, [Flight::get('currentSection')]);

    // Check that the section exists
    if (!$statementResult) {
        sendResponse(404, 'Section not found');
    }

    $linksResponse = [];
    foreach ($statementResult as $row) {
        $linksResponse[] = array(
            'id' => $row['ID'],
            'title' => $row['LINK_TEXT'],
            'url' => $row['URL'],
            'section_name' => $row['NAME']
        );
    }

    $db = null;
    writeLog('GET /links/{section_name}', 'success', 'Links by section retrieved.', null);
    sendResponse(200, null, $linksResponse);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /links/{section_name}', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
}
