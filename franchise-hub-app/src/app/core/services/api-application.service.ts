import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Application,
  ApplicationCreateData,
  ApplicationReviewData,
  ApplicationStatus,
  PaymentStatus,
  ApplicationDocument,
  DocumentType
} from '../models/application.model';

export interface ApiPagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface ApiApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  franchiseId: string;
  franchiseName: string;
  status: string;
  paymentStatus: string;
  applicationFee: number;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    ssn?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };
  financialInfo: {
    annualIncome: number;
    netWorth: number;
    liquidAssets: number;
    creditScore?: number;
    hasDebt: boolean;
    debtAmount?: number;
    investmentSource: string;
  };
  businessInfo: {
    hasPartners: boolean;
    partnerDetails?: string;
    fullTimeCommitment: boolean;
    preferredStates: string[];
    preferredLocation: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    timelineToOpen: string;
  };
  motivation?: string;
  questions?: string;
  submittedAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  paidAt?: string;
  paymentTransactionId?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiApplicationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${environment.endpoints.applications.list}`;

  getApplications(filters?: any): Observable<Application[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.franchiseId) params = params.set('franchiseId', filters.franchiseId);
      if (filters.applicantId) params = params.set('applicantId', filters.applicantId);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
    }

    return this.http.get<ApiApplication[]>(this.baseUrl, { params }).pipe(
      map(apiApplications => apiApplications.map(apiApp => this.mapApiApplicationToApplication(apiApp)))
    );
  }

  getApplicationById(id: string): Observable<Application> {
    return this.http.get<ApiApplication>(`${this.baseUrl}/${id}`).pipe(
      map(apiApplication => this.mapApiApplicationToApplication(apiApplication))
    );
  }

  createApplication(applicationData: ApplicationCreateData): Observable<Application> {
    const apiData = this.mapApplicationCreateDataToApi(applicationData);
    return this.http.post<ApiApplication>(this.baseUrl, apiData).pipe(
      map(apiApplication => this.mapApiApplicationToApplication(apiApplication))
    );
  }

  updateApplication(id: string, applicationData: Partial<ApplicationCreateData>): Observable<Application> {
    const apiData = this.mapApplicationCreateDataToApi(applicationData);
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}`, apiData).pipe(
      map(apiApplication => this.mapApiApplicationToApplication(apiApplication))
    );
  }

  reviewApplication(id: string, reviewData: ApplicationReviewData): Observable<Application> {
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}/review`, reviewData).pipe(
      map(apiApplication => this.mapApiApplicationToApplication(apiApplication))
    );
  }

  approveApplication(id: string, notes?: string): Observable<Application> {
    const data = { status: 'APPROVED', reviewNotes: notes };
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}/approve`, data).pipe(
      map(apiApplication => this.mapApiApplicationToApplication(apiApplication))
    );
  }

  rejectApplication(id: string, reason: string, notes?: string): Observable<Application> {
    const data = { status: 'REJECTED', rejectionReason: reason, reviewNotes: notes };
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}/reject`, data).pipe(
      map(apiApplication => this.mapApiApplicationToApplication(apiApplication))
    );
  }

  uploadDocument(applicationId: string, file: File, documentType: DocumentType): Observable<ApplicationDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('applicationId', applicationId);

    return this.http.post<ApplicationDocument>(`${this.baseUrl}/${applicationId}/documents`, formData);
  }

  getApplicationDocuments(applicationId: string): Observable<ApplicationDocument[]> {
    return this.http.get<ApplicationDocument[]>(`${this.baseUrl}/${applicationId}/documents`);
  }

  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getApplicationsByApplicant(applicantId: string): Observable<Application[]> {
    const url = `${environment.apiUrl}/applications/applicant/${applicantId}`;
    console.log('🌐 API Service - Making request to:', url);
    return this.http.get<ApiPagedResponse<ApiApplication>>(url).pipe(
      map(response => {
        console.log('🌐 API Service - Raw response:', response);
        console.log('🌐 API Service - Content array length:', response.content?.length || 0);
        if (response.content && response.content.length > 0) {
          console.log('🌐 API Service - First application raw data:', response.content[0]);
        }
        const mappedApplications = response.content.map(this.mapApiApplicationToApplication.bind(this));
        console.log('🌐 API Service - Mapped applications:', mappedApplications.length, mappedApplications);
        return mappedApplications;
      })
    );
  }

  getApplicationsByFranchise(franchiseId: string): Observable<Application[]> {
    const params = new HttpParams().set('franchiseId', franchiseId);
    return this.http.get<ApiApplication[]>(this.baseUrl, { params }).pipe(
      map(apiApplications => apiApplications.map(apiApp => this.mapApiApplicationToApplication(apiApp)))
    );
  }

  getApplicationsForBusinessOwner(businessOwnerId: string): Observable<Application[]> {
    const url = `${environment.apiUrl}/applications/business-owner/${businessOwnerId}`;
    console.log('🌐 API Service - Making request to business owner endpoint:', url);
    return this.http.get<ApiPagedResponse<ApiApplication>>(url).pipe(
      map(response => {
        console.log('🌐 API Service - Business owner applications response:', response);
        console.log('🌐 API Service - Content array length:', response.content?.length || 0);
        if (response.content && response.content.length > 0) {
          console.log('🌐 API Service - First application raw data:', response.content[0]);
        }
        const mappedApplications = response.content.map(this.mapApiApplicationToApplication.bind(this));
        console.log('🌐 API Service - Mapped business applications:', mappedApplications.length, mappedApplications);
        return mappedApplications;
      })
    );
  }

  private mapPaymentStatus(backendStatus: string): PaymentStatus {
    switch (backendStatus) {
      case 'PENDING': return PaymentStatus.PENDING;
      case 'PAID': return PaymentStatus.COMPLETED;
      case 'FAILED': return PaymentStatus.FAILED;
      case 'REFUNDED': return PaymentStatus.REFUNDED;
      default: return PaymentStatus.PENDING;
    }
  }

  private mapApiApplicationToApplication(apiApplication: ApiApplication): Application {
    console.log('🔄 Mapping API application:', apiApplication.id, apiApplication);
    try {
      const mapped = {
      id: apiApplication.id,
      partnerId: apiApplication.applicantId,
      partnerName: apiApplication.applicantName,
      partnerEmail: apiApplication.applicantEmail,
      businessOwnerId: '',
      businessOwnerName: '',
      franchiseCategory: '',
      franchiseId: apiApplication.franchiseId,
      franchiseName: apiApplication.franchiseName,
      status: apiApplication.status as ApplicationStatus,
      applicationFee: apiApplication.applicationFee || 0,
      paymentStatus: this.mapPaymentStatus(apiApplication.paymentStatus),
      personalInfo: {
        firstName: apiApplication.personalInfo.firstName,
        lastName: apiApplication.personalInfo.lastName,
        email: apiApplication.personalInfo.email,
        phone: apiApplication.personalInfo.phone,
        address: apiApplication.personalInfo.address?.street || '',
        city: apiApplication.personalInfo.address?.city || '',
        state: apiApplication.personalInfo.address?.state || '',
        zipCode: apiApplication.personalInfo.address?.zipCode || '',
        dateOfBirth: apiApplication.personalInfo.dateOfBirth ? new Date(apiApplication.personalInfo.dateOfBirth) : new Date()
      },
      financialInfo: {
        netWorth: apiApplication.financialInfo.netWorth,
        liquidCapital: apiApplication.financialInfo.liquidAssets,
        creditScore: apiApplication.financialInfo.creditScore || 0,
        annualIncome: apiApplication.financialInfo.annualIncome,
        investmentCapacity: apiApplication.financialInfo.netWorth, // Use netWorth as investment capacity
        hasBusinessExperience: false, // Default value
        businessExperienceDetails: undefined,
        yearsOfExperience: undefined
      },
      businessInfo: {
        preferredLocation: {
          address: apiApplication.businessInfo.preferredLocation.street || '',
          city: apiApplication.businessInfo.preferredLocation.city || '',
          state: apiApplication.businessInfo.preferredLocation.state || '',
          zipCode: apiApplication.businessInfo.preferredLocation.zipCode || '',
          country: apiApplication.businessInfo.preferredLocation.country || 'India'
        },
        preferredStates: apiApplication.businessInfo.preferredStates || [],
        timelineToOpen: apiApplication.businessInfo.timelineToOpen || '',
        fullTimeCommitment: apiApplication.businessInfo.fullTimeCommitment || false,
        hasPartners: apiApplication.businessInfo.hasPartners || false,
        partnerDetails: apiApplication.businessInfo.partnerDetails || ''
      },
      submittedAt: new Date(apiApplication.submittedAt),
      updatedAt: apiApplication.updatedAt ? new Date(apiApplication.updatedAt) : new Date(),
      reviewedAt: apiApplication.reviewedAt ? new Date(apiApplication.reviewedAt) : undefined,
      reviewedBy: apiApplication.reviewedBy,
      reviewNotes: apiApplication.reviewNotes,
      rejectionReason: apiApplication.rejectionReason,
      paidAt: apiApplication.paidAt ? new Date(apiApplication.paidAt) : undefined,
      paymentTransactionId: apiApplication.paymentTransactionId,
      isActive: apiApplication.isActive,
        motivation: apiApplication.motivation || '',
        questions: apiApplication.questions || '',
        references: [],
        documents: []
      };
      console.log('✅ Successfully mapped application:', mapped.id, mapped);
      return mapped;
    } catch (error) {
      console.error('❌ Error mapping application:', error, apiApplication);
      throw error;
    }
  }

  private mapApplicationCreateDataToApi(createData: Partial<ApplicationCreateData>): any {
    const personalInfo = createData.personalInfo || {} as any;
    const financialInfo = createData.financialInfo || {} as any;
    const businessInfo = createData.businessInfo || {} as any;
    const preferredLocation = businessInfo.preferredLocation || {} as any;

    return {
      // Required fields
      franchiseId: createData.franchiseId,
      franchiseName: createData.franchiseName || 'Unknown Franchise', // Will be set from franchise data
      applicationFee: financialInfo.applicationFee || 0, // Default application fee

      // Personal Information (flattened)
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString().split('T')[0] : null,
      ssn: personalInfo.ssn,

      // Personal Address (flattened)
      street: personalInfo.address,
      city: personalInfo.city,
      state: personalInfo.state,
      zipCode: personalInfo.zipCode,
      country: personalInfo.country || 'India',

      // Emergency Contact
      emergencyContactName: personalInfo.emergencyContactName,
      emergencyContactPhone: personalInfo.emergencyContactPhone,

      // Financial Information (flattened)
      netWorth: financialInfo.netWorth || 0,
      liquidAssets: financialInfo.liquidCapital || 0, // Map liquidCapital to liquidAssets
      annualIncome: financialInfo.annualIncome || 0,
      creditScore: financialInfo.creditScore || 650,
      hasDebt: financialInfo.hasDebt || false,
      debtAmount: financialInfo.debtAmount || 0,
      investmentSource: financialInfo.investmentSource || 'Personal Savings',

      // Business Information (flattened)
      preferredStreet: preferredLocation.address,
      preferredCity: preferredLocation.city,
      preferredState: preferredLocation.state,
      preferredZipCode: preferredLocation.zipCode,
      preferredCountry: preferredLocation.country || 'India',
      timelineToOpen: businessInfo.timelineToOpen,
      fullTimeCommitment: businessInfo.fullTimeCommitment || false,
      hasPartners: businessInfo.hasPartners || false,
      partnerDetails: businessInfo.partnerDetails,

      // Additional fields
      motivation: createData.motivation || '',
      questions: createData.questions || ''
    };
  }
}
