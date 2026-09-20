// MySQL Relational Database Service for GEC Palamu
// Powered by MySQL Server 9.4 & mysql2/promise connection pool
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10),
  user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'UjjU@123'),
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'gec_palamu',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;

async function getPool() {
  if (pool) return pool;

  // 1. Support Cloud MySQL connection string (Railway / TiDB Cloud / Aiven / Clever Cloud)
  const rawUri = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_PUBLIC_URL || process.env.TIDB_URL || '';
  const dbUri = rawUri.trim().replace(/^["']|["']$/g, '');

  const isRemote = DB_CONFIG.host !== 'localhost' && DB_CONFIG.host !== '127.0.0.1';
  const isRailwayInternal = DB_CONFIG.host.includes('railway.internal') || (dbUri && dbUri.includes('railway.internal'));
  const sslConfig = (process.env.DB_SSL === 'true' || (isRemote && !isRailwayInternal && process.env.DB_SSL !== 'false'))
    ? { rejectUnauthorized: false }
    : undefined;

  if (dbUri) {
    try {
      console.log('📡 [Database] Initializing Cloud MySQL connection via connection URI...');
      pool = mysql.createPool({
        uri: dbUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: sslConfig
      });
      return pool;
    } catch (err) {
      console.error('❌ Cloud URI pool initialization failed:', err.message);
    }
  }

  // 2. Check if discrete DB_HOST is configured for remote or local MySQL
  if (!dbUri && !isRemote) {
    console.warn('⚠️ [Database Notice] No DATABASE_URL, MYSQL_URL, or remote DB_HOST detected in Environment Variables.');
    console.warn('⚠️ Falling back to 127.0.0.1:3306 (localhost).');
  }

  try {
    const initConn = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      ssl: sslConfig
    });
    await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initConn.end();
  } catch (err) {
    console.warn('Database creation check notice:', err.message);
  }

  pool = mysql.createPool({
    ...DB_CONFIG,
    ssl: sslConfig
  });
  return pool;
}

