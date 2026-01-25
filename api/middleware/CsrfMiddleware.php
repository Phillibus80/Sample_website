<?php

declare(strict_types=1);

require_once __DIR__ . '/csrf-middleware.php';

use flight\Engine;

class CsrfMiddleware
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    /**
     * Validates the CSRF token before the route handler executes.
     *
     * On failure, requireCsrfToken() sends a 401 response and
     * terminates execution. On success, the route handler proceeds.
     */
    public function before(array $params = []): void
    {
        requireCsrfToken();
    }
}
