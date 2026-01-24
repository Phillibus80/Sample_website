<?php

require_once __DIR__ . '/../../utils.php';

try {
    $pathParam = Flight::get('currentUser');
    $requestData = Flight::request()->data;

    $validationRules = [
        'firstName' => 'alpha',
        'lastName' => 'alpha',
        'email' => 'email',
        'userName' => 'alphaNumeric',
        'password' => 'password',
        'newPassword' => 'password',
        'permissions' => 'arrayOfRoles'
    ];

    $updateErrors = validatePatchRequestData($requestData, $validationRules);
    if (count($updateErrors) > 0) {
        sendResponse(400, 'Bad request', $updateErrors);
        exit();
    }

    $db = Flight::db();

    // check if the User exists
    $user_search_query = 'SELECT * FROM USERS WHERE ID = ?';
    $user_search_results = runQuery($db, $user_search_query, [$pathParam]);
    if (!$user_search_results) {
        sendResponse(404, 'User not found');
    }

    validateDependentFields($requestData['password'], [$requestData['newPassword']], 'Both password and newPassword are required.');
    validateDependentFields($requestData['newPassword'], [$requestData['password']], 'Both password and newPassword are required.');

    $fields = [];
    $values = [];

    if (isset($requestData['firstName'])) {
        $fields[] = 'FIRST_NAME = ?';
        $values[] = $requestData['firstName'];
    }

    if (isset($requestData['lastName'])) {
        $fields[] = 'LAST_NAME = ?';
        $values[] = $requestData['lastName'];
    }

    if (isset($requestData['email'])) {
        $fields[] = 'EMAIL = ?';
        $values[] = $requestData['email'];
    }

    if (isset($requestData['userName'])) {
        $fields[] = 'USERNAME = ?';
        $values[] = $requestData['userName'];
    }

    if (isset($requestData['password'])) {
        if (password_verify($requestData['password'], $user_search_results[0]['PASSWORD']) && isset($requestData['newPassword'])) {
            $fields[] = 'PASSWORD = ?';
            $values[] = password_hash($requestData['newPassword'], PASSWORD_BCRYPT);
        } else {
            $db = null;
            unauthorizedResponse('Username and Password combination do not match.');
        }
    }

    if (!empty($fields)) {
        // Add ID for WHERE clause
        $values[] = $pathParam;

        // Dynamically build the query
        $update_user_sql = 'UPDATE USERS SET ' . implode(', ', $fields) . ' WHERE ID = ?';
        $update_user_result = runQuery($db, $update_user_sql, $values);
    }

    // Update the User's role
    if (!empty($requestData['permissions']) && is_array($requestData['permissions'])) {
        // Remove all entries in the USERS_ROLES table for the user
        $user_role_remove_stmt = '
            DELETE FROM USERS_ROLES
            WHERE USER_ID = ?
        ';
        $user_role_remove_results = runQuery($db, $user_role_remove_stmt, [$pathParam]);

        foreach ($requestData['permissions'] as $role) {
            // Check if the role exists
            $role_search_query = 'SELECT * FROM ROLES WHERE ROLE = ?';
            $role_search_results = runQuery($db, $role_search_query, [$role]);
            if (!$role_search_results) {
                sendResponse(404, 'Role ' . $role . ' not found');
            }

            // Update the USERS_ROLES table
            $update_role_sql = 'INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
                                VALUES (?, ?)';
            runQuery($db, $update_role_sql, [$pathParam, $role_search_results[0]['ID']]);
        }
    }

    if (empty($requestData['permissions']) && empty($fields)) {
        sendResponse(400, 'Bad Request: No updatable fields sent.');
    }

    // Fetch and return the updated row
    $updatedResult = runQuery($db, '
                                SELECT ID as id, 
                                FIRST_NAME as firstName, 
                                LAST_NAME as lastName,
                                USERNAME as userName,
                                EMAIL as email
                                FROM USERS WHERE ID = ?',
        [$pathParam]);
    $response = [
        'message' => 'User updated',
        'result' => []
    ];

    foreach ($updatedResult as $row) {
        $response['result'] = $row;
    }

    $db = null;
    writeLog('PATCH /users', 'success', 'User updated.', $decodedToken->user->username);
    sendResponse(200, null, $response);
} catch (Exception $e) {
    $db = null;
    writeLog('PATCH /users', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}