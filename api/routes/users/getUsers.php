<?php

require_once __DIR__ . '/user-utils.php';
require_once __DIR__ . '/../../utils.php';

$decodedToken = requireAuth();
if (!$decodedToken) return;

$requestData = Flight::request()->data;

try {
    $role_name = filter_input(INPUT_GET, 'role', FILTER_SANITIZE_SPECIAL_CHARS);
    $filter = filter_input(INPUT_GET, 'filter', FILTER_SANITIZE_SPECIAL_CHARS);

    $db = Flight::db();

    if (!isset($role_name)) {
        if (isset($filter)) {
            getUsersWithExclusionFilter($db, $filter);
        } else {
            getUsers($db);
        }

    } else if ($role_name === 'all') {
        // Returns all the possible ROLE types
        getAllUserRoles($db);
    } else {
        getUsersByRole($db, $role_name);
    }

} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}