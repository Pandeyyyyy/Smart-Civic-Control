import React from 'react';
import { Complaint } from '../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Cpu, Building2, UserCheck } from 'lucide-react';

interface TimelineProps {
  complaint: Complaint;
}

export const Timeline: React.FC<TimelineProps> = ({ complaint }) => {
  const isRejected = complaint.status === 'Rejected';
  const isResolved = complaint.status === 'Resolved';
  const isInProgress = complaint.status === 'In Progress' || isResolved;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Resolution Progress Timeline</h3>
          <p className="text-xs text-slate-500">Official tracking lifecycle for {complaint.complaintId}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            complaint.status === 'Resolved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : complaint.status === 'In Progress'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : complaint.status === 'Rejected'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          ● {complaint.status}
        </span>
      </div>

      {/* HORIZONTAL STEPPER FOR DESKTOP / VERTICAL ON MOBILE */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {/* STEP 1: SUBMITTED */}
        <div className="relative flex items-start space-x-3">
          <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center ring-4 ring-white shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">1. Grievance Submitted</span>
              <span className="text-[11px] text-slate-400">{formatDate(complaint.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Logged by citizen {complaint.citizenName} with geocoded coordinates in {complaint.demoWardNumber}.
            </p>
          </div>
        </div>

        {/* STEP 2: AI MULTIMODAL CLASSIFIED */}
        <div className="relative flex items-start space-x-3">
          <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center ring-4 ring-white shadow-sm">
            <Cpu className="w-3 h-3" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">2. AI Multimodal Inference</span>
              <span className="text-[11px] text-teal-600 font-medium">
                {complaint.aiConfidence ? `${Math.round(complaint.aiConfidence * 100)}% Confidence` : 'Verified'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Classified category as{' '}
              <span className="font-semibold text-teal-800 capitalize">
                {complaint.finalCategory.replace('_', ' ')}
              </span>{' '}
              via visual pattern match and natural language parsing.
            </p>
          </div>
        </div>

        {/* STEP 3: AUTOMATIC DEPARTMENT ROUTING */}
        <div className="relative flex items-start space-x-3">
          <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center ring-4 ring-white shadow-sm">
            <Building2 className="w-3 h-3" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">3. Department Assigned</span>
              <span className="text-[11px] text-slate-400">{complaint.demoWardNumber}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Auto-routed to{' '}
              <span className="font-semibold text-slate-900">{complaint.departmentName}</span> under ward jurisdiction.
            </p>
          </div>
        </div>

        {/* STEP 4: ACTION (IN PROGRESS OR REJECTED) */}
        {isRejected ? (
          <div className="relative flex items-start space-x-3">
            <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-rose-800">4. Grievance Rejected</span>
                <span className="text-[11px] text-rose-600">{formatDate(complaint.updatedAt)}</span>
              </div>
              <p className="text-xs text-rose-700 mt-1 font-medium">
                Reason: {complaint.rejectionReason || 'Non-actionable or invalid municipal grievance.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex items-start space-x-3">
            <div
              className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                isInProgress ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${isInProgress ? 'text-slate-800' : 'text-slate-400'}`}>
                  4. Field Operations In Progress
                </span>
                {isInProgress && (
                  <span className="text-[11px] text-slate-400">{formatDate(complaint.updatedAt)}</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isInProgress
                  ? 'Sanitation / maintenance crew and equipment assigned to location.'
                  : 'Pending field inspector dispatch.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: RESOLVED */}
        {!isRejected && (
          <div className="relative flex items-start space-x-3">
            <div
              className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                isResolved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${isResolved ? 'text-emerald-800' : 'text-slate-400'}`}>
                  5. Resolution Verified
                </span>
                {isResolved && complaint.resolvedAt && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {formatDate(complaint.resolvedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isResolved
                  ? 'Corrective repairs or sanitation completed. Issue closed by ward executive.'
                  : 'Pending final field verification.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED REMARKS LOG */}
      {complaint.statusHistory && complaint.statusHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Activity Log & Remarks
          </h4>
          <div className="space-y-2">
            {complaint.statusHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              >
                <div>
                  <span className="font-semibold text-slate-800">{item.changedBy}:</span>{' '}
                  <span className="text-slate-600">{item.remarks}</span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
