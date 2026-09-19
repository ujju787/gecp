import React from 'react';
import { 
  UserCheck, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Bot, 
  Users, 
  ArrowRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function QuickFeaturesGrid({ setCurrentTab, onOpenChatbot }) {
  const features = [
    {
      id: 'dashboard',
      title: 'Student & Faculty Portal',
      tag: 'Role-Based Dashboard',
      description: 'Check daily attendance percentages with <75% warnings, view internal marks, submit assignments & download digital Student ID.',
      icon: UserCheck,
      color: 'from-blue-600 to-indigo-600',
      actionText: 'Launch Portal'
    },
    {
      id: 'placement',
      title: 'Training & Placement Cell',
      tag: 'Career & Internships',
      description: 'Explore live internship opportunities, placement statistics, and apply for upcoming drives from Yash India Pvt. Ltd., TCS, and Infosys.',
      icon: Briefcase,
      color: 'from-amber-500 to-orange-600',
      actionText: 'Explore Drives'
    },
    {
      id: 'library',
      title: 'Digital Library & Study Hub',
      tag: 'Centralized Repository',
      description: 'Access 2021-2025 Previous Year Question Papers (PYQs), branch-wise lecture notes, laboratory manuals, and share notes with peers.',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-700',
      actionText: 'Access Library'
    },
    {
      id: 'events',
      title: 'Events, Fests & Hackathons',
      tag: 'Live Registrations',
      description: 'Palash 24h Hackathon 2026, TechKriti Techno-Management Fest, and workshops with instant digital event ticket generation.',
      icon: Calendar,
      color: 'from-rose-500 to-pink-600',
      actionText: 'View Events'
    },
    {
      id: 'payment',
      title: 'Online Fee Payment Gateway',
      tag: 'Secure & Stamped Receipt',
      description: 'Pay semester tuition, university exam, and hostel dues via UPI or Card with instant official printable receipt with QR verification.',
      icon: CreditCard,
      color: 'from-purple-600 to-violet-700',
      actionText: 'Pay Dues Online'
    },
    {
      id: 'alumni',
      title: 'Alumni Network & Mentors',
      tag: 'Connect With Seniors',
      description: 'Verified alumni directory across Google, Tata Steel, PSUs & Civil Services. Request 1-on-1 career guidance and mock interviews.',
      icon: Users,
      color: 'from-cyan-600 to-blue-700',
      actionText: 'Find Mentors'
    },
    {
      id: 'chatbot',
      title: 'Palamu Mitra AI Helpdesk',
      tag: 'Smart Instant AI',
      description: 'Ask anything about JCECEB admissions, hostel allotment, fees, CSE/ME/CE/EE syllabus, and Lesliganj travel route.',
      icon: Bot,
      color: 'from-amber-600 to-amber-700',
      actionText: 'Chat with Mitra',
      isChatbotTrigger: true
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-gec-orange text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Student & Institutional Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gec-navy">
            High-Performance Digital Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Engineered to streamline academic workflows, placement readiness, transparent fee collection, and community collaboration.
          </p>
          <div className="w-16 h-1 bg-gec-orange mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => {
                  if (feat.isChatbotTrigger) {
                    onOpenChatbot();
                  } else {
                    setCurrentTab(feat.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="group relative bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-gec-blue/40 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-gec-blue transition-colors mb-2">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-gec-blue group-hover:text-gec-orange transition-colors">
                  <span>{feat.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
