<?php

require_once __DIR__ . '/../../../../utils.php';

$request_data = Flight::request()->data;

$requiredFieldsAndTypes = [
    'page_section_id' => 'int',
    'component_id' => 'int'
];

$validationErrors = validateRequestData(
    $request_data,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: page_section_id, and component_id.', $validationErrors);
}

try {
    $db = Flight::db();

    // Check if the page section already exists
    $page_section_check_query = '
            SELECT * FROM PAGE_SECTION_COMPONENTS WHERE PAGE_SECTION_ID = ?;
        ';
    $page_section_check_result = runQuery($db, $page_section_check_query, [$request_data['page_section_id']]);
    if (!$page_section_check_result) {
        sendResponse(404, 'Page Section not found.');
    }

    // Check if the component already exists
    $components_check_query = '
            SELECT * FROM COMPONENTS WHERE ID = ?;
        ';
    $components_check_result = runQuery($db, $components_check_query, [$request_data['component_id']]);
    if (!$components_check_result) {
        sendResponse(404, 'Component not found.');
    }

    // Add the component to the page section components table
    $statement = $db->prepare('
            INSERT INTO PAGE_SECTION_COMPONENTS (PAGE_SECTION_ID, COMPONENT_ID)
            VALUES (?, ?)
            ');
    $page_section_component_creation_results = $statement->execute([
        $request_data['page_section_id'],
        $request_data['component_id']
    ]);
    $newly_added_page_section_component_id = $db->lastInsertId();

    // Add an entry into the Component Content table
    $component_content_query = $db->prepare('
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID)
            VALUES (?);
        ');
    $component_content_results = $component_content_query->execute([$newly_added_page_section_component_id]);
    $newly_added_component_content_id = $db->lastInsertId();

    // Get the result
    $result_query = '
            SELECT p.NAME AS page_name, s.NAME AS section_name, c.NAME AS component_name
            FROM PAGE_SECTION_COMPONENTS AS psc
            JOIN COMPONENTS AS c ON c.ID = psc.COMPONENT_ID
            JOIN PAGES_SECTIONS  AS ps ON psc.PAGE_SECTION_ID = ps.ID
            JOIN PAGES AS p ON p.ID = ps.PAGE_ID
            JOIN SECTIONS AS s ON ps.SECTION_ID = s.ID
            WHERE psc.ID = ?
        ';
    $results = runQuery($db, $result_query, [$newly_added_page_section_component_id]);

    $response = [];
    foreach ($results as $row) {
        $response = [
            'page_name' => kebabToTitleCase($row['page_name']),
            'section_name' => $row['section_name'],
            'page_section_component_id' => $newly_added_page_section_component_id,
            'component_id' => $request_data['component_id'],
            'component_name' => $row['component_name'],
            'component_content_id' => $newly_added_component_content_id
        ];
    }

    $db = null;
    sendResponse(200, 'Component ' . $request_data['component_id'] . ' added.', $response);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}