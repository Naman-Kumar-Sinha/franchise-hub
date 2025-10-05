import { Routes } from '@angular/router';

export const businessRoutes: Routes = [
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
    path: 'franchises',
    loadComponent: () => import('./franchises/franchises.component').then(m => m.FranchisesComponent)
  },
  {
    path: 'applications',
    loadComponent: () => import('./applications/applications.component').then(m => m.ApplicationsComponent)
  },
  {
    path: 'applications/:id',
    loadComponent: () => import('./applications/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
  },
  // Deprecated: Review functionality moved to Application Details page
  // {
  //   path: 'applications/:id/review',
  //   loadComponent: () => import('./applications/application-review/application-review.component').then(m => m.ApplicationReviewComponent)
  // },
  {
    path: 'applications/:id/timeline',
    loadComponent: () => import('./applications/application-timeline/application-timeline.component').then(m => m.ApplicationTimelineComponent)
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
