<?php
/**
 * @param $db
 * @return void
 */
function getEvents($db): void
{
    try {
        $statement = 'SELECT e.ID as event_id, 
                            e.TITLE as event_title,
                            tc.TXT as event_description,
                            l.NAME as location_name,
                            l.STREET_ADDRESS as location_address,
                            l.CITY as location_city,
                            l.STATE as location_state,
                            l.ZIP as location_zip,
                            l.telephone as location_telephone,
                            l.lat as location_lat,
                            l.lng as location_lng,
                            e.EVENT_TIME as event_time
                      FROM EVENTS e
                      JOIN LOCATIONS AS l ON l.ID = e.LOCATION_ID
                      JOIN TEXT_CONTENT AS tc on e.TEXT_CONTENT_ID = tc.ID
                      ';
        $response = runQuery($db, $statement, null);
        $getTextContentResponse = [];
        foreach ($response as $row) {
            $getTextContentResponse[] = array(
                'id' => $row['event_id'],
                'title' => $row['event_title'],
                'description' => $row['event_description'],
                'location' => $row['location_name'],
                'address' => $row['location_address'],
                'city' => $row['location_city'],
                'state' => $row['location_state'],
                'zip' => $row['location_zip'],
                'telephone' => $row['location_telephone'],
                'lat' => $row['location_lat'],
                'lng' => $row['location_lng'],
                'event_time' => $row['event_time']
            );
        }
        $db = null;
        sendResponse(200, null, [
            'count' => count($response),
            'data' => $getTextContentResponse
        ]);
    } catch (Exception $e) {
        sendResponse(500, 'There was an error.');
        exit;
    }
}