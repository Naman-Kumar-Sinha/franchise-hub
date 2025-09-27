import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';

import { ApplicationService } from '../../../../core/services/application.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { FranchiseApplication, PaymentStatus, PaymentRequest } from '../../../../core/models/application.model';
import { PaymentMethod } from '../../../../core/models/transaction.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatStepperModule
  ],
  template: `
    <div class="payment-container">
      <div class="payment-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isPaymentRequestMode ? 'Payment Request Settlement' : 'Application Fee Payment' }}</h1>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading payment details...</p>
      </div>

      <div *ngIf="!isLoading && (application || paymentRequests.length > 0)" class="payment-content">
        <div class="payment-grid">
          <!-- Application Summary -->
          <mat-card class="application-summary" *ngIf="!isPaymentRequestMode && application">
            <mat-card-header>
              <mat-card-title>Application Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-item">
                <span class="label">Franchise:</span>
                <span class="value">{{ application.franchiseName }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Category:</span>
                <span class="value">{{ application.franchiseCategory }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Application ID:</span>
                <span class="value">#{{ application.id.substring(0, 8).toUpperCase() }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Submitted:</span>
                <span class="value">{{ formatDate(application.submittedAt) }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="summary-item total">
                <span class="label">Application Fee:</span>
                <span class="value amount">{{ formatCurrency(application.applicationFee) }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Payment Requests Summary -->
          <mat-card class="payment-requests-summary" *ngIf="isPaymentRequestMode && paymentRequests.length > 0">
            <mat-card-header>
              <mat-card-title>Payment Requests Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngFor="let request of paymentRequests; let last = last" class="payment-request-item">
                <div class="summary-item">
                  <span class="label">{{ request.purpose }}:</span>
                  <span class="value">{{ request.franchiseName }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Amount:</span>
                  <span class="value amount">{{ formatCurrency(request.amount) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Requested:</span>
                  <span class="value">{{ formatDate(request.requestedAt) }}</span>
                </div>
                <mat-divider *ngIf="!last"></mat-divider>
              </div>
              <mat-divider></mat-divider>
              <div class="summary-item total">
                <span class="label">Total Amount:</span>
                <span class="value amount">{{ formatCurrency(getTotalPaymentRequestsAmount()) }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Payment Form -->
          <mat-card class="payment-form">
            <mat-card-header>
              <mat-card-title>Payment Details</mat-card-title>
              <mat-card-subtitle>Choose your preferred payment method</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="paymentForm" (ngSubmit)="processPayment()">
                <!-- Payment Method Selection -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Payment Method</mat-label>
                  <mat-select formControlName="paymentMethod" required>
                    <mat-option value="{{ PaymentMethod.UPI }}">
                      <mat-icon>account_balance_wallet</mat-icon>
                      UPI (Google Pay, PhonePe, Paytm)
                    </mat-option>
                    <mat-option value="{{ PaymentMethod.NET_BANKING }}">
                      <mat-icon>account_balance</mat-icon>
                      Net Banking
                    </mat-option>
                    <mat-option value="{{ PaymentMethod.DEBIT_CARD }}">
                      <mat-icon>credit_card</mat-icon>
                      Debit Card
                    </mat-option>
                    <mat-option value="{{ PaymentMethod.WALLET }}">
                      <mat-icon>wallet</mat-icon>
                      Digital Wallet
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="paymentForm.get('paymentMethod')?.hasError('required')">
                    Please select a payment method
                  </mat-error>
                </mat-form-field>

                <!-- UPI Details -->
                <div *ngIf="paymentForm.get('paymentMethod')?.value === PaymentMethod.UPI" class="payment-details">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>UPI ID</mat-label>
                    <input matInput formControlName="upiId" placeholder="yourname@upi">
                    <mat-icon matSuffix>account_balance_wallet</mat-icon>
                    <mat-error *ngIf="paymentForm.get('upiId')?.hasError('required')">
                      UPI ID is required
                    </mat-error>
                    <mat-error *ngIf="paymentForm.get('upiId')?.hasError('pattern')">
                      Please enter a valid UPI ID
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Net Banking Details -->
                <div *ngIf="paymentForm.get('paymentMethod')?.value === PaymentMethod.NET_BANKING" class="payment-details">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Bank</mat-label>
                    <mat-select formControlName="bankName">
                      <mat-option value="SBI">State Bank of India</mat-option>
                      <mat-option value="HDFC">HDFC Bank</mat-option>
                      <mat-option value="ICICI">ICICI Bank</mat-option>
                      <mat-option value="AXIS">Axis Bank</mat-option>
                      <mat-option value="KOTAK">Kotak Mahindra Bank</mat-option>
                      <mat-option value="PNB">Punjab National Bank</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <!-- Debit Card Details -->
                <div *ngIf="paymentForm.get('paymentMethod')?.value === PaymentMethod.DEBIT_CARD" class="payment-details">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Card Number</mat-label>
                    <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                    <mat-icon matSuffix>credit_card</mat-icon>
                  </mat-form-field>
                  
                  <div class="card-details-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Expiry Date</mat-label>
                      <input matInput formControlName="expiryDate" placeholder="MM/YY" maxlength="5">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>CVV</mat-label>
                      <input matInput formControlName="cvv" placeholder="123" maxlength="3" type="password">
                    </mat-form-field>
                  </div>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Cardholder Name</mat-label>
                    <input matInput formControlName="cardholderName" placeholder="Name as on card">
                  </mat-form-field>
                </div>

                <!-- Wallet Details -->
                <div *ngIf="paymentForm.get('paymentMethod')?.value === PaymentMethod.WALLET" class="payment-details">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Wallet Provider</mat-label>
                    <mat-select formControlName="walletProvider">
                      <mat-option value="PAYTM">Paytm</mat-option>
                      <mat-option value="MOBIKWIK">MobiKwik</mat-option>
                      <mat-option value="FREECHARGE">FreeCharge</mat-option>
                      <mat-option value="AMAZON_PAY">Amazon Pay</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mobile Number</mat-label>
                    <input matInput formControlName="walletMobile" placeholder="Enter mobile number">
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>
                </div>

                <mat-divider class="form-divider"></mat-divider>

                <!-- Payment Summary -->
                <div class="payment-summary">
                  <div *ngIf="!isPaymentRequestMode && application" class="application-payment-summary">
                    <div class="summary-row">
                      <span>Application Fee:</span>
                      <span>{{ formatCurrency(application.applicationFee) }}</span>
                    </div>
                    <div class="summary-row">
                      <span>Processing Fee:</span>
                      <span>{{ formatCurrency(getProcessingFee()) }}</span>
                    </div>
                    <div class="summary-row total">
                      <span>Total Amount:</span>
                      <span>{{ formatCurrency(getTotalAmount()) }}</span>
                    </div>
                  </div>
                  <div *ngIf="isPaymentRequestMode && paymentRequests.length > 0" class="payment-requests-payment-summary">
                    <div class="summary-row">
                      <span>Payment Requests ({{ paymentRequests.length }}):</span>
                      <span>{{ formatCurrency(getTotalPaymentRequestsAmount()) }}</span>
                    </div>
                    <div class="summary-row">
                      <span>Processing Fee:</span>
                      <span>{{ formatCurrency(getProcessingFee()) }}</span>
                    </div>
                    <div class="summary-row total">
                      <span>Total Amount:</span>
                      <span>{{ formatCurrency(getTotalAmount()) }}</span>
                    </div>
                  </div>
                </div>

                <div class="payment-actions">
                  <button mat-button type="button" (click)="goBack()">Cancel</button>
                  <button mat-raised-button color="primary" type="submit" 
                          [disabled]="paymentForm.invalid || isProcessing">
                    <mat-spinner *ngIf="isProcessing" diameter="20"></mat-spinner>
                    <span *ngIf="!isProcessing">Pay {{ formatCurrency(getTotalAmount()) }}</span>
                    <span *ngIf="isProcessing">Processing...</span>
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Security Notice -->
        <mat-card class="security-notice">
          <mat-card-content>
            <div class="security-content">
              <mat-icon>security</mat-icon>
              <div>
                <h4>Secure Payment</h4>
                <p>Your payment information is encrypted and secure. We do not store your payment details.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .payment-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .payment-header h1 {
      margin: 0;
      color: #333;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .application-summary .summary-item,
    .payment-requests-summary .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .payment-request-item {
      margin-bottom: 16px;
      padding-bottom: 16px;
    }

    .payment-request-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .summary-item.total {
      font-weight: 600;
      font-size: 1.1em;
      margin-top: 16px;
    }

    .summary-item .label {
      color: #666;
    }

    .summary-item .value {
      color: #333;
    }

    .summary-item .amount {
      color: #1976d2;
      font-weight: 600;
    }

    .payment-form .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .payment-details {
      margin: 16px 0;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .card-details-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-divider {
      margin: 24px 0;
    }

    .payment-summary {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1.1em;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 8px;
    }

    .payment-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    .security-notice {
      margin-top: 24px;
    }

    .security-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .security-content mat-icon {
      color: #4caf50;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .security-content h4 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .security-content p {
      margin: 0;
      color: #666;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      .payment-container {
        padding: 16px;
      }

      .payment-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .card-details-row {
        grid-template-columns: 1fr;
      }

      .payment-actions {
        flex-direction: column;
      }

      .security-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private paymentService = inject(PaymentService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);

  application: FranchiseApplication | null = null;
  paymentRequests: PaymentRequest[] = [];
  paymentForm: FormGroup;
  isLoading = true;
  isProcessing = false;
  isPaymentRequestMode = false;

  // Expose enums to template
  PaymentMethod = PaymentMethod;

  constructor() {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      // UPI fields
      upiId: [''],
      // Net Banking fields
      bankName: [''],
      // Card fields
      cardNumber: [''],
      expiryDate: [''],
      cvv: [''],
      cardholderName: [''],
      // Wallet fields
      walletProvider: [''],
      walletMobile: ['']
    });

    // Add conditional validators based on payment method
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.updateValidators(method);
    });
  }

  ngOnInit() {
    const applicationId = this.route.snapshot.paramMap.get('id');
    const paymentRequestIds = this.route.snapshot.queryParamMap.get('paymentRequestIds');

    if (paymentRequestIds) {
      // Payment request settlement mode
      this.isPaymentRequestMode = true;
      this.loadPaymentRequests(paymentRequestIds.split(','));
    } else if (applicationId) {
      // Application payment mode
      this.isPaymentRequestMode = false;
      this.loadApplication(applicationId);
    } else {
      this.router.navigate(['/partner/applications']);
    }
  }

  private loadApplication(applicationId: string) {
    // Mock loading application details
    setTimeout(() => {
      this.applicationService.getApplicationsForPartner('demo-partner-user').subscribe({
        next: (applications) => {
          this.application = applications.find(app => app.id === applicationId) || null;
          if (!this.application) {
            this.snackBar.open('Application not found', 'Close', { duration: 3000 });
            this.router.navigate(['/partner/applications']);
          } else if (this.application.paymentStatus === PaymentStatus.COMPLETED) {
            this.snackBar.open('Payment already completed for this application', 'Close', { duration: 3000 });
            this.router.navigate(['/partner/applications']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error loading application', 'Close', { duration: 3000 });
          this.router.navigate(['/partner/applications']);
          this.isLoading = false;
        }
      });
    }, 1000);
  }

  private loadPaymentRequests(paymentRequestIds: string[]) {
    // Mock loading payment request details
    setTimeout(() => {
      this.paymentService.getPaymentRequestsForPartner('demo-partner-user').subscribe({
        next: (allPaymentRequests) => {
          this.paymentRequests = allPaymentRequests.filter(pr => paymentRequestIds.includes(pr.id));
          if (this.paymentRequests.length === 0) {
            this.snackBar.open('Payment requests not found', 'Close', { duration: 3000 });
            this.router.navigate(['/partner/partnerships']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error loading payment requests', 'Close', { duration: 3000 });
          this.router.navigate(['/partner/partnerships']);
          this.isLoading = false;
        }
      });
    }, 1000);
  }

  private updateValidators(paymentMethod: PaymentMethod) {
    // Clear all validators first
    Object.keys(this.paymentForm.controls).forEach(key => {
      if (key !== 'paymentMethod') {
        this.paymentForm.get(key)?.clearValidators();
        this.paymentForm.get(key)?.updateValueAndValidity();
      }
    });

    // Add specific validators based on payment method
    switch (paymentMethod) {
      case PaymentMethod.UPI:
        this.paymentForm.get('upiId')?.setValidators([
          Validators.required,
          Validators.pattern(/^[\w.-]+@[\w.-]+$/)
        ]);
        break;
      case PaymentMethod.NET_BANKING:
        this.paymentForm.get('bankName')?.setValidators([Validators.required]);
        break;
      case PaymentMethod.DEBIT_CARD:
        this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]);
        this.paymentForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
        this.paymentForm.get('cardholderName')?.setValidators([Validators.required]);
        break;
      case PaymentMethod.WALLET:
        this.paymentForm.get('walletProvider')?.setValidators([Validators.required]);
        this.paymentForm.get('walletMobile')?.setValidators([Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]);
        break;
    }

    // Update validity for all controls
    Object.keys(this.paymentForm.controls).forEach(key => {
      this.paymentForm.get(key)?.updateValueAndValidity();
    });
  }

  processPayment() {
    if (this.paymentForm.valid && (this.application || this.paymentRequests.length > 0)) {
      this.isProcessing = true;

      if (this.isPaymentRequestMode) {
        // Process payment request settlement
        const paymentData = {
          amount: this.getTotalAmount(),
          paymentMethod: this.paymentForm.get('paymentMethod')?.value,
          paymentDetails: this.getPaymentDetails()
        };

        const paymentRequestIds = this.paymentRequests.map(pr => pr.id);

        // Mock payment processing
        setTimeout(() => {
          this.paymentService.processPaymentRequestsSettlement(paymentRequestIds, paymentData).subscribe({
            next: (transactions) => {
              // Generate a random transaction ID for display
              const transactionId = 'TXN' + Math.random().toString(36).substring(2, 11).toUpperCase();

              // Show success message with transaction ID
              this.snackBar.open(`Payment settlement successful! Transaction ID: ${transactionId}`, 'Close', { duration: 5000 });

              // Auto-redirect to partnerships after 5 seconds
              setTimeout(() => {
                this.router.navigate(['/partner/partnerships']);
              }, 5000);
            },
            error: () => {
              this.snackBar.open('Payment settlement failed. Please try again.', 'Close', { duration: 5000 });
              this.isProcessing = false;
            }
          });
        }, 3000); // Simulate payment processing time
      } else if (this.application) {
        // Process application payment
        const paymentData = {
          applicationId: this.application.id,
          amount: this.getTotalAmount(),
          paymentMethod: this.paymentForm.get('paymentMethod')?.value,
          paymentDetails: this.getPaymentDetails()
        };

        // Mock payment processing
        setTimeout(() => {
          this.paymentService.processApplicationPayment(this.application!.id, paymentData).subscribe({
            next: (transaction) => {
              // Generate a random transaction ID for display
              const transactionId = 'TXN' + Math.random().toString(36).substring(2, 11).toUpperCase();

              // Show success message with transaction ID
              this.snackBar.open(`Payment successful! Transaction ID: ${transactionId}`, 'Close', { duration: 5000 });

              // Auto-redirect to My Applications after 5 seconds
              setTimeout(() => {
                this.router.navigate(['/partner/applications']);
              }, 5000);
            },
            error: () => {
              this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 5000 });
              this.isProcessing = false;
            }
          });
        }, 3000); // Simulate payment processing time
      }
    }
  }

  private getPaymentDetails(): any {
    const method = this.paymentForm.get('paymentMethod')?.value;
    const details: any = { method };

    switch (method) {
      case PaymentMethod.UPI:
        details.upiId = this.paymentForm.get('upiId')?.value;
        break;
      case PaymentMethod.NET_BANKING:
        details.bankName = this.paymentForm.get('bankName')?.value;
        break;
      case PaymentMethod.DEBIT_CARD:
        details.cardNumber = this.paymentForm.get('cardNumber')?.value?.replace(/\s/g, '').slice(-4);
        details.cardholderName = this.paymentForm.get('cardholderName')?.value;
        break;
      case PaymentMethod.WALLET:
        details.walletProvider = this.paymentForm.get('walletProvider')?.value;
        details.mobile = this.paymentForm.get('walletMobile')?.value;
        break;
    }

    return details;
  }

  getTotalPaymentRequestsAmount(): number {
    return this.paymentRequests.reduce((total, request) => total + request.amount, 0);
  }

  getProcessingFee(): number {
    if (this.isPaymentRequestMode) {
      return Math.round(this.getTotalPaymentRequestsAmount() * 0.02); // 2% processing fee
    } else if (this.application) {
      return Math.round(this.application.applicationFee * 0.02); // 2% processing fee
    }
    return 0;
  }

  getTotalAmount(): number {
    if (this.isPaymentRequestMode) {
      return this.getTotalPaymentRequestsAmount() + this.getProcessingFee();
    } else if (this.application) {
      return this.application.applicationFee + this.getProcessingFee();
    }
    return 0;
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  goBack() {
    if (this.isPaymentRequestMode) {
      this.router.navigate(['/partner/partnerships']);
    } else {
      this.router.navigate(['/partner/applications']);
    }
  }
}
