<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'softt';

$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8");

$data = json_decode(file_get_contents('php://input'), true);
$userId = isset($data['user_id']) ? intval($data['user_id']) : 0;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Не передан ID пользователя']);
    exit;
}

// Удаляем пользователя из БД
$stmt = $conn->prepare("DELETE FROM client WHERE id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Аккаунт успешно удалён']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при удалении: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>