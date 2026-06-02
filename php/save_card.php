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
    echo json_encode(['success' => false, 'message' => 'Ошибка подключения к БД']);
    exit;
}

mysqli_set_charset($con, "utf8");

$data = json_decode(file_get_contents('php://input'), true);

$userId = isset($data['user_id']) ? intval($data['user_id']) : 0;
$cardNumber = isset($data['card_number']) ? preg_replace('/\s+/', '', $data['card_number']) : '';
$cardHolder = isset($data['card_holder']) ? $data['card_holder'] : '';
$expiryDate = isset($data['expiry_date']) ? $data['expiry_date'] : '';
$saveCard = isset($data['save_card']) ? $data['save_card'] : false;

if ($userId <= 0 || empty($cardNumber) || empty($cardHolder) || empty($expiryDate)) {
    echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
    exit;
}

// Определение бренда карты по номеру
function detectCardBrand($number) {
    $firstDigit = substr($number, 0, 1);
    $firstTwo = substr($number, 0, 2);
    $firstFour = substr($number, 0, 4);
    
    if ($firstDigit == '4') return 'Visa';
    if ($firstTwo >= '51' && $firstTwo <= '55') return 'Mastercard';
    if ($firstTwo >= '22' && $firstTwo <= '27') return 'Mastercard';
    if ($firstTwo == '34' || $firstTwo == '37') return 'American Express';
    if ($firstFour == '6011' || substr($number, 0, 3) >= '644' && substr($number, 0, 3) <= '649' || $firstTwo == '65') return 'Discover';
    if ($firstTwo == '36') return 'Diners Club';
    if ($firstTwo == '30' || $firstTwo == '38' || $firstFour == '3095') return 'Diners Club';
    if ($firstFour == '3528' || $firstFour == '3589') return 'JCB';
    if ($firstTwo == '50' || $firstTwo == '56' || $firstTwo == '57' || $firstTwo == '58') return 'Maestro';
    if ($firstTwo == '60') return 'Discover';
    if ($firstTwo == '62') return 'China UnionPay';
    if ($firstDigit == '2') return 'Mir';
    
    return 'Unknown';
}

$cardBrand = detectCardBrand($cardNumber);
$maskedNumber = '**** ' . substr($cardNumber, -4);

$cardNumber = mysqli_real_escape_string($con, $cardNumber);
$cardHolder = mysqli_real_escape_string($con, $cardHolder);
$expiryDate = mysqli_real_escape_string($con, $expiryDate);
$cardBrand = mysqli_real_escape_string($con, $cardBrand);
$maskedNumber = mysqli_real_escape_string($con, $maskedNumber);

$query = mysqli_query($con, "INSERT INTO saved_cards (user_id, card_number, card_holder, expiry_date, card_brand, masked_number) 
                            VALUES ('$userId', '$cardNumber', '$cardHolder', '$expiryDate', '$cardBrand', '$maskedNumber')");

if ($query) {
    echo json_encode([
        'success' => true, 
        'message' => 'Карта сохранена',
        'card_id' => mysqli_insert_id($con),
        'card_brand' => $cardBrand,
        'masked_number' => $maskedNumber
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении карты']);
}

mysqli_close($con);
?>