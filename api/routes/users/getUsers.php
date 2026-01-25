<?php

require_once __DIR__ . '/user-utils.php';
require_once __DIR__ . '/../../utils.php';

$requestData = Flight::request()->data;

try {
    $role_name = filter_input(INPUT_GET, 'role', FILTER_SANITIZE_SPECIAL_CHARS);
    $filter = filter_input(INPUT_GET, 'filter', FILTER_SANITIZE_SPECIAL_CHARS);

    $db = Flight::db();

    if (!isset($role_name)) {
        if (isset($filter)) {
            getUsersWithExclusionFilter($db, $filter, $decodedToken->user->username);
        } else {
            getUsers($db, $decodedToken->user->username);
        }

    } else if ($role_name === 'all') {
        // Returns all the possible ROLE types
        getAllUserRoles($db, $decodedToken->user->username);
    } else {
        getUsersByRole($db, $role_name, $decodedToken->user->username);
    }

} catch (Exception $e) {
    $db = null;
    writeLog('GET /users', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}