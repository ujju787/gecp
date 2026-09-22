import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Award, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  CreditCard, 
  BookOpen, 
  QrCode, 
  Printer, 
  Share2, 
  X, 
  Upload,
  Maximize2,
  ScanLine,
  LogOut,
  Megaphone,
  BellRing,
  Layers,
  ChevronRight,
  Phone,
  UserCog,
  Heart,
  Home,
  Users,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { COLLEGE_INFO } from '../../data/collegeData';
import { api } from '../../services/api';
import { printStudentIdCard } from '../../utils/printDocument';
import { saveStudentData, buildStudentProfile } from '../../utils/storage';
import { generateVerificationUrl } from '../../utils/verificationToken';
import StudentProfileModal from '../profile/StudentProfileModal';
import { 
  calculateSGPA, 
  calculateOverallAttendance, 
  calculateSubjectGrade,
  normalizeBranch,
  normalizeSemester,
  getCurriculumSubjects,
  getNextSemester,
  checkSemesterPassStatus
} from '../../data/curriculumData';

export default function StudentDashboard({ 
  studentData, 
  currentUser,
  onUpdateStudentData, 
  setCurrentTab,
  onOpenRoleSwitcher,
  onLogout
}) {
  // Safe resolution of student profile
  const rawStudent = studentData || (currentUser ? buildStudentProfile(currentUser) : null);
  const branchCode = normalizeBranch(rawStudent?.branchCode || rawStudent?.branch || (rawStudent?.rollNo?.includes('ME') ? 'ME' : rawStudent?.rollNo?.includes('EE') ? 'EE' : rawStudent?.rollNo?.includes('CE') ? 'CE' : 'CSE'));
  const semester = normalizeSemester(rawStudent?.semester || (rawStudent?.rollNo?.startsWith('23') ? '3rd Sem' : '1st Sem'));
  const officialCurriculum = getCurriculumSubjects(branchCode, semester);

  // Helper to ensure subjects strictly follow the official JUT curriculum
  const reconcileCurriculumSubjects = (subList) => {
    const existingMap = new Map();
    if (Array.isArray(subList)) {
      subList.forEach(s => {
        if (s && s.code && !s.code.startsWith('EN20')) {
          existingMap.set(s.code.toUpperCase(), s);
        }
      });
    }

    return officialCurriculum.map(curSub => {
      const prev = existingMap.get(curSub.code.toUpperCase());
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
  };

  const student = rawStudent ? {
    ...rawStudent,
    branchCode,
    semester,
    subjects: reconcileCurriculumSubjects(rawStudent.subjects)
  } : null;

  const [subjects, setSubjects] = useState(() => student?.subjects || officialCurriculum);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showLargeQrModal, setShowLargeQrModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'marks' | 'assignments' | 'broadcasts' | 'dues'
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [liveAttendanceLogs, setLiveAttendanceLogs] = useState([]);
  const [liveBroadcasts, setLiveBroadcasts] = useState([]);
  const [selectedBroadcastFilter, setSelectedBroadcastFilter] = useState('All');
  const qrCanvasRef = useRef(null);
  const largeQrCanvasRef = useRef(null);

  // Keep local subjects synchronized when studentData prop updates from parent
  useEffect(() => {
    if (rawStudent?.subjects) {
      setSubjects(reconcileCurriculumSubjects(rawStudent.subjects));
    }
  }, [rawStudent?.subjects, branchCode, semester]);

  // Safe normalized arrays
  const assignments = Array.isArray(student?.assignments) ? student.assignments : [];
  const notifications = Array.isArray(student?.notifications) ? student.notifications : [];
  const [liveDues, setLiveDues] = useState({ tuition: 15200, exam: 2400, hostel: 6000, library: 0 });

  // Fetch live teacher broadcasts from SQLite backend
  const fetchLiveBroadcasts = async () => {
    try {
      const data = await api.getBroadcasts();
      if (Array.isArray(data)) {
        setLiveBroadcasts(data);
      }
    } catch (e) {
      console.warn('Could not fetch teacher broadcasts:', e);
    }
  };

  useEffect(() => {
    fetchLiveBroadcasts();
  }, []);

  // Sync live attendance, internal grades, and fee dues from MySQL institutional database
  const syncAcademicData = async () => {
    if (!student?.id && !student?.rollNo) return;
    try {
      const studentId = student.id;
      const rollNo = student.rollNo;

      const [attById, attByRoll, gradeById, gradeByRoll, logs, dues] = await Promise.all([
        studentId ? api.getStudentAttendance(studentId).catch(() => []) : [],
        rollNo ? api.getStudentAttendance(rollNo).catch(() => []) : [],
        studentId ? api.getStudentGrades(studentId).catch(() => []) : [],
        rollNo ? api.getStudentGrades(rollNo).catch(() => []) : [],
        api.getAttendanceLogs({ studentId, rollNo }).catch(() => []),
        (studentId || rollNo) ? api.getStudentFeeDues(studentId || rollNo).catch(() => null) : null
      ]);

      if (dues) {
        setLiveDues(dues);
      }

      const attRows = [...(Array.isArray(attById) ? attById : []), ...(Array.isArray(attByRoll) ? attByRoll : [])];
      const gradeRows = [...(Array.isArray(gradeById) ? gradeById : []), ...(Array.isArray(gradeByRoll) ? gradeByRoll : [])];

      if (Array.isArray(logs)) {
        setLiveAttendanceLogs(logs);
      }

      const currentSubs = subjects.length > 0 ? subjects : officialCurriculum;
      let hasChange = false;

      const updatedSubs = currentSubs.map(sub => {
        let updated = { ...sub };

        // 1. Reconcile attendance from student_subject_attendance
        const att = attRows.find(a => 
          a.subjectCode && sub.code && a.subjectCode.toUpperCase() === sub.code.toUpperCase()
        );
        if (att) {
          const tot = Number(att.totalClasses) || 0;
          const attd = Number(att.attendedClasses) || 0;
          if (updated.totalClasses !== tot || updated.attendedClasses !== attd) {
            updated.totalClasses = tot;
            updated.attendedClasses = attd;
            updated.lastAttendedDate = att.lastAttendedDate || updated.lastAttendedDate;
            hasChange = true;
          }
        }

        // 2. Reconcile internal marks from student_grades
        const g = gradeRows.find(item => 
          item.subjectCode && sub.code && item.subjectCode.toUpperCase() === sub.code.toUpperCase()
        );
        if (g) {
          const curMid = updated.internalMarks?.midTerm ?? 0;
          const curAsg = updated.internalMarks?.assignment ?? 0;
          const curSes = updated.internalMarks?.sessional ?? 0;
          const gMid = Number(g.midTerm) || 0;
          const gAsg = Number(g.assignment) || 0;
          const gSes = Number(g.sessional) || 0;

          if (curMid !== gMid || curAsg !== gAsg || curSes !== gSes) {
            updated.internalMarks = {
              midTerm: gMid,
              assignment: gAsg,
              sessional: gSes
            };
            hasChange = true;
          }
        }

        return updated;
      });

      if (hasChange || subjects.some(s => s.code?.startsWith('EN20'))) {
        setSubjects(updatedSubs);
        if (onUpdateStudentData) {
          const updatedStudent = { ...student, subjects: updatedSubs };
          onUpdateStudentData(updatedStudent);
        }
      }
    } catch (err) {
      console.warn('Sync academic data error:', err);
    }
  };

  useEffect(() => {
    if (student?.id || student?.rollNo) {
      syncAcademicData();
    }
  }, [student?.id, student?.rollNo]);

  // Generate real, scannable QR Code linking to official verification portal
  const [pythonIdQr, setPythonIdQr] = useState(null);
  const [isGeneratingPythonQr, setIsGeneratingPythonQr] = useState(false);

  // Generates secure public verification URL scannable by Google Lens / Google Scanner without exposing plain-text student PII
  const qrPayload = generateVerificationUrl(student);

  const loadPythonIdQr = async () => {
    setIsGeneratingPythonQr(true);
    try {
      const res = await api.generatePythonQR(qrPayload, {
        boxSize: 10,
        border: 2,
        fillColor: '#0c4a6e',
        backColor: '#ffffff'
      });
      if (res && res.qrBase64) {
        const formatted = res.qrBase64.startsWith('data:')
          ? res.qrBase64
          : `data:image/png;base64,${res.qrBase64}`;
        setPythonIdQr(formatted);
      }
    } catch (e) {
      console.warn('Python QR generator fallback in dashboard:', e);
    } finally {
      setIsGeneratingPythonQr(false);
    }
  };

  useEffect(() => {
    if (showLargeQrModal || showIdCardModal) {
      // 0ms instant client-side QR generation
      QRCode.toDataURL(qrPayload, {
        width: 260,
        margin: 2,
        color: { dark: '#0c4a6e', light: '#ffffff' }
      }, (err, url) => {
        if (!err && url) setPythonIdQr(url);
      });
      loadPythonIdQr();
    }
  }, [showLargeQrModal, showIdCardModal, qrPayload]);

  useEffect(() => {
    if (showIdCardModal && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, qrPayload, {
        width: 100,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error('QR generation error:', err);
      });
    }
  }, [showIdCardModal, qrPayload]);

  useEffect(() => {
    if (showLargeQrModal && largeQrCanvasRef.current) {
      QRCode.toCanvas(largeQrCanvasRef.current, qrPayload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0c4a6e',
          light: '#ffffff'
        }
      });
    }
  }, [showLargeQrModal, qrPayload]);

  // Calculate academic metrics dynamically using official curriculum engine
  const calculatedSGPA = calculateSGPA(subjects);
  const overallAttendance = calculateOverallAttendance(subjects);
  const totalClasses = subjects.reduce((sum, s) => sum + (s.totalClasses || 0), 0);
  const attendedClasses = subjects.reduce((sum, s) => sum + (s.attendedClasses || 0), 0);

  // Determine official JUT semester pass status & progression eligibility
  const passStatus = checkSemesterPassStatus(subjects);
  const nextSemester = getNextSemester(semester);
  const [promoting, setPromoting] = useState(false);
  const [promotionSuccess, setPromotionSuccess] = useState('');

  const handlePromoteSemester = async () => {
    if (!nextSemester || nextSemester === 'Graduated') {
      alert('You have reached the final milestone of your academic program!');
      return;
    }

    if (!window.confirm(`Are you sure you want to advance to ${nextSemester}? You will be enrolled in the official JUT ${nextSemester} curriculum and upcoming semester examination dues (₹2,400) will be initialized.`)) {
      return;
    }

    setPromoting(true);
    try {
      const res = await api.promoteStudentSemester(student.id || student.rollNo, {
        newSemester: nextSemester,
        cgpa: typeof passStatus.sgpa === 'number' ? passStatus.sgpa : (student.cgpa || 8.0)
      });

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      // Update student profile with new semester
      const updatedProfile = buildStudentProfile({
        ...student,
        semester: nextSemester,
        cgpa: typeof passStatus.sgpa === 'number' ? passStatus.sgpa : student.cgpa
      });

      if (onUpdateStudentData) {
        onUpdateStudentData(updatedProfile);
      }
      saveStudentData(updatedProfile);

      setPromotionSuccess(`🎉 Congratulations! You have successfully advanced from ${semester} to ${nextSemester}. Your new course syllabus is active.`);
      setTimeout(() => setPromotionSuccess(''), 8000);
    } catch (err) {
      console.error('Failed to advance semester:', err);
      alert(`Could not advance semester: ${err.message || err}`);
    } finally {
      setPromoting(false);
    }
  };

  const handleAssignmentSubmit = (asgId) => {
    const updatedAssignments = assignments.map(a => {
      if (a.id === asgId) {
        return { ...a, status: 'Submitted', score: null };
      }
      return a;
    });

    const updated = { ...student, assignments: updatedAssignments };
    if (onUpdateStudentData) {
      onUpdateStudentData(updated);
    }
    saveStudentData(updated);
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setSubmissionSuccess(`Assignment submitted successfully to course faculty!`);
    setTimeout(() => setSubmissionSuccess(''), 4000);
  };

  if (!student) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Student Record Found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Please sign in with your registered college credentials or complete admission verification.
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Sign In Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Profile Summary Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Student Info Left */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
                  alt={student.name} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-gec-blue shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" title="Active Enrollment"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-gec-navy">{student.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-gec-blue">
                    {student.branchCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll: <strong className="text-slate-800">{student.rollNo}</strong> • Reg: <strong className="text-slate-800">{student.regNo}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5">
                  <span>{student.branch}</span>
                  <span>•</span>
                  <span>{student.semester}</span>
                  <span>•</span>
                  <span>Batch: {student.batch}</span>
                </div>

                {/* Additional Profile Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{student.contact || '+91 98765 00000'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>Guardian: {student.guardianName || 'Parent / Guardian'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>{student.bloodGroup || 'B+'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                    <Home className="w-3 h-3 text-indigo-500" />
                    <span>{student.hostelResident ? (student.hostelName || 'Hostel Resident') : 'Day Scholar'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Highlights & Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
              <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xl font-black text-gec-navy">
                  {calculatedSGPA !== 'Pending' ? calculatedSGPA : (typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : 'Pending')}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  {calculatedSGPA !== 'Pending' ? 'Current SGPA' : 'Semester SGPA'}
                </div>
              </div>

              <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className={`text-xl font-black ${overallAttendance >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {overallAttendance}%
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Attendance</div>
              </div>

              <div className="flex flex-col gap-2 min-w-[210px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 cursor-pointer"
                    title="Update Contact & Emergency Profile Details"
                  >
                    <UserCog className="w-3.5 h-3.5 text-gec-blue" />
                    <span>Update Details</span>
                  </button>

                  <button
                    onClick={() => setShowIdCardModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gec-blue text-white hover:bg-sky-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-300" />
                    <span>Digital ID</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={onOpenRoleSwitcher}
                    className="text-[11px] text-slate-500 hover:text-gec-blue underline cursor-pointer"
                  >
                    Switch Role / View Faculty
                  </button>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all border border-rose-200 cursor-pointer"
                      title="Log out of student session"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Semester Progression & Clearance Banner */}
        {passStatus.passed && nextSemester && nextSemester !== 'Graduated' && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-2 border-emerald-400">
            <div className="flex items-start md:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                🏆
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-black tracking-tight">Academic Clearance • {semester} Passed!</span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white text-emerald-900 shadow-xs">
                    SGPA: {typeof passStatus.sgpa === 'number' ? passStatus.sgpa.toFixed(2) : passStatus.sgpa}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-100 border border-emerald-400">
                    Zero Backlogs
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                  You have successfully cleared all {subjects.length} courses in <strong>{semester}</strong> in compliance with Jharkhand University of Technology (JUT) academic standards. You are officially eligible for promotion to <strong>{nextSemester}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePromoteSemester}
              disabled={promoting}
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{promoting ? 'Promoting...' : `Enroll in ${nextSemester} →`}</span>
            </button>
          </div>
        )}

        {promotionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2.5 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{promotionSuccess}</span>
          </div>
        )}

        {passStatus.hasBacklog && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Semester Clearance Pending (Backlog Detected)</div>
              <p className="text-rose-700 mt-0.5">{passStatus.reason}</p>
            </div>
          </div>
        )}

        {/* Personalized Notices & Alerts */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  notif.type === 'alert' 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : notif.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-sky-50 border-sky-200 text-sky-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    notif.type === 'alert' ? 'text-rose-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <span className="font-bold mr-2">{notif.title}:</span>
                    <span>{notif.message}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* Live Teacher Broadcasts Quick Banner */}
        {liveBroadcasts.length > 0 && (
          <div 
            onClick={() => setActiveTab('broadcasts')}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <Megaphone className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white text-slate-900">
                    Latest Class Broadcast
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-100">
                    {liveBroadcasts[0].subjectCode || 'Notice'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                  {liveBroadcasts[0].title}: <span className="font-normal opacity-90">{liveBroadcasts[0].message}</span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-white shrink-0 group-hover:translate-x-1 transition-transform">
              <span className="hidden sm:inline">View Notices ({liveBroadcasts.length})</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Success Feedback Alert */}
        {submissionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{submissionSuccess}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Subject Attendance Meter</span>
          </button>

          <button
            onClick={() => setActiveTab('marks')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'marks'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Internal Marks & Sessional</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'broadcasts'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-500" />
            <span>Teacher Notices & Broadcasts</span>
            {liveBroadcasts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {liveBroadcasts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assignments & Lab Submissions</span>
          </button>

          <button
            onClick={() => setActiveTab('dues')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'dues'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Semester Dues & Fee Status</span>
          </button>
        </div>

        {/* Tab 1: Subject Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900 flex items-center justify-between">
              <div>
                <strong>AICTE & JUT Norm:</strong> Minimum 75% attendance is compulsory to generate semester admit card.
              </div>
              <div className="text-[11px] text-sky-700">
                Academic Session 2026-27
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => {
                const subAttended = sub.attendedClasses || 0;
                const subTotal = sub.totalClasses || 0;
                const pct = subTotal > 0 ? Math.round((subAttended / subTotal) * 100) : 0;
                const isShortage = subTotal > 0 && pct < 75;
                const todayDate = new Date().toISOString().split('T')[0];
                const todayLog = liveAttendanceLogs.find(l => l.subjectCode === sub.code && (l.date === todayDate || !l.date));

                return (
                  <div 
                    key={sub.code}
                    className={`bg-white rounded-xl p-5 border shadow-2xs transition-all ${
                      isShortage ? 'border-rose-300 ring-1 ring-rose-300/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-gec-blue bg-slate-100 px-2.5 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {todayLog && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Scanned Today
                          </span>
                        )}
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          subTotal === 0 ? 'bg-slate-100 text-slate-700' :
                          isShortage ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {subTotal === 0 ? 'New Session' : `${pct}%`}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mb-1">{sub.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">Faculty: {sub.faculty}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          subTotal === 0 ? 'bg-slate-300' :
                          isShortage ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>Attended: <strong className="text-slate-900">{subAttended} / {subTotal}</strong></span>
                      {todayLog ? (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified {todayLog.sessionTime || 'Today'}
                        </span>
                      ) : subTotal === 0 ? (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> Classes Commencing
                        </span>
                      ) : isShortage ? (
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Shortage
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Database Verified Smart Attendance Ledger */}
            <div className="mt-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800">
                    Live Smart QR Verification Log (Institutional Database)
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {liveAttendanceLogs.length} Verified Records
                </span>
              </div>

              {liveAttendanceLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No Smart QR attendance records logged yet today. Present your Digital ID card QR to the classroom scanner to record verified presence!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Course Session</th>
                        <th className="p-2.5">Verification Mode</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {liveAttendanceLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-mono">{log.date}</td>
                          <td className="p-2.5 text-slate-500">{log.sessionTime}</td>
                          <td className="p-2.5 font-bold text-slate-800">
                            {log.subjectCode} - {log.subjectName}
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-600">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                              <ScanLine className="w-3 h-3 text-emerald-600" />
                              {log.verifiedVia || 'SMART_QR_CODE'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              VERIFIED PRESENT
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Internal Marks & Sessional */}
        {activeTab === 'marks' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gec-navy">{student.semester} Internal Assessment Card</h3>
                <p className="text-xs text-slate-500">Mid-Term (30 Marks), Sessional/Quiz (10 Marks), Lab/Assignment (10 Marks)</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                Semester SGPA: {calculatedSGPA !== 'Pending' ? `${calculatedSGPA} / 10.0` : 'Pending Evaluation'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Course Code</th>
                    <th className="p-3">Course Title</th>
                    <th className="p-3 text-center">Mid-Term (30)</th>
                    <th className="p-3 text-center">Assignments (10)</th>
                    <th className="p-3 text-center">Sessional (10)</th>
                    <th className="p-3 text-center">Total Internal (50)</th>
                    <th className="p-3 text-center">Projected Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {subjects.map((sub) => {
                    const mid = sub.internalMarks?.midTerm || 0;
                    const asg = sub.internalMarks?.assignment || 0;
                    const ses = sub.internalMarks?.sessional || 0;
                    const total = mid + asg + ses;
                    const evaluation = calculateSubjectGrade(sub.internalMarks);
                    const grade = evaluation.grade;

                    return (
                      <tr key={sub.code} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-gec-blue">{sub.code}</td>
                        <td className="p-3 font-medium text-slate-900">{sub.name}</td>
                        <td className="p-3 text-center font-semibold">{mid}</td>
                        <td className="p-3 text-center font-semibold">{asg}</td>
                        <td className="p-3 text-center font-semibold">{ses}</td>
                        <td className="p-3 text-center font-bold text-gec-navy">{total} / 50</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                            grade === 'Pending' ? 'bg-slate-100 text-slate-600' :
                            grade === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-gec-orange">{asg.subject}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        asg.status === 'Submitted' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {asg.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mb-2">{asg.title}</h4>
                    <p className="text-xs text-slate-500 mb-3">Due Date: <strong>{asg.dueDate}</strong></p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {asg.status === 'Submitted' ? (
                      <span className="text-xs text-slate-600">
                        Score: <strong>{asg.score || 'Grading in progress'} / {asg.maxMarks}</strong>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssignmentSubmit(asg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Document</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Live Teacher Notices & Class Broadcasts */}
        {activeTab === 'broadcasts' && (
          <div className="space-y-6">
            
            {/* Header & Filter Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-gec-navy">
                    Official Course Announcements & Teacher Broadcasts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live updates published by course instructors regarding lectures, syllabus, assignments, and practicals.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter Course:</span>
                {['All', ...(subjects.map(s => s.code))].slice(0, 6).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedBroadcastFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBroadcastFilter === f
                        ? 'bg-gec-blue text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <button
                  onClick={fetchLiveBroadcasts}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all ml-1 cursor-pointer"
                  title="Reload broadcasts"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Broadcasts List */}
            {(() => {
              const filtered = liveBroadcasts.filter(b => {
                if (selectedBroadcastFilter === 'All') return true;
                return b.subjectCode === selectedBroadcastFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No Teacher Broadcasts for {selectedBroadcastFilter}</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Your subject instructors have not posted any broadcasts for this filter yet. When your teacher dispatches a notice, it will immediately appear here.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((b) => {
                    const isAlert = b.type === 'alert';
                    const isAssignment = b.type === 'assignment';
                    const isExam = b.type === 'exam';

                    return (
                      <div 
                        key={b.id}
                        className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                          isAlert ? 'border-rose-300 ring-1 ring-rose-300/30' :
                          isAssignment ? 'border-amber-300 ring-1 ring-amber-300/30' :
                          'border-slate-200'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Subject & Badge Row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-gec-blue">
                                {b.subjectCode || 'ACADEMIC'}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs font-semibold text-slate-600 truncate max-w-[150px]">
                                {b.subjectName || 'Course'}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                              isAlert ? 'bg-rose-100 text-rose-800' :
                              isAssignment ? 'bg-amber-100 text-amber-800' :
                              isExam ? 'bg-purple-100 text-purple-800' :
                              'bg-sky-100 text-sky-800'
                            }`}>
                              {b.type === 'alert' ? '⚠️ Urgent' :
                               b.type === 'assignment' ? '📝 Assignment' :
                               b.type === 'exam' ? '🧪 Lab / Exam' : '📌 Notice'}
                            </span>
                          </div>

                          {/* Title & Message */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {b.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                              {b.message}
                            </p>
                          </div>
                        </div>

                        {/* Teacher Attribution Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gec-blue text-white flex items-center justify-center font-bold text-[9px]">
                              {b.teacherName ? b.teacherName.split(' ').map(n=>n[0]).join('').slice(0,2) : 'FAC'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-none">{b.teacherName}</div>
                              <div className="text-[10px] text-slate-400">{b.teacherDesignation || 'Subject Teacher'}</div>
                            </div>
                          </div>

                          <div className="font-mono text-[10px] text-slate-400">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        )}

        {/* Tab 4: Dues & Payment Status */}
        {activeTab === 'dues' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gec-navy">Pending Institutional Dues Summary</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                MySQL 9.4 Reconciled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Tuition Fee ({student.semester})</div>
                <div className={`text-lg font-bold mt-1 ${liveDues.tuition <= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {liveDues.tuition <= 0 ? '₹0.00 (PAID)' : `₹${Number(liveDues.tuition).toLocaleString('en-IN')}`}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {liveDues.tuition <= 0 ? 'Cleared via SBI Collect' : 'Due for Academic Session'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-800">JUT University Exam Fee</div>
                <div className={`text-lg font-bold mt-1 ${liveDues.exam <= 0 ? 'text-emerald-600' : 'text-amber-900'}`}>
                  {liveDues.exam <= 0 ? '₹0.00 (PAID)' : `₹${Number(liveDues.exam).toLocaleString('en-IN')}`}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">
                  {liveDues.exam <= 0 ? 'Cleared via SBI Collect' : 'Due before Semester Finals'}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${!student.hostelResident ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <div className={`text-xs ${!student.hostelResident ? 'text-slate-600 font-semibold' : 'text-rose-800'}`}>Hostel & Mess Dues</div>
                  {!student.hostelResident && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Exempt</span>
                  )}
                </div>
                <div className={`text-lg font-bold mt-1 ${!student.hostelResident ? 'text-slate-600' : liveDues.hostel <= 0 ? 'text-emerald-600' : 'text-rose-900'}`}>
                  {!student.hostelResident ? '₹0.00 (EXEMPT)' : liveDues.hostel <= 0 ? '₹0.00 (PAID)' : `₹${Number(liveDues.hostel).toLocaleString('en-IN')}`}
                </div>
                <div className={`text-[10px] mt-0.5 ${!student.hostelResident ? 'text-slate-400' : 'text-rose-700'}`}>
                  {!student.hostelResident ? 'Day Scholar • Non-Resident' : liveDues.hostel <= 0 ? 'Cleared via SBI Collect' : (student.hostelName || 'Hostel Facility Fee')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('payment')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gec-orange hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Pay Fees Online & Download Stamped Receipt</span>
            </button>
          </div>
        )}

      </div>

      {/* Digital ID Card Modal */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Official Student Identity Card</span>
              <button 
                onClick={() => setShowIdCardModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ID Card Container */}
            <div className="p-6">
              <div className="border-2 border-gec-blue rounded-2xl p-5 bg-gradient-to-b from-sky-50/50 to-white shadow-inner relative overflow-hidden">
                {/* Government Header */}
                <div className="text-center pb-3 border-b border-sky-200">
                  <div className="text-[9px] font-bold text-amber-600 uppercase">Govt. of Jharkhand</div>
                  <div className="text-sm font-extrabold text-gec-blue leading-tight">
                    Government Engineering College, Palamu
                  </div>
                  <div className="text-[9px] text-slate-500">Lesliganj, Medininagar - 822118</div>
                </div>

                {/* Card Body */}
                <div className="flex items-center gap-4 py-4">
                  <img 
                    src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
                    alt={student.name} 
                    className="w-20 h-24 rounded-lg object-cover border-2 border-gec-blue shadow"
                  />
                  <div className="text-xs space-y-1">
                    <div className="font-extrabold text-sm text-gec-navy">{student.name}</div>
                    <div className="text-slate-600">Roll: <strong className="text-slate-900">{student.rollNo}</strong></div>
                    <div className="text-slate-600">Reg: <strong>{student.regNo}</strong></div>
                    <div className="text-slate-600">Branch: <strong>{student.branchCode}</strong></div>
                    <div className="text-slate-600">Blood Group: <strong className="text-rose-600">{student.bloodGroup || 'B+'}</strong></div>
                    <div className="text-slate-600">Valid Till: <strong>June 2028</strong></div>
                  </div>
                </div>

                {/* Card Footer with Real Scannable Smart Attendance QR & Principal Signature */}
                <div className="pt-3 border-t border-sky-200 flex items-center justify-between text-[9px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white border border-slate-300 rounded shadow-xs relative group cursor-pointer" onClick={() => setShowLargeQrModal(true)}>
                      <canvas ref={qrCanvasRef} width="100" height="100" className="w-16 h-16 rounded" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center text-white text-[8px] font-bold">
                        Enlarge
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-700 uppercase tracking-wider text-[8px] flex items-center gap-1">
                        <ScanLine className="w-2.5 h-2.5" />
                        <span>Google Scanner & Digital ID QR</span>
                      </div>
                      <div className="font-mono text-[8px] text-slate-600">ID: {student.id || 'usr-std-01'}</div>
                      <div className="font-mono text-[8px] text-gec-blue font-bold">{student.rollNo}</div>
                      <button
                        type="button"
                        onClick={() => setShowLargeQrModal(true)}
                        className="mt-1 text-[8px] font-bold text-gec-blue hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                        <span>Show QR Fullscreen</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic font-bold text-slate-800 text-xs">Sanjay Kr Singh</div>
                    <div className="text-[8px]">Principal & Authority</div>
                    <div className="text-[7px] text-slate-400">GEC Palamu</div>
                  </div>
                </div>
              </div>

              {/* QR Verification Payload Tooltip */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-100 text-[10px] text-slate-600 flex items-center justify-between">
                <span>Google Scanner Link: <strong className="text-emerald-700 font-bold">Scannable by Google Lens & Camera</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(qrPayload);
                    alert("Official Student Verification URL copied to clipboard! You can paste it into any browser or test it.");
                  }}
                  className="font-bold text-gec-blue hover:underline cursor-pointer"
                >
                  Copy Verification URL
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (qrCanvasRef.current) {
                    const link = document.createElement('a');
                    link.download = `GECP_QR_${student.rollNo.replace(/\//g, '_')}.png`;
                    link.href = qrCanvasRef.current.toDataURL();
                    link.click();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR (PNG)</span>
              </button>

              <button
                onClick={() => {
                  const qrData = pythonIdQr || (qrCanvasRef.current ? qrCanvasRef.current.toDataURL() : '');
                  printStudentIdCard(student, qrData);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Digital ID</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Large Fullscreen QR Modal (For presenting to classroom camera) */}
      {showLargeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gec-navy flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-emerald-600" />
                <span>Google Scanner & Smart Attendance QR</span>
              </div>
              <button 
                onClick={() => setShowLargeQrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Scan with <strong>Google Scanner</strong>, <strong>Google Lens</strong>, or your phone's camera to instantly view official verified student credentials, or present to faculty terminal for classroom attendance.
            </p>

            <div className="p-4 bg-slate-50 border-2 border-emerald-400 rounded-2xl inline-block shadow-inner">
              {pythonIdQr ? (
                <div>
                  <img 
                    src={pythonIdQr?.startsWith('data:') ? pythonIdQr : `data:image/png;base64,${pythonIdQr}`} 
                    alt="Institutional Verification QR" 
                    className="w-56 h-56 mx-auto rounded-xl shadow-xs" 
                    onError={() => {
                      QRCode.toDataURL(qrPayload, {
                        width: 260,
                        margin: 2,
                        color: { dark: '#0c4a6e', light: '#ffffff' }
                      }, (err, url) => {
                        if (!err && url) setPythonIdQr(url);
                      });
                    }}
                  />
                  <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 rounded-full py-0.5 px-2.5">
                      📷 Scannable by Google Lens
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full py-0.5 px-2.5">
                      ✓ JUT Verified
                    </span>
                  </div>
                </div>
              ) : (
                <canvas ref={largeQrCanvasRef} width="260" height="260" className="mx-auto rounded-xl" />
              )}
            </div>

            <div>
              <div className="font-extrabold text-sm text-gec-navy">{student.name}</div>
              <div className="font-mono text-xs font-bold text-gec-blue">{student.rollNo}</div>
              <div className="text-[10px] text-slate-500">{student.branchCode} • {student.semester}</div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `GECP_Smart_Attendance_QR_${student.rollNo.replace(/\//g, '_')}.png`;
                  link.href = pythonIdQr || (largeQrCanvasRef.current ? largeQrCanvasRef.current.toDataURL() : '');
                  link.click();
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Download HD QR (PNG)
              </button>
              <button
                type="button"
                onClick={() => setShowLargeQrModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile & Details Edit Modal */}
      <StudentProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        studentData={student}
        onUpdateStudentData={onUpdateStudentData}
      />

    </div>
  );
}
