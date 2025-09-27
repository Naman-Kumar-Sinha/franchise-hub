import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BusinessDashboardStats {
  totalFranchises: number;
  activeFranchises: number;
  pendingFranchises: number;
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiBusinessService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/business`;

  getDashboardStats(): Observable<BusinessDashboardStats> {
    return this.http.get<BusinessDashboardStats>(`${this.baseUrl}/dashboard`);
  }

  getFranchiseStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats/franchises`);
  }

  getApplicationStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats/applications`);
  }

  getPaymentStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats/payments`);
  }
}
