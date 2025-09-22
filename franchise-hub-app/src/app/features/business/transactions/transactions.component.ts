import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PaymentTransaction, PaymentStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="transactions-container">
      <div class="header">
        <h1>Transaction History</h1>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-number">{{ transactions.length }}</span>
            <span class="stat-label">Total Transactions</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ formatCurrency(getTotalRevenue()) }}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ getCompletedTransactions().length }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading transactions...</p>
      </div>

      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Payment Transactions</mat-card-title>
          <mat-card-subtitle>Application fees received from partner applications</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="transactions.length === 0" class="no-data">
            <mat-icon>receipt</mat-icon>
            <p>No transactions found. Transactions will appear here when partners pay application fees for your franchises.</p>
          </div>

          <div *ngIf="transactions.length > 0" class="transactions-table">
            <table mat-table [dataSource]="transactions" class="full-width">
              <!-- Transaction ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Transaction ID</th>
                <td mat-cell *matCellDef="let transaction">{{ transaction.id.substring(0, 12) }}...</td>
              </ng-container>

              <!-- Application Column -->
              <ng-container matColumnDef="application">
                <th mat-header-cell *matHeaderCellDef>Application</th>
                <td mat-cell *matCellDef="let transaction">
                  <div class="application-info">
                    <strong>{{ getApplicationName(transaction.applicationId) }}</strong>
                    <br>
                    <small>{{ getPartnerName(transaction.partnerId) }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let transaction">{{ formatCurrency(transaction.amount) }}</td>
              </ng-container>

              <!-- Payment Method Column -->
              <ng-container matColumnDef="paymentMethod">
                <th mat-header-cell *matHeaderCellDef>Payment Method</th>
                <td mat-cell *matCellDef="let transaction">{{ transaction.paymentMethod }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let transaction">
                  <mat-chip [class]="'status-' + transaction.status.toLowerCase()">
                    {{ transaction.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let transaction">{{ transaction.completedAt | date:'medium' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .header-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .transactions-table {
      overflow-x: auto;
    }

    .full-width {
      width: 100%;
    }

    .application-info strong {
      color: #333;
    }

    .application-info small {
      color: #666;
    }

    .status-completed {
      background-color: #4caf50;
      color: white;
    }

    .status-pending {
      background-color: #ff9800;
      color: white;
    }

    .status-failed {
      background-color: #f44336;
      color: white;
    }

    .status-processing {
      background-color: #2196f3;
      color: white;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  private currencyService = inject(CurrencyService);

  transactions: PaymentTransaction[] = [];
  isLoading = true;
  displayedColumns = ['id', 'application', 'amount', 'paymentMethod', 'status', 'date'];

  ngOnInit() {
    this.loadTransactions();
  }

  private loadTransactions() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.mockDataService.getRecentPaymentTransactionsForBusiness(user.id, 100).subscribe(transactions => {
          this.transactions = transactions;
          this.isLoading = false;
          console.log('📊 Transactions loaded:', transactions.length);
        });
      }
    });
  }

  getTotalRevenue(): number {
    return this.getCompletedTransactions().reduce((sum, t) => sum + t.amount, 0);
  }

  getCompletedTransactions(): PaymentTransaction[] {
    return this.transactions.filter(t => t.status === PaymentStatus.COMPLETED);
  }

  getApplicationName(applicationId: string): string {
    // This would ideally come from a service call, but for now we'll use a placeholder
    return 'Application Fee';
  }

  getPartnerName(partnerId: string): string {
    // This would ideally come from a service call, but for now we'll use a placeholder
    return 'Partner User';
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }
}
