<?php

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../users/user-utils.php';

$requestData = Flight::request()->data;

$requiredFieldsAndTypes = [
    'email' => 'email'
];

$validationErrors = validateRequestData(
    $requestData,
    $requiredFieldsAndTypes
);

// Missing required fields
if (count($validationErrors) > 0) {
    writeLog('POST /send_email', 'warning', 'Validation failed.');
    sendResponse(422, 'All fields are required: email.', $validationErrors);
}

$customer_email = $requestData->email ?? null;

function createEmailEntry(string $customer_email): bool
{
    try {
        $db = Flight::db();

        $email_role_check_result = getUserByEmail($db, $customer_email, 'EMAIL');

        // User already has the EMAIL role
        if (count($email_role_check_result) > 0) {
            sendResponse(500, 'Email already exists.');
        }

        $email_check_result = getUserByEmail($db, $customer_email);
        $user_id = $email_check_result[0]['id'] ?? null;

        // User is not in the db, create a new user
        if (!is_numeric($user_id) || intval($user_id) <= 0) {
            $user_id = createEmailUser($db, $customer_email);
        }

        // Re-validate user_id after createUser()
        if (!is_numeric($user_id) || intval($user_id) <= 0) {
            throw new Exception("Invalid user ID: " . var_export($user_id, true));
        }

        // Insert the new user into the USERS_ROLES tables as a EMAIL (ID = 3)
        $int_user_id = intval($user_id);
        $updated_user = updateUserRole($db, $int_user_id, 3);

        $db = null;
        return true;
    } catch (Exception $e) {
        $db = null;
        sendResponse(500, 'There was an error adding to the email list.', ['errorMessage' => $e->getMessage()]);
    }
    return false;
}

try {
    $createEmailRes = createEmailEntry($customer_email);

    if ($createEmailRes) {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->SMTPAuth = true;

        // Personal data
        $mail->Host = 'smtp.ionos.com';
        $mail->Port = 587;
        $mail->Username = Flight::get('EMAIL');
        $mail->Password = Flight::get('SMTP_PASSWORD');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

        // Sender
        $mail->setFrom(Flight::get('EMAIL'), 'Contact Form');

        // Recipient, the name can also be stated
        $mail->addAddress(Flight::get('EMAIL'), Flight::get('FORWARD_EMAIL'));
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isHTML(true);
        $mail->Subject = "Contact request generated from the Wood Valley Bees' website.";
        $mail->Body = "EMAIL:: " . $customer_email . "<br/>";
        $mail->send();
        writeLog('POST /send_email', 'success', 'Email sent.', null);
    }
} catch (Exception $e) {
    writeLog('POST /send_email', 'critical', $e->getMessage(), null);
    sendResponse(500, 'Trouble sending email, please again later.', [
        'additionalInfo' => $e->getMessage()
    ]);
}