<?php

declare(strict_types=1);

use flight\Engine;

class ComponentContentController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function create(string $page_section_component): void
    {
        Flight::set('currentPageSectionComponentId', $page_section_component);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/components/content/createComponentContent.php';
    }

    public function update(string $component_content_id): void
    {
        $validation = validatePathParams(
            ['id' => $component_content_id],
            ['id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Component Content Id.');
            exit;
        }

        Flight::set('currentComponentContentId', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/components/content/updateComponentContent.php';
    }

    public function delete(string $component_content_id): void
    {
        $validation = validatePathParams(
            ['id' => $component_content_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Component Content Id.');
            exit;
        }

        Flight::set('pscId', $validation['values']['id']);
        Flight::set('currentComponentContentId', $component_content_id);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/sections/components/content/removeComponentContent.php';
    }
}
