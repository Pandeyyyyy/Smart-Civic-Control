import React from 'react';
import { Complaint, User } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  MapPin,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface CitizenDashboardViewProps {
  currentUser: User;
  complaints: Complaint[];
  onNavigate: (view: string, complaintId?: string) => void;
}

export const CitizenDashboardView: React.FC<CitizenDashboardViewProps> = ({
  currentUser,
  complaints,
  onNavigate,
}) => {
  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter complaints for current citizen
  const userComplaints = complaints.filter((c) => c.userId === currentUser.id);

  const total = userComplaints.length;
  const pending = userComplaints.filter((c) => c.status === 'Pending').length;
  const inProgress = userComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = userComplaints.filter((c) => c.status === 'Resolved').length;
  const rejected = userComplaints.filter((c) => c.status === 'Rejected').length;

  const recentComplaints = [...userComplaints].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* GREETING & PRIMARY ACTION BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getGreeting()}, {currentUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Report civic issues and track their resolution progress across Dahisar wards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('report_problem')}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report a Problem</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total */}
        <div className="p-4 rounded-2xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Complaints</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{total}</p>
          <span className="text-[10px] text-[#00D6B8] font-medium">Logged in portal</span>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{pending}</p>
          <span className="text-[10px] text-amber-400 font-medium">Awaiting review</span>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{inProgress}</p>
          <span className="text-[10px] text-sky-400 font-medium">Field crew active</span>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{resolved}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Closed & verified</span>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-2xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{rejected}</p>
          <span className="text-[10px] text-rose-400 font-medium">Non-civic / invalid</span>
        </div>
      </div>

      {/* TWO COLUMN GRID: RECENT COMPLAINTS & QUICK MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECENT COMPLAINTS TABLE (7 COLS) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">My Recent Grievances</h3>
              <p className="text-xs text-slate-400">Track latest status and ward assignment</p>
            </div>
            {userComplaints.length > 5 && (
              <button
                type="button"
                onClick={() => onNavigate('citizen_complaints')}
                className="text-xs font-semibold text-[#00D6B8] hover:text-cyan-300 flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>View all ({total})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentComplaints.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">You haven't reported any grievances yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('report_problem')}
                className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                File your first complaint
              </button>
            </div>
          ) : (
            <div className="divide-y divide-cyan-500/15">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('complaint_detail', c.complaintId)}
                  className="py-3.5 flex items-center justify-between hover:bg-[#071A2F]/80 -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={c.imageUrl}
                      alt={c.finalCategory}
                      className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-[#00D6B8]">
                          {c.complaintId}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-bold text-white capitalize">
                          {c.finalCategory.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 max-w-xs sm:max-w-md">
                        {c.description}
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{c.demoWardNumber}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span className="truncate max-w-[130px]">{c.departmentName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
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
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK MAP PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Ward Grievance Map</h3>
              <p className="text-xs text-slate-400">Live locations in Dahisar R/North</p>
            </div>
            <span className="text-[11px] text-[#00D6B8] font-semibold">
              {complaints.length} registered
            </span>
          </div>

          <div className="flex-1 my-2">
            <InteractiveMap
              complaints={complaints}
              height="260px"
              onComplaintSelect={(c) => onNavigate('complaint_detail', c.complaintId)}
            />
          </div>

          <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
            <span>Dahisar East & West</span>
            <button
              type="button"
              onClick={() => onNavigate('track_complaint')}
              className="font-semibold text-[#00D6B8] hover:text-cyan-300 cursor-pointer transition-colors"
            >
              Open Full Tracker →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
