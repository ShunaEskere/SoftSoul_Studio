<?php
header('Content-Type: application/json');
error_reporting(0);
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);
if (!$con) {
    echo json_encode(['images' => ['images/placeholder.jpg']]);
    exit;
}
mysqli_set_charset($con, "utf8");

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    echo json_encode(['images' => ['images/placeholder.jpg']]);
    exit;
}

$query = mysqli_query($con, "SELECT image_front, image_back, image_model_front, image_model_back FROM products WHERE id = $id");
$row = mysqli_fetch_assoc($query);
$images = [];

if (!empty($row['image_front'])) {
    $images[] = $row['image_front'];
}
if (!empty($row['image_back'])) {
    $images[] = $row['image_back'];
}
if (!empty($row['image_model_front'])) {
    $images[] = $row['image_model_front'];
}
if (!empty($row['image_model_back'])) {
    $images[] = $row['image_model_back'];
}

if (empty($images)) {
    $images[] = 'images/placeholder.jpg';
}

echo json_encode(['images' => $images]);
mysqli_close($con);
?>