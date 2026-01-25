<?php

declare(strict_types=1);

use flight\Engine;

class TextContentController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/textContent/getTextContent.php';
    }

    public function showBySection(string $section_name): void
    {
        $validation = validatePathParams(
            ['section_name' => $section_name],
            ['section_name' => 'string']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Section Name.');
            exit;
        }

        Flight::set('currentSection', $section_name);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/textContent/getTextContentBySectionName.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/textContent/createTextContent.php';
    }

    public function update(string $text_content_id): void
    {
        $validation = validatePathParams(
            ['text_content_id' => $text_content_id],
            ['text_content_id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Text Content Id.');
            exit;
        }

        Flight::set('text_content_id', $text_content_id);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/textContent/updateTextContent.php';
    }

    public function delete(string $text_content_id): void
    {
        $validation = validatePathParams(
            ['text_content_id' => $text_content_id],
            ['text_content_id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Text Content Id.');
            exit;
        }

        Flight::set('text_content_id', $validation['values']['text_content_id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/textContent/removeTextContent.php';
    }
}
