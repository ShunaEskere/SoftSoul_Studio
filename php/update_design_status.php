<?php
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);

if (!$con) {
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? $data['id'] : 0;
$status = isset($data['status']) ? $data['status'] : '';

if ($id <= 0 || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Неверные данные']);
    exit;
}

$id = mysqli_real_escape_string($con, $id);
$status = mysqli_real_escape_string($con, $status);

$query = mysqli_query($con, "UPDATE custom_orders SET status = '$status' WHERE id = '$id'");

if ($query) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении']);
}

mysqli_close($con);
?>