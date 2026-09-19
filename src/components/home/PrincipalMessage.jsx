import React from 'react';
import { Quote, Target, Award, Compass, CheckCircle } from 'lucide-react';
import { COLLEGE_INFO } from '../../data/collegeData';

export default function PrincipalMessage({ setCurrentTab }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold text-gec-orange uppercase tracking-wider mb-2">
            Institutional Leadership & Philosophy
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gec-navy">
            From the Principal’s Desk
          </h2>
          <div className="w-16 h-1 bg-gec-orange mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Principal Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Principal Visual Card (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gec-blue to-gec-navy p-6 text-white text-center shadow-xl border-4 border-slate-100">
              <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 border-4 border-amber-400 overflow-hidden mb-4 shadow-inner flex items-center justify-center">
                {/* Clean Professional Avatar Placeholder */}
                <div className="w-full h-full bg-slate-300 flex flex-col items-center justify-center text-slate-700">
                  <span className="text-3xl font-extrabold">DSKS</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">GEC Palamu</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">{COLLEGE_INFO.principal.name}</h3>
              <p className="text-xs text-amber-300 font-medium">{COLLEGE_INFO.principal.designation}</p>
              <p className="text-[11px] text-slate-300 mt-1">{COLLEGE_INFO.principal.qualification}</p>

              <div className="mt-4 pt-4 border-t border-sky-800 text-xs text-sky-200 space-y-1">
                <div>Government Engineering College, Palamu</div>
                <div className="text-[11px] text-amber-300/80">Govt. of Jharkhand</div>
              </div>
            </div>
          </div>

          {/* Principal Speech Text (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
              <Quote className="w-10 h-10 text-gec-blue/15 absolute top-4 right-4" />
              
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-4 whitespace-pre-line">
                {COLLEGE_INFO.principal.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 font-medium">
                  "Excellence in Technical Education, Innovation and Ethical Leadership."
                </div>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="text-xs font-bold text-gec-blue hover:text-gec-orange underline transition-colors"
                >
                  Read Complete Administration & History →
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Vision */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gec-blue text-white flex items-center justify-center mb-4 shadow">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gec-navy mb-2">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {COLLEGE_INFO.vision}
            </p>
          </div>

          {/* Mission */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gec-orange text-white flex items-center justify-center mb-4 shadow">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gec-navy mb-2">Our Mission</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {COLLEGE_INFO.mission.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-gec-orange shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
