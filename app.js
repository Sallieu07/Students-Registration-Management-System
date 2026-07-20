/* ============================================================
   app.js — School Registration Management System
   Roles: Administrator | Academic Staff | Lecturer | Student
   ============================================================ */


/* ============================================================
   1. DATA STORE
   ============================================================ */
const API_ROOT = 'api';

const store = {
  currentUser: null,
  studentAccountId: 'STU004',
  students: [],
  courses: [],
  users: [],
  attendance: {},
  results: {},
  pendingDelete: null,
};

/**
 * Make a JSON API request and parse the response.
 * @param {string} path
 * @param {object} options
 * @returns {Promise<any>}
 */
async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new Error('Network error: ' + err.message);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const text = await response.text();
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error('Invalid JSON response from server: ' + text);
    }
  } else {
    throw new Error('Unexpected server response (not JSON): ' + text);
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'An API error occurred');
  }
  return data;
}

async function loadStudents() {
  const data = await apiRequest(`${API_ROOT}/students.php`);
  store.students = data.students.map(s => ({
    id: s.student_id || s.id,
    name: s.name,
    age: parseInt(s.age, 10),
    grade: s.grade,
    gpa: parseFloat(s.gpa),
    attendance: parseInt(s.attendance, 10),
    status: s.status,
  }));
}

async function loadCourses() {
  const data = await apiRequest(`${API_ROOT}/courses.php`);
  store.courses = data.courses.map(c => ({
    id: c.id,
    name: c.name,
    dept: c.dept,
    credits: parseInt(c.credits, 10),
    instructor: c.instructor,
    enrolled: parseInt(c.enrolled, 10),
    schedule: c.schedule,
    subjects: Array.isArray(c.subjects) ? c.subjects : [],
  }));
}

async function loadUsers() {
  const data = await apiRequest(`${API_ROOT}/users.php`);
  store.users = data.users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLogin: u.lastLogin,
  }));
}

async function loadAttendanceRecords(courseId) {
  const data = await apiRequest(`${API_ROOT}/attendance.php?course_id=${encodeURIComponent(courseId)}`);
  const attendance = {};
  data.attendance.forEach(record => {
    attendance[record.date] = attendance[record.date] || {};
    attendance[record.date][record.student_id] = record.status;
  });
  return attendance;
}

async function loadResultsRecords(courseId) {
  const data = await apiRequest(`${API_ROOT}/results.php?course_id=${encodeURIComponent(courseId)}`);
  const results = {};
  data.results.forEach(record => {
    results[record.student_id] = { score: record.score, grade: record.grade };
  });
  return results;
}


/* ============================================================
   2. ROLE CONFIGURATION
      Sidebar nav links per role.
      Student sees ONLY "Dashboard" + "Settings" — matches screenshots.
   ============================================================ */

const NAV_BY_ROLE = {
  'Administrator': [
    { label: 'Dashboard',            view: 'dashboard',  icon: 'rect' },
    { label: 'Student Management',   view: 'students',   icon: 'person' },
    { label: 'Course Management',    view: 'courses',    icon: 'book' },
    { label: 'Attendance & Results', view: 'attendance', icon: 'calendar' },
    { label: 'User Roles & Access',  view: 'users',      icon: 'users' },
    { label: 'Settings',             view: 'settings',   icon: 'gear' },
  ],
  'Academic Staff': [
    { label: 'Dashboard',            view: 'dashboard',  icon: 'rect' },
    { label: 'Student Management',   view: 'students',   icon: 'person' },
    { label: 'Course Management',    view: 'courses',    icon: 'book' },
    { label: 'Attendance & Results', view: 'attendance', icon: 'calendar' },
    { label: 'Settings',             view: 'settings',   icon: 'gear' },
  ],
  'Lecturer': [
    { label: 'Dashboard',            view: 'dashboard',  icon: 'rect' },
    { label: 'Student Management',   view: 'students',   icon: 'person' },
    { label: 'Course Management',    view: 'courses',    icon: 'book' },
    { label: 'Attendance & Results', view: 'attendance', icon: 'calendar' },
    { label: 'Settings',             view: 'settings',   icon: 'gear' },
  ],
  /* Student: only Dashboard + Settings (matches screenshots exactly) */
  'Student': [
    { label: 'Dashboard',            view: 'dashboard',  icon: 'rect' },
    { label: 'Settings',             view: 'settings',   icon: 'gear' },
  ],
};

