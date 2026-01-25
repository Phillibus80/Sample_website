<?php

declare(strict_types=1);

use flight\Engine;

class EmailController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function send(): void
    {
        require __DIR__ . '/../routes/public/send-email.php';
    }
}
