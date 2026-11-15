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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#031223]/90 backdrop-blur-2xl border border-cyan-500/25 shadow-2xl shadow-black/80">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#071A2F] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isConfirmed ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Send to Authority (Demo Showcase)</h3>
            <p className="text-xs text-slate-300 mt-1">
              Simulates forwarding the complaint dossier to municipal field authority dispatch.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-[#071A2F]/70 border border-cyan-500/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Complaint ID:</span>
                <span className="font-semibold text-[#00D6B8]">{complaint.complaintId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Problem Category:</span>
                <span className="font-semibold text-white capitalize">
                  {complaint.finalCategory.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Department:</span>
                <span className="font-semibold text-white">{complaint.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Administrative Ward:</span>
                <span className="font-semibold text-[#00D6B8]">{complaint.demoWardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-slate-200">Ready for Authority</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300 mb-6">
              <strong>DEMO ONLY NOTICE:</strong> This action is for demonstration only. No real email, SMS, government API, or external authority will be contacted.
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-cyan-500/25 text-slate-300 text-xs font-semibold hover:bg-[#071A2F]/80 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-xs font-semibold shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white">Demo Action Completed</h3>
            <p className="text-xs text-slate-300 mt-2 font-medium">
              Simulation dispatch logged for <span className="font-bold text-[#00D6B8]">{complaint.complaintId}</span> to {complaint.departmentName} ({complaint.demoWardNumber}).
            </p>

            <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
              ✓ No real external authority was contacted.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white text-xs font-semibold shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
