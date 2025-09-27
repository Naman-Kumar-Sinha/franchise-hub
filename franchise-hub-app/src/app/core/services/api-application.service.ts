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
    personalAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
    };
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
    motivation: string;
    questions?: string;
  };
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
      map(apiApplications => apiApplications.map(this.mapApiApplicationToApplication))
    );
  }

  getApplicationById(id: string): Observable<Application> {
    return this.http.get<ApiApplication>(`${this.baseUrl}/${id}`).pipe(
      map(this.mapApiApplicationToApplication)
    );
  }

  createApplication(applicationData: ApplicationCreateData): Observable<Application> {
    const apiData = this.mapApplicationCreateDataToApi(applicationData);
    return this.http.post<ApiApplication>(this.baseUrl, apiData).pipe(
      map(this.mapApiApplicationToApplication)
    );
  }

  updateApplication(id: string, applicationData: Partial<ApplicationCreateData>): Observable<Application> {
    const apiData = this.mapApplicationCreateDataToApi(applicationData);
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}`, apiData).pipe(
      map(this.mapApiApplicationToApplication)
    );
  }

  reviewApplication(id: string, reviewData: ApplicationReviewData): Observable<Application> {
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}/review`, reviewData).pipe(
      map(this.mapApiApplicationToApplication)
    );
  }

  approveApplication(id: string, notes?: string): Observable<Application> {
    const data = { status: 'APPROVED', reviewNotes: notes };
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}/approve`, data).pipe(
      map(this.mapApiApplicationToApplication)
    );
  }

  rejectApplication(id: string, reason: string, notes?: string): Observable<Application> {
    const data = { status: 'REJECTED', rejectionReason: reason, reviewNotes: notes };
    return this.http.put<ApiApplication>(`${this.baseUrl}/${id}/reject`, data).pipe(
      map(this.mapApiApplicationToApplication)
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
    const params = new HttpParams().set('applicantId', applicantId);
    return this.http.get<ApiApplication[]>(this.baseUrl, { params }).pipe(
      map(apiApplications => apiApplications.map(this.mapApiApplicationToApplication))
    );
  }

  getApplicationsByFranchise(franchiseId: string): Observable<Application[]> {
    const params = new HttpParams().set('franchiseId', franchiseId);
    return this.http.get<ApiApplication[]>(this.baseUrl, { params }).pipe(
      map(apiApplications => apiApplications.map(this.mapApiApplicationToApplication))
    );
  }

  private mapApiApplicationToApplication(apiApplication: ApiApplication): Application {
    return {
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
      paymentStatus: apiApplication.paymentStatus as PaymentStatus,
      personalInfo: {
        firstName: apiApplication.personalInfo.firstName,
        lastName: apiApplication.personalInfo.lastName,
        email: apiApplication.personalInfo.email,
        phone: apiApplication.personalInfo.phone,
        address: apiApplication.personalInfo.personalAddress?.street || '',
        city: apiApplication.personalInfo.personalAddress?.city || '',
        state: apiApplication.personalInfo.personalAddress?.state || '',
        zipCode: apiApplication.personalInfo.personalAddress?.zipCode || '',
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
          country: apiApplication.businessInfo.preferredLocation.country || 'US'
        },
        preferredStates: apiApplication.businessInfo.preferredStates,
        timelineToOpen: apiApplication.businessInfo.timelineToOpen,
        fullTimeCommitment: apiApplication.businessInfo.fullTimeCommitment,
        hasPartners: apiApplication.businessInfo.hasPartners,
        partnerDetails: apiApplication.businessInfo.partnerDetails
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
      motivation: '',
      questions: '',
      references: [],
      documents: []
    };
  }

  private mapApplicationCreateDataToApi(createData: Partial<ApplicationCreateData>): any {
    return {
      franchiseId: createData.franchiseId,
      personalInfo: createData.personalInfo,
      financialInfo: createData.financialInfo,
      businessInfo: createData.businessInfo
    };
  }
}
