<?php

require_once __DIR__ . '/../../utils.php';

// Missing required fields
$requestData = Flight::request()->data;

if (!isset($requestData['name'])) {
    writeLog('POST /locations', 'warning', 'Missing required field: name.', $decodedToken->user->username);
    sendResponse(400, 'All fields are required: name.');
}

$validationRules = [
    'name' => 'alpha',
    'address' => 'alphaNumeric',
    'city' => 'alpha',
    'state' => 'alpha',
    'zip' => 'int',
    'telephone' => 'telephone',
    'lat' => 'float',
    'lng' => 'float'
];

// Using the patch version since there are 2 possible ways
// to create the location:  the use of lat and lng; the use of the address and
// then geocode that address.
$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    writeLog('POST /locations', 'warning', 'Validation failed.', $decodedToken->user->username);
    sendResponse(422, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    $allowedFields = [
        'name',
        'address',
        'city',
        'state',
        'zip',
        'telephone',
        'lat',
        'lng',
    ];

    validateDependentFields($requestData['address'],
        [
            $requestData['city'],
            $requestData['state'],
            $requestData['zip'],
        ],
        'city, state, and zip are required when address is provided.');
    validateDependentFields($requestData['lat'], [$requestData['lng']], 'lng is required when lat is provided.');
    validateDependentFields($requestData['lng'], [$requestData['lat']], 'lat is required when lng is provided.');

    $insertFields = [];

    foreach ($allowedFields as $field) {
        if (isset($requestData[$field]) && $requestData[$field] !== '') {
            switch ($field) {
                case 'address':
                    $insertFields['STREET_ADDRESS'] = $requestData[$field];
                    break;
                default:
                    $insertFields[$field] = $requestData[$field];
                    break;
            }
        }
    }

    if (empty($insertFields)) {
        writeLog('POST /locations', 'warning', 'No valid fields provided.', $decodedToken->user->username);
        sendResponse(400, 'No valid fields provided.');
    }

    // When there is an address, get the lat and lng
    if ($requestData['address']) {
        if (Flight::get('IN_DEVELOPMENT')) {
            $insertFields['lat'] = '29.571149190378392';
            $insertFields['lng'] = '-98.426592739819';
        } else {
            $addressString = $requestData['address'] . ', ' . $requestData['city'] . ', ' . $requestData['state'] . ' ' . $requestData['zip'];
            $geoCodeResponse = geocodeAddress($addressString);

            $insertFields['lat'] = $geoCodeResponse['lat'];
            $insertFields['lng'] = $geoCodeResponse['lng'];
        }
    }

    // When there is lat and lng, then get the address
    if ($requestData['lat'] && $requestData['lng']) {
        if (Flight::get('IN_DEVELOPMENT')) {
            $insertFields['STREET_ADDRESS'] = '3350 Tavern Oaks';
            $insertFields['CITY'] = 'San Antonio';
            $insertFields['STATE'] = 'TX';
            $insertFields['ZIP'] = '78247';
        } else {
            $reverseGeoCodeResponse = reverseGeocode($requestData['lat'], $requestData['lng']);

            $insertFields['STREET_ADDRESS'] = $reverseGeoCodeResponse['STREET_ADDRESS'];
            $insertFields['CITY'] = $reverseGeoCodeResponse['CITY'];
            $insertFields['STATE'] = $reverseGeoCodeResponse['STATE'];
            $insertFields['ZIP'] = $reverseGeoCodeResponse['ZIP'];
        }
    }

    $locationId = getOrCreate(
        $db,
        'LOCATIONS',
        ['NAME' => $requestData['name']],
        $insertFields
    );

    $db = null;
    writeLog('POST /locations', 'success', 'Location created.', $decodedToken->user->username);
    sendResponse(200, 'Location created with id: ' . $locationId, []);
} catch (Exception $e) {
    $db = null;
    writeLog('POST /locations', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
}
