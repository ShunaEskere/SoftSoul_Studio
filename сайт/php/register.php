<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'softt';

$conn = new mysqli($host, $user, $pass, $db);

$name = $_POST['registerName'] ?? '';
$email = $_POST['registerEmail'] ?? '';
$password = $_POST['registerPassword'] ?? '';

if ($name && $email && $password) {
    $conn->query("INSERT INTO client (name, email, passw) VALUES ('$name', '$email', '$password')");
    echo "Регистрация успешна! Теперь войдите.";
} else {
    echo "Ошибка: заполните все поля";
}
?>