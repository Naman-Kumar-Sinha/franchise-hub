import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ApiBusinessService } from '../../../core/services/api-business.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { FranchiseService } from '../../../core/services/franchise.service';
import { PaymentTransaction } from '../../../core/models/application.model';
import { FranchiseApplication, ApplicationStatus } from '../../../core/models/application.model';
import { Franchise } from '../../../core/models/franchise.model';
import { Transaction } from '../../../core/models/transaction.model';
import { catchError, of, takeUntil, distinctUntilChanged, shareReplay } from 'rxjs';
import { Subject, BehaviorSubject } from 'rxjs';

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
    MatProgressBarModule,
    MatMenuModule,
    MatTooltipModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Business Dashboard</h1>
        <p>Welcome back, {{currentUser?.profile?.firstName}}! Manage your franchise opportunities and partnerships.</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card clickable" routerLink="/business/franchises">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>store</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{dashboardStats?.activeFranchises || 0}}</h3>
                <p>Active Franchises</p>
                <span class="stat-subtitle">{{dashboardStats?.totalFranchises || 0}} total</span>
              </div>
            </div>
            <div class="stat-progress">
              <mat-progress-bar
                mode="determinate"
                [value]="getFranchiseActivePercentage()"
                color="primary">
              </mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card clickable" routerLink="/business/applications">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon applications">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{dashboardStats?.pendingApplications || 0}}</h3>
                <p>Pending Reviews</p>
                <span class="stat-subtitle">{{dashboardStats?.totalApplications || 0}} total applications</span>
              </div>
            </div>
            <div class="stat-progress">
              <mat-progress-bar
                mode="determinate"
                [value]="getApplicationPendingPercentage()"
                color="accent">
              </mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card clickable" routerLink="/business/transactions">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon revenue">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{formatCurrency(dashboardStats?.totalRevenue || 0)}}</h3>
                <p>Total Revenue</p>
                <span class="stat-subtitle">{{formatCurrency(dashboardStats?.monthlyRevenue || 0)}} this month</span>
              </div>
            </div>
            <div class="stat-trend" [class.positive]="(dashboardStats?.monthlyRevenue || 0) > 0">
              <mat-icon>{{(dashboardStats?.monthlyRevenue || 0) > 0 ? 'trending_up' : 'trending_flat'}}</mat-icon>
              <span>{{getRevenueGrowth()}}%</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon conversion">
                <mat-icon>analytics</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{dashboardStats?.conversionRate || 0}}%</h3>
                <p>Conversion Rate</p>
                <span class="stat-subtitle">{{dashboardStats?.approvedApplications || 0}} approved</span>
              </div>
            </div>
            <div class="stat-progress">
              <mat-progress-bar
                mode="determinate"
                [value]="dashboardStats?.conversionRate || 0"
                color="warn">
              </mat-progress-bar>
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
              <button mat-raised-button color="primary" routerLink="/business/franchises">
                <mat-icon>add</mat-icon>
                Manage Franchises
              </button>
              <button mat-raised-button color="accent" routerLink="/business/applications">
                <mat-icon>assignment</mat-icon>
                Review Applications
              </button>
              <button mat-raised-button routerLink="/business/transactions">
                <mat-icon>receipt</mat-icon>
                View Transactions
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- My Franchises -->
      <div class="recent-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>My Franchises</mat-card-title>
            <button mat-button routerLink="/business/franchises">Manage All</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="myFranchises.length === 0" class="no-data">
              <mat-icon>store</mat-icon>
              <p>No franchises yet. <a routerLink="/business/franchises">Create your first franchise</a> to get started!</p>
            </div>
            <div *ngIf="myFranchises.length > 0" class="franchises-list">
              <div *ngFor="let franchise of myFranchises" class="franchise-item">
                <div class="franchise-info">
                  <h4>{{franchise.name}}</h4>
                  <p>{{franchise.category}} • {{formatCurrency(franchise.franchiseFee)}} franchise fee</p>
                </div>
                <div class="franchise-status">
                  <mat-chip [class]="franchise.isActive ? 'status-active' : 'status-inactive'">
                    {{franchise.isActive ? 'Active' : 'Inactive'}}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Pending Applications -->
      <div class="recent-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Pending Applications</mat-card-title>
            <div class="header-actions">
              <span class="application-count">{{pendingApplications.length}} pending</span>
              <button mat-button routerLink="/business/applications">Review All</button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="pendingApplications.length === 0" class="no-data">
              <mat-icon>assignment</mat-icon>
              <p>No pending applications. Great job staying on top of reviews!</p>
            </div>
            <div *ngIf="pendingApplications.length > 0" class="applications-list">
              <div *ngFor="let application of pendingApplications" class="application-item">
                <div class="application-info">
                  <div class="applicant-details">
                    <h4>{{application.personalInfo.firstName}} {{application.personalInfo.lastName}}</h4>
                    <p class="franchise-name">{{getFranchiseName(application.franchiseId)}}</p>
                    <p class="application-meta">
                      Applied {{application.submittedAt | date:'mediumDate'}} •
                      Net Worth: {{formatCurrency(application.financialInfo.netWorth)}} •
                      Credit Score: {{application.financialInfo.creditScore}}
                    </p>
                  </div>
                </div>
                <div class="application-actions">
                  <button mat-button
                          color="primary"
                          (click)="viewApplicationDetails(application)"
                          matTooltip="View full application details">
                    <mat-icon>visibility</mat-icon>
                    Review
                  </button>
                  <button mat-raised-button
                          color="primary"
                          (click)="approveApplication(application.id)"
                          matTooltip="Approve this application">
                    <mat-icon>check</mat-icon>
                    Approve
                  </button>
                  <button mat-button
                          color="warn"
                          (click)="rejectApplication(application.id)"
                          matTooltip="Reject this application">
                    <mat-icon>close</mat-icon>
                    Reject
                  </button>
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
            <button mat-button routerLink="/business/transactions">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentTransactions.length === 0" class="no-data">
              <mat-icon>receipt</mat-icon>
              <p>No transactions yet.</p>
            </div>
            <div *ngIf="recentTransactions.length > 0" class="transactions-list">
              <div *ngFor="let transaction of recentTransactions" class="transaction-item">
                <div class="transaction-info">
                  <h4>Application Fee - {{getApplicationName(transaction.applicationId)}}</h4>
                  <p>{{transaction.completedAt | date:'mediumDate'}} • {{transaction.paymentMethod}}</p>
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
      height: 140px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: default;
    }

    .stat-card.clickable {
      cursor: pointer;
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

    .stat-icon.applications {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .stat-icon.revenue {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .stat-icon.pending {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .stat-icon.conversion {
      background-color: #fce4ec;
      color: #e91e63;
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

    .stat-subtitle {
      font-size: 12px;
      color: #999;
      display: block;
      margin-top: 2px;
    }

    .stat-progress {
      margin-top: 8px;
      height: 4px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }

    .stat-trend.positive {
      color: #4caf50;
    }

    .stat-trend mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .application-count {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
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

    .franchises-list,
    .applications-list,
    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .franchise-item,
    .application-item,
    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .franchise-info h4,
    .application-info h4,
    .transaction-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .franchise-info p,
    .application-info p,
    .transaction-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .application-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .application-actions button {
      min-width: auto;
    }

    .application-meta {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 12px;
      line-height: 1.4;
    }

    .franchise-name {
      margin: 2px 0;
      color: #1976d2;
      font-weight: 500;
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

    .status-active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-inactive {
      background-color: #f8d7da;
      color: #721c24;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background-color: #d4edda;
      color: #155724;
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

      .franchise-item,
      .application-item,
      .transaction-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .application-actions,
      .transaction-amount {
        width: 100%;
        justify-content: flex-start;
      }

      .transaction-amount {
        text-align: left;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  dashboardStats: any;
  myFranchises: Franchise[] = [];
  pendingApplications: FranchiseApplication[] = [];
  recentTransactions: PaymentTransaction[] = [];
  revenueChartData: any[] = [];
  applicationsChartData: any[] = [];

  // Add caching and lifecycle management
  private destroy$ = new Subject<void>();
  private dashboardStatsCache$ = new BehaviorSubject<any>(null);
  private lastStatsLoadTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  constructor(
    private authService: AuthService,
    private mockDataService: MockDataService,
    private apiBusinessService: ApiBusinessService,
    private currencyService: CurrencyService,
    private franchiseService: FranchiseService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
    ).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadStats(user.id);
        this.loadMyFranchises(user.id);
        this.loadPendingApplications(user.id);
        this.loadRecentTransactions(user.id);
        this.loadChartData(user.id);
      }
    });
  }

  private loadStats(userId: string, forceRefresh: boolean = false) {
    // Check cache first
    const now = Date.now();
    const isCacheValid = !forceRefresh && (now - this.lastStatsLoadTime) < this.CACHE_DURATION;

    if (isCacheValid && this.dashboardStatsCache$.value) {
      console.log('📊 Dashboard - Using cached stats');
      this.dashboardStats = this.dashboardStatsCache$.value;
      return;
    }

    console.log('📊 Dashboard - Loading fresh stats from API/service');

    // Check if this is a demo account
    if (this.authService.isDemoAccount(this.currentUser.email)) {
      // Use mock data service for demo accounts
      this.mockDataService.getDashboardStats(userId, this.currentUser.role).pipe(
        takeUntil(this.destroy$)
      ).subscribe((stats: any) => {
        this.dashboardStats = stats;
        this.dashboardStatsCache$.next(stats);
        this.lastStatsLoadTime = now;
      });
    } else {
      // Use API service for real accounts
      this.apiBusinessService.getDashboardStats().pipe(
        takeUntil(this.destroy$),
        shareReplay(1), // Cache the API response
        catchError(error => {
          console.error('Error loading dashboard stats from API:', error);
          // Fallback to mock data on error
          return this.mockDataService.getDashboardStats(userId, this.currentUser.role);
        })
      ).subscribe((stats: any) => {
        this.dashboardStats = stats;
        this.dashboardStatsCache$.next(stats);
        this.lastStatsLoadTime = now;
      });
    }
  }

  private loadMyFranchises(businessOwnerId: string) {
    // Check if this is a demo account
    if (this.authService.isDemoAccount(this.currentUser.email)) {
      // Use mock data service for demo accounts with reactive updates
      this.mockDataService.franchises$.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      ).subscribe((allFranchises: any[]) => {
        const userFranchises = allFranchises
          .filter(f => f.businessOwnerId === businessOwnerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first

        const previousCount = this.myFranchises.length;
        this.myFranchises = userFranchises.slice(0, 3); // Show only first 3

        // Only reload stats if franchise count changed (new franchise added/removed)
        if (userFranchises.length !== previousCount) {
          console.log('📊 Dashboard - Franchise count changed, refreshing stats');
          this.loadStats(businessOwnerId, true); // Force refresh
        }
      });
    } else {
      // Use API service for real accounts
      console.log('📊 Dashboard - Loading franchises from API for user:', businessOwnerId);

      this.franchiseService.getFranchises().pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading franchises from API:', error);
          return of([]); // Return empty array on error
        })
      ).subscribe((allFranchises: Franchise[]) => {
        // Filter franchises for current business owner and sort by creation date
        const userFranchises = allFranchises
          .filter(f => f.businessOwnerId === businessOwnerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const previousCount = this.myFranchises.length;
        this.myFranchises = userFranchises.slice(0, 3); // Show only first 3

        console.log('📊 Dashboard - Loaded', userFranchises.length, 'franchises for business owner');

        // Only reload stats if franchise count changed (new franchise added/removed)
        if (userFranchises.length !== previousCount) {
          console.log('📊 Dashboard - Franchise count changed, refreshing stats');
          this.loadStats(businessOwnerId, true); // Force refresh
        }
      });
    }
  }

  private loadPendingApplications(businessOwnerId: string) {
    // Use the proper service method to get applications for this business
    this.mockDataService.getApplicationsForBusiness(businessOwnerId).subscribe(applications => {
      this.pendingApplications = applications
        .filter(app => app.status === ApplicationStatus.SUBMITTED || app.status === ApplicationStatus.UNDER_REVIEW)
        .slice(0, 3); // Show only first 3
    });
  }

  private loadRecentTransactions(businessOwnerId: string) {
    // Get recent payment transactions for this business's franchises
    this.mockDataService.getRecentPaymentTransactionsForBusiness(businessOwnerId, 3).subscribe(transactions => {
      this.recentTransactions = transactions;
      console.log('📊 Business Dashboard - Recent transactions loaded:', transactions.length);
    });
  }

  getFranchiseName(franchiseId: string): string {
    const franchise = this.myFranchises.find(f => f.id === franchiseId);
    return franchise ? franchise.name : 'Unknown Franchise';
  }

  getApplicationName(applicationId: string): string {
    // For now, return a generic name since we don't have access to all applications here
    // This could be improved by getting the application details from the service
    return 'Application Fee';
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  // Chart data loading
  private loadChartData(businessId: string) {
    this.mockDataService.getRevenueChartData(businessId).subscribe((data: any) => {
      this.revenueChartData = data;
    });

    this.mockDataService.getApplicationsChartData(businessId).subscribe((data: any) => {
      this.applicationsChartData = data;
    });
  }

  // Statistics helper methods
  getFranchiseActivePercentage(): number {
    if (!this.dashboardStats?.totalFranchises) return 0;
    return (this.dashboardStats.activeFranchises / this.dashboardStats.totalFranchises) * 100;
  }

  getApplicationPendingPercentage(): number {
    if (!this.dashboardStats?.totalApplications) return 0;
    return (this.dashboardStats.pendingApplications / this.dashboardStats.totalApplications) * 100;
  }

  getRevenueGrowth(): number {
    // Mock calculation - in real app would compare to previous month
    return Math.floor(Math.random() * 20) + 5; // Random 5-25% growth
  }

  // Application management methods
  viewApplicationDetails(application: FranchiseApplication) {
    console.log('Viewing application details for:', application.personalInfo.firstName, application.personalInfo.lastName);
    // TODO: Open application details dialog or navigate to details page
  }

  approveApplication(applicationId: string) {
    this.mockDataService.approveApplication(applicationId, 'Application approved from dashboard').subscribe(
      (updatedApplication: any) => {
        console.log('Application approved:', updatedApplication);
        // Remove from pending list
        this.pendingApplications = this.pendingApplications.filter(app => app.id !== applicationId);
        // Refresh stats with force refresh
        this.loadStats(this.currentUser.id, true);
      }
    );
  }

  rejectApplication(applicationId: string) {
    this.mockDataService.rejectApplication(applicationId, 'Application rejected from dashboard').subscribe(
      (updatedApplication: any) => {
        console.log('Application rejected:', updatedApplication);
        // Remove from pending list
        this.pendingApplications = this.pendingApplications.filter(app => app.id !== applicationId);
        // Refresh stats with force refresh
        this.loadStats(this.currentUser.id, true);
      }
    );
  }

  // Public method to refresh dashboard data
  refreshDashboard() {
    if (this.currentUser) {
      console.log('📊 Dashboard - Manual refresh triggered');
      this.loadStats(this.currentUser.id, true);
      this.loadMyFranchises(this.currentUser.id); // Also refresh franchise list
    }
  }
}
