import React, { useState } from 'react';
import { Complaint } from '../types';
import { AlertCircle, X } from 'lucide-react';

interface RejectComplaintModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (reason: string) => void;
}

export const RejectComplaintModal: React.FC<RejectComplaintModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific rejection reason.');
      return;
    }
    onConfirmReject(reason.trim());
    setReason('');
    setError('');
  };

  const commonReasons = [
    'Duplicate submission: Issue already being resolved under prior ticket.',
    'Private residential property: Non-civic municipal infrastructure.',
    'Insufficient or blurred photograph: Unable to verify site.',
    'Jurisdiction mismatch: Area falls under state highway / private township authority.',
  ];

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

        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">Reject Complaint</h3>
        <p className="text-xs text-slate-500 mt-1">
          Rejecting <span className="font-semibold text-slate-800">{complaint.complaintId}</span> will notify the citizen and close the grievance cycle.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select or Enter Reason:
            </label>
            <div className="space-y-1.5 mb-2">
              {commonReasons.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setReason(preset)}
                  className="w-full text-left p-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 text-[11px] text-slate-600 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Provide a detailed administrative reason for rejection..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            />
            {error && <p className="text-[11px] text-rose-600 font-medium mt-1">{error}</p>}
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Confirm Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
