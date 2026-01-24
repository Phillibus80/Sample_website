<?php

// check the query param
$page_name = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$validatedPageName = '';

if (isset($page_name)) {
    // Validate the Path Param
    $getComponentsPathParams = ['page_name' => $page_name];
    $getComponentsParamTypes = ['page_name' => 'string'];

    $getComponentByPageNameValidationResult = validatePathParams(
        $getComponentsPathParams,
        $getComponentsParamTypes
    );
    if (count($getComponentByPageNameValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Component Name.');
        exit;
    }

    // Return the validated id (path param)
    $validatedPageName = $getComponentByPageNameValidationResult['values']['page_name'];
}

try {
    $db = Flight::db();

    $query_results = '';
    if (!$validatedPageName) {
        $all_components_query = 'SELECT * FROM COMPONENTS';
        $query_results = runQuery($db, $all_components_query, null);
    } else {
        $components_by_page_query = '
            SELECT c.NAME as name, c.CREATED_ON, c.UPDATED_ON
            FROM PAGES AS p 
            JOIN PAGES_SECTIONS AS ps ON ps.PAGE_ID = p.ID
            JOIN PAGE_SECTION_COMPONENTS AS psc ON psc.PAGE_SECTION_ID = ps.ID
            JOIN COMPONENTS AS c ON c.ID = psc.COMPONENT_ID
            WHERE p.NAME = ?
            ';
        $query_results = runQuery($db, $components_by_page_query, [$validatedPageName]);
    }

    $response = [];
    foreach ($query_results as $row) {
        $response[] = $row;
    }

    $db = null;
    writeLog('GET /components', 'success', 'Components retrieved.', null);
    sendResponse(200, null, [
        'count' => count($response),
        'data' => $response
    ]);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /components', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
}