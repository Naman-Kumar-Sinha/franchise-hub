import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { FranchiseApplication, PaymentRequest, PaymentRequestStatus } from '../../../../core/models/application.model';

export interface PaymentRequestDialogData {
  application: FranchiseApplication;
}

@Component({
  selector: 'app-payment-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Request Payment</h2>

    <mat-dialog-content>
      <div class="application-info">
        <h3>{{ data.application.franchiseName || 'Unknown Franchise' }}</h3>
        <p>Partner: {{ data.application.partnerName || 'Unknown' }}</p>
      </div>

      <form [formGroup]="paymentForm" class="payment-form" *ngIf="paymentForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Payment Amount (₹)</mat-label>
          <input matInput
                 type="number"
                 formControlName="amount"
                 placeholder="Enter amount"
                 min="1">
          <span matSuffix>₹</span>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Payment Purpose</mat-label>
          <input matInput
                 formControlName="purpose"
                 placeholder="Enter purpose">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">
        Send Request
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 500px;
      max-width: 90vw;
    }

    .application-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .application-info h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .application-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .full-width {
      width: 100%;
    }

    .payment-summary {
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .payment-summary h4 {
      margin: 0 0 12px 0;
      color: #1976d2;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    .amount {
      font-weight: 600;
      color: #1976d2;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0;
    }

    mat-dialog-content {
      min-height: 200px;
      padding: 20px 24px;
    }

    mat-dialog-actions {
      padding: 8px 24px 24px 24px;
      margin: 0;
    }
  `]
})
export class PaymentRequestDialogComponent {
  private fb = inject(FormBuilder);
  private mockDataService = inject(MockDataService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);

  paymentForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<PaymentRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentRequestDialogData
  ) {
    console.log('PaymentRequestDialog constructor called');
    console.log('Dialog data:', this.data);

    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      purpose: ['', [Validators.required]]
    });

    console.log('Payment form initialized');
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    console.log('💰 Payment request submit clicked');
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      console.log('💰 Form is valid:', formValue);

      // Call the service to create the payment request
      this.mockDataService.createPaymentRequest(
        this.data.application.id,
        formValue.amount,
        formValue.purpose,
        formValue.description
      ).subscribe({
        next: (paymentRequest) => {
          console.log('💰 Payment request created successfully:', paymentRequest);
          this.snackBar.open('Payment request sent successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(paymentRequest);
        },
        error: (error) => {
          console.error('💰 Error creating payment request:', error);
          this.snackBar.open('Error creating payment request. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      console.log('💰 Form is invalid');
      this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
    }
  }

  formatCurrency(amount: number): string {
    return `₹${amount || 0}`;
  }
}
