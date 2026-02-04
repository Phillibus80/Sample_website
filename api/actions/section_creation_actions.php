<?php
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */
/** @noinspection PhpUnusedLocalVariableInspection */

require_once __DIR__ . "/../utils.php";

/**
 * A utility function to retrieve the ID of a page section component
 *
 * @param PDO $db A PDO database connection.
 * @param int $pages_sections_id The ID of the page section.
 * @param int $component_id The ID of the component.
 *
 * @return int the resultant ID from the Page Section Components table
 */
function getPageSectionComponentId(PDO $db, int $pages_sections_id, int $component_id): int
{
    try {
        $page_section_components_query = '
            INSERT INTO PAGE_SECTION_COMPONENTS (PAGE_SECTION_ID, COMPONENT_ID)
            VALUES (?, ?);
        ';
        runQuery($db, $page_section_components_query, [$pages_sections_id, $component_id]);
        return $db->lastInsertId();
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error getting the page section component id');
        exit;
    }
}

function addTitle($db, $pages_sections_id): array
{
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Title']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        // Add record to the Components Content table
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID)
            VALUES (?);
        ';
        runQuery($db, $components_content_query, [$page_section_components_id]);
        $components_content_id = $db->lastInsertId();

        return [
            'title_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addTitleWithDefaultContent($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Title']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID, TEXT_CONTENT_ID)
            VALUES (?, ?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId'],
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'title_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addSecondaryTitleWithDefaultContent($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Secondary Title']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID, TEXT_CONTENT_ID)
            VALUES (?, ?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId'],
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'title_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addSubtitleComponent($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Subtitle']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, TEXT_CONTENT_ID, IMAGE_ID)
            VALUES (?,?,?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultTextId'],
            $defaultContent['defaultImageId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'subtitle_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addHexImageGroup($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Hex Image Group']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID, TEXT_CONTENT_ID)
            VALUES (?, ?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId'],
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'hex_image_group_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addButton($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Button']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID, TEXT_CONTENT_ID)
            VALUES (?, ?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId'],
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'button_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addTextContainer($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Text Container']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, TEXT_CONTENT_ID)
            VALUES (?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'text_container_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addHexImage($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Hex Image']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID)
            VALUES (?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'hex_image_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addBenefitsList($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Benefits List']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
            INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, TEXT_CONTENT_ID)
            VALUES (?, ?);
        ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'benefits_content_id' => $components_content_id
        ];
    } catch (PDOException $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addStackableHexGallery($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Stackable Hex Gallery']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, TEXT_CONTENT_ID, IMAGE_ID)
                VALUES (?, ?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultTextId'],
            $defaultContent['defaultImageId']
        ]);
        $components_content_id = $db->lastInsertId();
        return [
            'stackable_hex_gallery_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addImageLoader($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Image Loader']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId']
        ]);
        $components_content_id = $db->lastInsertId();
        return [
            'image_loader_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addEmailField($db, $pages_sections_id): array
{
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Email Field']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID)
                VALUES (?);
            ';
        runQuery($db, $components_content_query, [$page_section_components_id]);
        $components_content_id = $db->lastInsertId();
        return [
            'email_field_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addContactUs($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Contact Field']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, TEXT_CONTENT_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultTextId']
        ]);
        $components_content_id = $db->lastInsertId();
        return [
            'contact_us_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addSocialGallery($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Social Gallery']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId']
        ]);
        $components_content_id = $db->lastInsertId();
        return [
            'social_gallery_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addImageGallery($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Image Gallery']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultImageId']
        ]);
        $components_content_id = $db->lastInsertId();
        return [
            'image_gallery_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function addEvents($db, $pages_sections_id): array
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Event List']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, EVENT_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultEventId']
        ]);
        $components_content_id = $db->lastInsertId();

        return [
            'events_content_id' => $components_content_id
        ];
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

/**
 * @throws Exception
 */
function createNewHeaderSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Menu']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);
    $home_link_id = getRecordId($db, 'LINKS', ['LINK_TEXT' => 'HOME']);

    try {
        $header_text_query = "
            INSERT INTO COMPONENT_CONTENT(PAGE_SECTION_COMPONENTS_ID, TEXT_CONTENT_ID)
            VALUES (?, ?)
        ";
        runQuery($db, $header_text_query, [
            $page_section_components_id,
            $defaultContent['defaultTextId']
        ]);// Insert the home link and image tandem
        $header_home_image_query = "
            INSERT INTO COMPONENT_CONTENT(PAGE_SECTION_COMPONENTS_ID, LINK_ID, IMAGE_ID)
            VALUES (?, ?, ?)
        ";
        runQuery($db, $header_home_image_query, [
            $page_section_components_id,
            $home_link_id,
            $defaultContent['defaultImageId']
        ]);// Add record to the Components Content table
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, LINK_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [
            $page_section_components_id,
            $defaultContent['defaultLinkId']
        ]);
        $components_content_id = $db->lastInsertId();
        $db = null;
        sendResponse(200, 'Header section created.', [
            'page_name' => $new_page_section_page_name,
            'section_name' => $new_page_section_section_name,
            'show_section' => $new_page_section_show_section == 1,
            'page_section_id' => $pages_sections_id,
            'page_section_component_id' => $page_section_components_id,
            'components_content_id' => $components_content_id
        ]);
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function createNewHeroSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add record to the Page Section Components table
    $defaultContent = retrieveDefaultContentIds($db);
    $component_id = getRecordId($db, 'COMPONENTS', ['NAME' => 'Carousel']);
    $page_section_components_id = getPageSectionComponentId($db, $pages_sections_id, $component_id);

    try {
        // Add record to the Components Content table
        $components_content_query = '
                INSERT INTO COMPONENT_CONTENT (PAGE_SECTION_COMPONENTS_ID, IMAGE_ID)
                VALUES (?, ?);
            ';
        runQuery($db, $components_content_query, [$page_section_components_id, $defaultContent['defaultImageId']]);
        $components_content_id = $db->lastInsertId();
        $db = null;
        sendResponse(200, 'Hero section created.', [
            'page_name' => $new_page_section_page_name,
            'section_name' => $new_page_section_section_name,
            'show_section' => $new_page_section_show_section == 1,
            'page_section_id' => $pages_sections_id,
            'page_section_component_id' => $page_section_components_id,
            'components_content_id' => $components_content_id
        ]);
    } catch (Exception $e) {
        sendResponse(500, 'There was an error adding the content.');
        exit;
    }
}

