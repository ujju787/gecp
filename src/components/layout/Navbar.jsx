import React, { useState } from 'react';
import { 
  GraduationCap, 
  Menu, 
  X, 
  UserCheck, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Users, 
  Building2, 
  Home, 
  Sparkles,
  ChevronDown,
  QrCode,
  ShieldCheck,
  LogIn,
  LogOut,
  ScanLine
} from 'lucide-react';
import { COLLEGE_INFO } from '../../data/collegeData';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentRole, 
  onOpenRoleSwitcher, 
  onOpenAuthModal,
  currentUser,
  onLogout,
  language 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine effective role
  const effectiveRole = currentUser?.role || (currentUser ? currentRole : 'guest');

  let navItems = [];
  if (effectiveRole === 'student') {
    navItems = [
      { id: 'home', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: Home },
      { id: 'dashboard', label: language === 'hi' ? 'छात्र पोर्टल' : 'Student Portal', icon: UserCheck, highlight: true },
      { id: 'smart-qr', label: language === 'hi' ? 'स्मार्ट QR उपस्थिति' : 'Smart QR Pass', icon: ScanLine, highlight: true },
      { id: 'payment', label: language === 'hi' ? 'फीस भुगतान' : 'Pay Fees', icon: CreditCard, highlight: true },
      { id: 'library', label: language === 'hi' ? 'डिजिटल लाइब्रेरी' : 'Digital Library', icon: BookOpen },
      { id: 'events', label: language === 'hi' ? 'इवेंट्स व पास' : 'Events & Passes', icon: Calendar },
      { id: 'placement', label: language === 'hi' ? 'T&P सेल' : 'T&P Cell', icon: Briefcase },
      { id: 'alumni', label: language === 'hi' ? 'एलुमनाई नेटवर्क' : 'Alumni', icon: Users },
    ];
  } else if (effectiveRole === 'hod') {
    navItems = [
      { id: 'home', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: Home },
      { id: 'dashboard', label: language === 'hi' ? 'विभागाध्यक्ष (HOD) पोर्टल' : 'HOD Portal', icon: UserCheck, highlight: true },
      { id: 'smart-qr', label: language === 'hi' ? 'क्लासरूम स्कैनर' : 'Classroom Scanner', icon: ScanLine, highlight: true },
      { id: 'approval-desk', label: language === 'hi' ? 'छात्र स्वीकृति डेस्क' : 'Student Approvals', icon: ShieldCheck, highlight: true },
      { id: 'library', label: language === 'hi' ? 'डिजिटल लाइब्रेरी' : 'Digital Library', icon: BookOpen },
      { id: 'events', label: language === 'hi' ? 'इवेंट्स व कार्यशाला' : 'Events & Workshops', icon: Calendar },
      { id: 'placement', label: language === 'hi' ? 'T&P सेल' : 'T&P Cell', icon: Briefcase },
      { id: 'alumni', label: language === 'hi' ? 'एलुमनाई नेटवर्क' : 'Alumni', icon: Users },
    ];
  } else if (effectiveRole === 'faculty') {
    navItems = [
      { id: 'home', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: Home },
      { id: 'dashboard', label: language === 'hi' ? 'शिक्षक पोर्टल' : 'Faculty Portal', icon: UserCheck, highlight: true },
      { id: 'smart-qr', label: language === 'hi' ? 'क्लासरूम स्कैनर' : 'Classroom Scanner', icon: ScanLine, highlight: true },
      { id: 'approval-desk', label: language === 'hi' ? 'सत्यापन डेस्क' : 'Approval Desk', icon: ShieldCheck, highlight: true },
      { id: 'library', label: language === 'hi' ? 'डिजिटल लाइब्रेरी' : 'Digital Library', icon: BookOpen },
      { id: 'events', label: language === 'hi' ? 'इवेंट्स व कार्यशाला' : 'Events & Workshops', icon: Calendar },
      { id: 'placement', label: language === 'hi' ? 'T&P सेल' : 'T&P Cell', icon: Briefcase },
      { id: 'alumni', label: language === 'hi' ? 'एलुमनाई नेटवर्क' : 'Alumni', icon: Users },
    ];
  } else if (effectiveRole === 'admin') {
    navItems = [
      { id: 'home', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: Home },
      { id: 'approval-desk', label: language === 'hi' ? 'स्वीकृति डेस्क' : 'Approval Desk', icon: ShieldCheck, highlight: true },
      { id: 'smart-qr', label: language === 'hi' ? 'उपस्थिति टर्मिनल' : 'Attendance Terminal', icon: ScanLine, highlight: true },
      { id: 'library', label: language === 'hi' ? 'डिजिटल लाइब्रेरी' : 'Digital Library', icon: BookOpen },
      { id: 'events', label: language === 'hi' ? 'इवेंट्स व फेस्ट' : 'Events & Fests', icon: Calendar },
      { id: 'placement', label: language === 'hi' ? 'T&P सेल' : 'T&P Cell', icon: Briefcase },
      { id: 'alumni', label: language === 'hi' ? 'एलुमनाई नेटवर्क' : 'Alumni', icon: Users },
    ];
  } else {
    // Guest / Public Visitor
    navItems = [
      { id: 'home', label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: Home },
      { id: 'about', label: language === 'hi' ? 'संस्थान परिचय' : 'About College', icon: Building2 },
      { id: 'library', label: language === 'hi' ? 'डिजिटल लाइब्रेरी' : 'Digital Library', icon: BookOpen },
      { id: 'events', label: language === 'hi' ? 'इवेंट्स व फेस्ट' : 'Events & Fests', icon: Calendar },
      { id: 'placement', label: language === 'hi' ? 'T&P सेल' : 'T&P Cell', icon: Briefcase },
      { id: 'alumni', label: language === 'hi' ? 'एलुमनाई नेटवर्क' : 'Alumni', icon: Users },
    ];
  }

  const handleNavClick = (id) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      {/* College Identity Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & College Title */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gec-blue to-gec-navy p-1 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0 border-2 border-gec-orange">
              <div className="w-full h-full rounded-full border border-amber-300/40 flex flex-col items-center justify-center bg-gec-blue text-white text-center">
                <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-amber-300" />
                <span className="text-[8px] font-black tracking-widest leading-none text-amber-200">GEC</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gec-orange tracking-wide uppercase">
                  {COLLEGE_INFO.tagline}
                </span>
              </div>
              <h1 className="text-base md:text-xl font-extrabold text-gec-navy leading-tight group-hover:text-gec-blue transition-colors">
                {language === 'hi' ? COLLEGE_INFO.hindiName : COLLEGE_INFO.name}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {COLLEGE_INFO.governance} | {COLLEGE_INFO.affiliation} | {COLLEGE_INFO.approval}
              </p>
            </div>
          </div>

          {/* Quick Actions & Auth Controls */}
          <div className="flex items-center gap-2">
            
            {/* Login / Register Button or User Profile with Explicit Sign Out */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 p-1 px-2.5 rounded-2xl border border-slate-300 shadow-2xs text-xs">
                  <button
                    onClick={() => handleNavClick(currentUser.role === 'admin' ? 'approval-desk' : 'dashboard')}
                    className="flex items-center gap-2 rounded-xl hover:bg-white transition-colors text-left"
                    title="View your dashboard"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-xs ${
                      currentUser.role === 'admin' ? 'bg-purple-600' :
                      currentUser.role === 'hod' ? 'bg-indigo-600' :
                      currentUser.role === 'faculty' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {currentUser.role === 'admin' ? 'ADM' : currentUser.role === 'hod' ? 'HOD' : currentUser.role === 'faculty' ? 'FAC' : 'STD'}
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-slate-900 truncate max-w-[120px]">{currentUser.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono leading-none">
                        {currentUser.rollNo || (currentUser.role === 'admin' ? 'Admin Authority' : currentUser.role === 'hod' ? 'HOD (CSE)' : (currentUser.designation || 'Subject Faculty'))}
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                  title="Sign out of current institutional session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Quick Role Switcher Button */}
            {/* <button
              onClick={onOpenRoleSwitcher}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-gec-blue bg-slate-50 hover:bg-sky-50 text-xs font-medium transition-all shadow-xs group cursor-pointer"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${
                effectiveRole === 'student' ? 'bg-emerald-500' : 
                effectiveRole === 'faculty' ? 'bg-amber-500' : 
                effectiveRole === 'admin' ? 'bg-purple-600' : 'bg-slate-400'
              } ring-2 ring-white`}></div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 leading-none">Institutional Role</div>
                <div className="font-semibold text-slate-800 capitalize flex items-center gap-1">
                  {effectiveRole === 'student' ? 'Student Portal' :
                   effectiveRole === 'faculty' ? 'Faculty Portal' : 
                   effectiveRole === 'admin' ? 'Admin Authority' : 'Public Visitor'}
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </div>
              <span className="sm:hidden font-semibold text-gec-blue">Role</span>
            </button> */}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-gec-blue text-white border-t border-sky-700/50">
        <div className="max-w-7xl mx-auto px-4 hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-md transition-all duration-150 relative cursor-pointer ${
                    isActive 
                      ? 'bg-white text-gec-blue shadow-sm' 
                      : 'text-sky-100 hover:bg-sky-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gec-orange' : 'text-sky-300'}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[8px] font-bold bg-amber-400 text-slate-900 rounded-full">
                      LIVE
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gec-orange"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="py-1 flex items-center gap-2">
            {effectiveRole === 'student' && (
              <button
                onClick={() => handleNavClick('smart-qr')}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all hover:scale-105 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My Smart ID Pass</span>
              </button>
            )}
            {effectiveRole === 'faculty' && (
              <button
                onClick={() => handleNavClick('smart-qr')}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all hover:scale-105 cursor-pointer"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Classroom Scanner Terminal</span>
              </button>
            )}
            {effectiveRole === 'admin' && (
              <button
                onClick={() => handleNavClick('approval-desk')}
                className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all hover:scale-105 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approval Desk</span>
              </button>
            )}
            {effectiveRole === 'guest' && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all hover:scale-105 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Student / Admin Portal Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-3 max-h-[85vh] overflow-y-auto">
            {/* User Session Info on Mobile */}
            {currentUser ? (
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                    currentUser.role === 'admin' ? 'bg-purple-600' :
                    currentUser.role === 'hod' ? 'bg-indigo-600' :
                    currentUser.role === 'faculty' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {currentUser.role === 'admin' ? 'ADM' : currentUser.role === 'hod' ? 'HOD' : currentUser.role === 'faculty' ? 'FAC' : 'STD'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {currentUser.rollNo || (currentUser.role === 'admin' ? 'Admin Authority' : currentUser.role === 'hod' ? 'HOD (CSE)' : (currentUser.designation || 'Subject Faculty'))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Public Visitor Mode</div>
                  <div className="text-[10px] text-slate-400">Sign in to access personal portal</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-gec-blue text-white' 
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 flex justify-between items-center text-xs text-slate-400">
              <span>Active Role: <strong className="text-white capitalize">{effectiveRole}</strong></span>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRoleSwitcher();
                }}
                className="text-amber-400 font-semibold underline cursor-pointer"
              >
                Change Role
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
