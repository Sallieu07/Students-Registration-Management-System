<?php
// results.php - API endpoint for student results.
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
    $stmt = $pdo->prepare('SELECT student_id, score, grade FROM results WHERE course_id = :course_id ORDER BY student_id');
    $stmt->execute([':course_id' => $courseId]);
    echo json_encode(['success' => true, 'results' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    if (empty($input['course_id']) || empty($input['records']) || !is_array($input['records'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required results fields.']);
        exit;
    }

    $pdo->beginTransaction();
    $stmtDel = $pdo->prepare('DELETE FROM results WHERE course_id = :course_id');
    $stmtDel->execute([':course_id' => $input['course_id']]);
    $stmtIns = $pdo->prepare('INSERT INTO results (course_id, student_id, score, grade) VALUES (:course_id, :student_id, :score, :grade)');
    foreach ($input['records'] as $studentId => $record) {
        $stmtIns->execute([
            ':course_id'  => $input['course_id'],
            ':student_id' => $studentId,
            ':score'      => (int)$record['score'],
            ':grade'      => trim($record['grade']),
        ]);
    }
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Results saved successfully.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
