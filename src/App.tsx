import React, { useState, useEffect, useRef } from 'react';
import { User, Complaint } from './types';
import { dataStore } from './services/dataStore';
import { authService } from './services/authService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SendToAuthorityModal } from './components/SendToAuthorityModal';
import { RejectComplaintModal } from './components/RejectComplaintModal';

// Views
import { HomeView } from './views/HomeView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { CitizenDashboardView } from './views/CitizenDashboardView';
import { ReportProblemView } from './views/ReportProblemView';
import { CitizenComplaintsView } from './views/CitizenComplaintsView';
import { ComplaintDetailView } from './views/ComplaintDetailView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminComplaintsView } from './views/AdminComplaintsView';
import { AdminMapView } from './views/AdminMapView';
import { AdminWardsView } from './views/AdminWardsView';
import { AdminDepartmentsView } from './views/AdminDepartmentsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { ProfileHelpViews } from './views/ProfileHelpViews';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(dataStore.getCurrentUser());
  const [complaints, setComplaints] = useState<Complaint[]>(dataStore.getComplaints());
  const [notifications, setNotifications] = useState(dataStore.getNotifications());
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [authorityModalComplaint, setAuthorityModalComplaint] = useState<Complaint | null>(null);
  const [isAuthorityConfirmed, setIsAuthorityConfirmed] = useState<boolean>(false);
  const [rejectModalComplaint, setRejectModalComplaint] = useState<Complaint | null>(null);

  // Background Earth Video state & accessibility controls
  const earthVideoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (currentView !== 'home') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotion = (e: MediaQueryListEvent | MediaQueryList) => {
      if (earthVideoRef.current) {
        if (e.matches) {
          earthVideoRef.current.pause();
        } else {
          earthVideoRef.current.play().catch(() => {});
        }
      }
    };
    handleMotion(mediaQuery);
    mediaQuery.addEventListener('change', handleMotion);
    return () => mediaQuery.removeEventListener('change', handleMotion);
  }, [currentView]);

  // Subscribe to data store updates & auth
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
      setComplaints(dataStore.getComplaints());
      setNotifications(dataStore.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('citizen_dashboard');
    }
  };

  const handleRoleSwitch = (role: 'citizen' | 'admin') => {
    dataStore.switchRole(role);
    if (role === 'admin') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('citizen_dashboard');
    }
  };

  const handleNavigate = (view: string, complaintIdOrPreset?: string) => {
    // Protected citizen and admin views require authentication
    if (!currentUser && (
      view === 'report_problem' ||
      view === 'citizen_dashboard' ||
      view === 'citizen_complaints' ||
      view === 'track_complaint' ||
      view === 'admin_dashboard' ||
      view === 'admin_complaints' ||
      view === 'admin_map' ||
      view === 'admin_wards' ||
      view === 'admin_departments' ||
      view === 'admin_analytics' ||
      view === 'profile'
    )) {
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'report_problem' && complaintIdOrPreset) {
      setActivePresetId(complaintIdOrPreset);
    } else if (view === 'complaint_detail' && complaintIdOrPreset) {
      setActiveComplaintId(complaintIdOrPreset);
    } else if (view === 'track_complaint') {
      // Default to the most recent complaint if available
      const first = complaints[0];
      if (first) {
        setActiveComplaintId(first.complaintId);
        setCurrentView('complaint_detail');
        return;
      }
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authority Modal Handlers
  const handleOpenSendToAuthority = (complaint: Complaint) => {
    setAuthorityModalComplaint(complaint);
    setIsAuthorityConfirmed(false);
  };

  const handleConfirmSendToAuthority = () => {
    if (authorityModalComplaint) {
      dataStore.demoSendToAuthority(authorityModalComplaint.complaintId);
      setIsAuthorityConfirmed(true);
    }
  };

  // Reject Modal Handlers
  const handleOpenRejectModal = (complaint: Complaint) => {
    setRejectModalComplaint(complaint);
  };

  const handleConfirmReject = (reason: string) => {
    if (rejectModalComplaint) {
      dataStore.rejectComplaint(rejectModalComplaint.complaintId, reason, currentUser?.name || 'Municipal Admin');
      setRejectModalComplaint(null);
    }
  };

  const unreadNotifCount = currentUser ? dataStore.getUnreadNotificationCount(currentUser.id) : 0;

  // Determine if sidebar should be visible (on Home, Login, Register: full-width clean experience)
  const showSidebar = Boolean(currentUser && currentView !== 'home' && currentView !== 'login' && currentView !== 'register');

  // Fallback demo user if an unauthenticated user enters a protected view directly
  const activeUser = currentUser || {
    id: 'user_cit_default',
    name: 'Hemant Pandey',
    email: 'citizen@smartcivic.in',
    mobile: '+91 98201 44521',
    role: 'citizen' as const,
    createdAt: new Date().toISOString(),
  };

  const isHomePage = currentView === 'home';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden ${
        isHomePage
          ? 'bg-transparent text-white selection:bg-[#00D6B8]/30 selection:text-[#22D3EE]'
          : 'bg-transparent text-white selection:bg-[#00D6B8]/30 selection:text-[#22D3EE]'
      }`}
    >
      {/* SINGLE REUSABLE FULL-SCREEN ROTATING EARTH VIDEO BACKGROUND (HOMEPAGE ONLY) */}
      {isHomePage && (
        <div
          className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-[#020817]"
          aria-hidden="true"
        >
          {!videoError && (
            <video
              ref={earthVideoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={() => {
                setVideoLoaded(true);
                earthVideoRef.current?.play().catch(() => {});
              }}
              onError={() => setVideoError(true)}
              className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              src="/Earth_rotating.mp4"
            />
          )}

          {/* Subtle dark cinematic overlay: slightly stronger on left for hero typography while preserving Earth on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/90 via-[#020817]/60 to-[#020817]/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/75 via-transparent to-[#020817]/85" />
        </div>
      )}

      {/* SINGLE REUSABLE FULL-SCREEN NEBULA SPACE BACKGROUND (ALL NON-HOME PAGES) */}
      {!isHomePage && (
        <div
          className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-[#020817]"
          aria-hidden="true"
        >
          <img
            src="/Nebula_space.png"
            alt="Nebula space background"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle dark cinematic overlay to ensure excellent readability of content, cards and text */}
          <div className="absolute inset-0 bg-[#020817]/35" />
        </div>
      )}

      {/* GLOBAL GLASS TOP NAVBAR */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentView={currentView}
        notifications={notifications}
        onMarkNotificationRead={(id) => dataStore.markNotificationAsRead(id)}
        onMarkAllNotificationsRead={() => currentUser && dataStore.markAllNotificationsAsRead(currentUser.id)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex w-full relative z-10">
        {/* SIDEBAR (VISIBLE ON DASHBOARD & OPERATIONAL VIEWS) */}
        {showSidebar && (
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            unreadCount={unreadNotifCount}
          />
        )}

        {/* MAIN CONTENT VIEW CONTAINER */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all relative z-10 ${
            !showSidebar ? 'max-w-none p-0 sm:p-0 lg:p-0' : ''
          }`}
        >
          {/* 1. PUBLIC HOME */}
          {currentView === 'home' && (
            <HomeView currentUser={currentUser} onNavigate={handleNavigate} />
          )}

          {/* 2. AUTHENTICATION: LOGIN */}
          {currentView === 'login' && (
            <LoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )}

          {/* 3. AUTHENTICATION: REGISTER */}
          {currentView === 'register' && (
            <RegisterView onRegisterSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )}

          {/* 4. CITIZEN DASHBOARD */}
          {currentView === 'citizen_dashboard' && (
            <CitizenDashboardView
              currentUser={activeUser}
              complaints={complaints}
              onNavigate={handleNavigate}
            />
          )}

          {/* 5. REPORT PROBLEM WIZARD */}
          {currentView === 'report_problem' && (
            <ReportProblemView
              currentUser={activeUser}
              onNavigate={handleNavigate}
              initialPresetId={activePresetId}
            />
          )}

          {/* 6. MY COMPLAINTS LIST */}
          {currentView === 'citizen_complaints' && (
            <CitizenComplaintsView
              currentUser={activeUser}
              complaints={complaints}
              onNavigate={handleNavigate}
            />
          )}

          {/* 7. COMPLAINT DETAILS & RESOLUTION TIMELINE */}
          {currentView === 'complaint_detail' && (
            <ComplaintDetailView
              complaintId={activeComplaintId || complaints[0]?.complaintId || ''}
              currentUser={activeUser}
              onNavigate={handleNavigate}
              onOpenSendToAuthority={handleOpenSendToAuthority}
              onOpenRejectModal={handleOpenRejectModal}
            />
          )}

          {/* 8. ADMIN DASHBOARD */}
          {currentView === 'admin_dashboard' && (
            <AdminDashboardView
              currentUser={activeUser}
              complaints={complaints}
              onNavigate={handleNavigate}
              onOpenSendToAuthority={handleOpenSendToAuthority}
              onOpenRejectModal={handleOpenRejectModal}
            />
          )}

          {/* 9. ADMIN COMPLAINTS OPERATION TABLE */}
          {currentView === 'admin_complaints' && (
            <AdminComplaintsView
              complaints={complaints}
              onNavigate={handleNavigate}
              onOpenSendToAuthority={handleOpenSendToAuthority}
              onOpenRejectModal={handleOpenRejectModal}
            />
          )}

          {/* 10. ADMIN GEOSPATIAL MAP VIEW */}
          {currentView === 'admin_map' && (
            <AdminMapView complaints={complaints} onNavigate={handleNavigate} />
          )}

          {/* 11. ADMIN DEMO WARDS */}
          {currentView === 'admin_wards' && (
            <AdminWardsView complaints={complaints} onNavigate={handleNavigate} />
          )}

          {/* 12. ADMIN DEPARTMENTS */}
          {currentView === 'admin_departments' && (
            <AdminDepartmentsView complaints={complaints} />
          )}

          {/* 13. ADMIN ANALYTICS */}
          {currentView === 'admin_analytics' && (
            <AdminAnalyticsView complaints={complaints} />
          )}

          {/* 14. PROFILE / HELP / NOTIFICATIONS / SETTINGS */}
          {(currentView === 'profile' ||
            currentView === 'help' ||
            currentView === 'notifications' ||
            currentView === 'settings') && (
            <ProfileHelpViews
              view={currentView as any}
              currentUser={activeUser}
              complaints={complaints}
              notifications={notifications}
              onNavigate={handleNavigate}
              onMarkNotificationRead={(id) => dataStore.markNotificationAsRead(id)}
              onMarkAllNotificationsRead={() =>
                currentUser && dataStore.markAllNotificationsAsRead(currentUser.id)
              }
            />
          )}
        </main>
      </div>

      {/* DEMO SHOWCASE ONLY MODAL: SEND TO AUTHORITY */}
      <SendToAuthorityModal
        complaint={authorityModalComplaint}
        isOpen={Boolean(authorityModalComplaint)}
        onClose={() => setAuthorityModalComplaint(null)}
        onConfirm={handleConfirmSendToAuthority}
        isConfirmed={isAuthorityConfirmed}
      />

      {/* REJECT COMPLAINT MODAL */}
      <RejectComplaintModal
        complaint={rejectModalComplaint}
        isOpen={Boolean(rejectModalComplaint)}
        onClose={() => setRejectModalComplaint(null)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
