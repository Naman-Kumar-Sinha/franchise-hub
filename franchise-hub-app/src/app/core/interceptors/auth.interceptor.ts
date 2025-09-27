import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only add auth headers for API requests to our backend
  if (req.url.startsWith(environment.apiUrl)) {
    const currentUser = authService.getCurrentUser();

    // Only add Authorization header for real API users (not demo accounts)
    if (currentUser && !authService.isDemoAccount(currentUser.email)) {
      const token = authService.getAuthToken();

      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        if (environment.dev.enableApiLogging) {
          console.log('Adding auth header to API request for real user:', req.url);
        }

        return next(authReq);
      }
    } else if (currentUser && authService.isDemoAccount(currentUser.email)) {
      // Demo accounts should not make API requests - log this as a warning
      if (environment.dev.enableApiLogging) {
        console.warn('Demo account attempting API request - this should use MockDataService instead:', req.url);
      }
    }
  }

  return next(req);
};
