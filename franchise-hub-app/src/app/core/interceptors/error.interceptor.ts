import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            // Handle 401 differently for API vs demo accounts
            if (req.url.startsWith(environment.apiUrl) && authService.isUsingRealApi()) {
              // Try to refresh token for real API users
              return authService.refreshToken().pipe(
                switchMap(newToken => {
                  // Retry the original request with new token
                  const retryReq = req.clone({
                    headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                  });
                  return next(retryReq);
                }),
                catchError(refreshError => {
                  // Refresh failed, logout user
                  errorMessage = 'Session expired. Please login again.';
                  authService.logout();
                  router.navigate(['/login']);
                  return throwError(() => error);
                })
              );
            } else {
              // For demo accounts or non-API requests
              errorMessage = 'Unauthorized access. Please login again.';
              authService.logout();
              router.navigate(['/login']);
            }
            break;
          case 403:
            errorMessage = 'Access forbidden. You do not have permission.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error Code: ${error.status}`;
        }
      }

      // Show error message to user (only if we have a message)
      if (errorMessage) {
        snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }

      // Log API errors in development
      if (environment.dev.enableApiLogging && req.url.startsWith(environment.apiUrl)) {
        console.error('API Error:', {
          url: req.url,
          status: error.status,
          message: error.message,
          error: error.error
        });
      }

      return throwError(() => error);
    })
  );
};
