import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Tag, 
  Search, 
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { NOTICES_AND_TENDERS } from '../../data/collegeData';

export default function NoticeTenderBoard({ onSelectNotice }) {
  const [activeTab, setActiveTab] = useState('notices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const items = activeTab === 'notices' ? NOTICES_AND_TENDERS.notices : NOTICES_AND_TENDERS.tenders;

  const categories = ['All', ...new Set(items.map(i => i.category))];

  const filteredItems = items.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-gec-orange uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Circulars & Procurement</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gec-navy">
              Notices, Circulars & Tenders
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Real-time authentic announcements released by Academic, Examination, and Administrative cells of GEC Palamu.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('notices'); setSelectedCategory('All'); }}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'notices'
                  ? 'bg-gec-blue text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Academic Notices ({NOTICES_AND_TENDERS.notices.length})
            </button>
            <button
              onClick={() => { setActiveTab('tenders'); setSelectedCategory('All'); }}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'tenders'
                  ? 'bg-gec-blue text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Short Tenders ({NOTICES_AND_TENDERS.tenders.length})
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Badges */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gec-blue text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gec-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Notice/Tender List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              No matching {activeTab} found for "{searchQuery}".
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-gec-blue/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-sky-100 text-sky-800">
                        {item.category}
                      </span>
                      {item.isNew && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-gec-blue transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  {item.refNo && (
                    <div className="text-[11px] text-slate-400 mb-3">
                      Ref: <strong className="text-slate-700">{item.refNo}</strong> • Last Date: <strong className="text-rose-600">{item.lastDate}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Govt. Engineering College, Palamu
                  </span>
                  <button
                    onClick={() => onSelectNotice(item)}
                    className="flex items-center gap-1.5 font-semibold text-gec-blue hover:text-gec-orange transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download Notice</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
