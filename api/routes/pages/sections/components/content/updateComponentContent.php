<?php
require_once __DIR__ . '/../../../../../utils.php';

$pathParam = Flight::get('currentComponentContentId');
$requestData = Flight::request()->data;

$validationRules = [
    'link_url' => 'string',
    'text_content' => 'string',
    'image_url' => 'imageLink',
    'event_title' => 'string',
    'event_description' => 'string',
    'event_location' => 'alphaNumeric',
    'event_time' => 'string',
    'event_telephone' => 'telephone',
];

// Using the patch variant since there can be different combinations
// of request entries
$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    writeLog('PATCH /pages_sections_components_content', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(422, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the Component Content exists
    $search_query = 'SELECT * FROM COMPONENT_CONTENT WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);

    if (!$search_results) {
        writeLog('PATCH /pages_sections_components_content', 'critical', 'Component content not found.', $decodedToken->user->username);
        sendResponse(404, 'Component content not found');
    }

    $fields = [];
    $values = [];

    if (isset($requestData['link_url'])) {
        $linkId = getRecordId($db, 'LINKS', ['URL' => $requestData['link_url']]);
        if (!$linkId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Link url: ' . $requestData['link_url'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Link url: ' . $requestData['link_url'] . ' not found');
        }

        $fields[] = 'LINK_ID = ?';
        $values[] = $linkId;
    }

    if (isset($requestData['text_content'])) {
        $textContentId = getOrCreate(
            $db,
            'TEXT_CONTENT',
            ['TXT' => $requestData['text_content']],
            ['TXT' => $requestData['text_content']]
        );
        if (!$textContentId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Component Content ID: ' . $pathParam . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Component Content ID: ' . $pathParam . ' not found');
        }

        $fields[] = 'TEXT_CONTENT_ID = ?';
        $values[] = $textContentId;
    }

    if (isset($requestData['image_url'])) {
        $imageId = getRecordId($db, 'IMAGES', ['SRC' => $requestData['image_url']]);
        if (!$imageId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Image url: ' . $requestData['image_url'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Image url: ' . $requestData['image_url'] . ' not found');
        }

        $fields[] = 'IMAGE_ID = ?';
        $values[] = $imageId;
    }

    if (isset($requestData['event_title'])) {
        $eventId = $search_results[0]['EVENT_ID'];
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Event title: ' . $requestData['event_title'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Event title: ' . $requestData['event_title'] . ' not found');
        }

        $updatedEventTitleResult = runQuery($db, '
            UPDATE EVENTS
            SET TITLE = ?
            WHERE ID = ?
        ', [$requestData['event_title'], $eventId]);

        $fields[] = 'EVENT_ID = ?';
        $values[] = $eventId;
    }

    if (isset($requestData['event_description'])) {
        $eventId = $search_results[0]['EVENT_ID'];
        $eventDesId = getOrCreate(
            $db,
            'TEXT_CONTENT',
            ['TXT' => $requestData['event_description']],
            ['TXT' => $requestData['event_description']]
        );
        if (!$eventDesId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Event description: ' . $requestData['event_description'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Event description: ' . $requestData['event_description'] . ' not found');
        }

        $updatedEventTextResult = runQuery($db, '
            UPDATE EVENTS
            SET TEXT_CONTENT_ID = ?
            WHERE ID = ?
        ', [$eventDesId, $eventId]);

        $fields[] = 'EVENT_ID = ?';
        $values[] = $eventId;
    }

    if (isset($requestData['event_location'])) {
        $eventId = $search_results[0]['EVENT_ID'];
        $eventLocationId = getRecordId($db, 'LOCATIONS', ['NAME' => $requestData['event_location']]);
        if (!$eventLocationId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Event location: ' . $requestData['event_location'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Event location: ' . $requestData['event_location'] . ' not found');
        }

        $updatedEventLocationResult = runQuery($db, '
            UPDATE EVENTS
            SET LOCATION_ID = ?
            WHERE ID = ?
        ', [$eventLocationId, $eventId]);

        $fields[] = 'EVENT_ID = ?';
        $values[] = $eventId;
    }

    if (isset($requestData['event_time'])) {
        $eventId = $search_results[0]['EVENT_ID'];
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Event ID: ' . $pathParam . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Event ID: ' . $pathParam . ' not found');
        }

        $updatedEventTitleResult = runQuery($db, '
            UPDATE EVENTS
            SET EVENT_TIME = ?
            WHERE ID = ?
        ', [$requestData['event_time'], $eventId]);

        $fields[] = 'EVENT_ID = ?';
        $values[] = $eventId;
    }

    if (isset($requestData['event_telephone'])) {
        $eventId = $search_results[0]['EVENT_ID'];
        $locationId = runQuery($db, '
                SELECT LOCATION_ID
                FROM EVENTS
                WHERE ID = ?
            ', [$eventId]);

        if (!$locationId[0]['LOCATION_ID']) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Location associated with Event ID: ' . $eventId . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Location associated with Event ID: ' . $eventId . ' not found');
        }

        $updatedEventLocationResult = runQuery($db, '
            UPDATE LOCATIONS
            SET TELEPHONE = ?
            WHERE ID = ?
        ', [$requestData['event_telephone'], $locationId[0]['LOCATION_ID']]);

        $fields[] = 'EVENT_ID = ?';
        $values[] = $eventId;
    }

    if (empty($fields)) {
        writeLog('PATCH /pages_sections_components_content', 'warning', 'No updatable fields sent.', $decodedToken->user->username);
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $values[] = $pathParam;

    // Dynamically build the query
    $update_sql = 'UPDATE COMPONENT_CONTENT SET ' . implode(', ', $fields) . ' WHERE ID = ?';
    $update_content_stmt = $db->prepare($update_sql);
    $update_content_stmt->execute($values);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, '
                SELECT 
                    cc.ID AS id, 
                    l.URL AS link, 
                    t.TXT AS text, 
                    i.SRC AS image_src, 
                    e.TITLE AS event_title, 
                    loc.NAME as event_location, 
                    loc.TELEPHONE as event_telephone,
                    tc2.TXT as event_description,
                    e.EVENT_TIME as event_time
                FROM COMPONENT_CONTENT AS cc
                LEFT JOIN LINKS AS l ON cc.LINK_ID = l.ID
                LEFT JOIN TEXT_CONTENT AS t ON cc.TEXT_CONTENT_ID = t.ID
                LEFT JOIN IMAGES AS i ON  cc.IMAGE_ID = i.ID
                LEFT JOIN EVENTS AS e ON  cc.EVENT_ID = e.ID
                LEFT JOIN LOCATIONS AS loc ON e.LOCATION_ID = loc.ID
                LEFT JOIN TEXT_CONTENT AS tc2 ON e.TEXT_CONTENT_ID = tc2.ID
                WHERE cc.ID = ?', [$pathParam]);
    $response = [
        'message' => 'Component Content updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /pages_sections_components_content', 'success', 'Component content updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /pages_sections_components_content', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
