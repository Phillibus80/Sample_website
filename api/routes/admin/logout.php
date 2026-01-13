<?php

require_once __DIR__ . '/../../utils.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$authHeader = getAuthHeader();
$token = isset($authHeader) ? str_replace('Bearer ', '', $authHeader) : null;
$secret = Flight::get('secretKey');

try {
    $decodedToken = JWT::decode(
        $token,
        new Key($secret, 'HS256')
    );

    if (
        isset($decodedToken->user->username)
        && isset($decodedToken->user->signedIn)
        && $decodedToken->user->signedIn
    ) {
        // Set the JWT
        $user = [
            'signedIn' => false,
            'username' => '',
            'permLevel' => ''
        ];

        $payload = [
            'user' => $user,
            'exp' => time()
        ];

        // Generate the JWT
        $jwt = JWT::encode($payload, Flight::get('secretKey'), 'HS256');

        $db = null;
        session_write_close();
        sendResponse(200, 'Signed out.', ['token' => $jwt]);
    } else {
        $db = null;
        session_write_close();
        unauthorizedResponse('Please sign in.');
    }
    die();
} catch (\Firebase\JWT\ExpiredException $e) {
    session_write_close();
    sendResponse(401, 'Token has expired.');
    exit;
}