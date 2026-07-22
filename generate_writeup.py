from fpdf import FPDF
from pathlib import Path

pdf = FPDF(format='A4')
pdf.set_auto_page_break(auto=True, margin=15)

# Page 1: Cover page
pdf.add_page()
pdf.set_font('Helvetica', 'B', 28)
pdf.cell(0, 15, 'School Registration Management System', ln=True, align='C')
pdf.ln(8)
pdf.set_font('Helvetica', '', 16)
pdf.cell(0, 10, 'Project Write-Up', ln=True, align='C')
pdf.ln(15)
pdf.set_font('Helvetica', '', 12)
pdf.multi_cell(0, 8, 'Group #: ________\nStudent Name: ________\nCourse: ________\nInstructor: ________\nSubmission Date: ________', align='C')
pdf.ln(18)
pdf.set_font('Helvetica', 'I', 10)
pdf.multi_cell(0, 6, 'This report provides an overview of the School Registration Management System, including the project scope, features, technical implementation, and GitHub publication details.', align='C')

# Page 2: Project summary
pdf.add_page()
pdf.set_font('Helvetica', 'B', 16)
pdf.cell(0, 10, 'Project Summary', ln=True)
pdf.ln(5)
pdf.set_font('Helvetica', '', 12)
summary = (
    'This project is a School Registration Management System (SRMS) built with PHP, MySQL, HTML, CSS, and JavaScript. '
    'It is designed to run on a local XAMPP environment and supports role-based access for administrators, academic staff, lecturers, and students. '
    'The system streamlines student registration, course management, attendance tracking, and result management for a small school or training center. '\n\n'
    'Key features include secure login authentication, student CRUD operations, course creation and editing, attendance records per course and date, result entry, and user role management. '
    'Administrator and academic staff users can add, update, or remove students and courses, while lecturers have read access to student and course information. '
    'Students can view their dashboard and performance metrics with limited access to system settings. '\n\n'
    'The application frontend is delivered from index.php and styled with styles.css. JavaScript in app.js handles the user interface, data fetching, and view navigation. '
    'Backend API endpoints in the api folder provide secure data operations against a MySQL database configured in api/config.php. '
    'The database structure and sample data are created using db_setup.sql, allowing fast deployment in a XAMPP-backed environment.'
)
pdf.multi_cell(0, 8, summary)
pdf.ln(4)
pdf.set_font('Helvetica', 'B', 14)
pdf.cell(0, 8, 'Technical Details', ln=True)
pdf.set_font('Helvetica', '', 12)
technical = (
    '• Backend: PHP with REST-like API endpoints for authentication, students, courses, users, attendance, and results.\n'
    '• Database: MySQL schema initialized through db_setup.sql and accessed via api/config.php.\n'
    '• Frontend: Responsive PHP/HTML interface with styles.css and app.js for interactive views and role-based navigation.\n'
    '• Authentication: Username/password login using PHP server-side validation and session management.\n'
    '• Deployment: Runs on XAMPP Apache and MySQL, accessed through http://localhost/S-RMS/index.php.\n'
    '• User roles: Administrator, Academic Staff, Lecturer, and Student with tailored access controls.'
)
pdf.multi_cell(0, 8, technical)

# Page 3: GitHub URL and reflection
pdf.add_page()
pdf.set_font('Helvetica', 'B', 16)
pdf.cell(0, 10, 'GitHub URL and Reflection', ln=True)
pdf.ln(5)
pdf.set_font('Helvetica', '', 12)
pdf.multi_cell(0, 8, 'GitHub Repository URL: https://github.com/your-username/your-repository\n(Replace this placeholder with the actual project URL once the repository is published publicly.)')
pdf.ln(8)
pdf.multi_cell(0, 8,
    'This project demonstrates a complete small-scale school management system with multiple user roles and data persistence. '
    'It showcases practical skills in PHP backend development, MySQL database design, front-end interface styling, and JavaScript-driven application logic. '
    'Working on this system improved my understanding of role-based access, CRUD operations, data validation, and the workflow for deploying applications in a local XAMPP environment. '\n\n'
    'Future improvements can include stronger password hashing, input validation on both frontend and backend, improved error handling, and a richer student dashboard experience. '
    'Publishing the code on GitHub with a public repository also supports collaboration, version tracking, and easier access for instructors and teammates.'
)

output_path = Path('S-RMS_Project_Writeup.pdf')
pdf.output(str(output_path))
print(f'Created {output_path.resolve()}')
