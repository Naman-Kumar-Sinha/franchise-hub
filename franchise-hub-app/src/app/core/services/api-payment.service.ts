import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  PaymentTransaction, 
  PaymentRequest, 
  PaymentRequestStatus,
  PaymentStatus 
} from '../models/application.model';

export interface ApiPaymentTransaction {
  id: string;
  applicationId?: string;
  franchiseId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  type: string;
  description?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayTransactionId?: string;
  gatewaySignature?: string;
  bankTransactionId?: string;
  upiTransactionId?: string;
  cardLast4?: string;
  cardNetwork?: string;
  cardType?: string;
  bankName?: string;
  upiId?: string;
  walletName?: string;
  walletTransactionId?: string;
  platformFee: number;
  netAmount: number;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
  updatedAt?: string;
}

export interface ApiPaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  franchiseId: string;
  applicationId?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
  notes?: string;
  dueDate?: string;
  paidAt?: string;
  reminders_sent?: number;
  lastReminderSent?: string;
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiPaymentService {
  private http = inject(HttpClient);

  // Payment Transaction Methods
  getPaymentTransactions(filters?: any): Observable<PaymentTransaction[]> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.transactions}`;
    const params = this.buildQueryParams(filters);
    
    return this.http.get<ApiPaymentTransaction[]>(url, { params }).pipe(
      map(apiTransactions => apiTransactions.map(t => this.mapApiTransactionToTransaction(t))),
      catchError(this.handleError)
    );
  }

  getPaymentTransactionById(id: string): Observable<PaymentTransaction> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.transactions}/${id}`;
    
    return this.http.get<ApiPaymentTransaction>(url).pipe(
      map(apiTransaction => this.mapApiTransactionToTransaction(apiTransaction)),
      catchError(this.handleError)
    );
  }

  createPaymentTransaction(transactionData: Partial<PaymentTransaction>): Observable<PaymentTransaction> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.transactions}`;
    const apiData = this.mapTransactionToApiTransaction(transactionData);
    
    return this.http.post<ApiPaymentTransaction>(url, apiData).pipe(
      map(apiTransaction => this.mapApiTransactionToTransaction(apiTransaction)),
      catchError(this.handleError)
    );
  }

  processApplicationPayment(applicationId: string, paymentData: any): Observable<PaymentTransaction> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.processApplication}/${applicationId}`;
    const requestData = {
      paymentMethod: paymentData.paymentMethod || 'UPI'
    };

    return this.http.post<ApiPaymentTransaction>(url, requestData).pipe(
      map(apiTransaction => this.mapApiTransactionToTransaction(apiTransaction)),
      catchError(this.handleError)
    );
  }

  // Payment Request Methods
  getPaymentRequests(filters?: any): Observable<PaymentRequest[]> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.requests}`;
    const params = this.buildQueryParams(filters);
    
    return this.http.get<ApiPaymentRequest[]>(url, { params }).pipe(
      map(apiRequests => apiRequests.map(r => this.mapApiRequestToRequest(r))),
      catchError(this.handleError)
    );
  }

  getPaymentRequestById(id: string): Observable<PaymentRequest> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.requests}/${id}`;
    
    return this.http.get<ApiPaymentRequest>(url).pipe(
      map(apiRequest => this.mapApiRequestToRequest(apiRequest)),
      catchError(this.handleError)
    );
  }

  createPaymentRequest(requestData: Partial<PaymentRequest>): Observable<PaymentRequest> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.requests}`;
    const apiData = this.mapRequestToApiRequest(requestData);
    
    return this.http.post<ApiPaymentRequest>(url, apiData).pipe(
      map(apiRequest => this.mapApiRequestToRequest(apiRequest)),
      catchError(this.handleError)
    );
  }

  updatePaymentRequest(id: string, requestData: Partial<PaymentRequest>): Observable<PaymentRequest> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.requests}/${id}`;
    const apiData = this.mapRequestToApiRequest(requestData);
    
    return this.http.put<ApiPaymentRequest>(url, apiData).pipe(
      map(apiRequest => this.mapApiRequestToRequest(apiRequest)),
      catchError(this.handleError)
    );
  }

  processPaymentRequestsSettlement(paymentRequestIds: string[], paymentData: any): Observable<PaymentTransaction[]> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.settlement}`;
    const requestData = {
      paymentRequestIds,
      ...paymentData
    };
    
    return this.http.post<ApiPaymentTransaction[]>(url, requestData).pipe(
      map(apiTransactions => apiTransactions.map(t => this.mapApiTransactionToTransaction(t))),
      catchError(this.handleError)
    );
  }

  getPaymentRequestsForApplication(applicationId: string): Observable<PaymentRequest[]> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.requests}`;
    const params = { applicationId };
    
    return this.http.get<ApiPaymentRequest[]>(url, { params }).pipe(
      map(apiRequests => apiRequests.map(r => this.mapApiRequestToRequest(r))),
      catchError(this.handleError)
    );
  }

  getPaymentRequestsForPartner(partnerId: string): Observable<PaymentRequest[]> {
    const url = `${environment.apiUrl}${environment.endpoints.payments.requests}`;
    const params = { toUserId: partnerId };
    
    return this.http.get<ApiPaymentRequest[]>(url, { params }).pipe(
      map(apiRequests => apiRequests.map(r => this.mapApiRequestToRequest(r))),
      catchError(this.handleError)
    );
  }

  // Mapping Methods
  private mapApiTransactionToTransaction(apiTransaction: ApiPaymentTransaction): PaymentTransaction {
    return {
      id: apiTransaction.id,
      applicationId: apiTransaction.applicationId || '',
      partnerId: apiTransaction.userId,
      partnerName: '', // Will need to be populated from user data
      franchiseId: apiTransaction.franchiseId,
      franchiseName: '', // Will need to be populated from franchise data
      amount: apiTransaction.amount,
      currency: apiTransaction.currency,
      status: apiTransaction.status as PaymentStatus,
      paymentMethod: apiTransaction.method,
      transactionReference: apiTransaction.gatewayTransactionId || apiTransaction.id,
      gatewayTransactionId: apiTransaction.gatewayTransactionId,
      initiatedAt: new Date(apiTransaction.createdAt),
      completedAt: apiTransaction.processedAt ? new Date(apiTransaction.processedAt) : undefined,
      description: apiTransaction.description || '',
      receiptUrl: `/receipts/${apiTransaction.id}.pdf`,
      createdAt: new Date(apiTransaction.createdAt),
      updatedAt: apiTransaction.updatedAt ? new Date(apiTransaction.updatedAt) : new Date()
    };
  }

  private mapTransactionToApiTransaction(transaction: Partial<PaymentTransaction>): Partial<ApiPaymentTransaction> {
    return {
      applicationId: transaction.applicationId,
      franchiseId: transaction.franchiseId!,
      userId: transaction.partnerId!,
      amount: transaction.amount!,
      currency: transaction.currency || 'INR',
      method: transaction.paymentMethod!,
      status: transaction.status!,
      type: 'APPLICATION_FEE',
      description: transaction.description,
      platformFee: 0,
      netAmount: transaction.amount!
    };
  }

  private mapApiRequestToRequest(apiRequest: ApiPaymentRequest): PaymentRequest {
    return {
      id: apiRequest.id,
      applicationId: apiRequest.applicationId || '',
      franchiseId: apiRequest.franchiseId,
      franchiseName: '', // Will need to be populated from franchise data
      businessOwnerId: apiRequest.fromUserId,
      businessOwnerName: '', // Will need to be populated from user data
      partnerId: apiRequest.toUserId,
      partnerName: '', // Will need to be populated from user data
      partnerEmail: '', // Will need to be populated from user data
      amount: apiRequest.amount,
      currency: apiRequest.currency,
      purpose: apiRequest.title,
      description: apiRequest.description,
      status: apiRequest.status as PaymentRequestStatus,
      requestedAt: new Date(apiRequest.createdAt),
      dueDate: apiRequest.dueDate ? new Date(apiRequest.dueDate) : undefined,
      paidAt: apiRequest.paidAt ? new Date(apiRequest.paidAt) : undefined,
      createdAt: new Date(apiRequest.createdAt),
      updatedAt: apiRequest.updatedAt ? new Date(apiRequest.updatedAt) : new Date(),
      createdBy: apiRequest.fromUserId
    };
  }

  private mapRequestToApiRequest(request: Partial<PaymentRequest>): Partial<ApiPaymentRequest> {
    return {
      fromUserId: request.businessOwnerId!,
      toUserId: request.partnerId!,
      franchiseId: request.franchiseId!,
      applicationId: request.applicationId,
      title: request.purpose!,
      description: request.description,
      amount: request.amount!,
      currency: request.currency || 'INR',
      type: 'FRANCHISE_FEE',
      status: request.status!,
      dueDate: request.dueDate?.toISOString(),
      notes: request.description
    };
  }

  private buildQueryParams(filters?: any): any {
    if (!filters) return {};
    
    const params: any = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params[key] = filters[key];
      }
    });
    return params;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status === 404) {
        errorMessage = 'Payment not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid payment data';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    if (environment.dev.enableApiLogging) {
      console.error('API Payment Error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
