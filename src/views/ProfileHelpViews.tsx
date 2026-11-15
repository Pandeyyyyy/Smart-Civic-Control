import React from 'react';
import { User, NotificationItem, Complaint } from '../types';
import { dataStore } from '../services/dataStore';
import {
  User as UserIcon,
  HelpCircle,
  Bell,
  Settings,
  Shield,
  RotateCcw,
  CheckCircle2,
  Cpu,
  MapPin,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface ProfileHelpViewsProps {
  view: 'profile' | 'help' | 'notifications' | 'settings';
  currentUser: User;
  complaints: Complaint[];
  notifications: NotificationItem[];
  onNavigate: (view: string, id?: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export const ProfileHelpViews: React.FC<ProfileHelpViewsProps> = ({
  view,
  currentUser,
  complaints,
  notifications,
  onNavigate,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) => {
  // PROFILE VIEW
  if (view === 'profile') {
    const userComplaints = complaints.filter((c) => c.userId === currentUser.id);
    const resolved = userComplaints.filter((c) => c.status === 'Resolved').length;

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-16">
        <div className="p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-[#0F766E] to-[#00D6B8] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-teal-500/30 border border-cyan-400/50">
            {currentUser.name.charAt(0)}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
            <p className="text-xs text-slate-300">{currentUser.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-[#00D6B8] border border-cyan-500/30">
              {currentUser.role.toUpperCase()} ACCOUNT
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#071A2F]/70 border border-cyan-500/20 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile</span>
              <span className="font-semibold text-white">{currentUser.mobile}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Complaints</span>
              <span className="font-bold text-[#00D6B8]">{userComplaints.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Resolved</span>
              <span className="font-bold text-emerald-400">{resolved}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HELP & FAQ VIEW
  if (view === 'help') {
    const faqs = [
      {
        q: 'How does the AI multimodal analysis work?',
        a: 'The system uses a two-stage multimodal classification pipeline: First, the image is processed via visual feature extraction (MobileNetV2 / Gemini vision) yielding 70% of the category score. Second, your typed or spoken description is processed via NLP intent recognition (30% weight). If both modalities align, high confidence is achieved. If they clash, the system prompts for user confirmation.',
      },
      {
        q: 'How are wards determined?',
        a: 'CRITICAL ARCHITECTURAL RULE: Wards are derived exclusively from geographic coordinates (browser GPS or Dahisar demo location boundaries), NEVER from image AI. The system maps coordinates to Demo Wards 01–06 in Dahisar, Mumbai (R/North).',
      },
      {
        q: 'What does "Send to Authority" do?',
        a: 'Per master specification, "Send to Authority" is strictly a DEMO/SHOWCASE ACTION for academic presentation. It never sends real SMS, emails, or government API requests.',
      },
      {
        q: 'Which civic categories are supported?',
        a: 'Garbage Overflow, Illegal Dumping, Pothole, Road Damage, Water Leakage, Broken Streetlight, Drainage Blockage, Fallen Tree, and Other Civic Problems.',
      },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div className="p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-[#00D6B8] uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PROJECT DOCUMENTATION & FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            System Guide & Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Technical architecture guidelines and operational principles for Smart Civic Connect.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 space-y-2"
            >
              <h3 className="text-sm font-bold text-white">{faq.q}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // NOTIFICATIONS VIEW
  if (view === 'notifications') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">All Notifications</h2>
            <p className="text-xs text-slate-400 mt-1">Updates on complaint lifecycle changes</p>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <button
              type="button"
              onClick={onMarkAllNotificationsRead}
              className="text-xs font-semibold text-[#00D6B8] hover:text-cyan-300 cursor-pointer transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="p-4 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 divide-y divide-cyan-500/15">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">No notifications available.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkNotificationRead(n.id);
                  if (n.complaintId) onNavigate('complaint_detail', n.complaintId);
                }}
                className={`p-4 rounded-2xl transition-colors cursor-pointer hover:bg-[#071A2F]/80 ${
                  !n.isRead ? 'bg-cyan-950/40 border border-cyan-500/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                {n.complaintId && (
                  <span className="inline-block mt-2 text-[10px] font-semibold text-[#00D6B8]">
                    View Complaint #{n.complaintId} →
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // SETTINGS VIEW
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="p-6 sm:p-8 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40">
        <h2 className="text-xl sm:text-2xl font-bold text-white">System Settings & Data</h2>
        <p className="text-xs text-slate-300 mt-1">Manage simulation data state and engine configs.</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 space-y-4">
        <h3 className="text-sm font-bold text-white">Reset Demo Simulation State</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Restore the initial 22 realistic complaints across Demo Wards 01–06 in Dahisar, Mumbai, resetting status history and clearing custom test complaints.
        </p>
        <button
          type="button"
          onClick={() => {
            dataStore.resetToDefaults();
            alert('Simulation state reset to default 22 complaints.');
          }}
          className="py-2.5 px-4 rounded-xl bg-[#071A2F]/80 hover:bg-[#071A2F] text-white hover:text-[#00D6B8] border border-cyan-500/30 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default 22 Complaints</span>
        </button>
      </div>
    </div>
  );
};
