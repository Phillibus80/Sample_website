<?php

declare(strict_types=1);

use flight\Engine;

class ImageController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/images/getImages.php';
    }

    public function showBySection(string $section_name): void
    {
        $validation = validatePathParams(
            ['section_name' => $section_name],
            ['section_name' => 'string']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with getting the Images by Section Name.');
            exit;
        }

        Flight::set('currentSection', $validation['values']['section_name']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/images/getImagesBySectionName.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/images/createImage.php';
    }

    public function update(string $image_id): void
    {
        $validation = validatePathParams(
            ['id' => $image_id],
            ['id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Image Id.');
            exit;
        }

        Flight::set('image_id', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/images/updateImage.php';
    }

    public function delete(string $image_id): void
    {
        $validation = validatePathParams(
            ['id' => $image_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Image Id.');
            exit;
        }

        Flight::set('image_id', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/images/removeImage.php';
    }
}
