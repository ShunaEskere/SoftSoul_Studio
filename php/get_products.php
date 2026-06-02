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
    echo json_encode(['success' => false, 'products' => []]);
    exit;
}
mysqli_set_charset($con, "utf8");

$result = mysqli_query($con, "SELECT * FROM products ORDER BY id DESC");
$products = [];

while ($row = mysqli_fetch_assoc($result)) {
    // Проверяем какая колонка содержит фото
    $mainImage = 'images/placeholder.jpg';
    if (!empty($row['image_front'])) {
        $mainImage = $row['image_front'];
    } elseif (!empty($row['image'])) {
        $mainImage = $row['image'];
    }
    
    $products[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'price' => $row['price'],
        'description' => $row['description'],
        'category' => $row['category'],
        'image_front' => $mainImage,
        'image' => $mainImage,  // Добавляем для совместимости
        'image_back' => $row['image_back'],
        'image_model_front' => $row['image_model_front'],
        'image_model_back' => $row['image_model_back'],
        'sizes' => $row['sizes'],
        'stock' => $row['stock']
    ];
}

echo json_encode(['success' => true, 'products' => $products]);
mysqli_close($con);
?>