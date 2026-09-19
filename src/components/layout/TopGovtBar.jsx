import React from 'react';
import { Phone, Mail, ShieldAlert, Globe, Bell } from 'lucide-react';
import { COLLEGE_INFO } from '../../data/collegeData';

export default function TopGovtBar({ language, onToggleLanguage, onOpenNoticeModal }) {
  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Govt Affiliation & Helpline */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>झारखंड सरकार | Government of Jharkhand</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="hidden sm:flex items-center gap-3 text-slate-300">
            <a href="tel:+919431102845" className="hover:text-white flex items-center gap-1">
              <Phone className="w-3 h-3 text-sky-400" />
              <span>{COLLEGE_INFO.phone}</span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-rose-300">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Women Helpline: {COLLEGE_INFO.womenHelpline}</span>
            </span>
          </div>
        </div>

        {/* Right: Language switch & Fast Quick Notice Ticker */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNoticeModal}
            className="flex items-center gap-1 bg-gec-orange/20 hover:bg-gec-orange/30 text-amber-300 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-500/30 transition-all"
          >
            <Bell className="w-3 h-3 animate-bounce" />
            <span>Latest Announcements</span>
          </button>
          
          <button 
            onClick={onToggleLanguage}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-600"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">{language === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
