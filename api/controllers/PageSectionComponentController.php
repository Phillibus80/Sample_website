<?php

declare(strict_types=1);

use flight\Engine;

class PageSectionComponentController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/components/createPageSectionComponent.php';
    }

    public function update(string $psc_id, string $component_id): void
    {
        $psValidation = validatePathParams(
            ['ps_id' => $psc_id],
            ['ps_id' => 'int']
        );
        if (count($psValidation['errors']) > 0) {
            sendResponse(400, 'Error with Page Section Id.');
            exit;
        }

        $compValidation = validatePathParams(
            ['component_id' => $component_id],
            ['component_id' => 'int']
        );
        if (count($compValidation['errors']) > 0) {
            sendResponse(400, 'Error with Page Section Component Id.');
            exit;
        }

        Flight::set('psId', $psValidation['values']['ps_id']);
        Flight::set('oldComponentId', $compValidation['values']['component_id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/components/updatePageSectionComponent.php';
    }

    public function delete(string $psc_id): void
    {
        $validation = validatePathParams(
            ['id' => $psc_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Page Section Component Id.');
            exit;
        }

        Flight::set('pscId', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/components/removePageSectionComponent.php';
    }
}
