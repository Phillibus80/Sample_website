<?php
try {
    // check the query param
    $page_name = filter_input(INPUT_GET, 'page', FILTER_UNSAFE_RAW);
    $page_name = $page_name !== null ? trim($page_name) : '';
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $page_name)) {
        $page_name = '';
    }

    $db = Flight::db();

    if (!$page_name) {
        $page_query = '
            SELECT ID, NAME
            FROM PAGES
            ORDER BY ID
            ';

        $pageStatementResult = runQuery($db, $page_query, []);

        $pageContentResponse = [
            "pages" => []
        ];
        foreach ($pageStatementResult as $pageRow) {
            $pageContentResponse["pages"][] = $pageRow;
        }

    } else {
        $page_check_statement = $db->prepare('SELECT * FROM PAGES WHERE NAME = :name');
        $page_check_statement->execute([':name' => $page_name]);
        $page = $page_check_statement->fetch(PDO::FETCH_ASSOC);

        if (!$page) {
            writeLog('GET /pages', 'critical', 'Page not found.', null);
            sendResponse(404, 'Page not found');
        }

        // Query 1: Get all sections for this page
        $sections_by_page_query = '
            SELECT ps.ID AS page_section_id, s.NAME, ps.PRIORITY,  ps.SHOW_SECTION
            FROM SECTIONS AS s
            JOIN PAGES_SECTIONS AS ps ON ps.SECTION_ID = s.ID
            JOIN PAGES AS p ON p.ID = ps.PAGE_ID
            WHERE p.NAME = :pg_name
            ORDER BY ps.PRIORITY, p.ID
            ';

        $sectionStatementResult = runQuery($db, $sections_by_page_query, ['pg_name' => $page_name]);

        $pageContentResponse = [
            'page' => $page_name,
            'page_id' => $page['ID']
        ];

        // Collect all page_section_ids for batch querying
        $pageSectionIds = array_column($sectionStatementResult, 'page_section_id');

        if (empty($pageSectionIds)) {
            $pageContentResponse['sections'] = [];
        } else {
            $psPlaceholders = implode(',', array_fill(0, count($pageSectionIds), '?'));

            // Query 2: Batch get ALL components for ALL sections at once
            $componentQuery = "
                SELECT c.NAME, c.ID as component_id, psc.ID as page_section_component_id, psc.PAGE_SECTION_ID
                FROM COMPONENTS AS c
                JOIN PAGE_SECTION_COMPONENTS AS psc ON psc.COMPONENT_ID = c.ID
                WHERE psc.PAGE_SECTION_ID IN ($psPlaceholders)
            ";
            $allComponents = runQuery($db, $componentQuery, $pageSectionIds);

            // Group components by PAGE_SECTION_ID
            $componentsBySection = [];
            $allPscIds = [];
            foreach ($allComponents as $comp) {
                $componentsBySection[$comp['PAGE_SECTION_ID']][] = $comp;
                $allPscIds[] = $comp['page_section_component_id'];
            }

            // Batch fetch all content types if there are components
            $textByPsc = [];
            $imagesByPsc = [];
            $linksByPsc = [];
            $eventsByPsc = [];

            if (!empty($allPscIds)) {
                $pscPlaceholders = implode(',', array_fill(0, count($allPscIds), '?'));

                // Query 3: Batch get ALL text content
                $textQuery = "
                    SELECT cc.ID AS component_content_id, cc.PAGE_SECTION_COMPONENTS_ID AS page_section_component_id,
                           cc.TEXT_CONTENT_ID as text_content_id,
                           tc.TXT as text
                    FROM COMPONENT_CONTENT as cc
                    JOIN TEXT_CONTENT as tc ON cc.text_content_id = tc.ID
                    WHERE cc.PAGE_SECTION_COMPONENTS_ID IN ($pscPlaceholders)
                ";
                $allText = runQuery($db, $textQuery, $allPscIds);
                foreach ($allText as $row) {
                    $textByPsc[$row['page_section_component_id']][] = $row;
                }

                // Query 4: Batch get ALL images
                $imagesQuery = "
                    SELECT cc.ID as component_content_id, cc.PAGE_SECTION_COMPONENTS_ID  as page_section_component_id,
                           cc.IMAGE_ID as image_id,
                           i.src,
                           i.ALT as alt,
                           i.IMAGE_TEXT as image_text
                    FROM COMPONENT_CONTENT as cc
                    JOIN IMAGES as i ON cc.IMAGE_ID = i.ID
                    WHERE cc.PAGE_SECTION_COMPONENTS_ID IN ($pscPlaceholders)
                ";
                $allImages = runQuery($db, $imagesQuery, $allPscIds);
                foreach ($allImages as $row) {
                    $imagesByPsc[$row['page_section_component_id']][] = $row;
                }

                // Query 5: Batch get ALL links
                $linksQuery = "
                    SELECT DISTINCT cc.ID as component_content_id, cc.PAGE_SECTION_COMPONENTS_ID as page_section_component_id,
                           cc.LINK_ID as link_id,
                           l.LINK_TEXT as link_text,
                           l.URL as link_url
                    FROM COMPONENT_CONTENT as cc
                    JOIN LINKS as l ON cc.LINK_ID = l.ID
                    WHERE cc.PAGE_SECTION_COMPONENTS_ID IN ($pscPlaceholders)
                ";
                $allLinks = runQuery($db, $linksQuery, $allPscIds);
                foreach ($allLinks as $row) {
                    $linksByPsc[$row['page_section_component_id']][] = $row;
                }

                // Query 6: Batch get ALL events
                $eventsQuery = "
                    SELECT DISTINCT cc.ID as component_content_id,
                                    cc.PAGE_SECTION_COMPONENTS_ID as page_section_component_id,
                                    cc.EVENT_ID as event_id,
                                    e.TITLE as event_title,
                                    tc.TXT as event_description,
                                    l.NAME as event_location,
                                    l.STREET_ADDRESS as event_address,
                                    l.CITY as event_city,
                                    l.STATE as event_state,
                                    l.ZIP as event_zip,
                                    l.TELEPHONE as event_telephone,
                                    l.LNG as event_lng,
                                    l.LAT as event_lat,
                                    e.EVENT_TIME as event_time
                    FROM COMPONENT_CONTENT as cc
                    JOIN EVENTS as e ON cc.EVENT_ID = e.ID
                    JOIN LOCATIONS as l ON l.ID = e.LOCATION_ID
                    JOIN TEXT_CONTENT as tc ON e.TEXT_CONTENT_ID = tc.ID
                    WHERE cc.PAGE_SECTION_COMPONENTS_ID IN ($pscPlaceholders)
                ";
                $allEvents = runQuery($db, $eventsQuery, $allPscIds);
                foreach ($allEvents as $row) {
                    $eventsByPsc[$row['page_section_component_id']][] = $row;
                }
            }

            // Assemble the response in the same structure as before
            foreach ($sectionStatementResult as $row) {
                $contentResponse = [
                    'page_section_id' => $row['page_section_id'],
                    'section_name' => $row['NAME'],
                    'show_section' => $row['SHOW_SECTION'] == 1,
                    'priority' => $row['PRIORITY']
                ];

                $sectionComponents = $componentsBySection[$row['page_section_id']] ?? [];

                foreach ($sectionComponents as $componentResult) {
                    $pscId = $componentResult['page_section_component_id'];
                    $content = [
                        'component_name' => $componentResult['NAME']
                    ];

                    if (isset($textByPsc[$pscId])) {
                        $content['textContent'] = $textByPsc[$pscId];
                    }
                    if (isset($imagesByPsc[$pscId])) {
                        $content['images'] = $imagesByPsc[$pscId];
                    }
                    if (isset($linksByPsc[$pscId])) {
                        $content['links'] = $linksByPsc[$pscId];
                    }
                    if (isset($eventsByPsc[$pscId])) {
                        $content['events'] = $eventsByPsc[$pscId];
                    }

                    $contentResponse['components'][] = $content;
                }

                $pageContentResponse['sections'][] = $contentResponse;
            }
        }

    }
    $db = null;
    writeLog('GET /pages', 'success', 'Pages retrieved.', null);
    sendResponse(200, null, $pageContentResponse);
} catch (Exception $e) {
    $db = null;
    writeLog('GET /pages', 'critical', $e->getMessage(), null);
    sendResponse(500, 'There was an error.');
    exit;
}
