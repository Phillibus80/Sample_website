<?php
try {
    $db = Flight::db();
    $statement = 'SELECT * FROM LOCATIONS WHERE STREET_ADDRESS != \'NULL\' ';
    $response = runQuery($db, $statement, []);

    $locations = [];
    foreach ($response as $row) {
        $locations[] = array(
            'id' => $row['ID'],
            'name' => $row['NAME'],
            'address' => $row['STREET_ADDRESS'],
            'city' => $row['CITY'],
            'state' => $row['STATE'],
            'zip' => $row['ZIP'],
            'telephone' => $row['TELEPHONE'],
            'lat' => $row['LAT'],
            'lng' => $row['LNG'],
        );
    }

    $db = null;
    writeLog('GET /locations', 'success', 'Locations retrieved.', null);
    sendResponse(200, null, [
        'count' => count($response),
        'data' => $locations
    ]);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /locations', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
}