<?php

require_once __DIR__ . "/../../utils.php";

$requiredFieldsAndTypes = [
    'first_name' => 'string',
    'last_name' => 'string',
    'email' => 'email',
    'username' => 'alphaNumeric',
    'password' => 'password'
];

$validationErrors = validateRequestData(
    Flight::request()->data,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: first_name, last_name, email, username, and password.', $validationErrors);
}

try {
    $db = Flight::db();
    $encrypted_password = isset(Flight::request()->data->password)
        ? password_hash(Flight::request()->data->password, PASSWORD_BCRYPT)
        : null;

    // Create the user and insert into the User's table
    $user_statement = '
            INSERT INTO USERS (FIRST_NAME, LAST_NAME, USERNAME, EMAIL, PASSWORD) 
            VALUES (?, ?, ?, ?, ?)
            ';
    runQuery($db, $user_statement, [
        Flight::request()->data->first_name,
        Flight::request()->data->last_name,
        Flight::request()->data->username,
        Flight::request()->data->email,
        $encrypted_password
    ]);

    $new_user_id = $db->lastInsertId();

    // Insert the new user into the USERS_ROLES tables as a USER (ID = 1)
    $users_roles_statement = '
            INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
            VALUES (?, ?)
        ';
    runQuery($db, $users_roles_statement, [$new_user_id, 1]);

    if (Flight::get('IN_DEVELOPMENT')) {
        $users_roles_statement2 = '
            INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
            VALUES (?, ?)
        ';
        runQuery($db, $users_roles_statement2, [$new_user_id, 2]);

        $users_roles_statement3 = '
            INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
            VALUES (?, ?)
        ';
        runQuery($db, $users_roles_statement3, [$new_user_id, 3]);

        $users_roles_statement4 = '
            INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
            VALUES (?, ?)
        ';
        runQuery($db, $users_roles_statement4, [$new_user_id, 4]);
    }

    $db = null;
    sendResponse(200, 'User added.');
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}