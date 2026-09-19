import React, { useState, useEffect } from 'react';
import TopGovtBar from './components/layout/TopGovtBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { Lock, LogIn, ShieldAlert, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';

// Home Views
import HeroBanner from './components/home/HeroBanner';
import NoticeTenderBoard from './components/home/NoticeTenderBoard';
import QuickFeaturesGrid from './components/home/QuickFeaturesGrid';
import PrincipalMessage from './components/home/PrincipalMessage';
import DepartmentCards from './components/home/DepartmentCards';
import NoticeModal from './components/home/NoticeModal';

// Specialized Feature Portals
import StudentDashboard from './components/dashboard/StudentDashboard';
import FacultyDashboard from './components/dashboard/FacultyDashboard';
import RoleSwitcherModal from './components/dashboard/RoleSwitcherModal';
import PlacementOverview from './components/placement/PlacementOverview';
import ResourceSearch from './components/library/ResourceSearch';
import EventsGrid from './components/events/EventsGrid';
import FeeCalculator from './components/payment/FeeCalculator';
import AlumniDirectory from './components/alumni/AlumniDirectory';
import AboutUniversity from './components/about/AboutUniversity';
import PalamuMitraBot from './components/chatbot/PalamuMitraBot';

// Advanced Backend Features: Smart QR Scanner, Approval Desk, Auth
import SmartQRScanner from './components/attendance/SmartQRScanner';
import ApprovalDesk from './components/admin/ApprovalDesk';
import AuthModal from './components/auth/AuthModal';

// Data & Storage
import { 
  getStoredRole, 
  setStoredRole, 
  getStudentData, 
  saveStudentData, 
  getFacultyData, 
  saveFacultyData,
  buildStudentProfile,
  clearAuthSession
} from './utils/storage';
import { 
  getStoredAuthUser, 
  setStoredAuthUser, 
  getAuthToken,
  removeAuthToken, 
  removeStoredAuthUser,
  api
} from './services/api';
import { NOTICES_AND_TENDERS } from './data/collegeData';

