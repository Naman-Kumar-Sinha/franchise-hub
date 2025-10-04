import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { PaymentTransaction } from '../../../../core/models/application.model';
import { CurrencyService } from '../../../../core/services/currency.service';

export interface PaymentHistoryDialogData {
  applicationId: string;
  applicationName: string;
  transactions: PaymentTransaction[];
}

@Component({
  selector: 'app-payment-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="payment-history-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="title-content">
          <mat-icon class="title-icon">receipt_long</mat-icon>
          <div>
            <h2>Payment History</h2>
            <p class="subtitle">{{ data.applicationName }}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div *ngIf="data.transactions.length === 0" class="no-transactions">
          <mat-icon class="no-data-icon">receipt</mat-icon>
          <h3>No Payment Transactions</h3>
          <p>No payment transactions found for this application.</p>
        </div>

        <div *ngIf="data.transactions.length > 0" class="transactions-list">
          <mat-card *ngFor="let transaction of data.transactions; trackBy: trackByTransactionId" class="transaction-card">
            <mat-card-header>
              <div class="transaction-header">
                <div class="transaction-info">
                  <h4>{{ getTransactionTitle(transaction) }}</h4>
                  <p class="transaction-id">ID: {{ transaction.id }}</p>
                </div>
                <mat-chip [class]="getStatusClass(transaction.status)">
                  <mat-icon>{{ getStatusIcon(transaction.status) }}</mat-icon>
                  {{ getStatusText(transaction.status) }}
                </mat-chip>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="transaction-details">
                <div class="detail-row">
                  <span class="label">Amount:</span>
                  <span class="value amount">{{ currencyService.formatCurrency(transaction.amount) }}</span>
                </div>
                <div class="detail-row" *ngIf="transaction.platformFee">
                  <span class="label">Platform Fee:</span>
                  <span class="value">{{ currencyService.formatCurrency(transaction.platformFee || 0) }}</span>
                </div>
                <div class="detail-row" *ngIf="transaction.netAmount">
                  <span class="label">Total Amount:</span>
                  <span class="value amount total">{{ currencyService.formatCurrency(transaction.netAmount || transaction.amount) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Method:</span>
                  <span class="value">{{ getPaymentMethodText(transaction.paymentMethod) }}</span>
                </div>
                <div class="detail-row" *ngIf="getPaymentDetails(transaction)">
                  <span class="label">Payment Details:</span>
                  <span class="value">{{ getPaymentDetails(transaction) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Transaction Date:</span>
                  <span class="value">{{ formatDate(transaction.completedAt || transaction.initiatedAt) }}</span>
                </div>
                <div class="detail-row" *ngIf="transaction.transactionReference">
                  <span class="label">Reference:</span>
                  <span class="value">{{ transaction.transactionReference }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="downloadTransactionHistory()" *ngIf="data.transactions.length > 0">
          <mat-icon>download</mat-icon>
          Download
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .payment-history-dialog {
      max-width: 100%;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      margin: 0;
    }

    .title-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #1976d2;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .close-button {
      margin-left: auto;
    }

    .dialog-content {
      padding: 20px 0;
      max-height: 60vh;
      overflow-y: auto;
    }

    .no-transactions {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .transaction-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .transaction-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .transaction-id {
      margin: 0;
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }

    .transaction-details {
      margin-top: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #333;
    }

    .value {
      color: #666;
      text-align: right;
    }

    .amount {
      font-weight: 600;
      color: #2e7d32;
    }

    .total {
      font-size: 16px;
      color: #1976d2;
    }

    .dialog-actions {
      padding: 16px 0 0 0;
      justify-content: flex-end;
      gap: 8px;
    }

    /* Status chip styles */
    .status-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-failed {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .status-processing {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-refunded {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }
  `]
})
export class PaymentHistoryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentHistoryDialogData,
    public currencyService: CurrencyService
  ) {}

  trackByTransactionId(index: number, transaction: PaymentTransaction): string {
    return transaction.id;
  }

  getTransactionTitle(transaction: PaymentTransaction): string {
    switch (transaction.paymentMethod?.toUpperCase()) {
      case 'NET_BANKING':
        return 'Net Banking Payment';
      case 'UPI':
        return 'UPI Payment';
      case 'CREDIT_CARD':
        return 'Credit Card Payment';
      case 'DEBIT_CARD':
        return 'Debit Card Payment';
      case 'WALLET':
        return 'Wallet Payment';
      default:
        return 'Payment Transaction';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      case 'PROCESSING':
        return 'status-processing';
      case 'REFUNDED':
        return 'status-refunded';
      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'check_circle';
      case 'PENDING':
        return 'schedule';
      case 'FAILED':
        return 'error';
      case 'PROCESSING':
        return 'sync';
      case 'REFUNDED':
        return 'undo';
      default:
        return 'schedule';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      case 'FAILED':
        return 'Failed';
      case 'PROCESSING':
        return 'Processing';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status || 'Unknown';
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method?.toUpperCase()) {
      case 'NET_BANKING':
        return 'Net Banking';
      case 'UPI':
        return 'UPI';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'DEBIT_CARD':
        return 'Debit Card';
      case 'WALLET':
        return 'Digital Wallet';
      default:
        return method || 'Unknown';
    }
  }

  getPaymentDetails(transaction: PaymentTransaction): string {
    if (transaction.bankName) {
      return `${transaction.bankName}${transaction.transactionReference ? ' - ' + transaction.transactionReference : ''}`;
    }
    if (transaction.upiId) {
      return transaction.upiId;
    }
    if (transaction.cardLast4) {
      return `**** **** **** ${transaction.cardLast4}`;
    }
    return '';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadTransactionHistory(): void {
    // TODO: Implement download functionality
    console.log('Download transaction history for application:', this.data.applicationId);
  }
}
