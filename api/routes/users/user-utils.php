<?php

use JetBrains\PhpStorm\NoReturn;

function buildUserResponse($statement_result): array
{
    if (!$statement_result) return [];

    $userResponse = [];
    foreach ($statement_result as $row) {
        $userResponse[] = [
            'id' => (int)$row['ID'],
            'firstName' => $row['FIRST_NAME'],
            'lastName' => $row['LAST_NAME'],
            'username' => $row['USERNAME'],
            'email' => $row['EMAIL'],
            'role' => $row['ROLE'],
            'createdOn' => $row['CREATED_ON']
            // 'token' => $token
        ];
    }

    return $userResponse;
}

/**
 * The logic to create a User.  The only required field is the Email field.
 *
 * @param PDO $db
 * @param string $emailAddress = Required, the email address of the user being created
 * @param string $firstName - Optional, user's first name
 * @param string $lastName - Optional, user's last name
 * @param string $username - Optional, user's username
 * @param string $password - Optional, user's password
 * @return string|false|null
 * @throws Exception
 */
function createUser(
    PDO    $db,
    string $emailAddress,
    string $firstName,
    string $lastName,
    string $username,
    string $password): string|null|false
{
    try {
        $user_statement = '
            INSERT INTO USERS (FIRST_NAME, LAST_NAME, USERNAME, EMAIL, PASSWORD) 
            VALUES (?, ?, ?, ?, ?)
            ';
        runQuery($db, $user_statement, [
            $firstName,
            $lastName,
            $username,
            $emailAddress,
            $password
        ]);

        return $db->lastInsertId();
    } catch (Exception $e) {
        $db = null;
        sendResponse(500, 'There was an error creating the User.', ['errorMessage' => $e->getMessage()]);
    }

    return null;
}

/**
 * The logic to create a User.  The only required field is the Email field.
 *
 * @param PDO $db
 * @param string $emailAddress = Required, the email address of the user being created
 * @return string|false|null
 * @throws Exception
 */
function createEmailUser(
    PDO    $db,
    string $emailAddress,
): string|null|false
{
    try {
        $user_statement = '
            INSERT INTO USERS (EMAIL) 
            VALUES (?)
            ';
        runQuery($db, $user_statement, [$emailAddress]);

        return $db->lastInsertId();
    } catch (Exception $e) {
        $db = null;
        sendResponse(500, 'There was an error creating the User.', ['errorMessage' => $e->getMessage()]);
    }

    return null;
}

/**
 * The logic to return a USER by the user's id.
 *
 * @param $db
 * @param string $user_id
 * @return array|null
 */
function getUser($db, string $user_id): ?array
{
    try {
        $get_user_statement = '
            SELECT U.ID, U.FIRST_NAME, U.LAST_NAME, U.EMAIL, U.USERNAME, U.PASSWORD, U.CREATED_ON, U.UPDATED_ON, R.ROLE 
            FROM USERS AS U
            JOIN USERS_ROLES AS UR ON UR.USER_ID = U.ID
            JOIN ROLES AS R ON R.ID = UR.ROLE_ID
            WHERE U.ID = :id
        ';
        $statement_result = runQuery($db, $get_user_statement, [':id' => $user_id]);

        return buildUserResponse($statement_result);
    } catch (Exception $e) {
        $db = null;
        sendResponse(500, 'There was an error getting the User.', ['errorMessage' => $e->getMessage()]);
    }

    return null;
}

/**
 * The logic to check if a User(s) exist with the role of EMAIL and the provided email address.
 *
 * @param $db
 * @param string $emailAddress - Required, the user's email address to search by
 * @param string $roleName - Optional, additional filtering by role name (ADMIN, SUPER, USER, EMAIL)
 * @return array|null
 */
