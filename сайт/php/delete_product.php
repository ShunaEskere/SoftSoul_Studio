<?php
header('Content-Type: application/json');
error_reporting(0);
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

// Получаем пути к изображениям
$query = mysqli_query($con, "SELECT image_front, image_back, image_model_front, image_model_back FROM products WHERE id = $id");
if ($row = mysqli_fetch_assoc($query)) {
    $imageFields = ['image_front', 'image_back', 'image_model_front', 'image_model_back'];
    foreach ($imageFields as $field) {
        if (!empty($row[$field]) && file_exists('../' . $row[$field])) {
            unlink('../' . $row[$field]);
        }
    }
}

$id = mysqli_real_escape_string($con, $id);
$deleteQuery = mysqli_query($con, "DELETE FROM products WHERE id = '$id'");

if ($deleteQuery) {
    echo json_encode(['success' => true, 'message' => 'Товар удален']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при удалении']);
}
mysqli_close($con);
?>