<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/middleware/csrf-middleware.php';
require_once __DIR__ . '/middleware/jwt-middleware.php';
require_once __DIR__ . '/middleware/CsrfMiddleware.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/controllers/PageController.php';
require_once __DIR__ . '/controllers/PageSectionController.php';
require_once __DIR__ . '/controllers/PageSectionComponentController.php';
require_once __DIR__ . '/controllers/ComponentContentController.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/SectionController.php';
require_once __DIR__ . '/controllers/ComponentController.php';
require_once __DIR__ . '/controllers/ImageController.php';
require_once __DIR__ . '/controllers/LinkController.php';
require_once __DIR__ . '/controllers/TextContentController.php';
require_once __DIR__ . '/controllers/EventController.php';
require_once __DIR__ . '/controllers/LocationController.php';
require_once __DIR__ . '/controllers/LogController.php';
require_once __DIR__ . '/controllers/EmailController.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Constants
Flight::set('SUPER', 'SUPER');
Flight::set('PUBLIC', 'PUBLIC');
Flight::set('PRIVATE', 'PRIVATE');
Flight::set('IN_DEVELOPMENT', true);
Flight::set('SITE_URL', $_ENV['SITE_URL']);
Flight::set('EMAIL', $_ENV['MAIN_EMAIL']);
Flight::set('FORWARD_EMAIL', $_ENV['FORWARD_EMAIL']);
Flight::set('SMTP_PASSWORD', $_ENV['EMAIL_PASSWORD']);
Flight::set('GOOGLE_MAPS_API', $_ENV['GOOGLE_MAPS_API']);
Flight::set('secretKey', $_ENV['SECRET_KEY']);

setCorsHeaders();

handlePreFlight();

// DB Connection Constants
$dbHost = $_ENV['MYSQL_HOST'];
$dbPort = $_ENV['MYSQL_PORT'];
$dbName = $_ENV['MYSQL_DATABASE'];
$dbUser = $_ENV['MYSQL_USER'];
$dbPass = $_ENV['MYSQL_PASSWORD'];

// DSN with charset
$dsn = "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4";

// Store in Flight globals
Flight::set('PDO_DSN', $dsn);
Flight::set('DB_USER', $dbUser);
Flight::set('DB_PASS', $dbPass);

// Page Constants
Flight::set('MAIN', 'main');
Flight::set('page-image-dir', './img/');

Flight::map('notFound', function () {
    sendResponse(404, 'Not Found');
});

Flight::register('db', 'PDO',
    array(
        Flight::get('PDO_DSN'),
        Flight::get('DB_USER'),
        Flight::get('DB_PASS')
    ),
    function ($db) {
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    }
);

// Middleware shorthand
$csrf = CsrfMiddleware::class;
$auth = AuthMiddleware::class;

//-----------------//
// ---- Email ---- //

Flight::route('POST /send_email', [EmailController::class, 'send']);

//-----------------//
// ---- Pages ---- //

Flight::route('GET /pages', [PageController::class, 'index']);
Flight::route('POST /pages', [PageController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /pages/@page_id', [PageController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /pages/@page_id', [PageController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//-------------------------//
// ---- Page Sections ---- //

Flight::route('POST /pages_sections', [PageSectionController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /pages_sections/@page_section_id', [PageSectionController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /pages_sections/@page_section_id', [PageSectionController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//----------------------------------//
// ---- Page Section Component ---- //

Flight::route('POST /pages_sections_components', [PageSectionComponentController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /pages_sections_components/@psc_id/@component_id', [PageSectionComponentController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /pages_sections_components/@psc_id', [PageSectionComponentController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//------------------------------------------//
// ---- Page Section Component Content ---- //

Flight::route('POST /pages_sections_components_content/@page_section_component', [ComponentContentController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /pages_sections_components_content/@component_content_id', [ComponentContentController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /pages_sections_components_content/@component_content_id', [ComponentContentController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//----------------//
// ---- Auth ---- //

Flight::route('POST /login', [AuthController::class, 'login']);
Flight::route('POST /logout', [AuthController::class, 'logout'])
    ->addMiddleware([$csrf, $auth]);

//----------------------//
// ---- Users ---- //

Flight::route('GET /users', [UserController::class, 'index'])
    ->addMiddleware($auth);
Flight::route('GET /users/@user_username', [UserController::class, 'show'])
    ->addMiddleware($auth);
Flight::route('POST /users', [UserController::class, 'create']);
Flight::route('PATCH /users/@user_id', [UserController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /users/@user_id', [UserController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//--------------------//
// ---- Sections ---- //

Flight::route('GET /sections', [SectionController::class, 'index']);
Flight::route('POST /sections', [SectionController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /sections/@section_id', [SectionController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /sections/@section_id', [SectionController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//-------------------------------//
// --------- Components -------- //

Flight::route('GET /components', [ComponentController::class, 'index']);
Flight::route('POST /components', [ComponentController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /components/@component_id', [ComponentController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /components/@component_id', [ComponentController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//----------------------------//
// --------- Content -------- //

// ---- Images ---- //
Flight::route('GET /images', [ImageController::class, 'index']);
Flight::route('GET /images/@section_name', [ImageController::class, 'showBySection'])
    ->addMiddleware($auth);
Flight::route('POST /images', [ImageController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /images/@image_id', [ImageController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /images/@image_id', [ImageController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//-----------------//
// ---- Links ---- //

Flight::route('GET /links', [LinkController::class, 'index']);
Flight::route('GET /links/@section_name', [LinkController::class, 'showBySection']);
Flight::route('POST /links', [LinkController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /links/@link_id', [LinkController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /links/@link_id', [LinkController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//------------------------//
// ---- Text Content ---- //

Flight::route('GET /textcontent', [TextContentController::class, 'index']);
Flight::route('GET /textcontent/@section_name', [TextContentController::class, 'showBySection'])
    ->addMiddleware($auth);
Flight::route('POST /textcontent', [TextContentController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /textcontent/@text_content_id', [TextContentController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /textcontent/@text_content_id', [TextContentController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//------------------//
// ---- Events ---- //

Flight::route('GET /events', [EventController::class, 'index']);
Flight::route('POST /events', [EventController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /events/@event_id', [EventController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /events/@event_id', [EventController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//---------------------//
// ---- Locations ---- //

Flight::route('GET /locations', [LocationController::class, 'index']);
Flight::route('POST /locations', [LocationController::class, 'create'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('PATCH /locations/@location_id', [LocationController::class, 'update'])
    ->addMiddleware([$csrf, $auth]);
Flight::route('DELETE /locations/@location_id', [LocationController::class, 'delete'])
    ->addMiddleware([$csrf, $auth]);

//----------------//
// ---- Logs ---- //

Flight::route('GET /logs', [LogController::class, 'index'])
    ->addMiddleware($auth);

Flight::start();
