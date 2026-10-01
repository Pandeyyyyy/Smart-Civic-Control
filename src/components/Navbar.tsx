import React, { useState } from 'react';
import { LogoSymbol } from './LogoSymbol';
import { DemoBanner } from './DemoBanner';
import { User, NotificationItem } from '../types';
import {
  Bell,
  Check,
  ChevronDown,
  Menu,
  Shield,
  User as UserIcon,
  X,
  ExternalLink,
  LogOut,
  Search,
  LayoutDashboard,
  PlusCircle,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (view: string, idOrHash?: string) => void;
  onLogout: () => void;
  currentView: string;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  onLogout,
  currentView,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNavClick = (view: string, sectionId?: string) => {
    onNavigate(view, sectionId);
    if (sectionId && view === 'home') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (currentUser?.role === 'admin') {
      onNavigate('admin_complaints');
    } else if (currentUser) {
      onNavigate('citizen_complaints');
    } else {
      onNavigate('home', 'categories');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/75 backdrop-blur-xl shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LEFT: MOBILE TOGGLE + OFFICIAL LOGO SYMBOL + BRAND TITLE */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* OFFICIAL LOGO SYMBOL + CLEAN SEPARATE TEXT */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <LogoSymbol size={36} showAura />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#0F766E] transition-colors leading-tight">
                Smart Civic Connect
              </span>
              <span className="text-[10px] text-teal-700 font-medium hidden sm:inline -mt-0.5">
                AI Urban Service Platform
              </span>
            </div>
          </div>

          {/* DESKTOP PUBLIC NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-200/80 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition-colors ${
                currentView === 'home' ? 'text-[#0F766E] font-semibold bg-teal-50/50' : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'about')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'how-it-works')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'categories')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'contact')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
            >
              Contact
            </button>
          </nav>
        </div>

        {/* RIGHT CONTROLS: SEARCH + DEMO BANNER + AUTH/PROFILE */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* SEARCH TOGGLE / INPUT */}
          <div className="relative">
            {showSearchBar ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grievance or ward..."
                  className="w-40 sm:w-56 pl-3 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSearchBar(false)}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearchBar(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* DEMO MODE INDICATOR */}
          <DemoBanner />

          {/* AUTHENTICATION STATE: LOGGED IN vs. GUEST */}
          {currentUser ? (
            <>
              {/* NOTIFICATIONS BELL */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS PANEL POPOVER */}
                {showNotifPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onMarkAllNotificationsRead()}
                          className="text-[11px] text-teal-700 hover:text-teal-800 font-medium flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              onMarkNotificationRead(n.id);
                              if (n.complaintId) {
                                onNavigate('complaint_detail', n.complaintId);
                                setShowNotifPanel(false);
                              }
                            }}
                            className={`p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${
                              !n.isRead ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#0F766E] mt-1 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* USER PROFILE CARD WITH AUTHENTICATED NAME (NO HARD-CODED IDENTITY) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                      currentUser.role === 'admin' ? 'bg-[#0F766E]' : 'bg-slate-700'
                    }`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {currentUser.role === 'admin' ? 'Municipal Administrator' : 'Verified Citizen'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                    <div className="pb-2.5 mb-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 uppercase tracking-wider">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(currentUser.role === 'admin' ? 'admin_dashboard' : 'citizen_dashboard');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-teal-700" />
                        <span>Go to Dashboard</span>
                      </button>

                      {currentUser.role === 'citizen' && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate('report_problem');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-teal-700" />
                          <span>Report a Problem</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('profile');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>My Profile</span>
                      </button>

                      <div className="pt-1.5 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* GUEST STATE: SIGN IN & REGISTER */
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="py-1.5 px-3.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="py-1.5 px-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
