import React from 'react';
import { Complaint } from '../types';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface SendToAuthorityModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirmed: boolean;
}

export const SendToAuthorityModal: React.FC<SendToAuthorityModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onConfirm,
  isConfirmed,
}) => {
  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isConfirmed ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Send to Authority (Demo Showcase)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulates forwarding the complaint dossier to municipal field authority dispatch.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Complaint ID:</span>
                <span className="font-semibold text-slate-900">{complaint.complaintId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Problem Category:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {complaint.finalCategory.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Department:</span>
                <span className="font-semibold text-slate-900">{complaint.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Administrative Ward:</span>
                <span className="font-semibold text-teal-700">{complaint.demoWardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-800">Ready for Authority</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 mb-6">
              <strong>DEMO ONLY NOTICE:</strong> This action is for demonstration only. No real email, SMS, government API, or external authority will be contacted.
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-md transition-colors"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Demo Action Completed</h3>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Simulation dispatch logged for <span className="font-bold text-slate-900">{complaint.complaintId}</span> to {complaint.departmentName} ({complaint.demoWardNumber}).
            </p>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              ✓ No real external authority was contacted.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
