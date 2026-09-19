import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { db } from './db.js';
import { 
  register, 
  login, 
  getPendingStudents, 
  approveStudent, 
  rejectStudent, 
  authMiddleware,
  getMe
} from './controllers/authController.js';
import { 
  verifyAndRecordQR, 
  getAttendanceLogs,
  resetAttendance
} from './controllers/attendanceController.js';
import { 
  getResources, 
  uploadResource, 
  downloadResource, 
  deleteResource 
} from './controllers/libraryController.js';
import { 
  handleChatMessage 
} from './controllers/chatController.js';
import {
  processFeePayment,
  verifyFeeReceipt,
  getStudentPaymentHistory,
  getStudentFeeDues,
  getAllTransactions
} from './controllers/paymentController.js';
import { generatePythonQR } from './controllers/qrController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend on localhost and network IP addresses
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'GEC Palamu Official Core API Server',
    database: 'MySQL Server 9.4 (gec_palamu)',
    qrEngine: 'Python 3.14 + qrcode + PIL',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// 2. Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authMiddleware, getMe);

// 3. Admin Approval & Student Management Routes
app.get('/api/admin/pending-students', getPendingStudents);
app.post('/api/admin/approve-student/:studentId', approveStudent);
app.post('/api/admin/reject-student/:studentId', rejectStudent);

app.get('/api/students/approved', async (req, res) => {
  try {
    const { branch, semester } = req.query;
    const students = await db.getApprovedStudents(branch, semester);
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('Failed to fetch approved students:', err);
    res.status(500).json({ error: 'Failed to fetch approved students from MySQL' });
  }
});

app.get('/api/students/all', async (req, res) => {
  try {
    const students = await db.getAllStudents();
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('Failed to fetch all students:', err);
    res.status(500).json({ error: 'Failed to fetch all students from MySQL' });
  }
});

app.post('/api/admin/reset-students', async (req, res) => {
  try {
    const result = await db.resetAllStudentData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset student accounts' });
  }
});

// Student Profile Management & Internal Grades
app.put('/api/students/profile', authMiddleware, async (req, res) => {
  try {
    const studentId = (req.user.role === 'admin' && req.body.studentId) ? req.body.studentId : req.user.id;
    const updated = await db.updateStudentProfile(studentId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }
    const { password, ...safeUser } = updated;
    res.json({ success: true, message: 'Profile details updated and synchronized with institutional MySQL database!', user: safeUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update student profile.' });
  }
});

app.post('/api/students/grades', authMiddleware, async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : (Array.isArray(req.body?.grades) ? req.body.grades : [req.body]);
    for (const g of list) {
      if (g && (g.studentId || g.rollNo) && g.subjectCode) {
        await db.saveStudentGrade(g);
      }
    }
    res.json({ success: true, message: 'Grades saved successfully to institutional MySQL ledger!' });
  } catch (err) {
    console.error('Save grades error:', err);
    res.status(500).json({ error: 'Failed to save student grades.' });
  }
});

app.get('/api/students/:id/grades', async (req, res) => {
  try {
    const grades = await db.getStudentGrades(req.params.id);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student grades.' });
  }
});

// 4. Smart QR Attendance & Faculty Session Routes
app.post('/api/attendance/scan-qr', verifyAndRecordQR);
app.post('/api/attendance/scan', verifyAndRecordQR);

app.post('/api/attendance/mark-session', authMiddleware, async (req, res) => {
  try {
    const result = await db.recordSessionAttendance(req.body, req.user);
    res.json(result);
  } catch (err) {
    console.error('Failed to record session attendance:', err);
    res.status(500).json({ error: err.message || 'Failed to record session attendance' });
  }
});

// Student Semester Progression & Academic Advance
app.put('/api/students/:id/semester', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { newSemester, cgpa } = req.body;
    if (!newSemester) {
      return res.status(400).json({ error: 'newSemester is required' });
    }
    const result = await db.promoteStudentSemester(targetId, newSemester, cgpa);
    res.json(result);
  } catch (err) {
    console.error('Failed to advance student semester:', err);
    res.status(500).json({ error: err.message || 'Failed to advance student semester' });
  }
});

