<?php
header('Content-Type: application/json');
error_reporting(0);
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);
if (!$con) {
    echo json_encode(['success' => false]);
    exit;
}
mysqli_set_charset($con, "utf8");

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode(['success' => false]);
    exit;
}

$query = mysqli_query($con, "SELECT * FROM products WHERE id = $id");
if (mysqli_num_rows($query) > 0) {
    $product = mysqli_fetch_assoc($query);
    $sizePrices = [];
    if (!empty($product['size_prices'])) {
        $pairs = explode(',', $product['size_prices']);
        foreach ($pairs as $pair) {
            $parts = explode(':', $pair);
            if (count($parts) == 2) {
                $sizePrices[trim($parts[0])] = floatval($parts[1]);
            }
        }
    }
    echo json_encode(['success' => true, 'product' => [
        'id' => $product['id'],
        'name' => $product['name'],
        'price' => $product['price'],
        'description' => $product['description'],
        'category' => $product['category'],
        'image_front' => $product['image_front'] ?: 'images/placeholder.jpg',
        'image_back' => $product['image_back'],
        'image_model_front' => $product['image_model_front'],
        'image_model_back' => $product['image_model_back'],
        'sizes' => $product['sizes'],
        'size_prices' => $sizePrices,
        'stock' => $product['stock']
    ]]);
} else {
    echo json_encode(['success' => false]);
}
mysqli_close($con);
?>