import React from 'react';
import { Complaint, User } from '../types';
import { dataStore } from '../services/dataStore';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Send,
} from 'lucide-react';
import { DEMO_WARDS, DEPARTMENTS } from '../data/seedData';

interface AdminDashboardViewProps {
  currentUser: User;
  complaints: Complaint[];
  onNavigate: (view: string, complaintId?: string) => void;
  onOpenSendToAuthority: (complaint: Complaint) => void;
  onOpenRejectModal: (complaint: Complaint) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  complaints,
  onNavigate,
  onOpenSendToAuthority,
  onOpenRejectModal,
}) => {
  const analytics = dataStore.getAnalytics(complaints);

  return (
    <div className="space-y-6 pb-16">
      {/* OPERATIONS HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
            <span>MUNICIPAL OPERATIONS COMMAND</span>
            <span>•</span>
            <span>R/NORTH WARD</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Dahisar Civic Services Administration
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Supervising Officer: <strong className="text-slate-900 font-bold">{currentUser.name}</strong> (Executive Desk)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onNavigate('admin_complaints')}
            className="btn-interactive py-3 px-5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md shadow-teal-900/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Manage All Complaints</span>
            <ChevronRight className="w-4 h-4 icon-shift" />
          </button>
        </div>
      </div>

      {/* ADMIN METRIC CARDS (HIGH INFORMATION DENSITY) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* TOTAL */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Complaints</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.totalComplaints}</p>
          <div className="flex items-center space-x-1 text-[11px] text-teal-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.4% this week</span>
          </div>
        </div>

        {/* PENDING */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.pendingCount}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Require squad triage</span>
        </div>

        {/* IN PROGRESS */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold">Field Active</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.inProgressCount}</p>
          <span className="text-[10px] text-sky-700 font-semibold">Field work underway</span>
        </div>

        {/* RESOLVED */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics.resolvedCount}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Avg SLA: 1.8 days</span>
        </div>

        {/* REJECTED */}
        <div className="p-5 rounded-2xl glass-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{analytics.rejectedCount}</p>
          <span className="text-[10px] text-rose-700 font-medium">Reason recorded</span>
        </div>
      </div>

      {/* AI OPERATIONS INSIGHTS STRIP */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#0F766E] text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-teal-900 block">
              Multimodal AI Routing Health: {Math.round(analytics.highConfidenceRatio * 100)}% High Confidence
            </span>
            <span className="text-teal-700 text-[11px]">
              MobileNetV2 visual inference & NLP keyword weighting running without manual intervention.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('admin_analytics')}
          className="font-semibold text-teal-800 hover:text-teal-900 underline whitespace-nowrap self-start sm:self-auto"
        >
          View Full AI Insights →
        </button>
      </div>

      {/* MAIN TWO COLUMN GRID: LIVE OPERATIONAL MAP & RECENT COMPLAINTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIVE MAP CARD (7 COLS) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Operational Map</h3>
              <p className="text-xs text-slate-500">Live complaint markers across Dahisar Demo Wards 01–06</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin_map')}
              className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59]"
            >
              Full Screen Map →
            </button>
          </div>

          <div className="my-2">
            <InteractiveMap
              complaints={complaints}
              height="360px"
              onComplaintSelect={(c) => onNavigate('complaint_detail', c.complaintId)}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Click any marker to view complaint dossier</span>
            <span className="font-semibold text-teal-700">Dahisar R/North Grid</span>
          </div>
        </div>

        {/* WARD DISTRIBUTION & DEPARTMENT LOAD (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* WARD LOAD */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Complaints by Demo Ward</h3>
              <button
                type="button"
                onClick={() => onNavigate('admin_wards')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Ward Details
              </button>
            </div>

            <div className="space-y-2">
              {DEMO_WARDS.map((w) => {
                const count = complaints.filter((c) => c.demoWardNumber === w.demoWardNumber).length;
                const percent = Math.round((count / Math.max(1, complaints.length)) * 100);

                return (
                  <div key={w.demoWardNumber} className="text-xs">
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-slate-800 font-semibold">{w.demoWardNumber}</span>
                      <span className="text-slate-500">{count} issues ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0F766E]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DEPARTMENT LOAD */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Department Workload</h3>
              <button
                type="button"
                onClick={() => onNavigate('admin_departments')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                View Rules
              </button>
            </div>

            <div className="space-y-2">
              {DEPARTMENTS.slice(0, 5).map((d) => {
                const count = complaints.filter((c) => c.departmentId === d.id).length;

                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-[200px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="font-semibold text-slate-800 truncate">{d.departmentName}</span>
                    </div>
                    <span className="font-bold text-slate-700">{count} active</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT COMPLAINTS TABLE QUICK FEED */}
      <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Complaints Stream</h3>
            <p className="text-xs text-slate-500">Incoming submissions requiring triage</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin_complaints')}
            className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59]"
          >
            Open Full Operations Table ({complaints.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">ID</th>
                <th className="py-2.5 px-3">Problem</th>
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-teal-800 whitespace-nowrap">
                    {c.complaintId}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 capitalize whitespace-nowrap">
                    {c.finalCategory.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{c.demoWardNumber}</td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[160px]">
                    {c.departmentName}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {Math.round((c.aiConfidence || 0.92) * 100)}%
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.status === 'In Progress'
                          ? 'bg-sky-50 text-sky-700'
                          : c.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      ● {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenSendToAuthority(c)}
                      className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                      title="Send to Authority (Demo)"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('complaint_detail', c.complaintId)}
                      className="py-1 px-2.5 rounded-lg bg-[#0F766E] text-white text-[11px] font-semibold hover:bg-[#115E59]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
