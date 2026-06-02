<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);

if (!$con) {
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД']);
    exit;
}

mysqli_set_charset($con, "utf8");

$data = json_decode(file_get_contents('php://input'), true);
$userId = isset($data['user_id']) ? $data['user_id'] : null;
$newName = isset($data['new_name']) ? trim($data['new_name']) : null;

if (!$userId || !$newName) {
    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
    exit;
}

$userId = mysqli_real_escape_string($con, $userId);
$newName = mysqli_real_escape_string($con, $newName);

// Проверка на существование имени
$checkQuery = mysqli_query($con, "SELECT id FROM client WHERE name = '$newName' AND id != '$userId'");
if (mysqli_num_rows($checkQuery) > 0) {
    echo json_encode(['success' => false, 'message' => 'Это имя уже занято']);
    exit;
}

$query = mysqli_query($con, "UPDATE client SET name = '$newName' WHERE id = '$userId'");

if ($query) {
    echo json_encode(['success' => true, 'message' => 'Имя успешно обновлено']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении: ' . mysqli_error($con)]);
}

mysqli_close($con);
?>