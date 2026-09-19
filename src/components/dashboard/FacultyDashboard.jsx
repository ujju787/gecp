import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Users, 
  Calendar, 
  Check, 
  X, 
  Save, 
  Send, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  ShieldCheck,
  ScanLine,
  ExternalLink,
  Clock,
  Sparkles,
  Megaphone,
  BellRing,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Filter,
  GraduationCap,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { saveStudentData, buildStudentProfile } from '../../utils/storage';
import { 
  getTeacherAssignedSubjects, 
  normalizeBranch, 
  normalizeSemester, 
  BRANCHES, 
  SEMESTERS, 
  getCurriculumSubjects,
  getNextSemester,
  calculateSubjectGrade
} from '../../data/curriculumData';

export default function FacultyDashboard({ 
  facultyData, 
  onUpdateFacultyData, 
  onOpenRoleSwitcher,
  onLogout,
  currentUser,
  studentData,
  onUpdateStudentData,
  setCurrentTab
}) {
  // 1. Determine Faculty Profile & Role
  const isHod = currentUser?.role === 'hod' || (currentUser?.email && (currentUser.email.toLowerCase().includes('hod') || currentUser.email.toLowerCase().includes('dr.')));
  const isHodOrAdmin = isHod || currentUser?.role === 'admin';
  const isOS = currentUser?.email === 'amit.sharma@gecpalamu.ac.in' || currentUser?.name?.includes('Amit Sharma');
  const isDAA = currentUser?.email === 'priya.faculty@gecpalamu.ac.in' || currentUser?.name?.includes('Priya');

  const instructorName = currentUser?.name || (isHod ? 'Department Head (HOD)' : isOS ? 'Prof. Amit Sharma' : isDAA ? 'Prof. Priya Kumari' : facultyData?.name || 'Course Instructor');
  const instructorDesignation = currentUser?.designation || (isHod ? 'Head of Department & Associate Professor' : isOS ? 'Assistant Professor (Subject Teacher - CS502 OS)' : isDAA ? 'Assistant Professor (Subject Teacher - CS504 DAA)' : facultyData?.designation || 'Assistant Professor');
  const instructorEmail = currentUser?.email || (isHod ? 'hod@gecpalamu.ac.in' : isOS ? 'amit.sharma@gecpalamu.ac.in' : isDAA ? 'priya.faculty@gecpalamu.ac.in' : facultyData?.email || 'faculty@gecpalamu.ac.in');
  const instructorDept = currentUser?.department || facultyData?.department || 'Engineering';

  // 2. Assigned Classes based on Official Curriculum
  const assignedClasses = getTeacherAssignedSubjects(currentUser);
  const initialClass = isOS ? 'CS502' : isDAA ? 'CS504' : (assignedClasses[0]?.code || 'CS501');
  const initialBranch = assignedClasses[0]?.branch || currentUser?.branchCode || (instructorDept.includes('Civil') ? 'CE' : instructorDept.includes('Electrical') ? 'EE' : instructorDept.includes('Mechanical') ? 'ME' : 'CSE');
  const initialSemester = assignedClasses[0]?.semester || '5th Sem';

  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [dbStudents, setDbStudents] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [subjectAttendanceMap, setSubjectAttendanceMap] = useState({});
  const [todayLogs, setTodayLogs] = useState([]);
  const [sessionAlreadyMarked, setSessionAlreadyMarked] = useState(false);
  const [activeSection, setActiveSection] = useState('attendance'); // 'attendance' | 'marks'

  // 3. Build Roster dynamically for the Selected Course, Branch, and Semester
  const syncRoster = (studentsList, classCode, branchCode, semStr, attLedger = [], gradesList = [], curTodayLogs = []) => {
    const list = Array.isArray(studentsList) ? studentsList : dbStudents;
    const targetBranch = normalizeBranch(branchCode || selectedBranch);
    const targetSem = normalizeSemester(semStr || selectedSemester);

    // Filter strictly to students enrolled in this branch and semester!
    const enrolledStudents = list.filter(std => {
      const b = normalizeBranch(std.branchCode || std.branch || (std.rollNo?.includes('ME') ? 'ME' : std.rollNo?.includes('EE') ? 'EE' : std.rollNo?.includes('CE') ? 'CE' : 'CSE'));
      const s = normalizeSemester(std.semester || (std.rollNo?.startsWith('23') ? '3rd Sem' : '1st Sem'));
      return b === targetBranch && s === targetSem;
    });

    const savedClassRoster = facultyData?.[`studentRoster_${classCode}`] || [];

    const built = enrolledStudents.map(std => {
      const existing = savedClassRoster.find(r => r.roll === std.rollNo || r.id === std.id);

      // 1. Check live grades from backend first
      const gradeRecord = Array.isArray(gradesList) ? gradesList.find(g => 
        (g.studentId && std.id && g.studentId.toLowerCase() === std.id.toLowerCase()) ||
        (g.rollNo && std.rollNo && g.rollNo.toLowerCase() === std.rollNo.toLowerCase())
      ) : null;

      // 2. Check live attendance ledger from backend
      const attRecord = Array.isArray(attLedger) ? attLedger.find(a => 
        (a.studentId && std.id && a.studentId.toLowerCase() === std.id.toLowerCase()) ||
        (a.rollNo && std.rollNo && a.rollNo.toLowerCase() === std.rollNo.toLowerCase())
      ) : null;

      // 3. Check today's marked log
      const todayLog = Array.isArray(curTodayLogs) ? curTodayLogs.find(l => 
        (l.studentId && std.id && l.studentId.toLowerCase() === std.id.toLowerCase()) ||
        (l.rollNo && std.rollNo && l.rollNo.toLowerCase() === std.rollNo.toLowerCase())
      ) : null;

      const markedToday = Boolean(todayLog);
      const isPresentToday = todayLog 
        ? (todayLog.status === 'PRESENT' || todayLog.status === 'present')
        : (existing ? existing.presentToday : true);

      let localMid = gradeRecord ? gradeRecord.midTerm : existing?.midTermMarks;
      let localAsg = gradeRecord ? gradeRecord.assignment : existing?.assignmentMarks;
      let localSes = gradeRecord ? gradeRecord.sessional : existing?.sessionalMarks;
      let totalCls = attRecord ? (Number(attRecord.totalClasses) || 0) : 0;
      let attendedCls = attRecord ? (Number(attRecord.attendedClasses) || 0) : 0;

      // 3. Fallback to student document in localStorage if not in ledger
      if (localMid === undefined || totalCls === 0) {
        try {
          const docStr = localStorage.getItem(`gecp_student_data_${std.id}`) || localStorage.getItem(`gecp_student_data_${(std.rollNo || '').replace(/\//g, '_')}`);
          if (docStr) {
            const parsedDoc = JSON.parse(docStr);
            const foundSub = parsedDoc.subjects?.find(s => s.code?.toUpperCase() === classCode?.toUpperCase());
            if (foundSub) {
              if (localMid === undefined) localMid = foundSub.internalMarks?.midTerm;
              if (localAsg === undefined) localAsg = foundSub.internalMarks?.assignment;
              if (localSes === undefined) localSes = foundSub.internalMarks?.sessional;
              if (totalCls === 0 && foundSub.totalClasses) totalCls = foundSub.totalClasses;
              if (attendedCls === 0 && foundSub.attendedClasses) attendedCls = foundSub.attendedClasses;
            }
          }
        } catch {}
      }

      const attendancePct = totalCls > 0 ? Math.round((attendedCls / totalCls) * 100) : (existing?.attendancePct ?? 0);
      const isLockedForFaculty = markedToday && !isHodOrAdmin;

      return {
        id: std.id,
        roll: std.rollNo,
        name: std.name,
        branch: std.branch,
        semester: std.semester,
        cgpa: std.cgpa,
        totalClasses: totalCls,
        attendedClasses: attendedCls,
        attendancePct,
        midTermMarks: localMid ?? 0,
        assignmentMarks: localAsg ?? 0,
        sessionalMarks: localSes ?? 0,
        markedToday,
        todayLogStatus: todayLog?.status || null,
        isLockedForFaculty,
        presentToday: isPresentToday,
        isCurrentStudent: studentData?.id === std.id || studentData?.rollNo === std.rollNo
      };
    });

    setRoster(built);
  };

  const fetchStudentsAndAttendance = async (activeBranch = selectedBranch, activeSem = selectedSemester, activeCode = selectedClass) => {
    try {
      setLoadingRoster(true);
      const todayDate = new Date().toISOString().split('T')[0];
      const [res, attLedger, gradesList, logsData] = await Promise.all([
        api.getApprovedStudents().catch(() => []),
        api.getSubjectAttendance(activeCode).catch(() => []),
        api.getSubjectGrades(activeCode).catch(() => []),
        api.getAttendanceLogs({ subjectCode: activeCode, date: todayDate }).catch(() => [])
      ]);

      const list = Array.isArray(res) ? res : (res?.students || []);
      setDbStudents(list);
      const fetchedLogs = Array.isArray(logsData) ? logsData : [];
      setTodayLogs(fetchedLogs);
      setSessionAlreadyMarked(fetchedLogs.length > 0);

      syncRoster(list, activeCode, activeBranch, activeSem, attLedger, gradesList, fetchedLogs);
    } catch (e) {
      console.warn('Could not load approved students for roster:', e);
    } finally {
      setLoadingRoster(false);
    }
  };

  // Branch & Semester Switching Handlers
  const handleSelectAssignedClass = (c) => {
    const b = c.branch || 'CSE';
    const s = c.semester || '5th Sem';
    setSelectedBranch(b);
    setSelectedSemester(s);
    setSelectedClass(c.code);
    fetchStudentsAndAttendance(b, s, c.code);
  };

  const handleBranchChange = (newBranch) => {
    setSelectedBranch(newBranch);
    const newSubjects = getCurriculumSubjects(newBranch, selectedSemester);
    const firstCode = newSubjects[0]?.code || '';
    setSelectedClass(firstCode);
    fetchStudentsAndAttendance(newBranch, selectedSemester, firstCode);
  };

  const handleSemesterChange = (newSem) => {
    setSelectedSemester(newSem);
    const newSubjects = getCurriculumSubjects(selectedBranch, newSem);
    const firstCode = newSubjects[0]?.code || '';
    setSelectedClass(firstCode);
    fetchStudentsAndAttendance(selectedBranch, newSem, firstCode);
  };

  const handleCourseChange = (newCode) => {
    setSelectedClass(newCode);
    fetchStudentsAndAttendance(selectedBranch, selectedSemester, newCode);
  };

  // Toggle present/absent for a student
  const handleToggleAttendance = (roll) => {
    const studentObj = roster.find(s => s.roll === roll);
    if (studentObj?.isLockedForFaculty) {
      alert(`🔒 Attendance Locked: Attendance for ${studentObj.name} (${studentObj.roll}) has already been recorded for today and is locked. Under institutional regulations, attendance cannot be modified by regular faculty. Head of Department (HOD) ${instructorName} authorization is required to modify recorded attendance.`);
      return;
    }
    const updated = roster.map(s => {
      if (s.roll === roll) {
        return { ...s, presentToday: !s.presentToday };
      }
      return s;
    });
    setRoster(updated);
  };

  // Promote student to next semester (Faculty/HOD administrative control)
  const handlePromoteStudentByFaculty = async (student) => {
    const nextSem = getNextSemester(student.semester);
    if (!nextSem || nextSem === 'Graduated') {
      alert(`Student ${student.name} is already in the final semester (${student.semester}).`);
      return;
    }
    if (!window.confirm(`Are you sure you want to promote ${student.name} (${student.roll}) from ${student.semester} to ${nextSem}? Upcoming semester examination fee dues (₹2,400) will be initialized.`)) {
      return;
    }
    try {
      const res = await api.promoteStudentSemester(student.id || student.roll, {
        newSemester: nextSem,
        cgpa: student.cgpa || 8.0
      });
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setStatusMessage(`🎓 Success: ${student.name} (${student.roll}) successfully promoted to ${nextSem}!`);
      setTimeout(() => {
        fetchStudentsAndAttendance(selectedBranch, selectedSemester, selectedClass);
      }, 500);
    } catch (err) {
      alert(`Failed to promote student: ${err.message || err}`);
    }
  };

  // Update marks for a student
  const handleMarksChange = (roll, field, value) => {
    const max = field === 'midTermMarks' ? 30 : 10;
    const num = Math.min(max, Math.max(0, Number(value) || 0));
    const updated = roster.map(s => {
      if (s.roll === roll) {
        return { ...s, [field]: num };
      }
      return s;
    });
    setRoster(updated);
  };

  // Quick Roll Call Bulk Actions
  const handleMarkAllPresent = () => {
    if (sessionAlreadyMarked && !isHodOrAdmin) {
      alert(`🔒 Today's roll call is already recorded and locked. Only Head of Department (HOD) ${instructorName} can modify recorded attendance.`);
      return;
    }
    const updated = roster.map(s => {
      if (s.isLockedForFaculty) return s;
      return { ...s, presentToday: true };
    });
    setRoster(updated);
  };

  const handleMarkAllAbsent = () => {
    if (sessionAlreadyMarked && !isHodOrAdmin) {
      alert(`🔒 Today's roll call is already recorded and locked. Only Head of Department (HOD) ${instructorName} can modify recorded attendance.`);
      return;
    }
    const updated = roster.map(s => {
      if (s.isLockedForFaculty) return s;
      return { ...s, presentToday: false };
    });
    setRoster(updated);
  };

  // 1. Dedicated Attendance Saving Handler (Once-Daily Rule + HOD Authorization)
  const handleSaveAttendance = async () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const curCatalog = getCurriculumSubjects(selectedBranch, selectedSemester);
    const activeClassObj = assignedClasses.find(c => c.code === selectedClass) 
      || curCatalog.find(c => c.code === selectedClass)
      || { code: selectedClass, name: selectedClass };

    const sessionData = {
      facultyId: currentUser?.id || 'faculty-01',
      subjectCode: selectedClass,
      subjectName: activeClassObj.name,
      branch: selectedBranch,
      semester: selectedSemester,
      date: todayDate,
      isHodOverride: isHodOrAdmin,
      records: roster.map(studentRow => ({
        studentId: studentRow.id,
        rollNo: studentRow.roll,
        studentName: studentRow.name,
        status: studentRow.presentToday ? 'present' : 'absent'
      }))
    };

    let attNotification = '';
    try {
      const attResult = await api.markSessionAttendance(sessionData);
      if (attResult?.locked) {
        attNotification = '🔒 Today\'s attendance is already locked. Only HOD can modify it.';
      } else if (attResult?.hodOverride) {
        attNotification = `👑 HOD Authorized Correction: Attendance modified for ${attResult.updatedCount || 'selected'} students.`;
      } else {
        attNotification = `✅ Session attendance for ${selectedClass} recorded successfully.`;
      }
    } catch (e) {
      console.warn('Session attendance API notification:', e?.message || e);
    }

    // Sync live to active student if present
    if (studentData && onUpdateStudentData) {
      const matchRow = roster.find(r => r.roll === studentData.rollNo || r.id === studentData.id);
      if (matchRow) {
        try {
          const liveAtt = await api.getStudentAttendance(studentData.id || studentData.rollNo).catch(() => []);
          const attRows = Array.isArray(liveAtt) ? liveAtt : [];
          let activeStudent = studentData;
          if (!activeStudent.subjects) {
            activeStudent = buildStudentProfile(activeStudent);
          }
          const updatedSubs = (activeStudent.subjects || []).map(sub => {
            let updated = { ...sub };
            const att = attRows.find(a => a.subjectCode && sub.code && a.subjectCode.toUpperCase() === sub.code.toUpperCase());
            if (att) {
              updated.totalClasses = Number(att.totalClasses) || 0;
              updated.attendedClasses = Number(att.attendedClasses) || 0;
              updated.lastAttendedDate = att.lastAttendedDate || updated.lastAttendedDate;
            }
            return updated;
          });
          onUpdateStudentData({ ...activeStudent, subjects: updatedSubs });
        } catch (syncErr) {
          console.warn('Live student data sync error:', syncErr);
        }
      }
    }

    // Re-fetch live verified state from database for this course
    setTimeout(() => {
      fetchStudentsAndAttendance(selectedBranch, selectedSemester, selectedClass);
    }, 400);

    if (onUpdateFacultyData && facultyData) {
      onUpdateFacultyData({
        ...facultyData,
        [`studentRoster_${selectedClass}`]: roster
      });
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });

    setStatusMessage(attNotification || `Session attendance for ${selectedClass} (${activeClassObj.name}) successfully saved and synchronized!`);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  // 2. Dedicated Internal Marks & Examination Grades Handler
  const handleSaveGrades = async () => {
    const curCatalog = getCurriculumSubjects(selectedBranch, selectedSemester);
    const activeClassObj = assignedClasses.find(c => c.code === selectedClass) 
      || curCatalog.find(c => c.code === selectedClass)
      || { code: selectedClass, name: selectedClass };

    const gradesToSync = roster.map(studentRow => ({
      studentId: studentRow.id,
      rollNo: studentRow.roll,
      subjectCode: selectedClass,
      subjectName: activeClassObj.name,
      midTerm: studentRow.midTermMarks || 0,
      assignment: studentRow.assignmentMarks || 0,
      sessional: studentRow.sessionalMarks || 0
    }));

    try {
      await api.saveStudentGrades(gradesToSync);
    } catch (e) {
      console.warn('Grades sync notice:', e?.message || e);
    }

    // Sync live to active student if present
    if (studentData && onUpdateStudentData) {
      const matchRow = roster.find(r => r.roll === studentData.rollNo || r.id === studentData.id);
      if (matchRow) {
        try {
          const liveGrades = await api.getStudentGrades(studentData.id || studentData.rollNo).catch(() => []);
          const gradeRows = Array.isArray(liveGrades) ? liveGrades : [];
          let activeStudent = studentData;
          if (!activeStudent.subjects) {
            activeStudent = buildStudentProfile(activeStudent);
          }
          const updatedSubs = (activeStudent.subjects || []).map(sub => {
            let updated = { ...sub };
            const g = gradeRows.find(item => item.subjectCode && sub.code && item.subjectCode.toUpperCase() === sub.code.toUpperCase());
            if (g) {
              updated.internalMarks = {
                midTerm: Number(g.midTerm) || 0,
                assignment: Number(g.assignment) || 0,
                sessional: Number(g.sessional) || 0
              };
            }
            return updated;
          });
          onUpdateStudentData({ ...activeStudent, subjects: updatedSubs });
        } catch (syncErr) {
          console.warn('Live student data sync error:', syncErr);
        }
      }
    }

    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.7 }
    });

    setStatusMessage(`📝 Continuous Internal Assessment (CIE) marks for ${selectedClass} (${activeClassObj.name}) successfully saved and synchronized with student portals!`);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  // 4. Notice & Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [postingBroadcast, setPostingBroadcast] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);

  const loadBroadcasts = async () => {
    try {
      const list = await api.getBroadcasts();
      if (Array.isArray(list)) {
        setRecentBroadcasts(list);
      }
    } catch (e) {
      console.warn('Could not load broadcasts:', e);
    }
  };

  useEffect(() => {
    fetchStudentsAndAttendance(selectedBranch, selectedSemester, selectedClass);
    loadBroadcasts();
  }, []);

  // Post Teacher Broadcast to SQLite Backend
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !announcementText.trim()) return;

    try {
      setPostingBroadcast(true);
      const activeClassObj = assignedClasses.find(c => c.code === selectedClass);
      
      const payload = {
        title: broadcastTitle.trim(),
        message: announcementText.trim(),
        teacherId: currentUser?.id || 'fac-01',
        teacherName: instructorName,
        teacherDesignation: instructorDesignation,
        subjectCode: selectedClass,
        subjectName: activeClassObj?.name || selectedClass,
        type: broadcastType,
        targetAudience: isHod ? `All Department Students (${selectedBranch})` : `All Enrolled ${selectedClass} Students`
      };

      await api.postBroadcast(payload);

      // Also inject into student's active notifications so student sees it immediately in local state
      if (studentData && onUpdateStudentData) {
        const notifType = broadcastType === 'alert' ? 'alert' : broadcastType === 'assignment' ? 'warning' : 'info';
        const newNotif = {
          id: `bc-${Date.now()}`,
          title: `[${selectedClass}] ${broadcastTitle.trim()}`,
          date: new Date().toISOString().split('T')[0],
          type: notifType,
          message: announcementText.trim(),
          by: `${instructorName} (${instructorDesignation})`
        };
        onUpdateStudentData({
          ...studentData,
          notifications: [newNotif, ...(studentData.notifications || [])]
        });
      }

      await loadBroadcasts();

      confetti({ particleCount: 45, spread: 60 });
      setStatusMessage(`Broadcast message published successfully to all students enrolled in ${selectedClass}!`);
      setBroadcastTitle('');
      setAnnouncementText('');
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err) {
      alert('Failed to publish broadcast: ' + (err.error || err.message || 'Server error'));
    } finally {
      setPostingBroadcast(false);
    }
  };

  const presentCount = roster.filter(s => s.presentToday).length;
  const totalStudents = roster.length;

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'B+': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'B': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'C': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'P': return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'F': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const currentCatalogSubjects = getCurriculumSubjects(selectedBranch, selectedSemester);
  const activeClassObj = assignedClasses.find(c => c.code === selectedClass) 
    || currentCatalogSubjects.find(c => c.code === selectedClass) 
    || { code: selectedClass, name: selectedClass, branch: selectedBranch, semester: selectedSemester };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Header Card */}
        <div className={`rounded-3xl p-6 md:p-8 border shadow-sm mb-8 transition-all ${
          isHod 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-800/50' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border-2 shrink-0 ${
                isHod 
                  ? 'bg-indigo-600 text-white border-amber-400 ring-4 ring-indigo-500/20' 
                  : 'bg-gec-blue text-white border-amber-400'
              }`}>
                {isHod ? 'HOD' : isOS ? 'AS' : isDAA ? 'PK' : 'FAC'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`text-xl md:text-2xl font-black ${isHod ? 'text-white' : 'text-gec-navy'}`}>
                    {instructorName}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isHod 
                      ? 'bg-indigo-500/30 text-amber-300 border border-amber-400/40' 
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {isHod ? 'HOD • Academic Executive' : 'Subject Teacher'}
                  </span>
                </div>

                <p className={`text-xs font-semibold mt-1 ${isHod ? 'text-amber-300' : 'text-gec-orange'}`}>
                  {instructorDesignation} • {instructorDept}
                </p>

                <p className={`text-xs mt-1 ${isHod ? 'text-slate-300' : 'text-slate-500'}`}>
                  Institutional Email: <strong>{instructorEmail}</strong> • Active Term: <strong>Odd Sem 2026-27</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
              {/* Quick Scanner Shortcut for Teachers */}
              {setCurrentTab && (
                <button
                  onClick={() => setCurrentTab('smart-qr')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                    isHod 
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 hover:scale-105' 
                      : 'bg-gec-blue hover:bg-sky-900 text-white'
                  }`}
                  title="Open Classroom Optical Attendance Scanner"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Open Scanner Terminal</span>
                </button>
              )}

              {/* HOD Student Approval Desk Shortcut */}
              {isHod && setCurrentTab && (
                <button
                  onClick={() => setCurrentTab('approval-desk')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer border border-indigo-400/30"
                  title="Access HOD Student Registration Verification Desk"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Student Approvals</span>
                </button>
              )}

              <button
                onClick={onOpenRoleSwitcher}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isHod 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                Switch Role
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Sign out of teacher session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>

          {/* HOD Executive Powers Ribbon */}
          {isHod && (
            <div className="mt-6 pt-5 border-t border-indigo-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-indigo-900/40 rounded-xl border border-indigo-700/40">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Department Registration Approval</div>
                  <div className="text-[11px] text-indigo-200">Review & approve newly registered {selectedBranch} students</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-indigo-900/40 rounded-xl border border-indigo-700/40">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Course Evaluation Authority</div>
                  <div className="text-[11px] text-indigo-200">Oversee internal marks and course progress for {selectedBranch}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-indigo-900/40 rounded-xl border border-indigo-700/40">
                <Megaphone className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Department Notice Dispatcher</div>
                  <div className="text-[11px] text-indigo-200">Send high-priority announcements to all {selectedBranch} students</div>
                </div>
              </div>

              <div 
                onClick={() => setCurrentTab && setCurrentTab('events')}
                className="flex items-center gap-3 p-3 bg-indigo-900/60 hover:bg-indigo-800/90 cursor-pointer rounded-xl border border-purple-400/50 hover:border-purple-400 transition-all group shadow-sm"
              >
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 group-hover:rotate-12 transition-transform" />
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Campus Event Control</span>
                    <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1.5 py-0.2 rounded font-bold border border-purple-400/30">HOD</span>
                  </div>
                  <div className="text-[11px] text-indigo-200">Organize events & track registered students</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Status Alert */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Class Selection & Quick Stats Strip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          
          {/* Top Controls: Assigned Class Quick-Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Layers className="w-4 h-4 text-gec-blue" />
                <span>My Assigned Courses:</span>
              </span>
              {assignedClasses.map((c) => {
                const isSel = selectedClass === c.code && selectedBranch === (c.branch || 'CSE') && selectedSemester === (c.semester || '5th Sem');
                return (
                  <button
                    key={c.code}
                    onClick={() => handleSelectAssignedClass(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSel
                        ? 'bg-gec-blue text-white shadow-sm ring-2 ring-sky-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{c.code}</span>
                    <span className="opacity-80 font-normal hidden sm:inline">• {c.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                      isSel ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {c.role}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Enrolled: <strong>{totalStudents}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                Present Today: <strong>{presentCount} / {totalStudents}</strong> ({totalStudents > 0 ? Math.round((presentCount/totalStudents)*100) : 0}%)
              </div>
            </div>
          </div>

          {/* Department, Semester & Subject Navigator */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gec-orange" />
                <span>Department:</span>
              </span>
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gec-blue cursor-pointer"
              >
                {Object.values(BRANCHES).map(b => (
                  <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gec-blue cursor-pointer"
              >
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <span className="text-xs font-bold text-slate-500">Subject:</span>
              <select
                value={selectedClass}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-gec-navy focus:outline-none focus:ring-2 focus:ring-gec-blue cursor-pointer flex-1"
              >
                {currentCatalogSubjects.map(sub => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name} ({sub.credits} Credits • {sub.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filtering Info Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gec-blue" />
              <span>
                Active Roster Filter: <strong>{BRANCHES[selectedBranch]?.name || selectedBranch}</strong> • <strong>{selectedSemester}</strong> • Course: <strong className="text-gec-navy">{selectedClass} ({activeClassObj?.name})</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
              Only students enrolled in {selectedBranch} {selectedSemester} are displayed
            </span>
          </div>

        </div>

        {/* Main Grid: Student Assessment Gradebook (8 Cols) + Announcement Broadcast (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Classroom Work Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">

            {/* Section Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('attendance')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeSection === 'attendance'
                      ? 'bg-gec-blue text-white shadow-sm'
                      : 'text-slate-600 hover:text-gec-navy hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Daily Attendance Register</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeSection === 'attendance' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sessionAlreadyMarked ? (isHodOrAdmin ? '👑 HOD Override' : '🔒 Recorded') : 'Pending'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('marks')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeSection === 'marks'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-gec-navy hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Internal Assessment & Marks (CIE)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeSection === 'marks' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Max 50
                  </span>
                </button>
              </div>

              {/* Quick contextual action */}
              {activeSection === 'attendance' ? (
                <button
                  onClick={handleSaveAttendance}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Attendance</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveGrades}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Publish Marks</span>
                </button>
              )}
            </div>

            {/* SECTION 1: ATTENDANCE REGISTER */}
            {activeSection === 'attendance' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Header */}
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm md:text-base font-black text-gec-navy">
                        {selectedClass} • Daily Attendance & Roll Call Register
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mark daily classroom session attendance once per day. Synchronizes live with student attendance meters and institutional records.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkAllPresent}
                      disabled={sessionAlreadyMarked && !isHodOrAdmin}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        sessionAlreadyMarked && !isHodOrAdmin
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-2xs'
                      }`}
                      title="Mark all students present today"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark All Present</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkAllAbsent}
                      disabled={sessionAlreadyMarked && !isHodOrAdmin}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        sessionAlreadyMarked && !isHodOrAdmin
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-2xs'
                      }`}
                      title="Mark all students absent today"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Mark All Absent</span>
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Attendance</span>
                    </button>
                  </div>
                </div>

                {/* Attendance Lock / HOD Override Alert Banner */}
                {todayLogs.length > 0 && (
                  <div className={`p-4 m-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    isHodOrAdmin 
                      ? 'bg-amber-50 border-amber-300 text-amber-900' 
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      {isHodOrAdmin ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                          👑
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shadow-inner shrink-0">
                          <Lock className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-black text-sm flex items-center gap-2">
                          <span>{isHodOrAdmin ? 'HOD Authority Active • Attendance Modification Permitted' : "Today's Roll Call Recorded & Locked"}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-mono font-bold border border-slate-200">
                            {todayLogs.length} Marked Today
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {isHodOrAdmin 
                            ? `Attendance for ${selectedClass} was recorded today. As Head of Department (HOD), you are authorized to override and rectify attendance.`
                            : `Roll call for ${selectedClass} has already been recorded today. Under academic regulations, attendance is marked once per day and can only be altered by the HOD.`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isHodOrAdmin ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-200 text-amber-900 font-extrabold text-[11px] tracking-wide uppercase border border-amber-300 shadow-2xs">
                          👑 HOD Override Enabled
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 flex items-center gap-1 shadow-2xs">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked for Regular Faculty</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading / Empty / Table State */}
                {loadingRoster ? (
                  <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gec-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading approved institutional students...</span>
                  </div>
                ) : roster.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 border-t border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {dbStudents.length === 0 
                        ? 'No Registered Students in Database Yet' 
                        : `No Students Found in ${BRANCHES[selectedBranch]?.name || selectedBranch} • ${selectedSemester}`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      {dbStudents.length === 0 
                        ? 'All previous mock and pre-feeded students have been successfully purged. Only newly registered engineering students will appear here once approved by Administration or HOD.'
                        : `There are currently ${dbStudents.length} approved students in the database enrolled in other branches or semesters. Use the Department or Semester selector above to switch.`
                      }
                    </p>
                    {setCurrentTab && (
                      <div className="pt-2">
                        <button
                          onClick={() => setCurrentTab('approval-desk')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 transition-all cursor-pointer shadow-xs"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-300" />
                          <span>Check Registration Approval Queue</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Roll No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3 text-center">Classes Attended</th>
                          <th className="p-3 text-center">Attendance %</th>
                          <th className="p-3 text-center">Exam Eligibility (AICTE 75%)</th>
                          <th className="p-3 text-center">Today's Roll Call</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {roster.map((student) => {
                          const isFocusStudent = student.isCurrentStudent;
                          const isEligible = student.attendancePct >= 75;
                          const isBorderline = student.attendancePct >= 65 && student.attendancePct < 75;

                          return (
                            <tr 
                              key={student.roll} 
                              className={`transition-colors ${
                                isFocusStudent 
                                  ? 'bg-sky-50/60 font-medium hover:bg-sky-50' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="p-3 font-mono font-bold text-gec-blue">
                                {student.roll}
                                {isFocusStudent && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-gec-blue text-white">
                                    PORTAL USER
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-bold text-slate-900">
                                {student.name}
                              </td>
                              <td className="p-3 text-center font-mono text-slate-600 font-semibold">
                                {student.attendedClasses || 0} / {student.totalClasses || 0} classes
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                                  student.attendancePct >= 75 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : student.attendancePct >= 65
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {student.attendancePct}%
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {isEligible ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Eligible for JUT Exam</span>
                                  </span>
                                ) : isBorderline ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                    <span>Medical / Condonation Req</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    <span>Critical / Shortage (Detained)</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {student.markedToday && !isHodOrAdmin ? (
                                  <div 
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 cursor-not-allowed shadow-2xs" 
                                    title="Attendance marked today and locked. HOD authorization required to modify."
                                  >
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                    <span className={student.presentToday ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                                      {student.presentToday ? 'Present' : 'Absent'}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-normal">(Locked)</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(student.roll)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                                      student.markedToday && isHodOrAdmin
                                        ? (student.presentToday 
                                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-amber-400 ring-2 ring-amber-200' 
                                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-amber-400 ring-2 ring-amber-200')
                                        : (student.presentToday
                                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300')
                                    }`}
                                    title={student.markedToday && isHodOrAdmin ? "HOD Override Active: Click to modify recorded attendance" : "Toggle Present/Absent"}
                                  >
                                    {student.markedToday && isHodOrAdmin && (
                                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                    {student.presentToday ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Present</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3.5 h-3.5" />
                                        <span>Absent</span>
                                      </>
                                    )}
                                    {student.markedToday && isHodOrAdmin && (
                                      <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-black">HOD</span>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    AICTE / JUT 75% Rule: Students maintaining ≥75% attendance are eligible for semester end examinations. Roll call is recorded once daily.
                  </span>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    Save & Record Session Attendance
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 2: INTERNAL EVALUATION & MARKS (CIE) */}
            {activeSection === 'marks' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Header */}
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm md:text-base font-black text-gec-navy">
                        {selectedClass} • Continuous Internal Assessment (CIE) & Sessional Ledger
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter Mid-Term Exam (30), Assignment & Lab (10), and Sessional Performance (10). Minimum 20/50 required to qualify without backlog.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveGrades}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Publish Marks</span>
                  </button>
                </div>

                {/* JUT Evaluation Scheme Guidance Banner */}
                <div className="p-3.5 m-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-black text-xs">JUT Internal Assessment Blueprint:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-white font-bold border border-indigo-200 text-indigo-900 shadow-2xs">
                      Mid-Term: Max 30
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white font-bold border border-indigo-200 text-indigo-900 shadow-2xs">
                      Assignment: Max 10
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white font-bold border border-indigo-200 text-indigo-900 shadow-2xs">
                      Sessional: Max 10
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 font-extrabold text-white shadow-2xs">
                      Total: 50 Marks (Pass: ≥20)
                    </span>
                  </div>
                </div>

                {/* Loading / Empty / Table State */}
                {loadingRoster ? (
                  <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gec-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading approved institutional students...</span>
                  </div>
                ) : roster.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 border-t border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {dbStudents.length === 0 
                        ? 'No Registered Students in Database Yet' 
                        : `No Students Found in ${BRANCHES[selectedBranch]?.name || selectedBranch} • ${selectedSemester}`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      {dbStudents.length === 0 
                        ? 'All previous mock and pre-feeded students have been successfully purged. Only newly registered engineering students will appear here once approved by Administration or HOD.'
                        : `There are currently ${dbStudents.length} approved students in the database enrolled in other branches or semesters. Use the Department or Semester selector above to switch.`
                      }
                    </p>
                    {setCurrentTab && (
                      <div className="pt-2">
                        <button
                          onClick={() => setCurrentTab('approval-desk')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 transition-all cursor-pointer shadow-xs"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-300" />
                          <span>Check Registration Approval Queue</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Roll No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3 text-center">Mid-Term (30)</th>
                          <th className="p-3 text-center">Assign (10)</th>
                          <th className="p-3 text-center">Sess (10)</th>
                          <th className="p-3 text-center">Total (/50)</th>
                          <th className="p-3 text-center">JUT Grade</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-center">Semester Progression</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {roster.map((student) => {
                          const isFocusStudent = student.isCurrentStudent;
                          const nextSem = getNextSemester(student.semester);
                          const evaluation = calculateSubjectGrade({
                            midTerm: student.midTermMarks,
                            assignment: student.assignmentMarks,
                            sessional: student.sessionalMarks
                          });

                          return (
                            <tr 
                              key={student.roll} 
                              className={`transition-colors ${
                                isFocusStudent 
                                  ? 'bg-sky-50/60 font-medium hover:bg-sky-50' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="p-3 font-mono font-bold text-gec-blue">
                                {student.roll}
                                {isFocusStudent && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-gec-blue text-white">
                                    PORTAL USER
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-bold text-slate-900">
                                {student.name}
                              </td>
                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={student.midTermMarks}
                                  onChange={(e) => handleMarksChange(student.roll, 'midTermMarks', e.target.value)}
                                  className="w-14 text-center py-1 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-2xs"
                                  title="Mid-term exam marks out of 30"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={student.assignmentMarks}
                                  onChange={(e) => handleMarksChange(student.roll, 'assignmentMarks', e.target.value)}
                                  className="w-12 text-center py-1 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-2xs"
                                  title="Assignment & lab report marks out of 10"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={student.sessionalMarks}
                                  onChange={(e) => handleMarksChange(student.roll, 'sessionalMarks', e.target.value)}
                                  className="w-12 text-center py-1 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-2xs"
                                  title="Class performance & quiz marks out of 10"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-baseline gap-0.5">
                                  <span className="font-mono font-black text-sm text-gec-navy">
                                    {evaluation.total}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-normal">/50</span>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-md font-black text-[11px] border ${getGradeBadge(evaluation.grade)}`}>
                                  {evaluation.grade} {evaluation.isAssessed ? `(${evaluation.gradePoints} GP)` : ''}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {!evaluation.isAssessed ? (
                                  <span className="text-[10px] text-slate-400 font-bold">Unassessed</span>
                                ) : evaluation.grade === 'F' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                    Backlog
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                    Passed
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    {student.semester}
                                  </span>
                                  {nextSem && nextSem !== 'Graduated' && (
                                    <button
                                      type="button"
                                      onClick={() => handlePromoteStudentByFaculty(student)}
                                      className="text-[10px] px-2 py-0.5 rounded-lg bg-sky-50 text-gec-blue hover:bg-sky-100 border border-sky-200 font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                      title={`Promote student to ${nextSem}`}
                                    >
                                      <span>Advance to {nextSem}</span>
                                      <ChevronRight className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Jharkhand University of Technology (JUT): Continuous Internal Evaluation (CIE) records determine final SGPA calculation and semester progression eligibility.
                  </span>
                  <button
                    onClick={handleSaveGrades}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    Publish Internal Assessment Marks
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Teacher Class Notice & Broadcast Dispatcher (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gec-navy">Broadcast Class Notice</h3>
                  <p className="text-[11px] text-slate-500">
                    Dispatches real-time announcement to students
                  </p>
                </div>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-3 mt-4">
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Notice Title:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Viva Schedule & Assignment 2 Deadline"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gec-blue bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Subject Tag:
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-gec-blue"
                    >
                      {assignedClasses.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.name.slice(0, 14)}...)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Notice Category:
                    </label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-gec-blue"
                    >
                      <option value="info">📌 General Info</option>
                      <option value="alert">⚠️ Urgent Notice</option>
                      <option value="assignment">📝 Assignment Due</option>
                      <option value="exam">🧪 Lab / Test Schedule</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Message Body:
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide details about upcoming lecture, laboratory practical record submissions, syllabus covered, or room change..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gec-blue focus:border-transparent resize-none bg-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={postingBroadcast || !broadcastTitle.trim() || !announcementText.trim()}
                  className="w-full py-2.5 bg-gec-blue hover:bg-sky-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingBroadcast ? 'Broadcasting Notice...' : 'Publish Notice to Students'}</span>
                </button>
              </form>
            </div>

            {/* Live Database Broadcasts History */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-gec-orange" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Live Broadcast Feed ({recentBroadcasts.length})
                  </h4>
                </div>
                <button
                  onClick={loadBroadcasts}
                  className="text-[10px] text-gec-blue hover:underline font-bold"
                >
                  Refresh
                </button>
              </div>

              {recentBroadcasts.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No broadcasts dispatched yet. Create an announcement above to notify students.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {recentBroadcasts.map((b) => (
                    <div 
                      key={b.id} 
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-[11px] truncate">
                          {b.title}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                          b.type === 'alert' 
                            ? 'bg-rose-100 text-rose-700' 
                            : b.type === 'assignment' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-sky-100 text-gec-blue'
                        }`}>
                          {b.subjectCode || 'Notice'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                        {b.message}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                        <span>By {b.teacherName}</span>
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AICTE Quality Assurance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-gec-orange">
                <AlertCircle className="w-4 h-4" />
                <span>AICTE Academic Mandate</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Faculty members must complete continuous internal evaluation (CIE) within 10 days of mid-term test conclusion as mandated by JUT Ranchi.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
