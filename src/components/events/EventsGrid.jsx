import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  X, 
  Ticket, 
  Printer, 
  QrCode,
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  AlertCircle, 
  FileSpreadsheet,
  Flame,
  Hourglass,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CAMPUS_EVENTS } from '../../data/eventsData';
import { api } from '../../services/api';
import { getEventRegistrations, registerForEvent as saveLocalRegistration } from '../../utils/storage';
import { printEventPass } from '../../utils/printDocument';

// Utility: Parse date (YYYY-MM-DD) and time (e.g. "02:00 PM") into a precise Date object
function parseEventDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const cleanDate = String(dateStr).split('T')[0].trim();
  const parts = cleanDate.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  const [year, month, day] = parts;
  let hours = 9;
  let minutes = 0;
  if (timeStr) {
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }
  return new Date(year, month - 1, day, hours, minutes, 0);
}

// Utility: Calculate remaining time breakdown from current moment
function getRemainingTimeBreakdown(targetDate) {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true, totalMs: 0 };
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true, totalMs: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isPassed: false, totalMs: diff };
}

// Utility: Format human-readable remaining time pill for event cards
function formatCardRemainingTime(eventDateObj) {
  if (!eventDateObj) return null;
  const now = Date.now();
  const diffMs = eventDateObj.getTime() - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMs < -24 * 60 * 60 * 1000) {
    return {
      status: 'concluded',
      badge: '✓ Concluded',
      style: 'bg-slate-100 text-slate-500 border-slate-200'
    };
  }

  if (diffHours >= -12 && diffHours <= 12) {
    return {
      status: 'today',
      badge: '🔥 Happening Today!',
      style: 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse'
    };
  }

  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      badge: '⚡ Starts Tomorrow!',
      style: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
    };
  }

  if (diffDays <= 7) {
    const hoursPart = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return {
      status: 'critical',
      badge: `⏱️ ${diffDays}d ${hoursPart}h Remaining`,
      style: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
    };
  }

  return {
    status: 'upcoming',
    badge: `🗓️ In ${diffDays} Days`,
    style: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold'
  };
}

