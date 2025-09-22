import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      const expectedRole = route.data['expectedRole'] as UserRole;
      
      if (user && user.role === expectedRole) {
        return true;
      } else {
        // Redirect to appropriate dashboard based on user role
        if (user) {
          const redirectPath = user.role === UserRole.BUSINESS ? '/business' : '/partner';
          router.navigate([redirectPath]);
        } else {
          router.navigate(['/login']);
        }
        return false;
      }
    })
  );
};
