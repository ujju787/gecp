import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Users, 
  Award, 
  Sparkles,
  MapPin,
  Clock,
  Send,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PLACEMENT_STATS, UPCOMING_DRIVES, LIVE_INTERNSHIPS, RECRUITERS } from '../../data/placementData';
import { getInternshipApplications, applyInternship } from '../../utils/storage';

export default function PlacementOverview() {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'internships' | 'recruiters' | 'stats'
  const [appliedList, setAppliedList] = useState(getInternshipApplications());
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState('');

  const handleApply = (item) => {
    const updated = applyInternship(item.id);
    setAppliedList(updated);
    setSelectedOpportunity(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    setApplicationSuccess(`Application submitted successfully for ${item.company}! Your T&P profile has been forwarded.`);
    setTimeout(() => setApplicationSuccess(''), 5000);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* T&P Header Banner */}
        <div className="bg-gradient-to-r from-gec-navy via-gec-blue to-sky-900 rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Training & Placement Cell • GEC Palamu</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Empowering Careers with Premier Industry Opportunities
            </h1>

            <p className="text-sm text-sky-100 leading-relaxed font-light">
              The Training and Placement Cell of Government Engineering College, Palamu bridges students with global tech enterprises, heavy engineering conglomerates, and national PSUs.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-sky-200">
              <span>TPO Office: <strong>placement@gecpalamu.ac.in</strong></span>
              <span>•</span>
              <span>Training In-charge: <strong>Dr. R. N. Pathak</strong></span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Success Alert */}
        {applicationSuccess && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{applicationSuccess}</span>
          </div>
        )}

        {/* Placement Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Package</div>
            <div className="text-2xl sm:text-3xl font-black text-gec-navy mt-1">{PLACEMENT_STATS.highestPackage}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Leading Cloud Architect Role</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Package</div>
            <div className="text-2xl sm:text-3xl font-black text-gec-navy mt-1">{PLACEMENT_STATS.averagePackage}</div>
            <div className="text-[11px] text-slate-500 mt-1">Across 4 Engineering Branches</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Rate</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{PLACEMENT_STATS.placementRate}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Graduating Batch Record</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Recruiters</div>
            <div className="text-2xl sm:text-3xl font-black text-gec-orange mt-1">{PLACEMENT_STATS.visitingCompanies}</div>
            <div className="text-[11px] text-slate-500 mt-1">Yash India, TCS & Infosys</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 space-x-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('drives')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'drives'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Upcoming Campus Drives ({UPCOMING_DRIVES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('internships')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'internships'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Live Internship Opportunities ({LIVE_INTERNSHIPS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Branch-Wise Placement Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'recruiters'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Top Visiting Recruiters</span>
          </button>
        </div>

        {/* Tab 1: Campus Drives */}
        {activeTab === 'drives' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {UPCOMING_DRIVES.map((drive) => {
              const isApplied = appliedList.includes(drive.id);
              return (
                <div 
                  key={drive.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${drive.color} text-white font-extrabold text-sm flex items-center justify-center shadow-md`}>
                          {drive.logoText}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{drive.company}</h3>
                          <div className="text-xs text-gec-orange font-semibold">{drive.role}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {drive.type}
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Offered CTC:</span>
                        <span className="font-extrabold text-emerald-700">{drive.package}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Eligibility:</span>
                        <span className="font-semibold text-slate-800 text-right">{drive.eligibility}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Drive Date:</span>
                        <span className="font-semibold text-slate-800">{drive.driveDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Apply Deadline:</span>
                        <span className="font-semibold text-rose-600">{drive.registrationDeadline}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                      {drive.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <span className="text-[11px] text-slate-400">
                      Openings: <strong className="text-slate-700">{drive.openPositions} seats</strong>
                    </span>

                    {isApplied ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedOpportunity(drive)}
                        className="px-4 py-2 rounded-lg bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Register for Drive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Internships */}
        {activeTab === 'internships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIVE_INTERNSHIPS.map((item) => {
              const isApplied = appliedList.includes(item.id);
              return (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gec-orange">{item.company}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.applyStatus}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-2">{item.role}</h4>

                    <div className="space-y-1.5 text-xs text-slate-600 py-2">
                      <div className="flex justify-between">
                        <span>Monthly Stipend:</span>
                        <strong className="text-emerald-700">{item.stipend}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{item.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eligible Branches:</span>
                        <strong className="text-gec-blue">{item.branches.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-rose-600 font-semibold">
                      Deadline: {item.deadline}
                    </span>

                    {isApplied ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedOpportunity(item)}
                        className="px-4 py-1.5 rounded-lg bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 transition-colors"
                      >
                        Apply for Internship
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Branch Analytics */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-gec-navy mb-4">Branch-Wise Placement Record (2025-26)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Discipline</th>
                    <th className="p-3 text-center">Placed Percentage</th>
                    <th className="p-3 text-center">Average Package</th>
                    <th className="p-3 text-center">Highest Package</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {PLACEMENT_STATS.branchStats.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{b.branch}</td>
                      <td className="p-3 text-center font-extrabold text-emerald-700">{b.placed}%</td>
                      <td className="p-3 text-center font-semibold">{b.avgPackage}</td>
                      <td className="p-3 text-center font-bold text-gec-navy">{b.highest}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Exceeded Benchmark
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Recruiters */}
        {activeTab === 'recruiters' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {RECRUITERS.map((r, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gec-blue/10 text-gec-blue flex items-center justify-center font-black text-base mb-3">
                    {r.name.slice(0, 4).toUpperCase()}
                  </div>
                  <div className="font-bold text-sm text-slate-900">{r.name}</div>
                  <div className="text-xs text-gec-orange font-medium mt-1">{r.category}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Campus Hiring Partner</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 1-Click Application Confirmation Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-gec-orange uppercase tracking-wider">
                  Campus Placement Portal
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Confirm Application for {selectedOpportunity.company}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOpportunity(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Your academic resume, verified CGPA, and institutional email will be submitted directly to the corporate recruitment coordinator for shortlisting.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mb-5">
              <div><strong>Role:</strong> {selectedOpportunity.role}</div>
              <div><strong>Stipend / CTC:</strong> {selectedOpportunity.package || selectedOpportunity.stipend}</div>
              <div><strong>Drive / Joining:</strong> {selectedOpportunity.driveDate || selectedOpportunity.duration}</div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApply(selectedOpportunity)}
                className="px-5 py-2 rounded-lg bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 shadow-sm transition-all"
              >
                Confirm & Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
