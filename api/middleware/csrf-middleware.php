<?php

require_once __DIR__ . "/../utils.php";

use Random\RandomException;

/**
 * Generates a CSRF (Cross-Site Request Forgery) token and stores it in the session.
 *
 * This function ensures a PHP session is started, generates a secure random token,
 * stores it in the `$_SESSION` superglobal along with the current timestamp, and
 * returns the token. The token can then be used to protect forms and API endpoints
 * against CSRF attacks.
 *
 * @return string The generated CSRF token.
 *
 * @throws RandomException If there is an error generating random bytes.
 *
 * @example
 * $csrfToken = generateCsrfToken();
 * echo '<input type="hidden" name="csrf_token" value="'. $csrfToken. '">';
 */
function generateCsrfToken(): string
{
    // Start a session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Generate a random token
    $token = bin2hex(random_bytes(32));

    // Store in session
    $_SESSION['csrf_token'] = $token;
    $_SESSION['csrf_token_time'] = time();

    return $token;
}

/**
 * Validate CSRF token from request
 *
 * @param string|null $token The token to validate
 * @param int $maxAge Maximum age of token in seconds (default: 1 hour)
 * @return bool True if valid, false otherwise
 */
function validateCsrfToken(?string $token, int $maxAge = 3600): bool
{
    // Start a session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Check if token exists in request
    if (empty($token)) {
        return false;
    }

    // Check if a token exists in session
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }

    // Check if token matches
    if (!hash_equals($_SESSION['csrf_token'], $token)) {
        return false;
    }

    // Check token age
    if (isset($_SESSION['csrf_token_time'])) {
        $tokenAge = time() - $_SESSION['csrf_token_time'];
        if ($tokenAge > $maxAge) {
            return false;
        }
    }

    return true;
}

/**
 * Get CSRF token from request headers or body
 *
 * @return string|null
 */
function getCsrfTokenFromRequest(): ?string
{
    // Check X-CSRF-Token header first
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);
    if (isset($headers['x-csrf-token'])) {
        return $headers['x-csrf-token'];
    }

    // Fallback to request data
    if (isset(Flight::request()->data->csrf_token)) {
        return Flight::request()->data->csrf_token;
    }

    return null;
}

/**
 * Middleware to require CSRF token validation
 * Call this at the start of protected routes
 *
 * @return void
 * @throws Exception
 */
function requireCsrfToken(): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        return; // preflight
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Debug: Log session info
    error_log('Session ID: ' . session_id());
    error_log('Session data: ' . print_r($_SESSION, true));
    error_log('Cookies: ' . print_r($_COOKIE, true));

    $token = getCsrfTokenFromRequest();

    error_log('Token from request: ' . ($token ?? 'NULL'));
    error_log('Token in session: ' . ($_SESSION['csrf_token'] ?? 'NULL'));

    if (!validateCsrfToken($token)) {
        sendResponse(401, 'Invalid or missing CSRF token', [
            'error' => 'CSRF_TOKEN_INVALID'
        ]);
    }
}

/**
 * Refresh CSRF token (generate new one)
 * Useful after sensitive operations
 *
 * @return string New token
 * @throws RandomException
 */
function refreshCsrfToken(): string
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Clear old token
    unset($_SESSION['csrf_token']);
    unset($_SESSION['csrf_token_time']);

    // Generate a new one
    return generateCsrfToken();
}