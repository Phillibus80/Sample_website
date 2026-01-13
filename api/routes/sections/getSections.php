<?php

try {
    $validatedPageName = '';

    // check the query param
    $page_name = filter_input(INPUT_GET, 'page', FILTER_UNSAFE_RAW);

    if ($page_name) {
        // Validate the Path Param
        $getSectionsPathParams = ['page' => $page_name];
        $getSectionsParamTypes = ['page' => 'string'];

        $getSectionsValidationResult = validatePathParams($getSectionsPathParams, $getSectionsParamTypes);

        $validatedPageName = $getSectionsValidationResult['values']['page'];
    }

    $db = Flight::db();

    $sectionQueryResults = '';
    if (empty($validatedPageName)) {
        $all_sections_query = 'SELECT * FROM SECTIONS';
        $sectionQueryResults = runQuery($db, $all_sections_query, null);

        $response = [];
        foreach ($sectionQueryResults as $row) {
            $response[] = $row;
        }

    } else {
        $sections_by_page_query = '
            SELECT s.NAME as name, ps.SHOW_SECTION as show_section, s.CREATED_ON, s.UPDATED_ON
            FROM SECTIONS AS s 
            JOIN PAGES_SECTIONS AS ps ON ps.SECTION_ID = s.ID
            JOIN PAGES AS p ON p.ID = ps.PAGE_ID
            WHERE p.NAME = ?
            ';
        $sectionQueryResults = runQuery($db, $sections_by_page_query, [$validatedPageName]);

        $response = [];
        foreach ($sectionQueryResults as $row) {
            if ($row['show_section']) {
                $row['show_section'] = $row['show_section'] === '1';
            }
            $response[] = $row;
        }

    }
    $db = null;
    sendResponse(200, null, [
        'count' => count($response),
        'data' => $response
    ]);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}