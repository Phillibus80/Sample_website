<?php

declare(strict_types=1);

require_once __DIR__ . '/jwt-middleware.php';

use flight\Engine;

class AuthMiddleware
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    /**
     * Validates the JWT bearer token before the route handler executes.
     *
     * On failure, requireAuth() sends a 401 response and terminates
     * execution. On success, the decoded token is stored in Flight
     * so controllers can access it via Flight::get('decodedToken').
     */
    public function before(array $params = []): void
    {
        $decodedToken = requireAuth();
        Flight::set('decodedToken', $decodedToken);
    }
}
