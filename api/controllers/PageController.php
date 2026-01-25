<?php

declare(strict_types=1);

use flight\Engine;

class PageController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/pages/page.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/createPage.php';
    }

    public function update(string $page_id): void
    {
        $pathParams = ['page_id' => $page_id];
        $paramTypes = ['page_id' => 'int'];

        $validation = validatePathParams($pathParams, $paramTypes);
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Page Id.');
            exit;
        }

        Flight::set('currentPage', $validation['values']['page_id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/updatePage.php';
    }

    public function delete(string $page_id): void
    {
        $pathParams = ['id' => $page_id];
        $paramTypes = ['id' => 'int'];

        $validation = validatePathParams($pathParams, $paramTypes);
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Page Id.');
            exit;
        }

        Flight::set('currentPage', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/pages/removePage.php';
    }
}
