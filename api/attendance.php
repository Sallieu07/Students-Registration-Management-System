<?php
// attendance.php - API endpoint for attendance records.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $courseId = $_GET['course_id'] ?? null;
    if (!$courseId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'course_id is required.']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT student_id, attendance_date AS date, status FROM attendance WHERE course_code = :course_code ORDER BY student_id, attendance_date');
    $stmt->execute([':course_code' => $courseId]);
    echo json_encode(['success' => true, 'attendance' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    if (empty($input['course_id']) || empty($input['date']) || empty($input['records']) || !is_array($input['records'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required attendance fields.']);
        exit;
    }

    $pdo->beginTransaction();
    $stmtDel = $pdo->prepare('DELETE FROM attendance WHERE course_code = :course_code AND attendance_date = :date');
    $stmtDel->execute([':course_code' => $input['course_id'], ':date' => $input['date']]);
    $stmtIns = $pdo->prepare('INSERT INTO attendance (course_code, student_id, attendance_date, status) VALUES (:course_code, :student_id, :date, :status)');
    foreach ($input['records'] as $studentId => $status) {
        $stmtIns->execute([
            ':course_code' => $input['course_id'],
            ':student_id'  => $studentId,
            ':date'        => $input['date'],
            ':status'      => $status,
        ]);
    }
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Attendance saved successfully.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
