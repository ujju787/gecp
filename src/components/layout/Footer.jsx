import React from 'react';
import { 
  GraduationCap, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ExternalLink, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { COLLEGE_INFO } from '../../data/collegeData';

export default function Footer({ setCurrentTab }) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t-4 border-gec-orange pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* Column 1: About GEC Palamu */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gec-blue border border-amber-400/40 flex items-center justify-center text-white font-bold text-sm">
              GEC
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight">GEC Palamu</h3>
              <p className="text-[11px] text-amber-400">Govt. of Jharkhand Institution</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Government Engineering College, Palamu was established in 2022 by the Department of Higher & Technical Education, Govt. of Jharkhand, to deliver world-class technical education in the Palamu division.
          </p>
          <div className="text-xs space-y-1 text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Approved by AICTE, New Delhi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Affiliated to JUT Ranchi</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Portals & Features */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-gec-orange rounded-sm"></span>
            <span>Digital Portals & Hubs</span>
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setCurrentTab('dashboard')} className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-gec-orange" />
                <span>Student & Faculty Portal (Live)</span>
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('placement')} className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-gec-orange" />
                <span>Training & Placement (T&P) Cell</span>
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('library')} className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-gec-orange" />
                <span>Digital Library (PYQs & Notes Vault)</span>
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('events')} className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-gec-orange" />
                <span>TechKriti & Palash Hackathon 2026</span>
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('payment')} className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-gec-orange" />
                <span>Online Fee Payment Gateway</span>
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('alumni')} className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-gec-orange" />
                <span>Verified Alumni & Mentorship Network</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Important External Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-sky-400 rounded-sm"></span>
            <span>External Statutory Links</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <a href="https://jutranchi.ac.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center justify-between">
                <span>Jharkhand University of Technology</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://jceceb.jharkhand.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center justify-between">
                <span>JCECEB Counselling Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://aicte-india.org" target="_blank" rel="noreferrer" className="hover:text-white flex items-center justify-between">
                <span>AICTE Official Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://ekalyan.cgg.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center justify-between">
                <span>e-Kalyan Jharkhand Scholarship</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://swayam.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center justify-between">
                <span>SWAYAM / NPTEL Online Courses</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Grievance */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-400 rounded-sm"></span>
            <span>Campus & Helpline</span>
          </h4>
          <div className="space-y-3 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gec-orange shrink-0 mt-0.5" />
              <span>{COLLEGE_INFO.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <a href={`mailto:${COLLEGE_INFO.email}`} className="hover:underline text-slate-200">
                {COLLEGE_INFO.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{COLLEGE_INFO.phone}</span>
            </div>
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-200 space-y-1">
              <div className="font-semibold text-rose-300">Emergency Desks:</div>
              <div>Anti-Ragging: {COLLEGE_INFO.antiRaggingTollFree}</div>
              <div>Women Safety: {COLLEGE_INFO.womenHelpline}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Government Engineering College, Palamu. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentTab('about')} className="hover:text-slate-300">Mandatory Disclosure</button>
          <span>•</span>
          <button onClick={() => setCurrentTab('about')} className="hover:text-slate-300">RTI & Grievances</button>
          <span>•</span>
          <button onClick={() => setCurrentTab('about')} className="hover:text-slate-300">Privacy Policy</button>
        </div>
      </div>
    </footer>
  );
}
