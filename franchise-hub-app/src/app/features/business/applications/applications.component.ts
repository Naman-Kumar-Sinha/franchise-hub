import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { FranchiseApplication, ApplicationStatus, PaymentStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="applications-container">
      <div class="header">
        <h1>Application Management</h1>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-number">{{ getTotalApplications() }}</span>
            <span class="stat-label">Total Applications</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ getPendingApplications().length }}</span>
            <span class="stat-label">Pending Review</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ getApprovedApplications().length }}</span>
            <span class="stat-label">Approved</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput formControlName="search" placeholder="Partner name, franchise, location...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="{{ ApplicationStatus.SUBMITTED }}">Submitted</mat-option>
                <mat-option value="{{ ApplicationStatus.UNDER_REVIEW }}">Under Review</mat-option>
                <mat-option value="{{ ApplicationStatus.APPROVED }}">Approved</mat-option>
                <mat-option value="{{ ApplicationStatus.REJECTED }}">Rejected</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Franchise</mat-label>
              <mat-select formControlName="franchise">
                <mat-option value="">All Franchises</mat-option>
                <mat-option *ngFor="let franchise of getUniqueFranchises()" [value]="franchise">
                  {{ franchise }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button type="button" (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-tab-group>
        <mat-tab>
          <ng-template mat-tab-label>
            <span>All Applications</span>
            <span matBadge="{{ getFilteredApplications().length }}" matBadgeOverlap="false" matBadgeSize="small"></span>
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading applications...</p>
            </div>

            <div *ngIf="!isLoading && getFilteredApplications().length === 0" class="empty-state">
              <mat-icon>assignment</mat-icon>
              <h3>No Applications Found</h3>
              <p>No applications match your current filters.</p>
            </div>

            <div *ngIf="!isLoading && getFilteredApplications().length > 0" class="applications-table">
              <table mat-table [dataSource]="getFilteredApplications()" class="full-width-table">
                <!-- Partner Name Column -->
                <ng-container matColumnDef="partnerName">
                  <th mat-header-cell *matHeaderCellDef>Partner</th>
                  <td mat-cell *matCellDef="let application">
                    <div class="partner-info">
                      <strong>{{ application.partnerName }}</strong>
                      <small>{{ application.partnerEmail }}</small>
                    </div>
                  </td>
                </ng-container>

                <!-- Franchise Column -->
                <ng-container matColumnDef="franchise">
                  <th mat-header-cell *matHeaderCellDef>Franchise</th>
                  <td mat-cell *matCellDef="let application">
                    <div class="franchise-info">
                      <strong>{{ application.franchiseName }}</strong>
                      <small>{{ application.franchiseCategory }}</small>
                    </div>
                  </td>
                </ng-container>

                <!-- Location Column -->
                <ng-container matColumnDef="location">
                  <th mat-header-cell *matHeaderCellDef>Location</th>
                  <td mat-cell *matCellDef="let application">
                    {{ application.businessInfo.preferredLocation.city }}, {{ application.businessInfo.preferredLocation.state }}
                  </td>
                </ng-container>

                <!-- Investment Column -->
                <ng-container matColumnDef="investment">
                  <th mat-header-cell *matHeaderCellDef>Investment</th>
                  <td mat-cell *matCellDef="let application">
                    {{ formatCurrency(application.financialInfo.investmentCapacity) }}
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let application">
                    <mat-chip [class]="getStatusClass(application.status)">
                      <mat-icon>{{ getStatusIcon(application.status) }}</mat-icon>
                      {{ getStatusText(application.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Payment Column -->
                <ng-container matColumnDef="payment">
                  <th mat-header-cell *matHeaderCellDef>Payment</th>
                  <td mat-cell *matCellDef="let application">
                    <mat-chip [class]="getPaymentStatusClass(application.paymentStatus)">
                      {{ getPaymentStatusText(application.paymentStatus) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Submitted Date Column -->
                <ng-container matColumnDef="submittedDate">
                  <th mat-header-cell *matHeaderCellDef>Submitted</th>
                  <td mat-cell *matCellDef="let application">
                    {{ formatDate(application.submittedAt) }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let application" (click)="$event.stopPropagation()">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="viewApplication(application.id)">
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>
                      <button mat-menu-item *ngIf="canReview(application)" (click)="reviewApplication(application.id)">
                        <mat-icon>rate_review</mat-icon>
                        Review Application
                      </button>
                      <button mat-menu-item (click)="viewTimeline(application.id)">
                        <mat-icon>timeline</mat-icon>
                        View Timeline
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let application; columns: displayedColumns;"
                    (click)="viewApplication(application.id)" class="clickable-row"></tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <span>Pending Review</span>
            <span matBadge="{{ getPendingApplications().length }}" matBadgeOverlap="false" matBadgeSize="small"></span>
          </ng-template>
          <div class="tab-content">
            <div class="applications-grid">
              <mat-card *ngFor="let application of getPendingApplications()" class="application-card pending">
                <mat-card-header>
                  <mat-card-title>{{ application.partnerName }}</mat-card-title>
                  <mat-card-subtitle>{{ application.franchiseName }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="application-info">
                    <div class="info-row">
                      <span class="label">Location:</span>
                      <span class="value">{{ application.businessInfo.preferredLocation.city }}, {{ application.businessInfo.preferredLocation.state }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Investment:</span>
                      <span class="value">{{ formatCurrency(application.financialInfo.investmentCapacity) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Submitted:</span>
                      <span class="value">{{ formatDate(application.submittedAt) }}</span>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button (click)="viewApplication(application.id)">View Details</button>
                  <button mat-raised-button color="primary" (click)="reviewApplication(application.id)">
                    Review Application
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .applications-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-stats {
      display: flex;
      gap: 16px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      min-width: 100px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters-form mat-form-field {
      min-width: 200px;
    }

    .tab-content {
      padding: 24px 0;
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      color: #666;
    }

    .applications-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .full-width-table {
      width: 100%;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .clickable-row:hover {
      background-color: #f5f5f5;
    }

    .partner-info,
    .franchise-info {
      display: flex;
      flex-direction: column;
    }

    .partner-info small,
    .franchise-info small {
      color: #666;
      font-size: 0.8em;
    }

    .applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .application-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .application-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .application-card.pending {
      border-left: 4px solid #ff9800;
    }

    .application-info {
      margin: 16px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .info-row .label {
      font-weight: 500;
      color: #666;
    }

    .info-row .value {
      color: #333;
    }

    /* Status chip colors */
    .status-submitted {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-under-review {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-approved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .status-deactivated {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .payment-pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .payment-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .payment-failed {
      background-color: #ffebee;
      color: #d32f2f;
    }

    @media (max-width: 768px) {
      .applications-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
      }

      .header-stats {
        width: 100%;
        justify-content: space-between;
      }

      .filters-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-form mat-form-field {
        min-width: auto;
        width: 100%;
      }

      .applications-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .applications-table {
        overflow-x: auto;
      }
    }
  `]
})
export class ApplicationsComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);

  applications: FranchiseApplication[] = [];
  filteredApplications: FranchiseApplication[] = [];
  isLoading = true;

  filterForm: FormGroup;

  displayedColumns: string[] = [
    'partnerName',
    'franchise',
    'location',
    'investment',
    'status',
    'payment',
    'submittedDate',
    'actions'
  ];

  // Expose enums to template
  ApplicationStatus = ApplicationStatus;
  PaymentStatus = PaymentStatus;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      franchise: ['']
    });

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.loadApplications();
  }

  private loadApplications() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.applicationService.getApplicationsForBusiness(currentUser.id).subscribe({
      next: (applications) => {
        this.applications = applications;
        this.filteredApplications = applications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.snackBar.open('Error loading applications', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private applyFilters() {
    const filters = this.filterForm.value;
    this.filteredApplications = this.applications.filter(app => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          app.partnerName.toLowerCase().includes(searchTerm) ||
          app.franchiseName.toLowerCase().includes(searchTerm) ||
          app.businessInfo.preferredLocation.city.toLowerCase().includes(searchTerm) ||
          app.businessInfo.preferredLocation.state.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && app.status !== filters.status) {
        return false;
      }

      // Franchise filter
      if (filters.franchise && app.franchiseName !== filters.franchise) {
        return false;
      }

      return true;
    });
  }

  clearFilters() {
    this.filterForm.reset();
  }

  getFilteredApplications(): FranchiseApplication[] {
    return this.filteredApplications;
  }

  getTotalApplications(): number {
    return this.applications.length;
  }

  getPendingApplications(): FranchiseApplication[] {
    return this.applications.filter(app =>
      app.status === ApplicationStatus.SUBMITTED ||
      app.status === ApplicationStatus.UNDER_REVIEW
    );
  }

  getApprovedApplications(): FranchiseApplication[] {
    return this.applications.filter(app => app.status === ApplicationStatus.APPROVED);
  }

  getUniqueFranchises(): string[] {
    const franchises = this.applications.map(app => app.franchiseName);
    return [...new Set(franchises)].sort();
  }

  canReview(application: FranchiseApplication): boolean {
    return application.status === ApplicationStatus.SUBMITTED ||
           application.status === ApplicationStatus.UNDER_REVIEW;
  }

  viewApplication(applicationId: string) {
    this.router.navigate(['/business/applications', applicationId]);
  }

  reviewApplication(applicationId: string) {
    this.router.navigate(['/business/applications', applicationId, 'review']);
  }

  viewTimeline(applicationId: string) {
    this.router.navigate(['/business/applications', applicationId, 'timeline']);
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return 'status-submitted';
      case ApplicationStatus.UNDER_REVIEW:
        return 'status-under-review';
      case ApplicationStatus.APPROVED:
        return 'status-approved';
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      case ApplicationStatus.DEACTIVATED:
        return 'status-deactivated';
      default:
        return '';
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return 'send';
      case ApplicationStatus.UNDER_REVIEW:
        return 'hourglass_empty';
      case ApplicationStatus.APPROVED:
        return 'check_circle';
      case ApplicationStatus.REJECTED:
        return 'cancel';
      case ApplicationStatus.DEACTIVATED:
        return 'block';
      default:
        return 'help';
    }
  }

  getStatusText(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return 'Submitted';
      case ApplicationStatus.UNDER_REVIEW:
        return 'Under Review';
      case ApplicationStatus.APPROVED:
        return 'Approved';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      case ApplicationStatus.DEACTIVATED:
        return 'Deactivated';
      default:
        return 'Unknown';
    }
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'payment-pending';
      case PaymentStatus.COMPLETED:
        return 'payment-completed';
      case PaymentStatus.FAILED:
        return 'payment-failed';
      default:
        return '';
    }
  }

  getPaymentStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Payment Pending';
      case PaymentStatus.COMPLETED:
        return 'Payment Completed';
      case PaymentStatus.FAILED:
        return 'Payment Failed';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }
}
