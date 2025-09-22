import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

import { MockDataService } from '../../../core/services/mock-data.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PaymentRequest, PaymentRequestStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-partnership-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    MatBadgeModule
  ],
  template: `
    <div class="partnership-details-dialog">
      <mat-dialog-content>
        <div class="dialog-header">
          <h2>{{ data.partnership.franchiseName }}</h2>
          <p class="partnership-subtitle">{{ data.partnership.franchiseCategory }}</p>
          <mat-chip [color]="data.partnership.status === 'Active' ? 'primary' : 'warn'" selected>
            {{ data.partnership.status }}
          </mat-chip>
        </div>

        <mat-tab-group>
          <!-- Partnership Overview Tab -->
          <mat-tab label="Overview">
            <div class="tab-content">
              <div class="overview-cards">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>Partnership Details</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-row">
                      <span class="label">Approved Date:</span>
                      <span class="value">{{ data.partnership.approvedAt | date:'mediumDate' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Total Investment:</span>
                      <span class="value investment">{{ formatCurrency(data.partnership.totalInvestment) }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Franchise Status:</span>
                      <span class="value">{{ data.partnership.franchise?.isActive ? 'Active' : 'Inactive' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Business Owner:</span>
                      <span class="value">{{ data.partnership.application?.businessOwnerName || 'Unknown' }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>Financial Summary</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-row">
                      <span class="label">Total Transactions:</span>
                      <span class="value">{{ data.partnership.transactions?.length || 0 }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Pending Payments:</span>
                      <span class="value pending">{{ getPendingPaymentRequestsCount() }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Overdue Payments:</span>
                      <span class="value overdue">{{ getOverduePaymentRequestsCount() }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Payment Requests Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              Payment Requests
              <span *ngIf="paymentRequests.length > 0" class="payment-count-badge">({{ paymentRequests.length }})</span>
            </ng-template>
            <div class="tab-content">
              <div *ngIf="paymentRequests.length === 0" class="empty-state">
                <mat-icon>payment</mat-icon>
                <h3>No Payment Requests</h3>
                <p>There are no payment requests for this partnership yet.</p>
              </div>

              <div *ngIf="paymentRequests.length > 0" class="payment-requests-section">
                <div class="payment-requests-grid">
                  <mat-card *ngFor="let request of paymentRequests" class="payment-request-card">
                    <mat-card-header>
                      <mat-card-title>{{ formatCurrency(request.amount) }}</mat-card-title>
                      <mat-card-subtitle>{{ request.purpose }}</mat-card-subtitle>
                      <div class="status-chip">
                        <mat-chip [color]="getPaymentRequestStatusColor(request.status)" selected>
                          {{ getPaymentRequestStatusText(request.status) }}
                        </mat-chip>
                      </div>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="request-details">
                        <div class="detail-row">
                          <span class="label">Requested:</span>
                          <span class="value">{{ request.requestedAt | date:'mediumDate' }}</span>
                        </div>
                        <div class="detail-row" *ngIf="request.dueDate">
                          <span class="label">Due Date:</span>
                          <span class="value" [class.overdue]="isOverdue(request)">{{ request.dueDate | date:'mediumDate' }}</span>
                        </div>
                        <div class="detail-row" *ngIf="request.description">
                          <span class="label">Description:</span>
                          <span class="value">{{ request.description }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                    <mat-card-actions>
                      <button mat-raised-button 
                              color="primary" 
                              *ngIf="request.status === 'PENDING'"
                              (click)="payNow(request)">
                        <mat-icon>payment</mat-icon>
                        Pay Now
                      </button>
                      <button mat-button (click)="viewPaymentDetails(request)">
                        <mat-icon>info</mat-icon>
                        Details
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Transaction History Tab -->
          <mat-tab label="Transactions">
            <div class="tab-content">
              <div *ngIf="data.partnership.transactions?.length === 0" class="empty-state">
                <mat-icon>receipt</mat-icon>
                <h3>No Transactions</h3>
                <p>No transaction history available for this partnership.</p>
              </div>

              <div *ngIf="data.partnership.transactions?.length > 0">
                <table mat-table [dataSource]="data.partnership.transactions" class="transactions-table">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let transaction">{{ transaction.createdAt | date:'shortDate' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let transaction">{{ formatCurrency(transaction.amount) }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let transaction">
                      <mat-chip [color]="transaction.status === 'COMPLETED' ? 'primary' : 'accent'" selected>
                        {{ transaction.status }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="reference">
                    <th mat-header-cell *matHeaderCellDef>Reference</th>
                    <td mat-cell *matCellDef="let transaction">{{ transaction.transactionReference }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="transactionColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: transactionColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="close()">Close</button>
        <button mat-button color="primary" (click)="contactBusiness()">
          <mat-icon>email</mat-icon>
          Contact Business
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .partnership-details-dialog {
      width: 800px;
      max-width: 90vw;
      max-height: 90vh;
    }

    .dialog-header {
      text-align: center;
      margin-bottom: 24px;
      position: relative;
    }

    .dialog-header h2 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .partnership-subtitle {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 16px;
    }

    .tab-content {
      padding: 24px 0;
      min-height: 400px;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-card {
      height: fit-content;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      align-items: center;
    }

    .detail-row .label {
      font-weight: 500;
      color: #666;
    }

    .detail-row .value {
      color: #333;
      text-align: right;
    }

    .detail-row .value.investment {
      font-weight: 600;
      color: #1976d2;
    }

    .detail-row .value.pending {
      color: #f57c00;
      font-weight: 600;
    }

    .detail-row .value.overdue {
      color: #d32f2f;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .payment-requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }

    .payment-request-card {
      position: relative;
    }

    .status-chip {
      position: absolute;
      top: 16px;
      right: 16px;
    }

    .request-details {
      margin: 16px 0;
    }

    .transactions-table {
      width: 100%;
    }

    .payment-count-badge {
      margin-left: 8px;
      background: #ff4081;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .partnership-details-dialog {
        width: 95vw;
      }

      .overview-cards {
        grid-template-columns: 1fr;
      }

      .payment-requests-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PartnershipDetailsDialogComponent implements OnInit {
  paymentRequests: PaymentRequest[] = [];
  transactionColumns: string[] = ['date', 'amount', 'status', 'reference'];

  constructor(
    public dialogRef: MatDialogRef<PartnershipDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { partnership: any },
    private mockDataService: MockDataService,
    private currencyService: CurrencyService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPaymentRequests();
  }

  private loadPaymentRequests() {
    if (this.data.partnership.application?.id) {
      this.mockDataService.getPaymentRequestsForApplication(this.data.partnership.application.id).subscribe({
        next: (requests) => {
          this.paymentRequests = requests;
          console.log('💰 Payment requests loaded for partnership:', requests.length);
        },
        error: (error) => {
          console.error('Error loading payment requests:', error);
          this.paymentRequests = [];
        }
      });
    }
  }

  getPendingPaymentRequestsCount(): number {
    return this.paymentRequests.filter(pr => pr.status === PaymentRequestStatus.PENDING).length;
  }

  getOverduePaymentRequestsCount(): number {
    return this.paymentRequests.filter(pr => pr.status === PaymentRequestStatus.OVERDUE).length;
  }

  getPaymentRequestStatusColor(status: PaymentRequestStatus): string {
    switch (status) {
      case PaymentRequestStatus.PENDING: return 'accent';
      case PaymentRequestStatus.PAID: return 'primary';
      case PaymentRequestStatus.OVERDUE: return 'warn';
      case PaymentRequestStatus.CANCELLED: return '';
      default: return '';
    }
  }

  getPaymentRequestStatusText(status: PaymentRequestStatus): string {
    switch (status) {
      case PaymentRequestStatus.PENDING: return 'Pending';
      case PaymentRequestStatus.PAID: return 'Paid';
      case PaymentRequestStatus.OVERDUE: return 'Overdue';
      case PaymentRequestStatus.CANCELLED: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  isOverdue(request: PaymentRequest): boolean {
    if (!request.dueDate) return false;
    return new Date(request.dueDate) < new Date() && request.status === PaymentRequestStatus.PENDING;
  }

  payNow(request: PaymentRequest) {
    console.log('💳 Pay Now clicked for request:', request.id);

    // Close the dialog first
    this.dialogRef.close();

    // Navigate to payment settlement page with this specific payment request
    this.router.navigate(['/partner/payment-requests/settle'], {
      queryParams: { paymentRequestIds: request.id }
    });
  }

  viewPaymentDetails(request: PaymentRequest) {
    console.log('📄 View payment details for request:', request.id);
    // TODO: Implement payment details view
    this.snackBar.open('Payment details view will be implemented', 'Close', { duration: 3000 });
  }

  contactBusiness() {
    console.log('📧 Contact business for partnership:', this.data.partnership.id);
    // TODO: Implement contact business functionality
    this.snackBar.open('Contact business feature will be implemented', 'Close', { duration: 3000 });
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  close() {
    this.dialogRef.close();
  }
}
