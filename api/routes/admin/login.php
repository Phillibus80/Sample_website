<?php

require_once __DIR__ . '/../../utils.php';

function getUserRoles($db, $username): ?array
{
    return runQuery($db, '
         SELECT r.ROLE
                FROM ROLES r
                JOIN USERS_ROLES ur ON r.ID = ur.ROLE_ID
                JOIN USERS u ON u.ID = ur.USER_ID
                WHERE u.USERNAME = ?
    ', [$username]);
}

$username = Flight::request()->data->username ?? '';
$password = Flight::request()->data->password ?? '';

if (empty($username) || empty($password)) {
    unauthorizedResponse('Username and/or Password field(s) are required.');
}

try {
    $db = Flight::db();
    $userData = getUserData($db, $username);

    if ($userData && password_verify($password, $userData['PASSWORD'])) {
        $user_roles = getUserRoles($db, $username);

        $roles = [];
        foreach ($user_roles as $role_row) {
            $roles[] = $role_row['ROLE'];
        }

        $user = [
            'signedIn' => true,
            'username' => $userData['USERNAME'],
            'permLevel' => $roles
        ];

        $expirationTime = time() + (60 * 45); // 45 minutes
        $db = null;

        // Use the improved createJwt function
        $jwt = createJwt($user, $expirationTime, Flight::get('secretKey'));
        $csrfToken = generateCSRFToken();

        sendResponse(200, 'Signed In', [
            'token' => $jwt,
            'csrfToken' => $csrfToken,
            'status' => 200,
            'username' => $userData['USERNAME'],
            'role' => $roles
        ]);
    } else {
        $db = null;
        unauthorizedResponse('Username and Password combination do not match.');
    }
} catch (Exception $e) {
    sendResponse(500, 'There was an error.');
}
