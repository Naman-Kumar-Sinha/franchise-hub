import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only add auth headers for API requests to our backend
  if (req.url.startsWith(environment.apiUrl)) {
    const token = authService.getAuthToken();

    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      if (environment.dev.enableApiLogging) {
        console.log('Adding auth header to API request:', req.url);
      }

      return next(authReq);
    }
  }

  return next(req);
};
