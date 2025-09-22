import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { Application } from '../../../core/models/application.model';
import { Franchise } from '../../../core/models/franchise.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Partner Dashboard</h1>
        <p>Welcome back, {{currentUser?.profile?.firstName}}! Here's your franchise journey overview.</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card clickable" (click)="navigateToApplications()">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{dashboardStats?.totalApplications || 0}}</h3>
                <p>Total Applications</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card clickable" (click)="navigateToApprovedApplications()">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon approved">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{dashboardStats?.approvedApplications || 0}}</h3>
                <p>Approved Applications</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card clickable" (click)="navigateToPartnerships()">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon investment">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{formatCurrency(dashboardStats?.totalInvestment || 0)}}</h3>
                <p>Total Investment</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card clickable" (click)="navigateToPartnerships()">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon partnerships">
                <mat-icon>handshake</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{dashboardStats?.activePartnerships || 0}}</h3>
                <p>Active Partnerships</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" routerLink="/partner/browse">
                <mat-icon>search</mat-icon>
                Browse Franchises
              </button>
              <button mat-raised-button color="accent" routerLink="/partner/applications">
                <mat-icon>assignment</mat-icon>
                My Applications
              </button>
              <button mat-raised-button routerLink="/partner/partnerships">
                <mat-icon>handshake</mat-icon>
                My Partnerships
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Applications -->
      <div class="recent-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Applications</mat-card-title>
            <button mat-button routerLink="/partner/applications">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentApplications.length === 0" class="no-data">
              <mat-icon>assignment</mat-icon>
              <p>No applications yet. <a routerLink="/partner/browse">Browse franchises</a> to get started!</p>
            </div>
            <div *ngIf="recentApplications.length > 0" class="applications-list">
              <div *ngFor="let application of recentApplications" class="application-item">
                <div class="application-info">
                  <h4>{{getFranchiseName(application.franchiseId)}}</h4>
                  <p>Applied on {{application.submittedAt | date:'mediumDate'}}</p>
                </div>
                <div class="application-status">
                  <mat-chip [class]="'status-' + application.status.toLowerCase()">
                    {{application.status}}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Transactions -->
      <div class="recent-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Transactions</mat-card-title>
            <button mat-button (click)="navigateToPartnerships()">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentTransactions.length === 0" class="no-data">
              <mat-icon>receipt</mat-icon>
              <p>No transactions yet. <a routerLink="/partner/browse">Browse franchises</a> to get started!</p>
            </div>
            <div *ngIf="recentTransactions.length > 0" class="transactions-list">
              <div *ngFor="let transaction of recentTransactions" class="transaction-item">
                <div class="transaction-info">
                  <h4>{{transaction.franchiseName || 'Partnership Investment'}}</h4>
                  <p>{{transaction.paidAt | date:'mediumDate'}}</p>
                </div>
                <div class="transaction-amount">
                  <span class="amount">{{formatCurrency(transaction.amount)}}</span>
                  <mat-chip [class]="'status-' + transaction.status.toLowerCase()">
                    {{transaction.status}}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .dashboard-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      height: 120px;
    }

    .stat-card.clickable {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .stat-card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .stat-icon.approved {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .stat-icon.investment {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .stat-icon.partnerships {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
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

    .quick-actions {
      margin-bottom: 32px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recent-section {
      margin-bottom: 32px;
    }

    .recent-section mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .applications-list,
    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .application-item,
    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .application-info h4,
    .transaction-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .application-info p,
    .transaction-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .transaction-amount {
      text-align: right;
    }

    .transaction-amount .amount {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background-color: #d4edda;
      color: #155724;
    }

    .status-rejected {
      background-color: #f8d7da;
      color: #721c24;
    }

    .status-completed {
      background-color: #d4edda;
      color: #155724;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
        justify-content: center;
      }

      .application-item,
      .transaction-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .transaction-amount {
        text-align: left;
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  dashboardStats: any;
  recentApplications: Application[] = [];
  recentTransactions: any[] = [];
  franchises: Franchise[] = [];

  constructor(
    private authService: AuthService,
    private mockDataService: MockDataService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        console.log('🏠 Partner Dashboard - Current user:', user.id, user.email);

        // Debug localStorage
        this.mockDataService.debugLocalStorage();

        this.loadStats(user.id);
        this.loadRecentApplications(user.id);
        this.loadRecentTransactions(user.id);
        this.loadFranchises();
      } else {
        console.error('🏠 Partner Dashboard - No current user found');
      }
    });
  }

  private loadStats(userId: string) {
    this.mockDataService.getDashboardStats(userId, this.currentUser.role).subscribe(stats => {
      this.dashboardStats = stats;
    });
  }

  private loadRecentApplications(partnerId: string) {
    this.mockDataService.getApplicationsByPartner(partnerId).subscribe(applications => {
      this.recentApplications = applications
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 3);
    });
  }

  private loadRecentTransactions(partnerId: string) {
    this.mockDataService.getRecentTransactionsForPartner(partnerId, 3).subscribe(transactions => {
      this.recentTransactions = transactions;
      console.log('📊 Dashboard - Recent transactions loaded:', transactions.length);
    });
  }

  private loadFranchises() {
    this.mockDataService.getFranchises().subscribe(franchises => {
      this.franchises = franchises;
    });
  }

  getFranchiseName(franchiseId: string): string {
    const franchise = this.franchises.find(f => f.id === franchiseId);
    return franchise ? franchise.name : 'Unknown Franchise';
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  // Navigation methods for clickable dashboard cards
  navigateToApplications() {
    this.router.navigate(['/partner/applications']);
  }

  navigateToApprovedApplications() {
    this.router.navigate(['/partner/applications'], {
      fragment: 'approved-tab'
    });
  }

  navigateToPartnerships() {
    this.router.navigate(['/partner/partnerships']);
  }
}
