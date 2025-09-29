import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { User, UserRole, LoginCredentials, RegisterData } from '../models/user.model';
import { ApiAuthService } from './api-auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiAuthService = inject(ApiAuthService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<User> {
    // Hybrid authentication strategy
    if (this.isDemoAccount(credentials.email)) {
      // Use mock authentication for demo accounts
      return this.mockLogin(credentials).pipe(
        delay(environment.dev.mockDelay),
        tap(user => {
          this.setCurrentUser(user);
          this.saveUserToStorage(user);
        })
      );
    } else if (environment.features.realApiIntegration) {
      // Use real API for non-demo accounts
      return this.apiAuthService.login(credentials).pipe(
        tap(user => {
          this.setCurrentUser(user);
          this.saveUserToStorage(user);
        }),
        catchError(error => {
          if (environment.features.mockFallback) {
            console.warn('API login failed, falling back to mock authentication:', error);
            return this.mockLogin(credentials).pipe(
              delay(environment.dev.mockDelay),
              tap(user => {
                this.setCurrentUser(user);
                this.saveUserToStorage(user);
              })
            );
          }
          return throwError(() => error);
        })
      );
    } else {
      // Fallback to mock authentication
      return this.mockLogin(credentials).pipe(
        delay(environment.dev.mockDelay),
        tap(user => {
          this.setCurrentUser(user);
          this.saveUserToStorage(user);
        })
      );
    }
  }

  register(registerData: RegisterData): Observable<User> {
    // For registration, always check if it's a demo account email first
    if (this.isDemoAccount(registerData.email)) {
      return throwError(() => new Error('Demo account emails cannot be used for registration'));
    } else if (environment.features.realApiIntegration) {
      // Use real API for registration
      return this.apiAuthService.register(registerData).pipe(
        tap(user => {
          this.setCurrentUser(user);
          this.saveUserToStorage(user);
        }),
        catchError(error => {
          // CRITICAL FIX: Never fallback to mock service for real account registrations
          // This prevents the broken state where failed API registration appears successful
          console.error('API registration failed for real account:', error);
          return throwError(() => error);
        })
      );
    } else {
      // Fallback to mock registration
      return this.mockRegister(registerData).pipe(
        delay(environment.dev.mockDelay),
        tap(user => {
          this.setCurrentUser(user);
          this.saveUserToStorage(user);
        })
      );
    }
  }

  logout(): void {
    const currentUser = this.getCurrentUser();

    if (currentUser && !this.isDemoAccount(currentUser.email) && environment.features.realApiIntegration) {
      // For real API users, call logout endpoint
      this.apiAuthService.logout().subscribe({
        next: () => {
          this.setCurrentUser(null);
          this.removeUserFromStorage();
        },
        error: (error) => {
          console.warn('API logout failed, clearing local data anyway:', error);
          this.setCurrentUser(null);
          this.removeUserFromStorage();
        }
      });
    } else {
      // For demo accounts or when API is not available, just clear local data
      this.setCurrentUser(null);
      this.removeUserFromStorage();
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  getAuthToken(): string | null {
    const currentUser = this.getCurrentUser();
    if (currentUser && !this.isDemoAccount(currentUser.email)) {
      return this.apiAuthService.getAuthToken();
    }
    return localStorage.getItem('authToken'); // For demo accounts
  }

  refreshToken(): Observable<string> {
    const currentUser = this.getCurrentUser();
    if (currentUser && !this.isDemoAccount(currentUser.email) && environment.features.realApiIntegration) {
      return this.apiAuthService.refreshToken();
    }
    return throwError(() => new Error('Token refresh not available for demo accounts'));
  }

  isDemoAccount(email: string): boolean {
    return environment.features.hybridAuth &&
           environment.features.demoAccounts.includes(email.toLowerCase());
  }

  isUsingMockService(): boolean {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return true; // No user logged in, use mock service
    }

    if (this.isDemoAccount(currentUser.email)) {
      return true; // Demo account, always use mock service
    }

    if (!environment.features.realApiIntegration) {
      return true; // Real API integration disabled, use mock service
    }

    return false; // Use real API service
  }

  isUsingRealApi(): boolean {
    return !this.isUsingMockService();
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', user.token);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.setCurrentUser(user);
      } catch (error) {
        this.removeUserFromStorage();
      }
    }
  }

  private removeUserFromStorage(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  // Mock authentication methods - replace with real API calls
  private mockLogin(credentials: LoginCredentials): Observable<User> {
    const mockUsers = this.getMockUsers();
    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      credentials.password === 'password123' // Mock password
    );

    if (user) {
      return of({
        ...user,
        token: this.generateMockToken()
      });
    } else {
      return throwError(() => new Error('Invalid email or password'));
    }
  }

  private mockRegister(registerData: RegisterData): Observable<User> {
    // Check if email already exists
    const mockUsers = this.getMockUsers();
    const existingUser = mockUsers.find(u => u.email === registerData.email);
    
    if (existingUser) {
      return throwError(() => new Error('Email already exists'));
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: registerData.email,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role: registerData.role,
      phone: registerData.phone || '',
      company: registerData.company || '',
      createdAt: new Date(),
      isActive: true,
      token: this.generateMockToken()
    };

    return of(newUser);
  }

  private getMockUsers(): User[] {
    return [
      {
        id: 'demo-business-user',
        email: 'business@demo.com',
        firstName: 'Demo',
        lastName: 'Business Owner',
        role: UserRole.BUSINESS,
        phone: '+1-555-0101',
        company: 'Demo Business Corp',
        createdAt: new Date('2024-01-01'),
        isActive: true,
        token: ''
      },
      {
        id: 'demo-partner-user',
        email: 'partner@demo.com',
        firstName: 'Demo',
        lastName: 'Partner',
        role: UserRole.PARTNER,
        phone: '+1-555-0102',
        company: 'Demo Partner LLC',
        createdAt: new Date('2024-01-02'),
        isActive: true,
        token: ''
      },
      // Keep the old accounts for backward compatibility
      {
        id: '1',
        email: 'business@example.com',
        firstName: 'John',
        lastName: 'Business',
        role: UserRole.BUSINESS,
        phone: '+1-555-0101',
        company: 'Business Corp',
        createdAt: new Date('2024-01-01'),
        isActive: true,
        token: ''
      },
      {
        id: '2',
        email: 'partner@example.com',
        firstName: 'Jane',
        lastName: 'Partner',
        role: UserRole.PARTNER,
        phone: '+1-555-0102',
        company: 'Partner LLC',
        createdAt: new Date('2024-01-02'),
        isActive: true,
        token: ''
      }
    ];
  }

  private generateMockToken(): string {
    return 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9);
  }

  // Debug method to check authentication strategy
  getAuthenticationStrategy(): string {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return 'No user logged in';
    }

    if (this.isDemoAccount(currentUser.email)) {
      return `Demo account (${currentUser.email}) - using MockDataService`;
    }

    if (!environment.features.realApiIntegration) {
      return 'Real API integration disabled - using MockDataService';
    }

    return `Real account (${currentUser.email}) - using API services`;
  }
}