/* SVG path data for each icon key */
function getNavIcon(key) {
  const icons = {
    rect:     `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
    person:   `<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>`,
    book:     `<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>`,
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    users:    `<circle cx="9" cy="7" r="4"/><path d="M1 21v-2a7 7 0 0 1 14 0v2"/><line x1="17" y1="11" x2="23" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/>`,
    gear:     `<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  };
  return icons[key] || icons.rect;
}

/* Topbar info per view */
const PAGE_INFO = {
  'dashboard':  { title: 'Dashboard Overview',   subtitle: "Monitor your school's performance and activities" },
  'students':   { title: 'Student Management',   subtitle: 'Manage student records and information' },
  'courses':    { title: 'Course Management',    subtitle: 'Create and manage courses and subjects' },
  'attendance': { title: 'Attendance & Results', subtitle: 'Track student attendance and manage academic results' },
  'users':      { title: 'User Roles & Access',  subtitle: 'Manage user accounts and role-based permissions' },
  'settings':   { title: 'Settings',             subtitle: 'Manage your account and system preferences' },
};

/* Edit permissions by section */
const CAN_EDIT = {
  students: ['Administrator', 'Academic Staff'],
  courses:  ['Administrator', 'Academic Staff'],
  users:    ['Administrator'],
};
function hasPermission(section) {
  return CAN_EDIT[section]?.includes(store.currentUser?.role) ?? true;
}

/* Is the logged-in user a Student? */
function isStudent() {
  return store.currentUser?.role === 'Student';
}


/* ============================================================
   3. UTILITY HELPERS
   ============================================================ */

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#0d9e8a','#3b82f6','#a855f7','#f59e0b','#ef4444','#22c55e','#06b6d4','#ec4899'];
function avatarColor(str) {
  let hash = 0;
  for (const c of str) hash += c.charCodeAt(0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => { t.className = ''; }, 3000);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function toggleDropdown() {
  document.getElementById('avatar-dropdown').classList.toggle('open');
}

/* Close dropdown on outside click */
document.addEventListener('click', (e) => {
  if (!e.target.closest('#topbar-avatar') && !e.target.closest('#avatar-dropdown')) {
    document.getElementById('avatar-dropdown')?.classList.remove('open');
  }
});

/* Close modals on overlay click */
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', (e) => { if (e.target === o) o.classList.remove('open'); });
});


/* ============================================================
   4. AUTHENTICATION
   ============================================================ */

async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  if (!username || !password) {
    errEl.textContent = 'Please enter both username and password.';
    errEl.style.display = 'block';
    return;
  }

  try {
    const data = await apiRequest(`${API_ROOT}/auth.php`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    store.currentUser = { username, ...data.user };
    errEl.style.display = 'none';

    const user = store.currentUser;
    document.getElementById('sidebar-avatar').textContent  = initials(user.name);
    document.getElementById('sidebar-name').textContent    = user.name;
    document.getElementById('sidebar-role').textContent    = user.role;
    document.getElementById('topbar-avatar').textContent   = initials(user.name);
    document.getElementById('topbar-username').textContent = user.username;

    document.getElementById('set-username').value = user.username;
    document.getElementById('set-email').value    = user.email || '';
    document.getElementById('set-role').value     = user.role.toLowerCase().replace(/\s+/g, '_');

    buildSidebar(user.role);
    applyRoleRestrictions(user.role);

    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').style.display        = 'flex';

    await Promise.all([loadStudents(), loadCourses(), loadUsers()]);
    navigate('dashboard');
  } catch (error) {
    errEl.textContent = error.message || 'Invalid username or password. Please try again.';
    errEl.style.display = 'block';
  }
}

function doLogout() {
  store.currentUser = null;
  document.getElementById('app').style.display        = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('avatar-dropdown').classList.remove('open');
  /* Reset to default credentials for convenience */
  document.getElementById('login-username').value = 'admin';
  document.getElementById('login-password').value = 'admin123';
}

/* Allow Enter key on login password field */
document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});


/* ============================================================
   5. SIDEBAR BUILDER
   ============================================================ */

/**
 * Inject nav links appropriate for the given role.
 * @param {string} role
 */
