import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-test-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>bug_report</mat-icon>
      Test Dialog
    </h2>

    <mat-dialog-content>
      <p>This is a simple test dialog to verify Material Dialog is working.</p>
      <p>Application: {{ data?.application?.franchiseName || 'No application' }}</p>
      <p>If you can see this dialog properly, the basic dialog system is working.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onOk()">OK</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px;
      min-width: 300px;
    }
    
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class TestDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('🧪 TestDialogComponent constructor called');
    console.log('📋 Test dialog data:', this.data);
  }

  onCancel() {
    console.log('❌ Test dialog cancelled');
    this.dialogRef.close();
  }

  onOk() {
    console.log('✅ Test dialog confirmed');
    this.dialogRef.close('confirmed');
  }
}
