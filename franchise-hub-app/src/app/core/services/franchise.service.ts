import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';
import { ApiFranchiseService } from './api-franchise.service';
import { 
  Franchise, 
  FranchiseFormData, 
  FranchisePerformanceMetrics, 
  FranchiseManagementFilters 
} from '../models/franchise.model';

@Injectable({
  providedIn: 'root'
})
export class FranchiseService {
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  private apiFranchiseService = inject(ApiFranchiseService);

  getFranchises(filters?: FranchiseManagementFilters): Observable<Franchise[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getFranchises(filters);
    } else {
      return this.apiFranchiseService.getFranchises(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getFranchises(filters)))
      );
    }
  }

  getFranchiseById(id: string): Observable<Franchise> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getFranchiseById(id);
    } else {
      return this.apiFranchiseService.getFranchiseById(id).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getFranchiseById(id)))
      );
    }
  }

  createFranchise(franchiseData: FranchiseFormData): Observable<Franchise> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.createFranchise(franchiseData);
    } else {
      return this.apiFranchiseService.createFranchise(franchiseData).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.createFranchise(franchiseData)))
      );
    }
  }

  updateFranchise(id: string, franchiseData: FranchiseFormData): Observable<Franchise> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.updateFranchise(id, franchiseData);
    } else {
      return this.apiFranchiseService.updateFranchise(id, franchiseData).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.updateFranchise(id, franchiseData)))
      );
    }
  }

  deleteFranchise(id: string): Observable<void> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.deleteFranchise(id);
    } else {
      return this.apiFranchiseService.deleteFranchise(id).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.deleteFranchise(id)))
      );
    }
  }

  getFranchisesByBusinessOwner(businessOwnerId: string): Observable<Franchise[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getFranchisesByBusinessOwner(businessOwnerId);
    } else {
      return this.apiFranchiseService.getFranchisesByBusinessOwner(businessOwnerId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getFranchisesByBusinessOwner(businessOwnerId)))
      );
    }
  }

  getFranchisePerformanceMetrics(franchiseId: string): Observable<FranchisePerformanceMetrics> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getFranchisePerformanceMetrics(franchiseId);
    } else {
      return this.apiFranchiseService.getFranchisePerformanceMetrics(franchiseId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getFranchisePerformanceMetrics(franchiseId)))
      );
    }
  }

  searchFranchises(searchTerm: string): Observable<Franchise[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.searchFranchises(searchTerm);
    } else {
      return this.apiFranchiseService.searchFranchises(searchTerm).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.searchFranchises(searchTerm)))
      );
    }
  }

  // Reactive data streams for real-time updates (primarily for mock service)
  getFranchises$(): Observable<Franchise[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.franchises$;
    } else {
      // For API service, we'll need to implement real-time updates differently
      // For now, return a one-time fetch
      return this.getFranchises();
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
      console.error('API Error in FranchiseService:', error);
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
