import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

import { FranchiseApplication, ApplicationStatus, PaymentStatus } from '../../../../core/models/application.model';

@Component({
  selector: 'app-application-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Application Details</h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="application-overview">
        <h3>{{ data.application.franchiseName }}</h3>
        <div class="status-info">
          <mat-chip [color]="getStatusColor(data.application.status)" selected>
            {{ getStatusText(data.application.status) }}
          </mat-chip>
          <mat-chip [color]="getPaymentStatusColor(data.application.paymentStatus)" selected>
            {{ getPaymentStatusText(data.application.paymentStatus) }}
          </mat-chip>
        </div>
      </div>

      <mat-tab-group>
        <!-- Personal Information Tab -->
        <mat-tab label="Personal Info">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Personal Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <strong>Name:</strong>
                    <span>{{ data.application.personalInfo.firstName }} {{ data.application.personalInfo.lastName }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Email:</strong>
                    <span>{{ data.application.personalInfo.email }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Phone:</strong>
                    <span>{{ data.application.personalInfo.phone }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Date of Birth:</strong>
                    <span>{{ formatDate(data.application.personalInfo.dateOfBirth) }}</span>
                  </div>
                  <div class="info-item full-width">
                    <strong>Address:</strong>
                    <span>{{ data.application.personalInfo.address }}, {{ data.application.personalInfo.city }}, {{ data.application.personalInfo.state }} - {{ data.application.personalInfo.zipCode }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Financial Information Tab -->
        <mat-tab label="Financial Info">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Financial Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <strong>Net Worth:</strong>
                    <span>₹{{ formatCurrency(data.application.financialInfo.netWorth) }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Liquid Capital:</strong>
                    <span>₹{{ formatCurrency(data.application.financialInfo.liquidCapital) }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Investment Capacity:</strong>
                    <span>₹{{ formatCurrency(data.application.financialInfo.investmentCapacity) }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Credit Score:</strong>
                    <span>{{ data.application.financialInfo.creditScore || 'Not provided' }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Business Experience:</strong>
                    <span>{{ data.application.financialInfo.hasBusinessExperience ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="info-item" *ngIf="data.application.financialInfo.hasBusinessExperience">
                    <strong>Experience Details:</strong>
                    <span>{{ data.application.financialInfo.businessExperienceDetails }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Business Preferences Tab -->
        <mat-tab label="Business Info">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Business Preferences</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item full-width">
                    <strong>Preferred Location:</strong>
                    <span>{{ data.application.businessInfo.preferredLocation.address }}, {{ data.application.businessInfo.preferredLocation.city }}, {{ data.application.businessInfo.preferredLocation.state }} - {{ data.application.businessInfo.preferredLocation.zipCode }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Timeline to Open:</strong>
                    <span>{{ data.application.businessInfo.timelineToOpen }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Full-time Commitment:</strong>
                    <span>{{ data.application.businessInfo.fullTimeCommitment ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Has Partners:</strong>
                    <span>{{ data.application.businessInfo.hasPartners ? 'Yes' : 'No' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Application Details Tab -->
        <mat-tab label="Application">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Application Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <strong>Application Fee:</strong>
                    <span>₹{{ formatCurrency(data.application.applicationFee) }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Submitted Date:</strong>
                    <span>{{ formatDate(data.application.submittedAt) }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Last Updated:</strong>
                    <span>{{ formatDate(data.application.updatedAt) }}</span>
                  </div>
                  <div class="info-item" *ngIf="data.application.motivation">
                    <strong>Motivation:</strong>
                    <span>{{ data.application.motivation }}</span>
                  </div>
                  <div class="info-item" *ngIf="data.application.questions">
                    <strong>Questions:</strong>
                    <span>{{ data.application.questions }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0;
    }

    .application-overview {
      margin-bottom: 24px;
    }

    .application-overview h3 {
      margin: 0 0 12px 0;
      color: #1976d2;
    }

    .status-info {
      display: flex;
      gap: 8px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
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

    .info-item strong {
      font-weight: 500;
      color: #666;
      font-size: 0.9em;
    }

    .info-item span {
      font-weight: 400;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
  `]
})
export class ApplicationDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ApplicationDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { application: FranchiseApplication }
  ) {}

  getStatusColor(status: ApplicationStatus): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case ApplicationStatus.APPROVED: return 'primary';
      case ApplicationStatus.UNDER_REVIEW: return 'accent';
      case ApplicationStatus.REJECTED: return 'warn';
      default: return 'accent';
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

  getPaymentStatusColor(status: PaymentStatus): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case PaymentStatus.COMPLETED: return 'primary';
      case PaymentStatus.PENDING: return 'accent';
      case PaymentStatus.FAILED: return 'warn';
      default: return 'accent';
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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }
}
