import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { FranchiseApplication, ApplicationStatus } from '../../../../core/models/application.model';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'payment' | 'document' | 'communication' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  status?: ApplicationStatus;
  icon: string;
  color: string;
  details?: any;
}

@Component({
  selector: 'app-application-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="timeline-container">
      <div class="header-section">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Application Timeline</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="viewApplicationDetails()">
            <mat-icon>visibility</mat-icon>
            View Details
          </button>
          <button mat-stroked-button (click)="exportTimeline()">
            <mat-icon>download</mat-icon>
            Export Timeline
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading timeline...</p>
      </div>

      <div *ngIf="!isLoading && !application" class="error-container">
        <mat-icon>error_outline</mat-icon>
        <h2>Application Not Found</h2>
        <p>The requested application could not be found.</p>
        <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
      </div>

      <div *ngIf="!isLoading && application" class="content-section">
        <!-- Application Summary -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ application.franchiseName }}</mat-card-title>
            <mat-card-subtitle>Application ID: {{ application.id }} • Partner: {{ application.partnerName }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="current-status">
              <span class="status-label">Current Status:</span>
              <mat-chip [class]="getStatusClass(application.status)">
                <mat-icon>{{ getStatusIcon(application.status) }}</mat-icon>
                {{ getStatusText(application.status) }}
              </mat-chip>
              <span class="status-date">{{ formatDate(application.submittedAt) }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Timeline -->
        <mat-card class="timeline-card">
          <mat-card-header>
            <mat-card-title>Timeline Events</mat-card-title>
            <mat-card-subtitle>{{ timelineEvents.length }} events</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="timeline">
              <div *ngFor="let event of timelineEvents; let i = index" 
                   class="timeline-item"
                   [class.last-item]="i === timelineEvents.length - 1">
                
                <div class="timeline-marker" [style.background-color]="event.color">
                  <mat-icon>{{ event.icon }}</mat-icon>
                </div>
                
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h3 class="timeline-title">{{ event.title }}</h3>
                    <span class="timeline-time">{{ formatDateTime(event.timestamp) }}</span>
                  </div>
                  
                  <p class="timeline-description">{{ event.description }}</p>
                  
                  <!-- Event-specific details -->
                  <div *ngIf="event.details" class="timeline-details">
                    <div *ngIf="event.type === 'payment'" class="payment-details">
                      <div class="detail-item">
                        <span class="label">Amount:</span>
                        <span class="value">{{ formatCurrency(event.details.amount) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Method:</span>
                        <span class="value">{{ event.details.method }}</span>
                      </div>
                      <div class="detail-item" *ngIf="event.details.transactionId">
                        <span class="label">Transaction ID:</span>
                        <span class="value">{{ event.details.transactionId }}</span>
                      </div>
                    </div>
                    
                    <div *ngIf="event.type === 'document'" class="document-details">
                      <div class="detail-item">
                        <span class="label">Document:</span>
                        <span class="value">{{ event.details.documentName }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">Type:</span>
                        <span class="value">{{ event.details.documentType }}</span>
                      </div>
                    </div>
                    
                    <div *ngIf="event.type === 'communication'" class="communication-details">
                      <div class="detail-item">
                        <span class="label">From:</span>
                        <span class="value">{{ event.details.from }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="label">To:</span>
                        <span class="value">{{ event.details.to }}</span>
                      </div>
                      <div class="detail-item" *ngIf="event.details.subject">
                        <span class="label">Subject:</span>
                        <span class="value">{{ event.details.subject }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Statistics -->
        <mat-card class="stats-card">
          <mat-card-header>
            <mat-card-title>Timeline Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ getProcessingDays() }}</span>
                <span class="stat-label">Days in Process</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getStatusChangeCount() }}</span>
                <span class="stat-label">Status Changes</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getPaymentCount() }}</span>
                <span class="stat-label">Payments</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getDocumentCount() }}</span>
                <span class="stat-label">Documents</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      padding: 24px;
      max-width: 1000px;
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

    .summary-card, .timeline-card, .stats-card {
      margin-bottom: 24px;
    }

    .current-status {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .status-label {
      font-weight: 500;
      color: #666;
    }

    .status-date {
      color: #666;
      font-size: 14px;
    }

    .timeline {
      position: relative;
      padding-left: 40px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #e0e0e0;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 32px;
    }

    .timeline-item.last-item {
      margin-bottom: 0;
    }

    .timeline-marker {
      position: absolute;
      left: -28px;
      top: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 1;
    }

    .timeline-marker mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .timeline-content {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-left: 20px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .timeline-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .timeline-time {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
    }

    .timeline-description {
      margin: 0 0 12px 0;
      color: #666;
      line-height: 1.5;
    }

    .timeline-details {
      border-top: 1px solid #f0f0f0;
      padding-top: 12px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .detail-item .label {
      font-weight: 500;
      color: #666;
    }

    .detail-item .value {
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #2196f3;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Status chip styles */
    .status-submitted { background-color: #2196f3; color: white; }
    .status-under-review { background-color: #ff9800; color: white; }
    .status-approved { background-color: #4caf50; color: white; }
    .status-rejected { background-color: #f44336; color: white; }

    @media (max-width: 768px) {
      .timeline-container {
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

      .timeline-header {
        flex-direction: column;
        gap: 4px;
      }

      .current-status {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ApplicationTimelineComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockDataService = inject(MockDataService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);

  application: FranchiseApplication | null = null;
  timelineEvents: TimelineEvent[] = [];
  isLoading = true;

  ngOnInit() {
    const applicationId = this.route.snapshot.paramMap.get('id');
    if (applicationId) {
      this.loadApplication(applicationId);
    } else {
      this.isLoading = false;
    }
  }

  private loadApplication(applicationId: string) {
    this.mockDataService.getApplicationById(applicationId).subscribe({
      next: (application) => {
        this.application = application;
        if (application) {
          this.generateTimelineEvents(application);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.snackBar.open('Error loading application timeline', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private generateTimelineEvents(application: FranchiseApplication) {
    this.timelineEvents = [
      {
        id: '1',
        type: 'status_change',
        title: 'Application Submitted',
        description: `${application.partnerName} submitted their franchise application for ${application.franchiseName}.`,
        timestamp: application.submittedAt,
        status: ApplicationStatus.SUBMITTED,
        icon: 'send',
        color: '#2196f3'
      },
      {
        id: '2',
        type: 'system',
        title: 'Application Received',
        description: 'Application has been received and assigned a unique ID for tracking.',
        timestamp: new Date(application.submittedAt.getTime() + 5 * 60 * 1000), // 5 minutes later
        icon: 'inbox',
        color: '#4caf50'
      },
      {
        id: '3',
        type: 'document',
        title: 'Documents Verified',
        description: 'All submitted documents have been verified and are complete.',
        timestamp: new Date(application.submittedAt.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        icon: 'verified',
        color: '#4caf50',
        details: {
          documentName: 'ID Proof, Financial Statements',
          documentType: 'Identity and Financial Verification'
        }
      },
      {
        id: '4',
        type: 'payment',
        title: 'Application Fee Paid',
        description: 'Application processing fee has been successfully paid.',
        timestamp: new Date(application.submittedAt.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
        icon: 'payment',
        color: '#4caf50',
        details: {
          amount: 5000,
          method: 'UPI',
          transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
      },
      {
        id: '5',
        type: 'status_change',
        title: 'Under Review',
        description: 'Application is now under review by our franchise team.',
        timestamp: new Date(application.submittedAt.getTime() + 24 * 60 * 60 * 1000), // 1 day later
        status: ApplicationStatus.UNDER_REVIEW,
        icon: 'rate_review',
        color: '#ff9800'
      },
      {
        id: '6',
        type: 'communication',
        title: 'Initial Review Completed',
        description: 'Initial review has been completed. Detailed evaluation in progress.',
        timestamp: new Date(application.submittedAt.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
        icon: 'email',
        color: '#2196f3',
        details: {
          from: 'Franchise Team',
          to: application.partnerEmail,
          subject: 'Application Review Update'
        }
      }
    ];

    // Add final status event if approved/rejected
    if (application.status === ApplicationStatus.APPROVED) {
      this.timelineEvents.push({
        id: '7',
        type: 'status_change',
        title: 'Application Approved',
        description: 'Congratulations! Your franchise application has been approved.',
        timestamp: new Date(application.submittedAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        status: ApplicationStatus.APPROVED,
        icon: 'check_circle',
        color: '#4caf50'
      });
    } else if (application.status === ApplicationStatus.REJECTED) {
      this.timelineEvents.push({
        id: '7',
        type: 'status_change',
        title: 'Application Rejected',
        description: 'Unfortunately, your application has been rejected. Please see the detailed feedback.',
        timestamp: new Date(application.submittedAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        status: ApplicationStatus.REJECTED,
        icon: 'cancel',
        color: '#f44336'
      });
    }

    // Sort by timestamp (newest first)
    this.timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  goBack() {
    this.router.navigate(['/business/applications', this.application?.id]);
  }

  viewApplicationDetails() {
    if (this.application) {
      this.router.navigate(['/business/applications', this.application.id]);
    }
  }

  exportTimeline() {
    this.snackBar.open('Exporting timeline...', 'Close', { duration: 2000 });
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

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProcessingDays(): number {
    if (!this.application) return 0;
    const now = new Date();
    const submitted = new Date(this.application.submittedAt);
    return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  }

  getStatusChangeCount(): number {
    return this.timelineEvents.filter(event => event.type === 'status_change').length;
  }

  getPaymentCount(): number {
    return this.timelineEvents.filter(event => event.type === 'payment').length;
  }

  getDocumentCount(): number {
    return this.timelineEvents.filter(event => event.type === 'document').length;
  }
}
