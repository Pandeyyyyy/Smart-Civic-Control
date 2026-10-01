import {
  AdminFilters,
  AnalyticsSummary,
  Complaint,
  ComplaintCategory,
  ComplaintFeedback,
  ComplaintStatus,
  DemoWard,
  Department,
  NotificationItem,
  User,
} from '../types';
import {
  DEPARTMENTS,
  DEMO_WARDS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { routeComplaint } from './departmentRouter';
import { authService } from './authService';

const STORAGE_KEYS = {
  COMPLAINTS: 'smart_civic_complaints_v1',
  NOTIFICATIONS: 'smart_civic_notifications_v1',
};

class DataStore {
  private complaints: Complaint[] = [];
  private notifications: NotificationItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    // Subscribe to auth changes
    authService.subscribe(() => {
      this.notify();
    });
  }

  private init() {
    try {
      const storedComplaints = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (storedComplaints) {
        this.complaints = JSON.parse(storedComplaints);
      } else {
        this.complaints = [...INITIAL_COMPLAINTS];
        this.persistComplaints();
      }

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.persistNotifications();
      }
    } catch (e) {
      console.error('Failed to load stored state:', e);
      this.complaints = [...INITIAL_COMPLAINTS];
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  private persistComplaints() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(this.complaints));
    } catch (e) {
      console.error('Storage full or error:', e);
    }
  }

  private persistNotifications() {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Storage full or error:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- User & Auth ---
  public getCurrentUser(): User | null {
    return authService.getCurrentUser();
  }

  // --- Complaints ---
  public getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  public getComplaintById(idOrComplaintId: string): Complaint | undefined {
    return this.complaints.find(
      (c) => c.id === idOrComplaintId || c.complaintId === idOrComplaintId
    );
  }

  public getCitizenComplaints(userId?: string): Complaint[] {
    const user = this.getCurrentUser();
    const targetUserId = userId || (user ? user.id : '');
    return this.complaints.filter((c) => c.userId === targetUserId);
  }

  public createComplaint(data: {
    category: ComplaintCategory;
    description: string;
    speechTranscript?: string;
    speechLanguage?: string;
    latitude: number;
    longitude: number;
    city: string;
    area: string;
    administrativeWard: string;
    demoWardNumber: string;
    wardName: string;
    address: string;
    imageUrl?: string;
    imageFileName?: string;
    aiCategory?: ComplaintCategory;
    aiConfidence?: number;
    textCategory?: ComplaintCategory;
    textConfidence?: number;
    combinedCategory?: ComplaintCategory;
    combinedConfidence?: number;
    requiresUserConfirmation?: boolean;
  }): Complaint {
    const user = this.getCurrentUser();
    const userId = user ? user.id : 'user_guest';
    const citizenName = user ? user.name : 'Citizen User';
    const citizenContact = user ? user.mobile : '+91 98000 00000';

    const routing = routeComplaint(data.category, data.city, data.demoWardNumber);
    const count = this.complaints.length + 1;
    const formattedId = `CMP-2026-${String(count).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      complaintId: formattedId,
      userId,
      citizenName,
      citizenContact,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
      imageFileName: data.imageFileName || 'complaint_photo.jpg',
      aiCategory: data.aiCategory,
      aiConfidence: data.aiConfidence,
      textCategory: data.textCategory,
      textConfidence: data.textConfidence,
      combinedCategory: data.combinedCategory,
      combinedConfidence: data.combinedConfidence,
      finalCategory: data.category,
      requiresUserConfirmation: data.requiresUserConfirmation || false,
      description: data.description,
      speechTranscript: data.speechTranscript,
      speechLanguage: data.speechLanguage,
      city: data.city,
      area: data.area,
      administrativeWard: data.administrativeWard,
      demoWardNumber: data.demoWardNumber,
      wardName: data.wardName,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      departmentId: routing.department.id,
      departmentName: routing.department.departmentName,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          id: `h_${Date.now()}_1`,
          oldStatus: null,
          newStatus: 'Pending',
          remarks: `Complaint filed via Citizen Web Portal. Assigned to ${routing.department.departmentName} (${routing.priority} Priority).`,
          changedBy: citizenName,
          createdAt: now,
        },
      ],
    };

    this.complaints.unshift(newComplaint);
    this.persistComplaints();

    // Create notifications for citizen & admin
    this.addNotification({
      userId,
      complaintId: newComplaint.complaintId,
      title: 'Complaint Registered Successfully',
      message: `Your grievance ${newComplaint.complaintId} has been registered and routed to ${routing.department.departmentName}.`,
      type: 'new_complaint',
    });

    this.addNotification({
      userId: 'user_admin_default',
      complaintId: newComplaint.complaintId,
      title: 'New Complaint Lodged',
      message: `New issue ${newComplaint.complaintId} (${data.category.replace('_', ' ')}) submitted in ${data.demoWardNumber}.`,
      type: 'new_complaint',
    });

    this.notify();
    return newComplaint;
  }

  public updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks: string,
    adminName: string = 'Admin Officer'
  ): boolean {
    const comp = this.getComplaintById(complaintId);
    if (!comp) return false;

    const oldStatus = comp.status;
    comp.status = newStatus;
    comp.updatedAt = new Date().toISOString();

    if (newStatus === 'Resolved') {
      comp.resolvedAt = comp.updatedAt;
    }

    comp.statusHistory.push({
      id: `h_${Date.now()}`,
      oldStatus,
      newStatus,
      remarks,
      changedBy: adminName,
      createdAt: comp.updatedAt,
    });

    this.persistComplaints();

    // Notify citizen
    this.addNotification({
      userId: comp.userId,
      complaintId: comp.complaintId,
      title: `Status Updated: ${newStatus}`,
      message: `Your complaint ${comp.complaintId} is now marked as ${newStatus}. Remarks: ${remarks}`,
      type: 'status_update',
    });

    this.notify();
    return true;
  }

  public rejectComplaint(
    complaintId: string,
    reason: string,
    adminName: string = 'Admin Officer'
  ): boolean {
    const comp = this.getComplaintById(complaintId);
    if (!comp) return false;

    const oldStatus = comp.status;
    comp.status = 'Rejected';
    comp.rejectionReason = reason;
    comp.updatedAt = new Date().toISOString();

    comp.statusHistory.push({
      id: `h_${Date.now()}`,
      oldStatus,
      newStatus: 'Rejected',
      remarks: `Rejected by ${adminName}. Reason: ${reason}`,
      changedBy: adminName,
      createdAt: comp.updatedAt,
    });

    this.persistComplaints();

    this.addNotification({
      userId: comp.userId,
      complaintId: comp.complaintId,
      title: `Complaint Rejected`,
      message: `Your complaint ${comp.complaintId} was rejected. Reason: ${reason}`,
      type: 'status_update',
    });

    this.notify();
    return true;
  }

  public demoSendToAuthority(complaintId: string): {
    success: boolean;
    complaintId: string;
    departmentName: string;
    ward: string;
    message: string;
  } {
    const comp = this.getComplaintById(complaintId);
    if (!comp) {
      throw new Error('Complaint not found');
    }

    comp.sentToAuthorityAt = new Date().toISOString();
    comp.statusHistory.push({
      id: `h_${Date.now()}`,
      oldStatus: comp.status,
      newStatus: comp.status,
      remarks: `[DEMO SHOWCASE ACTION] Simulated transmission packet dispatched to ${comp.departmentName} nodal terminal. (No real external authority was contacted)`,
      changedBy: 'Admin Vikramaditya Shinde',
      createdAt: comp.sentToAuthorityAt,
    });

    this.persistComplaints();
    this.notify();

    return {
      success: true,
      complaintId: comp.complaintId,
      departmentName: comp.departmentName,
      ward: comp.demoWardNumber,
      message: 'Demo Action Completed. No real external authority was contacted.',
    };
  }

  public addFeedback(complaintId: string, rating: number, comment: string): boolean {
    const comp = this.getComplaintById(complaintId);
    if (!comp) return false;

    const feedback: ComplaintFeedback = {
      id: `fb_${Date.now()}`,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    comp.feedback = feedback;
    this.persistComplaints();
    this.notify();
    return true;
  }

  // --- Filtering ---
  public filterComplaints(filters: AdminFilters): Complaint[] {
    return this.complaints.filter((c) => {
      // Search term
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          c.complaintId.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.finalCategory.toLowerCase().includes(query) ||
          c.citizenName.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query) ||
          c.demoWardNumber.toLowerCase().includes(query) ||
          c.departmentName.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // City filter
      if (filters.city && filters.city !== 'All Cities' && c.city !== filters.city) {
        return false;
      }

      // Ward filter
      if (filters.ward && filters.ward !== 'All Wards' && c.demoWardNumber !== filters.ward) {
        return false;
      }

      // Department filter
      if (filters.department && filters.department !== 'All Departments') {
        if (c.departmentId !== filters.department && c.departmentName !== filters.department) {
          return false;
        }
      }

      // Category filter
      if (filters.category && filters.category !== 'All Categories' && c.finalCategory !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'All Statuses' && c.status !== filters.status) {
        return false;
      }

      return true;
    });
  }

  // --- Notifications ---
  public getNotifications(userId?: string): NotificationItem[] {
    const user = this.getCurrentUser();
    const targetUserId = userId || (user ? user.id : '');
    return this.notifications.filter((n) => n.userId === targetUserId);
  }

  public getUnreadNotificationCount(userId?: string): number {
    return this.getNotifications(userId).filter((n) => !n.isRead).length;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persistNotifications();
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId?: string) {
    const user = this.getCurrentUser();
    const targetUserId = userId || (user ? user.id : '');
    this.notifications.forEach((n) => {
      if (n.userId === targetUserId) n.isRead = true;
    });
    this.persistNotifications();
    this.notify();
  }

  private addNotification(data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...data,
    };
    this.notifications.unshift(newNotif);
    this.persistNotifications();
  }

  // --- Analytics ---
  public getAnalytics(filteredList?: Complaint[]): AnalyticsSummary {
    const list = filteredList || this.complaints;
    const total = list.length;
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;
    let rejected = 0;
    let highConfCount = 0;

    const catCounts: Record<string, number> = {};
    const wardCounts: Record<string, number> = {};
    const deptCounts: Record<string, number> = {};

    list.forEach((c) => {
      if (c.status === 'Pending') pending++;
      else if (c.status === 'In Progress') inProgress++;
      else if (c.status === 'Resolved') resolved++;
      else if (c.status === 'Rejected') rejected++;

      if ((c.aiConfidence ?? 0) >= 0.8 || (c.combinedConfidence ?? 0) >= 0.8) {
        highConfCount++;
      }

      catCounts[c.finalCategory] = (catCounts[c.finalCategory] || 0) + 1;
      wardCounts[c.demoWardNumber] = (wardCounts[c.demoWardNumber] || 0) + 1;
      deptCounts[c.departmentName] = (deptCounts[c.departmentName] || 0) + 1;
    });

    const categoryLabels: Record<string, string> = {
      garbage_overflow: 'Garbage Overflow',
      illegal_dumping: 'Illegal Dumping',
      pothole: 'Pothole',
      road_damage: 'Road Damage',
      water_leakage: 'Water Leakage',
      broken_streetlight: 'Broken Streetlight',
      drainage_blockage: 'Drainage Blockage',
      fallen_tree: 'Fallen Tree',
      others: 'Other Issues',
    };

    const byCategory = Object.keys(catCounts).map((cat) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      count: catCounts[cat],
    }));

    const byWard = DEMO_WARDS.map((w) => ({
      ward: w.demoWardNumber,
      count: wardCounts[w.demoWardNumber] || 0,
    }));

    const byDepartment = DEPARTMENTS.map((d) => ({
      department: d.departmentName,
      count: deptCounts[d.departmentName] || 0,
    }));

    // Generate 7-day trend
    const trend = [
      { date: 'Sep 24', submitted: 4, resolved: 3 },
      { date: 'Sep 25', submitted: 3, resolved: 2 },
      { date: 'Sep 26', submitted: 5, resolved: 4 },
      { date: 'Sep 27', submitted: 4, resolved: 3 },
      { date: 'Sep 28', submitted: 6, resolved: 4 },
      { date: 'Sep 29', submitted: 7, resolved: 5 },
      { date: 'Sep 30', submitted: total > 20 ? 8 : 4, resolved: 3 },
    ];

    return {
      totalComplaints: total,
      pendingCount: pending,
      inProgressCount: inProgress,
      resolvedCount: resolved,
      rejectedCount: rejected,
      avgResolutionDays: 1.8,
      highConfidenceRatio: total > 0 ? Number((highConfCount / total).toFixed(2)) : 0.92,
      byCategory,
      byWard,
      byDepartment,
      trend,
    };
  }

  // --- Switch Role for Demo Testing ---
  public switchRole(role: 'citizen' | 'admin') {
    const creds = authService.getDemoCredentials();
    if (role === 'admin') {
      authService.login(creds.admin.email, creds.admin.password);
    } else {
      authService.login(creds.citizen.email, creds.citizen.password);
    }
    this.notify();
  }

  // --- Reset to Default Seed Data ---
  public resetToDefaults() {
    this.complaints = [...INITIAL_COMPLAINTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.persistComplaints();
    this.persistNotifications();
    this.notify();
  }
}

export const dataStore = new DataStore();
