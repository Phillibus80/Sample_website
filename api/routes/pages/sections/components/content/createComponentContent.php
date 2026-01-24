<?php

require_once __DIR__ . '/../../../../../utils.php';

$requestData = Flight::request()->data;
$pathParam = Flight::get('currentPageSectionComponentId');

$validationRules = [
    'link_text' => 'alpha',
    'link_url' => 'string',
    'text_content' => 'string',
    'image_text' => 'alpha',
    'image_src' => 'imageLink',
    'image_alt' => 'alphaNumeric',
    'event_title' => 'alphaNumeric',
    'event_text' => 'string',
    'event_location' => 'alphaNumeric',
    'event_lat' => 'float',
    'event_lng' => 'float',
    'event_time' => 'string'
];

// Using the patch variant since there can be different combinations
// of request entries
$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    sendResponse(422, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // Get the fields from the request body
    $linkText = $requestData['link_text'] ?? null;
    $linkUrl = $requestData['link_url'] ?? null;

    $textContent = $requestData['text_content'] ?? null;

    $imageText = $requestData['image_text'] ?? null;
    $imageSrc = $requestData['image_src'] ?? null;
    $imageAlt = $requestData['image_alt'] ?? null;

    $eventTitle = $requestData['event_title'] ?? null;
    $eventText = $requestData['event_text'] ?? null;
    $eventLocation = $requestData['event_location'] ?? null;
    $eventLat = $requestData['event_lat'] ?? null;
    $eventLng = $requestData['event_lng'] ?? null;
    $eventTime = $requestData['event_time'] ?? null;

    // Validate dependent fields
    validateDependentFields($linkText, [$linkUrl], 'link_url is required when link_text is provided.');
    validateDependentFields($imageSrc, [$imageText, $imageAlt], 'image_text and image_alt are required when image_src is provided.');
    validateDependentFields($eventTitle, [$eventText, $eventLocation, $eventLat, $eventLng, $eventTime], 'event_text, event_location, event_time, event_lat and event_lng are required when event_title is provided.');

    if ($linkText && $linkUrl) {
        $linkId = getOrCreate(
            $db,
            'LINKS',
            ['URL' => $linkUrl],
            ['LINK_TEXT' => $linkText, 'URL' => $linkUrl]
        );
    }

    if ($textContent) {
        $textId = getOrCreate(
            $db,
            'TEXT_CONTENT',
            ['TXT' => $textContent],
            ['TXT' => $textContent]
        );
    }

    if ($imageSrc) {
        $imageId = getOrCreate(
            $db,
            'IMAGES',
            ['SRC' => $imageSrc],
            ['IMAGE_TEXT' => $imageText, 'SRC' => $imageSrc, 'ALT' => $imageAlt]
        );
    }

    if ($eventTitle) {
        $eventTxtId = getOrCreate(
            $db,
            'TEXT_CONTENT',
            ['TXT' => $eventText],
            ['TXT' => $eventText]
        ) ?? null;

        $locationId = getOrCreate(
            $db,
            'LOCATIONS',
            ['NAME' => $eventLocation],
            ['NAME' => $eventLocation, 'LAT' => $eventLat, 'LNG' => $eventLng]
        ) ?? null;

        $eventId = getOrCreate(
            $db,
            'EVENTS',
            ['TITLE' => $eventTitle],
            ['TITLE' => $eventTitle, 'TEXT_CONTENT_ID' => $eventTxtId, 'LOCATION_ID' => $locationId]
        ) ?? null;
    }

    // Insert a new row
    $insertFields = ['PAGE_SECTION_COMPONENTS_ID' => $pathParam];
    if (isset($linkId)) $insertFields['LINK_ID'] = $linkId;
    if (isset($textId)) $insertFields['TEXT_CONTENT_ID'] = $textId;
    if (isset($imageId)) $insertFields['IMAGE_ID'] = $imageId;
    if (isset($eventId)) $insertFields['EVENT_ID'] = $eventId;

    $columns = implode(',', array_keys($insertFields));
    $placeholders = implode(',', array_fill(0, count($insertFields), '?'));

    $columns = implode(',', array_keys($insertFields));
    $placeholders = implode(',', array_fill(0, count($insertFields), '?'));
    $stmt = $db->prepare("INSERT INTO COMPONENT_CONTENT ($columns) VALUES ($placeholders)");
    $stmt->execute(array_values($insertFields));
    $componentId = $db->lastInsertId();

    // Get the results
    $component_creation_statement = '
            SELECT cc.PAGE_SECTION_COMPONENTS_ID AS page_section_component_id,
                   cc.ID AS component_content_id,
                   l.LINK_TEXT as link_text, 
                   l.URL as link_url, 
                   tc.TXT as text_content, 
                   i.SRC as image_src, 
                   i.ALT as image_alt, 
                   i.IMAGE_TEXT as image_text,
                   e.TITLE as event_text,
                   tc2.TXT as event_description,
                   loc.NAME as event_name,
                   loc.STREET_ADDRESS as event_address,
                   loc.CITY as event_city,
                   loc.STATE as event_state,
                   loc.ZIP as event_zip,
                   loc.TELEPHONE as event_telephone,
                   loc.LAT as event_lat,
                   loc.LNG as event_lng,
                   e.EVENT_TIME as event_time
            FROM COMPONENT_CONTENT AS cc
            LEFT JOIN LINKS AS l ON cc.LINK_ID = l.ID
            LEFT JOIN TEXT_CONTENT AS tc ON cc.TEXT_CONTENT_ID = tc.ID
            LEFT JOIN IMAGES AS i ON cc.IMAGE_ID = i.ID
            LEFT JOIN EVENTS AS e ON cc.EVENT_ID = e.ID
            LEFT JOIN TEXT_CONTENT AS tc2 ON tc2.ID = e.TEXT_CONTENT_ID
            LEFT JOIN LOCATIONS AS loc ON loc.ID = e.LOCATION_ID
            WHERE cc.ID = ?
            ';
    $result = runQuery($db, $component_creation_statement, [$componentId]);

    $response = [];
    foreach ($result as $row) {
        $response = [
            'page_section_component_id' => $row['page_section_component_id'],
            'component_content_id' => $row['component_content_id'],
            'link_text' => $row['link_text'],
            'link_url' => $row['link_url'],
            'text_content' => $row['text_content'],
            'image_src' => $row['image_src'],
            'image_alt' => $row['image_alt'],
            'image_text' => $row['image_text'],
            'event_text' => $row['event_text'],
            'event_description' => $row['event_description'],
            'event_location' => $row['event_name'],
            'event_lat' => $row['event_lat'],
            'event_lng' => $row['event_lng'],
            'event_time' => $row['event_time']
        ];
    }
    $db = null;
    writeLog('POST /pages_sections_components_content', 'success', 'Component content created.', $decodedToken->user->username);
    sendResponse(200, 'Component Content created.', ['data' => $response]);
} catch (Exception $e) {
    $db = null;
    writeLog('POST /pages_sections_components_content', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}