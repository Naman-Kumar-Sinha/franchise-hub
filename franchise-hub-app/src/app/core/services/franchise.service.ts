import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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
      return this.mockDataService.franchises$;
    } else {
      return this.apiFranchiseService.getFranchises(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.franchises$))
      );
    }
  }

  getFranchiseById(id: string): Observable<Franchise | null> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getFranchiseById(id).pipe(
        switchMap(franchise => of(franchise || null))
      );
    } else {
      return this.apiFranchiseService.getFranchiseById(id).pipe(
        switchMap(franchise => of(franchise || null)),
        catchError(error => this.handleApiError(error, () =>
          this.mockDataService.getFranchiseById(id).pipe(
            switchMap(franchise => of(franchise || null))
          )
        ))
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
      return this.mockDataService.updateFranchisePartial(id, franchiseData as unknown as Partial<Franchise>);
    } else {
      return this.apiFranchiseService.updateFranchise(id, franchiseData).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.updateFranchisePartial(id, franchiseData as unknown as Partial<Franchise>)))
      );
    }
  }

  deleteFranchise(id: string): Observable<void> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.deleteFranchise(id).pipe(
        switchMap(() => of(undefined))
      );
    } else {
      return this.apiFranchiseService.deleteFranchise(id).pipe(
        catchError(error => this.handleApiError(error, () =>
          this.mockDataService.deleteFranchise(id).pipe(
            switchMap(() => of(undefined))
          )
        ))
      );
    }
  }

  getFranchisesByBusinessOwner(businessOwnerId: string): Observable<Franchise[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getFranchisesByBusiness(businessOwnerId);
    } else {
      return this.apiFranchiseService.getFranchisesByBusinessOwner(businessOwnerId).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.getFranchisesByBusiness(businessOwnerId)))
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
      return this.mockDataService.searchFranchises({ searchTerm });
    } else {
      return this.apiFranchiseService.searchFranchises(searchTerm).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.searchFranchises({ searchTerm })))
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

    // Check if current user is a demo account
    const currentUser = this.authService.getCurrentUser();
    const isDemoAccount = currentUser && this.authService.isDemoAccount(currentUser.email);

    // Only fallback to mock service for demo accounts
    if (environment.features.mockFallback && isDemoAccount) {
      console.warn('API call failed for demo account, falling back to mock service');
      return fallbackFn();
    }

    // For real accounts, never fallback - show proper error
    if (!isDemoAccount) {
      console.error('API call failed for real account - no fallback allowed');
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
  bulkUpdateFranchiseStatus(franchiseIds: string[], isActive: boolean): Observable<void> {
    if (this.shouldUseMockService()) {
      // Mock implementation - simulate bulk update
      return of(undefined);
    } else {
      // For API, we'll need to implement bulk update
      return of(undefined);
    }
  }

  updateFranchiseStatus(franchiseId: string, isActive: boolean): Observable<void> {
    if (this.shouldUseMockService()) {
      // Mock implementation - simulate status update
      return of(undefined);
    } else {
      return this.apiFranchiseService.updateFranchiseStatus(franchiseId, isActive).pipe(
        switchMap(() => of(undefined)), // Convert Franchise response to void
        catchError(error => this.handleApiError(error, () => of(undefined)))
      );
    }
  }
}
