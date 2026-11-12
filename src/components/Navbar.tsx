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
  const [mobileHomeMenuOpen, setMobileHomeMenuOpen] = useState(false);

  const isHomePage = currentView === 'home';
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
    <header
      className={
        isHomePage
          ? 'sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 lg:px-8 transition-all'
          : 'sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#031223]/80 backdrop-blur-xl shadow-lg shadow-black/40 transition-all'
      }
    >
      <div
        className={
          isHomePage
            ? 'max-w-7xl mx-auto h-16 px-4 sm:px-6 rounded-full bg-[#031223]/75 backdrop-blur-xl border border-cyan-500/25 shadow-xl shadow-black/40 flex items-center justify-between'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'
        }
      >
        {/* LEFT: LOGO SYMBOL + BRAND TITLE + MOBILE TOGGLE */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {currentUser ? (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          ) : (
            isHomePage && (
              <button
                type="button"
                onClick={() => setMobileHomeMenuOpen(!mobileHomeMenuOpen)}
                className="lg:hidden p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileHomeMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )
          )}

          {/* OFFICIAL LOGO SYMBOL + CLEAN SEPARATE TEXT */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <LogoSymbol size={36} showAura />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-tight">
                Smart Civic Connect
              </span>
              <span className="text-[10px] font-medium text-[#00D6B8] hidden sm:inline -mt-0.5">
                AI Urban Service Platform
              </span>
            </div>
          </div>

          {/* DESKTOP PUBLIC NAVIGATION LINKS (CENTER ON HOMEPAGE) */}
          {!isHomePage && (
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-cyan-500/20 text-xs font-medium text-slate-300">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors ${
                  currentView === 'home' ? 'text-[#00D6B8] font-semibold bg-cyan-950/60 border border-cyan-500/30' : ''
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'about')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'how-it-works')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'categories')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'contact')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                Contact
              </button>
            </nav>
          )}
        </div>

        {/* HOMEPAGE CENTER NAVIGATION LINKS */}
        {isHomePage && (
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                currentView === 'home'
                  ? 'text-[#00D6B8] font-semibold bg-cyan-950/60 border border-cyan-500/30 shadow-xs'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'about')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'how-it-works')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'categories')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('home', 'contact')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors"
            >
              Contact
            </button>
          </nav>
        )}

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
                  className="w-36 sm:w-56 pl-3 pr-7 py-1.5 rounded-full text-xs focus:outline-none transition-all shadow-md border border-cyan-500/30 bg-[#071A2F]/90 text-white placeholder-slate-400 focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowSearchBar(false)}
                  className="absolute right-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearchBar(true)}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* DEMO MODE INDICATOR */}
          <DemoBanner isDark={true} />

          {/* AUTHENTICATION STATE: LOGGED IN vs. GUEST */}
          {currentUser ? (
            <>
              {/* NOTIFICATIONS BELL */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="relative p-2 rounded-full border border-transparent hover:border-cyan-500/30 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs bg-[#00D6B8] text-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS PANEL POPOVER */}
                {showNotifPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl backdrop-blur-2xl border border-cyan-500/30 bg-[#031223]/95 shadow-2xl shadow-black/70 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                    <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 text-[#00D6B8] border border-cyan-500/30">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onMarkAllNotificationsRead()}
                          className="text-[11px] font-medium flex items-center space-x-1 text-[#00D6B8] hover:text-cyan-300"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-cyan-500/15 max-h-80 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs py-6 text-center text-slate-400">
                          No notifications yet.
                        </p>
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
                            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                              !n.isRead
                                ? 'bg-cyan-950/40 hover:bg-cyan-900/40'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-semibold text-white">
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full mt-1 shrink-0 bg-[#00D6B8]" />
                              )}
                            </div>
                            <p className="text-xs mt-0.5 line-clamp-2 text-slate-300">
                              {n.message}
                            </p>
                            <span className="text-[10px] mt-1 block text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* USER PROFILE CARD WITH AUTHENTICATED NAME */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-1.5 rounded-full border border-transparent hover:border-cyan-500/30 hover:bg-white/10 transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                      currentUser.role === 'admin' ? 'bg-[#0F766E]' : 'bg-slate-700'
                    }`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-white">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] capitalize text-cyan-400">
                      {currentUser.role === 'admin' ? 'Municipal Administrator' : 'Verified Citizen'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 hidden lg:inline text-slate-300" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl backdrop-blur-2xl border border-cyan-500/30 bg-[#031223]/95 text-white shadow-2xl shadow-black/70 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-2.5 mb-2 border-b border-cyan-500/20">
                      <p className="text-xs font-bold text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-cyan-950/80 text-[#00D6B8] border border-cyan-500/30">
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
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center space-x-2 text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#00D6B8]" />
                        <span>Go to Dashboard</span>
                      </button>

                      {currentUser.role === 'citizen' && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate('report_problem');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center space-x-2 text-slate-200 hover:bg-white/10 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-[#00D6B8]" />
                          <span>Report a Problem</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('profile');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center space-x-2 text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </button>

                      <div className="pt-1.5 mt-1 border-t border-cyan-500/20">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 font-medium transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
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
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="py-1.5 px-3 sm:px-4 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 border border-cyan-500/20 transition-all"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="py-1.5 px-3.5 sm:px-4 rounded-full text-xs font-semibold shadow-md bg-gradient-to-r from-[#0F766E] to-[#00D6B8] hover:from-[#115E59] hover:to-[#22D3EE] text-white shadow-cyan-950/40 transition-all hover:scale-[1.02]"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE PUBLIC NAVIGATION DROPDOWN (HOMEPAGE ONLY) */}
      {isHomePage && mobileHomeMenuOpen && !currentUser && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto p-4 rounded-3xl bg-[#031223]/95 backdrop-blur-2xl border border-cyan-500/25 shadow-2xl text-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => {
                handleNavClick('home');
                setMobileHomeMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-[#00D6B8] bg-cyan-950/50 border border-cyan-500/25"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavClick('home', 'about');
                setMobileHomeMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavClick('home', 'how-it-works');
                setMobileHomeMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavClick('home', 'categories');
                setMobileHomeMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => {
                handleNavClick('home', 'contact');
                setMobileHomeMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
            >
              Contact
            </button>
            <div className="pt-2 border-t border-cyan-500/20 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onNavigate('login');
                  setMobileHomeMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 border border-cyan-500/20 text-center"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('register');
                  setMobileHomeMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#00D6B8] text-center"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
