import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Franchise,
  FranchiseFormData,
  FranchisePerformanceMetrics,
  FranchiseManagementFilters,
  FranchiseCategory,
  FranchiseStatus
} from '../models/franchise.model';
import { ApiRetryService } from './api-retry.service';

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

export interface ApiFranchise {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  businessOwnerId: string;
  businessOwnerName: string;
  logo?: string;
  images: string[];
  franchiseFee: number;
  royaltyFee: number;
  marketingFee: number;
  liquidCapitalRequired: number;
  netWorthRequired: number;
  // Backend returns these as top-level fields, not nested
  yearEstablished: number;
  totalUnits: number;
  franchisedUnits: number;
  companyOwnedUnits: number;
  initialInvestment: {
    min: number;
    max: number;
  };
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Collections
  availableTerritories: string[];
  availableStates: string[];
  // Embedded objects (may be null/undefined)
  requirements?: any;
  marketingSupport?: any;
  trainingSupport?: any;
  performanceMetrics?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiFranchiseService {
  private http = inject(HttpClient);
  private retryService = inject(ApiRetryService);
  private baseUrl = `${environment.apiUrl}${environment.endpoints.franchises.list}`;

  getFranchises(filters?: FranchiseManagementFilters): Observable<Franchise[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.minInvestment) params = params.set('minInvestment', filters.minInvestment.toString());
      if (filters.maxInvestment) params = params.set('maxInvestment', filters.maxInvestment.toString());
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
      if (filters.states && filters.states.length > 0) {
        filters.states.forEach(state => params = params.append('states', state));
      }
    }

