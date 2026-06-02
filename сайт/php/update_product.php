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

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$price = isset($_POST['price']) ? floatval($_POST['price']) : 0;
$category = isset($_POST['category']) ? $_POST['category'] : '';
$description = isset($_POST['description']) ? $_POST['description'] : '';
$sizes = isset($_POST['sizes']) ? $_POST['sizes'] : '';
$sizePrices = isset($_POST['size_prices']) ? $_POST['size_prices'] : '';
$stock = isset($_POST['stock']) ? intval($_POST['stock']) : 0;

if ($id <= 0 || empty($name) || $price <= 0) {
    echo json_encode(['success' => false, 'message' => 'Заполните обязательные поля']);
    exit;
}

$uploadDir = '../images/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

// Получаем текущие изображения
$query = mysqli_query($con, "SELECT image_front, image_back, image_model_front, image_model_back FROM products WHERE id = $id");
$current = mysqli_fetch_assoc($query);

$image_front = $current['image_front'];
$image_back = $current['image_back'];
$image_model_front = $current['image_model_front'];
$image_model_back = $current['image_model_back'];

// Функция для сохранения фото
function saveImage($file, $prefix, $id) {
    if (isset($file) && $file['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (in_array($ext, $allowed)) {
            $fileName = time() . '_' . $id . '_' . $prefix . '.' . $ext;
            $imagePath = 'images/' . $fileName;
            if (move_uploaded_file($file['tmp_name'], '../' . $imagePath)) {
                return $imagePath;
            }
        }
    }
    return null;
}

// Сохраняем новые фото
$new_front = saveImage($_FILES['image_front'] ?? null, 'front', $id);
if ($new_front) $image_front = $new_front;

$new_back = saveImage($_FILES['image_back'] ?? null, 'back', $id);
if ($new_back) $image_back = $new_back;

$new_model_front = saveImage($_FILES['image_model_front'] ?? null, 'model_front', $id);
if ($new_model_front) $image_model_front = $new_model_front;

$new_model_back = saveImage($_FILES['image_model_back'] ?? null, 'model_back', $id);
if ($new_model_back) $image_model_back = $new_model_back;

$name = mysqli_real_escape_string($con, $name);
$description = mysqli_real_escape_string($con, $description);
$category = mysqli_real_escape_string($con, $category);
$sizes = mysqli_real_escape_string($con, $sizes);
$sizePrices = mysqli_real_escape_string($con, $sizePrices);

$query = mysqli_query($con, "UPDATE products SET 
    name = '$name', 
    price = '$price', 
    category = '$category', 
    description = '$description',
    image_front = '$image_front',
    image_back = '$image_back',
    image_model_front = '$image_model_front',
    image_model_back = '$image_model_back',
    sizes = '$sizes',
    size_prices = '$sizePrices',
    stock = '$stock'
WHERE id = $id");

if ($query) {
    echo json_encode(['success' => true, 'message' => 'Товар обновлен']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка: ' . mysqli_error($con)]);
}
mysqli_close($con);
?>