<?php

require_once __DIR__ . '/../../utils.php';

try {
    $db = Flight::db();

    // Read optional query param filters
    $dateFilter = filter_input(INPUT_GET, 'date', FILTER_UNSAFE_RAW);
    $endpointFilter = filter_input(INPUT_GET, 'endpoint', FILTER_UNSAFE_RAW);
    $levelFilter = filter_input(INPUT_GET, 'level', FILTER_UNSAFE_RAW);
    $usernameFilter = filter_input(INPUT_GET, 'username', FILTER_UNSAFE_RAW);

    $conditions = [];
    $params = [];

    // Filter by date (matches the DATE portion of CREATED_ON)
    if ($dateFilter !== null && $dateFilter !== '') {
        $sanitizedDate = trim($dateFilter);
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $sanitizedDate)) {
            $conditions[] = 'DATE(CREATED_ON) = ?';
            $params[] = $sanitizedDate;
        }
    }

    // Filter by endpoint
    if ($endpointFilter !== null && $endpointFilter !== '') {
        $sanitizedEndpoint = trim($endpointFilter);
        if (preg_match('/^[a-zA-Z0-9\s\/_.@-]+$/', $sanitizedEndpoint)) {
            $conditions[] = 'ENDPOINT = ?';
            $params[] = $sanitizedEndpoint;
        }
    }

    // Filter by level
    if ($levelFilter !== null && $levelFilter !== '') {
        $sanitizedLevel = trim($levelFilter);
        if (in_array($sanitizedLevel, ['success', 'critical'], true)) {
            $conditions[] = 'LOG_LEVEL = ?';
            $params[] = $sanitizedLevel;
        }
    }

    // Filter by username
    if ($usernameFilter !== null && $usernameFilter !== '') {
        $sanitizedUsername = trim($usernameFilter);
        if (preg_match('/^[a-zA-Z0-9_-]+$/', $sanitizedUsername)) {
            $conditions[] = 'USERNAME = ?';
            $params[] = $sanitizedUsername;
        }
    }

    $query = 'SELECT ID, ENDPOINT, LOG_LEVEL, USERNAME, MESSAGE, CREATED_ON FROM LOGS';
    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }
    $query .= ' ORDER BY CREATED_ON DESC';

    $results = runQuery($db, $query, !empty($params) ? $params : null);

    $response = [];
    foreach ($results as $row) {
        $response[] = [
            'id' => $row['ID'],
            'endpoint' => $row['ENDPOINT'],
            'level' => $row['LOG_LEVEL'],
            'username' => $row['USERNAME'],
            'message' => $row['MESSAGE'],
            'created_on' => $row['CREATED_ON']
        ];
    }

    $db = null;
    sendResponse(200, null, [
        'count' => count($response),
        'data' => $response
    ]);
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}
