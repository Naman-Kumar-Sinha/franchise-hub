import { Routes } from '@angular/router';

export const partnerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'browse',
    loadComponent: () => import('./browse/browse.component').then(m => m.BrowseComponent)
  },
  {
    path: 'applications',
    loadComponent: () => import('./applications/applications.component').then(m => m.ApplicationsComponent)
  },
  {
    path: 'applications/new/:franchiseId',
    loadComponent: () => import('./applications/application-form/application-form.component').then(m => m.ApplicationFormComponent)
  },
  {
    path: 'applications/:id/payment',
    loadComponent: () => import('./applications/payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'payment-requests/settle',
    loadComponent: () => import('./applications/payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'partnerships',
    loadComponent: () => import('./partnerships/partnerships.component').then(m => m.PartnershipsComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/transactions.component').then(m => m.TransactionsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'help',
    loadComponent: () => import('./help/help.component').then(m => m.HelpComponent)
  }
];
