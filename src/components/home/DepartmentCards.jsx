import React, { useState } from 'react';
import { 
  Laptop, 
  Cog, 
  Building2, 
  Zap, 
  Users, 
  FlaskConical, 
  ChevronRight, 
  BookOpen 
} from 'lucide-react';
import { DEPARTMENTS } from '../../data/collegeData';
import { api } from '../../services/api';

export default function DepartmentCards({ setCurrentTab }) {
  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);

  React.useEffect(() => {
    let mounted = true;
    api.getDepartmentsWithFaculty().then(res => {
      if (mounted && res && res.departments && res.departments.length > 0) {
        setDepartments(res.departments);
        setSelectedDept(prev => {
          const matched = res.departments.find(d => d.id === prev?.id || d.code === prev?.code);
          return matched || res.departments[0];
        });
      }
    }).catch(err => {
      console.warn('Departments live fetch fallback:', err);
    });
    return () => { mounted = false; };
  }, []);

  const icons = {
    cse: Laptop,
    me: Cog,
    ce: Building2,
    ee: Zap
  };

  return (
    <section className="py-16 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold text-gec-orange uppercase tracking-wider mb-2">
            Academic Programs & Infrastructure
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gec-navy">
            Undergraduate Engineering Departments
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            AICTE approved 4-Year B.Tech programs affiliated to Jharkhand University of Technology (JUT), Ranchi.
          </p>
          <div className="w-16 h-1 bg-gec-orange mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Department Switcher Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {departments.map((dept) => {
            const Icon = icons[dept.id] || Laptop;
            const isSelected = selectedDept.id === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className={`p-4 rounded-xl text-left border transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-gec-blue text-white border-gec-blue shadow-lg scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-white/10 text-amber-400' : 'bg-slate-100 text-gec-blue'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-[11px] font-bold ${isSelected ? 'text-amber-300' : 'text-gec-orange'}`}>
                    {dept.code}
                  </div>
                  <div className="text-xs font-bold truncate max-w-[140px] sm:max-w-none">
                    {dept.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Department Spotlight Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Department Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-gec-blue/10 text-gec-blue text-xs font-bold rounded-md">
                  Branch Code: {selectedDept.code}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Annual Intake: {selectedDept.intake} Seats</span>
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                  HOD: {selectedDept.head}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gec-navy">
                Department of {selectedDept.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedDept.description}
              </p>

              {/* Department Laboratories */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-gec-orange" />
                  <span>Specialized Laboratories & Workshops</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedDept.labs.map((lab, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gec-blue shrink-0"></div>
                      <span>{lab}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCurrentTab('library')}
                  className="flex items-center gap-1.5 text-xs font-bold bg-gec-blue text-white px-4 py-2 rounded-lg hover:bg-sky-900 transition-colors shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>View {selectedDept.code} Notes & PYQs</span>
                </button>
                <button
                  onClick={() => setCurrentTab('placement')}
                  className="flex items-center gap-1.5 text-xs font-bold border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span>Branch Placement Records</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Faculty Roster (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Faculty Members ({selectedDept.faculty.length})</span>
                <span className="text-slate-400 font-normal">Regular & Guest</span>
              </h4>

              <div className="space-y-3">
                {selectedDept.faculty.map((f, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="font-bold text-xs text-gec-navy">{f.name}</div>
                    <div className="text-[11px] text-gec-orange font-medium">{f.role}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Specialization: {f.specialization}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                <span className="text-[11px] text-slate-500">All faculty recruited conforming to AICTE norms</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
