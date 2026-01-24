<?php

require_once __DIR__ . '/../../utils.php';

$pathParam = Flight::get('event_id');
$requestData = Flight::request()->data;

$validationRules = [
    'title' => 'alpha',
    'description' => 'alpha',
    'event_time' => 'string',
    'location' => 'alphaNumeric',
    'address' => 'alphaNumeric',
    'city' => 'alpha',
    'state' => 'alpha',
    'zip' => 'int',
    'telephone' => 'telephone',
    'lat' => 'float',
    'lng' => 'float',
];

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    sendResponse(422, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the Event exists
    $search_query = 'SELECT * FROM EVENTS WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);
    if (!$search_results) {
        sendResponse(404, 'Event not found');
    }

    $eventFields = [];
    $eventValues = [];

    $locationFields = [];
    $locationValues = [];

    // Events
    if (isset($requestData['title'])) {
        $eventFields[] = 'TITLE = ?';
        $eventValues[] = $requestData['title'];
    }

    if (isset($requestData['description'])) {
        $textId = getOrCreate(
            $db,
            'TEXT_CONTENT',
            ['TXT' => $requestData['description']],
            ['TXT' => $requestData['description']]
        );

        $eventFields[] = 'TEXT_CONTENT_ID = ?';
        $eventValues[] = $textId;
    }

    if (isset($requestData['event_time'])) {
        $eventFields[] = 'EVENT_TIME = ?';

        $dt = new DateTime($requestData['event_time']);

        // Format in MySQL TIMESTAMP format
        $date = $dt->format("Y-m-d H:i:s");

        $eventValues[] = $date;
    }

    // Location
    if (isset($requestData['location'])) {
        $locationFields[] = 'NAME = ?';
        $locationValues[] = $requestData['location'];
    }

    if (isset($requestData['address'])) {
        $locationFields[] = 'STREET_ADDRESS = ?';
        $locationValues[] = $requestData['address'];
    }

    if (isset($requestData['city'])) {
        $locationFields[] = 'CITY = ?';
        $locationValues[] = $requestData['city'];
    }

    if (isset($requestData['state'])) {
        $locationFields[] = 'STATE = ?';
        $locationValues[] = $requestData['state'];
    }

    if (isset($requestData['zip'])) {
        $locationFields[] = 'ZIP = ?';
        $locationValues[] = $requestData['zip'];
    }

    if (isset($requestData['telephone'])) {
        $locationFields[] = 'TELEPHONE = ?';
        $locationValues[] = $requestData['telephone'];
    }

    if (isset($requestData['lat'])) {
        $locationFields[] = 'LAT = ?';
        $locationValues[] = $requestData['lat'];
    }

    if (isset($requestData['lng'])) {
        $locationFields[] = 'LNG = ?';
        $locationValues[] = $requestData['lng'];
    }

    if (empty($eventFields) && empty($locationFields)) {
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Add ID for WHERE clause
    $eventValues[] = $pathParam;
    $locationValues[] = $search_results[0]['LOCATION_ID'];

    if (!empty($locationFields)) {
        // Update the Locations table
        $sql = 'UPDATE LOCATIONS SET ' . implode(', ', $locationFields) . ' WHERE ID = ?';
        $stmt = $db->prepare($sql);
        $stmt->execute($locationValues);
    }

    if (!empty($eventFields)) {
        // Update the Events table
        $sql = 'UPDATE EVENTS SET ' . implode(', ', $eventFields) . ' WHERE ID = ?';
        $stmt = $db->prepare($sql);
        $stmt->execute($eventValues);
    }

    // Fetch and return the updated row
    $updatedResult = runQuery($db, '
                SELECT e.ID AS id,
                       e.TITLE AS title,
                       tc.TXT as description,
                       loc.NAME as location, 
                       loc.STREET_ADDRESS as address,
                       loc.CITY as city,
                       loc.ZIP as zip,
                       loc.TELEPHONE as telephone,
                       loc.LAT as lat,
                       loc.LNG as lng,
                       e.EVENT_TIME as event_time
                FROM EVENTS AS e 
                LEFT JOIN LOCATIONS AS loc ON e.LOCATION_ID = loc.ID
                LEFT JOIN TEXT_CONTENT AS tc ON e.TEXT_CONTENT_ID = tc.ID
                WHERE e.ID = ?', [$pathParam]);
    $response = [
        'message' => 'Event updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /events', 'success', 'Event updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /events', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}