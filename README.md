# School Registration Management System (SRMS)

This project is a PHP/MySQL-backed School Registration Management System designed to run on XAMPP.

## 🚀 Required Software

- XAMPP (Apache + MySQL)
- A modern browser (Chrome, Edge, Firefox)

## 📁 Project Files

- `index.php` — main frontend entrypoint served by Apache
- `styles.css` — application styles
- `app.js` — frontend logic and API requests
- `db_setup.sql` — MySQL schema and sample data seed
- `api/config.php` — database connection settings
- `api/auth.php` — login endpoint
- `api/students.php` — student CRUD endpoint
- `api/courses.php` — course CRUD endpoint
- `api/users.php` — user CRUD endpoint
- `api/attendance.php` — attendance endpoint
- `api/results.php` — results endpoint

## 🛠️ Setup Instructions

### 1. Start XAMPP

1. Open the XAMPP Control Panel.
2. Start `Apache`.
3. Start `MySQL`.

### 2. Create the Database

Use phpMyAdmin:

1. Open `http://localhost/phpmyadmin`
2. Click `Import`.
3. Choose `db_setup.sql` from the project folder.
4. Click `Go`.

Or use the Windows command line:

```powershell
cd c:\xampp\htdocs\S-RMS
c:\xampp\mysql\bin\mysql.exe -u root < db_setup.sql
```

### 3. Verify database connection

Open `api/config.php` and confirm the settings:

```php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'srms';
$DB_USER = 'root';
$DB_PASS = '';
```

If your MySQL password is not empty, update `$DB_PASS` accordingly.

### 4. Open the App in Your Browser

Go to:

```
http://localhost/S-RMS/index.php
```

### 5. Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Administrator | `admin` | `admin123` |
| Academic Staff | `staff` | `staff123` |
| Lecturer | `lecturer` | `lecturer123` |
| Student | `student` | `student123` |

## ✅ What works in this project

- Login using PHP authentication
- Student CRUD (add, edit, delete)
- Course CRUD (add, edit, delete)
- User CRUD (Admin only)
- Attendance save/load per course and date
- Result save/load per course
- MySQL data persistence through XAMPP

## 📝 Notes

- Use `index.php`, not `index.html`, when running through Apache.
- If you change `api/config.php`, restart Apache if needed.
- Data is stored in the `srms` MySQL database.

## 🔧 Troubleshooting

- If `http://localhost/S-RMS/index.php` shows an error, check Apache is running.
- If PHP returns a database error, verify `db_setup.sql` was imported and `api/config.php` is correct.
- If login fails, ensure the `users` table contains the seeded admin account.

## 📌 Optional: Reset Database

Re-import `db_setup.sql` in phpMyAdmin to restore the initial data.
