<?php
// Включаем отображение ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Подключаемся к БД
$host = 'sql201.infinityfree.com';
$username = 'if0_42027362';
$password = 'VCTy4QzRPFh';
$dbname = 'if0_42027362_softsoul';

$con = mysqli_connect($host, $username, $password, $dbname);

// Принудительно устанавливаем заголовок JSON
header('Content-Type: application/json');

if (!$con) {
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД: ' . mysqli_connect_error()]);
    exit;
}

mysqli_set_charset($con, "utf8mb4");

// Получаем данные
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных для обработки. Получено: ' . $input]);
    exit;
}

$userId = isset($data['userId']) ? intval($data['userId']) : 0;
$userName = isset($data['userName']) ? $data['userName'] : '';
$userEmail = isset($data['userEmail']) ? $data['userEmail'] : '';
$fullName = isset($data['fullName']) ? $data['fullName'] : '';
$phone = isset($data['phone']) ? $data['phone'] : '';
$email = isset($data['email']) ? $data['email'] : '';
$deliveryMethod = isset($data['deliveryMethod']) ? $data['deliveryMethod'] : '';
$deliveryPrice = isset($data['deliveryPrice']) ? floatval($data['deliveryPrice']) : 0;
$city = isset($data['city']) ? $data['city'] : '';
$address = isset($data['address']) ? $data['address'] : '';
$comment = isset($data['comment']) ? $data['comment'] : '';
$items = isset($data['items']) ? json_encode($data['items'], JSON_UNESCAPED_UNICODE) : '';
$subtotal = isset($data['subtotal']) ? floatval($data['subtotal']) : 0;
$total = isset($data['total']) ? floatval($data['total']) : 0;

$orderNumber = 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);

// Экранирование
$userName = mysqli_real_escape_string($con, $userName);
$userEmail = mysqli_real_escape_string($con, $userEmail);
$fullName = mysqli_real_escape_string($con, $fullName);
$phone = mysqli_real_escape_string($con, $phone);
$email = mysqli_real_escape_string($con, $email);
$city = mysqli_real_escape_string($con, $city);
$address = mysqli_real_escape_string($con, $address);
$comment = mysqli_real_escape_string($con, $comment);
$items = mysqli_real_escape_string($con, $items);

$query = mysqli_query($con, "INSERT INTO orders (order_number, user_id, user_name, user_email, full_name, phone, email, delivery_method, delivery_price, city, address, comment, items, subtotal, total, status) 
    VALUES ('$orderNumber', '$userId', '$userName', '$userEmail', '$fullName', '$phone', '$email', '$deliveryMethod', '$deliveryPrice', '$city', '$address', '$comment', '$items', '$subtotal', '$total', 'pending')");

if ($query) {
    echo json_encode(['success' => true, 'message' => 'Заказ создан', 'order_id' => mysqli_insert_id($con)]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка БД: ' . mysqli_error($con)]);
}

mysqli_close($con);
?>