<?php
require_once __DIR__ . '/../../../actions/section_creation_actions.php';
require_once __DIR__ . '/../../../utils.php';

$requiredFieldsAndTypes = [
    'section_name' => 'alphaNumeric',
    'page_name' => 'alphaNumeric'
];

$validationErrors = validateRequestData(
    Flight::request()->data,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    sendResponse(422, 'All fields are required: section_name, and page_name.', $validationErrors);
}

try {
    $db = Flight::db();

    $known_sections = [
        'Header',
        'Hero',
        'About Us Hex Gallery',
        'Info',
        'Benefits',
        'Footer',
        'Info Picture',
        'Info Gallery',
        'Events',
        'Spaced Hex Gallery'
    ];

    $new_page_section_section_name = Flight::request()->data->section_name;
    $new_page_section_page_name = toKebabCase(Flight::request()->data->page_name);
    $new_page_section_show_section = Flight::request()->data->show_section === true
        ? 1
        : 0;

    $section_id = '';
    $page_id = '';

    // Check if the section exists
    $section_check_query = '
            SELECT ID FROM SECTIONS WHERE NAME = ?;
        ';
    $section_search_query = $db->prepare($section_check_query);
    $section_check_result = $section_search_query->execute([$new_page_section_section_name]);
    $section_id = $section_search_query->fetchColumn();
    if (!$section_id) {
        sendResponse(404, 'Section not found.');
    }

    // Check if the page exists
    $page_check_query = '
            SELECT ID FROM PAGES WHERE NAME = ?;
        ';
    $page_search_query = runQuery($db, $page_check_query, [$new_page_section_page_name]);
    $page_id = $page_search_query[0]['ID'];
    if (!$page_id) {
        sendResponse(404, 'Page not found.');
    }

    // Create the page section
    $page_section_creation_query = '
            INSERT INTO PAGES_SECTIONS (PAGE_ID, SECTION_ID, SHOW_SECTION)
            VALUES (?, ?, ?);
        ';
    $creation_query_results = runQuery($db, $page_section_creation_query, [$page_id, $section_id, $new_page_section_show_section]);
    $pages_sections_id = $db->lastInsertId();

    // Pre-set the components for known sections
    if (in_array($new_page_section_section_name, $known_sections)) {
        switch ($new_page_section_section_name) {
            case 'Header':
                createNewHeaderSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Hero':
                createNewHeroSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'About Us Hex Gallery':
                createNewInfoHexGallerySection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Info':
                createInfoSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Benefits':
                createBenefitsSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Footer':
                createFooterSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Info Picture':
                createInfoPictureSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Info Gallery':
                createInfoGallerySection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Events':
                createEventsSection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
            case 'Spaced Hex Gallery':
                createProductGallerySection(
                    $db,
                    $pages_sections_id,
                    $new_page_section_page_name,
                    $new_page_section_section_name,
                    $new_page_section_show_section
                );
                break;
        }
    } else {
        // Add record to Page Section Components table
        $page_section_components_query = '
            INSERT INTO PAGE_SECTION_COMPONENTS (PAGE_SECTION_ID)
            VALUES (?);
        ';
        $page_section_components_result = runQuery($db, $page_section_components_query, [$pages_sections_id]);
        $page_section_components_id = $db->lastInsertId();

        // Add record to Components Content table
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID)
            VALUES (?);
        ';
        $components_content_result = runQuery($db, $components_content_query, [$page_section_components_id]);
        $components_content_id = $db->lastInsertId();

        $db = null;
        sendResponse(200, 'Page Section: created.', [
            'page_name' => $new_page_section_page_name,
            'section_name' => $new_page_section_section_name,
            'show_section' => $new_page_section_show_section == 1,
            'page_section_id' => $pages_sections_id,
            'page_section_component_id' => $page_section_components_id,
            'components_content_id' => $components_content_id
        ]);
    }
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'There was an error.');
    exit;
}