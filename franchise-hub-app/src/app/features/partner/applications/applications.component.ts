import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MockDataService } from '../../../core/services/mock-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { FranchiseApplication, ApplicationStatus, PaymentStatus, PaymentRequest, PaymentRequestStatus } from '../../../core/models/application.model';
import { ApplicationDetailDialogComponent } from './application-detail-dialog/application-detail-dialog.component';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule,
    MatDialogModule
  ],
  template: `
    <div class="applications-container">
      <div class="header">
        <h1>My Applications</h1>
        <button mat-raised-button color="primary" (click)="navigateToNewApplication()">
          <mat-icon>add</mat-icon>
          New Application
        </button>
      </div>

      <mat-tab-group [selectedIndex]="selectedTabIndex">
        <mat-tab>
          <ng-template mat-tab-label>
            <span>All Applications</span>
            <span matBadge="{{ applications.length }}" matBadgeOverlap="false" matBadgeSize="small"></span>
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading applications...</p>
            </div>

            <div *ngIf="!isLoading && applications.length === 0" class="empty-state">
              <mat-icon>assignment</mat-icon>
              <h3>No Applications Yet</h3>
              <p>You haven't submitted any franchise applications. Start by browsing available franchises.</p>
              <button mat-raised-button color="primary" (click)="navigateToBrowse()">
                Browse Franchises
              </button>
            </div>

            <div *ngIf="!isLoading && applications.length > 0" class="applications-grid">
              <mat-card *ngFor="let application of applications" class="application-card">
                <mat-card-header>
                  <mat-card-title>{{ application.franchiseName }}</mat-card-title>
                  <mat-card-subtitle>{{ application.franchiseCategory }}</mat-card-subtitle>
                  <div class="card-actions">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="viewApplication(application.id)">
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>
                      <button mat-menu-item (click)="viewTimeline(application.id)">
                        <mat-icon>timeline</mat-icon>
                        View Timeline
                      </button>
                      <button mat-menu-item *ngIf="application.status === ApplicationStatus.REJECTED"
                              (click)="reapply(application)">
                        <mat-icon>refresh</mat-icon>
                        Reapply
                      </button>
                    </mat-menu>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="application-info">
                    <div class="info-row">
                      <span class="label">Application ID:</span>
                      <span class="value">#{{ application.id.substring(0, 8).toUpperCase() }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Submitted:</span>
                      <span class="value">{{ formatDate(application.submittedAt) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Application Fee:</span>
                      <span class="value">{{ formatCurrency(application.applicationFee) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Location:</span>
                      <span class="value">{{ application.businessInfo.preferredLocation.city }}, {{ application.businessInfo.preferredLocation.state }}</span>
                    </div>
                  </div>

                  <div class="status-section">
                    <div class="status-chips">
                      <mat-chip-set>
                        <mat-chip [class]="getStatusClass(application.status)">
                          <mat-icon>{{ getStatusIcon(application.status) }}</mat-icon>
                          {{ getStatusText(application.status) }}
                        </mat-chip>
                        <mat-chip [class]="getPaymentStatusClass(application.paymentStatus)">
                          <mat-icon>{{ getPaymentStatusIcon(application.paymentStatus) }}</mat-icon>
                          {{ getPaymentStatusText(application.paymentStatus) }}
                        </mat-chip>
                        <!-- Payment Request Indicators -->
                        <mat-chip
                          *ngIf="getPaymentRequestsForApplication(application.id).length > 0"
                          [matBadge]="getPendingPaymentRequestsCount(application.id)"
                          matBadgeColor="accent"
                          matBadgeSize="small"
                          [matBadgeHidden]="getPendingPaymentRequestsCount(application.id) === 0"
                          class="payment-requests-chip">
                          <mat-icon>payment</mat-icon>
                          Payment Requests
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button (click)="viewApplication(application.id)">View Details</button>
                  <button mat-button *ngIf="application.paymentStatus === PaymentStatus.PENDING"
                          color="primary" (click)="makePayment(application.id)">
                    Pay Now
                  </button>
                  <button mat-raised-button
                          *ngIf="getPendingPaymentRequestsCount(application.id) > 0"
                          color="accent"
                          (click)="settlePaymentRequests(application.id)">
                    <mat-icon>payment</mat-icon>
                    Settle Payments ({{ getPendingPaymentRequestsCount(application.id) }})
                  </button>
                  <button mat-button *ngIf="application.status === ApplicationStatus.APPROVED"
                          color="accent" (click)="downloadAgreement(application.id)">
                    Download Agreement
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <span>Pending</span>
            <span matBadge="{{ getPendingCount() }}" matBadgeOverlap="false" matBadgeSize="small"></span>
          </ng-template>
          <div class="tab-content">
            <div class="applications-grid">
              <mat-card *ngFor="let application of getPendingApplications()" class="application-card">
                <!-- Same card content as above -->
                <mat-card-header>
                  <mat-card-title>{{ application.franchiseName }}</mat-card-title>
                  <mat-card-subtitle>{{ application.franchiseCategory }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="application-info">
                    <div class="info-row">
                      <span class="label">Submitted:</span>
                      <span class="value">{{ formatDate(application.submittedAt) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Status:</span>
                      <span class="value">{{ getStatusText(application.status) }}</span>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button (click)="viewApplication(application.id)">View Details</button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <span>Approved</span>
            <span matBadge="{{ getApprovedCount() }}" matBadgeOverlap="false" matBadgeSize="small"></span>
          </ng-template>
          <div class="tab-content">
            <div class="applications-grid">
              <mat-card *ngFor="let application of getApprovedApplications()" class="application-card approved">
                <mat-card-header>
                  <mat-card-title>{{ application.franchiseName }}</mat-card-title>
                  <mat-card-subtitle>{{ application.franchiseCategory }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="application-info">
                    <div class="info-row">
                      <span class="label">Approved:</span>
                      <span class="value">{{ formatDate(application.reviewedAt) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Next Steps:</span>
                      <span class="value">Download and sign agreement</span>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="accent" (click)="downloadAgreement(application.id)">
                    Download Agreement
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
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
      margin: 0 0 24px 0;
      color: #666;
      max-width: 400px;
    }

    .applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .application-card {
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .application-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .application-card.approved {
      border-left: 4px solid #4caf50;
    }

    .card-actions {
      position: absolute;
      top: 8px;
      right: 8px;
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

    .status-section {
      margin-top: 16px;
    }

    .status-chips mat-chip-set {
      display: flex;
      gap: 8px;
    }

    .status-chips mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-chips mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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

    .payment-requests-chip {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .payment-requests-chip mat-icon {
      color: #f57c00;
    }

    @media (max-width: 768px) {
      .applications-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .applications-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .info-row {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class ApplicationsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mockDataService = inject(MockDataService);
  private authService = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  applications: FranchiseApplication[] = [];
  paymentRequestsMap: Map<string, PaymentRequest[]> = new Map();
  isLoading = true;
  selectedTabIndex = 0;

  // Expose enums to template
  ApplicationStatus = ApplicationStatus;
  PaymentStatus = PaymentStatus;

  ngOnInit() {
    this.loadApplications();
    this.handleTabNavigation();
  }

  private handleTabNavigation() {
    // Check if we should navigate to approved tab
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'approved-tab') {
        this.selectedTabIndex = 2; // Approved tab index
      }
    });
  }

  private loadApplications() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('🔍 Partner Applications - Loading applications for user:', currentUser.id, currentUser.email);

    // Debug localStorage before loading
    this.mockDataService.debugLocalStorage();

    this.mockDataService.getApplicationsForPartner(currentUser.id).subscribe({
      next: (applications) => {
        console.log('🔍 Partner Applications - Received applications:', applications.length, applications);
        console.log('🔍 Application details:', applications.map(a => ({
          id: a.id,
          franchiseName: a.franchiseName,
          partnerId: a.partnerId,
          status: a.status,
          submittedAt: a.submittedAt
        })));
        this.applications = applications;
        this.isLoading = false;

        // Load payment requests for each application
        this.loadPaymentRequestsForApplications();
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.snackBar.open('Error loading applications', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  navigateToNewApplication() {
    this.router.navigate(['/partner/browse']);
  }

  navigateToBrowse() {
    this.router.navigate(['/partner/browse']);
  }

  viewApplication(applicationId: string) {
    const application = this.applications.find(app => app.id === applicationId);
    if (application) {
      this.dialog.open(ApplicationDetailDialogComponent, {
        width: '800px',
        maxHeight: '90vh',
        data: { application }
      });
    } else {
      this.snackBar.open('Application not found', 'Close', { duration: 3000 });
    }
  }

  viewTimeline(applicationId: string) {
    this.router.navigate(['/partner/applications', applicationId, 'timeline']);
  }

  reapply(application: FranchiseApplication) {
    this.router.navigate(['/partner/applications/new'], {
      queryParams: { franchiseId: application.franchiseId }
    });
  }

  makePayment(applicationId: string) {
    this.router.navigate(['/partner/applications', applicationId, 'payment']);
  }

  downloadAgreement(applicationId: string) {
    // Mock download functionality
    this.snackBar.open('Agreement download started', 'Close', { duration: 3000 });
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

  getPendingCount(): number {
    return this.getPendingApplications().length;
  }

  getApprovedCount(): number {
    return this.getApprovedApplications().length;
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

  getPaymentStatusIcon(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'schedule';
      case PaymentStatus.COMPLETED:
        return 'payment';
      case PaymentStatus.FAILED:
        return 'error';
      default:
        return 'help';
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

  formatDate(date: Date | string | undefined | null): string {
    if (!date) {
      return 'Not available';
    }

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }

      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Invalid date';
    }
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  // Payment Request Methods
  private loadPaymentRequestsForApplications() {
    this.applications.forEach(application => {
      this.mockDataService.getPaymentRequestsForApplication(application.id).subscribe({
        next: (requests) => {
          this.paymentRequestsMap.set(application.id, requests);
          console.log(`💰 Payment requests loaded for application ${application.id}:`, requests.length);
        },
        error: (error) => {
          console.error(`Error loading payment requests for application ${application.id}:`, error);
          this.paymentRequestsMap.set(application.id, []);
        }
      });
    });
  }

  getPaymentRequestsForApplication(applicationId: string): PaymentRequest[] {
    return this.paymentRequestsMap.get(applicationId) || [];
  }

  getPendingPaymentRequestsCount(applicationId: string): number {
    const requests = this.getPaymentRequestsForApplication(applicationId);
    return requests.filter(pr => pr.status === PaymentRequestStatus.PENDING).length;
  }

  settlePaymentRequests(applicationId: string) {
    console.log('💳 Settle payment requests for application:', applicationId);

    // Get pending payment requests for this application
    const paymentRequests = this.getPaymentRequestsForApplication(applicationId);
    const pendingPaymentRequests = paymentRequests.filter(pr => pr.status === PaymentRequestStatus.PENDING);

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
}