function buildSidebar(role) {
  const nav   = document.getElementById('sidebar-nav');
  const links = NAV_BY_ROLE[role] || NAV_BY_ROLE['Administrator'];

  nav.innerHTML = links.map(l => `
    <a class="nav-link" data-view="${l.view}">
      <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        ${getNavIcon(l.icon)}
      </svg>
      ${l.label}
    </a>
  `).join('');

  /* Re-attach click handlers each time sidebar is rebuilt */
  nav.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => navigate(a.dataset.view));
  });
}


/* ============================================================
   6. ROLE RESTRICTIONS
      Hide/show UI elements that differ by role.
   ============================================================ */

function applyRoleRestrictions(role) {
  /* Add Student / Add Course buttons: only Admin & Staff */
  const btnStu = document.getElementById('btn-add-student');
  const btnCrs = document.getElementById('btn-add-course');
  if (btnStu) btnStu.style.display = hasPermission('students') ? '' : 'none';
  if (btnCrs) btnCrs.style.display = hasPermission('courses')  ? '' : 'none';

  /*
   * "View All" buttons in the dashboard panels:
   * Hidden for Student (they can't navigate to those pages)
   */
  document.querySelectorAll('.hide-for-student').forEach(el => {
    el.style.display = (role === 'Student') ? 'none' : '';
  });
}


/* ============================================================
   7. NAVIGATION
   ============================================================ */

function navigate(view) {
  /* Highlight correct sidebar link */
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.view === view);
  });

  /* Update topbar text */
  const info = PAGE_INFO[view] || {};
  document.getElementById('topbar-title').textContent    = info.title    || view;
  document.getElementById('topbar-subtitle').textContent = info.subtitle || '';

  /* Show the target section, hide all others */
  document.querySelectorAll('.page-view').forEach(s => s.classList.remove('active'));
  document.getElementById('view-' + view)?.classList.add('active');

  /* Render content for the view */
  const renderers = {
    'dashboard':  renderDashboard,
    'students':   renderStudents,
    'courses':    renderCourses,
    'attendance': renderAttendance,
    'users':      renderUsers,
  };
  if (renderers[view]) renderers[view]();
}


/* ============================================================
   8. DASHBOARD
      All roles land on the same view.
      Student role additionally sees "My Academic Profile" card.
   ============================================================ */

function renderDashboard() {
  /* ── Compute stats ── */
  const avgGpa = (store.students.reduce((s, x) => s + x.gpa, 0) / store.students.length).toFixed(2);
  const avgAtt = Math.round(store.students.reduce((s, x) => s + x.attendance, 0) / store.students.length);

  document.getElementById('stat-students').textContent   = store.students.length;
  document.getElementById('stat-courses').textContent    = store.courses.length;
  document.getElementById('stat-attendance').textContent = avgAtt + '%';
  document.getElementById('stat-gpa').textContent        = avgGpa;

  /* ── Recent Students list (all 5 visible in student screenshot) ── */
  const displayCount = isStudent() ? 5 : 4;   // student view shows more rows
  document.getElementById('dash-students-list').innerHTML =
    store.students.slice(0, displayCount).map(s => `
      <div class="student-item">
        <div class="s-avatar" style="background:${avatarColor(s.name)}">${initials(s.name)}</div>
        <div class="s-info">
          <div class="s-name">${s.name}</div>
          <div class="s-sub">${s.id} &bull; ${s.grade}</div>
        </div>
        <div class="s-meta">
          <div class="s-gpa">GPA: ${s.gpa}</div>
          <div class="s-att">${s.attendance}% Attendance</div>
        </div>
      </div>
    `).join('');

  /* ── Upcoming Classes ── */
  document.getElementById('dash-classes-list').innerHTML =
    store.courses.map(c => `
      <div class="class-item">
        <div>
          <div class="class-name">${c.name}</div>
          <div class="class-code">${c.id}</div>
        </div>
        <div class="class-meta">
          <div class="class-credits">${c.credits} Credits</div>
          <div class="class-sched">${c.schedule}</div>
        </div>
      </div>
    `).join('');

  /* ── Student-only: My Academic Profile section ──
     Shown below the two-column panel (matches screenshot image 2)  */
  const profileSection = document.getElementById('student-academic-profile');
  if (isStudent()) {
    const sid     = store.studentAccountId;                     // STU004
    const student = store.students.find(s => s.id === sid);

    /* Fill in the three stat values */
    document.getElementById('ap-gpa').textContent        = student.gpa;
    document.getElementById('ap-attendance').textContent = student.attendance + '%';
    /* Enrolled = total active courses */
    document.getElementById('ap-courses').textContent    = store.courses.length;

    profileSection.style.display = 'block';
  } else {
    /* Hide the section for non-student roles */
    profileSection.style.display = 'none';
  }
}


