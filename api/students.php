<?php
// students.php - API endpoint for managing student records.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT student_id, full_name AS name, age, grade, gpa, attendance, status FROM students ORDER BY student_id');
    echo json_encode(['success' => true, 'students' => $stmt->fetchAll()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (empty($input['name']) || empty($input['age']) || empty($input['grade']) || empty($input['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required student fields.']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO students (full_name, age, grade, gpa, attendance, status) VALUES (:name, :age, :grade, :gpa, :attendance, :status)');
    $stmt->execute([
        ':name'       => trim($input['name']),
        ':age'        => (int)$input['age'],
        ':grade'      => trim($input['grade']),
        ':gpa'        => isset($input['gpa']) ? (float)$input['gpa'] : 0.0,
        ':attendance' => isset($input['attendance']) ? (int)$input['attendance'] : 0,
        ':status'     => trim($input['status']),
    ]);

    $insertId = $pdo->lastInsertId();
    $studentId = 'STU' . str_pad($insertId, 3, '0', STR_PAD_LEFT);
    $stmt = $pdo->prepare('UPDATE students SET student_id = :student_id WHERE id = :id');
    $stmt->execute([':student_id' => $studentId, ':id' => $insertId]);

    echo json_encode(['success' => true, 'message' => 'Student created successfully.', 'student_id' => $studentId]);
    exit;
}

if ($method === 'PUT') {
    if (empty($input['id']) || empty($input['name']) || empty($input['age']) || empty($input['grade']) || empty($input['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required student fields.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE students SET full_name = :name, age = :age, grade = :grade, gpa = :gpa, attendance = :attendance, status = :status WHERE student_id = :id');
    $stmt->execute([
        ':name'       => trim($input['name']),
        ':age'        => (int)$input['age'],
        ':grade'      => trim($input['grade']),
        ':gpa'        => isset($input['gpa']) ? (float)$input['gpa'] : 0.0,
        ':attendance' => isset($input['attendance']) ? (int)$input['attendance'] : 0,
        ':status'     => trim($input['status']),
        ':id'         => trim($input['id']),
    ]);

    echo json_encode(['success' => true, 'message' => 'Student updated successfully.']);
    exit;
}

if ($method === 'DELETE') {
    $deleteData = json_decode(file_get_contents('php://input'), true);
    if (!$deleteData) {
        parse_str(file_get_contents('php://input'), $deleteData);
    }
    if (empty($deleteData['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing student id.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM students WHERE student_id = :id');
    $stmt->execute([':id' => trim($deleteData['id'])]);
    echo json_encode(['success' => true, 'message' => 'Student deleted successfully.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);

