<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

echo "Testing Database Connection...<br><br>";

$dbHost = $_ENV['MYSQL_HOST'];
$dbPort = $_ENV['MYSQL_PORT'] ?? '3306';
$dbName = $_ENV['MYSQL_DATABASE'];
$dbUser = $_ENV['MYSQL_USER'];
$dbPass = $_ENV['MYSQL_PASSWORD'];

echo "Host: $dbHost<br>";
echo "Port: $dbPort<br>";
echo "Database: $dbName<br>";
echo "User: $dbUser<br>";
echo "Password: " . (empty($dbPass) ? 'EMPTY' : 'SET') . "<br><br>";

try {
    $dsn = "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    echo "✅ Database connection successful!<br><br>";

    // Test a simple query
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    echo "✅ Query test successful: " . $result['test'] . "<br><br>";

    // Try to list tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables found: " . count($tables) . "<br>";
    echo "First 5 tables: " . implode(', ', array_slice($tables, 0, 5)) . "<br>";

} catch (PDOException $e) {
    echo "❌ Database connection failed!<br>";
    echo "Error: " . $e->getMessage() . "<br>";
}