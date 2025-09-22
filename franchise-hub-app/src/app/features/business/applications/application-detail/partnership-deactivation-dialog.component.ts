import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { FranchiseApplication, DeactivationReason } from '../../../../core/models/application.model';

export interface PartnershipDeactivationDialogData {
  application: FranchiseApplication;
}

@Component({
  selector: 'app-partnership-deactivation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">block</mat-icon>
      Deactivate Partnership
    </h2>

    <mat-dialog-content>
        <div class="warning-notice">
          <mat-icon>warning</mat-icon>
          <div>
            <h4>Warning: This action cannot be undone</h4>
            <p>Deactivating this partnership will change the application status and notify the partner immediately.</p>
          </div>
        </div>

        <div class="application-info">
          <h3>{{ data.application.franchiseName || 'Unknown Franchise' }}</h3>
          <p>Partner: {{ data.application.partnerName || 'Unknown' }} ({{ data.application.partnerEmail || 'No email' }})</p>
          <p>Partnership since: {{ formatDate(data.application.submittedAt) }}</p>
        </div>

        <form [formGroup]="deactivationForm" class="deactivation-form" *ngIf="deactivationForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Deactivation</mat-label>
            <mat-select formControlName="reason" required>
              <mat-option value="PERFORMANCE_ISSUES">Performance Issues</mat-option>
              <mat-option value="CONTRACT_VIOLATION">Contract Violation</mat-option>
              <mat-option value="MUTUAL_AGREEMENT">Mutual Agreement</mat-option>
              <mat-option value="OTHER">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="deactivationForm.get('reason')?.hasError('required')">
              Please select a reason for deactivation
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Notes</mat-label>
            <textarea matInput 
                      formControlName="notes"
                      placeholder="Provide additional details about the deactivation (optional)"
                      rows="4"
                      maxlength="1000"></textarea>
            <mat-hint>{{ (deactivationForm.get('notes')?.value?.length || 0) }}/1000</mat-hint>
          </mat-form-field>
        </form>

        <div class="consequences">
          <h4>What happens next:</h4>
          <ul>
            <li>Partnership status will change to "Deactivated"</li>
            <li>Partner will receive an immediate notification</li>
            <li>Partner will see deactivation details in their dashboard</li>
            <li>Partner can contact you through the platform if needed</li>
          </ul>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="warn" 
                (click)="onConfirm()"
                [disabled]="deactivationForm.invalid || isSubmitting">
          <mat-icon *ngIf="!isSubmitting">block</mat-icon>
          <mat-icon *ngIf="isSubmitting" class="spinning">hourglass_empty</mat-icon>
          {{ isSubmitting ? 'Deactivating...' : 'Deactivate Partnership' }}
        </button>
      </mat-dialog-actions>
  `,
  styles: [`
    .deactivation-dialog {
      width: 600px;
      max-width: 90vw;
    }

    .warning-notice {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .warning-notice mat-icon {
      color: #856404;
      margin-top: 2px;
    }

    .warning-notice h4 {
      margin: 0 0 4px 0;
      color: #856404;
      font-size: 16px;
    }

    .warning-notice p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }

    .application-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .application-info h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .application-info p {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 14px;
    }

    .application-info p:last-child {
      margin-bottom: 0;
    }

    .deactivation-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .full-width {
      width: 100%;
    }

    .consequences {
      background-color: #e8f5e8;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #4caf50;
    }

    .consequences h4 {
      margin: 0 0 12px 0;
      color: #2e7d32;
    }

    .consequences ul {
      margin: 0;
      padding-left: 20px;
      color: #2e7d32;
    }

    .consequences li {
      margin-bottom: 4px;
      font-size: 14px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
  `]
})
export class PartnershipDeactivationDialogComponent {
  private fb = inject(FormBuilder);
  private mockDataService = inject(MockDataService);
  private snackBar = inject(MatSnackBar);

  deactivationForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<PartnershipDeactivationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PartnershipDeactivationDialogData
  ) {
    console.log('🎯 PartnershipDeactivationDialogComponent constructor called');
    console.log('📋 Dialog data:', this.data);

    try {
      this.deactivationForm = this.fb.group({
        reason: ['', [Validators.required]],
        notes: ['', [Validators.maxLength(1000)]]
      });

      console.log('✅ Deactivation form initialized:', this.deactivationForm);
    } catch (error) {
      console.error('❌ Error initializing deactivation form:', error);
      this.deactivationForm = this.fb.group({
        reason: [''],
        notes: ['']
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    if (this.deactivationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const { reason, notes } = this.deactivationForm.value;

      this.mockDataService.deactivatePartnership(
        this.data.application.id,
        reason,
        notes
      ).subscribe({
        next: (updatedApplication) => {
          this.isSubmitting = false;
          this.snackBar.open('Partnership deactivated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(updatedApplication);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error deactivating partnership:', error);
          this.snackBar.open('Failed to deactivate partnership. Please try again.', 'Close', { duration: 5000 });
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    try {
      if (!date) {
        return 'Unknown date';
      }
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  }
}
