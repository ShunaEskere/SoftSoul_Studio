<?php
header('Content-Type: application/json');

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
$userId = $data['user_id'] ?? null;
$newPassword = $data['new_password'] ?? null;

if (!$userId || !$newPassword) {
    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
    exit;
}

$userId = mysqli_real_escape_string($con, $userId);
$newPassword = mysqli_real_escape_string($con, $newPassword);

$query = mysqli_query($con, "UPDATE client SET passw = '$newPassword' WHERE id = '$userId'");

if ($query) {
    echo json_encode(['success' => true, 'message' => 'Пароль успешно изменен']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении: ' . mysqli_error($con)]);
}

mysqli_close($con);
?>