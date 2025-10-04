import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';
import { ApiApplicationService } from './api-application.service';
import {
  Application,
  ApplicationCreateData,
  ApplicationReviewData,
  ApplicationDocument,
  DocumentType,
  FranchiseApplication
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
      return this.mockDataService.getApplications();
    } else {
      return this.apiApplicationService.getApplications(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplications()))
      );
    }
  }

  getApplicationById(id: string): Observable<Application | null> {
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
      // MockDataService doesn't have updateApplication, so we'll simulate it
      return this.mockDataService.getApplicationById(id).pipe(
        switchMap(app => {
          if (app) {
            const updatedApp = { ...app, ...applicationData, updatedAt: new Date() };
            return of(updatedApp as Application);
          }
          throw new Error('Application not found');
        })
      );
    } else {
      return this.apiApplicationService.updateApplication(id, applicationData).pipe(
        catchError(error => this.handleApiError(error, () =>
          this.mockDataService.getApplicationById(id).pipe(
            switchMap(app => {
              if (app) {
                const updatedApp = { ...app, ...applicationData, updatedAt: new Date() };
                return of(updatedApp as Application);
              }
              throw new Error('Application not found');
            })
          )
        ))
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
      return this.mockDataService.rejectApplication(id, reason);
    } else {
      return this.apiApplicationService.rejectApplication(id, reason, notes).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.rejectApplication(id, reason)))
      );
    }
  }

  uploadDocument(applicationId: string, file: File, documentType: DocumentType): Observable<ApplicationDocument> {
    if (this.shouldUseMockService()) {
      // Mock implementation - simulate document upload
      const mockDoc: ApplicationDocument = {
        id: 'doc_' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: documentType,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        size: file.size,
        isRequired: false
      };
      return of(mockDoc);
    } else {
      return this.apiApplicationService.uploadDocument(applicationId, file, documentType).pipe(
        catchError(error => this.handleApiError(error, () => {
          const mockDoc: ApplicationDocument = {
            id: 'doc_' + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: documentType,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
            size: file.size,
            isRequired: false
          };
          return of(mockDoc);
        }))
      );
    }
  }

  getApplicationDocuments(applicationId: string): Observable<ApplicationDocument[]> {
    if (this.shouldUseMockService()) {
      // Mock implementation - return empty array for now
      return of([]);
    } else {
      return this.apiApplicationService.getApplicationDocuments(applicationId).pipe(
        catchError(error => this.handleApiError(error, () => of([])))
      );
    }
  }

  deleteApplication(id: string): Observable<void> {
    if (this.shouldUseMockService()) {
      // Mock implementation - simulate deletion
      return of(undefined);
    } else {
      return this.apiApplicationService.deleteApplication(id).pipe(
        catchError(error => this.handleApiError(error, () => of(undefined)))
      );
    }
  }

  getApplicationsByApplicant(applicantId: string): Observable<Application[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationsByPartner(applicantId);
    } else {
      return this.apiApplicationService.getApplicationsByApplicant(applicantId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationsByPartner(applicantId)))
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

  // Methods that components expect
  getApplicationsForBusiness(businessId: string): Observable<FranchiseApplication[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationsForBusiness(businessId);
    } else {
      // For API, we'll use the general getApplications with filters
      return this.apiApplicationService.getApplications({ businessId }).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationsForBusiness(businessId)))
      );
    }
  }

  getApplicationsForPartner(partnerId: string): Observable<FranchiseApplication[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getApplicationsForPartner(partnerId);
    } else {
      return this.apiApplicationService.getApplicationsByApplicant(partnerId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getApplicationsForPartner(partnerId)))
      );
    }
  }

  getPartnershipsForPartner(partnerId: string): Observable<any[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getPartnershipsForPartner(partnerId);
    } else {
      // For API, we'll simulate partnerships from applications
      return this.apiApplicationService.getApplications({ partnerId }).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getPartnershipsForPartner(partnerId)))
      );
    }
  }
}