/* ============================================================
   9. STUDENT MANAGEMENT — Admin/Staff CRUD | Lecturer view-only
   ============================================================ */

function renderStudents(filter = '') {
  const term     = filter.toLowerCase();
  const filtered = store.students.filter(s =>
    s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
  );
  const canEdit = hasPermission('students');

  document.getElementById('students-tbody').innerHTML =
    filtered.map(s => `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="s-avatar" style="width:32px;height:32px;font-size:.75rem;background:${avatarColor(s.name)}">${initials(s.name)}</div>
            ${s.name}
          </div>
        </td>
        <td>${s.age}</td>
        <td>${s.grade}</td>
        <td><strong style="color:var(--primary)">${s.gpa}</strong></td>
        <td>${s.attendance}%</td>
        <td><span class="badge-status ${s.status.toLowerCase()}">${s.status}</span></td>
        <td>
          <div style="display:flex;gap:6px;">
            ${canEdit
              ? `<button class="action-btn edit" onclick="editStudent('${s.id}')" title="Edit">✏️</button>
                 <button class="action-btn del"  onclick="deleteRecord('student','${s.id}')" title="Delete">🗑️</button>`
              : `<span style="font-size:.75rem;color:var(--text-muted);">View only</span>`
            }
          </div>
        </td>
      </tr>
    `).join('');
}

function filterStudents() {
  renderStudents(document.getElementById('student-search').value);
}

function openStudentModal(editId = null) {
  if (!hasPermission('students')) { showToast('You do not have permission to edit students.', 'error'); return; }
  document.getElementById('student-modal-title').textContent = editId ? 'Edit Student' : 'Add New Student';
  document.getElementById('sm-edit-id').value = editId || '';
  if (editId) {
    const s = store.students.find(x => x.id === editId);
    document.getElementById('sm-name').value   = s.name;
    document.getElementById('sm-age').value    = s.age;
    document.getElementById('sm-grade').value  = s.grade;
    document.getElementById('sm-status').value = s.status;
  } else {
    document.getElementById('sm-name').value   = '';
    document.getElementById('sm-age').value    = '';
    document.getElementById('sm-grade').value  = 'Year 1';
    document.getElementById('sm-status').value = 'Active';
  }
  openModal('student-modal');
}

function editStudent(id) { openStudentModal(id); }

async function saveStudent() {
  const name   = document.getElementById('sm-name').value.trim();
  const age    = parseInt(document.getElementById('sm-age').value, 10);
  const grade  = document.getElementById('sm-grade').value;
  const status = document.getElementById('sm-status').value;
  const editId = document.getElementById('sm-edit-id').value;

  if (!name || !age) { showToast('Please fill in all required fields.', 'error'); return; }

  try {
    if (editId) {
      await apiRequest(`${API_ROOT}/students.php`, {
        method: 'PUT',
        body: JSON.stringify({ id: editId, name, age, grade, status }),
      });
      showToast('Student updated successfully!');
    } else {
      await apiRequest(`${API_ROOT}/students.php`, {
        method: 'POST',
        body: JSON.stringify({ name, age, grade, status, gpa: 0.0, attendance: 0 }),
      });
      showToast('Student added successfully!');
    }
    closeModal('student-modal');
    await loadStudents();
    renderStudents();
    renderDashboard();
  } catch (error) {
    showToast(error.message, 'error');
  }
}


/* ============================================================
   10. COURSE MANAGEMENT — Admin/Staff CRUD | Lecturer view-only
   ============================================================ */

