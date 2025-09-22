import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="navbar" color="primary">
      <div class="navbar-container">
        <!-- Logo and Brand -->
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">
            <mat-icon class="brand-icon">business</mat-icon>
            <span class="brand-text">FranchiseHub</span>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <nav class="navbar-nav desktop-nav" *ngIf="!isMobile">
          <!-- Public Navigation -->
          <ng-container *ngIf="!isAuthenticated">
            <a mat-button routerLink="/about" routerLinkActive="active">About</a>
            <a mat-button routerLink="/contact" routerLinkActive="active">Contact</a>
            <a mat-button routerLink="/faq" routerLinkActive="active">FAQ</a>
          </ng-container>

          <!-- Authenticated Navigation -->
          <ng-container *ngIf="isAuthenticated && currentUser">
            <!-- Business User Navigation -->
            <ng-container *ngIf="currentUser.role === UserRole.BUSINESS">
              <a mat-button routerLink="/business/dashboard" routerLinkActive="active">Dashboard</a>
              <a mat-button routerLink="/business/franchises" routerLinkActive="active">My Franchises</a>
              <a mat-button routerLink="/business/applications" routerLinkActive="active">Applications</a>
              <a mat-button routerLink="/business/transactions" routerLinkActive="active">Transactions</a>
            </ng-container>

            <!-- Partner User Navigation -->
            <ng-container *ngIf="currentUser.role === UserRole.PARTNER">
              <a mat-button routerLink="/partner/dashboard" routerLinkActive="active">Dashboard</a>
              <a mat-button routerLink="/partner/browse" routerLinkActive="active">Browse Franchises</a>
              <a mat-button routerLink="/partner/applications" routerLinkActive="active">My Applications</a>
              <a mat-button routerLink="/partner/partnerships" routerLinkActive="active">Partnerships</a>
            </ng-container>
          </ng-container>
        </nav>

        <!-- User Actions -->
        <div class="navbar-actions">
          <!-- Notifications (for authenticated users) -->
          <button 
            *ngIf="isAuthenticated" 
            mat-icon-button 
            [matBadge]="notificationCount" 
            matBadgeColor="warn"
            [matBadgeHidden]="notificationCount === 0"
            aria-label="Notifications">
            <mat-icon>notifications</mat-icon>
          </button>

          <!-- User Menu (for authenticated users) -->
          <ng-container *ngIf="isAuthenticated && currentUser">
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{currentUser.firstName}}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item [routerLink]="getProfileRoute()">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              <button mat-menu-item [routerLink]="getSettingsRoute()">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <button mat-menu-item [routerLink]="getHelpRoute()">
                <mat-icon>help</mat-icon>
                <span>Help & Support</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </ng-container>

          <!-- Login/Register (for non-authenticated users) -->
          <ng-container *ngIf="!isAuthenticated">
            <a mat-button routerLink="/login" class="login-btn">Login</a>
            <a mat-raised-button color="accent" routerLink="/register" class="register-btn">Register</a>
          </ng-container>

          <!-- Mobile Menu Toggle -->
          <button 
            mat-icon-button 
            class="mobile-menu-toggle" 
            (click)="toggleMobileMenu()"
            [class.active]="isMobileMenuOpen"
            *ngIf="isMobile">
            <mat-icon>{{isMobileMenuOpen ? 'close' : 'menu'}}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div class="mobile-nav" [class.open]="isMobileMenuOpen" *ngIf="isMobile">
        <nav class="mobile-nav-content">
          <!-- Public Mobile Navigation -->
          <ng-container *ngIf="!isAuthenticated">
            <a mat-button routerLink="/about" (click)="closeMobileMenu()">About</a>
            <a mat-button routerLink="/contact" (click)="closeMobileMenu()">Contact</a>
            <a mat-button routerLink="/faq" (click)="closeMobileMenu()">FAQ</a>
            <mat-divider></mat-divider>
            <a mat-button routerLink="/login" (click)="closeMobileMenu()">Login</a>
            <a mat-raised-button color="accent" routerLink="/register" (click)="closeMobileMenu()">Register</a>
          </ng-container>

          <!-- Authenticated Mobile Navigation -->
          <ng-container *ngIf="isAuthenticated && currentUser">
            <!-- Business User Mobile Navigation -->
            <ng-container *ngIf="currentUser.role === UserRole.BUSINESS">
              <a mat-button routerLink="/business/dashboard" (click)="closeMobileMenu()">Dashboard</a>
              <a mat-button routerLink="/business/franchises" (click)="closeMobileMenu()">My Franchises</a>
              <a mat-button routerLink="/business/applications" (click)="closeMobileMenu()">Applications</a>
              <a mat-button routerLink="/business/transactions" (click)="closeMobileMenu()">Transactions</a>
            </ng-container>

            <!-- Partner User Mobile Navigation -->
            <ng-container *ngIf="currentUser.role === UserRole.PARTNER">
              <a mat-button routerLink="/partner/dashboard" (click)="closeMobileMenu()">Dashboard</a>
              <a mat-button routerLink="/partner/browse" (click)="closeMobileMenu()">Browse Franchises</a>
              <a mat-button routerLink="/partner/applications" (click)="closeMobileMenu()">My Applications</a>
              <a mat-button routerLink="/partner/partnerships" (click)="closeMobileMenu()">Partnerships</a>
            </ng-container>

            <mat-divider></mat-divider>
            <a mat-button [routerLink]="getProfileRoute()" (click)="closeMobileMenu()">Profile</a>
            <a mat-button [routerLink]="getSettingsRoute()" (click)="closeMobileMenu()">Settings</a>
            <a mat-button [routerLink]="getHelpRoute()" (click)="closeMobileMenu()">Help & Support</a>
            <button mat-button (click)="logout()" class="logout-mobile">Logout</button>
          </ng-container>
        </nav>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      margin-right: 8px;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 500;
    }

    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-name {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mobile-menu-toggle {
      display: none;
    }

    .mobile-nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .mobile-nav.open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }

    .mobile-nav-content {
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 8px;
    }

    .logout-mobile {
      color: #f44336 !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .navbar {
        height: 56px;
      }

      .desktop-nav {
        display: none;
      }

      .mobile-menu-toggle {
        display: block;
      }

      .user-menu-trigger {
        display: none;
      }

      .navbar-actions {
        gap: 4px;
      }

      .brand-text {
        font-size: 18px;
      }

      .brand-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        padding: 0 8px;
      }

      .user-name {
        display: none;
      }
    }

    /* Active link styling */
    .navbar-nav a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isAuthenticated = false;
  currentUser: User | null = null;
  notificationCount = 0;
  isMobile = false;
  isMobileMenuOpen = false;
  
  // Expose UserRole enum to template
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Check if mobile
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  getProfileRoute(): string {
    if (!this.currentUser) return '/';
    return this.currentUser.role === UserRole.BUSINESS ? '/business/profile' : '/partner/profile';
  }

  getSettingsRoute(): string {
    if (!this.currentUser) return '/';
    return this.currentUser.role === UserRole.BUSINESS ? '/business/settings' : '/partner/settings';
  }

  getHelpRoute(): string {
    if (!this.currentUser) return '/';
    return this.currentUser.role === UserRole.BUSINESS ? '/business/help' : '/partner/help';
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }
}
