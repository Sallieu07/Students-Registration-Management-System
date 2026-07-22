<?php
// courses.php - API endpoint for managing courses.
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT course_name AS name, course_code AS id, department AS dept, credits, instructor, enrolled, schedule, subjects FROM courses ORDER BY course_code');
    $courses = $stmt->fetchAll();
    foreach ($courses as &$course) {
        if (is_string($course['subjects'])) {
            $course['subjects'] = json_decode($course['subjects'], true) ?: [];
        }
    }
    echo json_encode(['success' => true, 'courses' => $courses]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
    exit;
}

if ($method === 'POST') {
    if (empty($input['name']) || empty($input['code']) || empty($input['dept']) || empty($input['credits']) || empty($input['instructor']) || empty($input['schedule'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required course fields.']);
        exit;
    }

    $subjects = isset($input['subjects']) ? json_encode($input['subjects']) : json_encode([]);

    $stmt = $pdo->prepare('INSERT INTO courses (course_name, course_code, department, credits, instructor, enrolled, schedule, subjects) VALUES (:name, :code, :dept, :credits, :instructor, :enrolled, :schedule, :subjects)');
    $stmt->execute([
        ':name'       => trim($input['name']),
        ':code'       => strtoupper(trim($input['code'])),
        ':dept'       => trim($input['dept']),
        ':credits'    => (int)$input['credits'],
        ':instructor' => trim($input['instructor']),
        ':enrolled'   => isset($input['enrolled']) ? (int)$input['enrolled'] : 0,
        ':schedule'   => trim($input['schedule']),
        ':subjects'   => $subjects,
    ]);

    echo json_encode(['success' => true, 'message' => 'Course created successfully.', 'course_id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    if (empty($input['id']) || empty($input['name']) || empty($input['dept']) || empty($input['credits']) || empty($input['instructor']) || empty($input['schedule'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required course fields.']);
        exit;
    }

    $oldCode = trim($input['id']);
    $newCode = strtoupper(trim($input['code'] ?? $oldCode));

    $stmt = $pdo->prepare('UPDATE courses SET course_name = :name, course_code = :new_code, department = :dept, credits = :credits, instructor = :instructor, enrolled = :enrolled, schedule = :schedule WHERE course_code = :old_code');
    $stmt->execute([
        ':name'       => trim($input['name']),
        ':new_code'   => $newCode,
        ':dept'       => trim($input['dept']),
        ':credits'    => (int)$input['credits'],
        ':instructor' => trim($input['instructor']),
        ':enrolled'   => isset($input['enrolled']) ? (int)$input['enrolled'] : 0,
        ':schedule'   => trim($input['schedule']),
        ':old_code'   => $oldCode,
    ]);

    echo json_encode(['success' => true, 'message' => 'Course updated successfully.']);
    exit;
}

if ($method === 'DELETE') {
    $deleteData = json_decode(file_get_contents('php://input'), true);
    if (!$deleteData) {
        parse_str(file_get_contents('php://input'), $deleteData);
    }
    if (empty($deleteData['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing course id.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM courses WHERE course_code = :id');
    $stmt->execute([':id' => trim($deleteData['id'])]);
    echo json_encode(['success' => true, 'message' => 'Course deleted successfully.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
