import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/public/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/public/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/public/faq/faq.component').then(m => m.FaqComponent)
  },
  
  // Authentication routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Debug page (temporary)
  {
    path: 'debug',
    loadComponent: () => import('./debug-page.component').then(m => m.DebugPageComponent)
  },

  // Partner routes (protected)
  {
    path: 'partner',
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: UserRole.PARTNER },
    loadChildren: () => import('./features/partner/partner.routes').then(m => m.partnerRoutes)
  },
  
  // Business routes (protected)
  {
    path: 'business',
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: UserRole.BUSINESS },
    loadChildren: () => import('./features/business/business.routes').then(m => m.businessRoutes)
  },
  
  // Fallback route
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
