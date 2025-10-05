import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationService } from '../../../../core/services/application.service';

export interface ApprovalDialogData {
  applicationId: string;
  applicantName: string;
  franchiseName: string;
}

@Component({
  selector: 'app-approval-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="primary">check_circle</mat-icon>
      Approve Application
    </h2>
    
    <mat-dialog-content>
      <p>You are about to approve the franchise application for:</p>
      <div class="application-info">
        <strong>Applicant:</strong> {{ data.applicantName }}<br>
        <strong>Franchise:</strong> {{ data.franchiseName }}
      </div>
      
      <form [formGroup]="approvalForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Approval Notes (Optional)</mat-label>
          <textarea matInput 
                    formControlName="notes"
                    rows="4"
                    placeholder="Add any notes or comments about the approval..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button 
              color="primary" 
              (click)="onApprove()"
              [disabled]="isSubmitting">
        <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
        <mat-icon *ngIf="!isSubmitting">check</mat-icon>
        {{ isSubmitting ? 'Approving...' : 'Approve Application' }}
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
export class ApprovalDialogComponent {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private snackBar = inject(MatSnackBar);

  approvalForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<ApprovalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApprovalDialogData
  ) {
    this.approvalForm = this.fb.group({
      notes: ['']
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onApprove() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const notes = this.approvalForm.get('notes')?.value || '';

    this.applicationService.approveApplication(this.data.applicationId, notes).subscribe({
      next: (updatedApplication) => {
        console.log('✅ Application approved successfully:', updatedApplication);
        this.dialogRef.close({ success: true, notes });
      },
      error: (error) => {
        console.error('❌ Error approving application:', error);
        this.snackBar.open('Error approving application. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }
}
