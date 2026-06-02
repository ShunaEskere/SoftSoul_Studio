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
    echo json_encode(['success' => false, 'orders' => []]);
    exit;
}

mysqli_set_charset($con, "utf8");

$result = mysqli_query($con, "SELECT * FROM orders ORDER BY id DESC");
$orders = [];

while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = [
        'id' => $row['id'],
        'order_number' => $row['order_number'],
        'user_id' => $row['user_id'],
        'user_name' => $row['user_name'],
        'user_email' => $row['user_email'],
        'full_name' => $row['full_name'],
        'phone' => $row['phone'],
        'email' => $row['email'],
        'delivery_method' => $row['delivery_method'],
        'delivery_price' => $row['delivery_price'],
        'city' => $row['city'],
        'address' => $row['address'],
        'postal_code' => $row['postal_code'],
        'comment' => $row['comment'],
        'payment_method' => $row['payment_method'],
        'items' => json_decode($row['items'], true),
        'subtotal' => $row['subtotal'],
        'total' => $row['total'],
        'status' => $row['status'],
        'created_at' => $row['created_at']
    ];
}

echo json_encode(['success' => true, 'orders' => $orders]);

mysqli_close($con);
?>