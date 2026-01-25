<?php

declare(strict_types=1);

use flight\Engine;

class SectionController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/sections/getSections.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/sections/createSection.php';
    }

    public function update(string $section_id): void
    {
        $validation = validatePathParams(
            ['section_id' => $section_id],
            ['section_id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Section Id.');
            exit;
        }

        Flight::set('currentSection', $validation['values']['section_id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/sections/updateSection.php';
    }

    public function delete(string $section_id): void
    {
        $validation = validatePathParams(
            ['id' => $section_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Section Id.');
            exit;
        }

        Flight::set('currentSection', $section_id);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/sections/removeSection.php';
    }
}
