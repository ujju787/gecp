import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  Phone,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, setAuthToken, setStoredAuthUser } from '../../services/api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'registered_success'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRollNo, setRegRollNo] = useState('');
  const [regRegNo, setRegRegNo] = useState('');
  const [regBranch, setRegBranch] = useState('Computer Science & Engineering');
  const [regSemester, setRegSemester] = useState('1st Semester');
  const [registeredStudent, setRegisteredStudent] = useState(null);

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingNotice, setPendingNotice] = useState('');
  const [approvedStudents, setApprovedStudents] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      api.getApprovedStudents().then(res => {
        if (res && res.students) {
          setApprovedStudents(res.students);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const fillQuickCredentials = (email, pass) => {
    setMode('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg('');
    setPendingNotice('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setPendingNotice('');
    setLoading(true);

    try {
      const data = await api.login(loginEmail, loginPassword);
      setAuthToken(data.token);
      setStoredAuthUser(data.user);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });

      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      if (err.status === 'PENDING') {
        setPendingNotice(err.message || 'Your account is awaiting administrative approval.');
      } else {
        setErrorMsg(err.error || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setPendingNotice('');
    setLoading(true);

    try {
      const data = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        rollNo: regRollNo.trim(),
        regNo: regRegNo.trim(),
        branch: regBranch,
        semester: regSemester
      });

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });

      setRegisteredStudent(data.user);
      setMode('registered_success');
    } catch (err) {
      setErrorMsg(err.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Fixed Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-gec-navy via-gec-blue to-sky-900 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-sky-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Official Institutional Single Sign-On</span>
          </div>

          <h3 className="text-xl font-black text-white">
            {mode === 'login' && 'GEC Palamu Access Portal'}
            {mode === 'register' && 'New Student Registration'}
            {mode === 'registered_success' && 'Registration Received!'}
          </h3>
          <p className="text-xs text-sky-200 mt-1">
            {mode === 'login' && 'Enter verified university credentials to access student/faculty services.'}
            {mode === 'register' && 'Fill your official enrollment profile for academic council verification.'}
            {mode === 'registered_success' && 'Your profile is awaiting 1-click verification by the Academic Council.'}
          </p>

          {/* Tab Switcher */}
          {mode !== 'registered_success' && (
            <div className="flex bg-slate-900/60 p-1 rounded-xl mt-3 max-w-xs">
              <button
                onClick={() => { setMode('login'); setErrorMsg(''); setPendingNotice(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-white text-gec-blue shadow-sm' : 'text-sky-200 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setErrorMsg(''); setPendingNotice(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register' ? 'bg-white text-gec-blue shadow-sm' : 'text-sky-200 hover:text-white'
                }`}
              >
                Register Student
              </button>
            </div>
          )}
        </div>

        {/* Quick Demo Credentials Bar (Fixed) */}
        <div className="bg-slate-100 p-2.5 sm:p-3 border-b border-slate-200 text-xs text-slate-700 shrink-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Quick 1-Click Demo Accounts:</span>
            <span className="text-[9px] text-slate-400 font-normal">Click to auto-fill</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@gecpalamu.ac.in', 'Admin@123')}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[11px] font-bold text-purple-900 rounded-md border border-purple-200 shadow-2xs"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('dr.bhawesh@gecpalamu.ac.in', 'Faculty@123')}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[11px] font-bold text-indigo-900 rounded-md border border-indigo-200 shadow-2xs"
              title="Dr. Bhawesh Kumar - HOD Computer Science & Engineering"
            >
              👨‍🏫 CSE HOD
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('dr.vineet@gecpalamu.ac.in', 'Faculty@123')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[11px] font-bold text-amber-900 rounded-md border border-amber-200 shadow-2xs"
              title="Dr. Vineet Shekhar - HOD Electrical Engineering"
            >
              ⚡ EE HOD
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('dr.shivam@gecpalamu.ac.in', 'Faculty@123')}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-900 rounded-md border border-rose-200 shadow-2xs"
              title="Dr. Shivam Verma - HOD Mechanical Engineering"
            >
              ⚙️ ME HOD
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('dr.manish@gecpalamu.ac.in', 'Faculty@123')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-900 rounded-md border border-emerald-200 shadow-2xs"
              title="Dr. Manish Ranjan - HOD Civil Engineering"
            >
              🏗️ CE HOD
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('amit.sharma@gecpalamu.ac.in', 'Faculty@123')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[11px] font-bold text-amber-900 rounded-md border border-amber-200 shadow-2xs"
            >
              👨‍🏫 Teacher (OS)
            </button>
            {approvedStudents.length > 0 ? (
              <button
                type="button"
                onClick={() => fillQuickCredentials(approvedStudents[0].email, 'Student@123')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 rounded-md border border-emerald-300 shadow-2xs"
                title={`Auto-fill registered student: ${approvedStudents[0].name} (${approvedStudents[0].rollNo})`}
              >
                🎓 {approvedStudents[0].name.split(' ')[0]} ({approvedStudents[0].rollNo})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setPendingNotice('');
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 rounded-md border border-emerald-300 shadow-2xs cursor-pointer"
                title="No mock students. Click to register a brand new student account!"
              >
                📝 Register New Student
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {pendingNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 shadow-2xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Awaiting Administrative Approval</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">{pendingNotice}</p>
              
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                <span className="text-[10px] text-amber-900 font-semibold">Want to test approval right now?</span>
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('admin@gecpalamu.ac.in', 'Admin@123')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                >
                  Login as Admin & Approve
                </button>
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Institutional Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@gecpalamu.ac.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gec-blue focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gec-blue focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gec-blue hover:bg-sky-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Verify Credentials & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Clean 2-Column Responsive Grid) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gec-blue focus:outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">University Roll No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23/CSE/055"
                    value={regRollNo}
                    onChange={(e) => setRegRollNo(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">JUT Registration No</label>
                  <input
                    type="text"
                    placeholder="e.g. JUT/2023/1089"
                    value={regRegNo}
                    onChange={(e) => setRegRegNo(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Branch</label>
                  <select
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="Electrical Engineering">Electrical</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium"
                  >
                    <option value="1st Semester">1st Sem</option>
                    <option value="3rd Semester">3rd Sem</option>
                    <option value="5th Semester">5th Sem</option>
                    <option value="7th Semester">7th Sem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Student Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. amit.cse23@gecpalamu.ac.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Create Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Registrations are sent to the <strong>Admin Approval Desk</strong>. Account unlocks immediately once approved by the Academic Council.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit Registration for Approval</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. POST-REGISTRATION SUCCESS & DEMO APPROVAL SCREEN */}
          {mode === 'registered_success' && registeredStudent && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Registration Submitted Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your profile has been saved to the GEC Palamu institutional database.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{registeredStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">University Roll No:</span>
                  <span className="font-mono font-bold text-gec-blue">{registeredStudent.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Branch & Sem:</span>
                  <span className="font-semibold text-slate-800">{registeredStudent.branch} ({registeredStudent.semester})</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> PENDING ADMIN APPROVAL
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
                <div className="font-bold text-[11px] text-amber-950">⚡ Test the Admin Approval Flow:</div>
                <p className="text-[11px] text-amber-800">
                  Click below to switch to the <strong>Admin Account</strong>. You can then open the <strong>Approval Desk</strong> tab to approve <strong>{registeredStudent.name}</strong> with 1 click!
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickCredentials('admin@gecpalamu.ac.in', 'Admin@123')}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login as Admin to Approve Now</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