function getUserByEmail($db, string $emailAddress, string $roleName = ''): ?array
{
    try {
        if (isset($roleName)) {
            $user_check_statement = '
            SELECT U.ID, U.FIRST_NAME, U.LAST_NAME, U.EMAIL, U.USERNAME, U.PASSWORD, U.CREATED_ON, U.UPDATED_ON, R.ROLE 
            FROM USERS AS U
            JOIN USERS_ROLES AS UR ON UR.USER_ID = U.ID
            JOIN ROLES AS R ON R.ID = UR.ROLE_ID
            WHERE U.EMAIL = :email
            AND R.ROLE = :roleName
        ';
            $statement_result = runQuery($db, $user_check_statement, [':email' => $emailAddress, ':roleName' => $roleName]);

        } else {
            $email_check_statement = '
            SELECT U.ID, U.FIRST_NAME, U.LAST_NAME, U.EMAIL, U.USERNAME, U.PASSWORD, U.CREATED_ON, U.UPDATED_ON, R.ROLE 
            FROM USERS AS U
            JOIN USERS_ROLES AS UR ON UR.USER_ID = U.ID
            JOIN ROLES AS R ON R.ID = UR.ROLE_ID
            WHERE U.EMAIL = :email
        ';
            $statement_result = runQuery($db, $email_check_statement, [':email' => $emailAddress]);
        }
        return buildUserResponse($statement_result);
    } catch (Exception $e) {
        $db = null;
        sendResponse(500, 'There was an error getting the OfficeUsers.', ['errorMessage' => $e->getMessage()]);
    }

    return null;
}

/**
 * The logic that retrieves users filtered by the specified ROLE
 *
 * @param $db
 * @param string $role_name
 * @return void
 */
function getUsersByRole($db, string $role_name, ?string $username = null): void
{
    try {
        $get_users_statement = '
                SELECT *
                FROM USERS AS U
                JOIN USERS_ROLES AS UR ON UR.USER_ID = U.ID
                JOIN ROLES AS R ON R.ID = UR.ROLE_ID
                WHERE R.ROLE = :role';

        $statementResult = runQuery($db, $get_users_statement, [':role' => $role_name]);
        $response = buildUserResponse($statementResult);

        $db = null;
        writeLog('GET /users', 'success', 'Users retrieved.', $username);
        sendResponse(200, null, ['users' => $response]);
    } catch (Exception $e) {
        $db = null;
        writeLog('GET /users', 'critical', $e->getMessage(), $username);
        sendResponse(500, 'There was an error getting the OfficeUsers.', ['errorMessage' => $e->getMessage()]);
    }
}

/**
 * A function that handles the logic for gathering all the possible ROLES
 *
 * @param $db
 * @return array|null
 */
function getAllUserRoles($db, ?string $username = null): ?array
{
    try {
        $get_users_statement = '
                SELECT *
                FROM ROLES
               ';

        $statementResult = runQuery($db, $get_users_statement, []);

        $roleResponse = [];
        foreach ($statementResult as $row) {
            $roleResponse[] = $row['ROLE'];
        }

        $db = null;
        writeLog('GET /users', 'success', 'Users retrieved.', $username);
        sendResponse(200, null, ['roles' => $roleResponse]);
    } catch (Exception $e) {
        $db = null;
        writeLog('GET /users', 'critical', $e->getMessage(), $username);
        sendResponse(500, 'There was an error getting the OfficeUsers.', ['errorMessage' => $e->getMessage()]);
    }

    return null;
}

/**
 * The logic that retrieves USERs from the db and sends the results
 * back to the client.
 *
 * @param $db
 * @return void
 */
