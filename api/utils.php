<?php

/**
 * Retrieves the Authorization header from the incoming HTTP request.
 *
 * In development mode, this uses `apache_request_headers()` to read the raw
 * `Authorization` header directly, as Apache may not populate `$_SERVER`
 * variables the same way in local environments.
 *
 * In production mode, this returns the value of `$_SERVER['REDIRECT_HTTP_AUTHORIZATION']`,
 * which is commonly used by Apache and PHP-FPM when passing the Authorization
 * header through rewrite rules (e.g., via `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP: Authorization}]`).
 *
 * @return string|null The raw Authorization header (e.g., "Bearer <token>"),
 *                     or null if no Authorization header was found.
 */
function getAuthHeader(): ?string
{
    if (Flight::get('IN_DEVELOPMENT')) {
        $requestHeaders = apache_request_headers();
        return $requestHeaders['Authorization'] ?? null;
    } else {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    }
}

/**
 * Sets Cross-Origin Resource Sharing (CORS) headers for the API response.
 *
 * In development mode, the function only allows requests from a predefined list
 * of local frontend origins. In production, it restricts access to the
 * configured `SITE_URL`. It also configures allowed HTTP methods, credentials,
 * and headers for cross-origin requests.
 *
 * This function should be called before any output is sent to the client.
 *
 * Behavior:
 * - Reads the request origin from `$_SERVER['HTTP_ORIGIN']`.
 * - If `IN_DEVELOPMENT` is enabled, checks the origin against a whitelist
 *   (`http://127.0.0.1:5173` or `http://localhost:5173`).
 * - If the origin is allowed, sets `Access-Control-Allow-Origin` to that origin.
 * - In production, always sets `Access-Control-Allow-Origin` to the configured
 *   `SITE_URL`.
 * - Sets permissive CORS headers for methods, credentials, and common request headers.
 *
 * @return void
 */
function setCorsHeaders(): void
{
    // Configure a session for CORS before any session_start() calls
    if (Flight::get('IN_DEVELOPMENT')) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    } else {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => parse_url(Flight::get('SITE_URL'), PHP_URL_HOST),
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    }

    $http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (Flight::get('IN_DEVELOPMENT')) {
        $allowed_origins = [
            'http://127.0.0.1:5173',
            'http://localhost:5173'
        ];

        if (in_array($http_origin, $allowed_origins, true)) {
            header("Access-Control-Allow-Origin: $http_origin");
        }
    } else {
        header('Access-Control-Allow-Origin: ' . Flight::get('SITE_URL'));
    }
    header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: X-Requested-With, Origin, Content-Type, X-CSRF-Token, Accept, Authorization');
}

/**
 * Sends a standardized 401 Unauthorized JSON response.
 *
 * This helper wraps `sendResponse()` to provide a consistent structure for
 * authentication/authorization failures. It sets the HTTP status code to 401
 * and includes a `token` field set to `null` so clients can reliably detect
 * when authentication has failed.
 *
 * Example use-cases:
 * - Missing or invalid JWT token
 * - Expired session
 * - Unauthorized access to protected routes
 *
 * @param string $message A human-readable description of why the request is unauthorized.
 *
 * @return void
 */
function unauthorizedResponse(string $message): void
{
    try {
        session_write_close();
        sendResponse(401, $message, ['token' => null]);
    } catch (Exception $e) {
        sendResponse(500, 'There was an error sending the response.');
        exit;
    }
}

/**
 * Sends a JSON HTTP response with the specified status code and message.
 *
 * This helper wraps FlightPHP's response handling to standardize API responses.
 * It sets the `Content-Type` header to `application/json`, writes the JSON-encoded
 * response body, sends the response, and terminates execution (`die()`).
 *
 * In case of an internal exception during response generation, it sends a 500
 * Internal Server Error response with the exception message included.
 *
 * @param int $status HTTP status code to send (e.g., 200, 400, 401, 500).
 * @param string|null $message Optional human-readable message to include in the response.
 * @param array<string, mixed> $additionalData Optional associative array of additional
 *                                              key-value data to include in the JSON response.
 *
 * @return void This function sends the response and terminates execution.
 *
 *
 * @example
 * sendResponse(200, 'Success', ['data' => $result]);
 * sendResponse(401, 'Unauthorized', ['token' => null]);
 */