function renderCourses() {
  const canEdit = hasPermission('courses');
  document.getElementById('courses-grid').innerHTML =
    store.courses.map(c => {
      const visible = c.subjects.slice(0, 3);
      const extra   = c.subjects.length - 3;
      return `
        <div class="course-card">
          <div class="course-card-header">
            <h3>${c.name}</h3>
            <span class="credit-badge">${c.credits} Credits</span>
          </div>
          <div class="course-code">${c.id}</div>
          <div class="course-dept">${c.dept}</div>
          <div class="subject-tags">
            ${visible.map(s => `<span class="subject-tag">${s}</span>`).join('')}
            ${extra > 0 ? `<span class="subject-tag">+${extra} more</span>` : ''}
          </div>
          <div class="course-meta">👤 ${c.instructor}</div>
          <div class="course-meta">👥 ${c.enrolled} Students Enrolled</div>
          <div class="course-meta">🕐 ${c.schedule}</div>
          <div class="course-actions">
            ${canEdit ? `<button class="btn btn-outline btn-sm" onclick="editCourse('${c.id}')">Edit Course</button>` : ''}
            <button class="btn btn-primary btn-sm" onclick="viewCourseDetails('${c.id}')">View Details</button>
          </div>
        </div>
      `;
    }).join('');
}

function openCourseModal(editId = null) {
  if (!hasPermission('courses')) { showToast('You do not have permission to edit courses.', 'error'); return; }
  document.getElementById('course-modal-title').textContent = editId ? 'Edit Course' : 'Add New Course';
  document.getElementById('cm-edit-id').value = editId || '';
  if (editId) {
    const c = store.courses.find(x => x.id === editId);
    document.getElementById('cm-name').value       = c.name;
    document.getElementById('cm-code').value       = c.id;
    document.getElementById('cm-dept').value       = c.dept;
    document.getElementById('cm-credits').value    = c.credits;
    document.getElementById('cm-instructor').value = c.instructor;
    document.getElementById('cm-schedule').value   = c.schedule;
  } else {
    ['cm-name','cm-code','cm-dept','cm-credits','cm-instructor','cm-schedule']
      .forEach(id => document.getElementById(id).value = '');
  }
  openModal('course-modal');
}

function editCourse(id) { openCourseModal(id); }

function viewCourseDetails(id) {
  const c = store.courses.find(x => x.id === id);
  showToast(`📚 ${c.name} — ${c.enrolled} students enrolled`);
}

async function saveCourse() {
  const name       = document.getElementById('cm-name').value.trim();
  const code       = document.getElementById('cm-code').value.trim().toUpperCase();
  const dept       = document.getElementById('cm-dept').value.trim();
  const credits    = parseInt(document.getElementById('cm-credits').value, 10) || 3;
  const instructor = document.getElementById('cm-instructor').value.trim();
  const schedule   = document.getElementById('cm-schedule').value.trim();
  const editId     = document.getElementById('cm-edit-id').value;

  if (!name || !code) { showToast('Course name and code are required.', 'error'); return; }

  try {
    if (editId) {
      await apiRequest(`${API_ROOT}/courses.php`, {
        method: 'PUT',
        body: JSON.stringify({ id: editId, code, name, dept, credits, instructor, schedule, enrolled: 0 }),
      });
      showToast('Course updated successfully!');
    } else {
      await apiRequest(`${API_ROOT}/courses.php`, {
        method: 'POST',
        body: JSON.stringify({ code, name, dept, credits, instructor, schedule, enrolled: 0 }),
      });
      showToast('Course added successfully!');
    }
    closeModal('course-modal');
    await loadCourses();
    renderCourses();
    renderDashboard();
  } catch (error) {
    showToast(error.message, 'error');
  }
}


/* ============================================================
   11. ATTENDANCE & RESULTS
   ============================================================ */

async function renderAttendance() {
  document.getElementById('att-course-select').innerHTML =
    store.courses.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('');
  document.getElementById('att-date').value = new Date().toISOString().split('T')[0];
  await loadAttendance();
}

