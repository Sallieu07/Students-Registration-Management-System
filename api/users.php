<?php
// users.php - API endpoint for managing user accounts.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT id, username, email, role, status, last_login AS lastLogin FROM users ORDER BY username');
    echo json_encode(['success' => true, 'users' => $stmt->fetchAll()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (empty($input['username']) || empty($input['email']) || empty($input['role']) || empty($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required user fields.']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO users (username, email, role, status, password_hash, last_login) VALUES (:username, :email, :role, :status, :password, :lastLogin)');
    $stmt->execute([
        ':username'  => trim($input['username']),
        ':email'     => trim($input['email']),
        ':role'      => trim($input['role']),
        ':status'    => trim($input['status'] ?? 'Active'),
        ':password'  => password_hash($input['password'], PASSWORD_DEFAULT),
        ':lastLogin' => date('Y-m-d'),
    ]);

    echo json_encode(['success' => true, 'message' => 'User created successfully.', 'user_id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    if (empty($input['id']) || empty($input['username']) || empty($input['email']) || empty($input['role'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required user fields.']);
        exit;
    }

    if (!empty($input['password'])) {
        $stmt = $pdo->prepare('UPDATE users SET username=:username, email=:email, role=:role, status=:status, password_hash=:password WHERE id=:id');
        $stmt->execute([
            ':username' => trim($input['username']),
            ':email'    => trim($input['email']),
            ':role'     => trim($input['role']),
            ':status'   => trim($input['status'] ?? 'Active'),
            ':password' => password_hash($input['password'], PASSWORD_DEFAULT),
            ':id'       => (int)$input['id'],
        ]);
    } else {
        $stmt = $pdo->prepare('UPDATE users SET username=:username, email=:email, role=:role, status=:status WHERE id=:id');
        $stmt->execute([
            ':username' => trim($input['username']),
            ':email'    => trim($input['email']),
            ':role'     => trim($input['role']),
            ':status'   => trim($input['status'] ?? 'Active'),
            ':id'       => (int)$input['id'],
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'User updated successfully.']);
    exit;
}

if ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $deleteData);
    if (empty($deleteData['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing user id.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
    $stmt->execute([':id' => (int)$deleteData['id']]);
    echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
