import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole, LoginCredentials, RegisterData } from '../models/user.model';

export interface AuthResponse {
  user: ApiUser;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  company: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  lastLoginAt?: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: string;
    language: string;
    timezone: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiAuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<User> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.login}`;

    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(response => {
        this.saveTokenToStorage(response.token, response.refreshToken);
      }),
      map(response => this.mapApiUserToUser(response.user, response.token)),
      tap(user => {
        this.setCurrentUser(user);
        this.saveUserToStorage(user);
      }),
      catchError(this.handleError)
    );
  }

  register(registerData: RegisterData): Observable<User> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.register}`;
    
    const apiRegisterData = {
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role: registerData.role,
      phone: registerData.phone || '',
      company: registerData.company || ''
    };

    return this.http.post<AuthResponse>(url, apiRegisterData).pipe(
      tap(response => {
        this.saveTokenToStorage(response.token, response.refreshToken);
      }),
      map(response => this.mapApiUserToUser(response.user, response.token)),
      tap(user => {
        this.setCurrentUser(user);
        this.saveUserToStorage(user);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    const url = `${environment.apiUrl}${environment.endpoints.auth.logout}`;
    
    return this.http.post<void>(url, {}).pipe(
      tap(() => {
        this.setCurrentUser(null);
        this.removeUserFromStorage();
      }),
      catchError(() => {
        // Even if logout fails on server, clear local data
        this.setCurrentUser(null);
        this.removeUserFromStorage();
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(environment.auth.refreshTokenKey);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const url = `${environment.apiUrl}${environment.endpoints.auth.refresh}`;
    
    return this.http.post<{ token: string; refreshToken?: string }>(url, { refreshToken }).pipe(
      tap(response => {
        this.saveTokenToStorage(response.token, response.refreshToken);
      }),
      map(response => response.token),
      catchError(this.handleError)
    );
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
    return localStorage.getItem(environment.auth.tokenKey);
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(environment.auth.userKey, JSON.stringify(user));
  }

  private saveTokenToStorage(token: string, refreshToken?: string): void {
    localStorage.setItem(environment.auth.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(environment.auth.refreshTokenKey, refreshToken);
    }
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(environment.auth.userKey);
    const token = localStorage.getItem(environment.auth.tokenKey);
    
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        this.setCurrentUser(user);
      } catch (error) {
        this.removeUserFromStorage();
      }
    }
  }

  private removeUserFromStorage(): void {
    localStorage.removeItem(environment.auth.userKey);
    localStorage.removeItem(environment.auth.tokenKey);
    localStorage.removeItem(environment.auth.refreshTokenKey);
  }

  private mapApiUserToUser(apiUser: ApiUser, token: string): User {
    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      role: apiUser.role as UserRole,
      phone: apiUser.phone,
      company: apiUser.company,
      avatar: apiUser.avatar,
      bio: apiUser.bio,
      location: apiUser.location,
      website: apiUser.website,
      createdAt: new Date(apiUser.createdAt),
      updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : undefined,
      isActive: apiUser.isActive,
      token: token,
      lastLoginAt: apiUser.lastLoginAt ? new Date(apiUser.lastLoginAt) : undefined,
      preferences: apiUser.preferences ? {
        notifications: apiUser.preferences.notifications,
        theme: apiUser.preferences.theme as 'light' | 'dark',
        language: apiUser.preferences.language,
        timezone: apiUser.preferences.timezone
      } : undefined
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 409) {
        errorMessage = 'Email already exists';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    if (environment.dev.enableLogging) {
      console.error('API Auth Error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
