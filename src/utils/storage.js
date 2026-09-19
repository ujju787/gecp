// LocalStorage Persistence Layer for GEC Palamu Portal
import { DEFAULT_STUDENT, DEFAULT_FACULTY } from '../data/mockStudents';
import { INITIAL_RESOURCES } from '../data/libraryResources';
import { CAMPUS_EVENTS } from '../data/eventsData';
import { getCurriculumSubjects, normalizeBranch, normalizeSemester } from '../data/curriculumData';

const KEYS = {
  CURRENT_ROLE: 'gecp_current_role',
  AUTH_USER: 'gecp_auth_user',
  STUDENT_DATA: 'gecp_student_data',
  FACULTY_DATA: 'gecp_faculty_data',
  LIBRARY_RESOURCES: 'gecp_library_resources',
  EVENT_REGISTRATIONS: 'gecp_event_registrations',
  FEE_TRANSACTIONS: 'gecp_fee_transactions',
  INTERNSHIP_APPLICATIONS: 'gecp_internship_applications',
  MENTORSHIP_REQUESTS: 'gecp_mentorship_requests'
};

export const getStoredRole = () => {
  const authUser = getLocalAuthUser();
  if (authUser && authUser.role) {
    return authUser.role;
  }
  const stored = localStorage.getItem(KEYS.CURRENT_ROLE);
  return stored || 'guest';
};

export const setStoredRole = (role) => {
  localStorage.setItem(KEYS.CURRENT_ROLE, role);
};

export const clearAuthSession = () => {
  localStorage.removeItem(KEYS.CURRENT_ROLE);
  localStorage.setItem(KEYS.CURRENT_ROLE, 'guest');
  localStorage.removeItem(KEYS.AUTH_USER);
  localStorage.removeItem('gecp_auth_token');
  localStorage.removeItem('gecp_auth_user');
};

