import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterData, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  template: `
    <div class="register-container">
      <div class="register-content">
        <mat-card class="register-card">
          <mat-card-header>
            <div class="register-header">
              <mat-icon class="register-icon">person_add</mat-icon>
              <h1>Join FranchiseHub</h1>
              <p>Create your account and start your franchise journey</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper [linear]="true" #stepper class="register-stepper">
              <!-- Step 1: Account Type -->
              <mat-step [stepControl]="accountTypeForm" label="Account Type">
                <form [formGroup]="accountTypeForm" class="step-form">
                  <h3>What type of account would you like to create?</h3>
                  
                  <mat-radio-group formControlName="role" class="role-selection">
                    <div class="role-option">
                      <mat-radio-button [value]="UserRole.BUSINESS">
                        <div class="role-content">
                          <mat-icon>business</mat-icon>
                          <div class="role-text">
                            <h4>Business Owner</h4>
                            <p>List and manage your franchises, review partner applications</p>
                          </div>
                        </div>
                      </mat-radio-button>
                    </div>
                    
                    <div class="role-option">
                      <mat-radio-button [value]="UserRole.PARTNER">
                        <div class="role-content">
                          <mat-icon>person</mat-icon>
                          <div class="role-text">
                            <h4>Franchise Partner</h4>
                            <p>Browse franchises, submit applications, manage partnerships</p>
                          </div>
                        </div>
                      </mat-radio-button>
                    </div>
                  </mat-radio-group>
                  
                  <mat-error *ngIf="accountTypeForm.get('role')?.hasError('required') && accountTypeForm.get('role')?.touched">
                    Please select an account type
                  </mat-error>
                  
                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="accountTypeForm.invalid">
                      Next
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 2: Personal Information -->
              <mat-step [stepControl]="personalInfoForm" label="Personal Info">
                <form [formGroup]="personalInfoForm" class="step-form">
                  <h3>Tell us about yourself</h3>
                  
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" placeholder="Enter your first name">
                      <mat-error *ngIf="personalInfoForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" placeholder="Enter your last name">
                      <mat-error *ngIf="personalInfoForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email Address</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="Enter your email">
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-error *ngIf="personalInfoForm.get('email')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="personalInfoForm.get('email')?.hasError('email')">
                      Please enter a valid email address
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone Number</mat-label>
                    <input matInput type="tel" formControlName="phone" placeholder="Enter your phone number">
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Company Name</mat-label>
                    <input matInput formControlName="company" placeholder="Enter your company name">
                    <mat-icon matSuffix>business</mat-icon>
                  </mat-form-field>
                  
                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="personalInfoForm.invalid">
                      Next
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 3: Security -->
              <mat-step [stepControl]="securityForm" label="Security">
                <form [formGroup]="securityForm" class="step-form">
                  <h3>Create your password</h3>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Password</mat-label>
                    <input
                      matInput
                      [type]="hidePassword ? 'password' : 'text'"
                      formControlName="password"
                      placeholder="Create a strong password">
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="hidePassword = !hidePassword">
                      <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="securityForm.get('password')?.hasError('required')">
                      Password is required
                    </mat-error>
                    <mat-error *ngIf="securityForm.get('password')?.hasError('minlength')">
                      Password must be at least 8 characters long
                    </mat-error>
                    <mat-error *ngIf="securityForm.get('password')?.hasError('pattern')">
                      Password must contain at least one uppercase letter, one lowercase letter, and one number
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirm Password</mat-label>
                    <input
                      matInput
                      [type]="hideConfirmPassword ? 'password' : 'text'"
                      formControlName="confirmPassword"
                      placeholder="Confirm your password">
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="hideConfirmPassword = !hideConfirmPassword">
                      <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="securityForm.get('confirmPassword')?.hasError('required')">
                      Please confirm your password
                    </mat-error>
                    <mat-error *ngIf="securityForm.get('confirmPassword')?.hasError('passwordMismatch')">
                      Passwords do not match
                    </mat-error>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="securityForm.invalid">
                      Next
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Step 4: Terms & Conditions -->
              <mat-step [stepControl]="termsForm" label="Terms">
                <form [formGroup]="termsForm" class="step-form">
                  <h3>Terms and Conditions</h3>

                  <div class="terms-content">
                    <p>By creating an account, you agree to our terms and conditions:</p>
                    <ul>
                      <li>You will provide accurate and truthful information</li>
                      <li>You will not use the platform for illegal activities</li>
                      <li>You understand that a 5% platform fee applies to all transactions</li>
                      <li>You agree to our privacy policy and data handling practices</li>
                    </ul>
                  </div>

                  <div class="checkbox-group">
                    <mat-checkbox formControlName="agreeToTerms">
                      I agree to the <a routerLink="/terms" target="_blank">Terms & Conditions</a>
                      and <a routerLink="/privacy" target="_blank">Privacy Policy</a>
                    </mat-checkbox>
                    <mat-error *ngIf="termsForm.get('agreeToTerms')?.hasError('required') && termsForm.get('agreeToTerms')?.touched">
                      You must agree to the terms and conditions
                    </mat-error>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Back</button>
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="onSubmit()"
                      [disabled]="!isFormValid() || isLoading">
                      <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                      <span *ngIf="!isLoading">Create Account</span>
                      <span *ngIf="isLoading">Creating Account...</span>
                    </button>
                  </div>
                </form>
              </mat-step>
            </mat-stepper>
          </mat-card-content>

          <mat-card-actions class="register-actions">
            <div class="login-prompt">
              <span>Already have an account?</span>
              <a routerLink="/login" class="login-link">Sign in here</a>
            </div>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: calc(100vh - 140px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .register-content {
      width: 100%;
      max-width: 600px;
    }

    .register-card {
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .register-header {
      text-align: center;
      padding: 32px 24px 16px;
    }

    .register-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .register-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .register-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .register-stepper {
      padding: 24px;
    }

    .step-form {
      padding: 16px 0;
    }

    .step-form h3 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .role-selection {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .role-option {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s ease;
    }

    .role-option:hover {
      border-color: #1976d2;
      background-color: #f5f5f5;
    }

    .role-option mat-radio-button {
      width: 100%;
    }

    .role-content {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: 32px;
    }

    .role-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .role-text h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .role-text p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .terms-content {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .terms-content p {
      margin: 0 0 12px 0;
      font-weight: 500;
    }

    .terms-content ul {
      margin: 0;
      padding-left: 20px;
    }

    .terms-content li {
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .checkbox-group {
      margin-bottom: 24px;
    }

    .checkbox-group a {
      color: #1976d2;
      text-decoration: none;
    }

    .checkbox-group a:hover {
      text-decoration: underline;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .register-actions {
      padding: 16px 24px 24px;
      justify-content: center;
    }

    .login-prompt {
      text-align: center;
      font-size: 14px;
      color: #666;
    }

    .login-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .register-container {
        padding: 16px;
      }

      .register-header {
        padding: 24px 16px 12px;
      }

      .register-stepper {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .role-content {
        flex-direction: column;
        text-align: center;
        gap: 8px;
        margin-left: 0;
      }

      .step-actions {
        flex-direction: column;
        gap: 12px;
      }

      .step-actions button {
        width: 100%;
      }
    }

    /* Animation */
    .register-card {
      animation: slideInUp 0.6s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  accountTypeForm!: FormGroup;
  personalInfoForm!: FormGroup;
  securityForm!: FormGroup;
  termsForm!: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  // Expose UserRole enum to template
  UserRole = UserRole;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // If user is already authenticated, redirect to appropriate dashboard
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }

    // Check for query parameters to pre-select account type
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        const role = params['type'] === 'business' ? UserRole.BUSINESS : UserRole.PARTNER;
        this.accountTypeForm.patchValue({ role });
      }
    });
  }

  private initializeForms(): void {
    // Step 1: Account Type
    this.accountTypeForm = this.fb.group({
      role: ['', Validators.required]
    });

    // Step 2: Personal Information
    this.personalInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: ['']
    });

    // Step 3: Security
    this.securityForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Step 4: Terms
    this.termsForm = this.fb.group({
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  isFormValid(): boolean {
    return this.accountTypeForm.valid &&
           this.personalInfoForm.valid &&
           this.securityForm.valid &&
           this.termsForm.valid;
  }

  onSubmit(): void {
    if (this.isFormValid() && !this.isLoading) {
      this.isLoading = true;

      const registerData: RegisterData = {
        ...this.accountTypeForm.value,
        ...this.personalInfoForm.value,
        ...this.securityForm.value,
        ...this.termsForm.value
      };

      this.authService.register(registerData).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.snackBar.open('Account created successfully! Welcome to FranchiseHub!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.redirectToDashboard();
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Registration failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const redirectPath = user.role === UserRole.BUSINESS ? '/business/dashboard' : '/partner/dashboard';
      this.router.navigate([redirectPath]);
    }
  }
}
