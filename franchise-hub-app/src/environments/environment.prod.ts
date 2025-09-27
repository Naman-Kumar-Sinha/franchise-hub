// Production environment configuration
export const environment = {
  production: true,
  apiUrl: 'https://api.franchisehub.com/api/v1', // Update with your production API URL
  
  // Feature flags for production
  features: {
    // Disable hybrid authentication in production (use real API only)
    hybridAuth: false,
    // No demo accounts in production
    demoAccounts: [],
    // Enable real API integration
    realApiIntegration: true,
    // Disable mock fallback in production
    mockFallback: false
  },
  
  // API endpoints (same as development)
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      profile: '/auth/profile'
    },
    franchises: '/franchises',
    applications: '/applications',
    payments: '/payments',
    notifications: '/notifications',
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
  
  // Production settings
  dev: {
    enableLogging: false,
    enableDebugMode: false,
    mockDelay: 0,
    enableApiLogging: false
  }
};
