import React, { useState } from 'react';
import { 
  Building2, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Users, 
  FileText, 
  CheckCircle2, 
  Send,
  Sparkles,
  School,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { COLLEGE_INFO, DEPARTMENTS } from '../../data/collegeData';
import { api } from '../../services/api';

export default function AboutUniversity() {
  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [grievanceName, setGrievanceName] = useState('');
  const [grievanceRoll, setGrievanceRoll] = useState('');
  const [grievanceCategory, setGrievanceCategory] = useState('Academic');
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceTicket, setGrievanceTicket] = useState(null);

  React.useEffect(() => {
    let mounted = true;
    api.getDepartmentsWithFaculty().then(res => {
      if (mounted && res && res.departments && res.departments.length > 0) {
        setDepartments(res.departments);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;

    const ticket = `GRV-GECP-${Math.floor(10000 + Math.random() * 90000)}`;
    setGrievanceTicket(ticket);
    setGrievanceText('');
    setGrievanceName('');
    setGrievanceRoll('');

    confetti({
      particleCount: 40,
      spread: 60
    });
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-gec-navy via-slate-900 to-sky-950 rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Profile & Administration</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              About Government Engineering College, Palamu
            </h1>

            <p className="text-sm text-sky-100 leading-relaxed font-light">
              Established in 2022 by the Department of Higher and Technical Education, Government of Jharkhand, to pioneer engineering excellence, innovation, and leadership in the historic Palamu plateau.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-sky-200">
              <span>Location: <strong>Lesliganj, Medininagar - 822118</strong></span>
              <span>•</span>
              <span>Affiliation: <strong>Jharkhand University of Technology</strong></span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Institutional Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gec-blue text-white flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gec-navy mb-2">Government Foundation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Managed and funded directly by the Government of Jharkhand with state-of-the-art academic blocks, residential hostels, advanced research labs, and expansive 50+ acre campus.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gec-navy mb-2">AICTE & JUT Accreditation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approved by the All India Council for Technical Education (AICTE), New Delhi, and permanently affiliated to Jharkhand University of Technology (JUT), Ranchi following the model outcome-based curriculum.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gec-orange text-white flex items-center justify-center mb-4">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gec-navy mb-2">Inclusive Growth</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-quality education accessible to all with full e-Kalyan Jharkhand state scholarship benefits, dedicated girls hostel, active grievance redressal, and 24x7 women safety helplines.
            </p>
          </div>
        </div>

        {/* Departments Comprehensive Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-12">
          <h2 className="text-xl font-bold text-gec-navy mb-2">Undergraduate Engineering Disciplines</h2>
          <p className="text-xs text-slate-500 mb-6">Annual sanctioned student intake and department heads</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-gec-blue bg-white px-2.5 py-0.5 rounded border border-slate-200">
                    {dept.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {dept.intake} Sanctioned Seats
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{dept.name}</h3>
                <div className="text-xs text-gec-orange font-semibold mb-2">Head: {dept.head}</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{dept.description}</p>
                <div className="text-[11px] text-slate-500">
                  <strong>Key Labs:</strong> {dept.labs.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Disclosure & Statutory Cells */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Statutory Cells Info (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gec-navy">Institutional Governance & Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              GEC Palamu enforces strict statutory regulations and student welfare committees:
            </p>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-gec-navy block">Anti-Ragging Committee & Squad</strong>
                <span>Zero-tolerance policy. 24x7 National Toll-Free: {COLLEGE_INFO.antiRaggingTollFree}</span>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-gec-navy block">Internal Complaints Committee (ICC) & Women Helpline</strong>
                <span>Special committee for women safety and gender sensitization. Helpline: {COLLEGE_INFO.womenHelpline}</span>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-gec-navy block">SC/ST/OBC Welfare & Equal Opportunity Cell</strong>
                <span>Monitors reservations, e-Kalyan scholarship disbursals, and academic remedial classes.</span>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-gec-navy block">Right to Information (RTI) Cell</strong>
                <span>Public Information Officer: Registrar / Academic Officer, GEC Palamu.</span>
              </li>
            </ul>
          </div>

          {/* Grievance Submission Form (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-gec-navy mb-1">Online Student & Public Grievance Portal</h3>
            <p className="text-xs text-slate-500 mb-4">Direct submission to the Institutional Redressal Committee</p>

            {grievanceTicket ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Grievance Registered Successfully</h4>
                <div className="text-xs text-slate-600">
                  Your reference tracking number is:
                </div>
                <div className="font-mono text-base font-black text-gec-blue bg-white py-1.5 px-4 rounded-lg inline-block border border-emerald-200">
                  {grievanceTicket}
                </div>
                <p className="text-[11px] text-slate-500">
                  The committee will review and address your inquiry within 7 working days.
                </p>
                <button
                  onClick={() => setGrievanceTicket(null)}
                  className="text-xs text-gec-blue font-bold underline"
                >
                  Submit Another Grievance
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitGrievance} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={grievanceName}
                      onChange={(e) => setGrievanceName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gec-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Roll / Contact No</label>
                    <input
                      type="text"
                      placeholder="e.g. 22/CSE/042"
                      value={grievanceRoll}
                      onChange={(e) => setGrievanceRoll(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grievance Category</label>
                  <select
                    value={grievanceCategory}
                    onChange={(e) => setGrievanceCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option>Academic & Examination</option>
                    <option>Hostel & Mess Facilities</option>
                    <option>Fee Payment & Accounts</option>
                    <option>Scholarship (e-Kalyan)</option>
                    <option>Campus Infrastructure & Wi-Fi</option>
                    <option>General Public Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Detailed Description *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your issue or grievance in detail..."
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-gec-blue focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gec-blue hover:bg-sky-900 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Grievance to Committee</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