app.get('/api/students/:id/attendance', async (req, res) => {
  try {
    const records = await db.getStudentSubjectAttendance(req.params.id);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
});

app.get('/api/grades/subject/:code', async (req, res) => {
  try {
    const grades = await db.getSubjectGrades(req.params.code);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject grades' });
  }
});

app.get('/api/attendance/subject/:code', async (req, res) => {
  try {
    const ledger = await db.getSubjectAttendanceLedger(req.params.code);
    res.json(ledger);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject attendance ledger' });
  }
});

app.get('/api/attendance/logs', getAttendanceLogs);
app.post('/api/attendance/reset', resetAttendance);

// 5. Digital Library Routes
app.get('/api/library/resources', getResources);
app.post('/api/library/upload', uploadResource);
app.post('/api/library/download/:id', downloadResource);
app.delete('/api/library/resources/:id', deleteResource);

// 6. Online Fee Payment & Gateway Verification Routes
app.post('/api/payment/process', processFeePayment);
app.get('/api/payment/receipt/:receiptId', verifyFeeReceipt);
app.get('/api/payment/history/:studentId', getStudentPaymentHistory);
app.get('/api/payment/dues/:studentId', getStudentFeeDues);
app.get('/api/payment/all-transactions', getAllTransactions);

// 7. Python QR Generation Route
app.post('/api/qr/python', generatePythonQR);

// 8. Live AI Chatbot Streaming Route
app.post('/api/chat/stream', handleChatMessage);

// 9. Teacher Class Notices & Broadcasts
app.get('/api/broadcasts', async (req, res) => {
  try {
    const list = await db.getBroadcasts();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

app.post('/api/broadcasts', async (req, res) => {
  try {
    const { title, message, teacherId, teacherName, teacherDesignation, subjectCode, subjectName, type, targetAudience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }
    const created = await db.createBroadcast({
      id: `bc-${Date.now()}`,
      teacherId: teacherId || 'fac-01',
      teacherName: teacherName || 'Subject Teacher',
      teacherDesignation: teacherDesignation || 'Assistant Professor',
      subjectCode: subjectCode || 'CS502',
      subjectName: subjectName || 'Course',
      title,
      message,
      type: type || 'info',
      targetAudience: targetAudience || 'All Enrolled Students',
      createdAt: new Date().toISOString()
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

// 10. Campus Events & Student Registrations
app.get('/api/events', async (req, res) => {
  try {
    const list = await db.getAllEvents();
    res.json(list);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Failed to fetch events from MySQL database.' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, date, venue } = req.body;
    if (!title || !date || !venue) {
      return res.status(400).json({ error: 'Event Title, Date, and Venue are required.' });
    }
    const created = await db.createEvent(req.body);
    res.status(201).json({ success: true, message: 'Campus event published successfully!', event: created });
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(500).json({ error: 'Failed to create event in MySQL database.' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const result = await db.deleteEvent(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

app.post('/api/events/register', async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required for registration.' });
    }
    const result = await db.registerForEvent(req.body);
    if (result.alreadyRegistered) {
      return res.status(200).json({ success: true, alreadyRegistered: true, ...result });
    }
    res.status(201).json({ success: true, message: 'Event registration confirmed! Official pass generated.', ...result });
  } catch (err) {
    console.error('Failed to register for event:', err);
    res.status(500).json({ error: 'Event registration failed.' });
  }
});

app.get('/api/events/registrations', async (req, res) => {
  try {
    const list = await db.getEventRegistrations();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event registrations.' });
  }
});

app.get('/api/events/:id/registrations', async (req, res) => {
  try {
    const list = await db.getEventRegistrations(req.params.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event registrations.' });
  }
});

app.get('/api/events/my-registrations/:studentId', async (req, res) => {
  try {
    const list = await db.getStudentEventRegistrations(req.params.studentId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student registrations.' });
  }
});

// 11. Faculty & Department Roster (Synced with MySQL Database)
app.get('/api/faculty', async (req, res) => {
  try {
    const { branch, role } = req.query;
    const faculty = await db.getAllFaculty(branch, role);
    res.json({ success: true, count: faculty.length, faculty });
  } catch (err) {
    console.error('Failed to fetch faculty:', err);
    res.status(500).json({ error: 'Failed to fetch faculty members from database.' });
  }
});

app.get('/api/faculty/hods', async (req, res) => {
  try {
    const hods = await db.getHods();
    res.json({ success: true, count: hods.length, hods });
  } catch (err) {
    console.error('Failed to fetch HODs:', err);
    res.status(500).json({ error: 'Failed to fetch HODs from database.' });
  }
});

app.get('/api/faculty/:id', async (req, res) => {
  try {
    const faculty = await db.getFacultyById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty member not found' });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch faculty details.' });
  }
});

app.post('/api/faculty', async (req, res) => {
  try {
    const { name, email, department, branchCode, designation } = req.body;
    if (!name || !email || !department || !branchCode || !designation) {
      return res.status(400).json({ error: 'Name, email, department, branchCode, and designation are required.' });
    }
    const created = await db.createFaculty(req.body);
    res.status(201).json({ success: true, message: 'Faculty member created successfully!', faculty: created });
  } catch (err) {
    console.error('Failed to create faculty:', err);
    res.status(500).json({ error: 'Failed to create faculty member.' });
  }
});

app.put('/api/faculty/:id', async (req, res) => {
  try {
    const updated = await db.updateFaculty(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Faculty member not found' });
    res.json({ success: true, message: 'Faculty details updated successfully!', faculty: updated });
  } catch (err) {
    console.error('Failed to update faculty:', err);
    res.status(500).json({ error: 'Failed to update faculty details.' });
  }
});

app.delete('/api/faculty/:id', async (req, res) => {
  try {
    const result = await db.deleteFaculty(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete faculty member.' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await db.getDepartmentsWithFaculty();
    res.json({ success: true, count: departments.length, departments });
  } catch (err) {
    console.error('Failed to fetch departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments from database.' });
  }
});

// In production, serve the built React frontend if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏛️  GEC Palamu Backend API Server`);
  console.log(`🚀  Running live at: http://localhost:${PORT}`);
  console.log(`🌐  Local Network:   http://10.88.25.149:${PORT}`);
  console.log(`🗄️  SQL Database:    MySQL Server 9.4 (gec_palamu)`);
  console.log(`🐍  Python QR Engine: server/scripts/qr_generator.py`);
  console.log(`💳  UPI Gateway:    6205482672@ptsbi`);
  console.log(`====================================================`);
});
