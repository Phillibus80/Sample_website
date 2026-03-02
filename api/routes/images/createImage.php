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
        writeLog('POST /images', 'warning', 'Validation failed.', $decodedToken->user->username);
        sendResponse(422, 'All fields are required: image_text and alt, and file binaries..', $validationErrors);
    }
} else {
    writeLog('POST /images', 'warning', 'Missing image file.', $decodedToken->user->username);
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
    $originalFileName = basename($_FILES['image_file']['name']);
    $imageFileType = strtolower(pathinfo($originalFileName, PATHINFO_EXTENSION));

    // Convert filename to kebab-case
    $fileNameWithoutExt = pathinfo($originalFileName, PATHINFO_FILENAME);
    $kebabFileName = toKebabCase($fileNameWithoutExt);
    $target_file = $target_dir . $kebabFileName . '.' . $imageFileType;

    $check = getimagesize($_FILES['image_file']['tmp_name']);
    if ($check === false) {
        writeLog('POST /images', 'warning', 'Uploaded file is not an image.', $decodedToken->user->username);
        sendResponse(400, 'File is not an image.');
    }

    if (file_exists($target_file)) {
        writeLog('POST /images', 'critical', 'File already exists.', $decodedToken->user->username);
        sendResponse(400, 'Sorry, file already exists.');
    }

    if ($_FILES['image_file']['size'] > 5242880) {
        writeLog('POST /images', 'warning', 'Uploaded file is too large.', $decodedToken->user->username);
        sendResponse(400, 'Sorry, your file is too large.');
    }

    $allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'webp'];
    if (!in_array($imageFileType, $allowedFileTypes)) {
        writeLog('POST /images', 'warning', 'Invalid file type.', $decodedToken->user->username);
        sendResponse(400, 'Sorry, only JPG, JPEG, PNG, ICO, WEBP & GIF files are allowed.');
    }

    // Compress and save the image
    $compressionQuality = 85; // Adjust quality (0-100, higher = better quality)
    $compressed = false;

    // Check if GD extension is available
    if (!extension_loaded('gd')) {
        // Fallback: save without compression if GD is not available
        $compressed = move_uploaded_file($_FILES['image_file']['tmp_name'], $target_file);
    } else {
        switch ($imageFileType) {
            case 'jpg':
            case 'jpeg':
                $image = @imagecreatefromjpeg($_FILES['image_file']['tmp_name']);
                if ($image) {
                    $compressed = imagejpeg($image, $target_file, $compressionQuality);
                    imagedestroy($image);
                }
                break;

            case 'png':
                $image = @imagecreatefrompng($_FILES['image_file']['tmp_name']);
                if ($image) {
                    // PNG compression level (0-9, where 9 is maximum compression)
                    $pngCompression = 6;
                    $compressed = imagepng($image, $target_file, $pngCompression);
                    imagedestroy($image);
                }
                break;

            case 'gif':
                $image = @imagecreatefromgif($_FILES['image_file']['tmp_name']);
                if ($image) {
                    $compressed = imagegif($image, $target_file);
                    imagedestroy($image);
                }
                break;

            case 'webp':
                $image = @imagecreatefromwebp($_FILES['image_file']['tmp_name']);
                if ($image) {
                    $compressed = imagewebp($image, $target_file, $compressionQuality);
                    imagedestroy($image);
                }
                break;

            case 'ico':
                // ICO files don't support compression via GD, move as-is
                $compressed = move_uploaded_file($_FILES['image_file']['tmp_name'], $target_file);
                break;

            default:
                $compressed = false;
        }
    }

    if ($compressed) {
        $statement = runQuery($db, $createImageQuery, [
            $requestData->image_text,
            '/api/' . $target_file,
            $requestData->alt ?? ''
        ]);

        writeLog('POST /images', 'success', 'Image created.', $decodedToken->user->username);
        sendResponse(200, 'The file has been uploaded.');
    } else {
        sendResponse(500, 'Sorry, there was an error uploading your file.');
    }
} catch (Exception $e) {
    $db = null;
    writeLog('POST /images', 'critical', $e->getMessage(), $decodedToken->user->username);
    sendResponse(500, 'Sorry, there was an error uploading your file.');
}
