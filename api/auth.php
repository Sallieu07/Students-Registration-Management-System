<?php
// auth.php - Simple authentication endpoint for the SRMS demo.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents('php://input'), true);
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT username, role, full_name AS name, email, password_hash FROM users WHERE username = :username LIMIT 1');
$stmt->execute([':username' => trim($data['username'])]);
$user = $stmt->fetch();

if (!$user || !password_verify($data['password'], $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

echo json_encode([
    'success' => true,
    'user' => [
        'id'              => $user['id'],
        'username'        => $user['username'],
        'role'            => $user['role'],
        'name'            => $user['name'],
        'email'           => $user['email'],
        'linkedStudentId' => $user['linked_student_id'],
    ],
]);
