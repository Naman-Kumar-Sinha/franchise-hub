import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { PaymentService } from '../../../core/services/payment.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PaymentRequest, PaymentRequestStatus } from '../../../core/models/application.model';
import { PartnershipDetailsDialogComponent } from './partnership-details-dialog.component';

@Component({
  selector: 'app-partnerships',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatDialogModule,
    MatBadgeModule,
    RouterModule
  ],
  template: `
    <div class="partnerships-container">
      <div class="header">
        <h1>My Partnerships</h1>
        <p>Manage your active franchise partnerships and investment details</p>
      </div>

      <div *ngIf="partnerships.length === 0" class="empty-state">
        <mat-icon>handshake</mat-icon>
        <h3>No Partnerships Yet</h3>
        <p>You don't have any approved franchise partnerships yet. <a routerLink="/partner/browse">Browse franchises</a> to get started!</p>
      </div>

      <div *ngIf="partnerships.length > 0">
        <mat-tab-group>
          <!-- Active Partnerships Tab -->
          <mat-tab label="Active Partnerships">
            <div class="tab-content">
              <div class="partnerships-grid">
                <mat-card *ngFor="let partnership of getActivePartnerships()" class="partnership-card">
                  <mat-card-header>
                    <mat-card-title>{{ partnership.franchiseName }}</mat-card-title>
                    <mat-card-subtitle>{{ partnership.franchiseCategory }}</mat-card-subtitle>
                    <div class="status-chip">
                      <mat-chip [color]="partnership.status === 'Active' ? 'primary' : 'warn'" selected>
                        {{ partnership.status }}
                      </mat-chip>
                    </div>
                    <!-- Payment Request Indicators -->
                    <div class="payment-indicators" *ngIf="getPaymentRequestsForPartnership(partnership.id).length > 0">
                      <mat-chip
                        *ngIf="getPendingPaymentRequestsCount(partnership.id) > 0"
                        [matBadge]="getPendingPaymentRequestsCount(partnership.id)"
                        matBadgeColor="accent"
                        matBadgeSize="small"
                        color="accent"
                        selected>
                        <mat-icon>payment</mat-icon>
                        Pending Payments
                      </mat-chip>
                      <mat-chip
                        *ngIf="getOverduePaymentRequestsCount(partnership.id) > 0"
                        [matBadge]="getOverduePaymentRequestsCount(partnership.id)"
                        matBadgeColor="warn"
                        matBadgeSize="small"
                        color="warn"
                        selected>
                        <mat-icon>warning</mat-icon>
                        Overdue
                      </mat-chip>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="partnership-details">
                      <div class="detail-row">
                        <span class="label">Approved:</span>
                        <span class="value">{{ partnership.approvedAt | date:'mediumDate' }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Total Investment:</span>
                        <span class="value investment">{{ formatCurrency(partnership.totalInvestment) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Franchise Status:</span>
                        <span class="value">{{ partnership.franchise?.isActive ? 'Active' : 'Inactive' }}</span>
                      </div>
                      <!-- Payment Summary -->
                      <div class="detail-row" *ngIf="getPaymentRequestsForPartnership(partnership.id).length > 0">
                        <span class="label">Payment Requests:</span>
                        <span class="value payment-summary">
                          {{ getPaymentRequestsForPartnership(partnership.id).length }} total
                          <span *ngIf="getPendingPaymentRequestsCount(partnership.id) > 0" class="pending-count">
                            ({{ getPendingPaymentRequestsCount(partnership.id) }} pending)
                          </span>
                        </span>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button color="primary" (click)="viewPartnershipDetails(partnership)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-raised-button
                            color="accent"
                            *ngIf="getPendingPaymentRequestsCount(partnership.id) > 0"
                            (click)="settlePayments(partnership)">
                      <mat-icon>payment</mat-icon>
                      Settle Payments
                    </button>
                    <button mat-button (click)="contactBusiness(partnership)">
                      <mat-icon>email</mat-icon>
                      Contact Business
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Investment Summary Tab -->
          <mat-tab label="Investment Summary">
            <div class="tab-content">
              <div class="summary-cards">
                <mat-card class="summary-card">
                  <mat-card-content>
                    <div class="summary-stat">
                      <mat-icon>attach_money</mat-icon>
                      <div class="stat-details">
                        <h3>{{ formatCurrency(getTotalInvestment()) }}</h3>
                        <p>Total Investment</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="summary-card">
                  <mat-card-content>
                    <div class="summary-stat">
                      <mat-icon>handshake</mat-icon>
                      <div class="stat-details">
                        <h3>{{ partnerships.length }}</h3>
                        <p>Total Partnerships</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="summary-card">
                  <mat-card-content>
                    <div class="summary-stat">
                      <mat-icon>trending_up</mat-icon>
                      <div class="stat-details">
                        <h3>{{ getActivePartnerships().length }}</h3>
                        <p>Active Partnerships</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Transaction History -->
              <mat-card class="transactions-card">
                <mat-card-header>
                  <mat-card-title>Transaction History</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div *ngIf="getAllTransactions().length === 0" class="no-transactions">
                    <p>No transactions found.</p>
                  </div>
                  <div *ngIf="getAllTransactions().length > 0" class="transactions-table">
                    <table mat-table [dataSource]="getAllTransactions()" class="transactions-table">
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Date</th>
                        <td mat-cell *matCellDef="let transaction">{{ transaction.createdAt | date:'shortDate' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="franchise">
                        <th mat-header-cell *matHeaderCellDef>Franchise</th>
                        <td mat-cell *matCellDef="let transaction">{{ transaction.franchiseName }}</td>
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

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .partnerships-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .header p {
      margin: 0;
      color: #666;
      font-size: 16px;
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
      color: #ccc;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .empty-state a {
      color: #1976d2;
      text-decoration: none;
    }

    .tab-content {
      padding: 24px 0;
    }

    .partnerships-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .partnership-card {
      position: relative;
    }

    .status-chip {
      position: absolute;
      top: 16px;
      right: 16px;
    }

    .payment-indicators {
      position: absolute;
      top: 60px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .payment-indicators mat-chip {
      font-size: 12px;
      min-height: 28px;
    }

    .payment-indicators mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .partnership-details {
      margin: 16px 0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .detail-row .label {
      font-weight: 500;
      color: #666;
    }

    .detail-row .value {
      color: #333;
    }

    .detail-row .value.investment {
      font-weight: 600;
      color: #1976d2;
    }

    .detail-row .value.payment-summary {
      font-size: 14px;
    }

    .detail-row .value .pending-count {
      color: #f57c00;
      font-weight: 600;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .summary-card {
      height: 120px;
      display: flex;
      align-items: center;
    }

    .summary-stat {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .summary-stat mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stat-details p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .transactions-card {
      margin-top: 24px;
    }

    .transactions-table {
      width: 100%;
    }

    .no-transactions {
      text-align: center;
      padding: 32px;
      color: #666;
    }

    @media (max-width: 768px) {
      .partnerships-container {
        padding: 16px;
      }

      .partnerships-grid {
        grid-template-columns: 1fr;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PartnershipsComponent implements OnInit {
  partnerships: any[] = [];
  paymentRequestsMap: Map<string, PaymentRequest[]> = new Map();
  displayedColumns: string[] = ['date', 'franchise', 'amount', 'status'];

  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private paymentService: PaymentService,
    private currencyService: CurrencyService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPartnerships();
  }

  private loadPartnerships() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.applicationService.getPartnershipsForPartner(currentUser.id).subscribe(partnerships => {
      this.partnerships = partnerships;
      console.log('🤝 Partnerships loaded:', partnerships.length);

      // Load payment requests for each partnership
      this.loadPaymentRequestsForPartnerships();
    });
  }

  private loadPaymentRequestsForPartnerships() {
    this.partnerships.forEach(partnership => {
      if (partnership.application?.id) {
        this.paymentService.getPaymentRequestsForApplication(partnership.application.id).subscribe({
          next: (requests) => {
            this.paymentRequestsMap.set(partnership.id, requests);
            console.log(`💰 Payment requests loaded for partnership ${partnership.id}:`, requests.length);
          },
          error: (error) => {
            console.error(`Error loading payment requests for partnership ${partnership.id}:`, error);
            this.paymentRequestsMap.set(partnership.id, []);
          }
        });
      }
    });
  }

  getActivePartnerships() {
    return this.partnerships.filter(p => p.status === 'Active');
  }

  getTotalInvestment(): number {
    return this.partnerships.reduce((sum, p) => sum + p.totalInvestment, 0);
  }

  getAllTransactions() {
    const allTransactions: any[] = [];
    this.partnerships.forEach(partnership => {
      if (partnership.transactions) {
        allTransactions.push(...partnership.transactions);
      }
    });
    return allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  // Payment Request Methods
  getPaymentRequestsForPartnership(partnershipId: string): PaymentRequest[] {
    return this.paymentRequestsMap.get(partnershipId) || [];
  }

  getPendingPaymentRequestsCount(partnershipId: string): number {
    const requests = this.getPaymentRequestsForPartnership(partnershipId);
    return requests.filter(pr => pr.status === PaymentRequestStatus.PENDING).length;
  }

  getOverduePaymentRequestsCount(partnershipId: string): number {
    const requests = this.getPaymentRequestsForPartnership(partnershipId);
    return requests.filter(pr => pr.status === PaymentRequestStatus.OVERDUE).length;
  }

  // Dialog and Action Methods
  viewPartnershipDetails(partnership: any) {
    console.log('👁️ View partnership details:', partnership.id);

    const dialogRef = this.dialog.open(PartnershipDetailsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { partnership }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Partnership details dialog closed with result:', result);
        // Refresh data if needed
        this.loadPaymentRequestsForPartnerships();
      }
    });
  }

  settlePayments(partnership: any) {
    console.log('💳 Settle payments for partnership:', partnership.id);

    // Get pending payment requests for this partnership
    const paymentRequests = this.getPaymentRequestsForPartnership(partnership.id);
    const pendingPaymentRequests = paymentRequests.filter(pr => pr.status === 'PENDING');

    if (pendingPaymentRequests.length === 0) {
      this.snackBar.open('No pending payment requests found', 'Close', { duration: 3000 });
      return;
    }

    // Navigate to payment settlement page with payment request IDs
    const paymentRequestIds = pendingPaymentRequests.map(pr => pr.id).join(',');
    this.router.navigate(['/partner/payment-requests/settle'], {
      queryParams: { paymentRequestIds }
    });
  }

  contactBusiness(partnership: any) {
    console.log('📧 Contact business for partnership:', partnership.id);
    // TODO: Implement contact business functionality
    // This could open an email compose dialog or navigate to a contact form
  }
}
