// SQL Relational Database Service for GEC Palamu
// Powered by Node.js 22 built-in SQLite Engine (node:sqlite)
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'gecpalamu.db');
const JSON_BACKUP = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Connect to SQLite
const sqlite = new DatabaseSync(SQLITE_FILE);

// Enable WAL mode & foreign keys for concurrency & data integrity
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

// Initialize SQL Schema
function initializeSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      designation TEXT,
      department TEXT,
      rollNo TEXT,
      regNo TEXT,
      branch TEXT,
      branchCode TEXT,
      semester TEXT,
      batch TEXT,
      cgpa REAL,
      bloodGroup TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      avatar TEXT,
      createdAt TEXT NOT NULL,
      approvedAt TEXT,
      approvedBy TEXT,
      rejectionReason TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      rollNo TEXT NOT NULL,
      studentName TEXT NOT NULL,
      subjectCode TEXT NOT NULL,
      subjectName TEXT NOT NULL,
      date TEXT NOT NULL,
      sessionTime TEXT NOT NULL,
      verifiedVia TEXT NOT NULL,
      facultyId TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fee_transactions (
      id TEXT PRIMARY KEY,
      refNo TEXT NOT NULL,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      rollNo TEXT NOT NULL,
      regNo TEXT,
      branch TEXT,
      semester TEXT,
      purpose TEXT NOT NULL,
      feeType TEXT NOT NULL,
      amount REAL NOT NULL,
      concessionCategory TEXT,
      paymentMode TEXT NOT NULL,
      upiId TEXT DEFAULT '6205482672@ptsbi',
      utrNumber TEXT,
      status TEXT NOT NULL,
      institution TEXT,
      merchantCode TEXT,
      securityHash TEXT,
      date TEXT,
      time TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS library_resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      branch TEXT NOT NULL,
      semester TEXT NOT NULL,
      year TEXT,
      fileType TEXT,
      size TEXT,
      downloads INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      uploadedBy TEXT,
      uploaderId TEXT,
      tags TEXT,
      verifiedByAdmin INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_broadcasts (
      id TEXT PRIMARY KEY,
      teacherId TEXT NOT NULL,
      teacherName TEXT NOT NULL,
      teacherDesignation TEXT,
      subjectCode TEXT,
      subjectName TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      targetAudience TEXT DEFAULT 'All Students',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_grades (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      rollNo TEXT NOT NULL,
      subjectCode TEXT NOT NULL,
      subjectName TEXT,
      midTerm REAL DEFAULT 0,
      assignment REAL DEFAULT 0,
      sessional REAL DEFAULT 0,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_subject_attendance (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      rollNo TEXT NOT NULL,
      subjectCode TEXT NOT NULL,
      subjectName TEXT NOT NULL,
      totalClasses INTEGER DEFAULT 0,
      attendedClasses INTEGER DEFAULT 0,
      lastAttendedDate TEXT,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_roll ON users(rollNo);
    CREATE INDEX IF NOT EXISTS idx_att_date ON attendance_records(date);
    CREATE INDEX IF NOT EXISTS idx_fee_ref ON fee_transactions(refNo);
    CREATE INDEX IF NOT EXISTS idx_fee_student ON fee_transactions(studentId);
    CREATE INDEX IF NOT EXISTS idx_grades_std ON student_grades(studentId, subjectCode);
    CREATE INDEX IF NOT EXISTS idx_subj_att_std ON student_subject_attendance(studentId, subjectCode);
  `);

  // Column migrations for extended student profile
  try { sqlite.exec("ALTER TABLE users ADD COLUMN contact TEXT;"); } catch {}
  try { sqlite.exec("ALTER TABLE users ADD COLUMN guardianName TEXT;"); } catch {}
  try { sqlite.exec("ALTER TABLE users ADD COLUMN hostelResident INTEGER DEFAULT 0;"); } catch {}
  try { sqlite.exec("ALTER TABLE users ADD COLUMN hostelName TEXT;"); } catch {}
  try { sqlite.exec("ALTER TABLE users ADD COLUMN category TEXT;"); } catch {}
  try { sqlite.exec("ALTER TABLE users ADD COLUMN dob TEXT;"); } catch {}
}

initializeSchema();

// Migration / Seed Data Logic
function seedDatabaseIfEmpty() {
  const countRow = sqlite.prepare('SELECT COUNT(*) as count FROM users;').get();
  if (countRow.count > 0) {
    // Ensure HOD and Subject Teacher accounts are up to date
    ensureEssentialRoles();
    return;
  }

  console.log('🌱 Seeding SQLite database from initial seed / JSON backup...');

  let initialData = null;
  if (fs.existsSync(JSON_BACKUP)) {
    try {
      const raw = fs.readFileSync(JSON_BACKUP, 'utf-8');
      initialData = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read JSON backup for initial seed:', e);
    }
  }

  // Pre-hashed passwords
  const SALT = bcrypt.genSaltSync(10);
  const SEED_PASSWORDS = {
    admin: bcrypt.hashSync('Admin@123', SALT),
    faculty: bcrypt.hashSync('Faculty@123', SALT),
    student: bcrypt.hashSync('Student@123', SALT)
  };

  const users = initialData?.users || [
    {
      id: "usr-admin-01",
      name: "Dr. Sanjay Kumar Singh",
      email: "admin@gecpalamu.ac.in",
      password: SEED_PASSWORDS.admin,
      role: "admin",
      designation: "Principal & Institutional Admin",
      status: "APPROVED",
      createdAt: "2026-08-01T10:00:00.000Z",
      approvedAt: "2026-08-01T10:00:00.000Z",
      approvedBy: "SYSTEM"
    },
    {
      id: "usr-fac-01",
      name: "Dr. A. K. Verma",
      email: "akverma@gecpalamu.ac.in",
      password: SEED_PASSWORDS.faculty,
      role: "faculty",
      designation: "Associate Professor & HOD",
      department: "Computer Science and Engineering",
      status: "APPROVED",
      createdAt: "2026-08-01T10:00:00.000Z",
      approvedAt: "2026-08-01T10:00:00.000Z",
      approvedBy: "usr-admin-01"
    },
    {
      id: "usr-teacher-01",
      name: "Prof. Amit Sharma",
      email: "amit.sharma@gecpalamu.ac.in",
      password: SEED_PASSWORDS.faculty,
      role: "faculty",
      designation: "Assistant Professor (Subject Teacher - OS)",
      department: "Computer Science and Engineering",
      status: "APPROVED",
      createdAt: "2026-08-01T10:00:00.000Z",
      approvedAt: "2026-08-01T10:00:00.000Z",
      approvedBy: "usr-admin-01"
    },
    {
      id: "usr-teacher-02",
      name: "Prof. Priya Kumari",
      email: "priya.faculty@gecpalamu.ac.in",
      password: SEED_PASSWORDS.faculty,
      role: "faculty",
      designation: "Assistant Professor (Subject Teacher - DAA)",
      department: "Computer Science and Engineering",
      status: "APPROVED",
      createdAt: "2026-08-01T10:00:00.000Z",
      approvedAt: "2026-08-01T10:00:00.000Z",
      approvedBy: "usr-admin-01"
    }
  ];

  function ensureEssentialRoles() {
    try {
      const SALT = bcrypt.genSaltSync(10);
      const HOD_PASS = bcrypt.hashSync('Faculty@123', SALT);
      const TEACHER_PASS = bcrypt.hashSync('Faculty@123', SALT);

      // 1. Ensure Dr. A.K. Verma has role 'hod'
      const hodRow = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get('akverma@gecpalamu.ac.in');
      if (hodRow) {
        sqlite.prepare("UPDATE users SET role = 'hod', designation = 'Head of Department & Associate Professor' WHERE LOWER(email) = ?").run('akverma@gecpalamu.ac.in');
      } else {
        sqlite.prepare(`
          INSERT INTO users (id, name, email, password, role, designation, department, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run('usr-fac-01', 'Dr. A. K. Verma', 'akverma@gecpalamu.ac.in', HOD_PASS, 'hod', 'Head of Department & Associate Professor', 'Computer Science and Engineering', 'APPROVED', new Date().toISOString());
      }

      // 2. Ensure Subject Teacher: Prof. Amit Sharma (Operating Systems)
      const teacher1 = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get('amit.sharma@gecpalamu.ac.in');
      if (!teacher1) {
        sqlite.prepare(`
          INSERT INTO users (id, name, email, password, role, designation, department, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run('usr-teacher-01', 'Prof. Amit Sharma', 'amit.sharma@gecpalamu.ac.in', TEACHER_PASS, 'faculty', 'Assistant Professor (Subject Teacher - OS)', 'Computer Science and Engineering', 'APPROVED', new Date().toISOString());
      }

      // 3. Ensure Subject Teacher: Prof. Priya Kumari (Algorithms)
      const teacher2 = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get('priya.faculty@gecpalamu.ac.in');
      if (!teacher2) {
        sqlite.prepare(`
          INSERT INTO users (id, name, email, password, role, designation, department, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run('usr-teacher-02', 'Prof. Priya Kumari', 'priya.faculty@gecpalamu.ac.in', TEACHER_PASS, 'faculty', 'Assistant Professor (Subject Teacher - DAA)', 'Computer Science and Engineering', 'APPROVED', new Date().toISOString());
      }
    } catch (e) {
      console.warn('ensureEssentialRoles warning:', e);
    }
  }

  const insertUser = sqlite.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, password, role, designation, department,
      rollNo, regNo, branch, branchCode, semester, batch, cgpa,
      bloodGroup, status, avatar, createdAt, approvedAt, approvedBy, rejectionReason
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const u of users) {
    insertUser.run(
      u.id, u.name, u.email, u.password, u.role, u.designation || null, u.department || null,
      u.rollNo || null, u.regNo || null, u.branch || null, u.branchCode || null, u.semester || null, u.batch || null, u.cgpa || null,
      u.bloodGroup || null, u.status || 'PENDING', u.avatar || null, u.createdAt || new Date().toISOString(), u.approvedAt || null, u.approvedBy || null, u.rejectionReason || null
    );
  }

  // Seed Library
  const library = initialData?.library_resources || [
    {
      id: "res-pyq-1",
      title: "Data Structures & Algorithms - 2024 End Semester Examination Paper",
      category: "Previous Year Papers (PYQ)",
      branch: "CSE",
      semester: "3rd Semester",
      year: "2024",
      fileType: "PDF",
      size: "1.4 MB",
      downloads: 489,
      rating: 4.8,
      uploadedBy: "Examination Cell",
      tags: ["Trees", "Graphs", "Dynamic Programming", "JUT 2024"],
      verifiedByAdmin: 1,
      createdAt: "2026-08-01"
    },
    {
      id: "res-pyq-2",
      title: "Power Systems Analysis - 2025 Mid-Sem Question Bank with Solutions",
      category: "Previous Year Papers (PYQ)",
      branch: "EEE",
      semester: "5th Semester",
      year: "2025",
      fileType: "PDF",
      size: "2.7 MB",
      downloads: 312,
      rating: 4.9,
      uploadedBy: "Electrical Dept",
      tags: ["Load Flow", "Fault Analysis", "Stability", "JUT 2025"],
      verifiedByAdmin: 1,
      createdAt: "2026-08-03"
    },
    {
      id: "res-not-1",
      title: "Complete Lecture Notes: Design & Analysis of Algorithms (Unit 1 to 5)",
      category: "Faculty Lecture Notes",
      branch: "CSE",
      semester: "5th Semester",
      year: "2026",
      fileType: "PDF",
      size: "8.6 MB",
      downloads: 742,
      rating: 5.0,
      uploadedBy: "Prof. Priya Kumari (CSE Dept)",
      tags: ["Asymptotic Notations", "Greedy", "DP", "NP-Completeness"],
      verifiedByAdmin: 1,
      createdAt: "2026-08-10"
    },
    {
      id: "res-lab-1",
      title: "Official Lab Manual: DBMS & PL/SQL Practical with 25 Verified Programs",
      category: "Laboratory Manuals",
      branch: "CSE",
      semester: "5th Semester",
      year: "2026",
      fileType: "PDF",
      size: "4.1 MB",
      downloads: 518,
      rating: 4.9,
      uploadedBy: "Dr. A. K. Verma",
      tags: ["SQL DDL/DML", "Triggers", "Cursors", "Procedures", "ER Diagram"],
      verifiedByAdmin: 1,
      createdAt: "2026-08-15"
    }
  ];

  const insertLib = sqlite.prepare(`
    INSERT OR REPLACE INTO library_resources (
      id, title, category, branch, semester, year, fileType, size,
      downloads, rating, uploadedBy, uploaderId, tags, verifiedByAdmin, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const r of library) {
    insertLib.run(
      r.id, r.title, r.category, r.branch, r.semester, r.year || '2026', r.fileType || 'PDF', r.size || '1.0 MB',
      r.downloads || 0, r.rating || 5.0, r.uploadedBy || 'Academic Cell', r.uploaderId || null,
      JSON.stringify(Array.isArray(r.tags) ? r.tags : []), r.verifiedByAdmin ? 1 : 0, r.createdAt || new Date().toISOString()
    );
  }

  // Seed Fee Transactions if present
  if (initialData?.fee_transactions?.length) {
    const insertFee = sqlite.prepare(`
      INSERT OR REPLACE INTO fee_transactions (
        id, refNo, studentId, studentName, rollNo, regNo, branch, semester,
        purpose, feeType, amount, concessionCategory, paymentMode, upiId, utrNumber,
        status, institution, merchantCode, securityHash, date, time, timestamp
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const f of initialData.fee_transactions) {
      insertFee.run(
        f.id, f.refNo, f.studentId, f.studentName, f.rollNo, f.regNo || null, f.branch || null, f.semester || null,
        f.purpose, f.feeType, Number(f.amount), f.concessionCategory || 'general', f.paymentMode, f.upiId || '6205482672@ptsbi', f.utrNumber || null,
        f.status || 'SUCCESS', f.institution || 'Government Engineering College, Palamu', f.merchantCode || 'GECP-SBI-COLLECT-822118',
        f.securityHash || 'SHA256-VERIFIED', f.date, f.time, f.timestamp || new Date().toISOString()
      );
    }
  }

  console.log('✅ SQLite database successfully initialized and seeded!');
}

seedDatabaseIfEmpty();

// Helper to format library resource tags
function formatLibRow(row) {
  if (!row) return null;
  let parsedTags = [];
  try {
    parsedTags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    parsedTags = [];
  }
  return {
    ...row,
    tags: parsedTags,
    verifiedByAdmin: Boolean(row.verifiedByAdmin)
  };
}

// SQL Database Operations API (100% compliant with existing controllers)
export const sqlDb = {
  // Direct raw query execution if needed
  raw: sqlite,

  // --- Users ---
  getUsers: () => {
    return sqlite.prepare('SELECT * FROM users ORDER BY createdAt DESC;').all();
  },

  findUserByEmail: (email) => {
    if (!email) return null;
    return sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1;').get(email.trim());
  },

  findUserById: (id) => {
    if (!id) return null;
    return sqlite.prepare('SELECT * FROM users WHERE id = ? LIMIT 1;').get(id);
  },

  findUserByRoll: (roll) => {
    if (!roll) return null;
    return sqlite.prepare('SELECT * FROM users WHERE LOWER(rollNo) = LOWER(?) LIMIT 1;').get(roll.trim());
  },

  createUser: (userData) => {
    const stmt = sqlite.prepare(`
      INSERT INTO users (
        id, name, email, password, role, designation, department,
        rollNo, regNo, branch, branchCode, semester, batch, cgpa,
        bloodGroup, status, avatar, createdAt, approvedAt, approvedBy, rejectionReason
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      userData.id, userData.name, userData.email, userData.password, userData.role,
      userData.designation || null, userData.department || null, userData.rollNo || null,
      userData.regNo || null, userData.branch || null, userData.branchCode || null,
      userData.semester || null, userData.batch || null, userData.cgpa || null,
      userData.bloodGroup || null, userData.status || 'PENDING', userData.avatar || null,
      userData.createdAt || new Date().toISOString(), userData.approvedAt || null,
      userData.approvedBy || null, userData.rejectionReason || null
    );

    return userData;
  },

  updateUser: (id, updates) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return sqlDb.findUserById(id);

    const setClauses = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(id);

    sqlite.prepare(`UPDATE users SET ${setClauses} WHERE id = ?;`).run(...values);
    return sqlDb.findUserById(id);
  },

  // --- Approvals ---
  getPendingStudents: () => {
    return sqlite.prepare(`
      SELECT * FROM users 
      WHERE role = 'student' AND status = 'PENDING' 
      ORDER BY createdAt DESC;
    `).all();
  },

  approveStudent: (studentId, adminId) => {
    const approvedAt = new Date().toISOString();
    sqlite.prepare(`
      UPDATE users 
      SET status = 'APPROVED', approvedAt = ?, approvedBy = ? 
      WHERE id = ?;
    `).run(approvedAt, adminId, studentId);

    return sqlDb.findUserById(studentId);
  },

  rejectStudent: (studentId, reason) => {
    sqlite.prepare(`
      UPDATE users 
      SET status = 'REJECTED', rejectionReason = ? 
      WHERE id = ?;
    `).run(reason || 'Document verification failed', studentId);

    return sqlDb.findUserById(studentId);
  },

  getApprovedStudents: (branchCode = null, semester = null) => {
    let query = "SELECT id, name, email, rollNo, regNo, branch, branchCode, semester, batch, cgpa, bloodGroup, status, avatar, contact, guardianName, hostelResident, hostelName, category, dob, createdAt FROM users WHERE role = 'student' AND status = 'APPROVED'";
    const params = [];
    if (branchCode) {
      query += " AND UPPER(branchCode) = UPPER(?)";
      params.push(branchCode);
    }
    if (semester) {
      query += " AND UPPER(semester) LIKE UPPER(?)";
      params.push(`%${semester}%`);
    }
    query += " ORDER BY rollNo ASC;";
    return sqlite.prepare(query).all(...params);
  },

  getAllStudents: () => {
    return sqlite.prepare("SELECT id, name, email, rollNo, regNo, branch, branchCode, semester, batch, cgpa, bloodGroup, status, avatar, contact, guardianName, hostelResident, hostelName, category, dob, createdAt, approvedAt, rejectionReason FROM users WHERE role = 'student' ORDER BY createdAt DESC;").all();
  },

  updateStudentProfile: (studentId, updates = {}) => {
    const fields = [];
    const params = [];
    const allowed = ['name', 'contact', 'guardianName', 'bloodGroup', 'category', 'dob', 'hostelResident', 'hostelName', 'avatar', 'cgpa', 'semester', 'branch'];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (fields.length > 0) {
      params.push(studentId);
      sqlite.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    }
    return sqlDb.findUserById(studentId);
  },

  saveStudentGrade: (grade) => {
    const sId = (grade.studentId || '').trim();
    const rNo = (grade.rollNo || '').trim();
    const sCode = (grade.subjectCode || '').trim();

    const existing = sqlite.prepare(`
      SELECT id FROM student_grades 
      WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')) 
        AND LOWER(subjectCode) = LOWER(?)
    `).get(sId, rNo, sCode);

    if (existing) {
      sqlite.prepare(`
        UPDATE student_grades 
        SET midTerm = ?, assignment = ?, sessional = ?, updatedAt = ?
        WHERE id = ?
      `).run(grade.midTerm || 0, grade.assignment || 0, grade.sessional || 0, new Date().toISOString(), existing.id);
      return { id: existing.id, ...grade };
    } else {
      const id = `grd-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;
      sqlite.prepare(`
        INSERT INTO student_grades (id, studentId, rollNo, subjectCode, subjectName, midTerm, assignment, sessional, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        sId,
        rNo,
        sCode,
        grade.subjectName || '',
        grade.midTerm || 0,
        grade.assignment || 0,
        grade.sessional || 0,
        new Date().toISOString()
      );
      return { id, ...grade };
    }
  },

  getStudentGrades: (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    const val = String(studentIdOrRoll).trim();
    return sqlite.prepare(`
      SELECT * FROM student_grades 
      WHERE LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')
    `).all(val, val);
  },

  getSubjectGrades: (subjectCode) => {
    if (!subjectCode) return [];
    const code = String(subjectCode).trim();
    return sqlite.prepare('SELECT * FROM student_grades WHERE LOWER(subjectCode) = LOWER(?)').all(code);
  },

  resetAllStudentData: () => {
    sqlite.prepare("DELETE FROM users WHERE role = 'student';").run();
    sqlite.prepare("DELETE FROM attendance_records;").run();
    sqlite.prepare("DELETE FROM fee_transactions;").run();
    sqlite.prepare("DELETE FROM student_grades;").run();
    sqlite.prepare("DELETE FROM student_subject_attendance;").run();
    return { success: true, message: 'All student accounts and related records wiped successfully.' };
  },

  // --- Smart Attendance Records ---
  recordAttendance: (record) => {
    const stmt = sqlite.prepare(`
      INSERT INTO attendance_records (
        id, studentId, rollNo, studentName, subjectCode, subjectName,
        date, sessionTime, verifiedVia, facultyId, status, createdAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      record.id, record.studentId, record.rollNo, record.studentName,
      record.subjectCode, record.subjectName, record.date, record.sessionTime,
      record.verifiedVia, record.facultyId, record.status, record.createdAt || new Date().toISOString()
    );

    // Synchronize to student_subject_attendance
    try {
      const now = new Date().toISOString();
      const isPresent = record.status === 'PRESENT' || record.status === 'present';
      const existing = sqlite.prepare(`
        SELECT * FROM student_subject_attendance 
        WHERE (studentId = ? OR rollNo = ?) AND subjectCode = ?
        LIMIT 1
      `).get(record.studentId || '', record.rollNo || '', record.subjectCode);

      if (existing) {
        sqlite.prepare(`
          UPDATE student_subject_attendance 
          SET totalClasses = totalClasses + 1,
              attendedClasses = attendedClasses + ?,
              lastAttendedDate = CASE WHEN ? = 1 THEN ? ELSE lastAttendedDate END,
              updatedAt = ?
          WHERE id = ?
        `).run(isPresent ? 1 : 0, isPresent ? 1 : 0, record.date, now, existing.id);
      } else {
        const newId = `subatt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        sqlite.prepare(`
          INSERT INTO student_subject_attendance (
            id, studentId, rollNo, subjectCode, subjectName,
            totalClasses, attendedClasses, lastAttendedDate, updatedAt
          ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
        `).run(newId, record.studentId || '', record.rollNo || '', record.subjectCode, record.subjectName || record.subjectCode, isPresent ? 1 : 0, isPresent ? record.date : null, now);
      }
    } catch (err) {
      console.warn('Could not sync student_subject_attendance in recordAttendance:', err);
    }

    return record;
  },

  // Atomic Bulk Session Attendance Marking by Subject Teacher / HOD
  recordSessionAttendance: (sessionData) => {
    const {
      facultyId = 'faculty-01',
      subjectCode,
      subjectName = '',
      branch = 'CSE',
      semester = '5th Sem',
      date = new Date().toISOString().split('T')[0],
      sessionTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      records = []
    } = sessionData;

    if (!subjectCode || !Array.isArray(records)) {
      throw new Error('subjectCode and records array are required');
    }

    const now = new Date().toISOString();
    const insertLogStmt = sqlite.prepare(`
      INSERT INTO attendance_records (
        id, studentId, rollNo, studentName, subjectCode, subjectName,
        date, sessionTime, verifiedVia, facultyId, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const findSubjAttStmt = sqlite.prepare(`
      SELECT * FROM student_subject_attendance 
      WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')) 
        AND LOWER(subjectCode) = LOWER(?)
      LIMIT 1
    `);

    const updateSubjAttStmt = sqlite.prepare(`
      UPDATE student_subject_attendance 
      SET totalClasses = totalClasses + 1,
          attendedClasses = attendedClasses + ?,
          lastAttendedDate = CASE WHEN ? = 1 THEN ? ELSE lastAttendedDate END,
          updatedAt = ?
      WHERE id = ?
    `);

    const insertSubjAttStmt = sqlite.prepare(`
      INSERT INTO student_subject_attendance (
        id, studentId, rollNo, subjectCode, subjectName,
        totalClasses, attendedClasses, lastAttendedDate, updatedAt
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    const results = [];

    for (const r of records) {
      if (!r.studentId && !r.rollNo) continue;
      const isPresent = r.status === 'present' || r.present === true;
      const logId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      insertLogStmt.run(
        logId,
        r.studentId || '',
        r.rollNo || '',
        r.studentName || r.name || 'Student',
        subjectCode,
        subjectName || subjectCode,
        date,
        sessionTime,
        r.verifiedVia || 'FACULTY_PORTAL',
        facultyId,
        isPresent ? 'PRESENT' : 'ABSENT',
        now
      );

      const existing = findSubjAttStmt.get(r.studentId || '', r.rollNo || '', subjectCode);
      if (existing) {
        updateSubjAttStmt.run(
          isPresent ? 1 : 0,
          isPresent ? 1 : 0,
          date,
          now,
          existing.id
        );
      } else {
        const newId = `subatt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        insertSubjAttStmt.run(
          newId,
          r.studentId || '',
          r.rollNo || '',
          subjectCode,
          subjectName || subjectCode,
          isPresent ? 1 : 0,
          isPresent ? date : null,
          now
        );
      }

      results.push({
        studentId: r.studentId,
        rollNo: r.rollNo,
        present: isPresent
      });
    }

    return {
      success: true,
      subjectCode,
      subjectName,
      branch,
      semester,
      date,
      processedCount: results.length,
      records: results
    };
  },

  getStudentSubjectAttendance: (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    const val = String(studentIdOrRoll).trim();
    return sqlite.prepare(`
      SELECT * FROM student_subject_attendance 
      WHERE LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')
    `).all(val, val);
  },

  getSubjectAttendanceLedger: (subjectCode) => {
    if (!subjectCode) return [];
    const code = String(subjectCode).trim();
    return sqlite.prepare('SELECT * FROM student_subject_attendance WHERE LOWER(subjectCode) = LOWER(?)').all(code);
  },

  getAttendanceRecords: () => {
    return sqlite.prepare('SELECT * FROM attendance_records ORDER BY createdAt DESC;').all();
  },

  checkDuplicateAttendance: (studentId, subjectCode, date) => {
    const row = sqlite.prepare(`
      SELECT COUNT(*) as count FROM attendance_records 
      WHERE studentId = ? AND subjectCode = ? AND date = ?;
    `).get(studentId, subjectCode, date);

    return row.count > 0;
  },

  resetAttendanceRecords: () => {
    sqlite.prepare('DELETE FROM attendance_records;').run();
    sqlite.prepare('DELETE FROM student_subject_attendance;').run();
    return { success: true, message: 'All attendance records cleared for new testing session.' };
  },

  // --- Digital Library Resources ---
  getLibraryResources: () => {
    const rows = sqlite.prepare('SELECT * FROM library_resources ORDER BY createdAt DESC;').all();
    return rows.map(formatLibRow);
  },

  addLibraryResource: (res) => {
    const stmt = sqlite.prepare(`
      INSERT INTO library_resources (
        id, title, category, branch, semester, year, fileType, size,
        downloads, rating, uploadedBy, uploaderId, tags, verifiedByAdmin, createdAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      res.id, res.title, res.category, res.branch, res.semester,
      res.year || '2026', res.fileType || 'PDF', res.size || '1.0 MB',
      res.downloads || 0, res.rating || 5.0, res.uploadedBy || 'Academic Cell',
      res.uploaderId || null, JSON.stringify(res.tags || []),
      res.verifiedByAdmin ? 1 : 0, res.createdAt || new Date().toISOString()
    );

    return res;
  },

  incrementResourceDownload: (id) => {
    sqlite.prepare('UPDATE library_resources SET downloads = downloads + 1 WHERE id = ?;').run(id);
    const row = sqlite.prepare('SELECT * FROM library_resources WHERE id = ?;').get(id);
    return formatLibRow(row);
  },

  deleteLibraryResource: (id) => {
    const existing = sqlite.prepare('SELECT * FROM library_resources WHERE id = ?;').get(id);
    if (existing) {
      sqlite.prepare('DELETE FROM library_resources WHERE id = ?;').run(id);
      return formatLibRow(existing);
    }
    return null;
  },

  // --- Fee Transactions & UPI Records ---
  recordFeeTransaction: (transaction) => {
    const stmt = sqlite.prepare(`
      INSERT INTO fee_transactions (
        id, refNo, studentId, studentName, rollNo, regNo, branch, semester,
        purpose, feeType, amount, concessionCategory, paymentMode, upiId, utrNumber,
        status, institution, merchantCode, securityHash, date, time, timestamp
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      transaction.id, transaction.refNo, transaction.studentId, transaction.studentName,
      transaction.rollNo, transaction.regNo || null, transaction.branch || null, transaction.semester || null,
      transaction.purpose, transaction.feeType, Number(transaction.amount), transaction.concessionCategory || 'general',
      transaction.paymentMode, transaction.upiId || '6205482672@ptsbi', transaction.utrNumber || null,
      transaction.status || 'SUCCESS', transaction.institution || 'Government Engineering College, Palamu',
      transaction.merchantCode || 'GECP-SBI-COLLECT-822118', transaction.securityHash || 'SHA256-VERIFIED',
      transaction.date, transaction.time, transaction.timestamp || new Date().toISOString()
    );

    return transaction;
  },

  getFeeTransactions: () => {
    return sqlite.prepare('SELECT * FROM fee_transactions ORDER BY timestamp DESC;').all();
  },

  findFeeTransactionById: (receiptId) => {
    if (!receiptId) return null;
    return sqlite.prepare(`
      SELECT * FROM fee_transactions 
      WHERE LOWER(id) = LOWER(?) OR LOWER(refNo) = LOWER(?) OR LOWER(utrNumber) = LOWER(?)
      LIMIT 1;
    `).get(receiptId.trim(), receiptId.trim(), receiptId.trim());
  },

  getStudentFeeTransactions: (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    return sqlite.prepare(`
      SELECT * FROM fee_transactions 
      WHERE studentId = ? OR LOWER(rollNo) = LOWER(?)
      ORDER BY timestamp DESC;
    `).all(studentIdOrRoll, studentIdOrRoll.trim());
  },

  // --- Teacher Broadcasts & Classroom Notices ---
  getBroadcasts: () => {
    return sqlite.prepare('SELECT * FROM teacher_broadcasts ORDER BY createdAt DESC;').all();
  },

  createBroadcast: (b) => {
    const stmt = sqlite.prepare(`
      INSERT INTO teacher_broadcasts (
        id, teacherId, teacherName, teacherDesignation, subjectCode, subjectName,
        title, message, type, targetAudience, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      b.id, b.teacherId, b.teacherName, b.teacherDesignation || null,
      b.subjectCode || null, b.subjectName || null, b.title, b.message,
      b.type || 'info', b.targetAudience || 'All Students', b.createdAt || new Date().toISOString()
    );
    return b;
  }
};
