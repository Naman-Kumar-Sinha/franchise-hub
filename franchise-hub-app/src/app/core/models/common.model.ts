// Common interfaces and types used across the application

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: { [key: string]: any };
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalFranchises: number;
  totalApplications: number;
  totalTransactions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'franchise_created' | 'application_submitted' | 'transaction_completed';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  relatedId?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
  userType?: 'business' | 'partner' | 'other';
}

export interface FeedbackForm {
  rating: number;
  title: string;
  message: string;
  category: 'bug' | 'feature' | 'improvement' | 'general';
  userId?: string;
  userEmail?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

export interface AppSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  features: {
    enableRegistration: boolean;
    enableNotifications: boolean;
    enableFileUploads: boolean;
    maintenanceMode: boolean;
  };
  fees: {
    platformFeePercentage: number;
    businessFeePercentage: number;
    partnerFeePercentage: number;
  };
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingWrapper<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}
