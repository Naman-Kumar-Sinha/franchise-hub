export enum FranchiseCategory {
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  RETAIL = 'RETAIL',
  SERVICES = 'SERVICES',
  HEALTH_FITNESS = 'HEALTH_FITNESS',
  EDUCATION = 'EDUCATION',
  AUTOMOTIVE = 'AUTOMOTIVE',
  REAL_ESTATE = 'REAL_ESTATE',
  TECHNOLOGY = 'TECHNOLOGY',
  CLEANING = 'CLEANING',
  OTHER = 'OTHER'
}

export enum FranchiseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export interface Franchise {
  id: string;
  name: string;
  description: string;
  category: FranchiseCategory;
  status: FranchiseStatus;
  businessOwnerId: string;
  businessOwnerName: string;
  logo?: string;
  images: string[];
  
  // Financial Information
  franchiseFee: number;
  royaltyFee: number; // Percentage
  marketingFee: number; // Percentage
  initialInvestment: {
    min: number;
    max: number;
  };
  liquidCapitalRequired: number;
  netWorthRequired: number;
  
  // Business Details
  yearEstablished: number;
  totalUnits: number;
  franchisedUnits: number;
  companyOwnedUnits: number;
  
  // Requirements
  requirements: {
    experience: string;
    education: string;
    creditScore: number;
    background: string[];
  };
  
  // Support & Training
  support: {
    training: string;
    marketing: string;
    operations: string;
    technology: string;
  };
  
  // Location Information
  territories: string[];
  availableStates: string[];
  internationalOpportunities: boolean;
  
  // Contact Information
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  applicationCount: number;
  rating: number;
  reviewCount: number;
}

export interface FranchiseCreateData {
  name: string;
  description: string;
  category: FranchiseCategory;
  franchiseFee: number;
  royaltyFee: number;
  marketingFee: number;
  initialInvestmentMin: number;
  initialInvestmentMax: number;
  liquidCapitalRequired: number;
  netWorthRequired: number;
  yearEstablished: number;
  totalUnits: number;
  franchisedUnits: number;
  companyOwnedUnits: number;
  requirements: {
    experience: string;
    education: string;
    creditScore: number;
    background: string[];
  };
  support: {
    training: string;
    marketing: string;
    operations: string;
    technology: string;
  };
  territories: string[];
  availableStates: string[];
  internationalOpportunities: boolean;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
}

export interface FranchiseSearchFilters {
  category?: FranchiseCategory;
  minInvestment?: number;
  maxInvestment?: number;
  states?: string[];
  keywords?: string;
  sortBy?: 'name' | 'investment' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface FranchiseStats {
  totalFranchises: number;
  activeFranchises: number;
  totalApplications: number;
  averageRating: number;
  categoryCounts: { [key in FranchiseCategory]: number };
}

export interface FranchiseFormData {
  name: string;
  description: string;
  category: FranchiseCategory;
  franchiseFee: number;
  royaltyFee: number;
  marketingFee: number;
  initialInvestment: {
    min: number;
    max: number;
  };
  liquidCapitalRequired: number;
  netWorthRequired: number;
  yearEstablished: number;
  requirements: {
    experience: string;
    timeCommitment: string;
    location: string;
  };
  support: {
    training: string;
    marketing: string;
    operations: string;
  };
  territory: {
    exclusive: boolean;
    radius: number;
    population: number;
  };
}

export interface FranchisePerformanceMetrics {
  totalApplications: number;
  approvedApplications: number;
  conversionRate: number;
  totalRevenue: number;
  averageTimeToPartnership: number;
  monthlyGrowth: number;
  activePartnerships: number;
}

export interface FranchiseManagementFilters {
  query?: string;
  category?: FranchiseCategory;
  status?: boolean;
  minInvestment?: number;
  maxInvestment?: number;
  sortBy?: 'name' | 'category' | 'createdAt' | 'totalApplications' | 'revenue';
  sortDirection?: 'asc' | 'desc';
}
