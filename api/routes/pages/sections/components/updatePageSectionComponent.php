<?php

require_once __DIR__ . '/../../../../utils.php';

$pathParam = Flight::get('psId');
$oldComponentPathParam = Flight::get('oldComponentId');
$requestData = Flight::request()->data;

$validationRules = [
    'component_id' => 'int'
];

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    sendResponse(422, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the Page Section Component exists
    $search_query = 'SELECT * FROM PAGE_SECTION_COMPONENTS WHERE PAGE_SECTION_ID = ? AND COMPONENT_ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam, $oldComponentPathParam]);
    if (!$search_results) {
        sendResponse(404, 'Page Section Component not found');
    }

    // Get the id from the Page Section Component table that is being updated for the component
    $psc_id = $search_results[0]['ID'];

    // check if the replacement component exists
    $search_component_query = 'SELECT * FROM COMPONENTS WHERE ID = ?';
    $search_component_results = runQuery($db, $search_component_query, [$requestData['component_id']]);
    if (!$search_component_results) {
        sendResponse(404, 'Component not found');
    }

    // Remove the previous component's content
    $remove_query = '
        DELETE FROM COMPONENT_CONTENT
        WHERE PAGE_SECTION_COMPONENTS_ID = ?
        ';
    runQuery($db, $remove_query, [$psc_id]);

    // Update the Page Section Components table
    $fields = [];
    $values = [];

    if (isset($requestData['component_id'])) {
        $fields[] = 'COMPONENT_ID = ?';
        $values[] = $requestData['component_id'];
    }

    if (empty($fields)) {
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $psc_id;

    // Dynamically build the query
    $update_sql = '
                    UPDATE PAGE_SECTION_COMPONENTS
                    SET ' . implode(', ', $fields) . '
                    WHERE ID = ?
                  ';
    $update_stmt = $db->prepare($update_sql);
    $update_stmt->execute($values);

    // Create a new entry in the component content table for the new component
    $insert_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID)
            VALUES (?)
        ';
    runQuery($db, $insert_query, [$psc_id]);


    // Fetch and return the updated row
    $update_query = '
                    SELECT psc.ID, p.NAME AS page_name, s.NAME AS section_name, c.NAME AS component_name
                    FROM PAGE_SECTION_COMPONENTS AS psc
                    JOIN COMPONENTS AS c ON c.ID = psc.COMPONENT_ID
                    JOIN PAGES_SECTIONS AS ps ON psc.PAGE_SECTION_ID = ps.ID
                    JOIN PAGES AS p ON ps.PAGE_ID = p.ID
                    JOIN SECTIONS AS s ON ps.SECTION_ID = s.ID
                    WHERE psc.ID = ?
                ';
    $updated_result = runQuery($db, $update_query, [$pathParam]);
    $response = [
        'message' => 'Page Section Component updated',
        'result' => []
    ];

    foreach ($updated_result as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /pages_sections_components', 'success', 'Page section component updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /pages_sections_components', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}