function sendResponse(int $status, ?string $message, array $additionalData = []): void
{
    try {
        $body = isset($message)
            ? array_merge(['message' => $message], $additionalData)
            : $additionalData;
        Flight::response()->header('Content-Type', 'application/json');
        Flight::response()->status($status);
        Flight::response()->write(json_encode($body));
        Flight::response()->send();
        die();
    } catch (Exception $e) {
        try {
            $body = array_merge(['errorMessage' => $e->getMessage()], $additionalData);
            Flight::response()->header('Content-Type', 'application/json');
            Flight::response()->status(500);
            Flight::response()->write(json_encode($body));
            Flight::response()->send();
            session_write_close();
            die();
        } catch (Exception $e) {
            sendResponse(500, 'There was an error sending the error.');
            exit;
        }
    }
}

/**
 * Handles HTTP OPTIONS (preflight) requests for CORS.
 *
 * This function checks if the incoming request method is `OPTIONS`, which
 * browsers send as a preflight request for cross-origin requests.
 * If it is an OPTIONS request, the function responds with HTTP 200 OK
 * and immediately terminates the script.
 *
 * Use this function before sending any other output or headers to ensure
 * proper handling of CORS preflight requests.
 *
 * @return void
 */
function handlePreFlight(): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Executes a SQL query using a PDO connection and returns the result.
 *
 * This utility function prepares and executes the provided SQL query with
 * optional parameters. If the query is a `SELECT` statement, it returns
 * all rows as an array of associative arrays. For other statements
 * (`INSERT`, `UPDATE`, `DELETE`, etc.), it returns `null`.
 *
 * @param PDO $db A PDO database connection instance.
 * @param string $query The SQL query to execute.
 * @param array<int|string, mixed>|null $params Optional parameters for the SQL query.
 *                                         Can be either:
 *                                         - an indexed array of values (`?` placeholders)
 *                                         - an associative array of named placeholders (`:name`)
 *
 * @return array<int, array<string, mixed>>|null Returns an array of associative arrays for SELECT queries,
 *                                              or null for non-SELECT queries.
 *
 * @throws PDOException If there is a database error.
 *
 * @example
 * // SELECT example
 * $results = runQuery($db, 'SELECT * FROM users WHERE id = :id', ['id' => 1]);
 *
 * // INSERT example
 * runQuery($db, 'INSERT INTO users (username, email) VALUES (?,?)', ['test', 'test@example.com']);
 */
function runQuery(PDO $db, string $query, ?array $params): ?array
{
    try {
        $statement = $db->prepare($query);
        $statement->execute($params);// Only fetch results if it's a SELECT
        if (preg_match('/^\s*SELECT/i', $query)) {
            return $statement->fetchAll(PDO::FETCH_ASSOC);
        }
        $statement = null;
        return null;
    } catch (Exception $e) {
        sendResponse(500, 'There was an error running the query.');
        exit;
    }
}

