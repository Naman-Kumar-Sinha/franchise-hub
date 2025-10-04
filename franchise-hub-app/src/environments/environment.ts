// Development environment configuration
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  
  // Feature flags for hybrid authentication strategy
  features: {
    // Enable hybrid authentication (demo accounts use mock, others use real API)
    hybridAuth: true,
    // Demo account emails that should use mock authentication
    demoAccounts: ['business@demo.com', 'partner@demo.com'],
    // Enable real API integration for non-demo accounts
    realApiIntegration: true,
    // Enable mock data fallback on API errors (disabled for registration to prevent broken states)
    mockFallback: false
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      profile: '/auth/profile'
    },
    franchises: {
      list: '/franchises',
      create: '/franchises',
      update: '/franchises',
      delete: '/franchises',
      performance: '/franchises/{id}/performance'
    },
    applications: {
      list: '/applications',
      create: '/applications',
      update: '/applications',
      delete: '/applications',
      review: '/applications/{id}/review',
      documents: '/applications/{id}/documents'
    },
    payments: {
      transactions: '/payments/transactions',
      requests: '/payments/requests',
      processApplication: '/payments/application-fee',
      settlement: '/payments/settlement'
    },
    notifications: {
      list: '/notifications',
      create: '/notifications',
      markRead: '/notifications/mark-read',
      markMultipleRead: '/notifications/mark-multiple-read',
      markAllRead: '/notifications/mark-all-read',
      deleteMultiple: '/notifications/delete-multiple',
      unreadCount: '/notifications/unread-count'
    },
    users: '/users',
    admin: '/admin'
  },
  
  // Authentication configuration
  auth: {
    tokenKey: 'authToken',
    userKey: 'currentUser',
    refreshTokenKey: 'refreshToken',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  // Development settings
  dev: {
    enableLogging: true,
    enableDebugMode: true,
    mockDelay: 1000, // Simulate network delay for mock services
    enableApiLogging: true
  }
};
