<?php

declare(strict_types=1);

use flight\Engine;

class EventController
{
    protected Engine $app;

    public function __construct(Engine $app)
    {
        $this->app = $app;
    }

    public function index(): void
    {
        require __DIR__ . '/../routes/events/getEvents.php';
    }

    public function create(): void
    {
        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/events/createEvent.php';
    }

    public function update(string $event_id): void
    {
        $validation = validatePathParams(
            ['id' => $event_id],
            ['id' => 'int']
        );
        if (count($validation['errors']) > 0) {
            sendResponse(400, 'Error with Event Id.');
            exit;
        }

        Flight::set('event_id', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/events/updateEvent.php';
    }

    public function delete(string $event_id): void
    {
        $validation = validatePathParams(
            ['id' => $event_id],
            ['id' => 'int']
        );
        if (!empty($validation['errors'])) {
            sendResponse(400, 'Error with Event Id.');
            exit;
        }

        Flight::set('event_id', $validation['values']['id']);

        $decodedToken = Flight::get('decodedToken');
        require __DIR__ . '/../routes/events/removeEvent.php';
    }
}
