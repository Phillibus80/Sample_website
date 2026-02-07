<?php
// check the query param
$filter_page_links = filter_input(INPUT_GET, 'page-links', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$validatedFilterPageLinks = '';

if (isset($filter_page_links)) {
    // Validate the Path Param
    $filterPageLinksPathParams = ['filter_page_links' => $filter_page_links];
    $filterPageLinksParamTypes = ['filter_page_links' => 'bool'];

    $filterPageLinksValidationResult = validatePathParams(
        $filterPageLinksPathParams,
        $filterPageLinksParamTypes
    );
    if (count($filterPageLinksValidationResult['errors']) > 0) {
        writeLog('GET /links', 'warning', 'Invalid query parameter.');
        sendResponse(400, 'Error with Page Link filter.', $filterPageLinksValidationResult['errors']);
        exit;
    }

    // Return the validated id (path param)
    $validatedFilterPageLinks = $filterPageLinksValidationResult['values']['filter_page_links'];
}

try {
    $db = Flight::db();

    $linksQuery = ($validatedFilterPageLinks)
        ? "SELECT ID, LINK_TEXT, URL FROM LINKS WHERE URL LIKE '/%'"
        : 'SELECT * FROM LINKS';

    $links_response = runQuery($db, $linksQuery, null);

    $getLinksResponse = [];
    foreach ($links_response as $row) {
        $getLinksResponse[] = array(
            'link_id' => $row['ID'],
            'link_text' => $row['LINK_TEXT'],
            'link_url' => $row['URL']
        );
    }

    $db = null;
    writeLog('GET /links', 'success', 'Links retrieved.', null);
    sendResponse(200, null, array(
        'count' => count($getLinksResponse),
        'data' => $getLinksResponse
    ));
} catch (Exception $e) {
    $db = null;
    writeLog('GET /links', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
}