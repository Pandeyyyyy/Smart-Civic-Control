import React, { useState } from 'react';
import { Complaint, User, ComplaintStatus } from '../types';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Calendar,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { DEMO_WARDS } from '../data/seedData';

interface CitizenComplaintsViewProps {
  currentUser: User;
  complaints: Complaint[];
  onNavigate: (view: string, complaintId?: string) => void;
}

export const CitizenComplaintsView: React.FC<CitizenComplaintsViewProps> = ({
  currentUser,
  complaints,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [wardFilter, setWardFilter] = useState<string>('ALL');

  // Filter complaints by citizen user ID first
  const userComplaints = complaints.filter((c) => c.userId === currentUser.id);

  // Apply filters
  const filtered = userComplaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (wardFilter !== 'ALL' && c.demoWardNumber !== wardFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matches =
        c.complaintId.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.finalCategory.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER & TOP CONTROLS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">My Registered Grievances</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and monitor resolution progress for issues submitted under your citizen account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('report_problem')}
          className="py-2.5 px-5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-md shadow-teal-700/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report New Issue</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* SEARCH */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, keyword, address, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        {/* STATUS FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-[#0F766E] text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* WARD FILTER DROPDOWN */}
        <div className="w-full md:w-auto">
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="w-full md:w-auto py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="ALL">All Demo Wards</option>
            {DEMO_WARDS.map((w) => (
              <option key={w.demoWardNumber} value={w.demoWardNumber}>
                {w.demoWardNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPLAINTS LIST */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/60 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No matching complaints found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or search query.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setWardFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => onNavigate('complaint_detail', c.complaintId)}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 hover:border-teal-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/60">
                    {c.complaintId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : c.status === 'In Progress'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                        : c.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    ● {c.status}
                  </span>
                </div>

                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={c.imageUrl}
                    alt={c.finalCategory}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 capitalize group-hover:text-teal-800 transition-colors">
                      {c.finalCategory.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{c.demoWardNumber}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[140px]">{c.departmentName}</span>
                  </span>
                </div>

                <span className="text-teal-700 font-semibold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                  <span>Track</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