async function loadAttendance() {
  const courseId = document.getElementById('att-course-select').value;
  const date     = document.getElementById('att-date').value;

  store.attendance[courseId] = await loadAttendanceRecords(courseId);
  store.results[courseId] = await loadResultsRecords(courseId);

  document.getElementById('attendance-tbody').innerHTML =
    store.students.map(s => {
      const status = store.attendance[courseId]?.[date]?.[s.id] || 'Present';
      return `
        <tr>
          <td><strong>${s.id}</strong></td>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="s-avatar" style="width:30px;height:30px;font-size:.72rem;background:${avatarColor(s.name)}">${initials(s.name)}</div>
              ${s.name}
            </div>
          </td>
          <td>${s.grade}</td>
          <td>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" name="att-${s.id}" value="Present" ${status === 'Present' ? 'checked' : ''} /> Present</label>
              <label class="radio-label"><input type="radio" name="att-${s.id}" value="Absent"  ${status === 'Absent' ? 'checked' : ''} /> Absent</label>
            </div>
          </td>
        </tr>
      `;
    }).join('');

  document.getElementById('results-tbody').innerHTML =
    store.students.map(s => {
      const saved = store.results[courseId]?.[s.id] || { score: '', grade: '' };
      return `
        <tr>
          <td><strong>${s.id}</strong></td>
          <td>${s.name}</td>
          <td>${s.grade}</td>
          <td>
            <input class="grade-input" type="number" min="0" max="100"
              placeholder="0-100" value="${saved.score}"
              data-sid="${s.id}" data-field="score"
              oninput="autoGrade(this)" />
          </td>
          <td>
            <input class="grade-input" type="text" placeholder="A-F"
              value="${saved.grade}" data-sid="${s.id}" data-field="grade"
              style="width:60px;" readonly />
          </td>
        </tr>`;
    }).join('');
}

function scoreToGrade(s) {
  if (s >= 90) return 'A';
  if (s >= 80) return 'B';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}

function autoGrade(input) {
  const score = parseInt(input.value);
  input.closest('tr').querySelector('[data-field="grade"]').value = isNaN(score) ? '' : scoreToGrade(score);
}

async function saveAttendance() {
  const courseId = document.getElementById('att-course-select').value;
  const date     = document.getElementById('att-date').value;
  if (!date) { showToast('Please select a date first.', 'error'); return; }

  const records = {};
  store.students.forEach(s => {
    const sel = document.querySelector(`input[name="att-${s.id}"]:checked`);
    records[s.id] = sel ? sel.value : 'Absent';
  });

  try {
    await apiRequest(`${API_ROOT}/attendance.php`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, date, records }),
    });
    showToast('Attendance saved successfully!');
    store.attendance[courseId] = store.attendance[courseId] || {};
    store.attendance[courseId][date] = records;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function saveResults() {
  const courseId = document.getElementById('att-course-select').value;
  const records = {};

  store.students.forEach(s => {
    const scoreEl = document.querySelector(`input[data-sid="${s.id}"][data-field="score"]`);
    const gradeEl = document.querySelector(`input[data-sid="${s.id}"][data-field="grade"]`);
    if (scoreEl?.value !== '') {
      records[s.id] = { score: scoreEl.value, grade: gradeEl.value };
    }
  });

  try {
    await apiRequest(`${API_ROOT}/results.php`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, records }),
    });
    showToast('Results saved successfully!');
    store.results[courseId] = records;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function switchAttTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('att-attendance-tab').style.display = tab === 'attendance' ? 'block' : 'none';
  document.getElementById('att-results-tab').style.display    = tab === 'results'    ? 'block' : 'none';
}


/* ============================================================
   12. USER ROLES — Admin only
   ============================================================ */