    return this.http.get<ApiPagedResponse<ApiFranchise>>(this.baseUrl, { params }).pipe(
      map(response => response.content.map(this.mapApiFranchiseToFranchise))
    );
  }

  getFranchiseById(id: string): Observable<Franchise> {
    return this.http.get<ApiFranchise>(`${this.baseUrl}/${id}`).pipe(
      map(this.mapApiFranchiseToFranchise)
    );
  }

  createFranchise(franchiseData: FranchiseFormData): Observable<Franchise> {
    const apiData = this.mapFranchiseFormDataToApi(franchiseData);
    const request = this.http.post<ApiFranchise>(this.baseUrl, apiData).pipe(
      map(this.mapApiFranchiseToFranchise)
    );

    // Add retry logic for critical franchise creation
    return this.retryService.withRetry(request, ApiRetryService.createConfig('critical'));
  }

  updateFranchise(id: string, franchiseData: FranchiseFormData): Observable<Franchise> {
    const apiData = this.mapFranchiseFormDataToApi(franchiseData);
    const request = this.http.put<ApiFranchise>(`${this.baseUrl}/${id}`, apiData).pipe(
      map(this.mapApiFranchiseToFranchise)
    );

    // Add retry logic for critical franchise updates
    return this.retryService.withRetry(request, ApiRetryService.createConfig('critical'));
  }

  deleteFranchise(id: string): Observable<void> {
    const request = this.http.delete<void>(`${this.baseUrl}/${id}`);

    // Add retry logic for critical franchise deletion
    return this.retryService.withRetry(request, ApiRetryService.createConfig('critical'));
  }

  updateFranchiseStatus(id: string, isActive: boolean): Observable<Franchise> {
    const params = new HttpParams().set('isActive', isActive.toString());
    const request = this.http.patch<ApiFranchise>(`${this.baseUrl}/${id}/toggle-status`, null, { params }).pipe(
      map(this.mapApiFranchiseToFranchise)
    );

    // Add retry logic for status updates
    return this.retryService.withRetry(request, ApiRetryService.createConfig('default'));
  }

  getFranchisesByBusinessOwner(businessOwnerId: string): Observable<Franchise[]> {
    const params = new HttpParams().set('businessOwnerId', businessOwnerId);
    return this.http.get<ApiPagedResponse<ApiFranchise>>(this.baseUrl, { params }).pipe(
      map(response => response.content.map(this.mapApiFranchiseToFranchise))
    );
  }

  getFranchisePerformanceMetrics(franchiseId: string): Observable<FranchisePerformanceMetrics> {
    // Use the correct endpoint path from environment
    const metricsUrl = environment.endpoints.franchises.performance.replace('{id}', franchiseId);
    const request = this.http.get<FranchisePerformanceMetrics>(`${environment.apiUrl}${metricsUrl}`);

    // Add retry logic for performance metrics (background scenario)
    return this.retryService.withRetry(request, ApiRetryService.createConfig('background'));
  }

  searchFranchises(searchTerm: string): Observable<Franchise[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<ApiFranchise[]>(`${this.baseUrl}/search`, { params }).pipe(
      map(apiFranchises => apiFranchises.map(this.mapApiFranchiseToFranchise))
    );
  }

  private mapApiFranchiseToFranchise(apiFranchise: ApiFranchise): Franchise {
    return {
      id: apiFranchise.id,
      name: apiFranchise.name,
      description: apiFranchise.description,
      category: apiFranchise.category as FranchiseCategory,
      status: apiFranchise.status as FranchiseStatus,
      businessOwnerId: apiFranchise.businessOwnerId,
      businessOwnerName: apiFranchise.businessOwnerName,
      logo: apiFranchise.logo,
      images: apiFranchise.images,
      franchiseFee: apiFranchise.franchiseFee,
      royaltyFee: apiFranchise.royaltyFee,
      marketingFee: apiFranchise.marketingFee,
      liquidCapitalRequired: apiFranchise.liquidCapitalRequired || 100000,
      netWorthRequired: apiFranchise.netWorthRequired || 250000,
      initialInvestment: {
        min: apiFranchise.initialInvestment?.min || 50000,
        max: apiFranchise.initialInvestment?.max || 200000
      },
      // Use top-level fields from backend response (not nested under operationalInfo)
      yearEstablished: apiFranchise.yearEstablished || 2020,
      totalUnits: apiFranchise.totalUnits || 50,
      franchisedUnits: apiFranchise.franchisedUnits || 40,
      companyOwnedUnits: apiFranchise.companyOwnedUnits || 10,
      requirements: {
        experience: apiFranchise.requirements?.experience || '',
        education: apiFranchise.requirements?.education || '',
        creditScore: apiFranchise.requirements?.creditScore || 0,
        background: []
      },
      support: {
        training: '',
        marketing: '',
        operations: '',
        technology: ''
      },
      territories: apiFranchise.availableTerritories || [],
      availableStates: apiFranchise.availableStates || ['CA', 'TX', 'NY', 'FL'],
      internationalOpportunities: false,
      contactInfo: {
        phone: '1-800-FRANCHISE',
        email: 'info@franchise.com',
        website: 'https://franchise.com',
        address: '123 Business St, City, State 12345'
      },
      isActive: true,
      isFeatured: false,
      viewCount: 0,
      applicationCount: 0,
      rating: 4.5,
      reviewCount: 0,
      createdAt: new Date(apiFranchise.createdAt),
      updatedAt: apiFranchise.updatedAt ? new Date(apiFranchise.updatedAt) : new Date()
    };
  }

  private mapFranchiseFormDataToApi(formData: FranchiseFormData): any {
    return {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      logo: '', // Not in FranchiseFormData
      images: [], // Not in FranchiseFormData
      franchiseFee: formData.franchiseFee,
      royaltyFee: formData.royaltyFee,
      marketingFee: formData.marketingFee,
      liquidCapitalRequired: formData.liquidCapitalRequired,
      netWorthRequired: formData.netWorthRequired,
      investmentRange: formData.initialInvestment, // Use initialInvestment
      financialInfo: {
        liquidCapitalRequired: formData.liquidCapitalRequired,
        netWorthRequired: formData.netWorthRequired
      },
      operationalInfo: formData.support, // Use support as operational info
      territories: [formData.territory], // Wrap single territory in array
      states: [], // Not in FranchiseFormData
      backgroundRequirements: [], // Not in FranchiseFormData
      supportInfo: formData.support,
      requirements: formData.requirements,
      yearEstablished: formData.yearEstablished
    };
  }
}
