<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
$id = isset($data['id']) ? intval($data['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Неверный ID']);
    exit;
}

$id = mysqli_real_escape_string($con, $id);
$query = mysqli_query($con, "DELETE FROM custom_orders WHERE id = '$id'");

if ($query) {
    echo json_encode(['success' => true, 'message' => 'Заявка удалена']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при удалении: ' . mysqli_error($con)]);
}

mysqli_close($con);
?>