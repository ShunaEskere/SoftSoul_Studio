<?php
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);

if (!$con) {
    echo json_encode(['exists' => false, 'error' => 'Ошибка БД']);
    exit;
}

// Получаем email из запроса
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? mysqli_real_escape_string($con, $input['email']) : '';

if (empty($email)) {
    echo json_encode(['exists' => false, 'error' => 'Email не указан']);
    exit;
}

$query = "SELECT * FROM `client` WHERE `email` = '$email'";
$result = mysqli_query($con, $query);

if (mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);
    echo json_encode([
        'exists' => true, 
        'user' => [
            'name' => $user['name'],
            'email' => $user['email']
        ]
    ]);
} else {
    echo json_encode(['exists' => false]);
}

mysqli_close($con);
?>