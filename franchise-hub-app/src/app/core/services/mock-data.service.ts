import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Franchise, FranchiseCategory, FranchiseStatus, FranchiseFormData, FranchisePerformanceMetrics, FranchiseManagementFilters } from '../models/franchise.model';
import {
  FranchiseApplication,
  Application,
  ApplicationStatus,
  PaymentStatus,
  DocumentType,
  ApplicationDocument,
  Reference,
  PaymentTransaction,
  RefundRequest,
  ApplicationTimeline,
  ApplicationCreateData,
  ApplicationReviewData,
  PaymentRequest,
  PaymentRequestStatus,
  Notification,
  NotificationType,
  NotificationStatus,
  PartnershipDeactivation,
  DeactivationReason
} from '../models/application.model';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../models/transaction.model';
import { User, UserRole } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // Storage keys for persistence
  private readonly STORAGE_KEYS = {
    FRANCHISES: 'franchise_hub_franchises',
    APPLICATIONS: 'franchise_hub_applications',
    TRANSACTIONS: 'franchise_hub_transactions',
    PAYMENT_TRANSACTIONS: 'franchise_hub_payment_transactions',
    REFUND_REQUESTS: 'franchise_hub_refund_requests',
    APPLICATION_TIMELINES: 'franchise_hub_application_timelines',
    PAYMENT_REQUESTS: 'franchise_hub_payment_requests',
    NOTIFICATIONS: 'franchise_hub_notifications',
    PARTNERSHIP_DEACTIVATIONS: 'franchise_hub_partnership_deactivations',
    USERS: 'franchise_hub_users'
  };

  // Reactive data subjects for real-time synchronization
  private franchisesSubject!: BehaviorSubject<Franchise[]>;
  private applicationsSubject!: BehaviorSubject<FranchiseApplication[]>;
  private transactionsSubject!: BehaviorSubject<Transaction[]>;
  private paymentTransactionsSubject!: BehaviorSubject<PaymentTransaction[]>;
  private refundRequestsSubject!: BehaviorSubject<RefundRequest[]>;
  private applicationTimelinesSubject!: BehaviorSubject<ApplicationTimeline[]>;
  private paymentRequestsSubject!: BehaviorSubject<PaymentRequest[]>;
  private notificationsSubject!: BehaviorSubject<Notification[]>;
  private partnershipDeactivationsSubject!: BehaviorSubject<PartnershipDeactivation[]>;

  // Public observables for components to subscribe to
  public franchises$!: Observable<Franchise[]>;
  public applications$!: Observable<FranchiseApplication[]>;
  public transactions$!: Observable<Transaction[]>;
  public paymentTransactions$!: Observable<PaymentTransaction[]>;
  public refundRequests$!: Observable<RefundRequest[]>;
  public applicationTimelines$!: Observable<ApplicationTimeline[]>;
  public paymentRequests$!: Observable<PaymentRequest[]>;
  public notifications$!: Observable<Notification[]>;
  public partnershipDeactivations$!: Observable<PartnershipDeactivation[]>;

  private mockFranchises: Franchise[] = [
    // No hardcoded franchises - all franchises will be loaded from localStorage
    // This ensures only legitimate franchises created by business users are displayed
  ];

  private mockApplications: FranchiseApplication[] = [
    // No hardcoded applications - all applications will be loaded from localStorage
    // This ensures only real user-submitted applications are displayed
  ];

  private mockTransactions: Transaction[] = [
    // No hardcoded transactions - all transactions will be loaded from localStorage
    // This ensures only real user transactions are displayed
  ];

  private mockPaymentTransactions: PaymentTransaction[] = [
    // No hardcoded payment transactions - all transactions will be loaded from localStorage
    // This ensures only real user payment transactions are displayed
  ];

  private mockRefundRequests: RefundRequest[] = [];

  private mockPaymentRequests: PaymentRequest[] = [];

  private mockNotifications: Notification[] = [];

  private mockPartnershipDeactivations: PartnershipDeactivation[] = [];

  private mockApplicationTimelines: ApplicationTimeline[] = [
    {
      id: 'timeline_001',
      applicationId: '1',
      status: ApplicationStatus.SUBMITTED,
      timestamp: new Date('2024-09-01T09:00:00'),
      performedBy: 'demo-partner-user',
      notes: 'Application submitted successfully',
      isSystemGenerated: true
    },
    {
      id: 'timeline_002',
      applicationId: '2',
      status: ApplicationStatus.SUBMITTED,
      timestamp: new Date('2024-08-15T11:00:00'),
      performedBy: 'demo-partner-user-2',
      notes: 'Application submitted successfully',
      isSystemGenerated: true
    },
    {
      id: 'timeline_003',
      applicationId: '2',
      status: ApplicationStatus.UNDER_REVIEW,
      timestamp: new Date('2024-08-16T09:30:00'),
      performedBy: 'demo-business-user',
      notes: 'Application moved to review after payment confirmation',
      isSystemGenerated: true
    },
    {
      id: 'timeline_004',
      applicationId: '2',
      status: ApplicationStatus.APPROVED,
      timestamp: new Date('2024-08-20T16:45:00'),
      performedBy: 'demo-business-user',
      notes: 'Application approved. Excellent business plan and financial standing.',
      isSystemGenerated: false
    },
    {
      id: 'timeline_005',
      applicationId: '3',
      status: ApplicationStatus.SUBMITTED,
      timestamp: new Date('2024-09-10T13:20:00'),
      performedBy: 'demo-partner-user-3',
      notes: 'Application submitted successfully',
      isSystemGenerated: true
    },
    {
      id: 'timeline_006',
      applicationId: '3',
      status: ApplicationStatus.UNDER_REVIEW,
      timestamp: new Date('2024-09-12T10:00:00'),
      performedBy: 'demo-business-user',
      notes: 'Application under review. Waiting for additional documentation.',
      isSystemGenerated: false
    }
  ];

  // Inject AuthService to get current user
  private authService = inject(AuthService);

  constructor() {
    console.log('🏗️ === MockDataService CONSTRUCTOR CALLED ===');
    console.log('🏗️ Initial applications array length:', this.mockApplications.length);
    this.initializeData();

    // Expose debug methods globally for browser console debugging
    (window as any).debugFranchiseHub = {
      clearData: () => this.clearStoredData(),
      debugStorage: () => this.debugLocalStorage(),
      getDataCounts: () => this.getDataCounts(),
      getCurrentApplications: () => this.mockApplications,
      getCurrentFranchises: () => this.mockFranchises,
      removeMockFranchises: () => this.removeMockFranchises(),
      reloadData: () => this.loadFromStorage(),
      debugApplications: () => this.debugApplications()
    };
  }

  // Persistence and initialization methods
  private initializeData(): void {
    console.log('🏗️ === INITIALIZING DATA ===');
    console.log('🏗️ Current applications before loadFromStorage:', this.mockApplications.length);
    this.loadFromStorage();
    console.log('🏗️ Current applications after loadFromStorage:', this.mockApplications.length);
    this.initializeSubjects();
    console.log('🏗️ === DATA INITIALIZATION COMPLETED ===');
  }

  private initializeSubjects(): void {
    // Initialize BehaviorSubjects with current data
    this.franchisesSubject = new BehaviorSubject<Franchise[]>([...this.mockFranchises]);
    this.applicationsSubject = new BehaviorSubject<FranchiseApplication[]>([...this.mockApplications]);
    this.transactionsSubject = new BehaviorSubject<Transaction[]>([...this.mockTransactions]);
    this.paymentTransactionsSubject = new BehaviorSubject<PaymentTransaction[]>([...this.mockPaymentTransactions]);
    this.refundRequestsSubject = new BehaviorSubject<RefundRequest[]>([...this.mockRefundRequests]);
    this.applicationTimelinesSubject = new BehaviorSubject<ApplicationTimeline[]>([...this.mockApplicationTimelines]);
    this.paymentRequestsSubject = new BehaviorSubject<PaymentRequest[]>([...this.mockPaymentRequests]);
    this.notificationsSubject = new BehaviorSubject<Notification[]>([...this.mockNotifications]);
    this.partnershipDeactivationsSubject = new BehaviorSubject<PartnershipDeactivation[]>([...this.mockPartnershipDeactivations]);

    // Create public observables
    this.franchises$ = this.franchisesSubject.asObservable();
    this.applications$ = this.applicationsSubject.asObservable();
    this.transactions$ = this.transactionsSubject.asObservable();
    this.paymentTransactions$ = this.paymentTransactionsSubject.asObservable();
    this.refundRequests$ = this.refundRequestsSubject.asObservable();
    this.applicationTimelines$ = this.applicationTimelinesSubject.asObservable();
    this.paymentRequests$ = this.paymentRequestsSubject.asObservable();
    this.notifications$ = this.notificationsSubject.asObservable();
    this.partnershipDeactivations$ = this.partnershipDeactivationsSubject.asObservable();
  }

  public loadFromStorage(): void {
    try {
      // Load franchises from localStorage
      const storedFranchises = localStorage.getItem(this.STORAGE_KEYS.FRANCHISES);
      console.log('💾 Loading from localStorage - stored franchises:', storedFranchises ? 'found' : 'not found');
      if (storedFranchises) {
        const parsedFranchises = JSON.parse(storedFranchises);
        console.log('💾 Parsed stored franchises:', parsedFranchises.length);
        console.log('💾 Stored franchise IDs:', parsedFranchises.map((f: Franchise) => f.id));
        console.log('💾 Current mock franchise IDs before merge:', this.mockFranchises.map(f => f.id));

        // Merge stored franchises with default ones, avoiding duplicates
        const existingIds = this.mockFranchises.map(f => f.id);
        let newFranchises = parsedFranchises.filter((f: Franchise) => !existingIds.includes(f.id));

        // Fix any franchises with incorrect businessOwnerId
        let franchiseDataFixed = false;
        newFranchises = newFranchises.map((f: Franchise) => {
          if (f.name === 'Chaayos' && f.businessOwnerId === 'business-1') {
            console.log('🔧 Fixing Chaayos businessOwnerId from business-1 to demo-business-user');
            franchiseDataFixed = true;
            return { ...f, businessOwnerId: 'demo-business-user', businessOwnerName: 'Demo Business Owner' };
          }
          return f;
        });

        console.log('💾 New franchises to add:', newFranchises.length);
        console.log('💾 New franchise IDs:', newFranchises.map((f: Franchise) => f.id));

        this.mockFranchises = [...this.mockFranchises, ...newFranchises];
        console.log('💾 Total franchises after merge:', this.mockFranchises.length);
        console.log('💾 All franchise IDs after merge:', this.mockFranchises.map(f => f.id));
        console.log('💾 All franchise names after merge:', this.mockFranchises.map(f => f.name));
        console.log('💾 All franchise businessOwnerIds after merge:', this.mockFranchises.map(f => ({ name: f.name, businessOwnerId: f.businessOwnerId })));

        // Only save franchises if data was actually fixed, and save only franchises to avoid overwriting other data
        if (franchiseDataFixed) {
          console.log('💾 Franchise data was fixed, saving only franchises to localStorage...');
          localStorage.setItem(this.STORAGE_KEYS.FRANCHISES, JSON.stringify(this.mockFranchises));
        } else {
          console.log('💾 Franchise loading completed - no fixes needed, not saving');
        }
      }

      // Load applications from localStorage
      const storedApplications = localStorage.getItem(this.STORAGE_KEYS.APPLICATIONS);
      console.log('💾 === LOADING APPLICATIONS FROM LOCALSTORAGE ===');
      console.log('💾 Storage key:', this.STORAGE_KEYS.APPLICATIONS);
      console.log('💾 Raw stored data:', storedApplications);
      console.log('💾 Stored data length:', storedApplications ? storedApplications.length : 0);
      console.log('💾 Loading from localStorage - stored applications:', storedApplications ? 'found' : 'not found');

      if (storedApplications) {
        try {
          const parsedApplications = JSON.parse(storedApplications);
          console.log('💾 JSON parse successful');
          console.log('💾 Parsed data type:', typeof parsedApplications);
          console.log('💾 Is array:', Array.isArray(parsedApplications));
          console.log('💾 Parsed stored applications:', parsedApplications.length);

          if (Array.isArray(parsedApplications) && parsedApplications.length > 0) {
            console.log('💾 Stored application details:', parsedApplications.map((a: FranchiseApplication) => ({
              id: a.id,
              franchiseName: a.franchiseName,
              partnerId: a.partnerId,
              status: a.status,
              submittedAt: a.submittedAt
            })));

            console.log('💾 Current applications in memory before merge:', this.mockApplications.length);
            const existingIds = this.mockApplications.map(a => a.id);
            const newApplications = parsedApplications.filter((a: FranchiseApplication) => !existingIds.includes(a.id));
            console.log('💾 New applications to add:', newApplications.length);
            console.log('💾 New application IDs:', newApplications.map((a: FranchiseApplication) => a.id));

            // Convert date strings back to Date objects
            const applicationsWithDates = newApplications.map((a: FranchiseApplication) => {
              console.log('💾 Converting dates for application:', a.id);
              console.log('💾 Original submittedAt type:', typeof a.submittedAt, 'value:', a.submittedAt);
              console.log('💾 Original reviewedAt type:', typeof a.reviewedAt, 'value:', a.reviewedAt);
              console.log('💾 Original updatedAt type:', typeof a.updatedAt, 'value:', a.updatedAt);

              return {
                ...a,
                submittedAt: new Date(a.submittedAt),
                reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : undefined,
                updatedAt: new Date(a.updatedAt),
                // createdAt field doesn't exist on FranchiseApplication interface
              };
            });

            console.log('💾 Applications after date conversion:', applicationsWithDates.map(a => ({
              id: a.id,
              submittedAt: a.submittedAt,
              submittedAtType: typeof a.submittedAt,
              reviewedAt: a.reviewedAt,
              reviewedAtType: typeof a.reviewedAt
            })));

            this.mockApplications = [...this.mockApplications, ...applicationsWithDates];
            console.log('💾 Total applications after merge:', this.mockApplications.length);
            console.log('💾 All application IDs after merge:', this.mockApplications.map(a => a.id));
          } else {
            console.log('💾 Parsed applications is empty array or not array');
            console.log('💾 Parsed applications:', parsedApplications);
          }
        } catch (error) {
          console.error('💾 Error parsing stored applications:', error);
          console.error('💾 Raw data that failed to parse:', storedApplications);
        }
      } else {
        console.log('💾 No stored applications found in localStorage');
      }

      // Load transactions from localStorage
      const storedTransactions = localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS);
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        const existingIds = this.mockTransactions.map(t => t.id);
        const newTransactions = parsedTransactions.filter((t: Transaction) => !existingIds.includes(t.id));
        this.mockTransactions = [...this.mockTransactions, ...newTransactions];
      }

      // Load payment transactions from localStorage
      const storedPaymentTransactions = localStorage.getItem(this.STORAGE_KEYS.PAYMENT_TRANSACTIONS);
      if (storedPaymentTransactions) {
        const parsedPaymentTransactions = JSON.parse(storedPaymentTransactions);
        const existingIds = this.mockPaymentTransactions.map(pt => pt.id);
        const newPaymentTransactions = parsedPaymentTransactions.filter((pt: PaymentTransaction) => !existingIds.includes(pt.id));
        this.mockPaymentTransactions = [...this.mockPaymentTransactions, ...newPaymentTransactions];
      }

      // Load refund requests from localStorage
      const storedRefundRequests = localStorage.getItem(this.STORAGE_KEYS.REFUND_REQUESTS);
      if (storedRefundRequests) {
        const parsedRefundRequests = JSON.parse(storedRefundRequests);
        const existingIds = this.mockRefundRequests.map(rr => rr.id);
        const newRefundRequests = parsedRefundRequests.filter((rr: RefundRequest) => !existingIds.includes(rr.id));
        this.mockRefundRequests = [...this.mockRefundRequests, ...newRefundRequests];
      }

      // Load application timelines from localStorage
      const storedApplicationTimelines = localStorage.getItem(this.STORAGE_KEYS.APPLICATION_TIMELINES);
      if (storedApplicationTimelines) {
        const parsedApplicationTimelines = JSON.parse(storedApplicationTimelines);
        const existingIds = this.mockApplicationTimelines.map(at => at.id);
        const newApplicationTimelines = parsedApplicationTimelines.filter((at: ApplicationTimeline) => !existingIds.includes(at.id));
        this.mockApplicationTimelines = [...this.mockApplicationTimelines, ...newApplicationTimelines];
      }

      // Load payment requests from localStorage
      const storedPaymentRequests = localStorage.getItem(this.STORAGE_KEYS.PAYMENT_REQUESTS);
      if (storedPaymentRequests) {
        const parsedPaymentRequests = JSON.parse(storedPaymentRequests);
        const existingIds = this.mockPaymentRequests.map(pr => pr.id);
        const newPaymentRequests = parsedPaymentRequests.filter((pr: PaymentRequest) => !existingIds.includes(pr.id));
        this.mockPaymentRequests = [...this.mockPaymentRequests, ...newPaymentRequests];
        console.log('💾 Loaded payment requests from localStorage:', newPaymentRequests.length);
      }

      // Load notifications from localStorage
      const storedNotifications = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        const existingIds = this.mockNotifications.map(n => n.id);
        const newNotifications = parsedNotifications.filter((n: Notification) => !existingIds.includes(n.id));
        this.mockNotifications = [...this.mockNotifications, ...newNotifications];
        console.log('💾 Loaded notifications from localStorage:', newNotifications.length);
      }

      // Load partnership deactivations from localStorage
      const storedDeactivations = localStorage.getItem(this.STORAGE_KEYS.PARTNERSHIP_DEACTIVATIONS);
      if (storedDeactivations) {
        const parsedDeactivations = JSON.parse(storedDeactivations);
        const existingIds = this.mockPartnershipDeactivations.map(pd => pd.id);
        const newDeactivations = parsedDeactivations.filter((pd: PartnershipDeactivation) => !existingIds.includes(pd.id));
        this.mockPartnershipDeactivations = [...this.mockPartnershipDeactivations, ...newDeactivations];
        console.log('💾 Loaded partnership deactivations from localStorage:', newDeactivations.length);
      }
    } catch (error) {
      console.warn('Error loading data from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      console.log('💾 Saving to localStorage - franchises count:', this.mockFranchises.length);
      console.log('💾 Franchise IDs being saved:', this.mockFranchises.map(f => f.id));

      console.log('💾 === SAVING TO LOCALSTORAGE ===');
      console.log('💾 Saving to localStorage - applications count:', this.mockApplications.length);
      console.log('💾 Application details being saved:', this.mockApplications.map(a => ({
        id: a.id,
        franchiseName: a.franchiseName,
        partnerId: a.partnerId,
        status: a.status,
        reviewedAt: a.reviewedAt,
        reviewNotes: a.reviewNotes,
        submittedAt: a.submittedAt
      })));

      if (this.mockApplications.length === 0) {
        console.warn('⚠️ WARNING: No applications to save to localStorage!');
      }

      // Check for duplicates before saving
      const ids = this.mockFranchises.map(f => f.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.error('🚨 DUPLICATE IDs found before saving:', duplicateIds);
      }

      console.log('💾 Saving franchises to localStorage...');
      localStorage.setItem(this.STORAGE_KEYS.FRANCHISES, JSON.stringify(this.mockFranchises));

      console.log('💾 Saving applications to localStorage...');
      localStorage.setItem(this.STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.mockApplications));

      console.log('💾 Saving other data to localStorage...');
      localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.mockTransactions));
      localStorage.setItem(this.STORAGE_KEYS.PAYMENT_TRANSACTIONS, JSON.stringify(this.mockPaymentTransactions));
      localStorage.setItem(this.STORAGE_KEYS.REFUND_REQUESTS, JSON.stringify(this.mockRefundRequests));
      localStorage.setItem(this.STORAGE_KEYS.APPLICATION_TIMELINES, JSON.stringify(this.mockApplicationTimelines));
      localStorage.setItem(this.STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(this.mockPaymentRequests));
      localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.mockNotifications));
      localStorage.setItem(this.STORAGE_KEYS.PARTNERSHIP_DEACTIVATIONS, JSON.stringify(this.mockPartnershipDeactivations));

      console.log('💾 Successfully saved to localStorage');

      // Verify applications were saved
      const savedApplications = localStorage.getItem(this.STORAGE_KEYS.APPLICATIONS);
      console.log('💾 Verifying applications saved:', savedApplications ? 'found' : 'not found');
      if (savedApplications) {
        const parsedSaved = JSON.parse(savedApplications);
        console.log('💾 Verified saved applications count:', parsedSaved.length);
        console.log('💾 Verified saved application IDs:', parsedSaved.map((a: any) => a.id));
      }
    } catch (error) {
      console.warn('Error saving data to localStorage:', error);
    }
  }

  private updateSubjects(): void {
    if (this.franchisesSubject) {
      console.log('📡 Updating franchisesSubject with', this.mockFranchises.length, 'franchises');
      console.log('📡 Franchise IDs being emitted:', this.mockFranchises.map(f => f.id));

      // Check for duplicates before emitting
      const ids = this.mockFranchises.map(f => f.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.error('🚨 DUPLICATE IDs found before emitting:', duplicateIds);
      }

      this.franchisesSubject.next([...this.mockFranchises]);
    }
    if (this.applicationsSubject) {
      console.log('📡 === UPDATING APPLICATIONS SUBJECT ===');
      console.log('📡 Updating applicationsSubject with', this.mockApplications.length, 'applications');
      console.log('📡 Application IDs being emitted:', this.mockApplications.map(a => a.id));
      console.log('📡 Application details being emitted:', this.mockApplications.map(a => ({
        id: a.id,
        franchiseName: a.franchiseName,
        partnerId: a.partnerId,
        status: a.status
      })));

      this.applicationsSubject.next([...this.mockApplications]);
      console.log('📡 Applications subject updated successfully');
    } else {
      console.warn('⚠️ WARNING: applicationsSubject is null/undefined!');
    }
    if (this.transactionsSubject) {
      this.transactionsSubject.next([...this.mockTransactions]);
    }
    if (this.paymentTransactionsSubject) {
      this.paymentTransactionsSubject.next([...this.mockPaymentTransactions]);
    }
    if (this.refundRequestsSubject) {
      this.refundRequestsSubject.next([...this.mockRefundRequests]);
    }
    if (this.applicationTimelinesSubject) {
      this.applicationTimelinesSubject.next([...this.mockApplicationTimelines]);
    }
    if (this.paymentRequestsSubject) {
      this.paymentRequestsSubject.next([...this.mockPaymentRequests]);
    }
    if (this.notificationsSubject) {
      this.notificationsSubject.next([...this.mockNotifications]);
    }
    if (this.partnershipDeactivationsSubject) {
      this.partnershipDeactivationsSubject.next([...this.mockPartnershipDeactivations]);
    }
  }

  private notifyDataChange(): void {
    console.log('🔔 === NOTIFY DATA CHANGE CALLED ===');
    console.log('🔔 About to save to storage...');
    this.saveToStorage();
    console.log('🔔 About to update subjects...');
    this.updateSubjects();
    console.log('🔔 === NOTIFY DATA CHANGE COMPLETED ===');
  }

  // Public method to clear all stored data (useful for testing)
  clearStoredData(): void {
    try {
      console.log('🗑️ Clearing all localStorage data...');
      localStorage.removeItem(this.STORAGE_KEYS.FRANCHISES);
      localStorage.removeItem(this.STORAGE_KEYS.APPLICATIONS);
      localStorage.removeItem(this.STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(this.STORAGE_KEYS.PAYMENT_TRANSACTIONS);
      localStorage.removeItem(this.STORAGE_KEYS.REFUND_REQUESTS);
      localStorage.removeItem(this.STORAGE_KEYS.APPLICATION_TIMELINES);
      localStorage.removeItem(this.STORAGE_KEYS.PAYMENT_REQUESTS);
      localStorage.removeItem(this.STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(this.STORAGE_KEYS.PARTNERSHIP_DEACTIVATIONS);
      localStorage.removeItem(this.STORAGE_KEYS.USERS);

      // Clear in-memory arrays
      this.mockFranchises = [];
      this.mockApplications = [];
      this.mockTransactions = [];
      this.mockPaymentTransactions = [];
      this.mockRefundRequests = [];
      this.mockApplicationTimelines = [];
      this.mockPaymentRequests = [];
      this.mockNotifications = [];
      this.mockPartnershipDeactivations = [];

      // Reset to default data and notify
      this.initializeData();
      console.log('✅ All data cleared and reset');
    } catch (error) {
      console.warn('Error clearing stored data:', error);
    }
  }

  // Public method to debug localStorage contents
  debugLocalStorage(): void {
    console.log('🔍 === DEBUGGING LOCALSTORAGE ===');
    Object.values(this.STORAGE_KEYS).forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          console.log(`${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'not array');
          if (key === this.STORAGE_KEYS.FRANCHISES && Array.isArray(parsed)) {
            console.log('  Franchise names:', parsed.map((f: any) => f.name));
          }
          if (key === this.STORAGE_KEYS.APPLICATIONS && Array.isArray(parsed)) {
            console.log('  Application details:', parsed.map((a: any) => ({
              franchiseName: a.franchiseName,
              partnerId: a.partnerId,
              status: a.status
            })));
          }
        } else {
          console.log(`${key}: not found`);
        }
      } catch (e) {
        console.log(`${key}: error parsing - ${e instanceof Error ? e.message : String(e)}`);
      }
    });
    console.log('🔍 === END DEBUG ===');
  }

  // Public method to remove mock franchises specifically
  removeMockFranchises(): void {
    console.log('🧹 === REMOVING MOCK FRANCHISES ===');

    const mockFranchiseNames = ['QuickBite Burgers', 'FitZone Gym', 'TechRepair Pro'];

    // Remove from in-memory array
    const originalCount = this.mockFranchises.length;
    this.mockFranchises = this.mockFranchises.filter(franchise =>
      !mockFranchiseNames.includes(franchise.name)
    );

    console.log(`🧹 Removed ${originalCount - this.mockFranchises.length} mock franchises from memory`);
    console.log(`🧹 Remaining franchises:`, this.mockFranchises.map(f => f.name));

    // Save the cleaned data back to localStorage
    this.saveToStorage();

    // Update observables
    this.franchisesSubject.next([...this.mockFranchises]);

    console.log('✅ Mock franchises removed and data saved');
  }

  // Public method to debug applications specifically
  debugApplications(): void {
    console.log('🔍 === DEBUGGING APPLICATIONS ===');
    console.log('🔍 Applications in memory:', this.mockApplications.length);
    console.log('🔍 Application details:', this.mockApplications.map(a => ({
      id: a.id,
      franchiseName: a.franchiseName,
      partnerId: a.partnerId,
      partnerName: a.partnerName,
      status: a.status,
      submittedAt: a.submittedAt
    })));

    // Check localStorage
    const storedApplications = localStorage.getItem(this.STORAGE_KEYS.APPLICATIONS);
    if (storedApplications) {
      const parsed = JSON.parse(storedApplications);
      console.log('🔍 Applications in localStorage:', parsed.length);
      console.log('🔍 Stored application details:', parsed.map((a: any) => ({
        id: a.id,
        franchiseName: a.franchiseName,
        partnerId: a.partnerId,
        status: a.status
      })));
    } else {
      console.log('🔍 No applications found in localStorage');
    }

    // Check current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log('🔍 Current user:', currentUser.id, currentUser.email);
      const userApplications = this.mockApplications.filter(a => a.partnerId === currentUser.id);
      console.log('🔍 Applications for current user:', userApplications.length);
    } else {
      console.log('🔍 No current user found');
    }

    console.log('🔍 === END DEBUG APPLICATIONS ===');
  }

  // Public method to get current data counts (useful for debugging)
  getDataCounts(): { franchises: number; applications: number; transactions: number } {
    return {
      franchises: this.mockFranchises.length,
      applications: this.mockApplications.length,
      transactions: this.mockTransactions.length
    };
  }

  // Service methods
  getFranchises(): Observable<Franchise[]> {
    // Sort by creation date (newest first)
    const sortedFranchises = [...this.mockFranchises].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return of(sortedFranchises);
  }

  getFranchiseById(id: string): Observable<Franchise | undefined> {
    return of(this.mockFranchises.find(f => f.id === id));
  }

  // Get featured franchises for public landing page (newest from all business accounts)
  getFeaturedFranchises(limit: number = 3): Observable<Franchise[]> {
    // Use reactive data stream with RxJS operators for efficient real-time updates
    return this.franchises$.pipe(
      map(franchises => {
        console.log('🔍 getFeaturedFranchises - Total franchises:', franchises.length);
        console.log('🔍 Franchise IDs:', franchises.map(f => f.id));
        console.log('🔍 Franchise names:', franchises.map(f => f.name));

        // Check for duplicates by ID
        const ids = franchises.map(f => f.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
          console.warn('⚠️ DUPLICATE IDs found:', duplicateIds);
        }

        // Check for duplicates by name
        const names = franchises.map(f => f.name);
        const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
          console.warn('⚠️ DUPLICATE Names found:', duplicateNames);
        }

        // Sort all franchises by creation date (newest first) and take the specified limit
        const sorted = [...franchises]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);

        console.log('🎯 Featured franchises (sorted):', sorted.map(f => ({ name: f.name, id: f.id, createdAt: f.createdAt })));
        return sorted;
      })
    );
  }

  getFranchisesByBusiness(businessId: string): Observable<Franchise[]> {
    const userFranchises = this.mockFranchises.filter(f => f.businessOwnerId === businessId);
    // Sort by creation date (newest first)
    const sortedFranchises = userFranchises.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return of(sortedFranchises);
  }

  getApplications(): Observable<Application[]> {
    return of(this.mockApplications);
  }

  getApplicationsByPartner(partnerId: string): Observable<Application[]> {
    return of(this.mockApplications.filter(a => a.partnerId === partnerId));
  }

  getApplicationsByFranchise(franchiseId: string): Observable<Application[]> {
    return of(this.mockApplications.filter(a => a.franchiseId === franchiseId));
  }

  getTransactions(): Observable<Transaction[]> {
    return of(this.mockTransactions);
  }

  getTransactionsByPartner(partnerId: string): Observable<Transaction[]> {
    return of(this.mockTransactions.filter(t => t.partnerId === partnerId));
  }

  getTransactionsByBusiness(businessId: string): Observable<Transaction[]> {
    return of(this.mockTransactions.filter(t => t.businessId === businessId));
  }

  getRecentPaymentTransactionsForBusiness(businessId: string, limit: number = 3): Observable<PaymentTransaction[]> {
    // Get all franchises owned by this business
    const businessFranchises = this.mockFranchises.filter(f => f.businessOwnerId === businessId);
    const franchiseIds = businessFranchises.map(f => f.id);

    // Get all applications for these franchises
    const businessApplications = this.mockApplications.filter(a =>
      franchiseIds.includes(a.franchiseId)
    );
    const applicationIds = businessApplications.map(a => a.id);

    // Get payment transactions for these applications
    const businessPaymentTransactions = this.mockPaymentTransactions
      .filter(pt => applicationIds.includes(pt.applicationId) && pt.status === PaymentStatus.COMPLETED)
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())
      .slice(0, limit);

    return of(businessPaymentTransactions);
  }

  getDashboardStats(userId: string, role: UserRole): Observable<any> {
    if (role === UserRole.PARTNER) {
      // Calculate real statistics for partner user
      const partnerApplications = this.mockApplications.filter(app => app.partnerId === userId);
      const approvedApplications = partnerApplications.filter(app => app.status === ApplicationStatus.APPROVED);
      const partnerTransactions = this.mockPaymentTransactions.filter(t => t.partnerId === userId && t.status === PaymentStatus.COMPLETED);

      // Calculate total investment from completed payments
      const totalInvestment = partnerTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Calculate active partnerships (approved applications with active franchises)
      const activePartnerships = approvedApplications.filter(app => {
        const franchise = this.mockFranchises.find(f => f.id === app.franchiseId);
        return franchise && franchise.isActive;
      }).length;

      console.log('📊 Partner Dashboard Stats:', {
        userId,
        totalApplications: partnerApplications.length,
        approvedApplications: approvedApplications.length,
        totalInvestment,
        activePartnerships
      });

      return of({
        totalApplications: partnerApplications.length,
        approvedApplications: approvedApplications.length,
        totalInvestment: totalInvestment,
        activePartnerships: activePartnerships
      });
    } else {
      // Business user stats
      const businessFranchises = this.mockFranchises.filter(f => f.businessOwnerId === userId);
      const businessApplications = this.mockApplications.filter(a =>
        businessFranchises.some(f => f.id === a.franchiseId)
      );
      // Get payment transactions for revenue calculation (application fees paid to business)
      const businessPaymentTransactions = this.mockPaymentTransactions.filter(pt =>
        businessApplications.some(app => app.id === pt.applicationId)
      );

      const totalRevenue = businessPaymentTransactions
        .filter(pt => pt.status === PaymentStatus.COMPLETED)
        .reduce((sum, pt) => sum + pt.amount, 0);

      // Include both SUBMITTED and UNDER_REVIEW as pending applications
      const pendingApplications = businessApplications.filter(a =>
        a.status === ApplicationStatus.SUBMITTED || a.status === ApplicationStatus.UNDER_REVIEW
      );
      const thisMonthPaymentTransactions = businessPaymentTransactions.filter(pt => {
        const transactionDate = new Date(pt.completedAt || pt.createdAt);
        const now = new Date();
        return transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear() &&
               pt.status === PaymentStatus.COMPLETED;
      });

      return of({
        totalFranchises: businessFranchises.length,
        activeFranchises: businessFranchises.filter(f => f.isActive).length,
        totalApplications: businessApplications.length,
        pendingApplications: pendingApplications.length,
        approvedApplications: businessApplications.filter(a => a.status === ApplicationStatus.APPROVED).length,
        rejectedApplications: businessApplications.filter(a => a.status === ApplicationStatus.REJECTED).length,
        totalRevenue: totalRevenue,
        monthlyRevenue: thisMonthPaymentTransactions.reduce((sum, pt) => sum + pt.amount, 0),
        totalTransactions: businessPaymentTransactions.length,
        pendingTransactions: businessPaymentTransactions.filter(pt => pt.status === PaymentStatus.PENDING).length,
        averageApplicationsPerFranchise: businessFranchises.length > 0 ?
          Math.round(businessApplications.length / businessFranchises.length * 10) / 10 : 0,
        conversionRate: businessApplications.length > 0 ?
          Math.round((businessApplications.filter(a => a.status === ApplicationStatus.APPROVED).length / businessApplications.length) * 100) : 0
      });
    }
  }

  // Application management methods
  approveApplication(applicationId: string, notes?: string): Observable<Application> {
    console.log('🔍 === APPROVE APPLICATION (DASHBOARD) ===');
    console.log('🔍 Application ID:', applicationId);
    console.log('🔍 Notes:', notes);

    const application = this.mockApplications.find(a => a.id === applicationId);
    if (application) {
      console.log('🔍 Found application, current status:', application.status);
      application.status = ApplicationStatus.APPROVED;
      application.updatedAt = new Date();
      application.reviewedAt = new Date();
      application.reviewedBy = this.authService.getCurrentUser()?.id;
      if (notes) {
        application.reviewNotes = notes;
      }
      console.log('🔍 Updated application status to:', application.status);

      // Add timeline entry
      this.addApplicationTimelineEntry(
        applicationId,
        ApplicationStatus.APPROVED,
        this.authService.getCurrentUser()?.id || 'system',
        notes || 'Application approved from dashboard',
        false
      );

      console.log('🔍 Calling notifyDataChange() to persist...');
      this.notifyDataChange();
      console.log('🔍 === APPROVE APPLICATION COMPLETED ===');
    } else {
      console.error('❌ Application not found:', applicationId);
    }
    return of(application!);
  }

  rejectApplication(applicationId: string, notes?: string): Observable<Application> {
    console.log('🔍 === REJECT APPLICATION (DASHBOARD) ===');
    console.log('🔍 Application ID:', applicationId);
    console.log('🔍 Notes:', notes);

    const application = this.mockApplications.find(a => a.id === applicationId);
    if (application) {
      console.log('🔍 Found application, current status:', application.status);
      application.status = ApplicationStatus.REJECTED;
      application.updatedAt = new Date();
      application.reviewedAt = new Date();
      application.reviewedBy = this.authService.getCurrentUser()?.id;
      if (notes) {
        application.reviewNotes = notes;
      }
      console.log('🔍 Updated application status to:', application.status);

      // Add timeline entry
      this.addApplicationTimelineEntry(
        applicationId,
        ApplicationStatus.REJECTED,
        this.authService.getCurrentUser()?.id || 'system',
        notes || 'Application rejected from dashboard',
        false
      );

      console.log('🔍 Calling notifyDataChange() to persist...');
      this.notifyDataChange();
      console.log('🔍 === REJECT APPLICATION COMPLETED ===');
    } else {
      console.error('❌ Application not found:', applicationId);
    }
    return of(application!);
  }

  // Utility method to generate unique IDs
  private generateUniqueId(): string {
    // Generate a unique ID based on timestamp and random number
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  }

  // Franchise management methods
  createFranchise(franchiseData: FranchiseFormData): Observable<Franchise> {
    // Get current user from AuthService
    const currentUser = this.authService.getCurrentUser();
    const businessOwnerId = currentUser?.id || 'demo-business-user';
    const businessOwnerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Demo Business Owner';

    const newFranchise: Franchise = {
      id: this.generateUniqueId(),
      name: franchiseData.name,
      description: franchiseData.description,
      category: franchiseData.category,
      status: FranchiseStatus.ACTIVE,
      businessOwnerId: businessOwnerId,
      businessOwnerName: businessOwnerName,
      logo: '',
      images: [],

      // Financial Information
      franchiseFee: franchiseData.franchiseFee,
      royaltyFee: franchiseData.royaltyFee,
      marketingFee: franchiseData.marketingFee,
      initialInvestment: franchiseData.initialInvestment,
      liquidCapitalRequired: franchiseData.liquidCapitalRequired,
      netWorthRequired: franchiseData.netWorthRequired,

      // Business Details
      yearEstablished: franchiseData.yearEstablished,
      totalUnits: 1,
      franchisedUnits: 0,
      companyOwnedUnits: 1,

      // Requirements - Convert from form data to Franchise model
      requirements: {
        experience: franchiseData.requirements.experience,
        education: 'High school diploma or equivalent',
        creditScore: 650,
        background: ['Business experience preferred']
      },

      // Support & Training
      support: {
        training: franchiseData.support.training,
        marketing: franchiseData.support.marketing,
        operations: franchiseData.support.operations,
        technology: 'Technology support included'
      },

      // Location Information
      territories: ['Available nationwide'],
      availableStates: ['All states'],
      internationalOpportunities: false,

      // Contact Information
      contactInfo: {
        phone: '(555) 123-4567',
        email: 'contact@franchise.com',
        website: 'https://franchise.com',
        address: '123 Business St, City, State 12345'
      },

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isFeatured: false,
      viewCount: 0,
      applicationCount: 0,
      rating: 0,
      reviewCount: 0
    };

    console.log('🆕 Creating franchise:', newFranchise.name, 'with ID:', newFranchise.id);
    console.log('🆕 Total franchises before adding:', this.mockFranchises.length);
    this.mockFranchises.push(newFranchise);
    console.log('🆕 Total franchises after adding:', this.mockFranchises.length);
    console.log('🆕 All franchise IDs:', this.mockFranchises.map(f => f.id));
    this.notifyDataChange(); // Persist and notify
    return of(newFranchise);
  }

  updateFranchise(franchise: Franchise): Observable<Franchise> {
    const index = this.mockFranchises.findIndex(f => f.id === franchise.id);
    if (index !== -1) {
      this.mockFranchises[index] = { ...franchise, updatedAt: new Date() };
      this.notifyDataChange(); // Persist and notify
      return of(this.mockFranchises[index]);
    }
    throw new Error('Franchise not found');
  }

  updateFranchisePartial(franchiseId: string, franchiseData: Partial<Franchise>): Observable<Franchise> {
    const index = this.mockFranchises.findIndex(f => f.id === franchiseId);
    if (index !== -1) {
      this.mockFranchises[index] = {
        ...this.mockFranchises[index],
        ...franchiseData,
        updatedAt: new Date()
      };
      return of(this.mockFranchises[index]);
    }
    throw new Error('Franchise not found');
  }

  deleteFranchise(franchiseId: string): Observable<boolean> {
    const index = this.mockFranchises.findIndex(f => f.id === franchiseId);
    if (index !== -1) {
      this.mockFranchises.splice(index, 1);
      this.notifyDataChange(); // Persist and notify
      return of(true);
    }
    return of(false);
  }

  // Enhanced franchise management methods
  getFranchisesByOwner(ownerId: string): Observable<Franchise[]> {
    const userFranchises = this.mockFranchises.filter(f => f.businessOwnerId === ownerId);
    // Sort by creation date (newest first)
    const sortedFranchises = userFranchises.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return of(sortedFranchises);
  }

  updateFranchiseStatus(franchiseId: string, isActive: boolean): Observable<Franchise> {
    const franchise = this.mockFranchises.find(f => f.id === franchiseId);
    if (franchise) {
      franchise.isActive = isActive;
      franchise.updatedAt = new Date();
      this.notifyDataChange(); // Persist and notify
      return of(franchise);
    }
    throw new Error('Franchise not found');
  }

  bulkUpdateFranchiseStatus(franchiseIds: string[], isActive: boolean): Observable<Franchise[]> {
    const updatedFranchises: Franchise[] = [];
    franchiseIds.forEach(id => {
      const franchise = this.mockFranchises.find(f => f.id === id);
      if (franchise) {
        franchise.isActive = isActive;
        franchise.updatedAt = new Date();
        updatedFranchises.push(franchise);
      }
    });
    this.notifyDataChange(); // Persist and notify
    return of(updatedFranchises);
  }

  getFranchisePerformanceMetrics(franchiseId: string): Observable<any> {
    console.log('📊 === GETTING FRANCHISE PERFORMANCE METRICS ===');
    console.log('📊 Franchise ID:', franchiseId);

    const applications = this.mockApplications.filter(a => a.franchiseId === franchiseId);
    const transactions = this.mockTransactions.filter(t => t.franchiseId === franchiseId);

    console.log('📊 Found applications:', applications.length);
    console.log('📊 Found transactions:', transactions.length);

    const totalApplications = applications.length;
    const approvedApplications = applications.filter(a => a.status === ApplicationStatus.APPROVED).length;
    const totalRevenue = transactions
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + t.amount, 0);

    // Safe date handling for averageTimeToPartnership calculation
    let averageTimeToPartnership = 0;
    const approvedAppsWithDates = applications.filter(a =>
      a.status === ApplicationStatus.APPROVED && a.reviewedAt && a.submittedAt
    );

    console.log('📊 Approved applications with dates:', approvedAppsWithDates.length);

    if (approvedAppsWithDates.length > 0) {
      const totalDays = approvedAppsWithDates.reduce((sum, a) => {
        try {
          // Ensure dates are Date objects, not strings
          const reviewedAt = new Date(a.reviewedAt!);
          const submittedAt = new Date(a.submittedAt);

          // Validate dates
          if (isNaN(reviewedAt.getTime()) || isNaN(submittedAt.getTime())) {
            console.warn('📊 Invalid date found in application:', a.id);
            return sum;
          }

          const days = Math.floor((reviewedAt.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24));
          console.log('📊 Application', a.id, 'processing time:', days, 'days');
          return sum + Math.max(days, 0); // Ensure non-negative days
        } catch (error) {
          console.error('📊 Error calculating days for application:', a.id, error);
          return sum;
        }
      }, 0);

      averageTimeToPartnership = totalDays / approvedAppsWithDates.length;
    }

    const metrics = {
      totalApplications,
      approvedApplications,
      conversionRate: totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0,
      totalRevenue,
      averageTimeToPartnership: Math.round(averageTimeToPartnership),
      monthlyGrowth: Math.floor(Math.random() * 20) + 5, // Mock growth percentage
      activePartnerships: approvedApplications
    };

    console.log('📊 Calculated metrics:', metrics);
    console.log('📊 === FRANCHISE PERFORMANCE METRICS COMPLETED ===');

    return of(metrics);
  }

  searchFranchises(filters: FranchiseManagementFilters): Observable<Franchise[]> {
    let filtered = [...this.mockFranchises];

    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm) ||
        f.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(f => f.category === filters.category);
    }

    if (filters.status !== undefined) {
      filtered = filtered.filter(f => f.isActive === filters.status);
    }

    if (filters.minInvestment) {
      filtered = filtered.filter(f => f.initialInvestment.min >= filters.minInvestment!);
    }

    if (filters.maxInvestment) {
      filtered = filtered.filter(f => f.initialInvestment.max <= filters.maxInvestment!);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (aValue < bValue) return filters.sortDirection === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return of(filtered);
  }

  // Payment Request Methods
  createPaymentRequest(applicationId: string, amount: number, purpose: string, description?: string): Observable<PaymentRequest> {
    const application = this.mockApplications.find(a => a.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const paymentRequest: PaymentRequest = {
      id: this.generateUniqueId(),
      applicationId: applicationId,
      franchiseId: application.franchiseId,
      franchiseName: application.franchiseName,
      businessOwnerId: currentUser.id,
      businessOwnerName: `${currentUser.firstName} ${currentUser.lastName}`,
      partnerId: application.partnerId,
      partnerName: application.partnerName,
      partnerEmail: application.partnerEmail,
      amount: amount,
      currency: 'INR',
      purpose: purpose,
      description: description,
      status: PaymentRequestStatus.PENDING,
      requestedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser.id
    };

    this.mockPaymentRequests.push(paymentRequest);

    // Save to localStorage
    this.saveToStorage();

    // Create notification for partner
    this.createNotification(
      application.partnerId,
      NotificationType.PAYMENT_REQUEST,
      'New Payment Request',
      `You have received a payment request of ${this.formatCurrency(amount)} for ${application.franchiseName}`,
      applicationId,
      application.franchiseId,
      paymentRequest.id,
      `/partner/partnerships/${applicationId}`,
      'Pay Now'
    );

    this.notifyDataChange();
    return of(paymentRequest);
  }

  getPaymentRequestsForApplication(applicationId: string): Observable<PaymentRequest[]> {
    const requests = this.mockPaymentRequests.filter(pr => pr.applicationId === applicationId);
    return of(requests);
  }

  getPaymentRequestsForPartner(partnerId: string): Observable<PaymentRequest[]> {
    const requests = this.mockPaymentRequests.filter(pr => pr.partnerId === partnerId);
    return of(requests);
  }

  // Notification Methods
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    applicationId?: string,
    franchiseId?: string,
    paymentRequestId?: string,
    actionUrl?: string,
    actionText?: string
  ): Notification {
    const notification: Notification = {
      id: this.generateUniqueId(),
      userId: userId,
      type: type,
      title: title,
      message: message,
      applicationId: applicationId,
      franchiseId: franchiseId,
      paymentRequestId: paymentRequestId,
      actionUrl: actionUrl,
      actionText: actionText,
      status: NotificationStatus.UNREAD,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    this.mockNotifications.push(notification);
    this.notifyDataChange();
    return notification;
  }

  getNotificationsForUser(userId: string): Observable<Notification[]> {
    const notifications = this.mockNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return of(notifications);
  }

  // Partnership Deactivation Methods
  deactivatePartnership(applicationId: string, reason: DeactivationReason, notes?: string): Observable<FranchiseApplication> {
    const application = this.mockApplications.find(a => a.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Update application status
    application.status = ApplicationStatus.DEACTIVATED;
    application.updatedAt = new Date();

    // Create deactivation record
    const deactivation: PartnershipDeactivation = {
      id: this.generateUniqueId(),
      applicationId: applicationId,
      franchiseId: application.franchiseId,
      businessOwnerId: currentUser.id,
      partnerId: application.partnerId,
      reason: reason,
      notes: notes,
      deactivatedAt: new Date(),
      deactivatedBy: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockPartnershipDeactivations.push(deactivation);

    // Create notification for partner
    this.createNotification(
      application.partnerId,
      NotificationType.PARTNERSHIP_DEACTIVATED,
      'Partnership Deactivated',
      `Your partnership for ${application.franchiseName} has been deactivated. Reason: ${this.getDeactivationReasonText(reason)}`,
      applicationId,
      application.franchiseId,
      undefined,
      `/partner/partnerships/${applicationId}`,
      'View Details'
    );

    // Add timeline entry
    this.addApplicationTimelineEntry(
      applicationId,
      ApplicationStatus.DEACTIVATED,
      currentUser.id,
      `Partnership deactivated. Reason: ${this.getDeactivationReasonText(reason)}${notes ? '. Notes: ' + notes : ''}`,
      false
    );

    this.notifyDataChange();
    return of(application);
  }

  reactivatePartnership(applicationId: string): Observable<FranchiseApplication> {
    const application = this.mockApplications.find(a => a.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Update application status back to APPROVED
    application.status = ApplicationStatus.APPROVED;
    application.updatedAt = new Date();

    // Create notification for partner
    this.createNotification(
      application.partnerId,
      NotificationType.PARTNERSHIP_REACTIVATED,
      'Partnership Reactivated',
      `Your partnership for ${application.franchiseName} has been reactivated and is now active again.`,
      applicationId,
      application.franchiseId,
      undefined,
      `/partner/partnerships/${applicationId}`,
      'View Details'
    );

    // Add timeline entry
    this.addApplicationTimelineEntry(
      applicationId,
      ApplicationStatus.APPROVED,
      currentUser.id,
      'Partnership reactivated and restored to active status',
      false
    );

    this.notifyDataChange();
    return of(application);
  }

  private getDeactivationReasonText(reason: DeactivationReason): string {
    switch (reason) {
      case DeactivationReason.PERFORMANCE_ISSUES: return 'Performance Issues';
      case DeactivationReason.CONTRACT_VIOLATION: return 'Contract Violation';
      case DeactivationReason.MUTUAL_AGREEMENT: return 'Mutual Agreement';
      case DeactivationReason.OTHER: return 'Other';
      default: return 'Unknown';
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Chart data methods
  getRevenueChartData(businessId: string): Observable<any[]> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Generate mock revenue data for the last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const revenue = Math.floor(Math.random() * 20000) + 5000; // Random revenue between 5k-25k
      chartData.push({
        month: months[monthIndex],
        revenue: revenue
      });
    }

    return of(chartData);
  }

  getApplicationsChartData(businessId: string): Observable<any[]> {
    return of([
      { status: 'Pending', count: 2, color: '#ff9800' },
      { status: 'Approved', count: 1, color: '#4caf50' },
      { status: 'Rejected', count: 0, color: '#f44336' }
    ]);
  }

  // ===== APPLICATION MANAGEMENT METHODS =====

  // Create new franchise application
  createApplication(applicationData: ApplicationCreateData): Observable<FranchiseApplication> {
    console.log('🏭 === MockDataService.createApplication() CALLED ===');
    console.log('🏭 Input applicationData:', applicationData);

    const currentUser = this.authService.getCurrentUser();
    console.log('🏭 Current user:', currentUser);
    if (!currentUser) {
      console.error('❌ User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('🏭 Looking for franchise with ID:', applicationData.franchiseId);
    console.log('🏭 Available franchises:', this.mockFranchises.map(f => ({ id: f.id, name: f.name })));
    const franchise = this.mockFranchises.find(f => f.id === applicationData.franchiseId);
    console.log('🏭 Found franchise:', franchise);
    if (!franchise) {
      console.error('❌ Franchise not found with ID:', applicationData.franchiseId);
      throw new Error('Franchise not found');
    }

    console.log('🏭 Creating new application object...');
    const applicationId = this.generateUniqueId();
    console.log('🏭 Generated application ID:', applicationId);

    const newApplication: FranchiseApplication = {
      id: applicationId,
      franchiseId: applicationData.franchiseId,
      franchiseName: franchise.name,
      franchiseCategory: franchise.category,
      businessOwnerId: franchise.businessOwnerId,
      businessOwnerName: franchise.businessOwnerName || 'Business Owner',
      partnerId: currentUser.id,
      partnerName: `${currentUser.firstName} ${currentUser.lastName}`,
      partnerEmail: currentUser.email,
      status: ApplicationStatus.SUBMITTED,

      personalInfo: applicationData.personalInfo,
      financialInfo: applicationData.financialInfo,
      businessInfo: applicationData.businessInfo,
      motivation: applicationData.motivation,
      questions: applicationData.questions,
      references: applicationData.references,
      documents: [],

      // Payment Information
      applicationFee: this.calculateApplicationFee(franchise),
      paymentStatus: PaymentStatus.PENDING,

      submittedAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    console.log('🏭 New application object created:', {
      id: newApplication.id,
      franchiseId: newApplication.franchiseId,
      franchiseName: newApplication.franchiseName,
      partnerId: newApplication.partnerId,
      partnerName: newApplication.partnerName,
      status: newApplication.status,
      paymentStatus: newApplication.paymentStatus
    });

    console.log('🏭 Adding application to mockApplications array...');
    console.log('🏭 Current applications count before adding:', this.mockApplications.length);
    console.log('🏭 Current application IDs before adding:', this.mockApplications.map(a => a.id));

    this.mockApplications.push(newApplication);

    console.log('🏭 Application added to array successfully');
    console.log('🏭 Total applications after adding:', this.mockApplications.length);
    console.log('🏭 All application IDs after adding:', this.mockApplications.map(a => a.id));
    console.log('🏭 Last added application:', this.mockApplications[this.mockApplications.length - 1]);

    // Create timeline entry
    console.log('🏭 Creating timeline entry...');
    this.addApplicationTimelineEntry(newApplication.id, ApplicationStatus.SUBMITTED, currentUser.id, 'Application submitted successfully', true);
    console.log('🏭 Timeline entry created');

    console.log('🏭 About to call notifyDataChange() to save to localStorage...');
    this.notifyDataChange();
    console.log('🏭 notifyDataChange() completed - application should be saved');

    console.log('🏭 Returning Observable with application...');
    console.log('🏭 === MockDataService.createApplication() COMPLETED ===');
    return of(newApplication);
  }

  // Calculate application fee based on franchise
  private calculateApplicationFee(franchise: Franchise): number {
    // Base fee of ₹5,000 plus 0.1% of franchise fee
    const baseFee = 5000;
    const franchiseFeePercentage = franchise.franchiseFee * 0.001;
    return Math.round(baseFee + franchiseFeePercentage);
  }

  // Get applications for business owner
  getApplicationsForBusiness(businessOwnerId: string): Observable<FranchiseApplication[]> {
    const businessApplications = this.mockApplications.filter(app => app.businessOwnerId === businessOwnerId);
    return of(businessApplications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  }

  // Get applications for partner
  getApplicationsForPartner(partnerId: string): Observable<FranchiseApplication[]> {
    console.log('🔍 MockDataService - Getting applications for partner:', partnerId);
    console.log('🔍 MockDataService - Total applications in storage:', this.mockApplications.length);
    const partnerApplications = this.mockApplications.filter(app => app.partnerId === partnerId);
    console.log('🔍 MockDataService - Filtered partner applications:', partnerApplications.length, partnerApplications);
    return of(partnerApplications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  }

  // Get application by ID
  getApplicationById(applicationId: string): Observable<FranchiseApplication | null> {
    const application = this.mockApplications.find(app => app.id === applicationId);
    return of(application || null);
  }

  // Review application (approve/reject)
  reviewApplication(applicationId: string, reviewData: ApplicationReviewData): Observable<FranchiseApplication> {
    console.log('🔍 === REVIEWING APPLICATION ===');
    console.log('🔍 Application ID:', applicationId);
    console.log('🔍 Review Data:', reviewData);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    console.log('🔍 Current user:', currentUser.id, currentUser.email);

    const application = this.mockApplications.find(app => app.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    console.log('🔍 Found application:', application.id, 'Current status:', application.status);

    // Update application
    console.log('🔍 Updating application status from', application.status, 'to', reviewData.status);
    application.status = reviewData.status;
    application.reviewNotes = reviewData.reviewNotes;
    application.reviewedBy = currentUser.id;
    application.reviewedAt = new Date();
    application.updatedAt = new Date();
    console.log('🔍 Application updated:', {
      id: application.id,
      status: application.status,
      reviewedBy: application.reviewedBy,
      reviewedAt: application.reviewedAt
    });

    if (reviewData.status === ApplicationStatus.REJECTED && reviewData.rejectionReason) {
      application.rejectionReason = reviewData.rejectionReason;

      // Create refund request if payment was completed
      if (application.paymentStatus === PaymentStatus.COMPLETED) {
        this.createRefundRequest(application, reviewData.rejectionReason);
      }
    }

    // Add timeline entry
    console.log('🔍 Adding timeline entry...');
    this.addApplicationTimelineEntry(
      applicationId,
      reviewData.status,
      currentUser.id,
      reviewData.reviewNotes,
      false
    );
    console.log('🔍 Timeline entry added');

    console.log('🔍 Calling notifyDataChange() to persist changes...');
    this.notifyDataChange();

    // Verify the application was updated in the array
    const updatedApp = this.mockApplications.find(app => app.id === applicationId);
    console.log('🔍 Verification - Application in array after update:', {
      id: updatedApp?.id,
      status: updatedApp?.status,
      reviewedAt: updatedApp?.reviewedAt,
      reviewNotes: updatedApp?.reviewNotes
    });

    console.log('🔍 === APPLICATION REVIEW COMPLETED ===');
    return of(application);
  }

  // Process payment requests settlement
  processPaymentRequestsSettlement(paymentRequestIds: string[], paymentData: any): Observable<PaymentTransaction[]> {
    const transactions: PaymentTransaction[] = [];
    let totalAmount = 0;

    // Process each payment request
    for (const requestId of paymentRequestIds) {
      const paymentRequest = this.mockPaymentRequests.find(pr => pr.id === requestId);
      if (!paymentRequest) {
        console.warn(`Payment request ${requestId} not found`);
        continue;
      }

      // Create payment transaction
      const paymentTransaction: PaymentTransaction = {
        id: this.generateUniqueId(),
        applicationId: paymentRequest.applicationId,
        partnerId: paymentRequest.partnerId,
        partnerName: paymentRequest.partnerName,
        franchiseId: paymentRequest.franchiseId,
        franchiseName: paymentRequest.franchiseName,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: PaymentStatus.COMPLETED,
        paymentMethod: paymentData.paymentMethod || 'UPI',
        transactionReference: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        gatewayTransactionId: `gateway_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        initiatedAt: new Date(),
        completedAt: new Date(),
        description: `Payment settlement for ${paymentRequest.purpose} - ${paymentRequest.franchiseName}`,
        receiptUrl: `/receipts/${this.generateUniqueId()}.pdf`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update payment request status
      paymentRequest.status = PaymentRequestStatus.PAID;
      paymentRequest.paidAt = new Date();
      paymentRequest.paymentTransactionId = paymentTransaction.id;

      transactions.push(paymentTransaction);
      this.mockPaymentTransactions.push(paymentTransaction);
      totalAmount += paymentRequest.amount;

      console.log(`💰 Payment request ${requestId} settled: ${this.formatCurrency(paymentRequest.amount)}`);
    }

    this.notifyDataChange();
    console.log(`🎉 Total settlement amount: ${this.formatCurrency(totalAmount)} for ${transactions.length} payment requests`);

    return of(transactions);
  }

  // Process payment for application
  processApplicationPayment(applicationId: string, paymentData: any): Observable<PaymentTransaction> {
    const application = this.mockApplications.find(app => app.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const paymentTransaction: PaymentTransaction = {
      id: this.generateUniqueId(),
      applicationId: applicationId,
      partnerId: application.partnerId,
      partnerName: application.partnerName,
      franchiseId: application.franchiseId,
      franchiseName: application.franchiseName,
      amount: application.applicationFee,
      currency: 'INR',
      status: PaymentStatus.COMPLETED, // Mock successful payment
      paymentMethod: paymentData.paymentMethod || 'UPI',
      transactionReference: `txn_${Date.now()}`,
      gatewayTransactionId: `gateway_${Date.now()}`,
      initiatedAt: new Date(),
      completedAt: new Date(),
      description: `Application fee for ${application.franchiseName} franchise`,
      receiptUrl: `/receipts/${this.generateUniqueId()}.pdf`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update application payment status
    application.paymentStatus = PaymentStatus.COMPLETED;
    application.paymentTransactionId = paymentTransaction.id;
    application.paidAt = new Date();
    application.status = ApplicationStatus.UNDER_REVIEW;
    application.updatedAt = new Date();

    this.mockPaymentTransactions.push(paymentTransaction);

    // Add timeline entry
    this.addApplicationTimelineEntry(
      applicationId,
      ApplicationStatus.UNDER_REVIEW,
      'system',
      'Application moved to review after payment confirmation',
      true
    );

    this.notifyDataChange();
    return of(paymentTransaction);
  }

  // Create refund request
  private createRefundRequest(application: FranchiseApplication, reason: string): void {
    if (!application.paymentTransactionId) {
      return;
    }

    const refundRequest: RefundRequest = {
      id: this.generateUniqueId(),
      applicationId: application.id,
      originalTransactionId: application.paymentTransactionId,
      partnerId: application.partnerId,
      partnerName: application.partnerName,
      amount: application.applicationFee,
      reason: reason,
      status: 'PENDING',
      requestedAt: new Date(),
      estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockRefundRequests.push(refundRequest);
  }

  // Add application timeline entry
  private addApplicationTimelineEntry(
    applicationId: string,
    status: ApplicationStatus,
    performedBy: string,
    notes: string,
    isSystemGenerated: boolean
  ): void {
    console.log('📅 Creating timeline entry for application:', applicationId);
    const timelineEntry: ApplicationTimeline = {
      id: this.generateUniqueId(),
      applicationId: applicationId,
      status: status,
      timestamp: new Date(),
      performedBy: performedBy,
      notes: notes,
      isSystemGenerated: isSystemGenerated
    };

    console.log('📅 Timeline entry created:', timelineEntry);
    this.mockApplicationTimelines.push(timelineEntry);
    console.log('📅 Timeline entry added to array. Total timelines:', this.mockApplicationTimelines.length);
  }

  // Get application timeline
  getApplicationTimeline(applicationId: string): Observable<ApplicationTimeline[]> {
    const timeline = this.mockApplicationTimelines
      .filter(entry => entry.applicationId === applicationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return of(timeline);
  }

  // Get payment transactions for application
  getPaymentTransactionsForApplication(applicationId: string): Observable<PaymentTransaction[]> {
    const transactions = this.mockPaymentTransactions.filter(pt => pt.applicationId === applicationId);
    return of(transactions);
  }

  // Get refund requests for application
  getRefundRequestsForApplication(applicationId: string): Observable<RefundRequest[]> {
    const refunds = this.mockRefundRequests.filter(rr => rr.applicationId === applicationId);
    return of(refunds);
  }

  // Upload document for application
  uploadApplicationDocument(applicationId: string, document: Omit<ApplicationDocument, 'id' | 'uploadedAt'>): Observable<ApplicationDocument> {
    const application = this.mockApplications.find(app => app.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const newDocument: ApplicationDocument = {
      ...document,
      id: this.generateUniqueId(),
      uploadedAt: new Date()
    };

    application.documents.push(newDocument);
    application.updatedAt = new Date();

    this.notifyDataChange();
    return of(newDocument);
  }

  // Get application statistics for business
  getApplicationStatistics(businessOwnerId: string): Observable<any> {
    const businessApplications = this.mockApplications.filter(app => app.businessOwnerId === businessOwnerId);

    const stats = {
      totalApplications: businessApplications.length,
      submittedApplications: businessApplications.filter(app => app.status === ApplicationStatus.SUBMITTED).length,
      underReviewApplications: businessApplications.filter(app => app.status === ApplicationStatus.UNDER_REVIEW).length,
      approvedApplications: businessApplications.filter(app => app.status === ApplicationStatus.APPROVED).length,
      rejectedApplications: businessApplications.filter(app => app.status === ApplicationStatus.REJECTED).length,
      totalApplicationFees: businessApplications
        .filter(app => app.paymentStatus === PaymentStatus.COMPLETED)
        .reduce((sum, app) => sum + app.applicationFee, 0),
      averageProcessingTime: this.calculateAverageProcessingTime(businessApplications)
    };

    return of(stats);
  }

  // Calculate average processing time
  private calculateAverageProcessingTime(applications: FranchiseApplication[]): number {
    const processedApplications = applications.filter(app =>
      app.reviewedAt && (app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.REJECTED)
    );

    if (processedApplications.length === 0) {
      return 0;
    }

    const totalDays = processedApplications.reduce((sum, app) => {
      const days = Math.floor((app.reviewedAt!.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / processedApplications.length);
  }

  // Search and filter applications
  searchApplications(filters: {
    businessOwnerId?: string;
    partnerId?: string;
    status?: ApplicationStatus;
    franchiseId?: string;
    searchTerm?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<FranchiseApplication[]> {
    let filtered = [...this.mockApplications];

    if (filters.businessOwnerId) {
      filtered = filtered.filter((app: FranchiseApplication) => app.businessOwnerId === filters.businessOwnerId);
    }

    if (filters.partnerId) {
      filtered = filtered.filter((app: FranchiseApplication) => app.partnerId === filters.partnerId);
    }

    if (filters.status) {
      filtered = filtered.filter((app: FranchiseApplication) => app.status === filters.status);
    }

    if (filters.franchiseId) {
      filtered = filtered.filter((app: FranchiseApplication) => app.franchiseId === filters.franchiseId);
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((app: FranchiseApplication) =>
        app.partnerName.toLowerCase().includes(searchTerm) ||
        app.franchiseName.toLowerCase().includes(searchTerm) ||
        app.personalInfo.email.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((app: FranchiseApplication) => new Date(app.submittedAt) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      filtered = filtered.filter((app: FranchiseApplication) => new Date(app.submittedAt) <= new Date(filters.dateTo!));
    }

    // Sort by submission date (newest first)
    filtered.sort((a: FranchiseApplication, b: FranchiseApplication) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return of(filtered);
  }

  // Get recent transactions for partner (for dashboard display)
  getRecentTransactionsForPartner(partnerId: string, limit: number = 3): Observable<PaymentTransaction[]> {
    const partnerTransactions = this.mockPaymentTransactions
      .filter(t => t.partnerId === partnerId && t.status === PaymentStatus.COMPLETED)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    console.log('💳 Recent transactions for partner:', partnerId, partnerTransactions.length);
    return of(partnerTransactions);
  }

  // Get partnership details for approved applications
  getPartnershipsForPartner(partnerId: string): Observable<any[]> {
    const approvedApplications = this.mockApplications.filter(app =>
      app.partnerId === partnerId && app.status === ApplicationStatus.APPROVED
    );

    const partnerships = approvedApplications.map(app => {
      const franchise = this.mockFranchises.find(f => f.id === app.franchiseId);
      const transactions = this.mockPaymentTransactions.filter(t =>
        t.applicationId === app.id && t.status === PaymentStatus.COMPLETED
      );

      return {
        id: app.id,
        franchiseId: app.franchiseId,
        franchiseName: app.franchiseName,
        franchiseCategory: app.franchiseCategory,
        status: franchise?.isActive ? 'Active' : 'Inactive',
        approvedAt: app.reviewedAt,
        totalInvestment: transactions.reduce((sum, t) => sum + t.amount, 0),
        franchise: franchise,
        application: app,
        transactions: transactions
      };
    });

    console.log('🤝 Partnerships for partner:', partnerId, partnerships.length);
    return of(partnerships);
  }
}