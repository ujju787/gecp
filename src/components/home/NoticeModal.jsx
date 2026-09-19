import React from 'react';
import { FileText, Download, Calendar, Tag, X, Printer, CheckCircle } from 'lucide-react';
import { COLLEGE_INFO } from '../../data/collegeData';

export default function NoticeModal({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-gec-navy to-gec-blue text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider">Official Institutional Notice</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Category: {notice.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date: {notice.date}</span>
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            {notice.title}
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Circular Details:</div>
            <p>
              {notice.description || "This circular is issued in accordance with the Jharkhand University of Technology (JUT) and Department of Higher and Technical Education directives. All concerned students and staff members are advised to take note and comply accordingly."}
            </p>
            {notice.refNo && (
              <div className="font-mono text-slate-600 pt-2 border-t border-slate-200">
                Tender Ref Number: <strong>{notice.refNo}</strong> • Last Submission Date: <strong className="text-rose-600">{notice.lastDate}</strong>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Signed & Authorized by the Academic In-Charge & Principal, Government Engineering College, Palamu.
            </span>
          </div>

        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-400">File: {notice.file || 'GECP_Notice_2026.pdf'}</span>
          <div className="flex gap-2">
            <button
              onClick={() => alert(`Downloading official PDF copy: ${notice.file || 'GECP_Notice.pdf'}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
