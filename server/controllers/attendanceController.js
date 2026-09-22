import { db } from '../db.js';

// Verify Student QR Code and Mark Attendance (IIT / NIT Model)
export const verifyAndRecordQR = async (req, res) => {
  try {
    const { qrData, subjectCode, subjectName } = req.body;
    const facultyId = req.user?.id || 'usr-fac-01';

    if (!qrData) {
      return res.status(400).json({ error: 'QR Code payload is missing.' });
    }

    let parsed = null;
    try {
      if (typeof qrData === 'object' && qrData !== null) {
        parsed = qrData;
      } else if (typeof qrData === 'string') {
        const trimmed = qrData.trim();
        // 0. URL verification format (from Google Scanner compatible QR: https://domain/?v=... or https://domain/?verify=student&...)
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('verify=') || trimmed.includes('v=') || trimmed.includes('?')) {
          try {
            const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://dummy.org/${trimmed.startsWith('?') ? trimmed : '?' + trimmed}`);
            const sp = urlObj.searchParams;
            const token = sp.get('v') || sp.get('token');
            if (token) {
              try {
                const buff = Buffer.from(token, 'base64url');
                const decoded = JSON.parse(buff.toString('utf-8'));
                parsed = {
                  type: 'GECP_ATTENDANCE',
                  id: decoded.id || undefined,
                  roll: decoded.r || undefined,
                  name: decoded.n || undefined,
                  branch: decoded.b || undefined
                };
              } catch (tokenErr) {
                console.warn('Opaque token decode error in attendance:', tokenErr);
              }
            }

            if (!parsed) {
              parsed = {
                type: 'GECP_ATTENDANCE',
                id: sp.get('id') || undefined,
                roll: sp.get('roll') || sp.get('rollNo') || undefined,
                name: sp.get('name') || undefined,
                branch: sp.get('branch') || undefined
              };
            }
          } catch (urlErr) {
            console.warn('URL qr parse error:', urlErr);
          }
        }

        // 0b. Direct opaque base64url token payload
        if (!parsed && (trimmed.startsWith('ey') || (trimmed.length > 30 && /^[A-Za-z0-9_-]+$/.test(trimmed)))) {
          try {
            const buff = Buffer.from(trimmed, 'base64url');
            const decoded = JSON.parse(buff.toString('utf-8'));
            if (decoded && (decoded.id || decoded.r)) {
              parsed = {
                type: 'GECP_ATTENDANCE',
                id: decoded.id || undefined,
                roll: decoded.r || undefined,
                name: decoded.n || undefined,
                branch: decoded.b || undefined
              };
            }
          } catch (e) {}
        }
        
        // 1. Try standard JSON
        if (!parsed && trimmed.startsWith('{') && trimmed.endsWith('}')) {
          parsed = JSON.parse(trimmed);
        } else if (!parsed && trimmed.includes('|')) {
          // 2. Pipe format: GECP|22/CSE/042|Rahul Kumar|CSE
          const parts = trimmed.split('|');
          parsed = {
            type: 'GECP_ATTENDANCE',
            roll: parts[1] || parts[0],
            name: parts[2],
            branch: parts[3]
          };
        } else if (trimmed.includes(':')) {
          // 3. Colon format: GECP-ID:usr-std-01:22/CSE/042:CSE
          const parts = trimmed.split(':');
          parsed = {
            type: 'GECP_ATTENDANCE',
            id: parts[1],
            roll: parts[2] || parts[1],
            branch: parts[3]
          };
        } else {
          // 4. Direct Roll Number or Student ID string (e.g. "22/CSE/042" or "usr-std-01")
          parsed = {
            type: 'GECP_ATTENDANCE',
            id: trimmed.startsWith('usr-') ? trimmed : undefined,
            roll: trimmed
          };
        }
      }
    } catch (e) {
      console.warn('QR parse fallback error:', e);
    }

    // Lookup student in MySQL database by ID or Roll Number
    let student = null;
    if (parsed) {
      if (parsed.id) {
        student = await db.findUserById(parsed.id);
      }
      if (!student && parsed.roll) {
        student = await db.findUserByRoll(parsed.roll);
      }
    }

    if (!student && typeof qrData === 'string') {
      const clean = qrData.trim().toUpperCase();
      student = await db.findUserByRoll(clean);
      if (!student) {
        student = await db.findUserById(clean);
      }
    }

    if (!student) {
      return res.status(404).json({
        error: `Student not found in institutional database with credential "${qrData}". Please verify roll number.`
      });
    }

    // CHECK APPROVAL STATUS
    if (student.status !== 'APPROVED') {
      return res.status(403).json({
        error: `Attendance Rejected! Student ${student.name} is currently ${student.status}. Only APPROVED students can record smart attendance.`
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const targetSubject = subjectCode || 'CS501';

    // DUPLICATE & PROXY PREVENTION
    const existingLogs = await db.getAttendanceLogs({ studentId: student.id, subjectCode: targetSubject, date: todayDate });
    if (existingLogs.length > 0 && existingLogs.some(l => l.status === 'PRESENT')) {
      return res.status(409).json({
        error: 'Duplicate Scan Detected!',
        message: `Attendance for ${student.name} (${student.rollNo}) has already been recorded for ${targetSubject} today.`,
        student: {
          name: student.name,
          rollNo: student.rollNo,
          avatar: student.avatar,
          branch: student.branch
        }
      });
    }

    // Record verified attendance in MySQL
    const record = {
      id: `att-${Date.now().toString().slice(-6)}`,
      studentId: student.id,
      rollNo: student.rollNo,
      studentName: student.name,
      subjectCode: targetSubject,
      subjectName: subjectName || 'Database Management Systems',
      date: todayDate,
      sessionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      verifiedVia: 'SMART_QR_VERIFICATION',
      facultyId,
      status: 'PRESENT',
      createdAt: new Date().toISOString()
    };

    const recorded = await db.recordAttendance(record);

    return res.status(200).json({
      message: recorded.alreadyRecorded ? recorded.message : 'Attendance verified & recorded successfully in MySQL!',
      verified: true,
      record: recorded,
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        avatar: student.avatar,
        branch: student.branch,
        semester: student.semester
      }
    });

  } catch (error) {
    console.error('QR Attendance Verification Error:', error);
    return res.status(500).json({ error: 'Server error during attendance verification.' });
  }
};

// Get All Attendance Records (Optionally filter by subject, studentId, or rollNo)
export const getAttendanceLogs = async (req, res) => {
  try {
    const { subjectCode, studentId, rollNo, date } = req.query;
    const filter = {};
    if (subjectCode) filter.subjectCode = subjectCode;
    if (studentId) filter.studentId = studentId;
    if (rollNo) filter.studentId = rollNo;
    if (date) filter.date = date;

    const records = await db.getAttendanceLogs(filter);
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve attendance logs.' });
  }
};

// Reset Attendance Logs for new testing session
export const resetAttendance = async (req, res) => {
  try {
    const result = await db.resetAttendanceData();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset attendance logs.' });
  }
};
