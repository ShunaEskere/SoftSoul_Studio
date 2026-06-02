<?php
header('Content-Type: application/json');
error_reporting(0);

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);
if (!$con) {
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД']);
    exit;
}
mysqli_set_charset($con, "utf8");

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
$category = isset($_POST['category']) ? $_POST['category'] : '';
$description = isset($_POST['description']) ? $_POST['description'] : '';
$sizes = isset($_POST['sizes']) ? $_POST['sizes'] : '';
$sizePrices = isset($_POST['size_prices']) ? $_POST['size_prices'] : '';
$stock = isset($_POST['stock']) ? intval($_POST['stock']) : 0;

if (empty($name) || $price <= 0) {
    echo json_encode(['success' => false, 'message' => 'Заполните обязательные поля']);
    exit;
}

$uploadDir = '../images/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$image_front = '';
$image_back = '';
$image_model_front = '';
$image_model_back = '';

if (isset($_FILES['image_front']) && $_FILES['image_front']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['image_front']['name'], PATHINFO_EXTENSION));
    $fileName = time() . '_front.' . $ext;
    $imagePath = 'images/' . $fileName;
    move_uploaded_file($_FILES['image_front']['tmp_name'], '../' . $imagePath);
    $image_front = $imagePath;
}
if (isset($_FILES['image_back']) && $_FILES['image_back']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['image_back']['name'], PATHINFO_EXTENSION));
    $fileName = time() . '_back.' . $ext;
    $imagePath = 'images/' . $fileName;
    move_uploaded_file($_FILES['image_back']['tmp_name'], '../' . $imagePath);
    $image_back = $imagePath;
}
if (isset($_FILES['image_model_front']) && $_FILES['image_model_front']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['image_model_front']['name'], PATHINFO_EXTENSION));
    $fileName = time() . '_model_front.' . $ext;
    $imagePath = 'images/' . $fileName;
    move_uploaded_file($_FILES['image_model_front']['tmp_name'], '../' . $imagePath);
    $image_model_front = $imagePath;
}
if (isset($_FILES['image_model_back']) && $_FILES['image_model_back']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['image_model_back']['name'], PATHINFO_EXTENSION));
    $fileName = time() . '_model_back.' . $ext;
    $imagePath = 'images/' . $fileName;
    move_uploaded_file($_FILES['image_model_back']['tmp_name'], '../' . $imagePath);
    $image_model_back = $imagePath;
}

$name = mysqli_real_escape_string($con, $name);
$description = mysqli_real_escape_string($con, $description);
$category = mysqli_real_escape_string($con, $category);
$sizes = mysqli_real_escape_string($con, $sizes);
$sizePrices = mysqli_real_escape_string($con, $sizePrices);

$query = mysqli_query($con, "INSERT INTO products (name, price, description, category, 
    image_front, image_back, image_model_front, image_model_back, sizes, size_prices, stock) 
    VALUES ('$name', '$price', '$description', '$category', 
    '$image_front', '$image_back', '$image_model_front', '$image_model_back', 
    '$sizes', '$sizePrices', '$stock')");

if ($query) {
    echo json_encode(['success' => true, 'message' => 'Товар добавлен']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка: ' . mysqli_error($con)]);
}
mysqli_close($con);
?>