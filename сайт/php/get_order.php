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

mysqli_set_charset($con, "utf8");

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Неверный ID']);
    exit;
}

$query = mysqli_query($con, "SELECT * FROM orders WHERE id = $id");

if (mysqli_num_rows($query) > 0) {
    $order = mysqli_fetch_assoc($query);
    
    echo json_encode([
        'success' => true,
        'order' => [
            'id' => $order['id'],
            'order_number' => $order['order_number'],
            'user_id' => $order['user_id'],
            'user_name' => $order['user_name'],
            'user_email' => $order['user_email'],
            'full_name' => $order['full_name'],
            'phone' => $order['phone'],
            'email' => $order['email'],
            'delivery_method' => $order['delivery_method'],
            'delivery_price' => $order['delivery_price'],
            'city' => $order['city'],
            'address' => $order['address'],
            'postal_code' => $order['postal_code'],
            'comment' => $order['comment'],
            'payment_method' => $order['payment_method'],
            'items' => json_decode($order['items'], true),
            'subtotal' => $order['subtotal'],
            'total' => $order['total'],
            'status' => $order['status'],
            'created_at' => $order['created_at']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Заказ не найден']);
}

mysqli_close($con);
?>