-- db_setup.sql - SRMS database schema and sample seed data

CREATE DATABASE IF NOT EXISTS srms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE srms;

DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id VARCHAR(10) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  age TINYINT UNSIGNED NOT NULL,
  grade VARCHAR(30) NOT NULL,
  gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  attendance TINYINT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(120) NOT NULL,
  department VARCHAR(80) NOT NULL,
  credits TINYINT UNSIGNED NOT NULL DEFAULT 3,
  instructor VARCHAR(120) NOT NULL,
  enrolled SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  schedule VARCHAR(120) NOT NULL,
  subjects JSON NOT NULL,
  PRIMARY KEY (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  linked_student_id VARCHAR(10) DEFAULT NULL,
  last_login DATE DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_code VARCHAR(20) NOT NULL,
  student_id VARCHAR(10) NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(10) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_attendance (course_code, student_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE results (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_code VARCHAR(20) NOT NULL,
  student_id VARCHAR(10) NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  grade VARCHAR(2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_result (course_code, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO students (student_id, full_name, age, grade, gpa, attendance, status) VALUES
('STU001', 'Emma Johnson', 20, 'Year 2', 3.80, 95, 'Active'),
('STU002', 'Michael Chen', 19, 'Year 1', 3.60, 92, 'Active'),
('STU003', 'Sarah Williams', 21, 'Year 3', 3.90, 98, 'Active'),
('STU004', 'James Brown', 20, 'Year 2', 3.50, 88, 'Active'),
('STU005', 'Olivia Martinez', 19, 'Year 1', 3.70, 94, 'Active'),
('STU006', 'Daniel Lee', 22, 'Year 4', 3.85, 96, 'Active');

INSERT INTO courses (course_code, course_name, department, credits, instructor, enrolled, schedule, subjects) VALUES
('CS101', 'Computer Science', 'Engineering', 4, 'Dr. Robert Smith', 45, 'Mon, Wed, Fri - 9:00 AM', JSON_ARRAY('Programming Fundamentals','Data Structures','Algorithms','Software Engineering')),
('BA201', 'Business Administration', 'Business', 3, 'Prof. Jennifer Davis', 52, 'Tue, Thu - 10:30 AM', JSON_ARRAY('Management Principles','Marketing','Financial Accounting','Business Strategy')),
('BIO301', 'Biology', 'Science', 4, 'Dr. Amanda Wilson', 38, 'Mon, Wed - 2:00 PM', JSON_ARRAY('Cell Biology','Genetics','Ecology','Biochemistry')),
('ME401', 'Mechanical Engineering', 'Engineering', 4, 'Prof. David Kumar', 41, 'Tue, Thu, Fri - 1:00 PM', JSON_ARRAY('Thermodynamics','Fluid Mechanics','CAD Design','Materials Science')),
('PSY101', 'Psychology', 'Social Sciences', 3, 'Dr. Lisa Carter', 60, 'Mon, Wed - 11:00 AM', JSON_ARRAY('Intro to Psychology','Cognitive Science','Social Psychology','Research Methods')),
('MATH201', 'Mathematics', 'Science', 4, 'Prof. Mark Johnson', 50, 'Mon, Tue, Thu - 1:00 PM', JSON_ARRAY('Calculus','Linear Algebra','Statistics','Differential Equations'));

INSERT INTO users (username, email, role, status, password_hash, full_name, linked_student_id, last_login) VALUES
('admin', 'admin@school.edu', 'Administrator', 'Active', '$2y$10$K7Zhm1g8lYaTBmfNNRm15e9qAfgSaAG587psNo86ukYz.mwZ8rPqy', 'Admin User', NULL, '2026-07-08'),
('staff', 'staff@school.edu', 'Academic Staff', 'Active', '$2y$10$d.BoWQjYNJ6s58Ox3iq9EurGB/oIFriDMm9Sid2eSf2kNix4wBjsW', 'Academic Staff', NULL, '2026-07-08'),
('lecturer', 'lecturer@school.edu', 'Lecturer', 'Active', '$2y$10$n6bamVy7Alut2HuUWE8/D.yB4fOoYfdRTtSMNiPwOWDkQEkhUNkFS', 'Lecturer User', NULL, '2026-07-08'),
('student', 'student@school.edu', 'Student', 'Active', '$2y$10$4RO96WnR2my8EchY9k94v.tDfVCmilnFQh7X/mEBipvsPHwoFy2Ya', 'Student User', 'STU004', '2026-07-08');

INSERT INTO attendance (course_code, student_id, attendance_date, status) VALUES
('CS101', 'STU001', '2026-07-08', 'Present'),
('CS101', 'STU002', '2026-07-08', 'Present'),
('CS101', 'STU003', '2026-07-08', 'Present'),
('CS101', 'STU004', '2026-07-08', 'Absent'),
('CS101', 'STU005', '2026-07-08', 'Present'),
('CS101', 'STU006', '2026-07-08', 'Present');

INSERT INTO results (course_code, student_id, score, grade) VALUES
('CS101', 'STU004', 82, 'B'),
('BA201', 'STU004', 74, 'C'),
('BIO301', 'STU004', 91, 'A'),
('ME401', 'STU004', 67, 'D'),
('PSY101', 'STU004', 88, 'B'),
('MATH201', 'STU004', 79, 'C');
