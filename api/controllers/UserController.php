<?php

declare(strict_types=1);

use flight\Engine;

class UserController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/users/getUsers.php';
    }

    public function show(string $user_username): void
    {
        $validation = validatePathParams(
            ['user_name' => $user_username],
            ['user_name' => 'string']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Username.');
            exit;
        }

        Flight::set('currentUser', $validation['values']['user_name']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/users/getUser.php';
    }

    public function create(): void
    {
        if (Flight::get('IN_DEVELOPMENT')) {
            $requestHeaders = apache_request_headers();
            $authHeader = $requestHeaders['Authorization'] ?? null;
        } else {
            requireCsrfToken();
            $decodedToken = requireAuth();
            if (!$decodedToken) return;
        }

        $decodedToken = $decodedToken ?? null;
        require __DIR__ . '/../routes/users/createUser.php';
    }

    public function update(string $user_id): void
    {
        $validation = validatePathParams(
            ['user_id' => $user_id],
            ['user_id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with User Id.');
            exit;
        }

        Flight::set('currentUser', $validation['values']['user_id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/users/updateUser.php';
    }

    public function delete(string $user_id): void
    {
        $validation = validatePathParams(
            ['id' => $user_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with User Id.');
            exit;
        }

        Flight::set('currentUser', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/users/removeUser.php';
    }
}
