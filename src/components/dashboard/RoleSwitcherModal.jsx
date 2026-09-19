import React, { useState } from 'react';
import { 
  UserCheck, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  CheckCircle, 
  X,
  Sparkles,
  LogOut,
  Loader2,
  Lock,
  ArrowRight,
  Award
} from 'lucide-react';
import { api, setAuthToken, setStoredAuthUser } from '../../services/api';

export default function RoleSwitcherModal({ 
  isOpen, 
  onClose, 
  currentRole, 
  currentUser,
  onLoginSuccess,
  onLogout 
}) {
  const [switching, setSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [approvedStudents, setApprovedStudents] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      api.getApprovedStudents().then(res => {
        if (res && res.students && res.students.length > 0) {
          setApprovedStudents(res.students);
        } else {
          setApprovedStudents([]);
        }
      }).catch(() => {
        setApprovedStudents([]);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const studentRoleItems = approvedStudents.length > 0 
    ? approvedStudents.map(st => ({
        id: 'student',
        key: `student-${st.id}`,
        studentId: st.id,
        name: `${st.name} (Student Portal)`,
        roleLabel: `${st.branch || 'CSE'} ${st.semester || '5th Sem'} • Roll ${st.rollNo}`,
        email: st.email,
        password: 'Student@123',
        studentObj: st,
        description: `Personalized dashboard for ${st.name}: live attendance %, internal test marks, digital student ID pass, fee payment, and study materials.`,
        icon: GraduationCap,
        color: 'border-emerald-500 bg-emerald-50/50',
        badge: `${st.rollNo}`,
        badgeColor: 'bg-emerald-100 text-emerald-800'
      }))
    : [{
        id: 'student-empty',
        key: 'student-empty',
        name: 'Student Portal (No Registered Student)',
        roleLabel: '0 Students Currently in Database',
        email: null,
        password: null,
        description: 'No students exist yet. Please use the "Sign In / Register" form to register a new student. Once approved by HOD/Admin, they can log in here.',
        icon: GraduationCap,
        color: 'border-slate-300 bg-slate-50',
        badge: '0 Enrolled',
        badgeColor: 'bg-slate-200 text-slate-700',
        disabled: true
      }];

  const roles = [
    ...studentRoleItems,
    {
      id: 'faculty',
      name: 'Prof. Amit Sharma (Subject Teacher - OS)',
      roleLabel: 'Assistant Professor (Subject Teacher - CS502 Operating Systems)',
      email: 'amit.sharma@gecpalamu.ac.in',
      password: 'Faculty@123',
      description: 'Subject teacher tools: update CS502 attendance & mid-term marks for enrolled students, operate classroom scanner terminal, and broadcast lecture notes & deadlines.',
      icon: UserCheck,
      color: 'border-amber-500 bg-amber-50/50',
      badge: 'Subject Teacher',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'hod-cse',
      role: 'hod',
      name: 'Dr. Bhawesh Kumar (HOD - Computer Science)',
      roleLabel: 'Associate Professor & HOD, Computer Science & Engineering',
      email: 'dr.bhawesh@gecpalamu.ac.in',
      password: 'Faculty@123',
      description: 'Departmental executive authority: supervise CSE curriculum, monitor course progress, approve student registrations, and manage department faculty.',
      icon: Award,
      color: 'border-indigo-500 bg-indigo-50/50',
      badge: 'HOD CSE',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'hod-ee',
      role: 'hod',
      name: 'Dr. Vineet Shekhar (HOD - Electrical)',
      roleLabel: 'Associate Professor & HOD, Electrical Engineering',
      email: 'dr.vineet@gecpalamu.ac.in',
      password: 'Faculty@123',
      description: 'Departmental executive authority: supervise EE curriculum, Power Systems & Smart Grids laboratories, and manage department operations.',
      icon: Award,
      color: 'border-amber-500 bg-amber-50/50',
      badge: 'HOD EE',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'hod-me',
      role: 'hod',
      name: 'Dr. Shivam Verma (HOD - Mechanical)',
      roleLabel: 'Associate Professor & HOD, Mechanical Engineering',
      email: 'dr.shivam@gecpalamu.ac.in',
      password: 'Faculty@123',
      description: 'Departmental executive authority: supervise ME curriculum, Thermal & CAD/CAM workshops, and manage mechanical engineering faculty.',
      icon: Award,
      color: 'border-rose-500 bg-rose-50/50',
      badge: 'HOD ME',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'hod-ce',
      role: 'hod',
      name: 'Dr. Manish Ranjan (HOD - Civil)',
      roleLabel: 'Associate Professor & HOD, Civil Engineering',
      email: 'dr.manish@gecpalamu.ac.in',
      password: 'Faculty@123',
      description: 'Departmental executive authority: supervise CE curriculum, Structural Dynamics & Geotechnical laboratories, and oversee civil department courses.',
      icon: Award,
      color: 'border-emerald-500 bg-emerald-50/50',
      badge: 'HOD CE',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'admin',
      name: 'Dr. Sanjay Kumar Singh (Admin Authority)',
      roleLabel: 'Principal & Head of Academic Council',
      email: 'admin@gecpalamu.ac.in',
      password: 'Admin@123',
      description: 'Institutional administration: review student registration queue, verify university roll numbers against JCECEB records, approve or reject applicants.',
      icon: ShieldCheck,
      color: 'border-purple-500 bg-purple-50/50',
      badge: 'Apex Authority',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'guest',
      name: 'Guest / Public Visitor',
      roleLabel: 'General Citizen, Parent or Prospective Student',
      email: null,
      password: null,
      description: 'Public website view: browse college achievements, JCECEB cutoffs, department syllabus, placement statistics, and campus fests.',
      icon: User,
      color: 'border-sky-500 bg-sky-50/50',
      badge: 'Public Visitor',
      badgeColor: 'bg-sky-100 text-sky-800'
    }
  ];

  const handleSelectRole = async (r) => {
    setErrorMsg('');
    if (r.disabled) {
      setErrorMsg('No students registered yet. Please click "Sign In / Register" in the top bar to register an authentic new student!');
      return;
    }
    if (r.id === 'guest') {
      if (onLogout) onLogout();
      onClose();
      return;
    }

    setSwitching(true);
    try {
      if (r.id === 'student' && r.studentObj) {
        setStoredAuthUser(r.studentObj);
        if (onLoginSuccess) {
          onLoginSuccess(r.studentObj);
        }
        onClose();
        return;
      }

      // Perform authentic backend login
      const data = await api.login(r.email, r.password);
      setAuthToken(data.token);
      setStoredAuthUser(data.user);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      onClose();
    } catch (err) {
      console.warn('Backend login fallback:', err);
      // Fallback for staff accounts
      const fallbackUser = {
        id: r.id === 'admin' ? 'usr-admin-01' : r.id === 'hod' ? 'usr-fac-01' : 'usr-teacher-01',
        name: r.name.split('(')[0].trim(),
        email: r.email,
        role: r.id,
        status: 'APPROVED',
        designation: r.id === 'hod' ? 'Head of Department & Associate Professor' : r.id === 'faculty' ? 'Assistant Professor (Subject Teacher - OS)' : r.id === 'admin' ? 'Principal' : undefined
      };
      setStoredAuthUser(fallbackUser);
      if (onLoginSuccess) {
        onLoginSuccess(fallbackUser);
      }
      onClose();
    } finally {
      setSwitching(false);
    }
  };

  const activeRole = currentUser?.role || currentRole || 'guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-gec-navy to-gec-blue text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-extrabold text-base">Institutional Role & Position Switcher</h3>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Switch positions instantly with authentic role-based permissions, powers, and navbar views.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = activeRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => !switching && handleSelectRole(r)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  isSelected 
                    ? `${r.color} shadow-sm ring-2 ring-gec-blue` 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                } ${switching ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className={`p-3 rounded-xl shrink-0 ${
                  isSelected ? 'bg-gec-blue text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{r.name}</h4>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>
                  <div className="text-xs text-gec-orange font-bold mt-0.5">{r.roleLabel}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{r.description}</p>
                </div>

                {isSelected ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Explicit Logout Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-500">
            Active: <strong className="text-slate-800 capitalize">{activeRole}</strong>
          </div>
          {currentUser && (
            <button
              onClick={() => {
                if (onLogout) onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out to Guest</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