export async function initializeSchema() {
  const p = await getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      designation VARCHAR(255),
      department VARCHAR(255),
      rollNo VARCHAR(100),
      regNo VARCHAR(100),
      branch VARCHAR(255),
      branchCode VARCHAR(50),
      semester VARCHAR(50),
      batch VARCHAR(50),
      cgpa DOUBLE,
      bloodGroup VARCHAR(10),
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      avatar TEXT,
      contact VARCHAR(50),
      guardianName VARCHAR(255),
      hostelResident TINYINT(1) DEFAULT 0,
      hostelName VARCHAR(255),
      category VARCHAR(50),
      dob VARCHAR(50),
      createdAt VARCHAR(100) NOT NULL,
      approvedAt VARCHAR(100),
      approvedBy VARCHAR(64),
      rejectionReason TEXT,
      INDEX idx_users_email (email),
      INDEX idx_users_roll (rollNo),
      INDEX idx_users_role_status (role, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id VARCHAR(64) PRIMARY KEY,
      studentId VARCHAR(64) NOT NULL,
      rollNo VARCHAR(100) NOT NULL,
      studentName VARCHAR(255) NOT NULL,
      subjectCode VARCHAR(50) NOT NULL,
      subjectName VARCHAR(255) NOT NULL,
      date VARCHAR(50) NOT NULL,
      sessionTime VARCHAR(50) NOT NULL,
      verifiedVia VARCHAR(50) NOT NULL,
      facultyId VARCHAR(64) NOT NULL,
      status VARCHAR(50) NOT NULL,
      createdAt VARCHAR(100) NOT NULL,
      INDEX idx_att_student (studentId),
      INDEX idx_att_roll (rollNo),
      INDEX idx_att_subject (subjectCode),
      INDEX idx_att_date (date),
      INDEX idx_att_unique_session (studentId, subjectCode, date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS fee_transactions (
      id VARCHAR(64) PRIMARY KEY,
      refNo VARCHAR(100) NOT NULL,
      studentId VARCHAR(64) NOT NULL,
      studentName VARCHAR(255) NOT NULL,
      rollNo VARCHAR(100) NOT NULL,
      regNo VARCHAR(100),
      branch VARCHAR(255),
      semester VARCHAR(50),
      purpose VARCHAR(255) NOT NULL,
      feeType VARCHAR(50) NOT NULL,
      amount DOUBLE NOT NULL,
      concessionCategory VARCHAR(100),
      paymentMode VARCHAR(50) NOT NULL,
      upiId VARCHAR(100) DEFAULT '6205482672@ptsbi',
      utrNumber VARCHAR(100) UNIQUE,
      status VARCHAR(50) NOT NULL,
      institution VARCHAR(255),
      merchantCode VARCHAR(100),
      securityHash VARCHAR(255),
      date VARCHAR(50),
      time VARCHAR(50),
      timestamp VARCHAR(100) NOT NULL,
      INDEX idx_fee_ref (refNo),
      INDEX idx_fee_student (studentId),
      INDEX idx_fee_roll (rollNo),
      INDEX idx_fee_utr (utrNumber)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS student_fee_dues (
      id VARCHAR(64) PRIMARY KEY,
      studentId VARCHAR(64) NOT NULL,
      rollNo VARCHAR(100) NOT NULL,
      tuitionDue DOUBLE DEFAULT 15200,
      examDue DOUBLE DEFAULT 2400,
      hostelDue DOUBLE DEFAULT 6000,
      libraryDue DOUBLE DEFAULT 0,
      tuitionPaid DOUBLE DEFAULT 0,
      examPaid DOUBLE DEFAULT 0,
      hostelPaid DOUBLE DEFAULT 0,
      libraryPaid DOUBLE DEFAULT 0,
      updatedAt VARCHAR(100) NOT NULL,
      INDEX idx_fee_std (studentId),
      INDEX idx_fee_roll (rollNo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS library_resources (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      branch VARCHAR(50) NOT NULL,
      semester VARCHAR(50) NOT NULL,
      year VARCHAR(20),
      fileType VARCHAR(20),
      size VARCHAR(50),
      downloads INT DEFAULT 0,
      rating DOUBLE DEFAULT 5.0,
      uploadedBy VARCHAR(255),
      uploaderId VARCHAR(64),
      tags TEXT,
      verifiedByAdmin TINYINT(1) DEFAULT 1,
      createdAt VARCHAR(100) NOT NULL,
      INDEX idx_lib_category (category),
      INDEX idx_lib_branch (branch),
      INDEX idx_lib_semester (semester)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS teacher_broadcasts (
      id VARCHAR(64) PRIMARY KEY,
      teacherId VARCHAR(64) NOT NULL,
      teacherName VARCHAR(255) NOT NULL,
      teacherDesignation VARCHAR(255),
      subjectCode VARCHAR(50),
      subjectName VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      targetAudience VARCHAR(100) DEFAULT 'All Students',
      createdAt VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS student_grades (
      id VARCHAR(64) PRIMARY KEY,
      studentId VARCHAR(64) NOT NULL,
      rollNo VARCHAR(100) NOT NULL,
      subjectCode VARCHAR(50) NOT NULL,
      subjectName VARCHAR(255),
      midTerm DOUBLE DEFAULT 0,
      assignment DOUBLE DEFAULT 0,
      sessional DOUBLE DEFAULT 0,
      updatedAt VARCHAR(100) NOT NULL,
      INDEX idx_grade_std (studentId, subjectCode),
      INDEX idx_grade_roll (rollNo, subjectCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS student_subject_attendance (
      id VARCHAR(64) PRIMARY KEY,
      studentId VARCHAR(64) NOT NULL,
      rollNo VARCHAR(100) NOT NULL,
      subjectCode VARCHAR(50) NOT NULL,
      subjectName VARCHAR(255) NOT NULL,
      totalClasses INT DEFAULT 0,
      attendedClasses INT DEFAULT 0,
      lastAttendedDate VARCHAR(50),
      updatedAt VARCHAR(100) NOT NULL,
      INDEX idx_sub_att_std (studentId, subjectCode),
      INDEX idx_sub_att_roll (rollNo, subjectCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS campus_events (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      tagline VARCHAR(255),
      category VARCHAR(100) NOT NULL,
      badge VARCHAR(100),
      date VARCHAR(50) NOT NULL,
      time VARCHAR(100),
      venue VARCHAR(255) NOT NULL,
      prizePool VARCHAR(100),
      teamSize VARCHAR(100),
      registrationDeadline VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Open',
      tracks TEXT,
      rules TEXT,
      organizerName VARCHAR(255),
      createdBy VARCHAR(64),
      createdAt VARCHAR(100) NOT NULL,
      INDEX idx_evt_date (date),
      INDEX idx_evt_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      ticketId VARCHAR(64) PRIMARY KEY,
      eventId VARCHAR(64) NOT NULL,
      eventTitle VARCHAR(255) NOT NULL,
      studentId VARCHAR(64) NOT NULL,
      rollNo VARCHAR(100) NOT NULL,
      studentName VARCHAR(255) NOT NULL,
      branch VARCHAR(100),
      semester VARCHAR(50),
      teamName VARCHAR(150),
      leaderName VARCHAR(150),
      leaderEmail VARCHAR(150),
      teamSize VARCHAR(50),
      track VARCHAR(255),
      venue VARCHAR(255),
      date VARCHAR(50),
      status VARCHAR(50) DEFAULT 'CONFIRMED',
      createdAt VARCHAR(100) NOT NULL,
      INDEX idx_reg_event (eventId),
      INDEX idx_reg_student (studentId),
      INDEX idx_reg_roll (rollNo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS faculty_members (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      department VARCHAR(255) NOT NULL,
      branchCode VARCHAR(50) NOT NULL,
      designation VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'faculty',
      qualification VARCHAR(255),
      specialization VARCHAR(255),
      experienceYears INT DEFAULT 5,
      cabin VARCHAR(100),
      avatar TEXT,
      joiningDate VARCHAR(50),
      status VARCHAR(50) DEFAULT 'ACTIVE',
      createdAt VARCHAR(100) NOT NULL,
      INDEX idx_fac_dept (department),
      INDEX idx_fac_branch (branchCode),
      INDEX idx_fac_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await seedCampusEventsAndSyncHostelDues();
  await seedFacultyMembersAndSyncRoles();
  await migrateFromSqliteIfAvailable();
}

async function seedCampusEventsAndSyncHostelDues() {
  const p = await getPool();

  // 1. Sync hostel dues: All non-hostel residents (hostelResident = 0 or NULL) must have hostelDue = 0
  try {
    await p.query(`
      UPDATE student_fee_dues d
      JOIN users u ON (d.studentId = u.id OR (d.rollNo != '' AND d.rollNo = u.rollNo))
      SET d.hostelDue = 0
      WHERE u.hostelResident = 0 OR u.hostelResident IS NULL;
    `);
  } catch (err) {
    console.warn('Hostel dues sync notice:', err.message);
  }

  // 2. Check and seed campus events
  try {
    const [rows] = await p.query('SELECT COUNT(*) as count FROM campus_events');
    if (rows[0].count === 0) {
      const defaultEvents = [
        {
          id: "evt-hack-2026",
          title: "Palash National 24-Hour Hackathon 2026",
          tagline: "Code for Rural Empowerment, AI & Clean Green Jharkhand",
          category: "Hackathon",
          badge: "Flagship Event",
          date: "2026-10-18",
          time: "09:00 AM onwards (24 Hours)",
          venue: "Main Computing Center & Central Auditorium, GEC Palamu",
          prizePool: "₹1,00,000 Cash + Cloud Credits",
          teamSize: "2 - 4 Members",
          registrationDeadline: "2026-10-10",
          status: "Open",
          tracks: JSON.stringify([
            "AI & Machine Learning for Rural Agriculture & Forest Surveillance",
            "Smart Mining, Clean Energy & Environmental Monitoring",
            "FinTech, Decentralized Systems & Digital Citizen Services",
            "Open Innovation & EdTech Solutions"
          ]),
          rules: JSON.stringify([
            "All team members must carry valid College ID cards.",
            "Work must be developed during the 24-hour hackathon period.",
            "High-speed Wi-Fi, mentorship, midnight meals, and accommodation provided on campus."
          ]),
          organizerName: "Department of Computer Science & Engineering, GEC Palamu",
          createdBy: "usr-fac-akverma"
        },
        {
          id: "evt-techkriti-2026",
          title: "TechKriti 2026 - Annual Techno-Management Fest",
          tagline: "Igniting Engineering Innovations Across Jharkhand",
          category: "Tech-Fest",
          badge: "State-Level",
          date: "2026-11-04",
          time: "10:00 AM - 07:00 PM (3 Days)",
          venue: "GEC Palamu Central Campus Grounds",
          prizePool: "₹1,50,000 Cash Prizes",
          teamSize: "Individual / Team up to 5",
          registrationDeadline: "2026-10-25",
          status: "Open",
          tracks: JSON.stringify([
            "RoboWar & Line Follower Bot Sprint",
            "Bridge-O-Mania (Civil Structural Modelling)",
            "Cad-A-Thon (Mechanical 3D Design)",
            "Web-Craft & Algorithmic Code Sprint"
          ]),
          rules: JSON.stringify([
            "Open to all AICTE / UGC approved engineering colleges.",
            "Certificates signed by Technical Education Department & Principal GEC Palamu."
          ]),
          organizerName: "Technical Club & Innovation Cell, GEC Palamu",
          createdBy: "usr-fac-akverma"
        },
        {
          id: "evt-ai-workshop",
          title: "National Workshop on Applied GenAI & LLMs in Engineering",
          tagline: "Hands-on Masterclass with Google & Industry ML Architects",
          category: "Workshop",
          badge: "Certification",
          date: "2026-09-27",
          time: "02:00 PM - 05:30 PM",
          venue: "Smart Classroom Hall 1 & Online Hybrid",
          prizePool: "Certificate of Excellence + Free Cloud Labs",
          teamSize: "Solo Participant",
          registrationDeadline: "2026-09-24",
          status: "Filling Fast",
          tracks: JSON.stringify([
            "Prompt Engineering & Vector Databases",
            "Building Agentic AI Systems",
            "Deploying Deep Learning models to Cloud Endpoints"
          ]),
          rules: JSON.stringify([
            "Laptop with Python installed recommended.",
            "Free registration for all GEC Palamu students."
          ]),
          organizerName: "HOD CSE & Google Cloud Community",
          createdBy: "usr-fac-akverma"
        },
        {
          id: "evt-utkarsh-cultural",
          title: "Utkarsh 2026 - Annual Cultural & Literary Extravaganza",
          tagline: "Celebrating Music, Drama, Art & Jharkhand's Heritage",
          category: "Cultural",
          badge: "Grand Celebration",
          date: "2026-12-12",
          time: "04:00 PM onwards",
          venue: "Open Air Amphitheatre, GEC Palamu",
          prizePool: "Trophies + ₹60,000 Rewards",
          teamSize: "Solo & Group",
          registrationDeadline: "2026-12-01",
          status: "Upcoming",
          tracks: JSON.stringify([
            "Battle of the Bands (Rock & Folk Fusion)",
            "Chhau & Tribal Dance Invitational",
            "Slam Poetry & Parliamentary Debate",
            "Short Film Making & Photography Exhibition"
          ]),
          rules: JSON.stringify([
            "Standard inter-college cultural guidelines apply.",
            "Participants must register before deadline."
          ]),
          organizerName: "Student Affairs & Cultural Council, GEC Palamu",
          createdBy: "usr-fac-akverma"
        }
      ];

      for (const evt of defaultEvents) {
        await p.query(`
          INSERT IGNORE INTO campus_events (
            id, title, tagline, category, badge, date, time, venue, prizePool,
            teamSize, registrationDeadline, status, tracks, rules, organizerName, createdBy, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          evt.id, evt.title, evt.tagline, evt.category, evt.badge, evt.date, evt.time, evt.venue,
          evt.prizePool, evt.teamSize, evt.registrationDeadline, evt.status, evt.tracks, evt.rules,
          evt.organizerName, evt.createdBy, new Date().toISOString()
        ]);
      }
      console.log('🏛️ Initialized 4 default campus events in MySQL.');
    }
  } catch (err) {
    console.warn('Campus events seeding notice:', err.message);
  }
}

async function seedFacultyMembersAndSyncRoles() {
  const p = await getPool();
  try {
    const SALT = await bcrypt.genSalt(10);
    const FACULTY_PASS = await bcrypt.hash('Faculty@123', SALT);

    const facultyList = [
      // 1. CSE HOD & Faculty
      {
        id: 'fac-hod-cse-01',
        name: 'Dr. Bhawesh Kumar',
        email: 'dr.bhawesh@gecpalamu.ac.in',
        phone: '+91 94311 87211',
        department: 'Computer Science and Engineering',
        branchCode: 'CSE',
        designation: 'Head of Department & Associate Professor',
        role: 'hod',
        qualification: 'Ph.D. in Computer Science (IIT Dhanbad), M.Tech (CSE)',
        specialization: 'Distributed Computing, Cloud & AI Architectures',
        experienceYears: 14,
        cabin: 'Academic Block-A, Room 204',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2018-07-15'
      },
      {
        id: 'fac-cse-02',
        name: 'Prof. Amit Sharma',
        email: 'amit.sharma@gecpalamu.ac.in',
        phone: '+91 94311 87212',
        department: 'Computer Science and Engineering',
        branchCode: 'CSE',
        designation: 'Assistant Professor (Subject Teacher - OS)',
        role: 'faculty',
        qualification: 'M.Tech in CSE (NIT Rourkela)',
        specialization: 'Operating Systems & Computer Networks',
        experienceYears: 7,
        cabin: 'Academic Block-A, Room 208',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2021-08-10'
      },
      {
        id: 'fac-cse-03',
        name: 'Prof. Priya Kumari',
        email: 'priya.faculty@gecpalamu.ac.in',
        phone: '+91 94311 87213',
        department: 'Computer Science and Engineering',
        branchCode: 'CSE',
        designation: 'Assistant Professor (Subject Teacher - DAA)',
        role: 'faculty',
        qualification: 'M.Tech in Software Engineering (BIT Mesra)',
        specialization: 'Design & Analysis of Algorithms, Data Science',
        experienceYears: 6,
        cabin: 'Academic Block-A, Room 210',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2022-01-15'
      },
      {
        id: 'fac-cse-04',
        name: 'Prof. Rajesh Gupta',
        email: 'rajesh.gupta@gecpalamu.ac.in',
        phone: '+91 94311 87214',
        department: 'Computer Science and Engineering',
        branchCode: 'CSE',
        designation: 'Assistant Professor (Web Tech & DBMS)',
        role: 'faculty',
        qualification: 'M.Tech in CSE (IIT Patna)',
        specialization: 'Database Systems & Full Stack Development',
        experienceYears: 5,
        cabin: 'Academic Block-A, Room 212',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2022-08-01'
      },

      // 2. EE HOD & Faculty
      {
        id: 'fac-hod-ee-01',
        name: 'Dr. Vineet Shekhar',
        email: 'dr.vineet@gecpalamu.ac.in',
        phone: '+91 94311 87222',
        department: 'Electrical Engineering',
        branchCode: 'EE',
        designation: 'Head of Department & Associate Professor',
        role: 'hod',
        qualification: 'Ph.D. in Power Systems (NIT Jamshedpur), M.Tech (EE)',
        specialization: 'Smart Grids, Renewable Microgrids & Power Systems',
        experienceYears: 13,
        cabin: 'Academic Block-B, Room 108',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2019-01-10'
      },
      {
        id: 'fac-ee-02',
        name: 'Prof. Neha Agarwal',
        email: 'neha.ee@gecpalamu.ac.in',
        phone: '+91 94311 87223',
        department: 'Electrical Engineering',
        branchCode: 'EE',
        designation: 'Assistant Professor (Control Systems)',
        role: 'faculty',
        qualification: 'M.Tech in Control & Instrumentation (IIT ISM)',
        specialization: 'Control Systems Engineering & Automation',
        experienceYears: 6,
        cabin: 'Academic Block-B, Room 112',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2021-03-20'
      },
      {
        id: 'fac-ee-03',
        name: 'Prof. Alok Tiwari',
        email: 'alok.ee@gecpalamu.ac.in',
        phone: '+91 94311 87224',
        department: 'Electrical Engineering',
        branchCode: 'EE',
        designation: 'Assistant Professor (Power Electronics)',
        role: 'faculty',
        qualification: 'M.Tech in Power Electronics (NIT Calicut)',
        specialization: 'Electric Drives & Power Electronics Converters',
        experienceYears: 7,
        cabin: 'Academic Block-B, Room 115',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2020-09-01'
      },

      // 3. Mechanical HOD & Faculty
      {
        id: 'fac-hod-me-01',
        name: 'Dr. Shivam Verma',
        email: 'dr.shivam@gecpalamu.ac.in',
        phone: '+91 94311 87233',
        department: 'Mechanical Engineering',
        branchCode: 'ME',
        designation: 'Head of Department & Associate Professor',
        role: 'hod',
        qualification: 'Ph.D. in Thermal Engineering (BIT Mesra), M.Tech (ME)',
        specialization: 'Thermal Engineering, Robotics & CAD/CAM',
        experienceYears: 15,
        cabin: 'Workshop Complex, Room M-101',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2017-08-01'
      },
      {
        id: 'fac-me-02',
        name: 'Prof. Rahul Sinha',
        email: 'rahul.me@gecpalamu.ac.in',
        phone: '+91 94311 87234',
        department: 'Mechanical Engineering',
        branchCode: 'ME',
        designation: 'Assistant Professor (Fluid Mechanics)',
        role: 'faculty',
        qualification: 'M.Tech in Thermal & Fluids (IIT Roorkee)',
        specialization: 'Fluid Mechanics & Hydraulic Machinery',
        experienceYears: 8,
        cabin: 'Workshop Complex, Room M-105',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2021-02-15'
      },
      {
        id: 'fac-me-03',
        name: 'Prof. Sunita Soren',
        email: 'sunita.me@gecpalamu.ac.in',
        phone: '+91 94311 87235',
        department: 'Mechanical Engineering',
        branchCode: 'ME',
        designation: 'Assistant Professor (Manufacturing Sciences)',
        role: 'faculty',
        qualification: 'M.Tech in Production Engineering (NIT Jamshedpur)',
        specialization: 'Manufacturing Processes & Materials',
        experienceYears: 5,
        cabin: 'Workshop Complex, Room M-108',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2022-07-10'
      },

      // 4. Civil HOD & Faculty
      {
        id: 'fac-hod-ce-01',
        name: 'Dr. Manish Ranjan',
        email: 'dr.manish@gecpalamu.ac.in',
        phone: '+91 94311 87244',
        department: 'Civil Engineering',
        branchCode: 'CE',
        designation: 'Head of Department & Associate Professor',
        role: 'hod',
        qualification: 'Ph.D. in Structural Engineering (IIT Patna), M.Tech (Civil)',
        specialization: 'Structural Dynamics, Earthquake Engg & Geotechnical Systems',
        experienceYears: 12,
        cabin: 'Civil Engineering Block, Room C-202',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2019-08-20'
      },
      {
        id: 'fac-ce-02',
        name: 'Prof. Vikash Kumar',
        email: 'vikash.ce@gecpalamu.ac.in',
        phone: '+91 94311 87245',
        department: 'Civil Engineering',
        branchCode: 'CE',
        designation: 'Assistant Professor (Hydraulics & Water Resources)',
        role: 'faculty',
        qualification: 'M.Tech in Water Resources (IIT BHU)',
        specialization: 'Hydrology, Water Resources & Environmental Engg',
        experienceYears: 6,
        cabin: 'Civil Engineering Block, Room C-205',
        avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2021-11-01'
      },
      {
        id: 'fac-ce-03',
        name: 'Prof. Ananya Roy',
        email: 'ananya.ce@gecpalamu.ac.in',
        phone: '+91 94311 87246',
        department: 'Civil Engineering',
        branchCode: 'CE',
        designation: 'Assistant Professor (Surveying & Concrete Tech)',
        role: 'faculty',
        qualification: 'M.Tech in Structural Engineering (NIT Durgapur)',
        specialization: 'Geotechnical Soil Testing, Surveying & GIS',
        experienceYears: 5,
        cabin: 'Civil Engineering Block, Room C-208',
        avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=400',
        joiningDate: '2022-09-15'
      }
    ];

    for (const fac of facultyList) {
      await p.query(`
        INSERT INTO faculty_members (
          id, name, email, phone, department, branchCode, designation, role,
          qualification, specialization, experienceYears, cabin, avatar, joiningDate, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          phone = VALUES(phone),
          department = VALUES(department),
          branchCode = VALUES(branchCode),
          designation = VALUES(designation),
          role = VALUES(role),
          qualification = VALUES(qualification),
          specialization = VALUES(specialization),
          experienceYears = VALUES(experienceYears),
          cabin = VALUES(cabin),
          avatar = VALUES(avatar),
          joiningDate = VALUES(joiningDate),
          status = 'ACTIVE';
      `, [
        fac.id, fac.name, fac.email, fac.phone, fac.department, fac.branchCode,
        fac.designation, fac.role, fac.qualification, fac.specialization,
        fac.experienceYears, fac.cabin, fac.avatar, fac.joiningDate, new Date().toISOString()
      ]);

      const [existingUser] = await p.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [fac.email]);
      if (existingUser.length > 0) {
        await p.query(`
          UPDATE users 
          SET name = ?, role = ?, designation = ?, department = ?, branch = ?, branchCode = ?, status = 'APPROVED'
          WHERE LOWER(email) = LOWER(?)
        `, [fac.name, fac.role, fac.designation, fac.department, fac.department, fac.branchCode, fac.email]);
      } else {
        await p.query(`
          INSERT INTO users (
            id, name, email, password, role, designation, department, branch, branchCode, status, createdAt, approvedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)
        `, [
          `usr-${fac.id}`, fac.name, fac.email, FACULTY_PASS, fac.role,
          fac.designation, fac.department, fac.department, fac.branchCode,
          new Date().toISOString(), new Date().toISOString()
        ]);
      }
    }

    // Demote old akverma to faculty so he's not conflicting with Dr. Bhawesh Kumar
    try {
      await p.query(`
        UPDATE users 
        SET role = 'faculty', designation = 'Professor Emeritus & Senior Advisor'
        WHERE LOWER(email) = 'akverma@gecpalamu.ac.in'
      `);
    } catch (_) {}

    console.log('🏛️ Initialized 4 Branch HODs and departmental faculty members in MySQL.');
  } catch (err) {
    console.warn('Faculty members seeding notice:', err.message);
  }
}

async function migrateFromSqliteIfAvailable() {
  const p = await getPool();
  const [userCount] = await p.query('SELECT COUNT(*) as count FROM users');
  if (userCount[0].count > 0) {
    await ensureEssentialRoles();
    return;
  }

  const sqlitePath = path.join(__dirname, 'data', 'gecpalamu.db');
  if (fs.existsSync(sqlitePath)) {
    console.log('🔄 Migrating existing records from SQLite into MySQL...');
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const sqlite = new DatabaseSync(sqlitePath);

      const users = sqlite.prepare('SELECT * FROM users').all();
      for (const u of users) {
        await p.query(`
          INSERT IGNORE INTO users (
            id, name, email, password, role, designation, department,
            rollNo, regNo, branch, branchCode, semester, batch, cgpa,
            bloodGroup, status, avatar, contact, guardianName, hostelResident,
            hostelName, category, dob, createdAt, approvedAt, approvedBy, rejectionReason
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          u.id, u.name, u.email, u.password, u.role, u.designation || null, u.department || null,
          u.rollNo || null, u.regNo || null, u.branch || null, u.branchCode || null, u.semester || null,
          u.batch || null, u.cgpa || null, u.bloodGroup || null, u.status || 'APPROVED', u.avatar || null,
          u.contact || null, u.guardianName || null, u.hostelResident ? 1 : 0, u.hostelName || null,
          u.category || null, u.dob || null, u.createdAt || new Date().toISOString(), u.approvedAt || null,
          u.approvedBy || null, u.rejectionReason || null
        ]);
      }
      console.log(`✅ Migrated ${users.length} users into MySQL.`);

      const atts = sqlite.prepare('SELECT * FROM attendance_records').all();
      for (const a of atts) {
        await p.query(`
          INSERT IGNORE INTO attendance_records (
            id, studentId, rollNo, studentName, subjectCode, subjectName,
            date, sessionTime, verifiedVia, facultyId, status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          a.id, a.studentId, a.rollNo, a.studentName, a.subjectCode, a.subjectName,
          a.date, a.sessionTime, a.verifiedVia, a.facultyId, a.status, a.createdAt || new Date().toISOString()
        ]);
      }

      const subAtts = sqlite.prepare('SELECT * FROM student_subject_attendance').all();
      for (const sa of subAtts) {
        await p.query(`
          INSERT IGNORE INTO student_subject_attendance (
            id, studentId, rollNo, subjectCode, subjectName,
            totalClasses, attendedClasses, lastAttendedDate, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sa.id, sa.studentId, sa.rollNo, sa.subjectCode, sa.subjectName,
          sa.totalClasses || 0, sa.attendedClasses || 0, sa.lastAttendedDate || null, sa.updatedAt || new Date().toISOString()
        ]);
      }

      const grades = sqlite.prepare('SELECT * FROM student_grades').all();
      for (const g of grades) {
        await p.query(`
          INSERT IGNORE INTO student_grades (
            id, studentId, rollNo, subjectCode, subjectName,
            midTerm, assignment, sessional, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          g.id, g.studentId, g.rollNo, g.subjectCode, g.subjectName,
          g.midTerm || 0, g.assignment || 0, g.sessional || 0, g.updatedAt || new Date().toISOString()
        ]);
      }

      const fees = sqlite.prepare('SELECT * FROM fee_transactions').all();
      for (const f of fees) {
        await p.query(`
          INSERT IGNORE INTO fee_transactions (
            id, refNo, studentId, studentName, rollNo, regNo, branch, semester,
            purpose, feeType, amount, concessionCategory, paymentMode, upiId, utrNumber,
            status, institution, merchantCode, securityHash, date, time, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          f.id, f.refNo, f.studentId, f.studentName, f.rollNo, f.regNo || null, f.branch || null, f.semester || null,
          f.purpose, f.feeType, f.amount, f.concessionCategory || 'general', f.paymentMode, f.upiId || '6205482672@ptsbi',
          f.utrNumber || null, f.status, f.institution, f.merchantCode, f.securityHash, f.date, f.time, f.timestamp
        ]);
      }

      const libs = sqlite.prepare('SELECT * FROM library_resources').all();
      for (const l of libs) {
        await p.query(`
          INSERT IGNORE INTO library_resources (
            id, title, category, branch, semester, year, fileType, size,
            downloads, rating, uploadedBy, uploaderId, tags, verifiedByAdmin, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          l.id, l.title, l.category, l.branch, l.semester, l.year || '2026', l.fileType || 'PDF', l.size || '1.0 MB',
          l.downloads || 0, l.rating || 5.0, l.uploadedBy || 'Academic Cell', l.uploaderId || null, l.tags || '[]',
          l.verifiedByAdmin ? 1 : 0, l.createdAt || new Date().toISOString()
        ]);
      }

      const bcs = sqlite.prepare('SELECT * FROM teacher_broadcasts').all();
      for (const b of bcs) {
        await p.query(`
          INSERT IGNORE INTO teacher_broadcasts (
            id, teacherId, teacherName, teacherDesignation, subjectCode, subjectName,
            title, message, type, targetAudience, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          b.id, b.teacherId, b.teacherName, b.teacherDesignation || null, b.subjectCode || null, b.subjectName || null,
          b.title, b.message, b.type || 'info', b.targetAudience || 'All Students', b.createdAt || new Date().toISOString()
        ]);
      }
      console.log('🎉 SQLite records completely transferred into MySQL Database gec_palamu!');
    } catch (migErr) {
      console.warn('SQLite migration warning:', migErr);
    }
  }

  await ensureEssentialRoles();
}

async function ensureEssentialRoles() {
  const p = await getPool();
  try {
    const SALT = await bcrypt.genSalt(10);
    const HOD_PASS = await bcrypt.hash('Faculty@123', SALT);
    const TEACHER_PASS = await bcrypt.hash('Faculty@123', SALT);

    const [hod] = await p.query('SELECT * FROM users WHERE LOWER(email) = ?', ['akverma@gecpalamu.ac.in']);
    if (hod.length > 0) {
      await p.query("UPDATE users SET role = 'hod', designation = 'Head of Department & Associate Professor' WHERE LOWER(email) = ?", ['akverma@gecpalamu.ac.in']);
    } else {
      await p.query(`
        INSERT INTO users (id, name, email, password, role, designation, department, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['usr-fac-01', 'Dr. A. K. Verma', 'akverma@gecpalamu.ac.in', HOD_PASS, 'hod', 'Head of Department & Associate Professor', 'Computer Science and Engineering', 'APPROVED', new Date().toISOString()]);
    }

    const [t1] = await p.query('SELECT * FROM users WHERE LOWER(email) = ?', ['amit.sharma@gecpalamu.ac.in']);
    if (t1.length === 0) {
      await p.query(`
        INSERT INTO users (id, name, email, password, role, designation, department, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['usr-teacher-01', 'Prof. Amit Sharma', 'amit.sharma@gecpalamu.ac.in', TEACHER_PASS, 'faculty', 'Assistant Professor (Subject Teacher - OS)', 'Computer Science and Engineering', 'APPROVED', new Date().toISOString()]);
    }

    const [t2] = await p.query('SELECT * FROM users WHERE LOWER(email) = ?', ['priya.faculty@gecpalamu.ac.in']);
    if (t2.length === 0) {
      await p.query(`
        INSERT INTO users (id, name, email, password, role, designation, department, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['usr-teacher-02', 'Prof. Priya Kumari', 'priya.faculty@gecpalamu.ac.in', TEACHER_PASS, 'faculty', 'Assistant Professor (Subject Teacher - DAA)', 'Computer Science and Engineering', 'APPROVED', new Date().toISOString()]);
    }
  } catch (err) {
    console.warn('ensureEssentialRoles warning:', err.message);
  }
}

export const mysqlDb = {
  // --- User & Student Authentication ---
  findUserByEmail: async (email) => {
    if (!email) return null;
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email.trim()]);
    return rows[0] || null;
  },

  findUserById: async (id) => {
    if (!id) return null;
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  findUserByRoll: async (rollNo) => {
    if (!rollNo) return null;
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM users WHERE LOWER(rollNo) = LOWER(?) LIMIT 1', [rollNo.trim()]);
    return rows[0] || null;
  },

  createUser: async (user) => {
    const p = await getPool();
    await p.query(`
      INSERT INTO users (
        id, name, email, password, role, designation, department,
        rollNo, regNo, branch, branchCode, semester, batch, cgpa,
        bloodGroup, status, avatar, contact, guardianName, hostelResident,
        hostelName, category, dob, createdAt, approvedAt, approvedBy, rejectionReason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id, user.name, user.email, user.password, user.role || 'student',
      user.designation || null, user.department || null, user.rollNo || null,
      user.regNo || null, user.branch || null, user.branchCode || null,
      user.semester || null, user.batch || null, user.cgpa || null,
      user.bloodGroup || null, user.status || 'PENDING', user.avatar || null,
      user.contact || null, user.guardianName || null, user.hostelResident ? 1 : 0,
      user.hostelName || null, user.category || null, user.dob || null,
      user.createdAt || new Date().toISOString(), user.approvedAt || null,
      user.approvedBy || null, user.rejectionReason || null
    ]);

    // Initialize fee dues for this student
    if (user.role === 'student') {
      await mysqlDb.ensureStudentFeeDues(user.id, user.rollNo);
    }

    return mysqlDb.findUserById(user.id);
  },

  updateUser: async (id, updates = {}) => {
    const p = await getPool();
    const keys = Object.keys(updates).filter(k => k !== 'id');
    if (keys.length === 0) return mysqlDb.findUserById(id);

    const setClauses = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(id);

    await p.query(`UPDATE users SET ${setClauses} WHERE id = ?`, values);
    return mysqlDb.findUserById(id);
  },

  updateStudentProfile: async (studentId, updates = {}) => {
    const p = await getPool();
    const fields = [];
    const params = [];
    const allowed = ['name', 'contact', 'guardianName', 'bloodGroup', 'category', 'dob', 'hostelResident', 'hostelName', 'avatar', 'cgpa', 'semester', 'branch'];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`\`${key}\` = ?`);
        params.push(updates[key]);
      }
    }

    if (fields.length > 0) {
      params.push(studentId);
      await p.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    return mysqlDb.findUserById(studentId);
  },

  getPendingStudents: async () => {
    const p = await getPool();
    const [rows] = await p.query(`
      SELECT * FROM users 
      WHERE role = 'student' AND status = 'PENDING' 
      ORDER BY createdAt DESC
    `);
    return rows;
  },

  approveStudent: async (studentId, adminId) => {
    const p = await getPool();
    const approvedAt = new Date().toISOString();
    await p.query(`
      UPDATE users 
      SET status = 'APPROVED', approvedAt = ?, approvedBy = ? 
      WHERE id = ?
    `, [approvedAt, adminId, studentId]);

    const student = await mysqlDb.findUserById(studentId);
    if (student) {
      await mysqlDb.ensureStudentFeeDues(student.id, student.rollNo);
    }

    return student;
  },

  rejectStudent: async (studentId, reason) => {
    const p = await getPool();
    await p.query(`
      UPDATE users 
      SET status = 'REJECTED', rejectionReason = ? 
      WHERE id = ?
    `, [reason || 'Document verification failed', studentId]);

    return mysqlDb.findUserById(studentId);
  },

  getApprovedStudents: async (branchCode = null, semester = null) => {
    const p = await getPool();
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
    const [rows] = await p.query(query, params);
    return rows;
  },

  getAllStudents: async () => {
    const p = await getPool();
    const [rows] = await p.query("SELECT id, name, email, rollNo, regNo, branch, branchCode, semester, batch, cgpa, bloodGroup, status, avatar, contact, guardianName, hostelResident, hostelName, category, dob, createdAt, approvedAt, rejectionReason FROM users WHERE role = 'student' ORDER BY createdAt DESC;");
    return rows;
  },

  resetAllStudentData: async () => {
    const p = await getPool();
    await p.query("DELETE FROM users WHERE role = 'student'");
    await p.query("DELETE FROM attendance_records");
    await p.query("DELETE FROM fee_transactions");
    await p.query("DELETE FROM student_grades");
    await p.query("DELETE FROM student_subject_attendance");
    await p.query("DELETE FROM student_fee_dues");
    return { success: true, message: 'All student accounts and related records wiped successfully from MySQL.' };
  },

  // --- Smart Attendance & Duplicate Prevention ---
  recordAttendance: async (record) => {
    const p = await getPool();
    const date = record.date || new Date().toISOString().split('T')[0];
    const sId = (record.studentId || '').trim();
    const rNo = (record.rollNo || '').trim();
    const sCode = (record.subjectCode || '').trim();

    // Check if attendance already recorded today for this session
    const [existingToday] = await p.query(`
      SELECT * FROM attendance_records 
      WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != ''))
        AND LOWER(subjectCode) = LOWER(?)
        AND date = ?
      LIMIT 1
    `, [sId, rNo, sCode, date]);

    if (existingToday.length > 0) {
      // Already marked today: update verification timestamp, do not increment totalClasses twice!
      const isPresent = record.status === 'PRESENT' || record.status === 'present';
      await p.query(`
        UPDATE attendance_records 
        SET sessionTime = ?, status = ?, verifiedVia = ? 
        WHERE id = ?
      `, [record.sessionTime || new Date().toLocaleTimeString(), isPresent ? 'PRESENT' : 'ABSENT', record.verifiedVia || 'SMART_QR', existingToday[0].id]);

      return {
        ...record,
        id: existingToday[0].id,
        alreadyRecorded: true,
        message: 'Attendance already verified for today\'s session!'
      };
    }

    // New class session record
    await p.query(`
      INSERT INTO attendance_records (
        id, studentId, rollNo, studentName, subjectCode, subjectName,
        date, sessionTime, verifiedVia, facultyId, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      record.id, sId, rNo, record.studentName,
      sCode, record.subjectName, date, record.sessionTime,
      record.verifiedVia || 'SMART_QR', record.facultyId || 'usr-fac-01',
      record.status || 'PRESENT', record.createdAt || new Date().toISOString()
    ]);

    // Synchronize to student_subject_attendance
    try {
      const now = new Date().toISOString();
      const isPresent = record.status === 'PRESENT' || record.status === 'present';
      const [existingSub] = await p.query(`
        SELECT * FROM student_subject_attendance 
        WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != ''))
          AND LOWER(subjectCode) = LOWER(?)
        LIMIT 1
      `, [sId, rNo, sCode]);

      if (existingSub.length > 0) {
        await p.query(`
          UPDATE student_subject_attendance 
          SET totalClasses = totalClasses + 1,
              attendedClasses = attendedClasses + ?,
              lastAttendedDate = CASE WHEN ? = 1 THEN ? ELSE lastAttendedDate END,
              updatedAt = ?
          WHERE id = ?
        `, [isPresent ? 1 : 0, isPresent ? 1 : 0, date, now, existingSub[0].id]);
      } else {
        const newId = `subatt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await p.query(`
          INSERT INTO student_subject_attendance (
            id, studentId, rollNo, subjectCode, subjectName,
            totalClasses, attendedClasses, lastAttendedDate, updatedAt
          ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
        `, [newId, sId, rNo, sCode, record.subjectName || sCode, isPresent ? 1 : 0, isPresent ? date : null, now]);
      }
    } catch (err) {
      console.warn('Could not sync student_subject_attendance in recordAttendance:', err);
    }

    return record;
  },

  // Faculty Bulk Attendance Marking with Strict Idempotence / Duplicate Prevention & HOD Override Rule
  recordSessionAttendance: async (sessionData, requestUser = null) => {
    const {
      facultyId = 'faculty-01',
      subjectCode,
      subjectName = '',
      date = new Date().toISOString().split('T')[0],
      sessionTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      records = []
    } = sessionData;

    if (!subjectCode || !Array.isArray(records)) {
      throw new Error('subjectCode and records array are required');
    }

    const isHodOrAdmin = Boolean(
      requestUser?.role === 'hod' || 
      requestUser?.role === 'admin' ||
      (requestUser?.email && requestUser.email.toLowerCase().includes('akverma')) ||
      sessionData.isHodOverride
    );

    const p = await getPool();
    const now = new Date().toISOString();
    const results = [];
    let lockedCount = 0;
    let updatedCount = 0;
    let newCount = 0;

    for (const r of records) {
      const sId = (r.studentId || '').trim();
      const rNo = (r.rollNo || '').trim();
      if (!sId && !rNo) continue;

      const isPresent = r.status === 'present' || r.present === true;
      const targetStatus = isPresent ? 'PRESENT' : 'ABSENT';

      // 1. Check if this student already has an attendance entry for this subject on this date!
      const [existingLog] = await p.query(`
        SELECT * FROM attendance_records 
        WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != ''))
          AND LOWER(subjectCode) = LOWER(?)
          AND date = ?
        LIMIT 1
      `, [sId, rNo, subjectCode.trim(), date]);

      // 2. Query student_subject_attendance
      const [existingSub] = await p.query(`
        SELECT * FROM student_subject_attendance 
        WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != ''))
          AND LOWER(subjectCode) = LOWER(?)
        LIMIT 1
      `, [sId, rNo, subjectCode.trim()]);

      if (existingLog.length > 0) {
        // Attendance was ALREADY marked for today!
        const prevStatus = existingLog[0].status;

        if (!isHodOrAdmin) {
          // Rule: Attendance is marked only once in a day, and if marked it won't be changed by regular faculty!
          lockedCount++;
          results.push({
            studentId: sId,
            rollNo: rNo,
            status: prevStatus,
            locked: true,
            reason: 'Attendance already recorded for today and is locked. HOD authorization required to modify.'
          });
          continue;
        }

        // HOD Authorization Granted: modify existing record
        await p.query(`
          UPDATE attendance_records 
          SET status = ?, sessionTime = ?, facultyId = ?, verifiedVia = 'HOD_AUTHORIZED_CORRECTION' 
          WHERE id = ?
        `, [targetStatus, sessionTime, facultyId, existingLog[0].id]);

        // Adjust attendedClasses ONLY if status changed between ABSENT and PRESENT (do not increment totalClasses)
        if (existingSub.length > 0 && prevStatus !== targetStatus) {
          let deltaAttended = 0;
          if (prevStatus === 'ABSENT' && targetStatus === 'PRESENT') deltaAttended = 1;
          if (prevStatus === 'PRESENT' && targetStatus === 'ABSENT') deltaAttended = -1;

          await p.query(`
            UPDATE student_subject_attendance 
            SET attendedClasses = GREATEST(0, attendedClasses + ?),
                lastAttendedDate = CASE WHEN ? = 1 THEN ? ELSE lastAttendedDate END,
                updatedAt = ?
            WHERE id = ?
          `, [deltaAttended, targetStatus === 'PRESENT' ? 1 : 0, date, now, existingSub[0].id]);
        }

        updatedCount++;
        results.push({ studentId: sId, rollNo: rNo, status: targetStatus, hodOverride: true });
      } else {
        // First time marking for this date: insert new log record
        const logId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await p.query(`
          INSERT INTO attendance_records (
            id, studentId, rollNo, studentName, subjectCode, subjectName,
            date, sessionTime, verifiedVia, facultyId, status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          logId, sId, rNo, r.studentName || r.name || 'Student',
          subjectCode, subjectName || subjectCode, date, sessionTime,
          'MANUAL_FACULTY_MARK', facultyId, targetStatus, now
        ]);

        // Increment totalClasses and attendedClasses
        if (existingSub.length > 0) {
          await p.query(`
            UPDATE student_subject_attendance 
            SET totalClasses = totalClasses + 1,
                attendedClasses = attendedClasses + ?,
                lastAttendedDate = CASE WHEN ? = 1 THEN ? ELSE lastAttendedDate END,
                updatedAt = ?
            WHERE id = ?
          `, [isPresent ? 1 : 0, isPresent ? 1 : 0, date, now, existingSub[0].id]);
        } else {
          const newId = `subatt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          await p.query(`
            INSERT INTO student_subject_attendance (
              id, studentId, rollNo, subjectCode, subjectName,
              totalClasses, attendedClasses, lastAttendedDate, updatedAt
            ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
          `, [newId, sId, rNo, subjectCode, subjectName || subjectCode, isPresent ? 1 : 0, isPresent ? date : null, now]);
        }

        newCount++;
        results.push({ studentId: sId, rollNo: rNo, status: targetStatus, newRecord: true });
      }
    }

    if (lockedCount > 0 && newCount === 0 && updatedCount === 0) {
      return {
        success: false,
        locked: true,
        message: 'Attendance for this session was already recorded today and is locked. Per institutional academic regulations, only the Head of Department (HOD) can modify recorded attendance.',
        subjectCode,
        date,
        lockedCount,
        records: results
      };
    }

    return {
      success: true,
      locked: lockedCount > 0,
      hodOverride: updatedCount > 0,
      message: updatedCount > 0
        ? `HOD Authorized Update: Attendance modified for ${updatedCount} students in ${subjectCode}.`
        : `Successfully recorded attendance for ${newCount} students in ${subjectCode}.`,
      subjectCode,
      date,
      count: results.length,
      newCount,
      updatedCount,
      lockedCount,
      records: results
    };
  },

  // Student Academic Progression: Advance Semester & Re-provision Fees
  promoteStudentSemester: async (studentIdOrRoll, newSemester, cgpa = null) => {
    if (!studentIdOrRoll || !newSemester) {
      throw new Error('Student identifier and newSemester are required.');
    }
    const val = String(studentIdOrRoll).trim();
    const p = await getPool();

    // 1. Locate student in MySQL users table
    const [rows] = await p.query(`
      SELECT * FROM users 
      WHERE LOWER(id) = LOWER(?) OR (rollNo != '' AND LOWER(rollNo) = LOWER(?))
      LIMIT 1
    `, [val, val]);

    if (rows.length === 0) {
      throw new Error(`Student ${val} not found in database.`);
    }

    const student = rows[0];
    const prevSemester = student.semester;
    const now = new Date().toISOString();

    // 2. Update user's semester and CGPA
    const validCgpa = (typeof cgpa === 'number' && !isNaN(cgpa)) ? Number(cgpa.toFixed(2)) : (student.cgpa || null);
    await p.query(`
      UPDATE users 
      SET semester = ?, cgpa = COALESCE(?, cgpa)
      WHERE id = ?
    `, [newSemester, validCgpa, student.id]);

    // 3. Re-provision upcoming semester examination fee dues (₹2,400) in student_fee_dues
    await mysqlDb.ensureStudentFeeDues(student.id, student.rollNo);
    await p.query(`
      UPDATE student_fee_dues 
      SET examDue = 2400, examPaid = 0, updatedAt = ?
      WHERE LOWER(studentId) = LOWER(?) OR (rollNo != '' AND LOWER(rollNo) = LOWER(?))
    `, [now, student.id, student.rollNo || '']);

    const [updatedRows] = await p.query('SELECT * FROM users WHERE id = ?', [student.id]);
    const { password, ...safeStudent } = updatedRows[0];

    return {
      success: true,
      message: `Student ${safeStudent.name} (${safeStudent.rollNo || safeStudent.id}) successfully promoted from ${prevSemester} to ${newSemester}! Examination dues for ${newSemester} initialized.`,
      previousSemester: prevSemester,
      newSemester,
      student: safeStudent
    };
  },

  getAttendanceLogs: async (filter = {}) => {
    const p = await getPool();
    let query = 'SELECT * FROM attendance_records WHERE 1=1';
    const params = [];

    if (filter.studentId) {
      query += ' AND (studentId = ? OR LOWER(rollNo) = LOWER(?))';
      params.push(filter.studentId, filter.studentId);
    }
    if (filter.subjectCode) {
      query += ' AND LOWER(subjectCode) = LOWER(?)';
      params.push(filter.subjectCode);
    }
    if (filter.date) {
      query += ' AND date = ?';
      params.push(filter.date);
    }

    query += ' ORDER BY createdAt DESC LIMIT 100;';
    const [rows] = await p.query(query, params);
    return rows;
  },

  getStudentSubjectAttendance: async (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    const val = String(studentIdOrRoll).trim();
    const p = await getPool();
    const [rows] = await p.query(`
      SELECT * FROM student_subject_attendance 
      WHERE LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')
    `, [val, val]);
    return rows;
  },

  getSubjectAttendanceLedger: async (subjectCode) => {
    if (!subjectCode) return [];
    const p = await getPool();
    const [rows] = await p.query(`
      SELECT * FROM student_subject_attendance 
      WHERE LOWER(subjectCode) = LOWER(?)
    `, [String(subjectCode).trim()]);
    return rows;
  },

  resetAttendanceData: async () => {
    const p = await getPool();
    await p.query('DELETE FROM attendance_records');
    await p.query('DELETE FROM student_subject_attendance');
    return { success: true, message: 'All attendance records cleared from MySQL.' };
  },

  // --- Internal Evaluation & Examination Grades ---
  saveStudentGrade: async (grade) => {
    const sId = (grade.studentId || '').trim();
    const rNo = (grade.rollNo || '').trim();
    const sCode = (grade.subjectCode || '').trim();
    const p = await getPool();

    const [existing] = await p.query(`
      SELECT id FROM student_grades 
      WHERE (LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')) 
        AND LOWER(subjectCode) = LOWER(?)
      LIMIT 1
    `, [sId, rNo, sCode]);

    if (existing.length > 0) {
      await p.query(`
        UPDATE student_grades 
        SET midTerm = ?, assignment = ?, sessional = ?, updatedAt = ?
        WHERE id = ?
      `, [grade.midTerm || 0, grade.assignment || 0, grade.sessional || 0, new Date().toISOString(), existing[0].id]);
      return { id: existing[0].id, ...grade };
    } else {
      const id = `grd-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;
      await p.query(`
        INSERT INTO student_grades (id, studentId, rollNo, subjectCode, subjectName, midTerm, assignment, sessional, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, sId, rNo, sCode,
        grade.subjectName || '',
        grade.midTerm || 0,
        grade.assignment || 0,
        grade.sessional || 0,
        new Date().toISOString()
      ]);
      return { id, ...grade };
    }
  },

  getStudentGrades: async (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    const val = String(studentIdOrRoll).trim();
    const p = await getPool();
    const [rows] = await p.query(`
      SELECT * FROM student_grades 
      WHERE LOWER(studentId) = LOWER(?) OR (LOWER(rollNo) = LOWER(?) AND rollNo != '')
    `, [val, val]);
    return rows;
  },

  getSubjectGrades: async (subjectCode) => {
    if (!subjectCode) return [];
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM student_grades WHERE LOWER(subjectCode) = LOWER(?)', [String(subjectCode).trim()]);
    return rows;
  },

  // --- Fee Dues & Transactions with UTR & Balance Sync ---
  ensureStudentFeeDues: async (studentId, rollNo) => {
    const p = await getPool();
    const rNo = (rollNo || '').trim();
    const sId = (studentId || '').trim();

    // Check whether the student is a registered hostel boarder
    const [uRows] = await p.query(`
      SELECT hostelResident FROM users 
      WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (id != '' AND LOWER(id) = LOWER(?))
      LIMIT 1
    `, [rNo, sId]);
    const isHostelResident = uRows.length > 0 ? Boolean(uRows[0].hostelResident) : false;
    const initialHostelDue = isHostelResident ? 6000 : 0;

    const [rows] = await p.query(`
      SELECT * FROM student_fee_dues 
      WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (studentId != '' AND LOWER(studentId) = LOWER(?))
      LIMIT 1
    `, [rNo, sId]);

    if (rows.length === 0) {
      const id = `fee-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      await p.query(`
        INSERT INTO student_fee_dues (
          id, studentId, rollNo, tuitionDue, examDue, hostelDue, libraryDue,
          tuitionPaid, examPaid, hostelPaid, libraryPaid, updatedAt
        ) VALUES (?, ?, ?, 15200, 2400, ?, 0, 0, 0, 0, 0, ?)
      `, [id, sId, rNo, initialHostelDue, new Date().toISOString()]);

      return {
        id, studentId: sId, rollNo: rNo,
        tuitionDue: 15200, examDue: 2400, hostelDue: initialHostelDue, libraryDue: 0,
        tuitionPaid: 0, examPaid: 0, hostelPaid: 0, libraryPaid: 0,
        hostelResident: isHostelResident
      };
    }

    // If existing record has hostelDue > 0 but student is a Day Scholar, enforce hostelDue = 0
    if (!isHostelResident && rows[0].hostelDue > 0) {
      await p.query('UPDATE student_fee_dues SET hostelDue = 0 WHERE id = ?', [rows[0].id]);
      rows[0].hostelDue = 0;
    }

    return { ...rows[0], hostelResident: isHostelResident };
  },

  getStudentFeeDues: async (studentIdOrRoll) => {
    if (!studentIdOrRoll) return null;
    const val = String(studentIdOrRoll).trim();
    const p = await getPool();

    // Check hostel status from users table
    const [uRows] = await p.query(`
      SELECT hostelResident FROM users 
      WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (id != '' AND LOWER(id) = LOWER(?))
      LIMIT 1
    `, [val, val]);
    const isHostelResident = uRows.length > 0 ? Boolean(uRows[0].hostelResident) : false;

    let [rows] = await p.query(`
      SELECT * FROM student_fee_dues 
      WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (studentId != '' AND LOWER(studentId) = LOWER(?))
      LIMIT 1
    `, [val, val]);

    if (rows.length === 0) {
      // Find student details to initialize
      const [user] = await p.query('SELECT id, rollNo FROM users WHERE LOWER(id) = LOWER(?) OR (rollNo != "" AND LOWER(rollNo) = LOWER(?)) LIMIT 1', [val, val]);
      if (user.length > 0) {
        return mysqlDb.ensureStudentFeeDues(user[0].id, user[0].rollNo);
      }
      return {
        tuitionDue: 15200, examDue: 2400, hostelDue: isHostelResident ? 6000 : 0, libraryDue: 0,
        tuitionPaid: 0, examPaid: 0, hostelPaid: 0, libraryPaid: 0,
        hostelResident: isHostelResident
      };
    }

    // Enforce 0 hostel dues for Day Scholars
    if (!isHostelResident && rows[0].hostelDue > 0) {
      await p.query('UPDATE student_fee_dues SET hostelDue = 0 WHERE id = ?', [rows[0].id]);
      rows[0].hostelDue = 0;
    }

    return { ...rows[0], hostelResident: isHostelResident };
  },

  findFeeTransactionByUtr: async (utrNumber) => {
    if (!utrNumber) return null;
    const clean = String(utrNumber).trim();
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM fee_transactions WHERE utrNumber = ? LIMIT 1', [clean]);
    return rows.length > 0 ? rows[0] : null;
  },

  recordFeeTransaction: async (transaction) => {
    const p = await getPool();
    const amount = Number(transaction.amount) || 0;
    const feeType = (transaction.feeType || 'custom').toLowerCase();
    const sId = (transaction.studentId || '').trim();
    const rNo = (transaction.rollNo || '').trim();

    // Resolve genuine student from MySQL users table
    const [matchedUser] = await p.query(
      'SELECT id, rollNo FROM users WHERE (rollNo != "" AND LOWER(rollNo) = LOWER(?)) OR LOWER(id) = LOWER(?) LIMIT 1',
      [rNo, sId]
    );
    const resolvedStudentId = matchedUser.length > 0 ? matchedUser[0].id : sId;
    const resolvedRollNo = matchedUser.length > 0 ? matchedUser[0].rollNo : rNo;

    // 1. Insert transaction record
    await p.query(`
      INSERT INTO fee_transactions (
        id, refNo, studentId, studentName, rollNo, regNo, branch, semester,
        purpose, feeType, amount, concessionCategory, paymentMode, upiId, utrNumber,
        status, institution, merchantCode, securityHash, date, time, timestamp
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      transaction.id, transaction.refNo, resolvedStudentId, transaction.studentName,
      resolvedRollNo, transaction.regNo || null, transaction.branch || null, transaction.semester || null,
      transaction.purpose, transaction.feeType, amount, transaction.concessionCategory || 'general',
      transaction.paymentMode, transaction.upiId || '6205482672@ptsbi', transaction.utrNumber,
      transaction.status || 'SUCCESS', transaction.institution || 'Government Engineering College, Palamu',
      transaction.merchantCode || 'GECP-SBI-COLLECT-822118', transaction.securityHash || 'SHA256-VERIFIED',
      transaction.date, transaction.time, transaction.timestamp || new Date().toISOString()
    ]);

    // 2. Ensure dues record exists and update dues & paid balance atomically
    await mysqlDb.ensureStudentFeeDues(resolvedStudentId, resolvedRollNo);

    if (feeType === 'tuition') {
      await p.query(`
        UPDATE student_fee_dues 
        SET tuitionDue = GREATEST(0, tuitionDue - ?),
            tuitionPaid = tuitionPaid + ?,
            updatedAt = ?
        WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (studentId != '' AND LOWER(studentId) = LOWER(?))
      `, [amount, amount, new Date().toISOString(), resolvedRollNo, resolvedStudentId]);
    } else if (feeType === 'exam') {
      await p.query(`
        UPDATE student_fee_dues 
        SET examDue = GREATEST(0, examDue - ?),
            examPaid = examPaid + ?,
            updatedAt = ?
        WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (studentId != '' AND LOWER(studentId) = LOWER(?))
      `, [amount, amount, new Date().toISOString(), resolvedRollNo, resolvedStudentId]);
    } else if (feeType === 'hostel') {
      await p.query(`
        UPDATE student_fee_dues 
        SET hostelDue = GREATEST(0, hostelDue - ?),
            hostelPaid = hostelPaid + ?,
            updatedAt = ?
        WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (studentId != '' AND LOWER(studentId) = LOWER(?))
      `, [amount, amount, new Date().toISOString(), resolvedRollNo, resolvedStudentId]);
    } else if (feeType === 'library') {
      await p.query(`
        UPDATE student_fee_dues 
        SET libraryDue = GREATEST(0, libraryDue - ?),
            libraryPaid = libraryPaid + ?,
            updatedAt = ?
        WHERE (rollNo != '' AND LOWER(rollNo) = LOWER(?)) OR (studentId != '' AND LOWER(studentId) = LOWER(?))
      `, [amount, amount, new Date().toISOString(), resolvedRollNo, resolvedStudentId]);
    }

    const updatedDues = await mysqlDb.getStudentFeeDues(resolvedRollNo || resolvedStudentId);
    return {
      transaction,
      updatedDues
    };
  },

  getFeeTransactions: async () => {
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM fee_transactions ORDER BY timestamp DESC');
    return rows;
  },

  findFeeTransactionById: async (receiptId) => {
    if (!receiptId) return null;
    const p = await getPool();
    const val = receiptId.trim();
    const [rows] = await p.query(`
      SELECT * FROM fee_transactions 
      WHERE LOWER(id) = LOWER(?) OR LOWER(refNo) = LOWER(?) OR LOWER(utrNumber) = LOWER(?)
      LIMIT 1
    `, [val, val, val]);
    return rows[0] || null;
  },

  getStudentFeeTransactions: async (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    const val = String(studentIdOrRoll).trim();
    const p = await getPool();
    const [rows] = await p.query(`
      SELECT * FROM fee_transactions 
      WHERE studentId = ? OR LOWER(rollNo) = LOWER(?)
      ORDER BY timestamp DESC
    `, [val, val]);
    return rows;
  },

  // --- Digital Library & Resources ---
  getLibraryResources: async (filters = {}) => {
    const p = await getPool();
    let query = 'SELECT * FROM library_resources WHERE 1=1';
    const params = [];

    if (filters.category && filters.category !== 'All') {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.branch && filters.branch !== 'All') {
      query += ' AND branch = ?';
      params.push(filters.branch);
    }
    if (filters.semester && filters.semester !== 'All') {
      query += ' AND semester = ?';
      params.push(filters.semester);
    }
    if (filters.search) {
      query += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?))';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY createdAt DESC;';
    const [rows] = await p.query(query, params);
    return rows.map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || [])
    }));
  },

  findLibraryResourceById: async (id) => {
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM library_resources WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || [])
    };
  },

  createLibraryResource: async (res) => {
    const p = await getPool();
    await p.query(`
      INSERT INTO library_resources (
        id, title, category, branch, semester, year, fileType, size,
        downloads, rating, uploadedBy, uploaderId, tags, verifiedByAdmin, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      res.id, res.title, res.category, res.branch, res.semester,
      res.year || '2026', res.fileType || 'PDF', res.size || '1.0 MB',
      res.downloads || 0, res.rating || 5.0, res.uploadedBy || 'Academic Cell',
      res.uploaderId || null, JSON.stringify(res.tags || []),
      res.verifiedByAdmin ? 1 : 0, res.createdAt || new Date().toISOString()
    ]);
    return res;
  },

  incrementResourceDownload: async (id) => {
    const p = await getPool();
    await p.query('UPDATE library_resources SET downloads = downloads + 1 WHERE id = ?', [id]);
    return mysqlDb.findLibraryResourceById(id);
  },

  deleteLibraryResource: async (id) => {
    const p = await getPool();
    const existing = await mysqlDb.findLibraryResourceById(id);
    if (existing) {
      await p.query('DELETE FROM library_resources WHERE id = ?', [id]);
      return existing;
    }
    return null;
  },

  // --- Teacher Broadcasts & Classroom Notices ---
  getBroadcasts: async () => {
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM teacher_broadcasts ORDER BY createdAt DESC');
    return rows;
  },

  createBroadcast: async (b) => {
    const p = await getPool();
    await p.query(`
      INSERT INTO teacher_broadcasts (
        id, teacherId, teacherName, teacherDesignation, subjectCode, subjectName,
        title, message, type, targetAudience, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      b.id, b.teacherId, b.teacherName, b.teacherDesignation || null,
      b.subjectCode || null, b.subjectName || null, b.title, b.message,
      b.type || 'info', b.targetAudience || 'All Students', b.createdAt || new Date().toISOString()
    ]);
    return b;
  },

  // --- Campus Events & Student Registrations ---
  getAllEvents: async () => {
    const p = await getPool();
    const [rows] = await p.query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_registrations r WHERE r.eventId = e.id) as registeredCount,
        (SELECT COUNT(DISTINCT r.studentId) FROM event_registrations r WHERE r.eventId = e.id) as studentCount
      FROM campus_events e 
      ORDER BY e.date ASC, e.createdAt DESC
    `);
    return rows.map(r => ({
      ...r,
      tracks: typeof r.tracks === 'string' ? (() => { try { return JSON.parse(r.tracks); } catch { return []; } })() : (r.tracks || []),
      rules: typeof r.rules === 'string' ? (() => { try { return JSON.parse(r.rules); } catch { return []; } })() : (r.rules || []),
      registeredCount: Number(r.registeredCount) || 0,
      studentCount: Number(r.studentCount) || 0
    }));
  },

  createEvent: async (evt) => {
    const p = await getPool();
    const id = evt.id || `evt-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;
    const tracksStr = typeof evt.tracks === 'object' ? JSON.stringify(evt.tracks) : (evt.tracks || '[]');
    const rulesStr = typeof evt.rules === 'object' ? JSON.stringify(evt.rules) : (evt.rules || '[]');

    await p.query(`
      INSERT INTO campus_events (
        id, title, tagline, category, badge, date, time, venue, prizePool, teamSize,
        registrationDeadline, status, tracks, rules, organizerName, createdBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      evt.title,
      evt.tagline || '',
      evt.category || 'Technical',
      evt.badge || 'New Event',
      evt.date,
      evt.time || '10:00 AM onwards',
      evt.venue,
      evt.prizePool || 'Certificate of Merit',
      evt.teamSize || 'Individual / Team',
      evt.registrationDeadline || evt.date,
      evt.status || 'Open',
      tracksStr,
      rulesStr,
      evt.organizerName || 'Department of CSE, GEC Palamu',
      evt.createdBy || 'HOD',
      new Date().toISOString()
    ]);

    return {
      ...evt,
      id,
      tracks: typeof evt.tracks === 'object' ? evt.tracks : JSON.parse(tracksStr),
      rules: typeof evt.rules === 'object' ? evt.rules : JSON.parse(rulesStr),
      registeredCount: 0,
      studentCount: 0
    };
  },

  deleteEvent: async (eventId) => {
    const p = await getPool();
    await p.query('DELETE FROM event_registrations WHERE eventId = ?', [eventId]);
    await p.query('DELETE FROM campus_events WHERE id = ?', [eventId]);
    return { success: true, message: `Event ${eventId} deleted successfully.` };
  },

  registerForEvent: async (reg) => {
    const p = await getPool();
    const eventId = (reg.eventId || '').trim();
    const sId = (reg.studentId || reg.rollNo || reg.studentRollNo || '').trim();
    const rNo = (reg.rollNo || reg.studentRollNo || '').trim();

    // Check if student already registered for this event
    const [existing] = await p.query(`
      SELECT * FROM event_registrations 
      WHERE eventId = ? AND ((studentId != '' AND LOWER(studentId) = LOWER(?)) OR (rollNo != '' AND LOWER(rollNo) = LOWER(?)))
      LIMIT 1
    `, [eventId, sId, rNo]);

    if (existing.length > 0) {
      return {
        alreadyRegistered: true,
        message: `Already registered for this event with Ticket ${existing[0].ticketId}`,
        pass: existing[0]
      };
    }

    const ticketId = reg.ticketId || `PASS-GECP-${Math.floor(100000 + Math.random() * 900000)}`;

    await p.query(`
      INSERT INTO event_registrations (
        ticketId, eventId, eventTitle, studentId, rollNo, studentName,
        branch, semester, teamName, leaderName, leaderEmail, teamSize,
        track, venue, date, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ticketId,
      eventId,
      reg.eventTitle || 'Campus Event',
      sId,
      rNo,
      reg.studentName || reg.leaderName || 'Student',
      reg.branch || 'Engineering',
      reg.semester || 'Current Semester',
      reg.teamName || 'Solo',
      reg.leaderName || reg.studentName || 'Student Leader',
      reg.leaderEmail || '',
      reg.teamSize || '1',
      reg.track || 'General',
      reg.venue || 'GEC Palamu Campus',
      reg.date || new Date().toISOString().split('T')[0],
      'CONFIRMED',
      new Date().toISOString()
    ]);

    const pass = {
      ticketId,
      eventId,
      eventTitle: reg.eventTitle,
      studentId: sId,
      rollNo: rNo,
      studentName: reg.studentName || reg.leaderName,
      branch: reg.branch,
      semester: reg.semester,
      teamName: reg.teamName,
      leaderName: reg.leaderName,
      leaderEmail: reg.leaderEmail,
      teamSize: reg.teamSize,
      track: reg.track,
      venue: reg.venue,
      date: reg.date,
      status: 'CONFIRMED',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    return {
      success: true,
      ticketId,
      pass
    };
  },

  getEventRegistrations: async (eventId) => {
    const p = await getPool();
    let query = 'SELECT * FROM event_registrations';
    let params = [];
    if (eventId) {
      query += ' WHERE eventId = ?';
      params.push(eventId);
    }
    query += ' ORDER BY createdAt DESC';
    const [rows] = await p.query(query, params);
    return rows;
  },

  getStudentEventRegistrations: async (studentIdOrRoll) => {
    if (!studentIdOrRoll) return [];
    const p = await getPool();
    const val = String(studentIdOrRoll).trim();
    const [rows] = await p.query(`
      SELECT * FROM event_registrations 
      WHERE (studentId != '' AND LOWER(studentId) = LOWER(?)) 
         OR (rollNo != '' AND LOWER(rollNo) = LOWER(?))
         OR (leaderEmail != '' AND LOWER(leaderEmail) = LOWER(?))
      ORDER BY createdAt DESC
    `, [val, val, val]);
    return rows;
  },

  // --- Faculty & Department Management ---
  getAllFaculty: async (branchCode, role) => {
    const p = await getPool();
    let query = 'SELECT * FROM faculty_members WHERE status = "ACTIVE"';
    const params = [];
    if (branchCode) {
      query += ' AND branchCode = ?';
      params.push(branchCode.toUpperCase());
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role.toLowerCase());
    }
    query += ' ORDER BY role DESC, name ASC';
    const [rows] = await p.query(query, params);
    return rows;
  },

  getHods: async () => {
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM faculty_members WHERE role = "hod" AND status = "ACTIVE" ORDER BY branchCode ASC');
    return rows;
  },

  getFacultyById: async (id) => {
    if (!id) return null;
    const p = await getPool();
    const [rows] = await p.query('SELECT * FROM faculty_members WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  createFaculty: async (data) => {
    const p = await getPool();
    const id = data.id || `fac-${Date.now()}`;
    const SALT = await bcrypt.genSalt(10);
    const FACULTY_PASS = await bcrypt.hash('Faculty@123', SALT);

    await p.query(`
      INSERT INTO faculty_members (
        id, name, email, phone, department, branchCode, designation, role,
        qualification, specialization, experienceYears, cabin, avatar, joiningDate, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `, [
      id, data.name, data.email, data.phone || '', data.department, (data.branchCode || 'CSE').toUpperCase(),
      data.designation, data.role || 'faculty', data.qualification || '', data.specialization || '',
      data.experienceYears || 5, data.cabin || '', data.avatar || '', data.joiningDate || new Date().toISOString().split('T')[0],
      new Date().toISOString()
    ]);

    const [existing] = await p.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [data.email]);
    if (existing.length === 0) {
      await p.query(`
        INSERT INTO users (
          id, name, email, password, role, designation, department, branch, branchCode, status, createdAt, approvedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)
      `, [
        `usr-${id}`, data.name, data.email, FACULTY_PASS, data.role || 'faculty',
        data.designation, data.department, data.department, (data.branchCode || 'CSE').toUpperCase(),
        new Date().toISOString(), new Date().toISOString()
      ]);
    }

    const [created] = await p.query('SELECT * FROM faculty_members WHERE id = ?', [id]);
    return created[0];
  },

  updateFaculty: async (id, updates) => {
    const p = await getPool();
    const fields = [];
    const params = [];
    for (const [key, val] of Object.entries(updates)) {
      if (['name', 'phone', 'department', 'branchCode', 'designation', 'role', 'qualification', 'specialization', 'experienceYears', 'cabin', 'avatar', 'status'].includes(key)) {
        fields.push(`${key} = ?`);
        params.push(val);
      }
    }
    if (fields.length === 0) return null;
    params.push(id);
    await p.query(`UPDATE faculty_members SET ${fields.join(', ')} WHERE id = ?`, params);

    const [fac] = await p.query('SELECT * FROM faculty_members WHERE id = ?', [id]);
    if (fac && fac[0]) {
      await p.query(`
        UPDATE users 
        SET name = ?, role = ?, designation = ?, department = ?, branchCode = ?
        WHERE LOWER(email) = LOWER(?)
      `, [fac[0].name, fac[0].role, fac[0].designation, fac[0].department, fac[0].branchCode, fac[0].email]);
    }

    return fac ? fac[0] : null;
  },

  deleteFaculty: async (id) => {
    const p = await getPool();
    const [fac] = await p.query('SELECT * FROM faculty_members WHERE id = ?', [id]);
    if (fac && fac[0]) {
      await p.query('UPDATE faculty_members SET status = "INACTIVE" WHERE id = ?', [id]);
      await p.query('DELETE FROM users WHERE LOWER(email) = LOWER(?)', [fac[0].email]);
    }
    return { success: true, message: 'Faculty member deleted/deactivated successfully' };
  },

  getDepartmentsWithFaculty: async () => {
    const p = await getPool();
    const [allFaculty] = await p.query('SELECT * FROM faculty_members WHERE status = "ACTIVE" ORDER BY role DESC, name ASC');

    const baseDepts = [
      {
        id: "cse",
        name: "Computer Science and Engineering",
        code: "CSE",
        intake: 60,
        established: 2022,
        description: "The Department of Computer Science & Engineering offers modern curricula emphasizing Cloud Computing, Artificial Intelligence, Machine Learning, Web Technologies, and Cyber Security.",
        labs: [
          "Advanced Computing & Cloud Lab",
          "Object Oriented Programming & Data Structures Lab",
          "Database Systems & Web Technologies Lab",
          "Network Security & IoT Research Lab"
        ],
        syllabusUrl: "#"
      },
      {
        id: "ee",
        name: "Electrical Engineering",
        code: "EE",
        intake: 60,
        established: 2022,
        description: "Equips students with rigorous electrical theory and modern applications in Power Systems, Renewable Energy Microgrids, Control Systems, and Electric Vehicles.",
        labs: [
          "Electrical Machines & Drives Lab",
          "Power Systems Simulation Lab",
          "Control Systems & Microprocessors Lab",
          "Basic Electrical & Electronics Lab"
        ],
        syllabusUrl: "#"
      },
      {
        id: "me",
        name: "Mechanical Engineering",
        code: "ME",
        intake: 60,
        established: 2022,
        description: "Provides foundational and cutting-edge mechanical training in Thermal Engineering, Robotics, CAD/CAM, Automobile Engineering, and Manufacturing Sciences.",
        labs: [
          "Fluid Mechanics & Hydraulic Machinery Lab",
          "Thermodynamics & Heat Transfer Lab",
          "CAD/CAM Simulation & Modeling Lab",
          "Engineering Mechanics & Workshop Practice"
        ],
        syllabusUrl: "#"
      },
      {
        id: "ce",
        name: "Civil Engineering",
        code: "CE",
        intake: 60,
        established: 2022,
        description: "Focused on Structural Design, Environmental Engineering, Geo-technical survey, and Sustainable Infrastructure Development.",
        labs: [
          "Structural Analysis & Concrete Technology Lab",
          "Geotechnical & Soil Mechanics Lab",
          "Transportation Engineering Lab",
          "Advanced Surveying & GIS Lab"
        ],
        syllabusUrl: "#"
      }
    ];

    return baseDepts.map(dept => {
      const deptFaculty = allFaculty.filter(f => f.branchCode.toUpperCase() === dept.code);
      const hod = deptFaculty.find(f => f.role === 'hod');
      return {
        ...dept,
        head: hod ? hod.name : 'Department HOD',
        hodEmail: hod ? hod.email : '',
        hodPhone: hod ? hod.phone : '',
        hodCabin: hod ? hod.cabin : '',
        hodSpecialization: hod ? hod.specialization : '',
        faculty: deptFaculty.map(f => ({
          id: f.id,
          name: f.name,
          role: f.designation,
          specialization: f.specialization,
          email: f.email,
          phone: f.phone,
          qualification: f.qualification,
          cabin: f.cabin,
          avatar: f.avatar
        }))
      };
    });
  }
};

initializeSchema().then(() => {
  console.log('🏛️  MySQL Database Engine (gec_palamu) initialized successfully!');
}).catch(err => {
  console.error('❌ Failed to initialize MySQL schema:', err);
});

export default mysqlDb;
