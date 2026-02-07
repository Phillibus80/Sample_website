<?php

require_once __DIR__ . '/../../../utils.php';

$pathParam = Flight::get('currentPageSection');
$requestData = Flight::request()->data;

$validationRules = [
    'page_name' => 'alphaNumeric',
    'show_section' => 'bool',
    'priority' => 'int'
];

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    writeLog('PATCH /pages_sections', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(400, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the Page Section exists
    $pages_section_search_query = 'SELECT * FROM PAGES_SECTIONS WHERE ID = ?';
    $pages_section_search_results = runQuery($db, $pages_section_search_query, [$pathParam]);
    if (!$pages_section_search_results) {
        writeLog('PATCH /pages_sections', 'critical', 'Page section not found.', $decodedToken->user->username);
        sendResponse(404, 'Page Section not found');
    }

    $pageId = '';
    $sectionId = '';

    // Update the Pages_Sections table
    $fields = [];
    $values = [];

    if (isset($requestData['page_name'])) {
        // check if the page exists
        $page_search_query = 'SELECT  * FROM PAGES WHERE NAME = ?';
        $kebab_case_page_name = toKebabCase($requestData['page_name']);
        $page_search_results = runQuery($db, $page_search_query, [$kebab_case_page_name]);
        if (!$page_search_results) {
            writeLog('PATCH /pages_sections', 'critical', 'Page: ' . $requestData['page_name'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Page: ' . $requestData['page_name'] . ' not found');
        }

        // get the page id
        $page_id_search_query = $db->prepare('SELECT DISTINCT ID FROM PAGES WHERE NAME = ?');
        $page_id_search_query->execute([$kebab_case_page_name]);
        $pageId = $page_id_search_query->fetchColumn();

        $fields[] = 'PAGE_ID = ?';
        $values[] = $pageId;
    }

    if (isset($requestData['section_name'])) {
        // check if the section exists
        $section_search_query = 'SELECT * FROM SECTIONS WHERE NAME = ?';
        $section_search_results = runQuery($db, $section_search_query, [$requestData['section_name']]);
        if (!$section_search_results) {
            writeLog('PATCH /pages_sections', 'critical', 'Section: ' . $requestData['section_name'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Section: ' . $requestData['section_name'] . ' not found');
        }

        // get the section id
        $section_id_search_query = $db->prepare('SELECT DISTINCT ID FROM SECTIONS WHERE NAME = ?');
        $section_id_search_query->execute([$requestData['section_name']]);
        $sectionId = $section_id_search_query->fetchColumn();

        $fields[] = 'SECTION_ID = ?';
        $values[] = $sectionId;
    }

    if (isset($requestData['priority'])) {
        $fields[] = 'PRIORITY = ?';
        $values[] = $requestData['priority'];
    }

    if (isset($requestData['show_section'])) {
        $fields[] = 'SHOW_SECTION = ?';
        $values[] = $requestData['show_section'] === true ? 1 : 0;
    }

    if (empty($fields)) {
        writeLog('PATCH /pages_sections', 'warning', 'No updatable fields sent.', $decodedToken->user->username);
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $update_section_sql = 'UPDATE PAGES_SECTIONS SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $update_stmt = $db->prepare($update_section_sql);
    $update_stmt->execute($values);

    // Fetch and return the updated row
    $update_result_query = '
                        SELECT ps.ID as id, s.NAME as section_name, p.NAME as page_name, ps.PRIORITY, ps.SHOW_SECTION as show_section
                        FROM PAGES as p 
                        JOIN PAGES_SECTIONS as ps ON ps.PAGE_ID = p.ID
                        JOIN SECTIONS as s ON ps.SECTION_ID = s.ID
                        WHERE ps.ID = ?
                    ';

    $updatedContent = [];
    $updatedResult = runQuery($db, $update_result_query, [$pathParam]);
    foreach ($updatedResult as $row) {
        $updatedContent = [
            'page_section_id' => $row['id'],
            'section_name' => $row['section_name'],
            'page_name' => kebabToTitleCase($row['page_name']),
            'show_section' => $row['show_section'] == 1,
            'priority' => $row['PRIORITY']
        ];
    }

    $response = [
        'message' => 'Page Section updated',
        'result' => $updatedContent
    ];

    $db = null;
    writeLog('PATCH /pages_sections', 'success', 'Page section updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /pages_sections', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}