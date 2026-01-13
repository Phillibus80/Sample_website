<?php

require_once __DIR__ . '/../../utils.php';

// Validate the request data
$requestData = Flight::request()->data;

if (isset($_FILES['image_file'])) {
    $requiredFieldsAndTypes = [
        'image_text' => 'string',
        'alt' => 'string'
    ];

    $validationErrors = validateRequestData(
        $requestData,
        $requiredFieldsAndTypes
    );

    // Missing required fields
    if (count($validationErrors) > 0) {
        sendResponse(422, 'All fields are required: image_text and alt, and file binaries..', $validationErrors);
    }
} else {
    sendResponse(400, 'All fields are required: image_text, and alt.');
}

try {
    $db = Flight::db();
    $createImageQuery = '
            INSERT INTO IMAGES (image_text, src, alt)
            VALUES (?, ?, ?)
            ';

    // Creating an image entry with a new image file
    $target_dir = 'img/';
    $target_file = $target_dir . basename($_FILES['image_file']['name']);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    $check = getimagesize($_FILES['image_file']['tmp_name']);
    if ($check === false) {
        sendResponse(400, 'File is not an image.');
    }

    if (file_exists($target_file)) {
        sendResponse(400, 'Sorry, file already exists.');
    }

    if ($_FILES['image_file']['size'] > 500000) {
        sendResponse(400, 'Sorry, your file is too large.');
    }

    $allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'webp'];
    if (!in_array($imageFileType, $allowedFileTypes)) {
        sendResponse(400, 'Sorry, only JPG, JPEG, PNG, ICO, WEBP & GIF files are allowed.');
    }

    if (move_uploaded_file($_FILES['image_file']['tmp_name'], $target_file)) {
        $statement = runQuery($db, $createImageQuery, [
            $requestData->image_text,
            '/api/' . $target_file,
            $requestData->alt ?? ''
        ]);

        sendResponse(200, 'The file has been uploaded.');
    } else {
        sendResponse(500, 'Sorry, there was an error uploading your file.');
    }
} catch (Exception $e) {
    $db = null;
    sendResponse(500, 'Sorry, there was an error uploading your file.');
}
