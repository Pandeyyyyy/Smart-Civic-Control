import React, { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
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

      <div className="flex-1 flex w-full">
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
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all ${
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
