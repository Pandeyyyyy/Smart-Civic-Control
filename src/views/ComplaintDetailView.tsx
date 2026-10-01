import React, { useState } from 'react';
import { Complaint, User } from '../types';
import { Timeline } from '../components/Timeline';
import { InteractiveMap } from '../components/InteractiveMap';
import { dataStore } from '../services/dataStore';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

interface ComplaintDetailViewProps {
  complaintId: string;
  currentUser: User;
  onNavigate: (view: string, id?: string) => void;
  onOpenSendToAuthority?: (complaint: Complaint) => void;
  onOpenRejectModal?: (complaint: Complaint) => void;
}

export const ComplaintDetailView: React.FC<ComplaintDetailViewProps> = ({
  complaintId,
  currentUser,
  onNavigate,
  onOpenSendToAuthority,
  onOpenRejectModal,
}) => {
  const complaint = dataStore.getComplaintById(complaintId);

  // Feedback form state
  const [rating, setRating] = useState<number>(complaint?.feedback?.rating || 5);
  const [feedbackComment, setFeedbackComment] = useState<string>(
    complaint?.feedback?.comment || ''
  );
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(
    Boolean(complaint?.feedback)
  );

  if (!complaint) {
    return (
      <div className="p-12 text-center bg-white/80 rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Complaint Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested record <span className="font-semibold">{complaintId}</span> does not exist in the municipal register.
        </p>
        <button
          type="button"
          onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin_complaints' : 'citizen_dashboard')}
          className="mt-4 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.addFeedback(complaint.complaintId, rating, feedbackComment);
    setFeedbackSubmitted(true);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* TOP HEADER / BACK NAV */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onNavigate(isAdmin ? 'admin_complaints' : 'citizen_complaints')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                {complaint.complaintId}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 capitalize mt-0.5">
              {complaint.finalCategory.replace('_', ' ')}
            </h2>
          </div>
        </div>

        {/* ADMIN ACTION SHORTCUTS IF LOGGED IN AS ADMIN */}
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onOpenSendToAuthority && onOpenSendToAuthority(complaint)}
              className="py-2 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Authority (Demo)</span>
            </button>

            {complaint.status !== 'Rejected' && complaint.status !== 'Resolved' && (
              <button
                type="button"
                onClick={() => onOpenRejectModal && onOpenRejectModal(complaint)}
                className="py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TWO COLUMN GRID: PHOTO & AI / LOCATION & MAP */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: IMAGE & AI METRICS (5 COLS) */}
        <div className="md:col-span-5 space-y-6">
          {/* IMAGE CARD */}
          <div className="p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs">
            <img
              src={complaint.imageUrl}
              alt={complaint.finalCategory}
              className="w-full h-64 object-cover rounded-2xl shadow-sm border border-slate-200"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[200px]">{complaint.imageFileName}</span>
              <span className="text-[11px] text-teal-700 font-semibold">Verified Upload</span>
            </div>
          </div>

          {/* AI INFERENCE BREAKDOWN CARD */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>AI Prediction Metrics</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                {Math.round((complaint.aiConfidence || 0.94) * 100)}% Confidence
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Visual Classifier:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {complaint.aiCategory?.replace('_', ' ') || complaint.finalCategory.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Multimodal Weighting:</span>
                <span className="font-semibold text-slate-800">70% Vision + 30% NLP</span>
              </div>
              <div className="flex justify-between">
                <span>Confirmation Status:</span>
                <span className="font-semibold text-emerald-700">
                  {complaint.requiresUserConfirmation ? 'User Verified' : 'Direct High Match'}
                </span>
              </div>
            </div>
          </div>

          {/* RESPONSIBLE DEPARTMENT CARD */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>Assigned Municipal Dept</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{complaint.departmentName}</h4>
            <p className="text-xs text-slate-500">
              Operating under Dahisar {complaint.administrativeWard} ward administration.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] truncate">desk.rnorth@demo-mcgm.gov.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">1916 (Municipal Helpline)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DESCRIPTION, MAP & TIMELINE (7 COLS) */}
        <div className="md:col-span-7 space-y-6">
          {/* DESCRIPTION CARD */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Problem Description</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
              {complaint.description}
            </p>
            {complaint.speechTranscript && complaint.speechTranscript !== complaint.description && (
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Speech Audio Transcript:</span>{' '}
                <em>"{complaint.speechTranscript}"</em>
              </div>
            )}
          </div>

          {/* RESOLUTION TIMELINE COMPONENT */}
          <Timeline complaint={complaint} />

          {/* LOCATION & WARD MAP CARD */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Location & Ward Pin</h3>
                <p className="text-xs text-slate-500">{complaint.address}</p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                {complaint.demoWardNumber}
              </span>
            </div>

            <InteractiveMap
              complaints={[complaint]}
              selectedLocation={{ lat: complaint.latitude, lng: complaint.longitude }}
              highlightWard={complaint.demoWardNumber}
              height="240px"
            />
          </div>

          {/* CITIZEN SATISFACTION FEEDBACK (If Resolved) */}
          {complaint.status === 'Resolved' && (
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Citizen Satisfaction Feedback</h3>
              </div>

              {feedbackSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold">{rating} / 5 Stars</span>
                  </div>
                  <p className="font-medium text-slate-700 mt-2">
                    Comment: "{feedbackComment || 'Resolution verified by resident.'}"
                  </p>
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    ✓ Feedback recorded in ward compliance score.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rate Resolution Quality:
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">{rating} Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Comments / Experience:
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your comments regarding the repair speed, cleanliness, etc."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-xs"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
