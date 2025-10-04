import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';
import { ApiPaymentService } from './api-payment.service';
import { 
  PaymentTransaction, 
  PaymentRequest, 
  PaymentRequestStatus 
} from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  private apiPaymentService = inject(ApiPaymentService);

  // Payment Transaction Methods
  getPaymentTransactions(filters?: any): Observable<PaymentTransaction[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.paymentTransactions$;
    } else {
      return this.apiPaymentService.getPaymentTransactions(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.paymentTransactions$))
      );
    }
  }

  getPaymentTransactionsForApplication(applicationId: string): Observable<PaymentTransaction[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getPaymentTransactionsForApplication(applicationId);
    } else {
      return this.apiPaymentService.getPaymentTransactionsForApplication(applicationId).pipe(
        catchError(error => this.handleApiError(error, () =>
          this.mockDataService.getPaymentTransactionsForApplication(applicationId)
        ))
      );
    }
  }

  getPaymentTransactionById(id: string): Observable<PaymentTransaction | undefined> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.paymentTransactions$.pipe(
        switchMap(transactions => of(transactions.find(t => t.id === id)))
      );
    } else {
      return this.apiPaymentService.getPaymentTransactionById(id).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.paymentTransactions$.pipe(
            switchMap(transactions => of(transactions.find(t => t.id === id)))
          )
        ))
      );
    }
  }

  createPaymentTransaction(transactionData: Partial<PaymentTransaction>): Observable<PaymentTransaction> {
    if (this.shouldUseMockService()) {
      // Mock service doesn't have this method, so we'll simulate it
      return of({
        id: this.generateId(),
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as PaymentTransaction);
    } else {
      return this.apiPaymentService.createPaymentTransaction(transactionData).pipe(
        catchError(error => this.handleApiError(error, () => 
          of({
            id: this.generateId(),
            ...transactionData,
            createdAt: new Date(),
            updatedAt: new Date()
          } as PaymentTransaction)
        ))
      );
    }
  }

  processApplicationPayment(applicationId: string, paymentData: any): Observable<PaymentTransaction> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.processApplicationPayment(applicationId, paymentData);
    } else {
      return this.apiPaymentService.processApplicationPayment(applicationId, paymentData).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.processApplicationPayment(applicationId, paymentData)
        ))
      );
    }
  }

  // Payment Request Methods
  getPaymentRequests(filters?: any): Observable<PaymentRequest[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.paymentRequests$;
    } else {
      return this.apiPaymentService.getPaymentRequests(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.paymentRequests$))
      );
    }
  }

  getPaymentRequestById(id: string): Observable<PaymentRequest | undefined> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.paymentRequests$.pipe(
        switchMap(requests => of(requests.find(r => r.id === id)))
      );
    } else {
      return this.apiPaymentService.getPaymentRequestById(id).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.paymentRequests$.pipe(
            switchMap(requests => of(requests.find(r => r.id === id)))
          )
        ))
      );
    }
  }

  createPaymentRequest(
    applicationId: string, 
    amount: number, 
    purpose: string, 
    description?: string
  ): Observable<PaymentRequest> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.createPaymentRequest(applicationId, amount, purpose, description);
    } else {
      const requestData: Partial<PaymentRequest> = {
        applicationId,
        amount,
        purpose,
        description,
        status: PaymentRequestStatus.PENDING
      };
      
      return this.apiPaymentService.createPaymentRequest(requestData).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.createPaymentRequest(applicationId, amount, purpose, description)
        ))
      );
    }
  }

  updatePaymentRequest(id: string, requestData: Partial<PaymentRequest>): Observable<PaymentRequest> {
    if (this.shouldUseMockService()) {
      // Mock service doesn't have this method, so we'll simulate it
      return this.mockDataService.paymentRequests$.pipe(
        switchMap(requests => {
          const request = requests.find(r => r.id === id);
          if (request) {
            const updatedRequest = { ...request, ...requestData, updatedAt: new Date() };
            return of(updatedRequest);
          }
          throw new Error('Payment request not found');
        })
      );
    } else {
      return this.apiPaymentService.updatePaymentRequest(id, requestData).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.paymentRequests$.pipe(
            switchMap(requests => {
              const request = requests.find(r => r.id === id);
              if (request) {
                const updatedRequest = { ...request, ...requestData, updatedAt: new Date() };
                return of(updatedRequest);
              }
              throw new Error('Payment request not found');
            })
          )
        ))
      );
    }
  }

  processPaymentRequestsSettlement(paymentRequestIds: string[], paymentData: any): Observable<PaymentTransaction[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.processPaymentRequestsSettlement(paymentRequestIds, paymentData);
    } else {
      return this.apiPaymentService.processPaymentRequestsSettlement(paymentRequestIds, paymentData).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.processPaymentRequestsSettlement(paymentRequestIds, paymentData)
        ))
      );
    }
  }

  getPaymentRequestsForApplication(applicationId: string): Observable<PaymentRequest[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getPaymentRequestsForApplication(applicationId);
    } else {
      return this.apiPaymentService.getPaymentRequestsForApplication(applicationId).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.getPaymentRequestsForApplication(applicationId)
        ))
      );
    }
  }

  getPaymentRequestsForPartner(partnerId: string): Observable<PaymentRequest[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getPaymentRequestsForPartner(partnerId);
    } else {
      return this.apiPaymentService.getPaymentRequestsForPartner(partnerId).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.getPaymentRequestsForPartner(partnerId)
        ))
      );
    }
  }

  // Helper Methods
  private shouldUseMockService(): boolean {
    if (!environment.features.hybridAuth) {
      return !environment.features.realApiIntegration;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return true; // Default to mock if no user
    }

    // Check if current user is a demo account
    return environment.features.demoAccounts.includes(currentUser.email);
  }

  private handleApiError<T>(error: any, fallbackFn: () => Observable<T>): Observable<T> {
    if (environment.dev.enableApiLogging) {
      console.error('Payment API Error:', error);
    }

    if (environment.features.mockFallback) {
      console.warn('Payment API failed, falling back to mock service');
      return fallbackFn();
    }

    throw error;
  }

  private generateId(): string {
    return 'pay_' + Math.random().toString(36).substr(2, 9);
  }
}
