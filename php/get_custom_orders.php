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

$result = mysqli_query($con, "SELECT * FROM custom_orders ORDER BY id DESC");
$orders = [];

while ($row = mysqli_fetch_assoc($result)) {
    // Декодируем изображения
    $images = $row['images'];
    if ($images && is_string($images) && strpos($images, '[') === 0) {
        $images = json_decode($images, true);
    } else {
        $images = $images ? [$images] : [];
    }
    
    $orders[] = [
        'id' => $row['id'],
        'user_id' => $row['user_id'],
        'user_name' => $row['user_name'],
        'user_email' => $row['user_email'],
        'garment_type' => $row['garment_type'],
        'size_info' => $row['size_info'],
        'color_preferences' => $row['color_preferences'],
        'material_preferences' => $row['material_preferences'],
        'description' => $row['description'],
        'additional_notes' => $row['additional_notes'],
        'images' => $images,
        'status' => $row['status'],
        'created_at' => $row['created_at']
    ];
}

echo json_encode(['success' => true, 'orders' => $orders]);

mysqli_close($con);
?>