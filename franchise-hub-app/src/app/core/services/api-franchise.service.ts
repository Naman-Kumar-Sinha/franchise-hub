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
  investmentRange: {
    min: number;
    max: number;
  };
  financialInfo: {
    averageRevenue?: number;
    profitMargin?: number;
    growthRate?: number;
  };
  operationalInfo: {
    totalUnits: number;
    franchisedUnits: number;
    companyOwnedUnits: number;
    yearEstablished: number;
  };
  territories: string[];
  states: string[];
  backgroundRequirements: string[];
  supportInfo: {
    ongoingSupport: boolean;
    nationalAdvertising: boolean;
    localMarketingSupport: boolean;
    digitalMarketing: boolean;
    trainingLocation?: string;
    initialTrainingDays?: number;
    supportDescription?: string;
    marketingDescription?: string;
  };
  requirements: {
    creditScore?: number;
    education?: string;
    experience?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiFranchiseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${environment.endpoints.franchises}`;

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

    return this.http.get<ApiFranchise[]>(this.baseUrl, { params }).pipe(
      map(apiFranchises => apiFranchises.map(this.mapApiFranchiseToFranchise))
    );
  }

  getFranchiseById(id: string): Observable<Franchise> {
    return this.http.get<ApiFranchise>(`${this.baseUrl}/${id}`).pipe(
      map(this.mapApiFranchiseToFranchise)
    );
  }

  createFranchise(franchiseData: FranchiseFormData): Observable<Franchise> {
    const apiData = this.mapFranchiseFormDataToApi(franchiseData);
    return this.http.post<ApiFranchise>(this.baseUrl, apiData).pipe(
      map(this.mapApiFranchiseToFranchise)
    );
  }

  updateFranchise(id: string, franchiseData: FranchiseFormData): Observable<Franchise> {
    const apiData = this.mapFranchiseFormDataToApi(franchiseData);
    return this.http.put<ApiFranchise>(`${this.baseUrl}/${id}`, apiData).pipe(
      map(this.mapApiFranchiseToFranchise)
    );
  }

  deleteFranchise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getFranchisesByBusinessOwner(businessOwnerId: string): Observable<Franchise[]> {
    const params = new HttpParams().set('businessOwnerId', businessOwnerId);
    return this.http.get<ApiFranchise[]>(this.baseUrl, { params }).pipe(
      map(apiFranchises => apiFranchises.map(this.mapApiFranchiseToFranchise))
    );
  }

  getFranchisePerformanceMetrics(franchiseId: string): Observable<FranchisePerformanceMetrics> {
    return this.http.get<FranchisePerformanceMetrics>(`${this.baseUrl}/${franchiseId}/metrics`);
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
      liquidCapitalRequired: apiFranchise.liquidCapitalRequired,
      netWorthRequired: apiFranchise.netWorthRequired,
      investmentRange: apiFranchise.investmentRange,
      financialInfo: apiFranchise.financialInfo,
      operationalInfo: apiFranchise.operationalInfo,
      territories: apiFranchise.territories,
      states: apiFranchise.states,
      backgroundRequirements: apiFranchise.backgroundRequirements,
      supportInfo: apiFranchise.supportInfo,
      requirements: apiFranchise.requirements,
      createdAt: new Date(apiFranchise.createdAt),
      updatedAt: apiFranchise.updatedAt ? new Date(apiFranchise.updatedAt) : undefined
    };
  }

  private mapFranchiseFormDataToApi(formData: FranchiseFormData): any {
    return {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      logo: formData.logo,
      images: formData.images || [],
      franchiseFee: formData.franchiseFee,
      royaltyFee: formData.royaltyFee,
      marketingFee: formData.marketingFee,
      liquidCapitalRequired: formData.liquidCapitalRequired,
      netWorthRequired: formData.netWorthRequired,
      investmentRange: formData.investmentRange,
      financialInfo: formData.financialInfo || {},
      operationalInfo: formData.operationalInfo,
      territories: formData.territories || [],
      states: formData.states || [],
      backgroundRequirements: formData.backgroundRequirements || [],
      supportInfo: formData.supportInfo || {},
      requirements: formData.requirements || {}
    };
  }
}
