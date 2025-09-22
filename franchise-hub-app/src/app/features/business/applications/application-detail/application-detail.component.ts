import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { FranchiseApplication, ApplicationStatus, PaymentStatus, PaymentRequest, PaymentRequestStatus } from '../../../../core/models/application.model';
import { PaymentRequestDialogComponent } from './payment-request-dialog.component';
import { PartnershipDeactivationDialogComponent } from './partnership-deactivation-dialog.component';
import { TestDialogComponent } from './test-dialog.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule
  ],
  template: `
    <div class="application-detail-container">
      <div class="header-section">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Application Details</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary"
                  *ngIf="application && canReview(application)"
                  (click)="reviewApplication()">
            <mat-icon>rate_review</mat-icon>
            Review Application
          </button>
          <button mat-raised-button color="accent"
                  *ngIf="application && application.status === 'APPROVED'"
                  (click)="requestPayment()">
            <mat-icon>payment</mat-icon>
            Request Payment
          </button>
          <button mat-stroked-button color="warn"
                  *ngIf="application && application.status === 'APPROVED'"
                  (click)="deactivatePartnership()">
            <mat-icon>block</mat-icon>
            Deactivate Partnership
          </button>
          <button mat-stroked-button color="primary"
                  *ngIf="application && application.status === 'DEACTIVATED'"
                  (click)="reactivatePartnership()">
            <mat-icon>check_circle</mat-icon>
            Reactivate Partnership
          </button>
          <button mat-button (click)="viewTimeline()">
            <mat-icon>timeline</mat-icon>
            View Timeline
          </button>
          <button mat-button color="warn" (click)="testDialog()">
            <mat-icon>bug_report</mat-icon>
            Test Dialog
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading application details...</p>
      </div>

      <div *ngIf="!isLoading && !application" class="error-container">
        <mat-icon>error_outline</mat-icon>
        <h2>Application Not Found</h2>
        <p>The requested application could not be found.</p>
        <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
      </div>

      <div *ngIf="!isLoading && application" class="content-section">
        <!-- Application Overview -->
        <mat-card class="overview-card">
          <mat-card-header>
            <mat-card-title>{{ application.franchiseName }}</mat-card-title>
            <mat-card-subtitle>{{ application.franchiseCategory }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="overview-grid">
              <div class="overview-item">
                <span class="label">Application ID:</span>
                <span class="value">{{ application.id }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Partner:</span>
                <span class="value">{{ application.partnerName }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Email:</span>
                <span class="value">{{ application.partnerEmail }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Status:</span>
                <mat-chip [class]="getStatusClass(application.status)">
                  <mat-icon>{{ getStatusIcon(application.status) }}</mat-icon>
                  {{ getStatusText(application.status) }}
                </mat-chip>
              </div>
              <div class="overview-item">
                <span class="label">Payment Status:</span>
                <mat-chip [class]="getPaymentStatusClass(application.paymentStatus)">
                  {{ getPaymentStatusText(application.paymentStatus) }}
                </mat-chip>
              </div>
              <div class="overview-item">
                <span class="label">Investment Capacity:</span>
                <span class="value">{{ formatCurrency(application.financialInfo.investmentCapacity) }}</span>
              </div>
              <div class="overview-item">
                <span class="label">Submitted:</span>
                <span class="value">{{ formatDate(application.submittedAt) }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Detailed Information Tabs -->
        <mat-tab-group class="details-tabs">
          <mat-tab label="Personal Information">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">First Name:</span>
                  <span class="value">{{ application.personalInfo.firstName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Last Name:</span>
                  <span class="value">{{ application.personalInfo.lastName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ application.personalInfo.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Phone:</span>
                  <span class="value">{{ application.personalInfo.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Date of Birth:</span>
                  <span class="value">{{ formatDate(application.personalInfo.dateOfBirth) }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="label">Address:</span>
                  <span class="value">{{ application.personalInfo.address }}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Financial Information">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Net Worth:</span>
                  <span class="value">{{ formatCurrency(application.financialInfo.netWorth) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Liquid Capital:</span>
                  <span class="value">{{ formatCurrency(application.financialInfo.liquidCapital) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Investment Capacity:</span>
                  <span class="value">{{ formatCurrency(application.financialInfo.investmentCapacity) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Annual Income:</span>
                  <span class="value">{{ formatCurrency(application.financialInfo.annualIncome) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Credit Score:</span>
                  <span class="value">{{ application.financialInfo.creditScore }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Business Experience:</span>
                  <span class="value">{{ application.financialInfo.hasBusinessExperience ? 'Yes' : 'No' }}</span>
                </div>
                <div class="info-item full-width" *ngIf="application.financialInfo.businessExperienceDetails">
                  <span class="label">Experience Details:</span>
                  <span class="value">{{ application.financialInfo.businessExperienceDetails }}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Business Preferences">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="label">Preferred Location:</span>
                  <span class="value">{{ getLocationString(application.businessInfo.preferredLocation) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Timeline to Open:</span>
                  <span class="value">{{ application.businessInfo.timelineToOpen }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Full-time Commitment:</span>
                  <span class="value">{{ application.businessInfo.fullTimeCommitment ? 'Yes' : 'No' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Has Partners:</span>
                  <span class="value">{{ application.businessInfo.hasPartners ? 'Yes' : 'No' }}</span>
                </div>
                <div class="info-item full-width" *ngIf="application.businessInfo.partnerDetails">
                  <span class="label">Partner Details:</span>
                  <span class="value">{{ application.businessInfo.partnerDetails }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="label">Preferred States:</span>
                  <span class="value">{{ (application.businessInfo.preferredStates && application.businessInfo.preferredStates.length > 0) ? application.businessInfo.preferredStates.join(', ') : 'Not specified' }}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Documents" *ngIf="application.documents && application.documents.length > 0">
            <div class="tab-content">
              <div class="documents-list">
                <div *ngFor="let document of application.documents" class="document-item">
                  <mat-icon>{{ getDocumentIcon(document.type) }}</mat-icon>
                  <div class="document-info">
                    <span class="document-name">{{ document.name }}</span>
                    <span class="document-details">{{ document.type }} • {{ formatFileSize(document.size) }}</span>
                  </div>
                  <button mat-icon-button (click)="downloadDocument(document)">
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Payment Requests Tab -->
          <mat-tab label="Payment Requests" *ngIf="application && application.status === 'APPROVED'">
            <div class="tab-content">
              <div class="payment-requests-header">
                <h3>Payment Requests</h3>
                <button mat-raised-button color="primary" (click)="requestPayment()">
                  <mat-icon>add</mat-icon>
                  Request Payment
                </button>
              </div>

              <div *ngIf="paymentRequests.length === 0" class="no-requests">
                <mat-icon>payment</mat-icon>
                <p>No payment requests yet</p>
                <button mat-button color="primary" (click)="requestPayment()">
                  Create First Payment Request
                </button>
              </div>

              <div *ngIf="paymentRequests.length > 0" class="payment-requests-table">
                <table mat-table [dataSource]="paymentRequests" class="requests-table">
                  <!-- Date Column -->
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let request">{{ formatDate(request.requestedAt) }}</td>
                  </ng-container>

                  <!-- Amount Column -->
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let request">{{ formatCurrency(request.amount) }}</td>
                  </ng-container>

                  <!-- Purpose Column -->
                  <ng-container matColumnDef="purpose">
                    <th mat-header-cell *matHeaderCellDef>Purpose</th>
                    <td mat-cell *matCellDef="let request">{{ request.purpose }}</td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let request">
                      <mat-chip [class]="getPaymentRequestStatusClass(request.status)">
                        {{ getPaymentRequestStatusText(request.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let request">
                      <button mat-icon-button [matMenuTriggerFor]="requestMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #requestMenu="matMenu">
                        <button mat-menu-item (click)="viewPaymentRequest(request)">
                          <mat-icon>visibility</mat-icon>
                          View Details
                        </button>
                        <button mat-menu-item
                                *ngIf="request.status === 'PENDING'"
                                (click)="cancelPaymentRequest(request)">
                          <mat-icon>cancel</mat-icon>
                          Cancel Request
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="paymentRequestColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: paymentRequestColumns;"></tr>
                </table>

                <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                               [pageSize]="10"
                               showFirstLastButtons>
                </mat-paginator>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .application-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header-section h1 {
      flex: 1;
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .overview-card {
      margin-bottom: 24px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .overview-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .overview-item .label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .overview-item .value {
      font-size: 16px;
    }

    .details-tabs {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item .label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .info-item .value {
      font-size: 16px;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .document-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .document-name {
      font-weight: 500;
    }

    .document-details {
      font-size: 12px;
      color: #666;
    }

    /* Status chip styles */
    .status-submitted { background-color: #2196f3; color: white; }
    .status-under-review { background-color: #ff9800; color: white; }
    .status-approved { background-color: #4caf50; color: white; }
    .status-rejected { background-color: #f44336; color: white; }

    .payment-pending { background-color: #ff9800; color: white; }
    .payment-completed { background-color: #4caf50; color: white; }
    .payment-failed { background-color: #f44336; color: white; }

    @media (max-width: 768px) {
      .application-detail-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .overview-grid, .info-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Payment Requests Styles */
    .payment-requests-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .payment-requests-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .no-requests {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-requests mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .payment-requests-table {
      margin-top: 16px;
    }

    .requests-table {
      width: 100%;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-paid {
      background-color: #d4edda;
      color: #155724;
    }

    .status-overdue {
      background-color: #f8d7da;
      color: #721c24;
    }

    .status-cancelled {
      background-color: #e2e3e5;
      color: #383d41;
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockDataService = inject(MockDataService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  application: FranchiseApplication | null = null;
  isLoading = true;

  // Payment Requests
  paymentRequests: PaymentRequest[] = [];
  paymentRequestColumns = ['date', 'amount', 'purpose', 'status', 'actions'];

  ngOnInit() {
    const applicationId = this.route.snapshot.paramMap.get('id');
    if (applicationId) {
      this.loadApplication(applicationId);
      this.loadPaymentRequests(applicationId);
    } else {
      this.isLoading = false;
    }
  }

  private loadApplication(applicationId: string) {
    this.mockDataService.getApplicationById(applicationId).subscribe({
      next: (application) => {
        this.application = application;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.snackBar.open('Error loading application details', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/business/applications']);
  }

  reviewApplication() {
    if (this.application) {
      this.router.navigate(['/business/applications', this.application.id, 'review']);
    }
  }

  viewTimeline() {
    if (this.application) {
      this.router.navigate(['/business/applications', this.application.id, 'timeline']);
    }
  }

  canReview(application: FranchiseApplication): boolean {
    return application.status === ApplicationStatus.SUBMITTED || 
           application.status === ApplicationStatus.UNDER_REVIEW;
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED: return 'status-submitted';
      case ApplicationStatus.UNDER_REVIEW: return 'status-under-review';
      case ApplicationStatus.APPROVED: return 'status-approved';
      case ApplicationStatus.REJECTED: return 'status-rejected';
      default: return '';
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED: return 'send';
      case ApplicationStatus.UNDER_REVIEW: return 'rate_review';
      case ApplicationStatus.APPROVED: return 'check_circle';
      case ApplicationStatus.REJECTED: return 'cancel';
      default: return 'help';
    }
  }

  getStatusText(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED: return 'Submitted';
      case ApplicationStatus.UNDER_REVIEW: return 'Under Review';
      case ApplicationStatus.APPROVED: return 'Approved';
      case ApplicationStatus.REJECTED: return 'Rejected';
      default: return 'Unknown';
    }
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING: return 'payment-pending';
      case PaymentStatus.COMPLETED: return 'payment-completed';
      case PaymentStatus.FAILED: return 'payment-failed';
      default: return '';
    }
  }

  getPaymentStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING: return 'Payment Pending';
      case PaymentStatus.COMPLETED: return 'Payment Completed';
      case PaymentStatus.FAILED: return 'Payment Failed';
      default: return 'Unknown';
    }
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getLocationString(location: any): string {
    if (typeof location === 'string') {
      return location;
    }
    return `${location.address}, ${location.city}, ${location.state} ${location.zipCode}, ${location.country}`;
  }

  getDocumentIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'id_proof': return 'badge';
      case 'financial_statement': return 'account_balance';
      case 'business_plan': return 'business_center';
      case 'reference_letter': return 'mail';
      default: return 'description';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Payment Request Methods
  private loadPaymentRequests(applicationId: string) {
    this.mockDataService.getPaymentRequestsForApplication(applicationId).subscribe({
      next: (requests) => {
        this.paymentRequests = requests;
      },
      error: (error) => {
        console.error('Error loading payment requests:', error);
        this.paymentRequests = [];
      }
    });
  }

  requestPayment() {
    console.log('🔥 requestPayment() called');
    if (!this.application) {
      console.log('❌ No application found');
      return;
    }

    console.log('📋 Opening payment request dialog for application:', this.application.id);

    try {
      const dialogRef = this.dialog.open(PaymentRequestDialogComponent, {
        width: '500px',
        maxWidth: '90vw',
        minWidth: '400px',
        data: { application: this.application },
        disableClose: true, // Prevent accidental closing
        autoFocus: true,
        hasBackdrop: true,
        backdropClass: 'custom-backdrop',
        panelClass: 'custom-dialog-panel'
      });

      console.log('✅ Dialog opened successfully');

      dialogRef.afterClosed().subscribe(result => {
        console.log('🔄 Dialog closed with result:', result);
        if (result) {
          console.log('Payment request created:', result);
          // Reload payment requests
          this.loadPaymentRequests(this.application!.id);
          this.snackBar.open('Payment request sent successfully!', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('❌ Error opening payment request dialog:', error);
    }
  }

  deactivatePartnership() {
    console.log('🔥 deactivatePartnership() called');
    if (!this.application) {
      console.log('❌ No application found');
      return;
    }

    console.log('📋 Opening deactivation dialog for application:', this.application.id);

    try {
      const dialogRef = this.dialog.open(PartnershipDeactivationDialogComponent, {
        width: '600px',
        maxWidth: '90vw',
        minWidth: '500px',
        data: { application: this.application },
        disableClose: true, // Prevent accidental closing
        autoFocus: true,
        hasBackdrop: true,
        backdropClass: 'custom-backdrop',
        panelClass: 'custom-dialog-panel'
      });

      console.log('✅ Deactivation dialog opened successfully');

      dialogRef.afterClosed().subscribe(result => {
        console.log('🔄 Deactivation dialog closed with result:', result);
        if (result) {
          console.log('Partnership deactivated:', result);
          // Reload application to reflect status change
          this.loadApplication(this.application!.id);
          this.snackBar.open('Partnership deactivated successfully', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('❌ Error opening deactivation dialog:', error);
    }
  }

  reactivatePartnership() {
    console.log('🔄 reactivatePartnership() called');
    if (!this.application) {
      console.log('❌ No application found');
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to reactivate this partnership? This will restore the partnership to active status.');

    if (confirmed) {
      // Call the service to reactivate the partnership
      this.mockDataService.reactivatePartnership(this.application.id).subscribe({
        next: (updatedApplication) => {
          console.log('🔄 Partnership reactivated successfully:', updatedApplication);
          // Reload application to reflect status change
          this.loadApplication(this.application!.id);
          this.snackBar.open('Partnership reactivated successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('🔄 Error reactivating partnership:', error);
          this.snackBar.open('Error reactivating partnership. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewPaymentRequest(request: PaymentRequest) {
    console.log('Viewing payment request:', request);
  }

  cancelPaymentRequest(request: PaymentRequest) {
    console.log('Cancelling payment request:', request);
  }

  getPaymentRequestStatusClass(status: PaymentRequestStatus): string {
    switch (status) {
      case PaymentRequestStatus.PENDING: return 'status-pending';
      case PaymentRequestStatus.PAID: return 'status-paid';
      case PaymentRequestStatus.OVERDUE: return 'status-overdue';
      case PaymentRequestStatus.CANCELLED: return 'status-cancelled';
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

  downloadDocument(document: any) {
    // Mock download functionality
    this.snackBar.open(`Downloading ${document.name}...`, 'Close', { duration: 2000 });
  }

  testDialog() {
    console.log('🧪 Testing basic dialog functionality');

    try {
      const dialogRef = this.dialog.open(TestDialogComponent, {
        width: '400px',
        minWidth: '300px',
        disableClose: false, // Allow closing for test
        autoFocus: true,
        hasBackdrop: true,
        data: {
          application: {
            id: 'test-id',
            franchiseName: 'Test Franchise',
            partnerName: 'Test Partner',
            partnerEmail: 'test@example.com'
          }
        }
      });

      console.log('✅ Test dialog opened successfully');

      dialogRef.afterClosed().subscribe(result => {
        console.log('🔄 Test dialog closed with result:', result);
      });
    } catch (error) {
      console.error('❌ Error opening test dialog:', error);
    }
  }
}
