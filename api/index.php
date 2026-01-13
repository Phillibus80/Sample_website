<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/middleware/csrf-middleware.php';
require_once __DIR__ . '/middleware/jwt-middleware.php';

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

//-----------------//
// ---- Email ---- //

Flight::route('POST /send_email', function () {
    require_once 'routes/public/send-email.php';
});

//-----------------//
// ---- Pages ---- //

Flight::route('POST /pages', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/pages/createPage.php';
});

Flight::route('GET /pages', function () {
    require_once 'routes/pages/page.php';
});

Flight::route('PATCH /pages/@page_id', function ($page_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updatePagePathParams = ['page_id' => $page_id];
    $updatePageParamTypes = ['page_id' => 'int'];

    $updatePageIdValidationResult = validatePathParams($updatePagePathParams, $updatePageParamTypes);
    if (count($updatePageIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Page Id.');
        exit;
    }

    // Return the validated id (path param)
    $updatePageId = $updatePageIdValidationResult['values']['page_id'];

    Flight::set('currentPage', $updatePageId);
    require_once 'routes/pages/updatePage.php';
});

Flight::route('DELETE /pages/@page_id', function ($page_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removePagePathParams = ['id' => $page_id];
    $removePageParamTypes = ['id' => 'int'];

    $removePageIdValidationResult = validatePathParams($removePagePathParams, $removePageParamTypes);

    if (!empty($removePageIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Page Id.');
        exit;
    }

    // Return the validated id (path param)
    $removePageId = $removePageIdValidationResult['values']['id'];

    Flight::set('currentPage', $removePageId);
    require_once 'routes/pages/removePage.php';
});

//-------------------------//
// ---- Page Sections ---- //

Flight::route('POST /pages_sections', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/pages/sections/createPageSection.php';
});

Flight::route('DELETE /pages_sections/@page_section_id', function ($page_section_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removePageSectionPathParams = ['id' => $page_section_id];
    $removePageSectionParamTypes = ['id' => 'int'];

    $removePageSectionIdValidationResult = validatePathParams(
        $removePageSectionPathParams,
        $removePageSectionParamTypes
    );

    if (!empty($removePageSectionIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Page Section Id.');
        exit;
    }

    // Return the validated id (path param)
    $removePageSectionId = $removePageSectionIdValidationResult['values']['id'];

    Flight::set('currentPageSection', $removePageSectionId);
    require_once 'routes/pages/sections/removePageSection.php';
});

// Update the Page Section table
// Move sections, pages, and toggle visibility
Flight::route('PATCH /pages_sections/@page_section_id', function ($page_section_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updatePageSectionPathParams = ['page_section_id' => $page_section_id];
    $updatePageSectionParamTypes = ['page_section_id' => 'int'];

    $updatePageSectionIdValidationResult = validatePathParams(
        $updatePageSectionPathParams,
        $updatePageSectionParamTypes
    );
    if (count($updatePageSectionIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Page Section Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateUserId = $updatePageSectionIdValidationResult['values']['page_section_id'];

    Flight::set('currentPageSection', $page_section_id);
    require_once 'routes/pages/sections/updatePagesSections.php';
});

//----------------------------------//
// ---- Page Section Component ---- //

// Add a component to a page section
Flight::route('POST /pages_sections_components', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/pages/sections/components/createPageSectionComponent.php';
});

Flight::route('PATCH /pages_sections_components/@psc_id/@component_id', function ($ps_id, $component_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param

    // Page Section ID
    $updatePSPathParams = ['ps_id' => $ps_id];
    $updatePSParamTypes = ['ps_id' => 'int'];
    $updatePSIdValidationResult = validatePathParams(
        $updatePSPathParams,
        $updatePSParamTypes
    );
    if (count($updatePSIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Page Section Id.');
        exit;
    }

    // Component ID
    $updatePSCPathParams = ['component_id' => $component_id];
    $updatePSCParamTypes = ['component_id' => 'int'];
    $updatePSCIdValidationResult = validatePathParams(
        $updatePSCPathParams,
        $updatePSCParamTypes
    );
    if (count($updatePSCIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Page Section Component Id.');
        exit;
    }

    // Return the validated id (path param)
    $updatePSId = $updatePSIdValidationResult['values']['ps_id'];
    $updatePSCId = $updatePSCIdValidationResult['values']['component_id'];

    Flight::set('psId', $updatePSId);
    Flight::set('oldComponentId', $updatePSCId);
    require_once 'routes/pages/sections/components/updatePageSectionComponent.php';
});

Flight::route('DELETE /pages_sections_components/@psc_id', function ($psc_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removePageSectionComponentPathParams = ['id' => $psc_id];
    $removePageSectionComponentParamTypes = ['id' => 'int'];

    $removePageSectionComponentIdValidationResult = validatePathParams(
        $removePageSectionComponentPathParams,
        $removePageSectionComponentParamTypes
    );

    if (!empty($removePageSectionComponentIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Page Section Component Id.');
        exit;
    }

    // Return the validated id (path param)
    $removePageSectionComponentId = $removePageSectionComponentIdValidationResult['values']['id'];

    Flight::set('pscId', $removePageSectionComponentId);
    require_once 'routes/pages/sections/components/removePageSectionComponent.php';
});

//------------------------------------------//
// ---- Page Section Component Content ---- //

// Create a new entry of content on the section's components
Flight::route('POST /pages_sections_components_content/@page_section_component', function ($page_section_component) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    Flight::set('currentPageSectionComponentId', $page_section_component);
    require_once 'routes/pages/sections/components/content/createComponentContent.php';
});

// Update the Component Content table
// Update the content on the section's components
Flight::route('PATCH /pages_sections_components_content/@component_content_id', function ($component_content_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateComponentContentPathParams = ['id' => $component_content_id];
    $updateComponentContentParamTypes = ['id' => 'int'];

    $updateComponentContentIdValidationResult = validatePathParams(
        $updateComponentContentPathParams,
        $updateComponentContentParamTypes
    );
    if (count($updateComponentContentIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Component Content Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateComponentContentId = $updateComponentContentIdValidationResult['values']['id'];

    Flight::set('currentComponentContentId', $updateComponentContentId);
    require_once 'routes/pages/sections/components/content/updateComponentContent.php';
});

Flight::route('DELETE /pages_sections_components_content/@component_content_id', function ($component_content_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeComponentContentPathParams = ['id' => $component_content_id];
    $removeComponentContentParamTypes = ['id' => 'int'];

    $removeComponentContentIdValidationResult = validatePathParams(
        $removeComponentContentPathParams,
        $removeComponentContentParamTypes
    );

    if (!empty($removeComponentContentIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Component Content Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeComponentContentId = $removeComponentContentIdValidationResult['values']['id'];

    Flight::set('pscId', $removeComponentContentId);

    Flight::set('currentComponentContentId', $component_content_id);
    require_once 'routes/pages/sections/components/content/removeComponentContent.php';
});

//----------------//
// ---- Auth ---- //

Flight::route('POST /login', function () {
    require_once 'routes/admin/login.php';
});

Flight::route('POST /logout', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/admin/logout.php';
});

//----------------------//
// ---- OfficeUsers ----//

Flight::route('GET /users', function () {
    require_once 'routes/users/getUsers.php';
});

Flight::route('GET /users/@user_username', function ($user_name) {
    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $getUserByUsernamePathParams = ['user_name' => $user_name];
    $getUserByUsernameParamTypes = ['user_name' => 'string'];

    $getUserByUserNameValidationResult = validatePathParams(
        $getUserByUsernamePathParams,
        $getUserByUsernameParamTypes
    );

    if (!empty($getUserByUserNameValidationResult['errors'])) {
        sendResponse(400, 'Error with Username.');
        exit;
    }

    // Return the validated value (path param)
    $validatedGetUserByUsername = $getUserByUserNameValidationResult['values']['user_name'];

    Flight::set('currentUser', $validatedGetUserByUsername);
    require_once 'routes/users/getUser.php';
});

Flight::route('PATCH /users/@user_id', function ($user_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateUserPathParams = ['user_id' => $user_id];
    $updateUserParamTypes = ['user_id' => 'int'];

    $updateUserIdValidationResult = validatePathParams($updateUserPathParams, $updateUserParamTypes);
    if (count($updateUserIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with User Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateUserId = $updateUserIdValidationResult['values']['user_id'];

    Flight::set('currentUser', $updateUserId);
    require_once 'routes/users/updateUser.php';
});

Flight::route('POST /users', function () {
    if (Flight::get('IN_DEVELOPMENT')) {
        $requestHeaders = apache_request_headers();
        $authHeader = $requestHeaders['Authorization'] ?? null;
    } else {
        requireCsrfToken();

        $decodedToken = requireAuth();
        if (!$decodedToken) return;
    }

    require_once 'routes/users/createUser.php';
});

Flight::route('DELETE /users/@user_id', function ($user_id) {
    // Validate CSRF Token
    requireCsrfToken();

    // Validate JWT Token
    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeUserPathParams = ['id' => $user_id];
    $removeUserParamTypes = ['id' => 'int'];

    $removeUserIdValidationResult = validatePathParams($removeUserPathParams, $removeUserParamTypes);

    if (!empty($result['errors'])) {
        sendResponse(400, 'Error with User Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeUserId = $removeUserIdValidationResult['values']['id'];

    Flight::set('currentUser', $removeUserId);
    require_once 'routes/users/removeUser.php';
});

//--------------------//
// ---- Sections ---- //

Flight::route('GET /sections', function () {
    /**
     * There is a path param allowed here page, but
     * Flight keeps erroring out when I place in here.
     * Therefore, the check is in the endpoint itself.
     */
    require_once 'routes/sections/getSections.php';
});

Flight::route('POST /sections', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/sections/createSection.php';
});

Flight::route('PATCH /sections/@section_id', function ($section_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateSectionPathParams = ['section_id' => $section_id];
    $updateSectionParamTypes = ['section_id' => 'int'];

    $updateSectionIdValidationResult = validatePathParams(
        $updateSectionPathParams,
        $updateSectionParamTypes
    );

    if (count($updateSectionIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Section Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateSectionId = $updateSectionIdValidationResult['values']['section_id'];

    Flight::set('currentSection', $updateSectionId);
    require_once 'routes/sections/updateSection.php';
});

Flight::route('DELETE /sections/@section_id', function ($section_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeSectionPathParams = ['id' => $section_id];
    $removeSectionParamTypes = ['id' => 'int'];

    $removeUserIdValidationResult = validatePathParams(
        $removeSectionPathParams,
        $removeSectionParamTypes
    );

    if (!empty($result['errors'])) {
        sendResponse(400, 'Error with Section Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeUserId = $removeUserIdValidationResult['values']['id'];

    Flight::set('currentSection', $section_id);
    require_once 'routes/sections/removeSection.php';
});

//-------------------------------//
// --------- Components -------- //

// Has an addition filter path param called 'page'
// which filters based on the page name (Completely optional).
// The validation is handled inside the route instead of here
// due to Flight causing the call to fail if it is not provided.
Flight::route('GET /components', function () {
    require_once 'routes/components/getComponents.php';
});

Flight::route('POST /components', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/components/createComponent.php';
});

Flight::route('PATCH /components/@component_id', function ($component_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateComponentPathParams = ['id' => $component_id];
    $updateComponentParamTypes = ['id' => 'int'];

    $updateComponentIdValidationResult = validatePathParams(
        $updateComponentPathParams,
        $updateComponentParamTypes
    );
    if (count($updateComponentIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Component Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateComponentId = $updateComponentIdValidationResult['values']['id'];

    Flight::set('currentComponent', $updateComponentId);
    require_once 'routes/components/updateComponent.php';
});

Flight::route('DELETE /components/@component_id', function ($component_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeComponentPathParams = ['id' => $component_id];
    $removeComponentParamTypes = ['id' => 'int'];

    $removeComponentIdValidationResult = validatePathParams(
        $removeComponentPathParams,
        $removeComponentParamTypes
    );

    if (!empty($removeComponentIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Component Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeComponentId = $removeComponentIdValidationResult['values']['id'];

    Flight::set('currentComponent', $removeComponentId);
    require_once 'routes/components/removeComponent.php';
});

//----------------------------//
// --------- Content -------- //

// ---- Images ---- //
Flight::route('GET /images', function () {
    require_once 'routes/images/getImages.php';
});

Flight::route('GET /images/@section_name', function ($section_name) {
    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $getImagesBySectionNameParams = ['section_name' => $section_name];
    $getImagesBySectionNameTypes = ['section_name' => 'string'];

    $getImagesBySectionNameValidationResult = validatePathParams(
        $getImagesBySectionNameParams,
        $getImagesBySectionNameTypes
    );

    if (!empty($getImagesBySectionNameValidationResult['errors'])) {
        sendResponse(400, 'Error with getting the Images by Section Name.');
        exit;
    }

    // Return the validated value (path param)
    $validatedGetImagesBySectionName = $getImagesBySectionNameValidationResult['values']['section_name'];

    Flight::set('currentSection', $validatedGetImagesBySectionName);
    require_once 'routes/images/getImagesBySectionName.php';
});

Flight::route('POST /images', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/images/createImage.php';
});

Flight::route('PATCH /images/@image_id', function ($image_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateImagePathParams = ['id' => $image_id];
    $updateImageParamTypes = ['id' => 'int'];

    $updateImageIdValidationResult = validatePathParams(
        $updateImagePathParams,
        $updateImageParamTypes
    );
    if (count($updateImageIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Image Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateImageId = $updateImageIdValidationResult['values']['id'];

    Flight::set('image_id', $updateImageId);
    require_once 'routes/images/updateImage.php';
});

Flight::route('DELETE /images/@image_id', function ($image_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeImagePathParams = ['id' => $image_id];
    $removeImageParamTypes = ['id' => 'int'];

    $removeImageIdValidationResult = validatePathParams(
        $removeImagePathParams,
        $removeImageParamTypes
    );

    if (!empty($removeImageIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Image Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeImageId = $removeImageIdValidationResult['values']['id'];

    Flight::set('image_id', $removeImageId);
    require_once 'routes/images/removeImage.php';
});

//-----------------//
// ---- Links ---- //

// Has an addition filter path param called 'page'
// which filters based on the page name (Completely optional).
// The validation is handled inside the route instead of here
// due to Flight causing the call to fail if it is not provided.
Flight::route('GET /links', function () {
    require_once 'routes/links/getLinks.php';
});

Flight::route('GET /links/@section_name', function ($section_name) {
    // Validate the Path Param
    $getLinksBySectionNameParams = ['section_name' => $section_name];
    $getLinkBySectionNameTypes = ['section_name' => 'string'];

    $getLinksBySectionNameValidationResult = validatePathParams(
        $getLinksBySectionNameParams,
        $getLinkBySectionNameTypes
    );

    if (!empty($getLinksBySectionNameValidationResult['errors'])) {
        sendResponse(400, 'Error with getting the Links by Section Name.');
        exit;
    }

    // Return the validated value (path param)
    $validatedGetLinksBySectionName = $getLinksBySectionNameValidationResult['values']['section_name'];

    Flight::set('currentSection', $validatedGetLinksBySectionName);
    require_once 'routes/links/getLinksBySectionName.php';
});

Flight::route('POST /links', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/links/createLink.php';
});

Flight::route('PATCH /links/@link_id', function ($link_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateLinkPathParams = ['id' => $link_id];
    $updateLinkParamTypes = ['id' => 'int'];

    $updateLinkIdValidationResult = validatePathParams(
        $updateLinkPathParams,
        $updateLinkParamTypes
    );
    if (count($updateLinkIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Link Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateLinkId = $updateLinkIdValidationResult['values']['id'];

    Flight::set('linkId', $updateLinkId);
    require_once 'routes/links/updateLink.php';
});

Flight::route('DELETE /links/@link_id', function ($link_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeLinkPathParams = ['id' => $link_id];
    $removeLinkParamTypes = ['id' => 'int'];

    $removeLinkIdValidationResult = validatePathParams(
        $removeLinkPathParams,
        $removeLinkParamTypes
    );

    if (!empty($result['errors'])) {
        sendResponse(400, 'Error with Link Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeLinkId = $removeLinkIdValidationResult['values']['id'];

    Flight::set('linkId', $removeLinkId);
    require_once 'routes/links/removeLink.php';
});

//------------------------//
// ---- Text Content ---- //
Flight::route('GET /textcontent', function () {
    require_once 'routes/textContent/getTextContent.php';
});

Flight::route('GET /textcontent/@section_name', function ($section_name) {
    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $getSectionPathParams = ['section_name' => $section_name];
    $getSectionParamTypes = ['section_name' => 'string'];

    $getSectionNameValidationResult = validatePathParams(
        $getSectionPathParams,
        $getSectionParamTypes
    );

    if (!empty($getUserByUserNameValidationResult['errors'])) {
        sendResponse(400, 'Error with Section Name.');
        exit;
    }

    // Return the validated value (path param)
    $validatedGetUserByUsername = $getSectionNameValidationResult['values']['section_name'];

    Flight::set('currentSection', $section_name);
    require_once 'routes/textContent/getTextContentBySectionName.php';
});

Flight::route('POST /textcontent', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/textContent/createTextContent.php';
});

Flight::route('PATCH /textcontent/@text_content_id', function ($text_content_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateTextContentPathParams = ['text_content_id' => $text_content_id];
    $updateTextContentParamTypes = ['text_content_id' => 'int'];

    $updateTextContentIdValidationResult = validatePathParams(
        $updateTextContentPathParams,
        $updateTextContentParamTypes
    );
    if (count($updateTextContentIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Text Content Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateUserId = $updateTextContentIdValidationResult['values']['text_content_id'];

    Flight::set('text_content_id', $text_content_id);
    require_once 'routes/textContent/updateTextContent.php';
});

Flight::route('DELETE /textcontent/@text_content_id', function ($text_content_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeTextContentPathParams = ['text_content_id' => $text_content_id];
    $removeTextContentParamTypes = ['text_content_id' => 'int'];

    $removeTextContentIdValidationResult = validatePathParams(
        $removeTextContentPathParams,
        $removeTextContentParamTypes
    );

    if (!empty($removeTextContentIdValidationResult['errors'])) {
        sendResponse(400, 'Error with Text Content Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeTextContentId = $removeTextContentIdValidationResult['values']['text_content_id'];

    Flight::set('text_content_id', $removeTextContentId);
    require_once 'routes/textContent/removeTextContent.php';
});

//------------------//
// ---- Events ---- //
Flight::route('GET /events', function () {
    require_once 'routes/events/getEvents.php';
});

Flight::route('POST /events', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/events/createEvent.php';
});

Flight::route('PATCH /events/@event_id', function ($event_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateEventPathParams = ['id' => $event_id];
    $updateEventParamTypes = ['id' => 'int'];

    $updateEventIdValidationResult = validatePathParams(
        $updateEventPathParams,
        $updateEventParamTypes
    );
    if (count($updateEventIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Event Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateEventId = $updateEventIdValidationResult['values']['id'];

    Flight::set('event_id', $updateEventId);
    require_once 'routes/events/updateEvent.php';
});

Flight::route('DELETE /events/@event_id', function ($event_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeEventPathParams = ['id' => $event_id];
    $removeEventParamTypes = ['id' => 'int'];

    $removeEventIdValidationResult = validatePathParams(
        $removeEventPathParams,
        $removeEventParamTypes
    );

    if (!empty($result['errors'])) {
        sendResponse(400, 'Error with Event Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeEventId = $removeEventIdValidationResult['values']['id'];

    Flight::set('event_id', $removeEventId);
    require_once 'routes/events/removeEvent.php';
});


//---------------------//
// ---- Locations ---- //
Flight::route('GET /locations', function () {
    require_once 'routes/locations/getLocations.php';
});

Flight::route('POST /locations', function () {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    require_once 'routes/locations/createLocation.php';
});

Flight::route('PATCH /locations/@location_id', function ($location_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $updateLocationPathParams = ['id' => $location_id];
    $updateLocationParamTypes = ['id' => 'int'];

    $updateLocationIdValidationResult = validatePathParams(
        $updateLocationPathParams,
        $updateLocationParamTypes
    );
    if (count($updateLocationIdValidationResult['errors']) > 0) {
        sendResponse(400, 'Error with Location Id.');
        exit;
    }

    // Return the validated id (path param)
    $updateLocationId = $updateLocationIdValidationResult['values']['id'];

    Flight::set('location_id', $updateLocationId);
    require_once 'routes/locations/updateLocation.php';
});

Flight::route('DELETE /locations/@location_id', function ($location_id) {
    requireCsrfToken();

    $decodedToken = requireAuth();
    if (!$decodedToken) return;

    // Validate the Path Param
    $removeLocationPathParams = ['id' => $location_id];
    $removeLocationParamTypes = ['id' => 'int'];

    $removeLocationIdValidationResult = validatePathParams(
        $removeLocationPathParams,
        $removeLocationParamTypes
    );

    if (!empty($result['errors'])) {
        sendResponse(400, 'Error with Location Id.');
        exit;
    }

    // Return the validated id (path param)
    $removeLocationId = $removeLocationIdValidationResult['values']['id'];

    Flight::set('location_id', $removeLocationId);
    require_once 'routes/locations/removeLocation.php';
});

Flight::start();
