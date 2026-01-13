<?php

require_once __DIR__ . '/../../utils.php';

$pathParam = Flight::get('location_id');
$requestData = Flight::request()->data;

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

$updateErrors = validatePatchRequestData($requestData, $validationRules);
if (count($updateErrors) > 0) {
    sendResponse(400, 'Bad request', $updateErrors);
    exit();
}

try {
    $db = Flight::db();

    // check if the Location exists
    $search_query = 'SELECT * FROM LOCATIONS WHERE ID = ?';
    $search_results = runQuery($db, $search_query, [$pathParam]);
    if (!$search_results) {
        sendResponse(404, 'Location not found');
    }


    $locationFields = [];
    $locationValues = [];

    // Location
    if (isset($requestData['name'])) {
        $locationFields[] = 'NAME = ?';
        $locationValues[] = $requestData['name'];
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

    if (empty($locationFields)) {
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    $locationValues[] = $pathParam;

    $sql = 'UPDATE LOCATIONS SET ' . implode(', ', $locationFields) . ' WHERE ID = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($locationValues);

    // Fetch and return the updated row
    $updatedResult = runQuery($db, 'SELECT * FROM LOCATIONS WHERE ID = ?', [$pathParam]);
    $response = [
        'message' => 'Location updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}