function createNewInfoHexGallerySection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the default image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add a secondary title with the default image
    $secondary_title_component_content_response = addSecondaryTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add Hex Image Group
    $hex_image_group_content_response = addHexImageGroup($db, $pages_sections_id);

    // Add Text Container
    $text_container_content_response = addTextContainer($db, $pages_sections_id);

    // Add Button
    $button_content_response = addButton($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'About us section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'secondary_title_component_content_id' => $secondary_title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'hex_image_group_component_content_id' => $hex_image_group_content_response['hex_image_group_content_id'],
            'text_component_content_id' => $text_container_content_response['text_container_content_id'],
            'button_component_content_id' => $button_content_response['button_content_id']
        ]
    ]);
}

function createInfoSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the honey dipper image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add Text Container
    $text_container_content_response = addTextContainer($db, $pages_sections_id);

    // Add Button
    $button_content_response = addButton($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Info section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'text_component_content_id' => $text_container_content_response['text_container_content_id'],
            'button_component_content_id' => $button_content_response['button_content_id']
        ]
    ]);
}

function createBenefitsSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the honey dipper image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add Hex Image
    $hex_image_component_content_response = addHexImage($db, $pages_sections_id);

    // Benefits
    $benefits_component_content_response = addBenefitsList($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Benefits section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'hex_image_component_content_id' => $hex_image_component_content_response['hex_image_content_id'],
            'benefits_component_content_id' => $benefits_component_content_response['benefits_content_id']
        ]
    ]);
}

function createProductGallerySection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the honey dipper image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add Stackable Hex Gallery
    $stackable_hex_gallery_component_content_response = addStackableHexGallery($db, $pages_sections_id);

    // Add Image Loader
    $image_loader_content_response = addImageLoader($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Product gallery section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'stackable_hex_gallery_component_content_id' => $stackable_hex_gallery_component_content_response['stackable_hex_gallery_content_id'],
            'image_loader_content_id' => $image_loader_content_response['image_loader_content_id']
        ]
    ]);
}

function createFooterSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add an email field
    $email_field_component_content_response = addEmailField($db, $pages_sections_id);

    // Add button
    $button_content_response = addButton($db, $pages_sections_id);

    // Add contact us
    $contact_us_content_response = addContactUs($db, $pages_sections_id);

    // Add the social gallery
    $social_gallery_content_response = addSocialGallery($db, $pages_sections_id);

    // Add social gallery text
    $social_gallery_text_response = addTextContainer($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Footer section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'email_field_component_content_id' => $email_field_component_content_response['email_field_content_id'],
            'button_content_id' => $button_content_response['button_content_id'],
            'contact_us_content_id' => $contact_us_content_response['contact_us_content_id'],
            'social_gallery_content_id' => $social_gallery_content_response['social_gallery_content_id'],
            'social_gallery_text_content_id' => $social_gallery_text_response['text_container_content_id']
        ]
    ]);
}

function createInfoPictureSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the honey dipper image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add text container
    $text_container_content_response = addTextContainer($db, $pages_sections_id);

    // Add image loader
    $image_loader_content_response = addImageLoader($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Info picture section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'text_component_content_id' => $text_container_content_response['text_container_content_id'],
            'image_loader_component_content_id' => $image_loader_content_response['image_loader_content_id']
        ]
    ]);
}

function createInfoGallerySection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the honey dipper image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add the image gallery
    $image_gallery_component_content_response = addImageGallery($db, $pages_sections_id);

    // Add Text Container
    $text_container_content_response = addTextContainer($db, $pages_sections_id);

    // Add Button
    $button_content_response = addButton($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Info gallery section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'image_gallery_component_content_id' => $image_gallery_component_content_response['image_gallery_content_id'],
            'text_component_content_id' => $text_container_content_response['text_container_content_id'],
            'button_component_content_id' => $button_content_response['button_content_id']
        ]
    ]);
}

function createEventsSection(
    $db,
    $pages_sections_id,
    $new_page_section_page_name,
    $new_page_section_section_name,
    $new_page_section_show_section
): void
{
    // Add title with the honey dipper image
    $title_component_content_response = addTitleWithDefaultContent($db, $pages_sections_id);

    // Add subtitle
    $subtitle_component_content_response = addSubtitleComponent($db, $pages_sections_id);

    // Add Text Container
    $text_container_content_response = addTextContainer($db, $pages_sections_id);

    // Add Event
    $events_content_response = addEvents($db, $pages_sections_id);

    $db = null;
    sendResponse(200, 'Events section created.', [
        'page_name' => $new_page_section_page_name,
        'section_name' => $new_page_section_section_name,
        'show_section' => $new_page_section_show_section == 1,
        'page_section_id' => $pages_sections_id,
        'content' => [
            'title_component_content_id' => $title_component_content_response['title_content_id'],
            'subtitle_component_content_id' => $subtitle_component_content_response['subtitle_content_id'],
            'text_component_content_id' => $text_container_content_response['text_container_content_id'],
            'events_component_content_id' => $events_content_response['events_content_id']
        ]
    ]);
}