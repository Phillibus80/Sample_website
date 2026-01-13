<?php
require_once __DIR__ . '/utils.php';

$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'title' => 'string',
    'location' => 'alphaNumeric',
    'lat' => 'float',
    'lng' => 'float'
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: title, location, lat, and lng.', $validationErrors);
}

try {
    $db = Flight::db();

    $allowedFields = [
        'title',
        'description',
        'location',
        'address',
        'city',
        'state',
        'zip',
        'telephone',
        'lat',
        'lng',
        'event_time'
    ];
    $eventInsertFields = [];
    $locationInsertFields = [];

    foreach ($allowedFields as $field) {
        if (isset($requestData[$field]) && $requestData[$field] !== '') {

            $isEventField = $field === 'title' || $field === 'description';

            if ($isEventField) {
                switch ($field) {
                    case 'description':
                        $eventInsertFields['TXT'] = $requestData[$field];
                        break;
                    default:
                        $eventInsertFields[$field] = $requestData[$field];
                        break;
                }
            } else {
                switch ($field) {
                    case 'location':
                        $locationInsertFields['NAME'] = $requestData[$field];
                        break;
                    case 'address':
                        $locationInsertFields['STREET_ADDRESS'] = $requestData[$field];
                        break;
                    default:
                        $locationInsertFields[$field] = $requestData[$field];
                        break;
                }
            }
        }
    }

    if (empty($eventInsertFields) && empty($locationInsertFields)) {
        sendResponse(400, 'No valid fields provided.');
    }

    $locationId = getOrCreate(
        $db,
        'LOCATIONS',
        ['NAME' => $requestData['location']],
        $locationInsertFields
    );

    $txtId = getOrCreate(
        $db,
        'TEXT_CONTENT',
        ['TXT' => $requestData['description']],
        ['TXT' => $requestData['description']]
    );

    $eventId = getOrCreate(
        $db,
        'EVENTS',
        ['TITLE' => $requestData['title'], 'TEXT_CONTENT_ID' => $txtId, 'LOCATION_ID' => $locationId],
        ['TITLE' => $requestData['title'], 'TEXT_CONTENT_ID' => $txtId, 'LOCATION_ID' => $locationId]
    );

    $db = null;
    sendResponse(200, 'Event created with id: ' . $eventId, []);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
}
