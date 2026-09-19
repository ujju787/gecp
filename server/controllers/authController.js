import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gec_palamu_super_secret_jwt_key_2026';

// Register New Student (Defaults to PENDING status)
export const register = async (req, res) => {
  try {
    const { name, email, password, rollNo, regNo, branch, semester, batch } = req.body;

    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({ error: 'Name, email, roll number, and password are required.' });
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const existingRoll = await db.findUserByRoll(rollNo);
    if (existingRoll) {
      return res.status(400).json({ error: 'An account with this university roll number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr-std-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'student',
      rollNo: rollNo.trim().toUpperCase(),
      regNo: regNo ? regNo.trim() : `JUT/2026/${rollNo.trim()}`,
      branch: branch || 'Computer Science & Engineering',
      branchCode: branch ? branch.split(' ')[0] : 'CSE',
      semester: semester || '1st Semester',
      batch: batch || '2026 - 2030',
      cgpa: 0.0,
      status: 'PENDING', // Awaiting Admin Approval
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null
    };

    const created = await db.createUser(newUser);

    // Don't return password
    const { password: _, ...userWithoutPass } = created || newUser;

    return res.status(201).json({
      message: 'Registration submitted successfully! Your account is currently PENDING administrative approval from the GEC Palamu Academic Cell.',
      user: userWithoutPass,
      status: 'PENDING'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// Login (Student / Faculty / Admin)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. No user found with this email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please verify your credentials.' });
    }

    // CHECK APPROVAL STATUS FOR STUDENTS
    if (user.role === 'student') {
      if (user.status === 'PENDING') {
        return res.status(403).json({
          error: 'Account Pending Approval',
          status: 'PENDING',
          message: 'Your registration is currently under administrative verification by GEC Palamu Academic Council. Please check back after approval.'
        });
      }

      if (user.status === 'REJECTED') {
        return res.status(403).json({
          error: 'Account Registration Rejected',
          status: 'REJECTED',
          message: `Your account registration was not approved. Reason: ${user.rejectionReason || 'Discrepancy in student credentials'}.`
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPass } = user;

    return res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: userWithoutPass
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Admin: Get Pending Students
export const getPendingStudents = async (req, res) => {
  try {
    const raw = await db.getPendingStudents();
    const pending = raw.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    return res.json(pending);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pending students.' });
  }
};

// Admin: Approve Student
export const approveStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const adminId = req.user?.id || 'usr-admin-01';

    const updated = await db.approveStudent(studentId, adminId);
    if (!updated) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const { password, ...safe } = updated;
    return res.json({
      message: `Student ${updated.name} (${updated.rollNo}) has been APPROVED successfully!`,
      student: safe
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to approve student.' });
  }
};

// Admin: Reject Student
export const rejectStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    const updated = await db.rejectStudent(studentId, reason);
    if (!updated) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const { password, ...safe } = updated;
    return res.json({
      message: `Student ${updated.name} has been marked as REJECTED.`,
      student: safe
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reject student.' });
  }
};

// Middleware: Verify JWT Token
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authorization token.' });
  }
};

// Get Current Logged-in User Profile (Validates session)
export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found in database.' });
    }

    const { password, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
};
