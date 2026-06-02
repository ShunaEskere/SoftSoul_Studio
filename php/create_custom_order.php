<?php
header('Content-Type: application/json');
error_reporting(0);

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);
if (!$con) { echo json_encode(['success' => false, 'message' => 'Ошибка БД']); exit; }
mysqli_set_charset($con, "utf8");
$userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$userName = isset($_POST['user_name']) ? $_POST['user_name'] : '';
$userEmail = isset($_POST['user_email']) ? $_POST['user_email'] : '';
$garmentType = isset($_POST['garment_type']) ? $_POST['garment_type'] : '';
$sizeInfo = isset($_POST['size_info']) ? $_POST['size_info'] : '';
$description = isset($_POST['description']) ? $_POST['description'] : '';
$images = [];
if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
    $uploadDir = '../images/references/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION));
            $fileName = time() . '_' . uniqid() . '.' . $ext;
            move_uploaded_file($_FILES['images']['tmp_name'][$i], '../' . $uploadDir . $fileName);
            $images[] = $uploadDir . $fileName;
        }
    }
}
$userName = mysqli_real_escape_string($con, $userName);
$userEmail = mysqli_real_escape_string($con, $userEmail);
$garmentType = mysqli_real_escape_string($con, $garmentType);
$sizeInfo = mysqli_real_escape_string($con, $sizeInfo);
$description = mysqli_real_escape_string($con, $description);
$imagesJson = json_encode($images);
$query = mysqli_query($con, "INSERT INTO custom_orders (user_id, user_name, user_email, garment_type, size_info, description, images, status) VALUES ('$userId', '$userName', '$userEmail', '$garmentType', '$sizeInfo', '$description', '$imagesJson', 'pending')");
if ($query) { echo json_encode(['success' => true, 'message' => 'Заявка отправлена']); }
else { echo json_encode(['success' => false, 'message' => 'Ошибка отправки']); }
mysqli_close($con);
?>