export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  DEACTIVATED = 'DEACTIVATED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum DocumentType {
  ID_PROOF = 'ID_PROOF',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',
  BUSINESS_PLAN = 'BUSINESS_PLAN',
  BANK_STATEMENT = 'BANK_STATEMENT',
  TAX_RETURN = 'TAX_RETURN',
  RESUME = 'RESUME',
  OTHER = 'OTHER'
}

export interface FranchiseApplication {
  id: string;
  franchiseId: string;
  franchiseName: string;
  franchiseCategory: string;
  businessOwnerId: string;
  businessOwnerName: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  status: ApplicationStatus;

  // Application Data
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    dateOfBirth: Date;
  };

  financialInfo: {
    netWorth: number;
    liquidCapital: number;
    creditScore: number;
    annualIncome: number;
    investmentCapacity: number;
    hasBusinessExperience: boolean;
    businessExperienceDetails?: string;
    yearsOfExperience?: number;
  };

  businessInfo: {
    preferredLocation: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    preferredStates: string[];
    timelineToOpen: string;
    fullTimeCommitment: boolean;
    hasPartners: boolean;
    partnerDetails?: string;
  };

  // Additional Information
  motivation: string;
  questions: string;
  references: Reference[];
  documents: ApplicationDocument[];

  // Payment Information
  applicationFee: number;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  paidAt?: Date;

  // Review Information
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;

  // Metadata
  submittedAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Legacy interface for backward compatibility
export interface Application extends FranchiseApplication {}

export interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  company?: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  size: number;
  isRequired: boolean;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}



export interface ApplicationCreateData {
  franchiseId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    dateOfBirth: Date;
  };
  financialInfo: {
    netWorth: number;
    liquidCapital: number;
    creditScore: number;
    annualIncome: number;
    investmentCapacity: number;
    hasBusinessExperience: boolean;
    businessExperienceDetails?: string;
    yearsOfExperience?: number;
  };
  businessInfo: {
    preferredLocation: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    preferredStates: string[];
    timelineToOpen: string;
    fullTimeCommitment: boolean;
    hasPartners: boolean;
    partnerDetails?: string;
  };
  motivation: string;
  questions: string;
  references: Reference[];
}

export interface ApplicationReviewData {
  status: ApplicationStatus;
  reviewNotes: string;
  rejectionReason?: string;
}

export interface ApplicationStats {
  totalApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  statusCounts: { [key in ApplicationStatus]: number };
  totalApplicationFees: number;
  averageProcessingTime: number; // in days
}

export interface PaymentTransaction {
  id: string;
  applicationId: string;
  partnerId: string;
  partnerName: string;
  franchiseId: string;
  franchiseName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionReference: string;
  gatewayTransactionId?: string;

  // Payment Details
  cardLast4?: string;
  bankName?: string;
  upiId?: string;

  // Timestamps
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;

  // Metadata
  description: string;
  receiptUrl?: string;
  failureReason?: string;
  refundTransactionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  id: string;
  applicationId: string;
  originalTransactionId: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  // Processing Details
  processedBy?: string;
  processedAt?: Date;
  refundTransactionId?: string;
  refundReference?: string;

  // Metadata
  requestedAt: Date;
  estimatedCompletionDate?: Date;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationTimeline {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  timestamp: Date;
  performedBy?: string;
  notes?: string;
  isSystemGenerated: boolean;
}

// Payment Request System Models
export enum PaymentRequestStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface PaymentRequest {
  id: string;
  applicationId: string;
  franchiseId: string;
  franchiseName: string;
  businessOwnerId: string;
  businessOwnerName: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;

  // Payment Details
  amount: number;
  currency: string;
  purpose: string;
  description?: string;

  // Status and Tracking
  status: PaymentRequestStatus;
  requestedAt: Date;
  dueDate?: Date;
  paidAt?: Date;

  // Payment Transaction Reference
  paymentTransactionId?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum NotificationType {
  PAYMENT_REQUEST = 'PAYMENT_REQUEST',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PARTNERSHIP_DEACTIVATED = 'PARTNERSHIP_DEACTIVATED',
  PARTNERSHIP_REACTIVATED = 'PARTNERSHIP_REACTIVATED',
  APPLICATION_STATUS_CHANGE = 'APPLICATION_STATUS_CHANGE'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  DISMISSED = 'DISMISSED'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;

  // Related Entity References
  applicationId?: string;
  franchiseId?: string;
  paymentRequestId?: string;

  // Action Data
  actionUrl?: string;
  actionText?: string;

  // Status and Timing
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

// Partnership Deactivation Models
export enum DeactivationReason {
  PERFORMANCE_ISSUES = 'PERFORMANCE_ISSUES',
  CONTRACT_VIOLATION = 'CONTRACT_VIOLATION',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  OTHER = 'OTHER'
}

export interface PartnershipDeactivation {
  id: string;
  applicationId: string;
  franchiseId: string;
  businessOwnerId: string;
  partnerId: string;

  // Deactivation Details
  reason: DeactivationReason;
  notes?: string;
  deactivatedAt: Date;
  deactivatedBy: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ApplicationStatus enum is already defined at the top of the file
