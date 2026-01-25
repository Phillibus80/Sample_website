<?php

declare(strict_types=1);

use flight\Engine;

class PageSectionController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/createPageSection.php';
    }

    public function update(string $page_section_id): void
    {
        $pathParams = ['page_section_id' => $page_section_id];
        $paramTypes = ['page_section_id' => 'int'];

        $validation = validatePathParams($pathParams, $paramTypes);
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Page Section Id.');
            exit;
        }

        Flight::set('currentPageSection', $page_section_id);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/updatePagesSections.php';
    }

    public function delete(string $page_section_id): void
    {
        $pathParams = ['id' => $page_section_id];
        $paramTypes = ['id' => 'int'];

        $validation = validatePathParams($pathParams, $paramTypes);
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Page Section Id.');
            exit;
        }

        Flight::set('currentPageSection', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/removePageSection.php';
    }
}
