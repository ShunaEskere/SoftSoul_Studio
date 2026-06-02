<?php
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

// Подключение к БД
$con = mysqli_connect($host, $username, $password, $dbname);

if (!$con) {
    die("Ошибка подключения: " . mysqli_connect_error());
}

// Получаем данные из формы
$name = $_POST["registerName"];
$email = $_POST["registerEmail"];
$pass = $_POST["registerPassword"];

// Защита от SQL-инъекций
$name = mysqli_real_escape_string($con, $name);
$email = mysqli_real_escape_string($con, $email);

// Хешируем пароль!
$hashed_password = password_hash($pass, PASSWORD_DEFAULT);

// Проверка, существует ли уже такой email
$check_query = "SELECT * FROM `client` WHERE `email` = '$email'";
$check_result = mysqli_query($con, $check_query);

if (mysqli_num_rows($check_result) > 0) {
    // Пользователь уже существует
    echo '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Ошибка регистрации</title>
        <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .error { color: red; border: 2px solid red; padding: 20px; display: inline-block; border-radius: 10px; }
            a { display: inline-block; margin-top: 20px; color: #667eea; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="error">
            <h2>❌ Пользователь с таким email уже существует!</h2>
            <a href="index.html">← Вернуться на главную</a>
        </div>
    </body>
    </html>
    ';
    exit;
}

// Запрос на добавление
$query = "INSERT INTO `client` (`id`, `name`, `email`, `passw`) VALUES (NULL, '$name', '$email', '$hashed_password')";

if (mysqli_query($con, $query)) {
    // Успешная регистрация — автоматически создаём сессию
    session_start();
    $_SESSION['user_id'] = mysqli_insert_id($con);
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email'] = $email;
    
    // Перенаправляем на главную с уже авторизованным пользователем
    header("Location: Main.html");
    exit;
} else {
    echo '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Ошибка</title>
        <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .error { color: red; border: 2px solid red; padding: 20px; display: inline-block; border-radius: 10px; }
        </style>
    </head>
    <body>
        <div class="error">
            <h2>❌ Ошибка регистрации</h2>
            <p>' . mysqli_error($con) . '</p>
        </div>
    </body>
    </html>
    ';
}

mysqli_close($con);
?>