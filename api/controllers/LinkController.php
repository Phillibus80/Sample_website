<?php

declare(strict_types=1);

use flight\Engine;

class LinkController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/links/getLinks.php';
    }

    public function showBySection(string $section_name): void
    {
        $validation = validatePathParams(
            ['section_name' => $section_name],
            ['section_name' => 'string']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with getting the Links by Section Name.');
            exit;
        }

        Flight::set('currentSection', $validation['values']['section_name']);
        require __DIR__ . '/../routes/links/getLinksBySectionName.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/links/createLink.php';
    }

    public function update(string $link_id): void
    {
        $validation = validatePathParams(
            ['id' => $link_id],
            ['id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Link Id.');
            exit;
        }

        Flight::set('linkId', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/links/updateLink.php';
    }

    public function delete(string $link_id): void
    {
        $validation = validatePathParams(
            ['id' => $link_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Link Id.');
            exit;
        }

        Flight::set('linkId', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/links/removeLink.php';
    }
}