const getLocalAuthUser = () => {
  try {
    const raw = localStorage.getItem(KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const purgeLegacyStudentData = () => {
  try {
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key && (key.startsWith('gecp_student_data') || key.startsWith('gecp_fee_transactions') || key === KEYS.STUDENT_DATA)) {
        localStorage.removeItem(key);
      }
    }

    const auth = localStorage.getItem(KEYS.AUTH_USER);
    if (auth) {
      try {
        const parsedAuth = JSON.parse(auth);
        if (parsedAuth.role === 'student' && (parsedAuth.rollNo === '22/CSE/042' || parsedAuth.id === 'usr-std-01' || parsedAuth.name === 'Rahul Kumar')) {
          clearAuthSession();
        }
      } catch {}
    }
  } catch (e) {
    console.error('Failed to purge legacy student data:', e);
  }
};

// Immediate cleanup of legacy / mock localStorage databases
purgeLegacyStudentData();

/**
 * Builds a comprehensive, personalized student profile from authentication data
 */
export const buildStudentProfile = (user, base = null) => {
  if (!user) return null;

  const branchCode = normalizeBranch(user.branchCode || user.branch || (user.rollNo?.includes('ME') ? 'ME' : user.rollNo?.includes('EE') ? 'EE' : user.rollNo?.includes('CE') ? 'CE' : 'CSE'));
  const semester = normalizeSemester(user.semester || (user.rollNo?.startsWith('23') ? '3rd Sem' : '1st Sem'));

  const cleanRoll = user.rollNo || base?.rollNo || 'NEW/REG/001';
  const rollYear = cleanRoll?.split('/')[0] || '2026';
  const rollNum = cleanRoll?.split('/')[2] || cleanRoll.slice(-3);

  // Always derive authentic syllabus strictly from the JUT Curriculum Catalog for this branch & semester!
  const curriculumSubjects = getCurriculumSubjects(branchCode, semester);

  // Preserve existing marks/attendance ONLY for genuine curriculum codes (filter out EN201, EN202, EN203, etc.)
  const existingSubMap = new Map();
  if (Array.isArray(base?.subjects)) {
    base.subjects.forEach(s => {
      if (s && s.code && !s.code.startsWith('EN20')) {
        existingSubMap.set(s.code, s);
      }
    });
  }

  const safeSubjects = curriculumSubjects.map(curSub => {
    const prev = existingSubMap.get(curSub.code);
    return {
      ...curSub,
      totalClasses: typeof prev?.totalClasses === 'number' ? prev.totalClasses : 0,
      attendedClasses: typeof prev?.attendedClasses === 'number' ? prev.attendedClasses : 0,
      lastAttendedDate: prev?.lastAttendedDate || null,
      internalMarks: {
        midTerm: prev?.internalMarks?.midTerm ?? 0,
        assignment: prev?.internalMarks?.assignment ?? 0,
        sessional: prev?.internalMarks?.sessional ?? 0
      }
    };
  });

  const branchNameMap = {
    CSE: 'Computer Science & Engineering',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering',
    EE: 'Electrical Engineering'
  };

  return {
    ...(base || {}),
    id: user.id || base?.id || `usr-std-${Date.now().toString().slice(-6)}`,
    name: user.name || base?.name || 'Newly Registered Student',
    email: user.email || base?.email || '',
    role: user.role || 'student',
    status: user.status || 'APPROVED',
    rollNo: cleanRoll,
    regNo: user.regNo || `JUT/${rollYear}/${branchCode}/${rollNum}`,
    branch: user.branch || branchNameMap[branchCode] || 'Computer Science & Engineering',
    branchCode,
    semester,
    batch: user.batch || `${rollYear} - ${parseInt(rollYear) + 4}`,
    cgpa: typeof user.cgpa === 'number' ? user.cgpa : (typeof base?.cgpa === 'number' ? base.cgpa : null),
    bloodGroup: user.bloodGroup || base?.bloodGroup || 'B+',
    contact: user.contact || base?.contact || '+91 98765 00000',
    guardianName: user.guardianName || base?.guardianName || 'Guardian / Parent',
    dob: user.dob || base?.dob || '2005-01-01',
    category: user.category || base?.category || 'General',
    hostelResident: Boolean(user.hostelResident ?? base?.hostelResident ?? false),
    hostelName: user.hostelName || base?.hostelName || 'Day Scholar / Non-Resident',
    avatar: user.avatar || base?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    feesDue: base?.feesDue || {
      tuition: 15200,
      exam: 2400,
      hostel: 6000,
      library: 0
    },
    assignments: (base?.assignments && base.assignments.length > 0) ? base.assignments : [
      {
        id: "asg-1",
        subject: safeSubjects[0]?.name || "Core Subject",
        title: "Unit 1: Theory Concepts & Problem Formulations",
        dueDate: "2026-10-15",
        status: "Pending",
        maxMarks: 10
      },
      {
        id: "asg-2",
        subject: safeSubjects[1]?.name || "Lab Practical",
        title: "Unit 2: Problem Solving & Numerical Implementation",
        dueDate: "2026-10-25",
        status: "Pending",
        maxMarks: 10
      }
    ],
    notifications: (base?.notifications && base.notifications.length > 0) ? base.notifications : [
      {
        id: "notif-welcome",
        title: "Welcome to GEC Palamu Portal",
        date: new Date().toISOString().split('T')[0],
        type: "info",
        message: "Your official student profile has been registered and verified. Access your smart contactless attendance pass, course syllabus, and fee challans here."
      }
    ],
    subjects: safeSubjects
  };
};

export const getStudentData = () => {
  const authUser = getLocalAuthUser();
  if (authUser && authUser.role === 'student') {
    return buildStudentProfile(authUser);
  }
  return null;
};

export const saveStudentData = (data) => {
  // Database persistence is handled directly via MySQL 9.4 API endpoints
};

export const incrementSubjectAttendance = (rollNoOrId, subjectCode, subjectName) => {
  // Managed atomically via MySQL attendance_records table
  return null;
};

export const getFacultyData = () => {
  const saved = localStorage.getItem(KEYS.FACULTY_DATA);
  if (!saved) {
    localStorage.setItem(KEYS.FACULTY_DATA, JSON.stringify(DEFAULT_FACULTY));
    return DEFAULT_FACULTY;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_FACULTY;
  }
};

export const saveFacultyData = (data) => {
  localStorage.setItem(KEYS.FACULTY_DATA, JSON.stringify(data));
};

export const getLibraryResources = () => {
  const saved = localStorage.getItem(KEYS.LIBRARY_RESOURCES);
  if (!saved) {
    localStorage.setItem(KEYS.LIBRARY_RESOURCES, JSON.stringify(INITIAL_RESOURCES));
    return INITIAL_RESOURCES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_RESOURCES;
  }
};

export const addLibraryResource = (newRes) => {
  const current = getLibraryResources();
  const updated = [newRes, ...current];
  localStorage.setItem(KEYS.LIBRARY_RESOURCES, JSON.stringify(updated));
  return updated;
};

export const getFeeTransactions = (studentIdOrRoll) => {
  const saved = localStorage.getItem(KEYS.FEE_TRANSACTIONS);
  let list = [];
  if (!saved) {
    const initial = [
      {
        id: "TXN-2026-88910",
        studentId: "usr-std-01",
        rollNo: "22/CSE/042",
        studentName: "Rahul Kumar",
        date: "2026-07-15",
        purpose: "4th Semester Academic Tuition Fee",
        amount: 15200,
        paymentMode: "Online UPI (6205482672@ptsbi)",
        upiId: "6205482672@ptsbi",
        utrNumber: "425611092834",
        status: "SUCCESS",
        refNo: "SBI-JUT-77821901"
      }
    ];
    localStorage.setItem(KEYS.FEE_TRANSACTIONS, JSON.stringify(initial));
    list = initial;
  } else {
    try {
      list = JSON.parse(saved);
    } catch {
      list = [];
    }
  }

  if (!studentIdOrRoll) return list;
  const filter = String(studentIdOrRoll).trim().toLowerCase();
  return list.filter(t => 
    (t.studentId && t.studentId.toLowerCase() === filter) ||
    (t.rollNo && t.rollNo.toLowerCase() === filter)
  );
};

export const recordFeePayment = (txn) => {
  const list = getFeeTransactions();
  const updated = [txn, ...list];
  localStorage.setItem(KEYS.FEE_TRANSACTIONS, JSON.stringify(updated));
  return updated;
};

export const getEventRegistrations = (studentIdOrEmail) => {
  const saved = localStorage.getItem(KEYS.EVENT_REGISTRATIONS);
  let list = [];
  if (saved) {
    try {
      list = JSON.parse(saved);
    } catch {
      list = [];
    }
  }

  if (!studentIdOrEmail) return list;
  const filter = String(studentIdOrEmail).trim().toLowerCase();
  return list.filter(r => 
    (r.studentId && r.studentId.toLowerCase() === filter) ||
    (r.leaderEmail && r.leaderEmail.toLowerCase() === filter) ||
    (r.rollNo && r.rollNo.toLowerCase() === filter)
  );
};

export const registerForEvent = (registration) => {
  const allRegistrations = getEventRegistrations(); // get all
  const updated = [registration, ...allRegistrations];
  localStorage.setItem(KEYS.EVENT_REGISTRATIONS, JSON.stringify(updated));
  return updated;
};

export const getInternshipApplications = () => {
  const saved = localStorage.getItem(KEYS.INTERNSHIP_APPLICATIONS);
  if (!saved) return ["int-1"];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const applyInternship = (internshipId) => {
  const list = getInternshipApplications();
  if (!list.includes(internshipId)) {
    const updated = [...list, internshipId];
    localStorage.setItem(KEYS.INTERNSHIP_APPLICATIONS, JSON.stringify(updated));
    return updated;
  }
  return list;
};

export const getMentorshipRequests = () => {
  const saved = localStorage.getItem(KEYS.MENTORSHIP_REQUESTS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const sendMentorshipRequest = (req) => {
  const list = getMentorshipRequests();
  const updated = [req, ...list];
  localStorage.setItem(KEYS.MENTORSHIP_REQUESTS, JSON.stringify(updated));
  return updated;
};