function getUserData($db, $username)
{
    try {
        $stmt = $db->prepare('
                    SELECT u.USERNAME, u.PASSWORD, r.ROLE
                    FROM USERS u
                    JOIN USERS_ROLES ur ON u.ID = ur.USER_ID
                    JOIN ROLES r ON ur.ROLE_ID = r.ID
                    WHERE u.USERNAME = ?
                    ');
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        sendResponse(500, 'There was an error getting the user content.');
        exit;
    }
}

/**
 * Converts a string to a kebab-case (lowercase words separated by hyphens).
 *
 * The function performs the following transformations:
 * 1. Converts all letters to lowercase.
 * 2. Replaces spaces and underscores with a single hyphen.
 * 3. Removes all remaining non-alphanumeric characters except hyphens.
 * 4. Trims leading and trailing hyphens.
 *
 * Examples:
 *   "Hello World" => "hello-world"
 *   "some_text_here" => "some-text-here"
 *   "Cleanup! String" => "cleanup-string"
 *
 * @param string $text The input string to convert.
 *
 * @return string The kebab-cased string.
 */
function toKebabCase(string $text): string
{
    // Convert to lowercase
    $text = strtolower($text);

    // Replace spaces, underscores, and non-alphanumeric groups with a single hyphen
    $text = preg_replace('/[\s_]+/', '-', $text);

    // Remove any remaining non-alphanumeric characters except hyphens
    $text = preg_replace('/[^a-z0-9\-]/', '', $text);

    // Trim leading/trailing hyphens
    return trim($text, '-');
}

/**
 * Converts a kebab-case string to Title Case.
 *
 * The function performs the following transformations:
 * 1. Replaces hyphens (`-`) with spaces.
 * 2. Capitalizes the first letter of each word.
 *
 * Examples:
 *   "hello-world" => "Hello World"
 *   "some-long-string" => "Some Long String"
 *
 * @param string $text The kebab-case string to convert.
 *
 * @return string The string converted to Title Case.
 */
function kebabToTitleCase(string $text): string
{
    // Replace hyphens with spaces
    $text = str_replace('-', ' ', $text);

    // Convert to Title Case
    return ucwords($text);
}

/**
 * Inserts a new record into a database table, with optional table whitelisting.
 *
 * This utility function performs the following steps:
 * 1. Validates that the target table is in the allowed tables list.
 * 2. Prepares an INSERT SQL statement with placeholders.
 * 3. Executes the statement with the provided field values.
 * 4. Returns the last inserted ID.
 *
 * @param PDO $db A PDO database connection.
 * @param string $table The name of the table to insert into. Must be in the `$allowedTables` list.
 * @param array<string, mixed> $insertFields Associative array of column => value pairs to insert.
 * @param array<int, string> $allowedTables Optional list of allowed table names. Default: ['LINKS', 'TEXT_CONTENT', 'IMAGES', 'EVENTS', 'LOCATIONS'].
 *
 * @return string|false The last inserted ID returned by the database.
 *
 * @throws Exception If the table name is not in the allowed tables list, or if the database insert fails.
 *
 * @example
 * $id = createAndInsert($db, 'LINKS', [
 *     'title' => 'My Link',
 *     'url' => 'https://example.com'
 * ]);
 */
function createAndInsert(PDO $db, string $table, array $insertFields, array $allowedTables = ['LINKS', 'TEXT_CONTENT', 'IMAGES', 'EVENTS', 'LOCATIONS']): string|false
{
    try {
        if (!in_array($table, $allowedTables)) {
            throw new Exception("Invalid table name: $table");
        }
        $columns = implode(',', array_keys($insertFields));
        $placeholders = implode(',', array_fill(0, count($insertFields), '?'));
        $stmt = $db->prepare("INSERT INTO $table ($columns) VALUES ($placeholders)");
        $stmt->execute(array_values($insertFields));
        return $db->lastInsertId();
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

/**
 * Retrieves the ID of a record matching the search criteria or creates a new record if none exists.
 *
 * This function performs the following steps:
 * 1. Validates that the target table is in the allowed tables list.
 * 2. Checks if a record exists matching the `$searchFields` criteria by calling `getRecordId()`.
 * 3. If a matching record exists, returns its ID.
 * 4. If no record is found, inserts a new record with `$insertFields` using `createAndInsert()`
 *    and returns the newly created ID.
 *
 * @param PDO $db A PDO database connection.
 * @param string $table The name of the table to search or insert into. Must be in `$allowedTables`.
 * @param array<string, mixed> $searchFields Associative array of column => value pairs to search for.
 * @param array<string, mixed> $insertFields Associative array of column => value pairs to insert if no record is found.
 * @param array<int, string> $allowedTables Optional list of allowed table names. Default: ['LINKS', 'TEXT_CONTENT', 'IMAGES', 'EVENTS', 'LOCATIONS'].
 *
 * @return string The ID of the existing or newly created record.
 *
 * @throws Exception If the table name is not allowed or if an underlying database operation fails.
 *
 * @example
 * $id = getOrCreate(
 *     $db,
 *     'LINKS',
 *     ['url' => 'https://example.com'],
 *     ['title' => 'Example', 'url' => 'https://example.com']
 * );
 */
function getOrCreate(
    PDO    $db,
    string $table,
    array  $searchFields,
    array  $insertFields,
    array  $allowedTables = ['LINKS', 'TEXT_CONTENT', 'IMAGES', 'EVENTS', 'LOCATIONS']
): mixed
{
    try {
        if (!in_array($table, $allowedTables)) {
            throw new Exception("Invalid table name: $table");
        }
        $recordId = getRecordId($db, $table, $searchFields);
        return $recordId ?: createAndInsert($db, $table, $insertFields);
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

/**
 * Retrieves the ID of a record in a database table matching the given search criteria.
 *
 * This function builds a WHERE clause based on the provided `$searchFields` and
 * returns the ID of the first matching record. If no record is found, it returns `null`.
 *
 * @param PDO $db A PDO database connection.
 * @param string $table The name of the table to query.
 * @param array<string, mixed> $searchFields Associative array of column => value pairs
 *                                           used to filter the search.
 *
 * @return string|null The ID of the matching record, or `null` if no record exists.
 *
 * @throws PDOException If the database query fails.
 *
 * @example
 * $id = getRecordId(
 *     $db,
 *     'LINKS',
 *     ['url' => 'https://example.com']
 * );
 */
function getRecordId(PDO $db, string $table, array $searchFields): mixed
{
    try {
        $where = implode(' AND ', array_map(fn($col) => "$col = ?", array_keys($searchFields)));
        $stmt = $db->prepare("SELECT ID FROM $table WHERE $where");
        $stmt->execute(array_values($searchFields));
        $id = $stmt->fetchColumn();
        return $id ?? null;
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error getting the record id.');
        exit;
    }
}

/**
 * Validates that dependent fields are present when a parent field is set.
 *
 * This function is useful for conditional validation. If the `$parentField` has
 * a truthy value, it ensures that all fields in `$requiredFields` are not empty.
 * If any required field is empty, it immediately sends a 400 Bad Request response
 * with the provided `$errorMessage` and terminates execution.
 *
 * @param mixed $parentField The parent field whose presence triggers validation.
 * @param array $requiredFields An array of fields that are required if `$parentField` is truthy.
 * @param string $errorMessage The error message to send in the response if validation fails.
 *
 * @return void Sends a JSON 400 response and exits if validation fails.
 *
 * @throws Exception
 * @example
 * validateDependentFields($_POST['email'], [$_POST['name'], $_POST['username']], 'Name and username are required if email is provided.');
 *
 */
function validateDependentFields(mixed $parentField, array $requiredFields, string $errorMessage): void
{
    if ($parentField) {
        foreach ($requiredFields as $field) {
            if (empty($field)) sendResponse(400, $errorMessage);
        }
    }
}

/**
 * Geocodes a physical address using the Google Maps Geocoding API.
 *
 * This function sends a request to the Google Maps API to retrieve latitude and
 * longitude coordinates for a given address. If the API returns a valid result,
 * it returns an associative array containing 'lat' and 'lng'. If the address cannot
 * be geocoded or the API returns an error, it returns null.
 *
 * @param string $address The physical address to geocode.
 *
 * @return array<string, float>|null Returns an associative array with keys:
 *                                    - 'lat' => latitude
 *                                    - 'lng' => longitude
 *                                   Returns null if geocoding fails.
 *
 * @example
 * $coords = geocodeAddress('1600 Amphitheatre Parkway, Mountain View, CA');
 * if ($coords) {
 *     echo "Latitude: {$coords['lat']}, Longitude: {$coords['lng']}";
 * } else {
 *     echo "Unable to geocode address.";
 * }
 */
function geocodeAddress(string $address): ?array
{
    $apiKey = Flight::get('GOOGLE_MAPS_API');
    $encodedAddress = urlencode($address);
    $url = "https://maps.googleapis.com/maps/api/geocode/json?address=$encodedAddress&key=$apiKey";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if ($data['status'] === 'OK') {
        $location = $data['results'][0]['geometry']['location'];
        return [
            'lat' => $location['lat'],
            'lng' => $location['lng']
        ];
    } else {
        return null;
    }
}

/**
 * Performs reverse geocoding to convert latitude and longitude into a structured address.
 *
 * This function uses the Google Maps Geocoding API to retrieve the address corresponding
 * to the given latitude and longitude. If the API returns a valid result, it returns an
 * associative array containing the street address, city, state, and ZIP code. If no valid
 * address is found or the API returns an error, it returns null.
 *
 * Note: The function assumes the returned `formatted_address` follows the format:
 *       "Street Address, City, State ZIP". Parsing may fail if the format differs.
 *
 * @param float|string $lat Latitude of the location.
 * @param float|string $lng Longitude of the location.
 *
 * @return array<string, string>|null An associative array with keys:
 *                                     - 'STREET_ADDRESS' => string
 *                                     - 'CITY' => string
 *                                     - 'STATE' => string
 *                                     - 'ZIP' => string
 *                                   Returns null if reverse geocoding fails.
 *
 * @example
 * $address = reverseGeocode(37.4224764, -122.0842499);
 * if ($address) {
 *     echo "City: {$address['CITY']}, State: {$address['STATE']}";
 * } else {
 *     echo "Unable to reverse geocode coordinates.";
 * }
 */
function reverseGeocode(float|string $lat, float|string $lng): ?array
{
    $apiKey = Flight::get('GOOGLE_MAPS_API');
    $url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=$lat,$lng&key=$apiKey";

    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if ($data['status'] === 'OK') {
        $fullAddress = $data['results'][0]['formatted_address'];

        // Split up the resultant string to pull out the
        // street address, city, state, and zip
        $splitString = explode(',', $fullAddress);
        $streetAddress = $splitString[0];
        $city = $splitString[1];

        $stateAndZip = $splitString[2];
        $stateAndZipArr = explode(' ', ltrim($stateAndZip));
        $state = $stateAndZipArr[0];
        $zip = $stateAndZipArr[1];

        $response = [];
        $response['STREET_ADDRESS'] = $streetAddress;
        $response['CITY'] = $city;
        $response['STATE'] = $state;
        $response['ZIP'] = $zip;

        return $response;
    }
    return null;
}

/**
 * Retrieves the default content IDs for text, links, images, and events.
 *
 * This function queries the database to find the IDs of default content entries
 * in the `TEXT_CONTENT`, `LINKS`, `IMAGES`, and `EVENTS` tables. Each table is
 * searched using a predefined "default" value.
 *
 * If any query fails, the function returns the exception message as a string.
 * Otherwise, it returns an associative array with the IDs of the default content.
 *
 * @param PDO $db A PDO database connection instance.
 *
 * @return array<string, int>|string Returns an associative array containing:
 *                                   - 'defaultTextId' => int
 *                                   - 'defaultLinkId' => int
 *                                   - 'defaultImageId' => int
 *                                   - 'defaultEventId' => int
 *                                   If a database error occurs, returns the exception message as a string.
 *
 * @example
 * $defaults = retrieveDefaultContentIds($db);
 * if (is_array($defaults)) {
 *     echo "Default Text ID:" . $defaults['defaultTextId'];
 * } else {
 *     echo "Error retrieving defaults:" . $defaults;
 * }
 */
function retrieveDefaultContentIds(PDO $db): array|string
{
    try {
        $defaultTextContentQuery = "
            SELECT DISTINCT ID 
            FROM TEXT_CONTENT 
            WHERE TXT = ?
            ";
        $defaultTextId = runQuery($db, $defaultTextContentQuery, ['Default text']);

        $defaultLinkQuery = "SELECT DISTINCT ID FROM LINKS WHERE LINK_TEXT = ?";
        $defaultLinkId = runQuery($db, $defaultLinkQuery, ['Default link']);

        $defaultImageQuery = "SELECT DISTINCT ID FROM IMAGES WHERE IMAGE_TEXT = ?";
        $defaultImageId = runQuery($db, $defaultImageQuery, ['Default Image']);

        $defaultEventQuery = "SELECT DISTINCT ID FROM EVENTS WHERE TITLE = ?";
        $defaultEventId = runQuery($db, $defaultEventQuery, ['Default Event']);
    } catch (exception $e) {
        return $e->getMessage();
    }

    return [
        'defaultTextId' => $defaultTextId[0]['ID'],
        'defaultLinkId' => $defaultLinkId[0]['ID'],
        'defaultImageId' => $defaultImageId[0]['ID'],
        'defaultEventId' => $defaultEventId[0]['ID']
    ];
}

/**
 * Validates incoming request data against a defined set of field names and expected types.
 *
 * This function checks that required fields exist and match their expected type/format.
 * Supported types include:
 *  - string
 *  - email
 *  - int
 *  - float
 *  - alphaNumeric
 *  - url
 *  - pageLink (must start with "/" and contain only alphanumeric characters)
 *  - bool
 * - 'telephone': 1234567890
 *                123-456-7890
 *                123 456 7890
 *                (123)456-7890
 *                (123) 456-7890
 *                (123)-456-7890
 *
 * @param object|array $requestData
 *     The incoming request data (e.g., Flight::request()->data). Fields are accessed
 *     using object-style access ($requestData->field).
 *
 * @param array $fieldNameTypeArray
 *     An associative array defining required fields and their expected types.
 *     Note: The key in the $fieldNameTypeArray must match the key in $requestData
 *     Example:
 *     [
 *         'first_name' => 'string',
 *         'email' => 'email',
 *         'age' => 'int',
 *     ]
 *
 * @return array
 *     An associative array of validation errors.
 *     The key is the field name, and the value is the error message.
 *     Returns an empty array if all validations pass.
 *
 * @example
 *     $errors = validateRequestData(
 *         Flight::request()->data,
 *         [
 *             'first_name' => 'string',
 *             'email' => 'email',
 *             'profile_url' => 'pageLink'
 *         ]);
 */
function validateRequestData(object|array $requestData, array $fieldNameTypeArray): array
{
    $errors = [];

    foreach ($fieldNameTypeArray as $field => $type) {
        $value = $requestData->$field ?? null;

        // Null checks
        if ($value === null || $value === '') {
            $errors[$field] = "$field is required.";
            continue;
        }

        // Type checks
        switch ($type) {
            case 'string':
                $sanitized = trim($value);

                if (empty($sanitized)) {
                    $errors[$field] = "Field cannot be empty.";
                    break;
                }

                if (!preg_match('/^[a-zA-Z\-_,.!@#$%^&*\\s]+$/', $sanitized)) {
                    $errors[$field] = "Field contains invalid characters.";
                    break;
                }
                break;

            case 'email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = "Invalid email format.";
                }
                break;

            case 'int':
                if (!filter_var($value, FILTER_VALIDATE_INT)) {
                    $errors[$field] = "$field must be an integer.";
                }
                break;

            case 'float':
                if (!filter_var($value, FILTER_VALIDATE_FLOAT)) {
                    $errors[$field] = "$field must be a float.";
                }
                break;

            case 'alphaNumeric':
                if (!preg_match('/^[a-zA-Z0-9\-_]+$/', $value)) {
                    $errors[$field] = "$field must be alphanumeric.";
                }
                break;

            case 'url':
                if (!filter_var($value, FILTER_VALIDATE_URL)) {
                    $errors[$field] = "$field must be a URL.";
                }
                break;

            case 'pageLink':
                if (!preg_match('/^\/[a-zA-Z0-9]+$/', $value)) {
                    $errors[] = "Value must be page link which starts with a /.";
                }
                break;

            case 'bool':
                $sanitized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

                if ($sanitized === null) {
                    $errors[$field] = "$field must be a boolean.";
                }
                break;

            case 'password':
                // Allow letters, numbers, and ! @ # $ % & * . _
                if (!preg_match('/^[a-zA-Z0-9_.!@#$%&*]+$/', $value)) {
                    $errors[] = "Value must be alphanumeric or one of ! @ # $ % & *.";
                    break;
                }

                if (strlen($value) < 8) {
                    $errors[$field] = "Password must be at least 8 characters.";
                }
                break;

            case 'telephone':
                if (!preg_match('/^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/', $value)) {
                    $errors[$field] = "$field doesn't match phone number format.";
                }
                break;

            case 'imageLink':
                if (!preg_match('/^\/[a-zA-Z0-9.\/_-]+$/', $value)) {
                    $errors[] = "Value must be image link which starts with a /.";
                }
                break;

            default:
                $errors[$field] = "$field is not a valid type.";
                break;
        }
    }

    return $errors;
}

/**
 * Validate and cast path parameters.
 *
 * @param array $params Associative array of path parameters, e.g. ['id' => '123']
 * @param array $paramTypes Associative array of expected types, e.g. ['id' => 'int']
 * @return array ['errors' => array, 'values' => array]
 */
function validatePathParams(array $params, array $paramTypes): array
{
    $errors = [];
    $values = [];

    foreach ($paramTypes as $param => $type) {
        $value = $params[$param] ?? null;

        if ($value === null || $value === '') {
            $errors[$param] = "$param is required.";
            continue;
        }

        switch ($type) {
            case 'int':
                if (filter_var($value, FILTER_VALIDATE_INT) === false) {
                    $errors[$param] = "$param must be a valid integer.";
                } else {
                    $values[$param] = (int)$value;
                }
                break;

            case 'string':
                $sanitized = trim($value);

                if ($sanitized === '') {
                    $errors[$param] = "$param cannot be empty.";
                    break;
                }

                if (!preg_match('/^[a-zA-Z-]+$/', $sanitized)) {
                    $errors[$param] = "$param contains invalid characters.";
                    break;
                }

                $values[$param] = $sanitized;
                break;

            case 'alphaNumeric':
                if (!preg_match('/^[a-zA-Z0-9\-_]+$/', $value)) {
                    $errors[$param] = "$param must be alphanumeric.";
                } else {
                    $values[$param] = $value;
                }
                break;

            case 'bool':
                $sanitized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

                if ($sanitized === null) {
                    $errors[$param] = "$param must be a boolean.";
                } else {
                    $values[$param] = $sanitized;
                }
                break;

            default:
                $values[$param] = $value;
        }
    }

    return ['errors' => $errors, 'values' => $values];
}

/**
 * Validate patch request data against a set of optional validation rules.
 *
 * This function iterates over the provided validation rules and checks the corresponding
 * fields in the request data. Only fields that are present in the request data are validated.
 * It supports the following validation types:
 *   - 'alpha': only alphabetic characters (A-Z, a-z)
 *   - 'alphaNumeric': letters, numbers, underscores, and hyphens
 *   - 'string': any string value, just can't be empty
 *   - 'int':
 *   - 'float':
 *   - 'email': valid email format
 *   - 'password': minimum length of 8 characters
 *   - 'pageLink': (must start with "/" and contain only alphanumeric characters)
 *   - 'telephone': 1234567890
 *                  123-456-7890
 *                  123 456 7890
 *                  (123)456-7890
 *                  (123) 456-7890
 *                  (123)-456-7890
 *   - 'arrayOfRoles': non-empty array containing only allowed values: 'EMAIL', 'USER', 'ADMIN', 'SUPER'
 *
 * @param object|array $requestData The request data to validate (can be an object or associative array)
 * @param array $validationRules Associative array of field names => validation type
 *
 * @return array Returns an associative array of errors where the keys are field names and
 *               the values are the corresponding error messages. If no errors are found, returns an empty array.
 *
 * @example
 * $requestData = (object)[
 *     'permissions' => ['USER', 'ADMIN', 'INVALID']
 * ];
 * $rules = [
 *     'permissions' => 'arrayOfStrings'
 * ];
 * $errors = validatePatchRequestData($requestData, $rules);
 * // $errors will be: ['permissions' => 'permissions contain invalid values.']
 */
function validatePatchRequestData(object|array $requestData, array $validationRules): array
{
    $errors = [];

    $allowedPermissions = ['EMAIL', 'USER', 'ADMIN', 'SUPER'];

    foreach ($validationRules as $field => $type) {
        if (!isset($requestData->$field)) continue;

        $value = $requestData->$field;

        switch ($type) {
            case 'alpha':
                if (!preg_match('/^[a-zA-Z\\s]+$/', $value)) {
                    $errors[$field] = "$field must contain only letters.";
                }
                break;

            case 'alphaNumeric':
                if (!preg_match('/^[a-zA-Z0-9_\-\\s]+$/', $value)) {
                    $errors[$field] = "$field must contain only letters, numbers, hyphens, or underscores.";
                }
                break;

            case 'string':
                $sanitized = trim($value);

                if ($sanitized === '') {
                    $errors[$field] = "$field cannot be empty.";
                    break;
                }
                break;

            case 'email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = "Invalid email format.";
                }
                break;

            case 'password':
                // Allow letters, numbers, and ! @ # $ % & *
                if (!preg_match('/^[a-zA-Z0-9_.!@#$%&*]+$/', $value)) {
                    $errors[] = "Value must be alphanumeric or one of ! @ # $ % & *.";
                    break;
                }

                if (strlen($value) < 8) {
                    $errors[$field] = "Password must be at least 8 characters.";
                }
                break;

            case 'arrayOfRoles':
                if (!is_array($value) || count($value) === 0) {
                    $errors[$field] = "$field must be a non-empty array.";
                    break;
                }

                $invalidItemFound = false;

                foreach ($value as $item) {
                    if (!in_array(strtoupper($item), $allowedPermissions, true)) {
                        $invalidItemFound = true;
                        break; // exit inner loop only
                    }
                }

                if ($invalidItemFound) {
                    $errors[$field] = "$field contains invalid values.";
                }
                break;

            case 'telephone':
                if (!preg_match('/^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/', $value)) {
                    $errors[$field] = "$field doesn't match phone number format.";
                }
                break;

            case 'int':
                if (!filter_var($value, FILTER_VALIDATE_INT)) {
                    $errors[$field] = "$field must be an integer.";
                }
                break;

            case 'float':
                if (!filter_var($value, FILTER_VALIDATE_FLOAT)) {
                    $errors[$field] = "$field must be a float.";
                }
                break;

            case 'pageLink':
                if (!preg_match('/^\/[a-zA-Z0-9]+$/', $value)) {
                    $errors[] = "Value must be page link which starts with a /.";
                }
                break;

            case 'imageLink':
                if (!preg_match('/^\/[a-zA-Z0-9.\/_-]+$/', $value)) {
                    $errors[] = "Value must be image link which starts with a /.";
                }
                break;

            case 'bool':
                $sanitized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

                if ($sanitized === null) {
                    $errors[$field] = "$field must be a boolean.";
                }
                break;

            default:
                $errors[$field] = "$field is not a valid type.";
                break;
        }
    }

    return $errors;
}