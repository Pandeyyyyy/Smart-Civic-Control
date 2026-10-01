export type UserRole = 'citizen' | 'admin' | 'authority';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export type ComplaintCategory =
  | 'garbage_overflow'
  | 'pothole'
  | 'water_leakage'
  | 'broken_streetlight'
  | 'drainage_blockage'
  | 'illegal_dumping'
  | 'road_damage'
  | 'fallen_tree'
  | 'others';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export interface PredictionScore {
  category: ComplaintCategory;
  confidence: number;
}

export interface AIAnalysisResult {
  predictedCategory: ComplaintCategory;
  confidence: number; // 0 to 1
  confidenceLevel: 'High' | 'Medium' | 'Low';
  topPredictions: PredictionScore[];
  isModelInstalled: boolean;
  modelVersion: string;
  analysisSource: 'gemini_multimodal' | 'mobilenet_v2_local' | 'rule_fallback';
  explanation?: string;
}

export interface StatusHistoryEntry {
  id: string;
  oldStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  remarks: string;
  changedBy: string;
  createdAt: string;
}

export interface ComplaintFeedback {
  id: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string; // Database ID (e.g., uuid)
  complaintId: string; // Formatted public ID (e.g., CMP-2026-000012)
  userId: string;
  citizenName: string;
  citizenContact: string;

  imagePath?: string;
  imageUrl?: string;
  imageFileName?: string;

  // AI & Multimodal
  aiCategory?: ComplaintCategory;
  aiConfidence?: number;
  textCategory?: ComplaintCategory;
  textConfidence?: number;
  combinedCategory?: ComplaintCategory;
  combinedConfidence?: number;
  finalCategory: ComplaintCategory;
  requiresUserConfirmation?: boolean;
  aiAnalysisDetails?: AIAnalysisResult;

  // Description & Audio
  description: string;
  speechTranscript?: string;
  speechLanguage?: string;

  // Location & Ward
  city: string; // e.g. "Mumbai"
  area: string; // e.g. "Dahisar"
  administrativeWard: string; // e.g. "R/North"
  demoWardNumber: string; // e.g. "Demo Ward 03"
  wardName: string; // e.g. "Dahisar West (Demo)"
  latitude: number;
  longitude: number;
  address: string;

  // Routing
  departmentId: string;
  departmentName: string;

  // Status & Lifecycle
  status: ComplaintStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;

  // History & Feedback
  statusHistory: StatusHistoryEntry[];
  feedback?: ComplaintFeedback;

  // Demo showcase flag
  sentToAuthorityAt?: string;
}

export interface Department {
  id: string;
  departmentName: string;
  shortCode: string;
  description: string;
  headOfficer: string;
  contactEmail: string;
  color: string;
}

export interface DemoWard {
  id: string;
  city: string;
  administrativeWard: string;
  demoWardNumber: string;
  wardName: string;
  centerLat: number;
  centerLng: number;
  populationEstimate: number;
  activeComplaintsCount: number;
}

export interface DepartmentRule {
  id: string;
  category: ComplaintCategory;
  city: string;
  wardNumber: string;
  departmentId: string;
  priority: 'Immediate' | 'High' | 'Normal';
  active: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  complaintId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'status_update' | 'new_complaint' | 'system';
  createdAt: string;
}

export interface AdminFilters {
  city: string;
  ward: string;
  department: string;
  category: string;
  status: string;
  search: string;
  dateRange: string;
}

export interface AnalyticsSummary {
  totalComplaints: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  avgResolutionDays: number;
  highConfidenceRatio: number;
  byCategory: { category: string; count: number; label: string }[];
  byWard: { ward: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  trend: { date: string; submitted: number; resolved: number }[];
}
