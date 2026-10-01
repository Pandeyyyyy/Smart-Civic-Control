import React from 'react';
import { Complaint } from '../types';
import { dataStore } from '../services/dataStore';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AdminAnalyticsViewProps {
  complaints: Complaint[];
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({ complaints }) => {
  const analytics = dataStore.getAnalytics(complaints);

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Civic Intelligence & Urban Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics calculated from {analytics.totalComplaints} live municipal grievance records in Dahisar.
        </p>
      </div>

      {/* TOP KPI BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Average Resolution Time</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.avgResolutionDays} Days</p>
          <span className="text-[10px] text-teal-700 font-medium">Target SLA: 2.0 days</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Resolution Rate</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {Math.round((analytics.resolvedCount / Math.max(1, analytics.totalComplaints)) * 100)}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">{analytics.resolvedCount} closed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">High AI Confidence Ratio</span>
          <p className="text-2xl font-bold text-teal-800 mt-1">
            {Math.round(analytics.highConfidenceRatio * 100)}%
          </p>
          <span className="text-[10px] text-teal-700 font-medium">&gt;= 80% accuracy match</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Rejection Ratio</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {Math.round((analytics.rejectedCount / Math.max(1, analytics.totalComplaints)) * 100)}%
          </p>
          <span className="text-[10px] text-rose-600 font-medium">{analytics.rejectedCount} non-civic</span>
        </div>
      </div>

      {/* 2x2 CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. COMPLAINTS OVER TIME (7-DAY TREND) */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Grievance Trend</h3>
              <p className="text-xs text-slate-500">Submitted vs. Resolved daily volume</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                <span className="text-slate-600">Submitted</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Resolved</span>
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Graphic */}
          <div className="h-48 flex items-end justify-between pt-6 px-2 gap-2 border-b border-slate-100">
            {analytics.trend.map((t) => (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center space-x-1 h-36">
                  {/* Submitted Bar */}
                  <div
                    className="w-3 rounded-t-md bg-[#0F766E] transition-all hover:bg-[#115E59]"
                    style={{ height: `${(t.submitted / 8) * 100}%` }}
                    title={`${t.submitted} submitted`}
                  />
                  {/* Resolved Bar */}
                  <div
                    className="w-3 rounded-t-md bg-emerald-500 transition-all hover:bg-emerald-600"
                    style={{ height: `${(t.resolved / 8) * 100}%` }}
                    title={`${t.resolved} resolved`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{t.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. COMPLAINTS BY CATEGORY */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints by Problem Category</h3>
            <p className="text-xs text-slate-500">Breakdown of reported issues</p>
          </div>

          <div className="space-y-2.5 pt-1">
            {analytics.byCategory.slice(0, 6).map((c) => {
              const max = Math.max(...analytics.byCategory.map((x) => x.count), 1);
              const percent = Math.round((c.count / max) * 100);

              return (
                <div key={c.category} className="text-xs">
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-800 capitalize">{c.label}</span>
                    <span className="font-semibold text-slate-700">{c.count} ({Math.round((c.count / analytics.totalComplaints) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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

        {/* 3. COMPLAINTS BY DEMO WARD */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints by Demo Ward</h3>
            <p className="text-xs text-slate-500">Distribution across Dahisar R/North wards</p>
          </div>

          <div className="space-y-3">
            {analytics.byWard.map((w) => {
              const percent = Math.round((w.count / Math.max(1, analytics.totalComplaints)) * 100);

              return (
                <div key={w.ward} className="text-xs">
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-800 font-semibold">{w.ward}</span>
                    <span className="text-slate-600 font-bold">{w.count} tickets</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-700"
                      style={{ width: `${percent * 2}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. COMPLAINTS BY DEPARTMENT */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints by Department Routing</h3>
            <p className="text-xs text-slate-500">Operational load per municipal department</p>
          </div>

          <div className="space-y-2.5">
            {analytics.byDepartment.map((d) => {
              const percent = Math.round((d.count / Math.max(1, analytics.totalComplaints)) * 100);

              return (
                <div
                  key={d.department}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                    {d.department}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">{percent}%</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {d.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