function ProtectedAuthGate({ sectionTitle, onOpenAuthModal, onOpenRoleSwitcher, onGoHome }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-150">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            Institutional Access Control
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3">{sectionTitle || 'Authentication Required'}</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This university portal is restricted to authorized students, faculty members, and administrative staff. You are currently browsing as a guest or your session has ended.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 rounded-xl bg-gec-blue hover:bg-sky-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>Sign In to Institutional Account</span>
          </button>

          <button
            onClick={onOpenRoleSwitcher}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Switch Role (Student / Faculty / Admin Demo)</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
          >
            Return to Public Campus Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

function AccessDeniedGate({ requiredRole, userRole, onOpenRoleSwitcher, onGoHome }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            Permission Restricted
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">Administrative Authority Required</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This module requires <strong>{requiredRole.toUpperCase()}</strong> authority. Your active position is <strong>{userRole.toUpperCase()}</strong>.
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <button
            onClick={onOpenRoleSwitcher}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Switch to {requiredRole.toUpperCase()} Account</span>
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentRole, setCurrentRole] = useState(getStoredRole());
  const [currentUser, setCurrentUser] = useState(getStoredAuthUser());
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [logoutNotice, setLogoutNotice] = useState(false);

  // Modals & Floating Tools
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Live Application Data
  const [studentData, setStudentData] = useState(getStudentData());
  const [facultyData, setFacultyData] = useState(getFacultyData());

  // Session validation on app mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(data => {
          if (data && data.user) {
            setCurrentUser(data.user);
            setStoredAuthUser(data.user);
            setCurrentRole(data.user.role || 'guest');
            setStoredRole(data.user.role || 'guest');
            if (data.user.role === 'student') {
              const fullProfile = buildStudentProfile(data.user);
              setStudentData(fullProfile);
              saveStudentData(fullProfile);
            }
          }
        })
        .catch(() => {
          // Token expired or invalid
          removeAuthToken();
          removeStoredAuthUser();
          clearAuthSession();
          setCurrentUser(null);
          setCurrentRole('guest');
          setStoredRole('guest');
        });
    }
  }, []);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setStoredRole(newRole);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const role = user.role || 'student';
    setCurrentRole(role);
    setStoredRole(role);
    setLogoutNotice(false);

    if (role === 'admin') {
      setCurrentTab('approval-desk');
    } else if (role === 'faculty' || role === 'hod') {
      setCurrentTab('dashboard');
    } else {
      const fullProfile = buildStudentProfile(user);
      setStudentData(fullProfile);
      saveStudentData(fullProfile);
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    removeStoredAuthUser();
    clearAuthSession();
    setCurrentUser(null);
    setCurrentRole('guest');
    setStoredRole('guest');
    setCurrentTab('home');
    setLogoutNotice(true);
    setTimeout(() => setLogoutNotice(false), 4500);
  };

  const handleUpdateStudent = (updated) => {
    setStudentData(updated);
    saveStudentData(updated);
    if (currentUser && (currentUser.id === updated.id || currentUser.rollNo === updated.rollNo)) {
      const merged = { ...currentUser, ...updated };
      setCurrentUser(merged);
      setStoredAuthUser(merged);
    }
  };

  const handleUpdateFaculty = (updated) => {
    setFacultyData(updated);
    saveFacultyData(updated);
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white relative">
      
      {/* 1. Top Government Helpline & Notice Ticker */}
      <TopGovtBar 
        language={language} 
        onToggleLanguage={handleToggleLanguage}
        onOpenNoticeModal={() => setSelectedNotice(NOTICES_AND_TENDERS.notices[0])}
      />

      {/* 2. Main Navigation Bar with Role Selector & Auth Button */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        language={language}
      />

      {/* Logout Confirmation Toast Notification */}
      {logoutNotice && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Logged Out Successfully</div>
            <div className="text-[11px] text-slate-300">Your institutional session was closed & local cache cleared.</div>
          </div>
        </div>
      )}

      {/* 3. Dynamic Page Body */}
      <main className="flex-1">
        
        {/* HOME TAB */}
        {currentTab === 'home' && (
          <div>
            <HeroBanner 
              setCurrentTab={setCurrentTab} 
              onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
              language={language}
            />
            <QuickFeaturesGrid 
              setCurrentTab={setCurrentTab} 
              onOpenChatbot={() => setChatbotOpen(true)}
            />
            <NoticeTenderBoard 
              onSelectNotice={(notice) => setSelectedNotice(notice)}
            />
            <DepartmentCards 
              setCurrentTab={setCurrentTab} 
            />
            <PrincipalMessage 
              setCurrentTab={setCurrentTab} 
            />
          </div>
        )}

        {/* DASHBOARD TAB (PORTAL) */}
        {currentTab === 'dashboard' && (
          <div>
            {!currentUser ? (
              <ProtectedAuthGate 
                sectionTitle="Institutional Portal Access"
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onGoHome={() => setCurrentTab('home')}
              />
            ) : (currentUser.role === 'faculty' || currentUser.role === 'hod') ? (
              <FacultyDashboard 
                facultyData={facultyData}
                currentUser={currentUser}
                studentData={studentData}
                onUpdateStudentData={handleUpdateStudent}
                onUpdateFacultyData={handleUpdateFaculty}
                setCurrentTab={setCurrentTab}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onLogout={handleLogout}
              />
            ) : currentUser.role === 'admin' ? (
              <ApprovalDesk 
                currentUser={currentUser} 
                onLogout={handleLogout}
              />
            ) : (
              <StudentDashboard 
                studentData={studentData}
                currentUser={currentUser}
                onUpdateStudentData={handleUpdateStudent}
                setCurrentTab={setCurrentTab}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

        {/* SMART QR ATTENDANCE TERMINAL (IIT / NIT MODEL) */}
        {currentTab === 'smart-qr' && (
          <div>
            {!currentUser ? (
              <ProtectedAuthGate 
                sectionTitle="Smart QR Attendance System"
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onGoHome={() => setCurrentTab('home')}
              />
            ) : (
              <SmartQRScanner 
                currentUser={currentUser} 
                studentData={studentData}
                onUpdateStudentData={handleUpdateStudent}
                setCurrentTab={setCurrentTab}
              />
            )}
          </div>
        )}

        {/* ADMIN STUDENT APPROVAL DESK */}
        {currentTab === 'approval-desk' && (
          <div>
            {!currentUser ? (
              <ProtectedAuthGate 
                sectionTitle="Administrative Approval Desk"
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onGoHome={() => setCurrentTab('home')}
              />
            ) : (currentUser.role !== 'admin' && currentUser.role !== 'faculty' && currentUser.role !== 'hod') ? (
              <AccessDeniedGate 
                requiredRole="admin, hod or faculty"
                userRole={currentUser.role}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onGoHome={() => setCurrentTab('home')}
              />
            ) : (
              <ApprovalDesk 
                currentUser={currentUser} 
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

        {/* TRAINING & PLACEMENT CELL */}
        {currentTab === 'placement' && (
          <PlacementOverview 
            currentUser={currentUser}
            studentData={studentData}
          />
        )}

        {/* DIGITAL LIBRARY & STUDY RESOURCE HUB */}
        {currentTab === 'library' && (
          <ResourceSearch 
            currentUser={currentUser}
            studentData={studentData}
          />
        )}

        {/* EVENTS & HACKATHONS BULLETIN */}
        {currentTab === 'events' && (
          <EventsGrid 
            currentUser={currentUser}
            studentData={studentData}
          />
        )}

        {/* ONLINE FEE PAYMENT GATEWAY */}
        {currentTab === 'payment' && (
          <div>
            {!currentUser ? (
              <ProtectedAuthGate 
                sectionTitle="Online Fee Payment Gateway"
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
                onGoHome={() => setCurrentTab('home')}
              />
            ) : currentUser.role !== 'student' ? (
              <div className="py-12 bg-slate-50 min-h-[60vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Student Fee Collection Portal</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Online fee payment is designed for registered undergraduate students. You are currently logged in as a <strong>{currentUser.role.toUpperCase()}</strong>.
                  </p>
                  <button
                    onClick={() => setRoleSwitcherOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gec-blue text-white text-xs font-bold shadow-xs hover:bg-sky-900 transition-all cursor-pointer"
                  >
                    Switch to Student Account
                  </button>
                </div>
              </div>
            ) : (
              <FeeCalculator 
                currentUser={currentUser}
                studentData={studentData}
              />
            )}
          </div>
        )}

        {/* ALUMNI NETWORK & MENTORSHIP */}
        {currentTab === 'alumni' && (
          <AlumniDirectory />
        )}

        {/* ABOUT UNIVERSITY & DEPARTMENTS & GRIEVANCE */}
        {currentTab === 'about' && (
          <AboutUniversity />
        )}

      </main>

      {/* 4. Official Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* 5. Floating "Palamu Mitra Pro" Live AI Assistant (ChatGPT Style) */}
      <PalamuMitraBot 
        isOpen={chatbotOpen}
        setIsOpen={setChatbotOpen}
        setCurrentTab={setCurrentTab}
      />

      {/* 6. Role Switcher Modal */}
      <RoleSwitcherModal 
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
        currentRole={currentRole}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* 7. Student & Admin Auth Modal (Login / Register / Approval) */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 8. Notice Detail Modal */}
      <NoticeModal 
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

    </div>
  );
}
