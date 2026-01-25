<?php

declare(strict_types=1);

use flight\Engine;

class ComponentController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/components/getComponents.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/components/createComponent.php';
    }

    public function update(string $component_id): void
    {
        $validation = validatePathParams(
            ['id' => $component_id],
            ['id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Component Id.');
            exit;
        }

        Flight::set('currentComponent', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/components/updateComponent.php';
    }

    public function delete(string $component_id): void
    {
        $validation = validatePathParams(
            ['id' => $component_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Component Id.');
            exit;
        }

        Flight::set('currentComponent', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/components/removeComponent.php';
    }
}
