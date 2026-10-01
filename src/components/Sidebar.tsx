import React from 'react';
import { LogoSymbol } from './LogoSymbol';
import { User } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  Bell,
  User as UserIcon,
  HelpCircle,
  LogOut,
  Map,
  Layers,
  Building2,
  BarChart3,
  Settings,
  Shield,
  Home,
} from 'lucide-react';

interface SidebarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  unreadCount = 0,
}) => {
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const citizenNavItems = [
    { id: 'citizen_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report_problem', label: 'Report Problem', icon: PlusCircle, highlight: true },
    { id: 'citizen_complaints', label: 'My Complaints', icon: FileText },
    { id: 'track_complaint', label: 'Track Complaint', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
  ];

  const adminNavItems = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin_complaints', label: 'Complaints', icon: FileText },
    { id: 'admin_map', label: 'Map View', icon: Map },
    { id: 'admin_wards', label: 'Demo Wards', icon: Layers },
    { id: 'admin_departments', label: 'Departments', icon: Building2 },
    { id: 'admin_analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : citizenNavItems;

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col justify-between p-4 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* TOP BRAND AREA */}
        <div>
          <div
            onClick={() => handleItemClick('home')}
            className="flex items-center space-x-3 px-2 py-3 mb-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors select-none"
          >
            <LogoSymbol size={42} showAura />
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                Smart Civic Connect
              </span>
              {isAdmin ? (
                <div className="flex items-center space-x-1 text-[11px] font-bold text-[#0F766E] tracking-wider uppercase">
                  <Shield className="w-3 h-3" />
                  <span>ADMIN OPERATIONS</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">Citizen Portal</span>
              )}
            </div>
          </div>

          {/* SECTION HEADER */}
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'MUNICIPAL OPERATIONS' : 'CITIZEN SERVICES'}
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="mt-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isHighlight = (item as any).highlight;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-teal-50/80 text-teal-800 font-semibold shadow-xs'
                      : isHighlight
                      ? 'bg-[#0F766E] text-white hover:bg-[#115E59] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#0F766E]" />
                    )}
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-[#0F766E]'
                          : isHighlight
                          ? 'text-white'
                          : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE & LOGOUT */}
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          {/* Quick Home view shortcut */}
          <button
            type="button"
            onClick={() => handleItemClick('home')}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Public Home</span>
          </button>

          {/* Authenticated User Display Card */}
          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/60">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-900 truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-white border border-slate-200 text-teal-800">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onLogout();
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
