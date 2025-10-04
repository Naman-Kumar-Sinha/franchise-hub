import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { Franchise } from '../../../../core/models/franchise.model';
import { CurrencyService } from '../../../../core/services/currency.service';

export interface FranchiseDetailsDialogData {
  franchise: Franchise;
  mode?: 'business' | 'partner'; // business = show edit button, partner = show apply button
}

@Component({
  selector: 'app-franchise-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="franchise-details-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="header-content">
          <mat-icon class="franchise-icon">business</mat-icon>
          <div class="header-text">
            <h2>{{franchise.name}}</h2>
            <p>{{franchise.category}} • {{franchise.businessOwnerName}}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <!-- Basic Information -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Basic Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Description:</span>
                <span class="value">{{franchise.description}}</span>
              </div>
              <div class="info-item">
                <span class="label">Year Established:</span>
                <span class="value">{{franchise.yearEstablished}}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                <mat-chip [color]="franchise.isActive ? 'primary' : 'warn'" selected>
                  {{franchise.isActive ? 'Active' : 'Inactive'}}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Financial Information -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Financial Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Franchise Fee:</span>
                <span class="value">{{formatCurrency(franchise.franchiseFee)}}</span>
              </div>
              <div class="info-item">
                <span class="label">Royalty Fee:</span>
                <span class="value">{{franchise.royaltyFee}}%</span>
              </div>
              <div class="info-item">
                <span class="label">Marketing Fee:</span>
                <span class="value">{{franchise.marketingFee}}%</span>
              </div>
              <div class="info-item">
                <span class="label">Initial Investment:</span>
                <span class="value">{{formatCurrency(franchise.initialInvestment.min)}} - {{formatCurrency(franchise.initialInvestment.max)}}</span>
              </div>
              <div class="info-item">
                <span class="label">Liquid Capital Required:</span>
                <span class="value">{{formatCurrency(franchise.liquidCapitalRequired)}}</span>
              </div>
              <div class="info-item">
                <span class="label">Net Worth Required:</span>
                <span class="value">{{formatCurrency(franchise.netWorthRequired)}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Business Details -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Business Details</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Total Units:</span>
                <span class="value">{{franchise.totalUnits}}</span>
              </div>
              <div class="info-item">
                <span class="label">Franchised Units:</span>
                <span class="value">{{franchise.franchisedUnits}}</span>
              </div>
              <div class="info-item">
                <span class="label">Company Owned Units:</span>
                <span class="value">{{franchise.companyOwnedUnits}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Requirements -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Requirements</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Experience:</span>
                <span class="value">{{franchise.requirements.experience}}</span>
              </div>
              <div class="info-item">
                <span class="label">Education:</span>
                <span class="value">{{franchise.requirements.education}}</span>
              </div>
              <div class="info-item">
                <span class="label">Credit Score:</span>
                <span class="value">{{franchise.requirements.creditScore}}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">Background Requirements:</span>
                <div class="chips-container">
                  <mat-chip *ngFor="let requirement of franchise.requirements.background">
                    {{requirement}}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Support & Training -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Support & Training</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Training:</span>
                <span class="value">{{franchise.support.training}}</span>
              </div>
              <div class="info-item">
                <span class="label">Marketing:</span>
                <span class="value">{{franchise.support.marketing}}</span>
              </div>
              <div class="info-item">
                <span class="label">Operations:</span>
                <span class="value">{{franchise.support.operations}}</span>
              </div>
              <div class="info-item">
                <span class="label">Technology:</span>
                <span class="value">{{franchise.support.technology}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Territory Information -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Territory & Availability</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item full-width">
                <span class="label">Territories:</span>
                <div class="chips-container">
                  <mat-chip *ngFor="let territory of franchise.territories">
                    {{territory}}
                  </mat-chip>
                </div>
              </div>
              <div class="info-item full-width">
                <span class="label">Available States:</span>
                <div class="chips-container">
                  <mat-chip *ngFor="let state of franchise.availableStates">
                    {{state}}
                  </mat-chip>
                </div>
              </div>
              <div class="info-item">
                <span class="label">International Opportunities:</span>
                <span class="value">{{franchise.internationalOpportunities ? 'Yes' : 'No'}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Contact Information -->
        <mat-card class="info-section">
          <mat-card-header>
            <mat-card-title>Contact Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Phone:</span>
                <span class="value">{{franchise.contactInfo.phone}}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{franchise.contactInfo.email}}</span>
              </div>
              <div class="info-item">
                <span class="label">Website:</span>
                <span class="value">{{franchise.contactInfo.website}}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">Address:</span>
                <span class="value">{{franchise.contactInfo.address}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Close</button>
        <button *ngIf="data.mode === 'business' || !data.mode" mat-raised-button color="primary" (click)="editFranchise()">
          <mat-icon>edit</mat-icon>
          Edit Franchise
        </button>
        <button *ngIf="data.mode === 'partner'" mat-raised-button color="primary" (click)="applyToFranchise()">
          <mat-icon>send</mat-icon>
          Apply Now
        </button>
      </div>
    </div>
  `,
  styles: [`
    .franchise-details-dialog {
      max-width: 800px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .franchise-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-text p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 24px;
    }

    .info-section:last-child {
      margin-bottom: 0;
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

    .label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .value {
      color: #666;
      font-size: 0.95rem;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .dialog-header {
        padding: 16px;
      }
      
      .dialog-content {
        padding: 16px;
      }
    }
  `]
})
export class FranchiseDetailsDialogComponent {
  franchise: Franchise;

  constructor(
    public dialogRef: MatDialogRef<FranchiseDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FranchiseDetailsDialogData,
    private currencyService: CurrencyService
  ) {
    this.franchise = data.franchise;
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  editFranchise(): void {
    this.dialogRef.close({ action: 'edit', franchise: this.franchise });
  }

  applyToFranchise(): void {
    this.dialogRef.close({ action: 'apply', franchise: this.franchise });
  }
}
