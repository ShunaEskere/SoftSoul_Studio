<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'softt';

$con = mysqli_connect($host, $username, $password, $dbname);

if (!$con) {
    echo json_encode(['success' => false, 'cards' => []]);
    exit;
}

mysqli_set_charset($con, "utf8");

$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($userId <= 0) {
    echo json_encode(['success' => false, 'cards' => []]);
    exit;
}

$query = mysqli_query($con, "SELECT * FROM saved_cards WHERE user_id = $userId ORDER BY is_default DESC, id DESC");
$cards = [];

while ($row = mysqli_fetch_assoc($query)) {
    $cards[] = [
        'id' => $row['id'],
        'card_number' => $row['card_number'],
        'masked_number' => $row['masked_number'],
        'card_holder' => $row['card_holder'],
        'expiry_date' => $row['expiry_date'],
        'card_brand' => $row['card_brand'],
        'is_default' => $row['is_default']
    ];
}

echo json_encode(['success' => true, 'cards' => $cards]);

mysqli_close($con);
?>