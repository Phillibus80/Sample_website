<?php

declare(strict_types=1);

use flight\Engine;

class AuthController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function login(): void
    {
        require __DIR__ . '/../routes/admin/login.php';
    }

    public function logout(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/admin/logout.php';
    }
}
