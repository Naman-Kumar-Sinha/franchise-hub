import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User, UserRole, LoginCredentials, RegisterData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<User> {
    // Mock authentication - replace with real API call
    return this.mockLogin(credentials).pipe(
      delay(1000), // Simulate network delay
      tap(user => {
        this.setCurrentUser(user);
        this.saveUserToStorage(user);
      })
    );
  }

  register(registerData: RegisterData): Observable<User> {
    // Mock registration - replace with real API call
    return this.mockRegister(registerData).pipe(
      delay(1000), // Simulate network delay
      tap(user => {
        this.setCurrentUser(user);
        this.saveUserToStorage(user);
      })
    );
  }

  logout(): void {
    this.setCurrentUser(null);
    this.removeUserFromStorage();
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
}
