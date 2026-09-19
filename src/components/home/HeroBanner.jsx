import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Building, 
  CreditCard, 
  BookOpen, 
  Bell,
  CheckCircle2
} from 'lucide-react';
import { COLLEGE_INFO, QUICK_STATS, NOTICES_AND_TENDERS } from '../../data/collegeData';

export default function HeroBanner({ setCurrentTab, onOpenRoleSwitcher, language }) {
  const latestNotice = NOTICES_AND_TENDERS.notices[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gec-navy via-[#02315a] to-[#011d38] text-white">
      {/* Subtle Background Pattern & Glows */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Marquee Ticker for Breaking College Notices */}
      <div className="bg-amber-500/10 border-y border-amber-400/20 py-2 px-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider bg-gec-orange text-white px-2 py-0.5 rounded text-[10px] shrink-0 animate-pulse">
            <Bell className="w-3 h-3" />
            <span>Updates</span>
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-marquee text-amber-200 hover:text-white cursor-pointer" onClick={() => setCurrentTab('home')}>
              📢 {latestNotice.title} ({latestNotice.date}) &nbsp; • &nbsp; 
              ⚡ Palash 24h Hackathon 2026 Registration Open &nbsp; • &nbsp; 
              🎓 JUT B.Tech Odd Semester Fee Payment Portal is Live &nbsp; • &nbsp; 
              💼 Yash India, TCS & Infosys Campus Recruitment Scheduled for October 2026
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content Section */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Headline & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{COLLEGE_INFO.tagline}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Shaping Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-sky-300">Engineers & Innovators</span> at Palamu
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              Government Engineering College, Palamu is dedicated to academic rigor, cutting-edge research, and technological advancement in Jharkhand. Offering undergraduate degrees in CSE, Mechanical, Civil, and Electrical Engineering.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AICTE Approved</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Affiliated to JUT Ranchi</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>50+ Acre Modern Campus</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-gec-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
              >
                <span>Student & Faculty Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentTab('payment')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-5 py-3 rounded-xl backdrop-blur-sm transition-all"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Online Fee Payment</span>
              </button>

              <button
                onClick={() => setCurrentTab('library')}
                className="flex items-center gap-2 bg-sky-950/60 hover:bg-sky-900 border border-sky-600/30 text-sky-200 font-semibold text-sm px-4 py-3 rounded-xl backdrop-blur-sm transition-all"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Digital Library (PYQs)</span>
              </button>
            </div>
          </div>

          {/* Right Showcase Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div>
                  <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Academic Session 2026-27</div>
                  <h3 className="text-lg font-bold text-white">Student Services Quick Access</h3>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              </div>

              {/* Interactive Tiles inside Hero Card */}
              <div className="grid grid-cols-2 gap-3 py-4">
                <div 
                  onClick={() => setCurrentTab('dashboard')}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 hover:border-sky-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-sky-300">Attendance</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">88%</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Track daily lectures & mid-term status</div>
                </div>

                <div 
                  onClick={() => setCurrentTab('placement')}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-300">T&P Drives</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">3 Active</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Yash India, TCS & Infosys</div>
                </div>

                <div 
                  onClick={() => setCurrentTab('events')}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-300">Palash Hackathon</span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">Oct 18</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">24-Hour National Codefest</div>
                </div>

                <div 
                  onClick={() => setCurrentTab('alumni')}
                  className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 hover:border-purple-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-purple-300">Alumni Desk</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">Mentors</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Connect with seniors at Google & Tata</div>
                </div>
              </div>

              {/* Portal Switcher Banner */}
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Viewing as Demo User:</span>
                <button
                  onClick={onOpenRoleSwitcher}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                >
                  Switch Role / Login
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Quick Stats Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_STATS.map((stat, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl text-center backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-0.5">
                <span>{stat.value}</span>
                <span className="text-xs font-normal text-amber-400">{stat.suffix}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
