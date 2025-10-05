import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationService } from '../../../../core/services/application.service';

export interface RejectionDialogData {
  applicationId: string;
  applicantName: string;
  franchiseName: string;
}

const REJECTION_REASONS = [
  'Insufficient financial qualifications',
  'Incomplete documentation',
  'Location not suitable',
  'Experience requirements not met',
  'Background check issues',
  'Business plan inadequate',
  'Other'
];

@Component({
  selector: 'app-rejection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">cancel</mat-icon>
      Reject Application
    </h2>
    
    <mat-dialog-content>
      <p>You are about to reject the franchise application for:</p>
      <div class="application-info">
        <strong>Applicant:</strong> {{ data.applicantName }}<br>
        <strong>Franchise:</strong> {{ data.franchiseName }}
      </div>
      
      <form [formGroup]="rejectionForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rejection Reason *</mat-label>
          <mat-select formControlName="reason" required>
            <mat-option *ngFor="let reason of rejectionReasons" [value]="reason">
              {{ reason }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="rejectionForm.get('reason')?.hasError('required')">
            Please select a rejection reason
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Additional Notes (Optional)</mat-label>
          <textarea matInput 
                    formControlName="notes"
                    rows="4"
                    placeholder="Add any additional details about the rejection..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button 
              color="warn" 
              (click)="onReject()"
              [disabled]="rejectionForm.invalid || isSubmitting">
        <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
        <mat-icon *ngIf="!isSubmitting">close</mat-icon>
        {{ isSubmitting ? 'Rejecting...' : 'Reject Application' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .application-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin: 16px 0;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class RejectionDialogComponent {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private snackBar = inject(MatSnackBar);

  rejectionForm: FormGroup;
  isSubmitting = false;
  rejectionReasons = REJECTION_REASONS;

  constructor(
    public dialogRef: MatDialogRef<RejectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectionDialogData
  ) {
    this.rejectionForm = this.fb.group({
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onReject() {
    if (this.rejectionForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const reason = this.rejectionForm.get('reason')?.value;
    const notes = this.rejectionForm.get('notes')?.value || '';

    this.applicationService.rejectApplication(this.data.applicationId, reason, notes).subscribe({
      next: (updatedApplication) => {
        console.log('❌ Application rejected successfully:', updatedApplication);
        this.dialogRef.close({ success: true, reason, notes });
      },
      error: (error) => {
        console.error('❌ Error rejecting application:', error);
        this.snackBar.open('Error rejecting application. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }
}