export default function EventsGrid({ currentUser, studentData }) {
  // Role Detection
  const isHod = currentUser?.role === 'hod' || currentUser?.role === 'admin' || (currentUser?.email && (currentUser.email.toLowerCase().includes('hod') || currentUser.email.toLowerCase().includes('dr.')));
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'teacher';
  const isStaff = isHod || isFaculty;

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my-passes' | 'all-registrations'
  const [events, setEvents] = useState(CAMPUS_EVENTS);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Student identifier for isolation
  const studentIdentifier = currentUser?.id || currentUser?.email || studentData?.rollNo || 'guest-student';
  const [registrations, setRegistrations] = useState(() => getEventRegistrations(studentIdentifier));
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredPass, setRegisteredPass] = useState(null);

  // HOD / Staff Registered Students Modal State
  const [selectedEventForView, setSelectedEventForView] = useState(null);
  const [eventRegistrationsList, setEventRegistrationsList] = useState([]);
  const [loadingRegistrationsList, setLoadingRegistrationsList] = useState(false);
  const [searchRegQuery, setSearchRegQuery] = useState('');

  // HOD Organize Event Modal State
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    tagline: '',
    category: 'Hackathon',
    badge: 'Department Event',
    date: '',
    time: '09:30 AM onwards',
    venue: 'Main Computing Center & Central Auditorium, GEC Palamu',
    prizePool: '₹25,000 Cash + Certificates',
    teamSize: '2 - 4 Members',
    registrationDeadline: '',
    tracks: 'AI & Machine Learning\nCyber Security & Cloud\nIoT & Embedded Systems\nOpen Innovation',
    rules: 'Valid College ID card mandatory.\nAll participants must register before the deadline.'
  });

  // Form State initialized with logged-in student details
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState(studentData?.name || currentUser?.name || '');
  const [leaderEmail, setLeaderEmail] = useState(currentUser?.email || studentData?.email || '');
  const [teamMembers, setTeamMembers] = useState('3');
  const [selectedTrack, setSelectedTrack] = useState('');

  // Load events from MySQL database
  const loadEventsFromDatabase = async () => {
    try {
      setLoadingEvents(true);
      const dbEvents = await api.getEvents();
      if (Array.isArray(dbEvents) && dbEvents.length > 0) {
        setEvents(dbEvents);
      } else {
        setEvents(CAMPUS_EVENTS);
      }
    } catch (e) {
      console.warn('Could not load events from MySQL, using fallback:', e);
      setEvents(CAMPUS_EVENTS);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load registered passes
  const loadRegistrations = async () => {
    if (isStaff) {
      try {
        const allList = await api.getEventRegistrations();
        if (Array.isArray(allList)) {
          setAllRegistrations(allList);
        }
      } catch (e) {
        console.warn('Could not load staff registrations:', e);
      }
    } else {
      try {
        const myPasses = await api.getMyEventRegistrations(studentIdentifier);
        if (Array.isArray(myPasses) && myPasses.length > 0) {
          setRegistrations(myPasses);
        } else {
          setRegistrations(getEventRegistrations(studentIdentifier));
        }
      } catch {
        setRegistrations(getEventRegistrations(studentIdentifier));
      }
    }
  };

  useEffect(() => {
    loadEventsFromDatabase();
    loadRegistrations();
  }, [currentUser, studentData]);

  // Keep leader form synced when student profile changes
  useEffect(() => {
    if (studentData?.name || currentUser?.name) {
      setLeaderName(studentData?.name || currentUser?.name);
    }
    if (currentUser?.email || studentData?.email) {
      setLeaderEmail(currentUser?.email || studentData?.email);
    }
  }, [currentUser, studentData]);

  // Real live countdown & nearest event tracking
  const [nowTime, setNowTime] = useState(Date.now());
  const [selectedHeroEventId, setSelectedHeroEventId] = useState(null);
  const [eventFilter, setEventFilter] = useState('upcoming'); // 'upcoming' | 'all' | 'hackathon' | 'workshop' | 'cultural'

  // Live timer tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Processed events with parsed dates and chronological status
  const processedEvents = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return events.map(evt => {
      const eventDateObj = parseEventDateTime(evt.date, evt.time);
      const deadlineDateObj = parseEventDateTime(evt.registrationDeadline || evt.date, '11:59 PM');
      const eventTimeMs = eventDateObj ? eventDateObj.getTime() : 0;
      const isUpcoming = eventTimeMs >= (todayStart.getTime() - 24 * 60 * 60 * 1000);
      const timeRemaining = formatCardRemainingTime(eventDateObj);

      return {
        ...evt,
        eventDateObj,
        deadlineDateObj,
        eventTimeMs,
        isUpcoming,
        timeRemaining
      };
    });
  }, [events, nowTime]);

  // Nearly dated upcoming events sorted chronologically (earliest/nearest date first!)
  const upcomingEvents = useMemo(() => {
    return processedEvents
      .filter(e => e.isUpcoming)
      .sort((a, b) => a.eventTimeMs - b.eventTimeMs);
  }, [processedEvents]);

  // Nearest upcoming event is the primary featured event
  const nearestUpcomingEvent = upcomingEvents[0] || processedEvents[0] || null;

  // Active featured hero event
  const featuredEvent = (selectedHeroEventId && processedEvents.find(e => e.id === selectedHeroEventId)) || nearestUpcomingEvent;

  // Live countdown to featured event kickoff
  const countdown = useMemo(() => {
    if (!featuredEvent || !featuredEvent.eventDateObj) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }
    return getRemainingTimeBreakdown(featuredEvent.eventDateObj);
  }, [featuredEvent, nowTime]);

  // Filtered events based on user selection
  const visibleEvents = useMemo(() => {
    let list = processedEvents;
    if (eventFilter === 'upcoming') {
      // Default: "only latest frequent and as of nearly dated events"
      list = upcomingEvents;
    } else if (eventFilter === 'hackathon') {
      list = processedEvents.filter(e => (e.category || '').toLowerCase().includes('hack'));
    } else if (eventFilter === 'workshop') {
      list = processedEvents.filter(e => (e.category || '').toLowerCase().includes('work') || (e.category || '').toLowerCase().includes('symp'));
    } else if (eventFilter === 'cultural') {
      list = processedEvents.filter(e => (e.category || '').toLowerCase().includes('cult') || (e.category || '').toLowerCase().includes('fest'));
    } else {
      // 'all': sort upcoming first chronologically, then concluded
      list = [...processedEvents].sort((a, b) => {
        if (a.isUpcoming && !b.isUpcoming) return -1;
        if (!a.isUpcoming && b.isUpcoming) return 1;
        return a.eventTimeMs - b.eventTimeMs;
      });
    }
    return list;
  }, [processedEvents, upcomingEvents, eventFilter]);

  // Open Registered Students List for an Event (HOD / Faculty View)
  const handleOpenRegisteredStudents = async (evt) => {
    setSelectedEventForView(evt);
    setSearchRegQuery('');
    try {
      setLoadingRegistrationsList(true);
      const list = await api.getEventRegistrations(evt.id);
      setEventRegistrationsList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load event registrations:', err);
      // fallback to localStorage
      const allLocal = getEventRegistrations();
      const matched = allLocal.filter(r => r.eventId === evt.id);
      setEventRegistrationsList(matched);
    } finally {
      setLoadingRegistrationsList(false);
    }
  };

  // Student Registration Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const pass = {
      ticketId: `PASS-GECP-${Math.floor(100000 + Math.random() * 900000)}`,
      studentId: currentUser?.id || studentData?.id || 'usr-std-01',
      rollNo: studentData?.rollNo || currentUser?.rollNo || '22/CSE/042',
      studentName: studentData?.name || leaderName.trim() || 'Student',
      branch: studentData?.branch || 'Computer Science & Engineering',
      semester: studentData?.semester || '5th Sem',
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      date: selectedEvent.date,
      venue: selectedEvent.venue,
      teamName: teamName.trim(),
      leaderName: leaderName.trim(),
      leaderEmail: leaderEmail.trim(),
      teamSize: teamMembers,
      track: selectedTrack || selectedEvent.tracks[0],
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
      // 1. Save to MySQL database
      await api.registerForEvent(pass);
    } catch (err) {
      console.warn('Backend event registration notification:', err?.message || err);
    }

    // 2. Also keep local storage synchronized
    saveLocalRegistration(pass);
    
    // Reload registrations
    await loadRegistrations();
    await loadEventsFromDatabase();

    setSelectedEvent(null);
    setRegisteredPass(pass);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });

    setStatusMessage(`🎉 Successfully registered for ${pass.eventTitle}! Official Digital Pass generated.`);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  // HOD: Organize New Event Handler
  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.venue.trim()) {
      alert('Event Title, Date, and Venue are required.');
      return;
    }

    try {
      setSubmittingEvent(true);
      const tracksArr = newEvent.tracks
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const rulesArr = newEvent.rules
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      const payload = {
        title: newEvent.title.trim(),
        tagline: newEvent.tagline.trim() || 'Official Campus Event',
        category: newEvent.category,
        badge: newEvent.badge,
        date: newEvent.date,
        time: newEvent.time.trim() || '10:00 AM onwards',
        venue: newEvent.venue.trim(),
        prizePool: newEvent.prizePool.trim() || 'Certificate of Merit',
        teamSize: newEvent.teamSize.trim() || 'Individual / Team',
        registrationDeadline: newEvent.registrationDeadline || newEvent.date,
        tracks: tracksArr.length > 0 ? tracksArr : ['General Innovation Track'],
        organizerName: isHod ? `HOD ${currentUser?.name || 'Department Head'} & Department of ${currentUser?.department || currentUser?.branch || 'Engineering'}` : `${currentUser?.department || 'Department of Engineering'}, GEC Palamu`,
        createdBy: currentUser?.id || 'usr-fac-hod'
      };

      await api.createEvent(payload);
      await loadEventsFromDatabase();
      setIsOrganizeModalOpen(false);

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 }
      });

      setStatusMessage(`🏛️ New event "${payload.title}" successfully organized and published for all students!`);
      setTimeout(() => setStatusMessage(''), 6000);

      // Reset form
      setNewEvent({
        title: '',
        tagline: '',
        category: 'Hackathon',
        badge: 'Department Event',
        date: '',
        time: '09:30 AM onwards',
        venue: 'Main Computing Center & Central Auditorium, GEC Palamu',
        prizePool: '₹25,000 Cash + Certificates',
        teamSize: '2 - 4 Members',
        registrationDeadline: '',
        tracks: 'AI & Machine Learning\nCyber Security & Cloud\nIoT & Embedded Systems\nOpen Innovation',
        rules: 'Valid College ID card mandatory.\nAll participants must register before the deadline.'
      });
    } catch (err) {
      alert(`Failed to create event: ${err.message || err.error || 'Server error'}`);
    } finally {
      setSubmittingEvent(false);
    }
  };

  // HOD: Delete Event Handler
  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to remove the event "${eventTitle}"? All associated student registrations will also be purged from the database.`)) {
      return;
    }
    try {
      await api.deleteEvent(eventId);
      await loadEventsFromDatabase();
      setStatusMessage(`🗑️ Event "${eventTitle}" has been removed from the database.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert(`Failed to delete event: ${err.message || err}`);
    }
  };

  const isAlreadyRegistered = (eventId) => {
    return registrations.some(r => r.eventId === eventId);
  };

  // Filtered registrations in HOD/Staff modal
  const filteredEventRegistrations = eventRegistrationsList.filter(reg => {
    if (!searchRegQuery.trim()) return true;
    const q = searchRegQuery.toLowerCase();
    return (
      (reg.rollNo && reg.rollNo.toLowerCase().includes(q)) ||
      (reg.studentName && reg.studentName.toLowerCase().includes(q)) ||
      (reg.leaderName && reg.leaderName.toLowerCase().includes(q)) ||
      (reg.teamName && reg.teamName.toLowerCase().includes(q)) ||
      (reg.branch && reg.branch.toLowerCase().includes(q)) ||
      (reg.leaderEmail && reg.leaderEmail.toLowerCase().includes(q)) ||
      (reg.track && reg.track.toLowerCase().includes(q))
    );
  });

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Status Notification */}
        {statusMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Banner with Live Nearest Event Countdown */}
        {featuredEvent && (
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-gec-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-10 relative overflow-hidden border border-purple-800/40">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{featuredEvent.id === nearestUpcomingEvent?.id ? '⚡ Nearest Upcoming Campus Event' : 'Featured Campus Showcase'}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {featuredEvent.badge || featuredEvent.category}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  {featuredEvent.title}
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed font-light line-clamp-2">
                  {featuredEvent.tagline || featuredEvent.description || 'Official competitive tech, hackathon and innovation summit organized at GEC Palamu.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-purple-200">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <strong className="text-amber-300">{featuredEvent.prizePool}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span>{featuredEvent.date} {featuredEvent.time ? `• ${featuredEvent.time}` : ''}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="truncate max-w-[200px]">{featuredEvent.venue}</span>
                  </span>
                </div>
              </div>

              {/* Real Live Countdown Box */}
              <div className="lg:col-span-5 bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-purple-500/30 text-center backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
                  <Timer className="w-4 h-4 animate-pulse text-amber-400" />
                  <span>{countdown.isPassed ? 'Event In Session' : 'Kickoff Countdown'}</span>
                  <span className="text-[10px] text-slate-400 lowercase font-normal">({featuredEvent.date})</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80 shadow-inner">
                    <div className="text-2xl font-black text-white">{countdown.days}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Days</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80 shadow-inner">
                    <div className="text-2xl font-black text-white">{countdown.hours}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Hours</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80 shadow-inner">
                    <div className="text-2xl font-black text-white">{countdown.minutes}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Mins</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80 shadow-inner">
                    <div className="text-2xl font-black text-amber-400">{countdown.seconds}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Secs</div>
                  </div>
                </div>

                {/* Upcoming Events Switcher Chips */}
                {upcomingEvents.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-left">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Other Nearly Dated Events:</span>
                      </span>
                      <span className="text-amber-400 font-semibold">{upcomingEvents.length} Active</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                      {upcomingEvents.map(ue => {
                        const isSelected = (featuredEvent.id === ue.id);
                        const rTime = getRemainingTimeBreakdown(ue.eventDateObj);
                        return (
                          <button
                            key={ue.id}
                            onClick={() => setSelectedHeroEventId(ue.id)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                            }`}
                          >
                            <span>{ue.title.length > 22 ? ue.title.substring(0, 22) + '...' : ue.title}</span>
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-950' : 'text-amber-400'}`}>
                              ({rTime.days}d {rTime.hours}h)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Button: Staff (HOD/Faculty) vs Students */}
                {isStaff ? (
                  isHod ? (
                    <button
                      onClick={() => setIsOrganizeModalOpen(true)}
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-gec-blue hover:from-indigo-600 hover:to-sky-900 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Organize New Campus Event</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('all-registrations')}
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Student Registrations Ledger</span>
                    </button>
                  )
                ) : (
                  (() => {
                    const isRegistered = isAlreadyRegistered(featuredEvent.id);
                    if (isRegistered) {
                      return (
                        <button
                          onClick={() => {
                            const pass = registrations.find(r => r.eventId === featuredEvent.id);
                            if (pass) setRegisteredPass(pass);
                          }}
                          className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>You Are Registered • View Entry Pass</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => {
                          setSelectedEvent(featuredEvent);
                          setSelectedTrack(featuredEvent.tracks?.[0] || 'General');
                        }}
                        className="mt-4 w-full py-2.5 bg-gradient-to-r from-gec-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Register For {featuredEvent.title.length > 28 ? featuredEvent.title.substring(0, 28) + '...' : featuredEvent.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    );
                  })()
                )}
              </div>

            </div>
          </div>
        )}

        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-gec-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({events.length})
            </button>

            {isStaff ? (
              <button
                onClick={() => {
                  setActiveTab('all-registrations');
                  loadRegistrations();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'all-registrations'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Student Registrations ({allRegistrations.length})</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('my-passes')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'my-passes'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>My Registered Passes ({registrations.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isHod && (
              <button
                onClick={() => setIsOrganizeModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>➕ Organize New Event</span>
              </button>
            )}

            <div className="text-xs text-slate-500">
              {isStaff ? (
                <span className="font-bold text-indigo-900">
                  {isHod ? '👑 HOD Executive Console • Event Management & Roster Authority' : '👨‍🏫 Faculty Console • Student Attendance & Registrations'}
                </span>
              ) : activeTab === 'my-passes' ? (
                <span>Passes registered for: <strong className="text-emerald-800">{studentData?.name || currentUser?.name || 'You'}</strong></span>
              ) : (
                <span>Instant Digital Entry Pass generation with gate QR verification</span>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: ALL EVENTS GRID */}
        {activeTab === 'all' && (
          <div>
            {/* Quick Filter Strip: Prioritizing Nearly Dated & Upcoming */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setEventFilter('upcoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  eventFilter === 'upcoming'
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>🔥 Nearly Dated & Upcoming ({upcomingEvents.length})</span>
              </button>

              <button
                onClick={() => setEventFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  eventFilter === 'all'
                    ? 'bg-gec-navy text-white border-gec-navy shadow-xs font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>All Events ({processedEvents.length})</span>
              </button>

              <button
                onClick={() => setEventFilter('workshop')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  eventFilter === 'workshop'
                    ? 'bg-gec-navy text-white border-gec-navy shadow-xs font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Workshops & Seminars
              </button>

              <button
                onClick={() => setEventFilter('hackathon')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  eventFilter === 'hackathon'
                    ? 'bg-gec-navy text-white border-gec-navy shadow-xs font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Hackathons & Tech
              </button>

              <button
                onClick={() => setEventFilter('cultural')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  eventFilter === 'cultural'
                    ? 'bg-gec-navy text-white border-gec-navy shadow-xs font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Cultural & Fests
              </button>
            </div>

            {loadingEvents ? (
              <div className="p-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gec-blue border-t-transparent rounded-full animate-spin"></div>
                <span>Loading campus events from institutional MySQL database...</span>
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No events found in this category</h4>
                <p className="text-xs text-slate-400">Try switching filters or check back soon for newly published events.</p>
                <button
                  onClick={() => setEventFilter('all')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  View All Campus Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleEvents.map((evt) => {
                  const registered = isAlreadyRegistered(evt.id);
                  const isCustomEvent = Boolean(evt.createdBy);

                  return (
                    <div 
                      key={evt.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-purple-100 text-purple-900">
                              {evt.category}
                            </span>
                            {evt.timeRemaining && (
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${evt.timeRemaining.style} flex items-center gap-1`}>
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{evt.timeRemaining.badge}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                              {evt.badge}
                            </span>
                            {isHod && (
                              <button
                                onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-1">{evt.title}</h3>
                        <p className="text-xs text-gec-orange font-semibold mb-3">{evt.tagline}</p>

                        <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                              <span className="font-semibold text-slate-800">{evt.date} • {evt.time}</span>
                            </div>
                            {evt.isUpcoming && (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                                {(() => {
                                  const b = getRemainingTimeBreakdown(evt.eventDateObj);
                                  if (b.isPassed) return 'Happening Today';
                                  if (b.days === 0) return `${b.hours}h ${b.minutes}m left`;
                                  return `${b.days}d ${b.hours}h remaining`;
                                })()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>{evt.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                            <strong className="text-emerald-700">{evt.prizePool}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500 shrink-0" />
                            <span>Team: {evt.teamSize}</span>
                          </div>
                        </div>

                        {/* Tracks list */}
                        <div className="mt-3">
                          <div className="text-[11px] font-bold text-slate-700 mb-1.5">Competition Tracks:</div>
                          <ul className="space-y-1 text-[11px] text-slate-600">
                            {(evt.tracks || []).slice(0, 3).map((tr, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-gec-blue shrink-0"></span>
                                <span className="truncate">{tr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Card Footer: Staff (HOD/Faculty) vs Students */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-slate-400">
                            Last Date: <strong className="text-rose-600">{evt.registrationDeadline}</strong>
                          </span>
                          {evt.deadlineDateObj && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {(() => {
                                const dl = getRemainingTimeBreakdown(evt.deadlineDateObj);
                                if (dl.isPassed) return <span className="text-slate-400">Reg. Closed</span>;
                                if (dl.days === 0) return <span className="text-rose-600 font-bold">⚠️ Closes in {dl.hours}h {dl.minutes}m</span>;
                                if (dl.days <= 5) return <span className="text-amber-600 font-bold">⏳ Closes in {dl.days} days</span>;
                                return <span>Closes in {dl.days} days</span>;
                              })()}
                            </span>
                          )}
                        </div>

                        {isStaff ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenRegisteredStudents(evt)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              title="View full list of registered students"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>View Registered Students ({evt.registeredCount || 0})</span>
                            </button>
                          </div>
                        ) : (
                          registered ? (
                            <button
                              onClick={() => {
                                const pass = registrations.find(r => r.eventId === evt.id);
                                if (pass) setRegisteredPass(pass);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>View Pass</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedEvent(evt);
                                setSelectedTrack(evt.tracks[0]);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <span>Register Online</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STAFF VIEW - ALL STUDENT REGISTRATIONS */}
        {activeTab === 'all-registrations' && isStaff && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-gec-navy flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>College Campus Event Registrations Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consolidated institutional registry of all students enrolled across hackathons, symposiums & workshops.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 font-extrabold border border-indigo-200">
                  Total Delegations: {allRegistrations.length}
                </span>
                <button
                  onClick={loadRegistrations}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {allRegistrations.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No Student Registrations Recorded Yet</p>
                <p className="mt-1">Students will appear here once they register for campus events.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">Event</th>
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Branch & Sem</th>
                      <th className="p-3">Team</th>
                      <th className="p-3">Track</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {allRegistrations.map((reg) => (
                      <tr key={reg.ticketId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-600">{reg.ticketId}</td>
                        <td className="p-3 font-bold text-slate-900">{reg.eventTitle}</td>
                        <td className="p-3 font-mono font-bold text-gec-blue">{reg.rollNo}</td>
                        <td className="p-3 font-bold text-slate-900">{reg.studentName || reg.leaderName}</td>
                        <td className="p-3 text-slate-600">{reg.branch} {reg.semester ? `(${reg.semester})` : ''}</td>
                        <td className="p-3 font-semibold text-slate-800">{reg.teamName} ({reg.teamSize} pax)</td>
                        <td className="p-3 text-emerald-700 font-semibold">{reg.track}</td>
                        <td className="p-3 font-mono text-slate-500">{reg.leaderEmail}</td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{reg.createdAt?.split('T')[0] || reg.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENT VIEW - MY REGISTERED PASSES */}
        {activeTab === 'my-passes' && !isStaff && (
          <div>
            {registrations.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Event Passes Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  You have not registered for any campus events under this student profile yet. Browse events and register your team to generate an official entry ticket!
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-gec-blue text-white text-xs font-bold rounded-xl shadow-xs hover:bg-sky-900 cursor-pointer"
                >
                  Browse Campus Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrations.map((pass) => (
                  <div
                    key={pass.ticketId}
                    className="bg-white rounded-2xl p-6 border-2 border-emerald-300 shadow-sm relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                      Official Entry Pass
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold text-emerald-700 mb-1">
                        {pass.ticketId}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-0.5">{pass.eventTitle}</h3>
                      <div className="text-xs text-slate-500 mb-3">{pass.venue} • {pass.date}</div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Team Name:</span>
                          <strong className="text-slate-900">{pass.teamName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Team Leader:</span>
                          <span>{pass.leaderName} ({pass.teamSize} delegates)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Track:</span>
                          <span className="text-emerald-700 font-semibold truncate max-w-[200px]">{pass.track}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Issued On:</span>
                          <span className="font-mono text-[11px] text-slate-500">{pass.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <button
                        onClick={() => setRegisteredPass(pass)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Pass Card</span>
                      </button>

                      <button
                        onClick={() => printEventPass(pass)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Pass PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL 1: HOD / FACULTY - VIEW REGISTERED STUDENTS MODAL */}
      {selectedEventForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-mono text-[10px] uppercase font-bold border border-indigo-400/30">
                    {selectedEventForView.category}
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    👥 {eventRegistrationsList.length} Delegations Registered
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedEventForView.title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedEventForView.venue} • Scheduled: {selectedEventForView.date}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEventForView(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or team..."
                  value={searchRegQuery}
                  onChange={(e) => setSearchRegQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <span className="text-xs text-slate-500">
                Showing <strong>{filteredEventRegistrations.length}</strong> of {eventRegistrationsList.length} registered students
              </span>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {loadingRegistrationsList ? (
                <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading registered students...</span>
                </div>
              ) : filteredEventRegistrations.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No Registered Students Found</p>
                  <p className="mt-0.5 text-slate-400">
                    {searchRegQuery ? 'No student matched your search query.' : 'No students have registered for this event yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Roll No</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Branch & Sem</th>
                        <th className="p-3">Team Name</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Track</th>
                        <th className="p-3">Leader Email</th>
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredEventRegistrations.map((reg) => (
                        <tr key={reg.ticketId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-gec-blue">{reg.rollNo}</td>
                          <td className="p-3 font-bold text-slate-900">{reg.studentName || reg.leaderName}</td>
                          <td className="p-3 text-slate-600">{reg.branch} {reg.semester ? `(${reg.semester})` : ''}</td>
                          <td className="p-3 font-semibold text-slate-800">{reg.teamName}</td>
                          <td className="p-3 text-center">{reg.teamSize}</td>
                          <td className="p-3 text-emerald-700 font-semibold">{reg.track}</td>
                          <td className="p-3 font-mono text-slate-500">{reg.leaderEmail}</td>
                          <td className="p-3 font-mono text-[11px] text-indigo-600 font-bold">{reg.ticketId}</td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">{reg.createdAt?.split('T')[0] || reg.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official institutional registration list powered by MySQL 9.4 database.
              </span>
              <button
                onClick={() => setSelectedEventForView(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: HOD - ORGANIZE NEW CAMPUS EVENT MODAL */}
      {isOrganizeModalOpen && isHod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    👑 HOD Executive Console
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1.5">
                  Organize & Publish New Campus Event
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  The event will be published immediately to all student portals for online team registration.
                </p>
              </div>
              <button 
                onClick={() => setIsOrganizeModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateEventSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palash Hackathon 2026 / GenAI National Symposium"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tagline / Theme Slogan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code for Rural Empowerment, AI & Clean Green Jharkhand"
                  value={newEvent.tagline}
                  onChange={(e) => setNewEvent({ ...newEvent, tagline: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Tech-Fest">Tech-Fest</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Seminar">Seminar & Guest Lecture</option>
                    <option value="Competition">Coding Competition</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Flagship Event / Department Event"
                    value={newEvent.badge}
                    onChange={(e) => setNewEvent({ ...newEvent, badge: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Timing</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM - 05:00 PM"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Computing Center & Central Auditorium, GEC Palamu"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prize Pool / Reward</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 Cash Prizes"
                    value={newEvent.prizePool}
                    onChange={(e) => setNewEvent({ ...newEvent, prizePool: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 - 4 Members / Solo"
                    value={newEvent.teamSize}
                    onChange={(e) => setNewEvent({ ...newEvent, teamSize: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reg. Deadline</label>
                  <input
                    type="date"
                    value={newEvent.registrationDeadline}
                    onChange={(e) => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Innovation Tracks / Themes (One per line)
                </label>
                <textarea
                  rows="3"
                  value={newEvent.tracks}
                  onChange={(e) => setNewEvent({ ...newEvent, tracks: e.target.value })}
                  placeholder="Enter tracks separated by newlines..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rules & Eligibility Guidelines (One per line)
                </label>
                <textarea
                  rows="2"
                  value={newEvent.rules}
                  onChange={(e) => setNewEvent({ ...newEvent, rules: e.target.value })}
                  placeholder="Enter guidelines..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOrganizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md transition-all cursor-pointer"
                >
                  {submittingEvent ? (
                    <span>Publishing to MySQL...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Publish Campus Event</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STUDENT - ONLINE EVENT REGISTRATION MODAL */}
      {selectedEvent && !isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gec-orange uppercase">Online Event Registration</span>
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs">{selectedEvent.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Team / Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ByteBrigade GEC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gec-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Leader Name</label>
                <input
                  type="text"
                  required
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Size</label>
                  <select
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="1">1 Member (Solo)</option>
                    <option value="2">2 Members</option>
                    <option value="3">3 Members</option>
                    <option value="4">4 Members</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Leader Email</label>
                  <input
                    type="email"
                    required
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Selected Innovation Track</label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white truncate"
                >
                  {(selectedEvent.tracks || []).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gec-blue text-white rounded-lg font-bold hover:bg-sky-900 shadow transition-all cursor-pointer"
                >
                  Confirm Registration & Get Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: GENERATED DIGITAL EVENT TICKET / PASS MODAL */}
      {registeredPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Official Entry Ticket Pass
              </span>
              <button 
                onClick={() => setRegisteredPass(null)}
                className="p-1 rounded-full text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card Body */}
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-gradient-to-b from-slate-50 to-white shadow-inner">
                <div className="text-center border-b border-slate-200 pb-3">
                  <div className="text-[10px] font-bold text-gec-orange uppercase">GEC Palamu Official Pass</div>
                  <h4 className="text-sm font-extrabold text-gec-navy mt-0.5">{registeredPass.eventTitle}</h4>
                  <div className="text-[10px] text-slate-500">{registeredPass.venue}</div>
                </div>

                <div className="py-4 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pass Reference:</span>
                    <span className="font-mono font-bold text-gec-blue">{registeredPass.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Name:</span>
                    <strong className="text-slate-900">{registeredPass.teamName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Leader:</span>
                    <span>{registeredPass.leaderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Delegates:</span>
                    <span>{registeredPass.teamSize} Member(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Track:</span>
                    <span className="font-semibold text-emerald-700 text-right truncate max-w-[200px]">{registeredPass.track}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <QrCode className="w-10 h-10 text-slate-800" />
                  <div className="text-right text-[10px] text-slate-400">
                    <div>Scannable at Campus Gate</div>
                    <div className="font-mono text-[9px]">{registeredPass.timestamp}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => printEventPass(registeredPass)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gec-blue text-white text-xs font-bold hover:bg-sky-900 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Entry Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
