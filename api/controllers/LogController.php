<?php

declare(strict_types=1);

use flight\Engine;

class LogController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/webLogs/getLog.php';
    }
}
