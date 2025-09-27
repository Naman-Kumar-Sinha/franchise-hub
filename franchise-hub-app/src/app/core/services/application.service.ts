import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';
import { ApiApplicationService } from './api-application.service';
import { 
  Application,
  ApplicationCreateData,
  ApplicationReviewData,
  ApplicationDocument,
  DocumentType
} from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  private apiApplicationService = inject(ApiApplicationService);

  getApplications(filters?: any): Observable<Application[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplications(filters);
    } else {
      return this.apiApplicationService.getApplications(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplications(filters)))
      );
    }
  }

  getApplicationById(id: string): Observable<Application> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationById(id);
    } else {
      return this.apiApplicationService.getApplicationById(id).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationById(id)))
      );
    }
  }

  createApplication(applicationData: ApplicationCreateData): Observable<Application> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.createApplication(applicationData);
    } else {
      return this.apiApplicationService.createApplication(applicationData).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.createApplication(applicationData)))
      );
    }
  }

  updateApplication(id: string, applicationData: Partial<ApplicationCreateData>): Observable<Application> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.updateApplication(id, applicationData);
    } else {
      return this.apiApplicationService.updateApplication(id, applicationData).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.updateApplication(id, applicationData)))
      );
    }
  }

  reviewApplication(id: string, reviewData: ApplicationReviewData): Observable<Application> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.reviewApplication(id, reviewData);
    } else {
      return this.apiApplicationService.reviewApplication(id, reviewData).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.reviewApplication(id, reviewData)))
      );
    }
  }

  approveApplication(id: string, notes?: string): Observable<Application> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.approveApplication(id, notes);
    } else {
      return this.apiApplicationService.approveApplication(id, notes).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.approveApplication(id, notes)))
      );
    }
  }

  rejectApplication(id: string, reason: string, notes?: string): Observable<Application> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.rejectApplication(id, reason, notes);
    } else {
      return this.apiApplicationService.rejectApplication(id, reason, notes).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.rejectApplication(id, reason, notes)))
      );
    }
  }

  uploadDocument(applicationId: string, file: File, documentType: DocumentType): Observable<ApplicationDocument> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.uploadDocument(applicationId, file, documentType);
    } else {
      return this.apiApplicationService.uploadDocument(applicationId, file, documentType).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.uploadDocument(applicationId, file, documentType)))
      );
    }
  }

  getApplicationDocuments(applicationId: string): Observable<ApplicationDocument[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationDocuments(applicationId);
    } else {
      return this.apiApplicationService.getApplicationDocuments(applicationId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationDocuments(applicationId)))
      );
    }
  }

  deleteApplication(id: string): Observable<void> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.deleteApplication(id);
    } else {
      return this.apiApplicationService.deleteApplication(id).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.deleteApplication(id)))
      );
    }
  }

  getApplicationsByApplicant(applicantId: string): Observable<Application[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationsByApplicant(applicantId);
    } else {
      return this.apiApplicationService.getApplicationsByApplicant(applicantId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationsByApplicant(applicantId)))
      );
    }
  }

  getApplicationsByFranchise(franchiseId: string): Observable<Application[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationsByFranchise(franchiseId);
    } else {
      return this.apiApplicationService.getApplicationsByFranchise(franchiseId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationsByFranchise(franchiseId)))
      );
    }
  }

  // Reactive data streams for real-time updates (primarily for mock service)
  getApplications$(): Observable<Application[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.applications$;
    } else {
      // For API service, we'll need to implement real-time updates differently
      // For now, return a one-time fetch
      return this.getApplications();
    }
  }

  private shouldUseMockService(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      // No user logged in, use mock service
      return true;
    }
    
    if (this.authService.isDemoAccount(currentUser.email)) {
      // Demo account, always use mock service
      return true;
    }
    
    if (!environment.features.realApiIntegration) {
      // Real API integration disabled, use mock service
      return true;
    }
    
    // Use real API service
    return false;
  }

  private handleApiError<T>(error: any, fallbackFn: () => Observable<T>): Observable<T> {
    if (environment.dev.enableLogging) {
      console.error('API Error in ApplicationService:', error);
    }
    
    if (environment.features.mockFallback) {
      console.warn('API call failed, falling back to mock service');
      return fallbackFn();
    }
    
    return throwError(() => error);
  }

  // Additional methods for compatibility with existing components
  isUsingMockService(): boolean {
    return this.shouldUseMockService();
  }

  isUsingRealApi(): boolean {
    return !this.shouldUseMockService();
  }
}
