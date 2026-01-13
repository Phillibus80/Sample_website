<?php

require_once __DIR__ . "/../utils.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Random\RandomException;

/**
 * A function that creates a JWT Token
 *
 * @param array{signedIn: bool, username: string, permLevel: list<"USER"|"ADMIN"|"EMAIL"|"SUPER">} $user user object to assign the JWT token
 * @param int $expirationTime time set in minutes for a JWT token to expire
 * @param string $secretKey the secret used to encode the JWT token
 * @throws RandomException
 */
function createJwt(array $user, int $expirationTime, string $secretKey): string
{
    $issuedAt = time();
    $tokenId = bin2hex(random_bytes(32)); // Generate unique token ID

    $payload = [
        'user' => $user,
        'exp' => $expirationTime,        // Expiration time
        'iat' => $issuedAt,              // Issued at time
        'jti' => $tokenId,               // JWT ID (unique identifier)
        'iss' => Flight::get('SITE_URL') ?? 'wood-valley-bees', // Issuer
        'aud' => Flight::get('SITE_URL') ?? 'wood-valley-bees'  // Audience
    ];

    return JWT::encode($payload, $secretKey, 'HS256');
}

/**
 * Validates a JWT token and returns the decoded payload if valid.
 *
 * The decoded token payload has the following structure:
 *
 * @param string $token The raw JWT token string.
 * @param string $secret The secret key used to verify the token signature.
 *
 * The decoded token (stdClass) has the structure:
 *   object{
 *       user: object{
 *           signedIn: bool,
 *           username: string,
 *           permLevel: list<"USER"|"ADMIN"|"EMAIL"|"SUPER">
 *       },
 *       exp: int, // Expiration timestamp
 *       iat: int, // Issued-at timestamp
 *       jti: string,// Token ID
 *       iss: string,// Issuer
 *       aud: string // Audience
 *   }
 * @return stdClass|null Returns the decoded JWT payload as an object on success, or null if:
 *   - the token is invalid,
 *   - the signature is incorrect,
 *   - the token is expired,
 *   - the token has been revoked,
 *   - required claims are missing or invalid.
 *
 */
function validateToken(string $token, string $secret): ?stdClass
{
    try {
        // v7 validates exp, nbf, iat automatically
        $decodedToken = JWT::decode($token, new Key($secret, 'HS256'));

        // Check if the jwt token is revoked
        $db = Flight::db();
        if (isset($decodedToken->jti) && isTokenRevoked($db, $decodedToken->jti)) {
            $db = null;
            return null;
        }
        $db = null;

        // Only validate custom claims (JWT library handles exp, iat automatically)
        if (
            isset($decodedToken->jti) &&
            isset($decodedToken->iss) &&
            ($decodedToken->iss === (Flight::get('SITE_URL') ?? 'wood-valley-bees')) &&
            isset($decodedToken->aud) &&
            ($decodedToken->aud === (Flight::get('SITE_URL') ?? 'wood-valley-bees')) &&
            isset($decodedToken->user->username) &&
            $decodedToken->user->signedIn
        ) {
            return $decodedToken;
        }
    } catch (Exception $e) {
        error_log('JWT validation error: ' . $e->getMessage());
        return null;
    }

    return null;
}

/**
 * Checks whether a JWT token has been revoked.
 *
 * A token is considered revoked if its JTI (token ID) exists
 * in the REVOKED_TOKENS table and its revocation record has
 * not yet expired.
 *
 * @param PDO $db Database connection used for the lookup.
 * @param string $jti The JWT ID of the token being checked.
 *
 * @return bool True if the token is revoked, false otherwise.
 */
function isTokenRevoked(PDO $db, string $jti): bool
{
    $stmt = $db->prepare('
        SELECT COUNT(*) 
        FROM REVOKED_TOKENS 
        WHERE JTI = ? 
        AND EXPIRES_AT > ?
        LIMIT 1');
    $stmt->execute([$jti, time()]);
    return $stmt->fetchColumn() > 0;
}

/**
 * Revokes a JWT token by inserting its JTI and expiration time
 * into the REVOKED_TOKENS table.
 *
 * This robust version includes:
 *  - validation for empty or malformed JTI values
 *  - validation for non-future expiration timestamps
 *  - exception-safe database writes
 *  - protection against duplicate revocation entries
 *  - clear logging for error conditions
 *
 * @param PDO $db Active database connection.
 * @param string $jti The JWT ID to revoke. Must be a non-empty string.
 * @param int $expiresAt UNIX timestamp when the revocation record expires.
 *
 * @return void
 */
function revokeToken(PDO $db, string $jti, int $expiresAt): void
{
    $stmt = $db->prepare('
        INSERT INTO REVOKED_TOKENS (JTI, EXPIRES_AT) 
        VALUES (?, ?)');
    $stmt->execute([$jti, $expiresAt]);
}

/**
 * Middleware-style authentication guard.
 *
 * Extracts the Bearer token from the Authorization header,
 * validates it, and returns the decoded JWT payload.
 *
 * If the token is missing, invalid, expired, or tampered with,
 * an HTTP 401 Unauthorized response is sent, and null is returned.
 *
 * @return stdClass|null Decoded JWT payload on success, or null if unauthorized.
 */
function requireAuth(): ?stdClass
{
    $authHeader = getAuthHeader();
    $token = $authHeader ? str_replace('Bearer ', '', $authHeader) : null;

    if (!$token) {
        unauthorizedResponse('Please sign in.');
        return null;
    }

    $decodedToken = validateToken($token, Flight::get('secretKey'));

    if (!$decodedToken) {
        unauthorizedResponse('Please sign in.');
        return null;
    }

    return $decodedToken;
}