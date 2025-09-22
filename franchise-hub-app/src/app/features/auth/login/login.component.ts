import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-content">
        <mat-card class="login-card">
          <mat-card-header>
            <div class="login-header">
              <mat-icon class="login-icon">account_circle</mat-icon>
              <h1>Welcome Back</h1>
              <p>Sign in to your FranchiseHub account</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- Email Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input 
                  matInput 
                  type="email" 
                  formControlName="email"
                  placeholder="Enter your email"
                  autocomplete="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword ? 'password' : 'text'" 
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  Password must be at least 6 characters long
                </mat-error>
              </mat-form-field>

              <!-- Remember Me -->
              <div class="form-options">
                <mat-checkbox formControlName="rememberMe">
                  Remember me
                </mat-checkbox>
                <a routerLink="/forgot-password" class="forgot-password-link">
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                class="login-button full-width"
                [disabled]="loginForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading">Signing In...</span>
              </button>

              <!-- Demo Accounts -->
              <div class="demo-accounts" *ngIf="!isLoading">
                <p class="demo-title">Demo Accounts:</p>
                <div class="demo-buttons">
                  <button 
                    mat-button 
                    type="button"
                    (click)="loginAsDemo('business')"
                    class="demo-button">
                    <mat-icon>business</mat-icon>
                    Business Demo
                  </button>
                  <button 
                    mat-button 
                    type="button"
                    (click)="loginAsDemo('partner')"
                    class="demo-button">
                    <mat-icon>person</mat-icon>
                    Partner Demo
                  </button>
                </div>
              </div>
            </form>
          </mat-card-content>

          <mat-card-actions class="login-actions">
            <div class="register-prompt">
              <span>Don't have an account?</span>
              <a routerLink="/register" class="register-link">Sign up here</a>
            </div>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 140px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-content {
      width: 100%;
      max-width: 400px;
    }

    .login-card {
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .login-header {
      text-align: center;
      padding: 32px 24px 16px;
    }

    .login-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .login-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .login-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .login-form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .forgot-password-link {
      color: #1976d2;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-password-link:hover {
      text-decoration: underline;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 16px;
    }

    .demo-accounts {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    .demo-title {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .demo-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .demo-button {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 8px 12px;
    }

    .demo-button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .login-actions {
      padding: 16px 24px 24px;
      justify-content: center;
    }

    .register-prompt {
      text-align: center;
      font-size: 14px;
      color: #666;
    }

    .register-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }

    .register-link:hover {
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }

      .login-header {
        padding: 24px 16px 12px;
      }

      .login-header h1 {
        font-size: 24px;
      }

      .login-form {
        padding: 16px;
      }

      .demo-buttons {
        flex-direction: column;
        align-items: center;
      }

      .demo-button {
        width: 100%;
        max-width: 150px;
      }
    }

    /* Animation */
    .login-card {
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // If user is already authenticated, redirect to appropriate dashboard
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials: LoginCredentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.redirectToDashboard();
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Login failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  loginAsDemo(type: 'business' | 'partner'): void {
    const email = type === 'business' ? 'business@demo.com' : 'partner@demo.com';
    this.loginForm.patchValue({
      email: email,
      password: 'password123'
    });
    this.onSubmit();
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const redirectPath = user.role === UserRole.BUSINESS ? '/business/dashboard' : '/partner/dashboard';
      this.router.navigate([redirectPath]);
    }
  }
}
