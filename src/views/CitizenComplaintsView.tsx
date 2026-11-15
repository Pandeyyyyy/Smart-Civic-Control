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
      <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">My Registered Grievances</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track and monitor resolution progress for issues submitted under your citizen account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('report_problem')}
          className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-xs font-semibold shadow-lg shadow-teal-500/25 flex items-center space-x-1.5 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report New Issue</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-2xl bg-[#071A2F]/75 backdrop-blur-md border border-cyan-500/20 shadow-lg flex flex-col md:flex-row items-center gap-3">
        {/* SEARCH */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, keyword, address, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cyan-500/30 bg-[#031223]/90 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
          />
        </div>

        {/* STATUS FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#0F766E] to-[#00D6B8] text-white font-semibold shadow-xs border border-cyan-400/50'
                  : 'bg-[#031223]/80 hover:bg-[#071A2F] text-slate-300 border border-cyan-500/20'
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
            className="w-full md:w-auto py-2 px-3 rounded-xl border border-cyan-500/30 bg-[#031223]/90 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          >
            <option value="ALL" className="bg-[#031223] text-white">All Demo Wards</option>
            {DEMO_WARDS.map((w) => (
              <option key={w.demoWardNumber} value={w.demoWardNumber} className="bg-[#031223] text-white">
                {w.demoWardNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPLAINTS LIST */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25">
          <p className="text-sm font-semibold text-white">No matching complaints found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or search query.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setWardFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#071A2F] hover:bg-[#071A2F]/80 text-white text-xs font-semibold border border-cyan-500/25 cursor-pointer"
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
              className="p-5 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 hover:border-cyan-400/50 shadow-xl shadow-black/40 hover:shadow-cyan-950/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-[#00D6B8] bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                    {c.complaintId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                        : c.status === 'In Progress'
                        ? 'bg-sky-950/70 text-sky-300 border border-sky-500/30'
                        : c.status === 'Rejected'
                        ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    ● {c.status}
                  </span>
                </div>

                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={c.imageUrl}
                    alt={c.finalCategory}
                    className="w-16 h-16 rounded-2xl object-cover border border-cyan-500/30 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize group-hover:text-[#00D6B8] transition-colors">
                      {c.finalCategory.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{c.demoWardNumber}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    <span className="truncate max-w-[140px]">{c.departmentName}</span>
                  </span>
                </div>

                <span className="text-[#00D6B8] font-semibold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
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
