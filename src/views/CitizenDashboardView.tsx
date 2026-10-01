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
      <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {currentUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Report civic issues and track their resolution progress across Dahisar wards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('report_problem')}
          className="btn-interactive py-3.5 px-6 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-900/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report a Problem</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Complaints</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{total}</p>
          <span className="text-[10px] text-teal-700 font-semibold">Logged in portal</span>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pending}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Awaiting review</span>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold">In Progress</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{inProgress}</p>
          <span className="text-[10px] text-sky-700 font-semibold">Field crew active</span>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{resolved}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Closed & verified</span>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-2xl glass-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{rejected}</p>
          <span className="text-[10px] text-rose-700 font-semibold">Non-civic / invalid</span>
        </div>
      </div>

      {/* TWO COLUMN GRID: RECENT COMPLAINTS & QUICK MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECENT COMPLAINTS TABLE (7 COLS) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Recent Grievances</h3>
              <p className="text-xs text-slate-500">Track latest status and ward assignment</p>
            </div>
            {userComplaints.length > 5 && (
              <button
                type="button"
                onClick={() => onNavigate('citizen_complaints')}
                className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center space-x-1"
              >
                <span>View all ({total})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentComplaints.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">You haven't reported any grievances yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('report_problem')}
                className="mt-3 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-semibold shadow-xs"
              >
                File your first complaint
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('complaint_detail', c.complaintId)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={c.imageUrl}
                      alt={c.finalCategory}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-teal-800">
                          {c.complaintId}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-slate-900 capitalize">
                          {c.finalCategory.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-xs sm:max-w-md">
                        {c.description}
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.demoWardNumber}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[130px]">{c.departmentName}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
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
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ward Grievance Map</h3>
              <p className="text-xs text-slate-500">Live locations in Dahisar R/North</p>
            </div>
            <span className="text-[11px] text-teal-700 font-semibold">
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dahisar East & West</span>
            <button
              type="button"
              onClick={() => onNavigate('track_complaint')}
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Open Full Tracker →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
