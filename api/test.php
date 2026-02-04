<?php
// Enable error display
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "PHP Version: " . phpversion() . "<br>";
echo "Current Directory: " . __DIR__ . "<br>";
echo "Vendor exists: " . (file_exists(__DIR__ . '/vendor/autoload.php') ? 'YES' : 'NO') . "<br>";
echo ".env exists: " . (file_exists(__DIR__ . '/.env') ? 'YES' : 'NO') . "<br>";

// Try loading composer
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    echo "Composer loaded successfully<br>";
} else {
    echo "ERROR: Composer autoload.php not found<br>";
}

// Try loading .env
try {
    if (class_exists('Dotenv\Dotenv')) {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->safeLoad();
        echo ".env loaded successfully<br>";
        echo "DB Host: " . ($_ENV['MYSQL_HOST'] ?? 'NOT SET') . "<br>";
    }
} catch (Exception $e) {
    echo "ERROR loading .env: " . $e->getMessage() . "<br>";
}