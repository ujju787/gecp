import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Users, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Calendar,
  GraduationCap,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export default function ApprovalDesk({ currentUser, onLogout }) {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingStudents();
      setPendingStudents(data);
    } catch (err) {
      console.error('Failed to fetch pending students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (student) => {
    try {
      await api.approveStudent(student.id);
      
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      setActionSuccess(`Student ${student.name} (${student.rollNo}) has been APPROVED! They can now log in.`);
      fetchPending();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert('Approval failed: ' + (err.error || 'Server error'));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingStudent) return;
    try {
      await api.rejectStudent(rejectingStudent.id, rejectReason || 'Document mismatch');
      setActionSuccess(`Registration for ${rejectingStudent.name} was REJECTED.`);
      setRejectingStudent(null);
      setRejectReason('');
      fetchPending();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert('Rejection failed: ' + (err.error || 'Server error'));
    }
  };

  const filtered = pendingStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-gec-navy to-indigo-950 rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GEC Palamu Academic Council • {currentUser?.role === 'hod' ? 'HOD Department Approval Desk' : currentUser?.role === 'faculty' ? 'Faculty Verification Desk' : 'Institutional Approval Desk'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Student Registration & Verification Desk
              </h1>

              <p className="text-sm text-sky-100 leading-relaxed font-light">
                Review newly registered engineering students, verify university roll numbers against JCECEB state allotment records, and approve portal access.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-300">
                <span>Auditing Officer: <strong>{currentUser?.name || 'Dr. Sanjay Kumar Singh'}</strong> ({currentUser?.role === 'hod' ? 'Head of Department (HOD - CSE)' : currentUser?.role === 'faculty' ? 'Subject Teacher / Faculty' : 'Principal / Admin'})</span>
                <span>•</span>
                <span>Pending in Queue: <strong>{pendingStudents.length} Applicants</strong></span>
              </div>
            </div>

            {onLogout && (
              <div className="shrink-0 self-start md:self-center">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 border border-rose-400/40"
                  title="Sign out of administrative session"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            )}
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Desk Header & Search Filter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Awaiting Verification Queue</h2>
              <p className="text-xs text-slate-500">Approvals grant access to the student dashboard & smart attendance terminal</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-gec-blue focus:outline-none"
            />
          </div>
        </div>

        {/* Student Verification Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-gec-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Loading pending registrations from database...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800">All Student Registrations are Cleared!</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are currently no pending student verification requests in the queue.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const sampleRoll = `24/CSE/${Math.floor(100 + Math.random() * 899)}`;
                    await api.register({
                      name: "Anjali Kumari",
                      email: `anjali.${Date.now().toString().slice(-4)}@gecpalamu.ac.in`,
                      password: "Student@123",
                      rollNo: sampleRoll,
                      regNo: `JUT/2024/${sampleRoll}`,
                      branch: "Computer Science & Engineering",
                      semester: "1st Semester"
                    });
                    setActionSuccess("Generated test pending registration for Anjali Kumari!");
                    fetchPending();
                  } catch (e) {
                    alert('Error creating sample applicant: ' + (e.error || e.message));
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Test Pending Applicant</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Student Profile</th>
                    <th className="p-4">Roll & JUT Reg</th>
                    <th className="p-4">Discipline & Sem</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                            alt={student.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                            <div className="text-[11px] text-slate-500">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-semibold">
                        <div className="text-gec-blue font-bold">{student.rollNo}</div>
                        <div className="text-[10px] text-slate-400">{student.regNo || 'JUT Pending'}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{student.branch}</div>
                        <div className="text-[11px] text-gec-orange">{student.semester}</div>
                      </td>

                      <td className="p-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center justify-center gap-1 w-28 mx-auto">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(student)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-105"
                            title="Approve Student Account"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => setRejectingStudent(student)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all"
                            title="Reject Registration"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Reject Reason Modal */}
      {rejectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Reject Registration for {rejectingStudent.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify the discrepancy or reason for rejection. The applicant will be informed upon attempting login.
            </p>

            <textarea
              rows="3"
              placeholder="e.g. Roll number not found in JCECEB merit allotment list..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            ></textarea>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectingStudent(null)}
                className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
