import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Building, 
  MapPin, 
  Globe, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  X, 
  UserPlus,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALUMNI_MEMBERS } from '../../data/alumniData';
import { getMentorshipRequests, sendMentorshipRequest, getStudentData } from '../../utils/storage';

export default function AlumniDirectory() {
  const [alumniList, setAlumniList] = useState(ALUMNI_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [mentoringOnly, setMentoringOnly] = useState(false);

  // Modals state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Mentorship request form state
  const [mentorshipTopic, setMentorshipTopic] = useState('Off-Campus Tech Placements');
  const [studentMessage, setStudentMessage] = useState('');

  // Join directory form state
  const [joinName, setJoinName] = useState('');
  const [joinBranch, setJoinBranch] = useState('CSE');
  const [joinRole, setJoinRole] = useState('');
  const [joinCompany, setJoinCompany] = useState('');
  const [joinLocation, setJoinLocation] = useState('');

  const branches = ['All', 'Computer Science & Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'];

  const filteredAlumni = alumniList.filter(item => {
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.currentRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || item.branch === selectedBranch;
    const matchesMentoring = !mentoringOnly || item.mentoringAvailable;
    return matchesQuery && matchesBranch && matchesMentoring;
  });

  const handleSendMentorship = (e) => {
    e.preventDefault();
    const currentStudent = getStudentData();
    const studentName = currentStudent?.name ? `${currentStudent.name} (${currentStudent.rollNo || 'Student'})` : "GEC Palamu Student";

    const req = {
      id: `req-${Date.now()}`,
      mentorName: selectedMentor.name,
      mentorCompany: selectedMentor.company,
      studentName,
      topic: mentorshipTopic,
      message: studentMessage,
      date: new Date().toLocaleDateString()
    };

    sendMentorshipRequest(req);
    setSelectedMentor(null);
    setStudentMessage('');

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    setFeedbackSuccess(`Mentorship inquiry delivered to ${selectedMentor.name}! You will receive meeting details on your student email.`);
    setTimeout(() => setFeedbackSuccess(''), 5000);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinName.trim() || !joinCompany.trim()) return;

    const newMember = {
      id: `alm-${Date.now()}`,
      name: joinName.trim(),
      batch: "2022 - 2026",
      branch: joinBranch === 'CSE' ? 'Computer Science & Engineering' : 
              joinBranch === 'ME' ? 'Mechanical Engineering' : 
              joinBranch === 'CE' ? 'Civil Engineering' : 'Electrical Engineering',
      currentRole: joinRole || 'Software Engineer',
      company: joinCompany.trim(),
      location: joinLocation || 'India',
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      linkedin: "https://linkedin.com",
      mentoringAvailable: true,
      skills: ["Engineering", "Problem Solving"],
      bio: "Proud alumnus of Government Engineering College, Palamu."
    };

    setAlumniList([newMember, ...alumniList]);
    setShowJoinModal(false);

    confetti({
      particleCount: 60,
      spread: 70
    });

    setFeedbackSuccess(`Welcome to the official GEC Palamu Alumni Network, ${joinName}!`);
    setTimeout(() => setFeedbackSuccess(''), 5000);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-gec-navy to-sky-950 rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-bold border border-sky-400/30">
              <Users className="w-3.5 h-3.5" />
              <span>GEC Palamu Global Alumni Association</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Connect With Seniors, Industry Leaders & Mentors
            </h1>

            <p className="text-sm text-sky-100 leading-relaxed font-light">
              Our graduates are innovating at top tech firms, heavy engineering plants, state electricity boards, and public sector undertakings. Connect for mock interviews, career guidance, and referral opportunities.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gec-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Official Alumni Network</span>
              </button>
              <span className="text-xs text-sky-200">
                Verified Directory Members: <strong>320+ Pioneers</strong>
              </span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Feedback Alert */}
        {feedbackSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search alumni by name, company (e.g. Google, Tata Steel, L&T, TCS), or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gec-blue focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-100 px-3 py-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={mentoringOnly}
                  onChange={(e) => setMentoringOnly(e.target.checked)}
                  className="rounded text-gec-blue focus:ring-0"
                />
                <span>Mentoring Available</span>
              </label>
            </div>

          </div>

          {/* Branch Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
            {branches.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBranch === b
                    ? 'bg-gec-blue text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'All' ? 'All Branches' : b.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Alumni Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alum) => (
            <div 
              key={alum.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={alum.avatar}
                    alt={alum.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{alum.name}</h3>
                    <div className="text-xs font-semibold text-gec-orange">{alum.currentRole}</div>
                    <div className="text-xs font-bold text-gec-blue flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{alum.company}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 py-2 border-y border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{alum.location}</span>
                  </div>
                  <div>
                    Branch: <strong className="text-slate-700">{alum.branch}</strong> ({alum.batch})
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3 font-light">
                  "{alum.bio}"
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {alum.skills.map((s, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={alum.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-sky-600 transition-colors p-1"
                  title="View Professional Profile"
                >
                  <Globe className="w-4 h-4" />
                </a>

                {alum.mentoringAvailable ? (
                  <button
                    onClick={() => setSelectedMentor(alum)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Request Mentorship</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Mentorship Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Request Mentorship Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gec-orange uppercase">1-on-1 Alumni Guidance</span>
                <h3 className="text-sm font-bold text-slate-900">Request Mentorship with {selectedMentor.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedMentor(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMentorship} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">{selectedMentor.name}</div>
                <div className="text-slate-500">{selectedMentor.currentRole} at {selectedMentor.company}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Mentorship Topic</label>
                <select
                  value={mentorshipTopic}
                  onChange={(e) => setMentorshipTopic(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option>Off-Campus Tech Placements & Referrals</option>
                  <option>Resume & Portfolio Review</option>
                  <option>Mock Technical & HR Interview</option>
                  <option>GATE & Public Sector (PSU) Preparation</option>
                  <option>Core Engineering Career Guidance</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brief Note / Question for Senior *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Hi! I am a 3rd year CSE student at GEC Palamu. I would love 20 minutes of your time to review my resume for cloud engineering roles..."
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gec-blue"
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gec-blue text-white rounded-lg font-bold hover:bg-sky-900 shadow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Alumni Network Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Join Official Alumni Directory</h3>
                <p className="text-[11px] text-slate-500">Stay connected with your alma mater, GEC Palamu</p>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gec-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Branch</label>
                  <select
                    value={joinBranch}
                    onChange={(e) => setJoinBranch(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                    <option value="EE">Electrical</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passout Year</label>
                  <input type="text" defaultValue="2026" className="w-full p-2.5 border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Organization / Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Steel / Cognizant / Indian Railways"
                  value={joinCompany}
                  onChange={(e) => setJoinCompany(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Engineer"
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Ranchi / Bangalore"
                    value={joinLocation}
                    onChange={(e) => setJoinLocation(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gec-blue text-white rounded-lg font-bold hover:bg-sky-900 transition-all shadow"
                >
                  Register as Alumnus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
