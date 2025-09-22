import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { FranchiseApplication, ApplicationStatus, ApplicationReviewData } from '../../../../core/models/application.model';

@Component({
  selector: 'app-application-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="review-container">
      <div class="header-section">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Review Application</h1>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading application...</p>
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
            <mat-card-subtitle>Application ID: {{ application.id }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Partner:</span>
                <span class="value">{{ application.partnerName }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Email:</span>
                <span class="value">{{ application.partnerEmail }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Investment Capacity:</span>
                <span class="value">{{ formatCurrency(application.financialInfo.investmentCapacity) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Submitted:</span>
                <span class="value">{{ formatDate(application.submittedAt) }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Review Form -->
        <mat-card class="review-form-card">
          <mat-card-header>
            <mat-card-title>Review Decision</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="reviewForm" (ngSubmit)="onSubmitReview()">
              <!-- Review Decision -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Review Decision</mat-label>
                <mat-select formControlName="decision" required>
                  <mat-option value="approve">Approve Application</mat-option>
                  <mat-option value="reject">Reject Application</mat-option>
                  <mat-option value="request_info">Request Additional Information</mat-option>
                </mat-select>
                <mat-error *ngIf="reviewForm.get('decision')?.hasError('required')">
                  Please select a review decision
                </mat-error>
              </mat-form-field>

              <!-- Review Comments -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Review Comments</mat-label>
                <textarea matInput 
                         formControlName="comments"
                         rows="4"
                         placeholder="Enter your review comments and feedback..."></textarea>
                <mat-hint>Provide detailed feedback for the partner</mat-hint>
                <mat-error *ngIf="reviewForm.get('comments')?.hasError('required')">
                  Comments are required
                </mat-error>
              </mat-form-field>

              <!-- Conditional Fields for Approval -->
              <div *ngIf="reviewForm.get('decision')?.value === 'approve'" class="approval-section">
                <h3>Approval Details</h3>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Franchise Fee</mat-label>
                  <input matInput 
                         type="number"
                         formControlName="franchiseFee"
                         placeholder="Enter franchise fee amount">
                  <span matPrefix>₹&nbsp;</span>
                  <mat-error *ngIf="reviewForm.get('franchiseFee')?.hasError('required')">
                    Franchise fee is required for approval
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Territory Assignment</mat-label>
                  <input matInput 
                         formControlName="territory"
                         placeholder="Enter assigned territory">
                  <mat-error *ngIf="reviewForm.get('territory')?.hasError('required')">
                    Territory assignment is required for approval
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Agreement Validity (months)</mat-label>
                  <mat-select formControlName="agreementValidity">
                    <mat-option value="12">12 months</mat-option>
                    <mat-option value="24">24 months</mat-option>
                    <mat-option value="36">36 months</mat-option>
                    <mat-option value="60">60 months</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-checkbox formControlName="generateAgreement" class="full-width">
                  Generate franchise agreement automatically
                </mat-checkbox>
              </div>

              <!-- Conditional Fields for Rejection -->
              <div *ngIf="reviewForm.get('decision')?.value === 'reject'" class="rejection-section">
                <h3>Rejection Details</h3>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Rejection Reason</mat-label>
                  <mat-select formControlName="rejectionReason">
                    <mat-option value="insufficient_funds">Insufficient Financial Capacity</mat-option>
                    <mat-option value="location_unavailable">Preferred Location Unavailable</mat-option>
                    <mat-option value="experience_required">Insufficient Business Experience</mat-option>
                    <mat-option value="documentation_incomplete">Incomplete Documentation</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-checkbox formControlName="offerRefund" class="full-width">
                  Offer full refund of application fee
                </mat-checkbox>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button mat-button type="button" (click)="goBack()">Cancel</button>
                <button mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="reviewForm.invalid || isSubmitting">
                  <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                  <mat-icon *ngIf="!isSubmitting">send</mat-icon>
                  {{ isSubmitting ? 'Processing...' : 'Submit Review' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="quick-actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <button mat-stroked-button (click)="viewApplicationDetails()">
                <mat-icon>visibility</mat-icon>
                View Full Details
              </button>
              <button mat-stroked-button (click)="downloadDocuments()">
                <mat-icon>download</mat-icon>
                Download Documents
              </button>
              <button mat-stroked-button (click)="contactPartner()">
                <mat-icon>email</mat-icon>
                Contact Partner
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .review-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header-section h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
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

    .summary-card, .review-form-card, .quick-actions-card {
      margin-bottom: 24px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-item .label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .summary-item .value {
      font-size: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .approval-section, .rejection-section {
      margin-top: 24px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .approval-section h3, .rejection-section h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .review-container {
        padding: 16px;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class ApplicationReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private mockDataService = inject(MockDataService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  application: FranchiseApplication | null = null;
  isLoading = true;
  isSubmitting = false;

  reviewForm: FormGroup = this.fb.group({
    decision: ['', Validators.required],
    comments: ['', Validators.required],
    franchiseFee: [''],
    territory: [''],
    agreementValidity: ['24'],
    generateAgreement: [true],
    rejectionReason: [''],
    offerRefund: [false]
  });

  ngOnInit() {
    const applicationId = this.route.snapshot.paramMap.get('id');
    if (applicationId) {
      this.loadApplication(applicationId);
    } else {
      this.isLoading = false;
    }

    // Set up conditional validators
    this.reviewForm.get('decision')?.valueChanges.subscribe(decision => {
      this.updateConditionalValidators(decision);
    });
  }

  private loadApplication(applicationId: string) {
    this.mockDataService.getApplicationById(applicationId).subscribe({
      next: (application) => {
        this.application = application;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.snackBar.open('Error loading application', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private updateConditionalValidators(decision: string) {
    const franchiseFeeControl = this.reviewForm.get('franchiseFee');
    const territoryControl = this.reviewForm.get('territory');
    const rejectionReasonControl = this.reviewForm.get('rejectionReason');

    // Clear existing validators
    franchiseFeeControl?.clearValidators();
    territoryControl?.clearValidators();
    rejectionReasonControl?.clearValidators();

    if (decision === 'approve') {
      franchiseFeeControl?.setValidators([Validators.required, Validators.min(1)]);
      territoryControl?.setValidators([Validators.required]);
    } else if (decision === 'reject') {
      rejectionReasonControl?.setValidators([Validators.required]);
    }

    // Update validity
    franchiseFeeControl?.updateValueAndValidity();
    territoryControl?.updateValueAndValidity();
    rejectionReasonControl?.updateValueAndValidity();
  }

  onSubmitReview() {
    if (this.reviewForm.valid && this.application) {
      this.isSubmitting = true;
      const reviewData = this.reviewForm.value;

      // Determine the new status based on decision
      const newStatus = reviewData.decision === 'approve' ?
        ApplicationStatus.APPROVED :
        reviewData.decision === 'reject' ?
          ApplicationStatus.REJECTED :
          ApplicationStatus.UNDER_REVIEW;

      // Prepare review data for service call
      const applicationReviewData = {
        status: newStatus,
        reviewNotes: reviewData.comments,
        rejectionReason: reviewData.decision === 'reject' ? reviewData.rejectionReason : undefined
      };

      console.log('🔍 Submitting application review:', {
        applicationId: this.application.id,
        reviewData: applicationReviewData
      });

      // Call the actual service method to update application status
      this.mockDataService.reviewApplication(this.application.id, applicationReviewData).subscribe({
        next: (updatedApplication) => {
          console.log('✅ Application review submitted successfully:', updatedApplication);

          this.snackBar.open(
            `Application ${reviewData.decision === 'approve' ? 'approved' :
                          reviewData.decision === 'reject' ? 'rejected' :
                          'updated'} successfully`,
            'Close',
            { duration: 3000 }
          );

          this.isSubmitting = false;
          this.router.navigate(['/business/applications']);
        },
        error: (error) => {
          console.error('❌ Error submitting application review:', error);
          this.snackBar.open('Error submitting review. Please try again.', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/business/applications', this.application?.id]);
  }

  viewApplicationDetails() {
    if (this.application) {
      this.router.navigate(['/business/applications', this.application.id]);
    }
  }

  downloadDocuments() {
    this.snackBar.open('Downloading application documents...', 'Close', { duration: 2000 });
  }

  contactPartner() {
    if (this.application) {
      const subject = `Regarding your franchise application - ${this.application.franchiseName}`;
      const body = `Dear ${this.application.partnerName},\n\nWe are reviewing your franchise application for ${this.application.franchiseName}.\n\nBest regards,\nFranchise Team`;
      const mailtoLink = `mailto:${this.application.partnerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
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
}