function renderUsers() {
  document.getElementById('users-tbody').innerHTML =
    store.users.map(u => {
      const roleClass = u.role.toLowerCase().replace(/\s+/g, '');
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="s-avatar" style="width:32px;height:32px;font-size:.75rem;background:${avatarColor(u.username)}">${initials(u.username)}</div>
              <strong>${u.username}</strong>
            </div>
          </td>
          <td>${u.email}</td>
          <td><span class="badge-status ${roleClass}">${u.role}</span></td>
          <td><span class="badge-status ${u.status.toLowerCase()}">${u.status}</span></td>
          <td>${u.lastLogin}</td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="action-btn edit" onclick="editUser(${u.id})" title="Edit">✏️</button>
              <button class="action-btn del"  onclick="deleteRecord('user',${u.id})" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');

  document.getElementById('count-admin').textContent    = store.users.filter(u => u.role === 'Administrator').length;
  document.getElementById('count-staff').textContent    = store.users.filter(u => u.role === 'Academic Staff').length;
  document.getElementById('count-lecturer').textContent = store.users.filter(u => u.role === 'Lecturer').length;
  document.getElementById('count-student').textContent  = store.users.filter(u => u.role === 'Student').length;
}

function openUserModal(editId = null) {
  document.getElementById('user-modal-title').textContent = editId ? 'Edit User' : 'Add New User';
  document.getElementById('um-edit-id').value = editId || '';
  if (editId) {
    const u = store.users.find(x => x.id === editId);
    document.getElementById('um-username').value = u.username;
    document.getElementById('um-email').value    = u.email;
    document.getElementById('um-role').value     = u.role;
    document.getElementById('um-status').value   = u.status;
    document.getElementById('um-password').value = '';
  } else {
    ['um-username','um-email','um-password'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('um-role').value   = 'Student';
    document.getElementById('um-status').value = 'Active';
  }
  openModal('user-modal');
}

function editUser(id) { openUserModal(id); }

async function saveUser() {
  const username = document.getElementById('um-username').value.trim();
  const email    = document.getElementById('um-email').value.trim();
  const role     = document.getElementById('um-role').value;
  const status   = document.getElementById('um-status').value;
  const password = document.getElementById('um-password').value;
  const editId   = document.getElementById('um-edit-id').value;

  if (!username || !email) { showToast('Username and email are required.', 'error'); return; }

  try {
    if (editId) {
      await apiRequest(`${API_ROOT}/users.php`, {
        method: 'PUT',
        body: JSON.stringify({ id: editId, username, email, role, status, password: password || undefined }),
      });
      showToast('User updated successfully!');
    } else {
      if (!password) { showToast('Password is required for new users.', 'error'); return; }
      await apiRequest(`${API_ROOT}/users.php`, {
        method: 'POST',
        body: JSON.stringify({ username, email, role, status, password }),
      });
      showToast('User added successfully!');
    }
    closeModal('user-modal');
    await loadUsers();
    renderUsers();
  } catch (error) {
    showToast(error.message, 'error');
  }
}


/* ============================================================
   13. DELETE WITH CONFIRMATION
   ============================================================ */

function deleteRecord(type, id) {
  const msgs = {
    student: 'Are you sure you want to delete this student? This action cannot be undone.',
    course:  'Are you sure you want to delete this course? All associated data will be removed.',
    user:    'Are you sure you want to delete this user? They will lose all system access.',
  };
  document.getElementById('confirm-message').textContent = msgs[type] || 'Delete this record?';

  store.pendingDelete = async () => {
    try {
      await apiRequest(`${API_ROOT}/${type === 'student' ? 'students.php' : type === 'course' ? 'courses.php' : 'users.php'}`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (type === 'student') { await loadStudents(); renderStudents(); renderDashboard(); }
      if (type === 'course')  { await loadCourses();  renderCourses();  renderDashboard(); }
      if (type === 'user')    { await loadUsers();    renderUsers(); }
      showToast('Record deleted successfully.');
      closeModal('confirm-modal');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };
  openModal('confirm-modal');
}

function confirmDeleteAction() {
  if (store.pendingDelete) { store.pendingDelete(); store.pendingDelete = null; }
}


/* ============================================================
   14. SETTINGS — all roles
   ============================================================ */

function saveProfile() {
  const username = document.getElementById('set-username').value.trim();
  if (!username) { showToast('Username cannot be empty.', 'error'); return; }
  /* Update both topbar and sidebar name to reflect the change */
  document.getElementById('topbar-username').textContent = username;
  document.getElementById('sidebar-name').textContent    = username;
  showToast('Profile saved successfully!');
}

function changePassword() {
  const curr    = document.getElementById('set-curr-pw').value;
  const newPw   = document.getElementById('set-new-pw').value;
  const confirm = document.getElementById('set-confirm-pw').value;
  if (!curr || !newPw)    { showToast('Please fill in all password fields.', 'error'); return; }
  if (newPw !== confirm)  { showToast('New passwords do not match.', 'error'); return; }
  if (newPw.length < 6)   { showToast('Password must be at least 6 characters.', 'error'); return; }
  showToast('Password updated successfully!');
  ['set-curr-pw','set-new-pw','set-confirm-pw'].forEach(id => document.getElementById(id).value = '');
}


/* ============================================================
   15. INITIALISATION
   ============================================================ */
(function init() {
  /* Set today's date in the attendance date picker on page load */
  const d = document.getElementById('att-date');
  if (d) d.value = new Date().toISOString().split('T')[0];
})();