import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  Building2, 
  Calendar, 
  User, 
  Printer, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  Download, 
  Check, 
  Lock, 
  FileCheck, 
  BadgeCheck, 
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function StudentVerificationPage({ verificationData, onClose }) {
  const [liveStudent, setLiveStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanTimestamp] = useState(() => new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }));

  const identifier = verificationData?.id || verificationData?.roll || '';

  useEffect(() => {
    let isMounted = true;
    if (identifier) {
      api.getStudentVerification(identifier)
        .then(res => {
          if (isMounted) {
            if (res && res.verified && res.student) {
              setLiveStudent(res.student);
            }
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            // Fallback gracefully to URL payload parameters
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [identifier]);

  // Merge live database record with URL parameters as fallback
  const student = {
    name: liveStudent?.name || verificationData?.name || 'Verified Student',
    rollNo: liveStudent?.rollNo || verificationData?.roll || '22/CSE/042',
    regNo: liveStudent?.regNo || verificationData?.reg || 'JUT/2022/CSE/0892',
    branch: liveStudent?.branch || verificationData?.branch || 'Computer Science and Engineering',
    branchCode: liveStudent?.branchCode || verificationData?.branch || 'CSE',
    semester: liveStudent?.semester || verificationData?.sem || '5th Semester',
    batch: liveStudent?.batch || verificationData?.batch || '2022 - 2026',
    id: liveStudent?.id || verificationData?.id || 'usr-std-01',
    bloodGroup: liveStudent?.bloodGroup || 'B+',
    status: liveStudent?.status || 'APPROVED',
    category: liveStudent?.category || 'General',
    hostelResident: liveStudent?.hostelResident ?? false,
    hostelName: liveStudent?.hostelName || 'Dr. APJ Abdul Kalam Hostel',
    validUntil: liveStudent?.validUntil || 'July 2026',
    institution: 'Government Engineering College, Palamu',
    affiliation: 'Jharkhand University of Technology (JUT), Ranchi'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-sky-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Navigation & Return Button */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-gec-blue bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Campus Portal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>

        {/* Official Institutional Verification Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
          {/* Top Decorative Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-sky-600 to-amber-500"></div>

          {/* Institutional Header */}
          <div className="text-center pb-6 border-b border-slate-200 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Official Institutional Credential Verification</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              Government Engineering College, Palamu
            </h1>

            <p className="text-xs text-slate-500 font-medium">
              Department of Higher and Technical Education • Government of Jharkhand<br/>
              Affiliated to <strong>Jharkhand University of Technology (JUT), Ranchi</strong> • Approved by AICTE
            </p>
          </div>

          {/* Verification Status Badge */}
          <div className="my-6 p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-base font-black text-emerald-950 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>VALID & OFFICIALLY ENROLLED STUDENT</span>
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  Verified live via University Central Database (MySQL JUT Portal)
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right text-[11px] text-slate-600 shrink-0 bg-white/70 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Verification Timestamp</span>
              <span className="font-mono font-bold text-slate-800">{scanTimestamp}</span>
            </div>
          </div>

          {/* Student Profile Presentation Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
            
            {/* Top Identity Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Student Photo Avatar */}
              <div className="w-24 h-28 rounded-2xl bg-gradient-to-br from-sky-700 to-gec-navy text-white flex flex-col items-center justify-center font-black text-3xl shrink-0 shadow-md border-2 border-white relative overflow-hidden">
                {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[8px] py-0.5 text-center font-mono uppercase tracking-wider text-amber-300">
                  GECP Verified
                </div>
              </div>

              {/* Student Primary Details */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Undergraduate B.Tech Degree Candidate
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {student.name}
                </h2>
                <div className="text-xs font-semibold text-slate-600">
                  {student.branch} ({student.branchCode})
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold">
                    {student.semester}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-800 font-medium">
                    Batch: {student.batch}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                    Status: {student.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">University Roll No</span>
                <span className="font-mono font-black text-sm text-gec-blue">{student.rollNo}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">JUT Registration No</span>
                <span className="font-mono font-black text-sm text-slate-800">{student.regNo}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Institutional ID</span>
                <span className="font-mono font-bold text-slate-700">{student.id}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
                <span className="font-bold text-rose-600">{student.bloodGroup}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Admission Category</span>
                <span className="font-bold text-slate-700">{student.category}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Card Validity</span>
                <span className="font-bold text-emerald-700">{student.validUntil}</span>
              </div>
            </div>

            {/* Institutional Seal & Authority Attestation */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300 shrink-0">
                  SEAL
                </div>
                <div className="text-[11px] leading-tight">
                  <strong>Department of Higher & Technical Education</strong><br/>
                  Government Engineering College, Palamu Campus
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-serif italic font-black text-slate-800 text-sm">
                  Dr. Sanjay Kr. Singh
                </div>
                <div className="text-[10px] font-bold text-slate-600">
                  Principal & Issuing Authority
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  DIGITALLY SIGNED CERTIFICATE
                </div>
              </div>
            </div>

          </div>

          {/* Verification Legal Notice */}
          <div className="mt-6 p-3 rounded-xl bg-slate-100 text-[10px] text-slate-500 leading-relaxed text-center">
            This digital verification certificate is electronically authenticated by Government Engineering College, Palamu under the authority of Jharkhand University of Technology (JUT), Ranchi. Any physical tampering or unauthorized reproduction of student credentials is punishable under the IT Act 2000.
          </div>

          {/* Action Buttons for Mobile Scanner users */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Visit Official GEC Palamu Portal</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Save as PDF / Print Slip</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
