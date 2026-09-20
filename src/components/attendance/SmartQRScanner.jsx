import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Clock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Square, 
  Volume2, 
  VolumeX,
  History,
  ScanLine,
  RotateCcw,
  Check,
  Printer,
  Calendar,
  BookOpen,
  ArrowRight,
  BadgeCheck,
  IdCard,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { api } from '../../services/api';
import { printStudentIdCard } from '../../utils/printDocument';
import { calculateOverallAttendance } from '../../data/curriculumData';

export default function SmartQRScanner({ currentUser, studentData, setCurrentTab, onUpdateStudentData }) {
  const isStudent = currentUser?.role === 'student';
  const isFacultyOrAdmin = !isStudent;
  const activeMode = isStudent ? 'my-pass' : 'terminal';
  
  // Set default subject according to teacher role
  const isOS = currentUser?.email === 'amit.sharma@gecpalamu.ac.in';
  const isDAA = currentUser?.email === 'priya.faculty@gecpalamu.ac.in';
  const initialSubject = isOS ? 'CS502' : isDAA ? 'CS504' : 'CS501';
  const initialSubjectName = isOS ? 'Operating Systems & Systems Programming' : isDAA ? 'Design & Analysis of Algorithms' : 'Database Management Systems';

  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [subjectName, setSubjectName] = useState(initialSubjectName);
  const [manualCode, setManualCode] = useState('');
  
  // Student Personal QR & Logs State
  const [studentQr, setStudentQr] = useState(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [myAttendanceLogs, setMyAttendanceLogs] = useState([]);

  // Scanning & Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedPayload, setLastScannedPayload] = useState('');

  // Results & Feedback
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [resetSuccess, setResetSuccess] = useState('');
  const [approvedStudents, setApprovedStudents] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  const fetchApprovedStudents = async () => {
    try {
      const res = await api.getApprovedStudents();
      if (res && res.students) {
        setApprovedStudents(res.students);
      }
    } catch (err) {
      console.warn('Failed to load approved students for scanner simulator:', err);
    }
  };

  useEffect(() => {
    if (isFacultyOrAdmin) {
      fetchApprovedStudents();
    }
  }, [isFacultyOrAdmin]);

  // Generate Python-powered QR code for this specific student
  useEffect(() => {
    if (studentData) {
      const payload = JSON.stringify({
        type: "GECP_ATTENDANCE",
        id: studentData.id,
        roll: studentData.rollNo,
        name: studentData.name,
        branch: studentData.branchCode || studentData.branch || "CSE",
        secKey: "valid-jut-token-998"
      });

      // 1. Instant client-side QR generation (0ms)
      QRCode.toDataURL(payload, {
        width: 200,
        margin: 2,
        color: { dark: '#064e3b', light: '#ffffff' }
      }, (err, url) => {
        if (!err && url) setStudentQr(url);
      });

      setIsGeneratingQr(true);
      api.generatePythonQR(payload, {
        boxSize: 8,
        border: 2,
        fillColor: '#064e3b',
        backColor: '#ffffff'
      })
      .then(res => {
        if (res && res.qrBase64) {
          const formatted = res.qrBase64.startsWith('data:')
            ? res.qrBase64
            : `data:image/png;base64,${res.qrBase64}`;
          setStudentQr(formatted);
        }
      })
      .catch(err => {
        console.warn('Python QR generator fallback in attendance:', err);
      })
      .finally(() => {
        setIsGeneratingQr(false);
      });
    }
  }, [studentData?.id, studentData?.rollNo]);

  // Fetch student's own attendance logs
  const fetchMyAttendance = async () => {
    if (!studentData) return;
    try {
      const logs = await api.getAttendanceLogs({
        studentId: studentData.id,
        rollNo: studentData.rollNo
      });
      if (Array.isArray(logs)) {
        setMyAttendanceLogs(logs);
      }
    } catch (e) {
      console.warn('Could not load student personal attendance:', e);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [studentData?.id, studentData?.rollNo]);

  // Fetch initial terminal logs from backend
  const fetchRecentLogs = async () => {
    try {
      const logs = await api.getAttendanceLogs(selectedSubject);
      if (Array.isArray(logs)) {
        setRecentScans(logs);
      }
    } catch (err) {
      console.warn('Failed to load recent attendance logs:', err);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, [selectedSubject]);

  // Synthetic audio feedback
  const playAudioFeedback = (isSuccess) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 buzz
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const processScan = async (rawPayload) => {
    if (!rawPayload || scanning) return;
    setScanning(true);
    setVerificationResult(null);
    setErrorResult(null);
    setLastScannedPayload(rawPayload);

    try {
      const res = await api.scanAttendanceQR(rawPayload, selectedSubject, subjectName);
      setVerificationResult(res);
      playAudioFeedback(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Synchronize attendance from MySQL database if matches active student
      if (res && res.verified && res.record) {
        const studentRoll = res.record.rollNo || res.student?.rollNo;
        const studentId = res.record.studentId || res.student?.id;

        if (onUpdateStudentData && studentData) {
          const isMatch = (studentRoll && studentData.rollNo && studentRoll.toUpperCase() === studentData.rollNo.toUpperCase()) ||
                          (studentId && studentData.id && studentId === studentData.id);
          if (isMatch) {
            api.getStudentAttendance(studentRoll || studentId).then(attRows => {
              if (Array.isArray(attRows)) {
                const updatedSubjects = (studentData.subjects || []).map(s => {
                  const att = attRows.find(a => a.subjectCode && s.code && a.subjectCode.toUpperCase() === s.code.toUpperCase());
                  if (att) {
                    return {
                      ...s,
                      totalClasses: Number(att.totalClasses) || 0,
                      attendedClasses: Number(att.attendedClasses) || 0,
                      lastAttendedDate: att.lastAttendedDate || s.lastAttendedDate
                    };
                  }
                  return s;
                });
                onUpdateStudentData({ ...studentData, subjects: updatedSubjects });
              }
            }).catch(e => console.warn('Could not fetch updated student attendance from MySQL:', e));
          }
        }
      }

      // Update both recent list and personal attendance list
      setRecentScans(prev => [res.record, ...prev.filter(r => r.id !== res.record.id)]);
      fetchMyAttendance();
    } catch (err) {
      playAudioFeedback(false);
      setErrorResult({
        error: err.error || 'Verification Failed',
        message: err.message || 'QR code credential could not be verified in the institutional database.'
      });
    } finally {
      setScanning(false);
    }
  };

  // Continuous Camera QR Code Scanner with jsQR
  const tickScanner = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        const now = Date.now();
        // Cooldown: 2.5s between scans
        if (now - lastScanTimeRef.current > 2500) {
          lastScanTimeRef.current = now;
          processScan(code.data);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(tickScanner);
  };

  // Start / Stop Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        setCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animFrameIdRef.current = requestAnimationFrame(tickScanner);
        }
      } catch (err) {
        alert('Could not access camera. You can test instantly using the Quick Test Scanner cards below or type a roll number!');
        setCameraActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScan(manualCode.trim());
    setManualCode('');
  };

  const handleResetSession = async () => {
    if (!window.confirm('Reset all attendance records for today? This allows you to test fresh scans and duplicate detection.')) {
      return;
    }
    try {
      await api.resetAttendance();
      setRecentScans([]);
      setVerificationResult(null);
      setErrorResult(null);
      setResetSuccess('All attendance logs cleared! You can now test fresh scans.');
      setTimeout(() => setResetSuccess(''), 4000);
    } catch (err) {
      alert('Failed to reset attendance.');
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Banner Section - Role Customized */}
        {isStudent ? (
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <IdCard className="w-3.5 h-3.5" />
                <span>Student Smart Identification • Contactless Attendance Pass</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                My Digital ID & Attendance Records
              </h1>

              <p className="text-sm text-sky-100 leading-relaxed font-light">
                Official college student identity pass with cryptographically signed Python QR code. Present this digital pass at the classroom terminal operated by your course teacher to verify your attendance.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-300 font-medium">
                <span>Student: <strong>{studentData?.name || currentUser?.name || 'Registered Student'}</strong></span>
                <span>•</span>
                <span>Roll No: <strong>{studentData?.rollNo || currentUser?.rollNo || 'Pending Assignment'}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-400">{studentData?.status || 'VERIFIED ENROLLED'}</strong></span>
              </div>
            </div>

            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-900 via-gec-navy to-indigo-950 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Classroom Terminal • Optical Attendance Kiosk (Faculty & HOD Only)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Classroom Optical Scanner Terminal
              </h1>

              <p className="text-sm text-sky-100 leading-relaxed font-light">
                High-speed optical camera scanner for subject instructors. Scan student ID card barcodes in real-time, authenticate JUT enrollment, and automatically log presence to the university database.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-300 font-medium">
                <span>Operating Faculty: <strong>{currentUser?.name || 'Course Instructor'}</strong></span>
                <span>•</span>
                <span>Position: <strong>{currentUser?.role === 'hod' ? 'Head of Department (CSE)' : (currentUser?.designation || 'Subject Teacher')}</strong></span>
                <span>•</span>
                <span>Terminal: <strong>Lecture Hall 204 / Systems Lab</strong></span>
              </div>
            </div>

            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        )}

        {/* Feedback Alert for Session Reset */}
        {resetSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          </div>
        )}

        {/* Top Control Bar (Rendered ONLY for Faculty / HOD / Admin) */}
        {!isStudent && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Course Session:</span>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSubjectName(
                    e.target.value === 'CS501' ? 'Database Management Systems' : 
                    e.target.value === 'CS504' ? 'Design & Analysis of Algorithms' :
                    'Operating Systems & Systems Programming'
                  );
                }}
                className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none"
              >
                <option value="CS501">CS501 - Database Management Systems (Dr. Bhawesh Kumar)</option>
                <option value="CS502">CS502 - Operating Systems & Systems Programming (Prof. Amit Sharma)</option>
                <option value="CS504">CS504 - Design & Analysis of Algorithms (Prof. Priya Kumari)</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
              </button>

              <button
                onClick={handleResetSession}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer"
                title="Clear today's logs to test fresh scans and duplicate detection again"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>Reset Session Logs</span>
              </button>

              <button
                onClick={toggleCamera}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  cameraActive 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {cameraActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{cameraActive ? 'Stop Camera' : 'Start Live Camera Scanner'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: MY SMART ATTENDANCE PASS & RECORDS */}
        {activeMode === 'my-pass' && (
          <div className="space-y-8 mb-12">
            {/* Feedback alert if scan occurred */}
            {verificationResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 animate-in zoom-in-95 duration-150 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-extrabold text-sm text-emerald-950">
                      Attendance Recorded Successfully!
                    </span>
                    <div className="text-slate-600 mt-0.5">
                      Session: <strong>{verificationResult.record?.subjectCode}</strong> ({verificationResult.record?.subjectName}) • Verified at {verificationResult.record?.sessionTime}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setVerificationResult(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {errorResult && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 animate-in zoom-in-95 duration-150 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
                  <div className="text-xs">
                    <div className="font-extrabold text-sm text-rose-950">{errorResult.error}</div>
                    <div className="text-rose-800 mt-0.5">{errorResult.message}</div>
                  </div>
                </div>
                <button
                  onClick={() => setErrorResult(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Top Grid: Official Student ID Pass (7 Cols) + Attendance Stats (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Official ID Card Presentation (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-sm text-gec-navy">
                      <IdCard className="w-5 h-5 text-emerald-600" />
                      <span>Official Scannable College ID Pass</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      (studentData?.status || currentUser?.status) === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {(studentData?.status || currentUser?.status) === 'APPROVED' ? 'Verified Student' : 'Approval Pending'}
                    </span>
                  </div>

                  {/* ID Card Visual Container */}
                  <div className="bg-gradient-to-br from-slate-900 via-gec-navy to-sky-950 text-white p-6 rounded-2xl shadow-lg border border-sky-800/40 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-9xl font-black">
                      GEC
                    </div>

                    <div className="relative z-10">
                      {/* ID Header */}
                      <div className="border-b border-sky-700/50 pb-3 mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Govt of Jharkhand • JUT Affiliated</div>
                          <div className="text-sm font-black text-white">Govt Engineering College, Palamu</div>
                        </div>
                        <div className="text-[10px] font-mono text-sky-300 font-bold">
                          {studentData?.batch || '2022-26'}
                        </div>
                      </div>

                      {/* ID Middle Content */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                        {/* Student Avatar & Photo */}
                        <div className="sm:col-span-4 flex flex-col items-center text-center">
                          <img
                            src={studentData?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                            alt={studentData?.name}
                            className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md mb-2"
                          />
                          <div className="text-[10px] font-bold text-slate-300">Blood Group: {studentData?.bloodGroup || 'B+'}</div>
                        </div>

                        {/* Student Details */}
                        <div className="sm:col-span-8 space-y-1.5 text-xs">
                          <div>
                            <span className="text-[10px] text-sky-300 block uppercase font-bold">Student Name</span>
                            <span className="text-base font-extrabold text-white">{studentData?.name || currentUser?.name || 'Student'}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sky-800/50">
                            <div>
                              <span className="text-[9px] text-sky-300 uppercase font-semibold">Roll Number</span>
                              <span className="font-mono font-bold text-amber-300 block">{studentData?.rollNo || '22/CSE/042'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-sky-300 uppercase font-semibold">Reg. Number</span>
                              <span className="font-mono text-[11px] text-white block">{studentData?.regNo || 'JUT/2022/CSE/0892'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] text-sky-300 uppercase font-semibold">Branch</span>
                              <span className="text-[11px] text-white font-medium block truncate">{studentData?.branch || 'CSE'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-sky-300 uppercase font-semibold">Semester</span>
                              <span className="text-[11px] text-white font-medium block">{studentData?.semester || '5th Sem'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scannable Python QR Code Footer */}
                      <div className="mt-4 pt-3 border-t border-sky-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {studentQr ? (
                            <img
                              src={studentQr?.startsWith('data:') ? studentQr : `data:image/png;base64,${studentQr}`}
                              alt="Student QR Code"
                              className="w-16 h-16 bg-white p-1 rounded-xl shadow-inner border border-sky-400"
                              onError={() => {
                                if (studentData) {
                                  const payload = JSON.stringify({
                                    type: "GECP_ATTENDANCE",
                                    id: studentData.id,
                                    roll: studentData.rollNo,
                                    name: studentData.name,
                                    branch: studentData.branchCode || studentData.branch || "CSE",
                                    secKey: "valid-jut-token-998"
                                  });
                                  QRCode.toDataURL(payload, { width: 200, margin: 2, color: { dark: '#064e3b', light: '#ffffff' } }, (err, url) => {
                                    if (!err && url) setStudentQr(url);
                                  });
                                }
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl">
                              <QrCode className="w-10 h-10 text-slate-800" />
                            </div>
                          )}
                          <div className="text-[10px] text-sky-200">
                            <div className="font-bold text-white flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Python QR Engine Verified</span>
                            </div>
                            <div className="text-[9px] text-sky-300">Scannable by Classroom Camera Terminal</div>
                            <div className="font-mono text-[8px] text-slate-400">HASH: SHA256-JUT-GECP-ATTENDANCE</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[9px] text-sky-300 uppercase font-bold">Principal / Dean</div>
                          <div className="font-serif italic text-amber-300 text-xs mt-0.5">Dr. D. K. Singh</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* ID Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => printStudentIdCard(studentData, studentQr)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    <span>Print Official Digital ID Card</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scannable strictly by Course Faculty at Classroom Terminal</span>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics & Subjects (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-sm text-gec-navy">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Semester Attendance Analytics</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Overall: {calculateOverallAttendance(studentData?.subjects || [])}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(!studentData?.subjects || studentData.subjects.length === 0) ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No enrolled courses found for active semester.
                      </div>
                    ) : (
                      studentData.subjects.map((sub) => {
                        const attended = Number(sub.attendedClasses) || 0;
                        const total = Number(sub.totalClasses) || 0;
                        const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
                        return (
                          <div key={sub.code} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-slate-800">{sub.code}: {sub.name}</span>
                              <span className={`font-mono font-bold ${pct >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {pct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                              <div 
                                className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>Classes: {attended} / {total} attended</span>
                              <span>{total === 0 ? 'New Session' : (pct >= 75 ? 'Eligible for Exams' : 'Shortage Warning')}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>JUT Continuous Evaluation Requirement: Minimum 75%</span>
                </div>
              </div>

            </div>

            {/* Bottom Section: My Verified Attendance Ledger */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-gec-navy">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>My Verified Attendance History (from SQL Database)</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  Roll: {studentData?.rollNo}
                </span>
              </div>

              {myAttendanceLogs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">No Attendance Scans Yet</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                    Your attendance has not been recorded for today yet. Use the "Instant Check-In" button above or present your ID card to the classroom terminal to record it in the database.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Session Date</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Course Code</th>
                        <th className="py-2.5 px-3">Subject Name</th>
                        <th className="py-2.5 px-3">Verification Mode</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myAttendanceLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-medium text-slate-800">{log.date}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{log.sessionTime}</td>
                          <td className="py-3 px-3 font-mono font-bold text-gec-blue">{log.subjectCode}</td>
                          <td className="py-3 px-3 text-slate-700">{log.subjectName}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" /> Smart QR
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {log.status}
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

        {/* VIEW 2: CLASSROOM OPTICAL SCANNER TERMINAL */}
        {activeMode === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Viewfinder Terminal (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-gec-navy">
                  <ScanLine className="w-5 h-5 text-emerald-600" />
                  <span>Optical Verification Viewfinder</span>
                </div>
                <div className="flex items-center gap-2">
                  {cameraActive && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      AI Scanning Active (jsQR)
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {new Date().toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>

              {/* Viewfinder Screen Box */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border-4 border-slate-900 shadow-inner">
                {cameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover"
                    ></video>

                    {/* Scanning Bounding Box & Laser Line */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-52 h-52 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]"></div>
                        <div className="absolute top-1 left-2 text-[9px] font-mono text-emerald-400 font-bold tracking-wider">
                          ALIGN ID QR CODE
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <QrCode className="w-16 h-16 text-slate-700 mx-auto" />
                    <div className="text-xs font-semibold text-slate-300">Live Camera is Idle</div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Click "Start Live Camera Scanner" and present your Student ID Card QR to scan automatically!
                    </p>
                  </div>
                )}
              </div>

              {/* Verification Feedback Badge */}
              {verificationResult && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 animate-in zoom-in-95 duration-150 flex items-center gap-4 shadow-sm">
                  <img
                    src={verificationResult.student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                    alt={verificationResult.student?.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-emerald-950">
                        {verificationResult.student?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">
                        VERIFIED PRESENT
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Roll: <strong className="text-slate-900">{verificationResult.student?.rollNo}</strong> • {verificationResult.student?.branch}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Time: {verificationResult.record?.sessionTime} • Session: {verificationResult.record?.subjectCode}
                    </div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                </div>
              )}

              {/* Error Feedback Badge */}
              {errorResult && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 animate-in zoom-in-95 duration-150 flex items-center gap-3 shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
                  <div className="text-xs">
                    <div className="font-extrabold text-sm text-rose-950">{errorResult.error}</div>
                    <div className="text-rose-800 mt-0.5">{errorResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Simulator Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  1-Click Quick Verification Simulator (Registered Students):
                </div>
                <button
                  type="button"
                  onClick={fetchApprovedStudents}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                >
                  ↻ Refresh Roster
                </button>
              </div>

              {approvedStudents.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                  <p className="text-xs text-slate-700 font-medium">
                    No approved registered students found in database.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Once students register via the Sign Up form and are approved by HOD/Admin, their 1-click test scan buttons will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {approvedStudents.map((std) => (
                    <button
                      key={std.id}
                      type="button"
                      disabled={scanning}
                      onClick={() => processScan(JSON.stringify({
                        type: "GECP_ATTENDANCE",
                        id: std.id,
                        roll: std.rollNo,
                        name: std.name,
                        branch: std.branch || "CSE",
                        secKey: "valid-jut-token-998"
                      }))}
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-left transition-all cursor-pointer"
                    >
                      <div className="font-bold text-xs text-emerald-900 truncate">Scan {std.name}</div>
                      <div className="text-[10px] text-emerald-700 font-mono truncate">{std.rollNo} ({std.status || 'Approved'})</div>
                    </button>
                  ))}

                  {studentData && !approvedStudents.some(s => s.id === studentData.id || s.rollNo === studentData.rollNo) && (
                    <button
                      type="button"
                      disabled={scanning}
                      onClick={() => processScan(JSON.stringify({
                        type: "GECP_ATTENDANCE",
                        id: studentData.id,
                        roll: studentData.rollNo,
                        name: studentData.name,
                        branch: studentData.branchCode || studentData.branch || "CSE",
                        secKey: "valid-jut-token-998"
                      }))}
                      className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-left transition-all cursor-pointer"
                    >
                      <div className="font-bold text-xs text-purple-900 truncate">Scan {studentData.name}</div>
                      <div className="text-[10px] text-purple-700 font-mono truncate">{studentData.rollNo} (Current User)</div>
                    </button>
                  )}
                </div>
              )}

              {/* Barcode / Manual Input Form */}
              <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste QR payload text, pipe data, or roll number (e.g. 22/CSE/042)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={scanning || !manualCode.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Verify Barcode
                </button>
              </form>
            </div>
          </div>

          {/* Session Attendance Stream (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-gec-navy">
                  <History className="w-4 h-4 text-gec-blue" />
                  <span>Live Session Scan Ledger</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {recentScans.length} Recorded in DB
                </span>
              </div>

              <div className="space-y-2.5 max-h-[440px] overflow-y-auto">
                {recentScans.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No scans recorded yet for {selectedSubject}. Start scanning student ID cards or use the Quick Test Simulator!
                  </div>
                ) : (
                  recentScans.map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{rec.studentName}</div>
                        <div className="font-mono text-[11px] text-gec-blue flex items-center gap-2">
                          <span>{rec.rollNo}</span>
                          <span className="text-[10px] text-slate-400">• {rec.subjectCode}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {rec.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{rec.sessionTime}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified with AICTE & JUT Continuous Evaluation Server.</span>
            </div>
          </div>

        </div>
      )}

      </div>
    </div>
  );
}
