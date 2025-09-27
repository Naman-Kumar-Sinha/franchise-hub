import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Franchise, FranchiseCategory, FranchiseFormData } from '../../../../core/models/franchise.model';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { FranchiseService } from '../../../../core/services/franchise.service';

export interface FranchiseDialogData {
  franchise?: Franchise;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-franchise-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="franchise-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'create' ? 'add_business' : 'edit_business' }}</mat-icon>
        {{ data.mode === 'create' ? 'Create New Franchise' : 'Edit Franchise' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="franchiseForm" class="franchise-form">
          <mat-stepper #stepper orientation="vertical" linear>
            
            <!-- Step 1: Basic Information -->
            <mat-step [stepControl]="basicInfoGroup" label="Basic Information">
              <div formGroupName="basicInfo" class="step-content">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Franchise Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter franchise name">
                    <mat-error *ngIf="basicInfoGroup.get('name')?.hasError('required')">
                      Franchise name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3" 
                              placeholder="Describe your franchise opportunity"></textarea>
                    <mat-error *ngIf="basicInfoGroup.get('description')?.hasError('required')">
                      Description is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Category</mat-label>
                    <mat-select formControlName="category">
                      <mat-option *ngFor="let category of categories" [value]="category.value">
                        {{category.label}}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="basicInfoGroup.get('category')?.hasError('required')">
                      Category is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Year Established</mat-label>
                    <input matInput type="number" formControlName="yearEstablished" 
                           placeholder="e.g., 2020" min="1900" [max]="currentYear">
                    <mat-error *ngIf="basicInfoGroup.get('yearEstablished')?.hasError('required')">
                      Year established is required
                    </mat-error>
                    <mat-error *ngIf="basicInfoGroup.get('yearEstablished')?.hasError('min')">
                      Year must be 1900 or later
                    </mat-error>
                    <mat-error *ngIf="basicInfoGroup.get('yearEstablished')?.hasError('max')">
                      Year cannot be in the future
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperNext type="button">Next</button>
                </div>
              </div>
            </mat-step>

            <!-- Step 2: Financial Details -->
            <mat-step [stepControl]="financialGroup" label="Financial Details">
              <div formGroupName="financial" class="step-content">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Franchise Fee</mat-label>
                    <input matInput type="number" formControlName="franchiseFee"
                           placeholder="0" min="0">
                    <span matPrefix>₹</span>
                    <mat-error *ngIf="financialGroup.get('franchiseFee')?.hasError('required')">
                      Franchise fee is required
                    </mat-error>
                    <mat-error *ngIf="financialGroup.get('franchiseFee')?.hasError('min')">
                      Fee must be 0 or greater
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Royalty Fee (%)</mat-label>
                    <input matInput type="number" formControlName="royaltyFee" 
                           placeholder="0" min="0" max="100" step="0.1">
                    <span matSuffix>%</span>
                    <mat-error *ngIf="financialGroup.get('royaltyFee')?.hasError('required')">
                      Royalty fee is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Marketing Fee (%)</mat-label>
                    <input matInput type="number" formControlName="marketingFee" 
                           placeholder="0" min="0" max="100" step="0.1">
                    <span matSuffix>%</span>
                    <mat-error *ngIf="financialGroup.get('marketingFee')?.hasError('required')">
                      Marketing fee is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Liquid Capital Required</mat-label>
                    <input matInput type="number" formControlName="liquidCapitalRequired"
                           placeholder="0" min="0">
                    <span matPrefix>₹</span>
                    <mat-error *ngIf="financialGroup.get('liquidCapitalRequired')?.hasError('required')">
                      Liquid capital requirement is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Net Worth Required</mat-label>
                    <input matInput type="number" formControlName="netWorthRequired"
                           placeholder="0" min="0">
                    <span matPrefix>₹</span>
                    <mat-error *ngIf="financialGroup.get('netWorthRequired')?.hasError('required')">
                      Net worth requirement is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">Back</button>
                  <button mat-button matStepperNext type="button">Next</button>
                </div>
              </div>
            </mat-step>

            <!-- Step 3: Investment Range -->
            <mat-step [stepControl]="investmentGroup" label="Investment Range">
              <div formGroupName="investment" class="step-content">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Minimum Investment</mat-label>
                    <input matInput type="number" formControlName="min"
                           placeholder="0" min="0">
                    <span matPrefix>₹</span>
                    <mat-error *ngIf="investmentGroup.get('min')?.hasError('required')">
                      Minimum investment is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Maximum Investment</mat-label>
                    <input matInput type="number" formControlName="max"
                           placeholder="0" min="0">
                    <span matPrefix>₹</span>
                    <!-- Maximum investment is now optional -->
                    <mat-error *ngIf="investmentGroup.hasError('invalidRange')">
                      Maximum must be greater than minimum
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">Back</button>
                  <button mat-button matStepperNext type="button">Next</button>
                </div>
              </div>
            </mat-step>

            <!-- Step 4: Requirements -->
            <mat-step [stepControl]="requirementsGroup" label="Requirements">
              <div formGroupName="requirements" class="step-content">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Experience Required</mat-label>
                    <textarea matInput formControlName="experience" rows="2" 
                              placeholder="Describe experience requirements"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Time Commitment</mat-label>
                    <textarea matInput formControlName="timeCommitment" rows="2" 
                              placeholder="Describe time commitment expectations"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Location Requirements</mat-label>
                    <textarea matInput formControlName="location" rows="2" 
                              placeholder="Describe location requirements"></textarea>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">Back</button>
                  <button mat-button matStepperNext type="button">Next</button>
                </div>
              </div>
            </mat-step>

            <!-- Step 5: Support & Territory -->
            <mat-step [stepControl]="supportGroup" label="Support & Territory">
              <div formGroupName="support" class="step-content">
                <h4>Support Offered</h4>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Training Support</mat-label>
                    <textarea matInput formControlName="training" rows="2" 
                              placeholder="Describe training support provided"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Marketing Support</mat-label>
                    <textarea matInput formControlName="marketing" rows="2" 
                              placeholder="Describe marketing support provided"></textarea>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Operations Support</mat-label>
                    <textarea matInput formControlName="operations" rows="2" 
                              placeholder="Describe operations support provided"></textarea>
                  </mat-form-field>
                </div>

                <h4>Territory Information</h4>
                <div formGroupName="territory">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Territory Radius (miles)</mat-label>
                      <input matInput type="number" formControlName="radius" 
                             placeholder="0" min="0">
                      <span matSuffix>miles</span>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Population Requirement</mat-label>
                      <input matInput type="number" formControlName="population" 
                             placeholder="0" min="0">
                      <span matSuffix>people</span>
                    </mat-form-field>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">Back</button>
                </div>
              </div>
            </mat-step>

          </mat-stepper>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isLoading">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" 
                [disabled]="!franchiseForm.valid || isLoading">
          <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          <span *ngIf="!isLoading">{{ data.mode === 'create' ? 'Create Franchise' : 'Update Franchise' }}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .franchise-dialog {
      width: 100%;
      max-width: 800px;
    }

    .franchise-form {
      padding: 0;
    }

    .step-content {
      padding: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .step-actions {
      margin-top: 24px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    h4 {
      margin: 16px 0 8px 0;
      color: #333;
      font-weight: 500;
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

    mat-spinner {
      margin-right: 8px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .franchise-dialog {
        max-width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      mat-dialog-content {
        max-height: 60vh;
      }
    }
  `]
})
export class FranchiseDialogComponent implements OnInit {
  franchiseForm!: FormGroup;
  isLoading = false;
  currentYear = new Date().getFullYear();

  categories = [
    { value: 'FOOD_BEVERAGE', label: 'Food & Beverage' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'HEALTH_FITNESS', label: 'Health & Fitness' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'AUTOMOTIVE', label: 'Automotive' },
    { value: 'REAL_ESTATE', label: 'Real Estate' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FranchiseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FranchiseDialogData,
    private mockDataService: MockDataService,
    private franchiseService: FranchiseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    // Enable edit mode functionality
    if (this.data.mode === 'edit' && this.data.franchise) {
      this.populateForm(this.data.franchise);
    }
  }

  get basicInfoGroup() { return this.franchiseForm.get('basicInfo') as FormGroup; }
  get financialGroup() { return this.franchiseForm.get('financial') as FormGroup; }
  get investmentGroup() { return this.franchiseForm.get('investment') as FormGroup; }
  get requirementsGroup() { return this.franchiseForm.get('requirements') as FormGroup; }
  get supportGroup() { return this.franchiseForm.get('support') as FormGroup; }

  private initializeForm() {
    this.franchiseForm = this.fb.group({
      basicInfo: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        description: ['', [Validators.required, Validators.minLength(10)]],
        category: ['', Validators.required],
        yearEstablished: ['', [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]]
      }),
      financial: this.fb.group({
        franchiseFee: ['', [Validators.required, Validators.min(0)]],
        royaltyFee: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
        marketingFee: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
        liquidCapitalRequired: ['', [Validators.required, Validators.min(0)]],
        netWorthRequired: ['', [Validators.required, Validators.min(0)]]
      }),
      investment: this.fb.group({
        min: ['', [Validators.required, Validators.min(0)]],
        max: ['', [Validators.min(0)]]  // Made optional
      }, { validators: this.investmentRangeValidator }),
      requirements: this.fb.group({
        experience: [''],
        timeCommitment: [''],
        location: ['']
      }),
      support: this.fb.group({
        training: [''],
        marketing: [''],
        operations: [''],
        territory: this.fb.group({
          radius: [0, [Validators.min(0)]],
          population: [0, [Validators.min(0)]]
        })
      })
    });
  }

  private investmentRangeValidator(group: FormGroup) {
    const min = group.get('min')?.value;
    const max = group.get('max')?.value;

    if (min && max && min >= max) {
      return { invalidRange: true };
    }
    return null;
  }

  private populateForm(franchise: Franchise) {
    this.franchiseForm.patchValue({
      basicInfo: {
        name: franchise.name,
        description: franchise.description,
        category: franchise.category,
        yearEstablished: franchise.yearEstablished
      },
      financial: {
        franchiseFee: franchise.franchiseFee,
        royaltyFee: franchise.royaltyFee,
        marketingFee: franchise.marketingFee,
        liquidCapitalRequired: franchise.liquidCapitalRequired,
        netWorthRequired: franchise.netWorthRequired
      },
      investment: {
        min: franchise.initialInvestment.min,
        max: franchise.initialInvestment.max
      },
      requirements: {
        experience: franchise.requirements.experience,
        timeCommitment: 'Full-time commitment expected',
        location: 'Various locations available'
      },
      support: {
        training: franchise.support.training,
        marketing: franchise.support.marketing,
        operations: franchise.support.operations,
        territory: {
          radius: 5,
          population: 50000
        }
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.franchiseForm.valid) {
      this.isLoading = true;

      if (this.data.mode === 'edit' && this.data.franchise) {
        // Edit mode: update existing franchise
        const formData = this.buildFranchiseData();

        console.log('🚀 Updating franchise with data:', formData);

        // Use FranchiseService which handles hybrid authentication strategy
        this.franchiseService.updateFranchise(this.data.franchise.id, formData).subscribe({
          next: (franchise) => {
            this.isLoading = false;
            console.log('✅ Franchise updated successfully:', franchise);
            this.snackBar.open('Franchise updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.dialogRef.close(franchise);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('❌ Error updating franchise:', error);
            this.snackBar.open('Error updating franchise. Please try again.', 'Close', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        });
      } else {
        // Create mode: create new franchise
        const formData = this.buildFranchiseData();
        console.log('🚀 Creating franchise with data:', formData);

        // Use FranchiseService which handles hybrid authentication strategy
        this.franchiseService.createFranchise(formData).subscribe({
          next: (newFranchise) => {
            this.isLoading = false;
            console.log('✅ Franchise created successfully:', newFranchise);
            this.snackBar.open('Franchise created successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.dialogRef.close(newFranchise);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('❌ Error creating franchise:', error);
            this.snackBar.open('Error creating franchise. Please try again.', 'Close', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.franchiseForm);
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  private buildFranchiseData(): FranchiseFormData {
    const formValue = this.franchiseForm.value;

    return {
      name: formValue.basicInfo.name,
      description: formValue.basicInfo.description,
      category: formValue.basicInfo.category as FranchiseCategory,
      franchiseFee: formValue.financial.franchiseFee,
      royaltyFee: formValue.financial.royaltyFee,
      marketingFee: formValue.financial.marketingFee,
      initialInvestment: {
        min: formValue.investment.min,
        max: formValue.investment.max
      },
      liquidCapitalRequired: formValue.financial.liquidCapitalRequired,
      netWorthRequired: formValue.financial.netWorthRequired,
      yearEstablished: formValue.basicInfo.yearEstablished,
      requirements: {
        experience: formValue.requirements.experience || 'No specific experience required',
        timeCommitment: formValue.requirements.timeCommitment || 'Full-time commitment expected',
        location: formValue.requirements.location || 'Various locations available'
      },
      support: {
        training: formValue.support.training || 'Comprehensive training provided',
        marketing: formValue.support.marketing || 'Marketing support included',
        operations: formValue.support.operations || 'Ongoing operations support'
      },
      territory: {
        exclusive: true, // Default to exclusive territory
        radius: formValue.support.territory.radius || 5,
        population: formValue.support.territory.population || 50000
      }
    };
  }

  private buildFranchiseDataForUpdate(): Partial<Franchise> {
    const formValue = this.franchiseForm.value;

    return {
      name: formValue.basicInfo.name,
      description: formValue.basicInfo.description,
      category: formValue.basicInfo.category as FranchiseCategory,
      franchiseFee: formValue.financial.franchiseFee,
      royaltyFee: formValue.financial.royaltyFee,
      marketingFee: formValue.financial.marketingFee,
      initialInvestment: {
        min: formValue.investment.min,
        max: formValue.investment.max
      },
      liquidCapitalRequired: formValue.financial.liquidCapitalRequired,
      netWorthRequired: formValue.financial.netWorthRequired,
      yearEstablished: formValue.basicInfo.yearEstablished,
      requirements: {
        experience: formValue.requirements.experience || 'No specific experience required',
        education: this.data.franchise?.requirements.education || 'High school diploma required',
        creditScore: this.data.franchise?.requirements.creditScore || 650,
        background: this.data.franchise?.requirements.background || ['Clean criminal record']
      },
      support: {
        training: formValue.support.training || 'Comprehensive training provided',
        marketing: formValue.support.marketing || 'Marketing support included',
        operations: formValue.support.operations || 'Ongoing operations support',
        technology: this.data.franchise?.support.technology || 'Technology support included'
      }
    };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