#[NoReturn]
function getUsers($db, ?string $username = null): void
{
    try {
        $userQuery = 'SELECT * FROM USERS';
        $roleQuery = '
                SELECT r.ROLE as permission_level
                FROM USERS AS u
                JOIN USERS_ROLES AS ur on u.ID = ur.USER_ID
                JOIN ROLES AS r on ur.ROLE_ID = r.ID
                WHERE u.ID = ?
                ';
        $user_data = runQuery($db, $userQuery, null);

        $response = [
            'count' => count($user_data)
        ];

        foreach ($user_data as $row) {

            $permission_data = runQuery($db, $roleQuery, [$row['ID']]);

            $permission_response = [];
            foreach ($permission_data as $permissionRow) {
                $permission_response[] = $permissionRow['permission_level'];
            }

            $response['users'][] = [
                'id' => (int)$row['ID'],
                'firstName' => $row['FIRST_NAME'],
                'lastName' => $row['LAST_NAME'],
                'username' => $row['USERNAME'],
                'email' => $row['EMAIL'],
                'permissions' => $permission_response,
                'createdOn' => $row['CREATED_ON'],
                'lastModifiedOn' => $row['UPDATED_ON']
            ];
        }

        $db = null;
        writeLog('GET /users', 'success', 'Users retrieved.', $username);
        sendResponse(200, null, $response);
    } catch (Exception $e) {
        $db = null;
        writeLog('GET /users', 'critical', $e->getMessage(), $username);
        sendResponse(500, 'There was an error getting the OfficeUsers.', ['errorMessage' => $e->getMessage()]);
    }
}

/**
 * The logic that retrieves USERs from the db and sends the results
 * back to the client.  This variation on getUsers, allows for a filter
 * to be passed.  This filter removes those records that match it.
 *
 * @param $db
 * @param $filter {string} which role to remove from the collection
 * @return void
 */
#[NoReturn]
function getUsersWithExclusionFilter($db, $filter, ?string $username = null): void
{
    try {
        $userQuery = '
                SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.password, u.created_on, u.updated_on
                FROM USERS as u
                JOIN USERS_ROLES as ur on u.ID = ur.USER_ID
                JOIN ROLES as r on r.ID = ur.ROLE_ID
                WHERE r.ROLE NOT LIKE ?
                ORDER BY u.id
                ';
        $roleQuery = '
                SELECT r.ROLE as permission_level
                FROM USERS AS u
                JOIN USERS_ROLES AS ur on u.ID = ur.USER_ID
                JOIN ROLES AS r on ur.ROLE_ID = r.ID
                WHERE u.ID = ?
                ';
        $user_data = runQuery($db, $userQuery, [$filter]);

        $filtered_response = [
            'count' => count($user_data)
        ];

        foreach ($user_data as $row) {

            $permission_data = runQuery($db, $roleQuery, [$row['id']]);

            $permission_response = [];
            foreach ($permission_data as $permissionRow) {
                $permission_response[] = $permissionRow['permission_level'];
            }

            $filtered_response['users'][] = [
                'id' => (int)$row['id'],
                'firstName' => $row['first_name'],
                'lastName' => $row['last_name'],
                'username' => $row['username'],
                'email' => $row['email'],
                'permissions' => $permission_response,
                'createdOn' => $row['created_on'],
                'lastModifiedOn' => $row['updated_on']
            ];
        }

        $db = null;
        writeLog('GET /users', 'success', 'Users retrieved.', $username);
        sendResponse(200, null, $filtered_response);
    } catch (Exception $e) {
        $db = null;
        writeLog('GET /users', 'critical', $e->getMessage(), $username);
        sendResponse(500, 'There was an error getting the Users.', ['errorMessage' => $e->getMessage()]);
    }
}

/**
 * The logic that updates the USER_ROLES table, and returns the updated
 * USER.
 *
 * @param $db
 * @param int $user_id
 * @param int $role_id
 * @return array|null
 */
function updateUserRole($db, int $user_id, int $role_id): ?array
{
    try {
        $users_roles_statement = '
            INSERT INTO USERS_ROLES (USER_ID, ROLE_ID)
            VALUES (?, ?)
        ';

        runQuery($db, $users_roles_statement, [$user_id, $role_id]);

        return getUser($db, $user_id);
    } catch (Exception $e) {
        $db = null;
        sendResponse(500, 'There was an error updating User Role.');
        exit;
    }
}