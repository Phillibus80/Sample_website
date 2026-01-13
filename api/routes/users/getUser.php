<?php

require_once __DIR__ . '/../../utils.php';

$decodedToken = requireAuth();
if (!$decodedToken) return;

$requestData = Flight::request()->data;
try {
    $db = Flight::db();
    $get_user_statement = '
                SELECT FIRST_NAME, LAST_NAME, USERNAME, EMAIL
                FROM USERS
                WHERE USERS.USERNAME = ?';

    $statementResult = runQuery($db, $get_user_statement, [Flight::get('currentUser')]);

    $userResponse = [];
    if ($statementResult) {
        foreach ($statementResult as $row) {
            $userResponse = [
                'firstName' => $row['FIRST_NAME'],
                'lastName' => $row['LAST_NAME'],
                'username' => $row['USERNAME'],
                'email' => $row['EMAIL'],
                'token' => $decodedToken
            ];
        }

        $db = null;
        sendResponse(200, null, ['user' => $userResponse]);
    } else {
        $db = null;
        sendResponse(400, 'User not found.');
    }
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}