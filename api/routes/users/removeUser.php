<?php

require_once __DIR__ . '/../../utils.php';

try {
    $user_id = Flight::get('currentUser');
    $db = Flight::db();

    // Check that the User exists
    $user_search_query = 'SELECT * FROM USERS WHERE ID = ?';
    $user_search_results = runQuery($db, $user_search_query, [$user_id]);
    if (!$user_search_results) {
        sendResponse(404, 'User not found');
    }

    $userRemoveQuery = '
            DELETE FROM USERS
            WHERE ID = ?
            ';

    $userRemoveResults = runQuery($db, $userRemoveQuery, [$user_id]);

    $db = null;
    writeLog('DELETE /users', 'success', 'User removed.', $decodedToken->user->username);
    sendResponse(200, 'User:: ' . $user_id . ' removed.');
} catch (Exception $e) {
    $db = null;
    writeLog('DELETE /users', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'There was an error.');
    exit;
}
