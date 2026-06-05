<?php
header('Content-Type: text/plain; charset=utf-8');

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'softt';

$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8");

$loginName = $_POST['loginName'] ?? '';
$loginPassword = $_POST['loginPassword'] ?? '';

$result = $conn->query("SELECT * FROM client WHERE name='$loginName' OR email='$loginName'");

if ($row = $result->fetch_assoc()) {
    if ($row['passw'] === $loginPassword) {
        echo "success|" . $row['id'] . "|" . $row['name'] . "|" . $row['email'];
    } else {
        echo "wrong_password";
    }
} else {
    echo "user_not_found";
}
?>