<?php
require_once __DIR__ . '/../../../../../utils.php';

$decodedToken = Flight::get('decodedToken');
$pathParam = Flight::get('currentComponentContentId');
$requestData = Flight::request()->data;

$validationRules = [
    'link_url' => 'externalUrl',
    'text_content' => 'markup',
    'image_url' => 'imageLink',
    'event_title' => 'string',
    'event_description' => 'string',
    'event_location' => 'string',
    'event_time' => 'string',
    'event_telephone' => 'telephone',
];

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

    $hasEventUpdates = false;
    $eventId = $search_results[0]['EVENT_ID'] ?? null;

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
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'warning', 'No event associated with component content.', $decodedToken->user->username);
            sendResponse(400, 'Cannot update event title - no event associated with this component content.');
        }

        runQuery($db, '
            UPDATE EVENTS
            SET TITLE = ?
            WHERE ID = ?
        ', [$requestData['event_title'], $eventId]);

        $hasEventUpdates = true;
    }

    if (isset($requestData['event_description'])) {
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'warning', 'No event associated with component content.', $decodedToken->user->username);
            sendResponse(400, 'Cannot update event description - no event associated with this component content.');
        }

        $eventDesId = getOrCreate(
            $db,
            'TEXT_CONTENT',
            ['TXT' => $requestData['event_description']],
            ['TXT' => $requestData['event_description']]
        );

        runQuery($db, '
            UPDATE EVENTS
            SET TEXT_CONTENT_ID = ?
            WHERE ID = ?
        ', [$eventDesId, $eventId]);

        $hasEventUpdates = true;
    }

    if (isset($requestData['event_location'])) {
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'warning', 'No event associated with component content.', $decodedToken->user->username);
            sendResponse(400, 'Cannot update event location - no event associated with this component content.');
        }

        $eventLocationId = getRecordId($db, 'LOCATIONS', ['NAME' => $requestData['event_location']]);
        if (!$eventLocationId) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Event location: ' . $requestData['event_location'] . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Event location: ' . $requestData['event_location'] . ' not found.');
        }

        runQuery($db, '
            UPDATE EVENTS
            SET LOCATION_ID = ?
            WHERE ID = ?
        ', [$eventLocationId, $eventId]);

        $hasEventUpdates = true;
    }

    if (isset($requestData['event_time'])) {
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'warning', 'No event associated with component content.', $decodedToken->user->username);
            sendResponse(400, 'Cannot update event time - no event associated with this component content.');
        }

        runQuery($db, '
            UPDATE EVENTS
            SET EVENT_TIME = ?
            WHERE ID = ?
        ', [$requestData['event_time'], $eventId]);

        $hasEventUpdates = true;
    }

    if (isset($requestData['event_telephone'])) {
        if (!$eventId) {
            writeLog('PATCH /pages_sections_components_content', 'warning', 'No event associated with component content.', $decodedToken->user->username);
            sendResponse(400, 'Cannot update event telephone - no event associated with this component content.');
        }

        $locationId = runQuery($db, '
                SELECT LOCATION_ID
                FROM EVENTS
                WHERE ID = ?
            ', [$eventId]);

        if (!$locationId || !isset($locationId[0]['LOCATION_ID'])) {
            writeLog('PATCH /pages_sections_components_content', 'critical', 'Location associated with Event ID: ' . $eventId . ' not found.', $decodedToken->user->username);
            sendResponse(404, 'Location associated with Event ID: ' . $eventId . ' not found.');
        }

        runQuery($db, '
            UPDATE LOCATIONS
            SET TELEPHONE = ?
            WHERE ID = ?
        ', [$requestData['event_telephone'], $locationId[0]['LOCATION_ID']]);

        $hasEventUpdates = true;
    }

    // Add EVENT_ID to COMPONENT_CONTENT update only once if any event field was updated
    if ($hasEventUpdates && $eventId) {
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
