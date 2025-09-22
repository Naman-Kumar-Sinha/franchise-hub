import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';

import { MockDataService } from '../../../../core/services/mock-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { Franchise } from '../../../../core/models/franchise.model';
import { ApplicationCreateData, DocumentType } from '../../../../core/models/application.model';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="application-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assignment</mat-icon>
            Apply for {{ franchise?.name || 'Franchise' }}
          </mat-card-title>
          <mat-card-subtitle>
            Complete your franchise application in a few simple steps
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper #stepper orientation="vertical" linear>
            <!-- Step 1: Personal Information -->
            <mat-step [stepControl]="personalInfoForm" label="Personal Information">
              <form [formGroup]="personalInfoForm">
                <div class="form-section">
                  <h3>Personal Details</h3>
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-error *ngIf="personalInfoForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" required>
                      <mat-error *ngIf="personalInfoForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" required>
                      <mat-error *ngIf="personalInfoForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="personalInfoForm.get('email')?.hasError('email')">
                        Please enter a valid email
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" required>
                      <mat-error *ngIf="personalInfoForm.get('phone')?.hasError('required')">
                        Phone number is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth" required>
                    <mat-datepicker-toggle matSuffix [for]="dobPicker"></mat-datepicker-toggle>
                    <mat-datepicker #dobPicker></mat-datepicker>
                    <mat-error *ngIf="personalInfoForm.get('dateOfBirth')?.hasError('required')">
                      Date of birth is required
                    </mat-error>
                  </mat-form-field>

                  <h4>Address Information</h4>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Street Address</mat-label>
                    <input matInput formControlName="address" required>
                    <mat-error *ngIf="personalInfoForm.get('address')?.hasError('required')">
                      Address is required
                    </mat-error>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>City</mat-label>
                      <input matInput formControlName="city" required>
                      <mat-error *ngIf="personalInfoForm.get('city')?.hasError('required')">
                        City is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>State</mat-label>
                      <mat-select formControlName="state" required>
                        <mat-option *ngFor="let state of indianStates" [value]="state.code">
                          {{ state.name }}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="personalInfoForm.get('state')?.hasError('required')">
                        State is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>PIN Code</mat-label>
                      <input matInput formControlName="zipCode" pattern="[0-9]{6}" required>
                      <mat-error *ngIf="personalInfoForm.get('zipCode')?.hasError('required')">
                        PIN code is required
                      </mat-error>
                      <mat-error *ngIf="personalInfoForm.get('zipCode')?.hasError('pattern')">
                        Please enter a valid 6-digit PIN code
                      </mat-error>
                    </mat-form-field>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-raised-button color="primary" matStepperNext 
                          [disabled]="!personalInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Financial Information -->
            <mat-step [stepControl]="financialInfoForm" label="Financial Information">
              <form [formGroup]="financialInfoForm">
                <div class="form-section">
                  <h3>Financial Details</h3>
                  <p class="section-description">
                    Please provide accurate financial information to help us assess your application.
                  </p>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Net Worth (₹)</mat-label>
                      <input matInput type="number" formControlName="netWorth" required>
                      <mat-error *ngIf="financialInfoForm.get('netWorth')?.hasError('required')">
                        Net worth is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Liquid Capital Available (₹)</mat-label>
                      <input matInput type="number" formControlName="liquidCapital" required>
                      <mat-error *ngIf="financialInfoForm.get('liquidCapital')?.hasError('required')">
                        Liquid capital is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Investment Capacity (₹)</mat-label>
                    <input matInput type="number" formControlName="investmentCapacity" required>
                    <mat-error *ngIf="financialInfoForm.get('investmentCapacity')?.hasError('required')">
                      Investment capacity is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Credit Score</mat-label>
                    <input matInput type="number" formControlName="creditScore" min="300" max="900">
                    <mat-hint>Optional: Enter your credit score (300-900)</mat-hint>
                  </mat-form-field>

                  <h4>Business Experience</h4>
                  <mat-checkbox formControlName="hasBusinessExperience">
                    I have previous business experience
                  </mat-checkbox>

                  <mat-form-field appearance="outline" class="full-width" 
                                  *ngIf="financialInfoForm.get('hasBusinessExperience')?.value">
                    <mat-label>Business Experience Details</mat-label>
                    <textarea matInput rows="3" formControlName="businessExperienceDetails"
                              placeholder="Describe your business experience..."></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline" 
                                  *ngIf="financialInfoForm.get('hasBusinessExperience')?.value">
                    <mat-label>Years of Experience</mat-label>
                    <input matInput type="number" formControlName="yearsOfExperience" min="0">
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext 
                          [disabled]="!financialInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Business Information -->
            <mat-step [stepControl]="businessInfoForm" label="Business Preferences">
              <form [formGroup]="businessInfoForm">
                <div class="form-section">
                  <h3>Preferred Location</h3>
                  <p class="section-description">
                    Specify your preferred location for the franchise.
                  </p>

                  <div formGroupName="preferredLocation">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Street Address</mat-label>
                      <input matInput formControlName="address" required>
                      <mat-error *ngIf="businessInfoForm.get('preferredLocation.address')?.hasError('required')">
                        Preferred address is required
                      </mat-error>
                    </mat-form-field>

                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>City</mat-label>
                        <input matInput formControlName="city" required>
                        <mat-error *ngIf="businessInfoForm.get('preferredLocation.city')?.hasError('required')">
                          City is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>State</mat-label>
                        <mat-select formControlName="state" required>
                          <mat-option *ngFor="let state of indianStates" [value]="state.code">
                            {{ state.name }}
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="businessInfoForm.get('preferredLocation.state')?.hasError('required')">
                          State is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>PIN Code</mat-label>
                        <input matInput formControlName="zipCode" pattern="[0-9]{6}" required>
                        <mat-error *ngIf="businessInfoForm.get('preferredLocation.zipCode')?.hasError('required')">
                          PIN code is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline">
                      <mat-label>Country</mat-label>
                      <input matInput formControlName="country" value="India" readonly>
                    </mat-form-field>
                  </div>

                  <h4>Business Preferences</h4>
                  <mat-form-field appearance="outline">
                    <mat-label>Timeline to Open</mat-label>
                    <mat-select formControlName="timelineToOpen" required>
                      <mat-option value="3-6 months">3-6 months</mat-option>
                      <mat-option value="6-12 months">6-12 months</mat-option>
                      <mat-option value="12-18 months">12-18 months</mat-option>
                      <mat-option value="18+ months">18+ months</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div class="checkbox-group">
                    <mat-checkbox formControlName="fullTimeCommitment">
                      I can commit full-time to this franchise
                    </mat-checkbox>

                    <mat-checkbox formControlName="hasPartners">
                      I plan to have business partners
                    </mat-checkbox>
                  </div>

                  <mat-form-field appearance="outline" class="full-width" 
                                  *ngIf="businessInfoForm.get('hasPartners')?.value">
                    <mat-label>Partner Details</mat-label>
                    <textarea matInput rows="3" formControlName="partnerDetails"
                              placeholder="Describe your business partners..."></textarea>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext
                          [disabled]="!businessInfoForm.valid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 4: Additional Information -->
            <mat-step label="Additional Information">
              <div class="form-section">
                <h3>Tell Us More</h3>
                <p class="section-description">
                  Help us understand your motivation and any questions you may have.
                </p>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Why are you interested in this franchise?</mat-label>
                  <textarea matInput rows="4"
                            placeholder="Share your motivation and goals..."></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Questions or Comments</mat-label>
                  <textarea matInput rows="3"
                            placeholder="Any questions about the franchise or application process?"></textarea>
                </mat-form-field>

                <h4>Application Fee</h4>
                <div class="fee-info">
                  <mat-card class="fee-card">
                    <mat-card-content>
                      <div class="fee-details">
                        <span class="fee-label">Application Processing Fee:</span>
                        <span class="fee-amount">{{ formatCurrency(franchise?.franchiseFee ? calculateApplicationFee() : 5000) }}</span>
                      </div>
                      <p class="fee-description">
                        This fee covers application processing and initial review.
                        It will be refunded if your application is not approved.
                      </p>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" matStepperNext>
                  Review Application
                </button>
              </div>
            </mat-step>

            <!-- Step 5: Review & Submit -->
            <mat-step label="Review & Submit">
              <div class="form-section">
                <h3>Review Your Application</h3>
                <p class="section-description">
                  Please review all information before submitting your application.
                </p>

                <!-- Personal Information Summary -->
                <mat-card class="review-card">
                  <mat-card-header>
                    <mat-card-title>Personal Information</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="review-item">
                      <strong>Name:</strong>
                      {{ personalInfoForm.get('firstName')?.value }} {{ personalInfoForm.get('lastName')?.value }}
                    </div>
                    <div class="review-item">
                      <strong>Email:</strong> {{ personalInfoForm.get('email')?.value }}
                    </div>
                    <div class="review-item">
                      <strong>Phone:</strong> {{ personalInfoForm.get('phone')?.value }}
                    </div>
                    <div class="review-item">
                      <strong>Address:</strong>
                      {{ personalInfoForm.get('address')?.value }},
                      {{ personalInfoForm.get('city')?.value }},
                      {{ personalInfoForm.get('state')?.value }} - {{ personalInfoForm.get('zipCode')?.value }}
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Financial Information Summary -->
                <mat-card class="review-card">
                  <mat-card-header>
                    <mat-card-title>Financial Information</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="review-item">
                      <strong>Net Worth:</strong> {{ formatCurrency(financialInfoForm.get('netWorth')?.value) }}
                    </div>
                    <div class="review-item">
                      <strong>Liquid Capital:</strong> {{ formatCurrency(financialInfoForm.get('liquidCapital')?.value) }}
                    </div>
                    <div class="review-item">
                      <strong>Investment Capacity:</strong> {{ formatCurrency(financialInfoForm.get('investmentCapacity')?.value) }}
                    </div>
                    <div class="review-item">
                      <strong>Business Experience:</strong>
                      {{ financialInfoForm.get('hasBusinessExperience')?.value ? 'Yes' : 'No' }}
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Business Preferences Summary -->
                <mat-card class="review-card">
                  <mat-card-header>
                    <mat-card-title>Business Preferences</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="review-item">
                      <strong>Preferred Location:</strong>
                      {{ businessInfoForm.get('preferredLocation.address')?.value }},
                      {{ businessInfoForm.get('preferredLocation.city')?.value }},
                      {{ businessInfoForm.get('preferredLocation.state')?.value }}
                    </div>
                    <div class="review-item">
                      <strong>Timeline to Open:</strong> {{ businessInfoForm.get('timelineToOpen')?.value }}
                    </div>
                    <div class="review-item">
                      <strong>Full-time Commitment:</strong>
                      {{ businessInfoForm.get('fullTimeCommitment')?.value ? 'Yes' : 'No' }}
                    </div>
                  </mat-card-content>
                </mat-card>

                <div class="terms-section">
                  <mat-checkbox [(ngModel)]="termsAccepted" required>
                    I agree to the <a href="/terms" target="_blank">Terms and Conditions</a>
                    and <a href="/privacy" target="_blank">Privacy Policy</a>
                  </mat-checkbox>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary"
                        [disabled]="!termsAccepted || isLoading"
                        (click)="onSubmit()">
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <span *ngIf="!isLoading">Submit Application</span>
                </button>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .application-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-section {
      margin-bottom: 24px;
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
      margin-bottom: 16px;
    }

    .section-description {
      color: #666;
      margin-bottom: 16px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h3 {
      color: #333;
      margin-bottom: 8px;
    }

    h4 {
      color: #555;
      margin: 20px 0 12px 0;
    }

    .fee-info {
      margin: 16px 0;
    }

    .fee-card {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
    }

    .fee-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .fee-label {
      font-weight: 500;
      color: #333;
    }

    .fee-amount {
      font-size: 1.2em;
      font-weight: 600;
      color: #2e7d32;
    }

    .fee-description {
      color: #666;
      font-size: 0.9em;
      margin: 0;
    }

    .review-card {
      margin-bottom: 16px;
    }

    .review-item {
      margin-bottom: 8px;
      padding: 4px 0;
    }

    .terms-section {
      margin: 24px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .terms-section a {
      color: #1976d2;
      text-decoration: none;
    }

    .terms-section a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .application-form-container {
        padding: 16px;
      }

      .fee-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class ApplicationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mockDataService = inject(MockDataService);
  private authService = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);

  franchise: Franchise | null = null;
  isLoading = false;
  termsAccepted = false;

  personalInfoForm!: FormGroup;
  financialInfoForm!: FormGroup;
  businessInfoForm!: FormGroup;

  indianStates = [
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CG', name: 'Chhattisgarh' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'DH', name: 'Dadra and Nagar Haveli' },
    { code: 'DD', name: 'Daman and Diu' },
    { code: 'DL', name: 'Delhi' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'PY', name: 'Puducherry' }
  ];

  ngOnInit() {
    this.initializeForms();
    this.loadFranchise();
  }

  private initializeForms() {
    // Get current user data for pre-population
    const currentUser = this.authService.getCurrentUser();

    this.personalInfoForm = this.fb.group({
      firstName: [currentUser?.firstName || '', Validators.required],
      lastName: [currentUser?.lastName || '', Validators.required],
      email: [currentUser?.email || '', [Validators.required, Validators.email]],
      phone: [currentUser?.phone || '', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    this.financialInfoForm = this.fb.group({
      netWorth: ['', Validators.required],
      liquidCapital: ['', Validators.required],
      investmentCapacity: ['', Validators.required],
      creditScore: [''],
      hasBusinessExperience: [false],
      businessExperienceDetails: [''],
      yearsOfExperience: ['']
    });

    this.businessInfoForm = this.fb.group({
      preferredLocation: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
        country: ['India']
      }),
      timelineToOpen: ['', Validators.required],
      fullTimeCommitment: [false],
      hasPartners: [false],
      partnerDetails: ['']
    });
  }

  private loadFranchise() {
    const franchiseId = this.route.snapshot.paramMap.get('franchiseId');
    if (franchiseId) {
      this.mockDataService.getFranchiseById(franchiseId).subscribe({
        next: (franchise) => {
          this.franchise = franchise || null;
        },
        error: (error) => {
          console.error('Error loading franchise:', error);
          this.snackBar.open('Error loading franchise details', 'Close', { duration: 3000 });
          this.router.navigate(['/partner/browse']);
        }
      });
    }
  }

  onSubmit() {
    console.log('🚀 === APPLICATION FORM SUBMISSION STARTED ===');
    console.log('🚀 Form validation status:', {
      personalInfo: this.personalInfoForm.valid,
      financialInfo: this.financialInfoForm.valid,
      businessInfo: this.businessInfoForm.valid
    });

    if (this.personalInfoForm.valid && this.financialInfoForm.valid && this.businessInfoForm.valid) {
      this.isLoading = true;
      console.log('🚀 Forms are valid, proceeding with submission...');
      console.log('🚀 Current franchise:', this.franchise);

      const applicationData: ApplicationCreateData = {
        franchiseId: this.franchise!.id,
        personalInfo: {
          ...this.personalInfoForm.value,
          dateOfBirth: new Date(this.personalInfoForm.value.dateOfBirth)
        },
        financialInfo: {
          ...this.financialInfoForm.value,
          netWorth: Number(this.financialInfoForm.value.netWorth),
          liquidCapital: Number(this.financialInfoForm.value.liquidCapital),
          annualIncome: 0, // Not collected in form
          investmentCapacity: Number(this.financialInfoForm.value.investmentCapacity),
          creditScore: this.financialInfoForm.value.creditScore ? Number(this.financialInfoForm.value.creditScore) : 650
        },
        businessInfo: this.businessInfoForm.value,
        motivation: '',
        questions: '',
        references: []
      };

      console.log('🚀 Application data prepared:', {
        franchiseId: applicationData.franchiseId,
        personalInfo: applicationData.personalInfo,
        financialInfo: applicationData.financialInfo,
        businessInfo: applicationData.businessInfo
      });

      console.log('🚀 Calling mockDataService.createApplication()...');
      this.mockDataService.createApplication(applicationData).subscribe({
        next: (application) => {
          console.log('✅ Application created successfully:', application);
          console.log('✅ Application ID:', application.id);
          console.log('✅ Application status:', application.status);

          this.isLoading = false;
          this.snackBar.open('Application submitted successfully! Redirecting to My Applications...', 'Close', { duration: 3000 });

          // Redirect directly to My Applications page
          setTimeout(() => {
            console.log('🚀 Redirecting to /partner/applications...');
            this.router.navigate(['/partner/applications']);
          }, 1000);
        },
        error: (error) => {
          console.error('❌ Error submitting application:', error);
          console.error('❌ Error details:', error.message, error.stack);

          this.isLoading = false;
          this.snackBar.open('Error submitting application. Please try again.', 'Close', { duration: 5000 });
        }
      });
    } else {
      console.log('❌ Forms are invalid, cannot submit');
      console.log('❌ Form errors:', {
        personalInfo: this.personalInfoForm.errors,
        financialInfo: this.financialInfoForm.errors,
        businessInfo: this.businessInfoForm.errors
      });
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
    console.log('🚀 === APPLICATION FORM SUBMISSION METHOD COMPLETED ===');
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  calculateApplicationFee(): number {
    if (!this.franchise) return 5000;
    // Base fee of ₹5,000 plus 0.1% of franchise fee
    const baseFee = 5000;
    const franchiseFeePercentage = this.franchise.franchiseFee * 0.001;
    return Math.round(baseFee + franchiseFeePercentage);
  }
}
