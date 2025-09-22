export enum TransactionType {
  APPLICATION_FEE = 'APPLICATION_FEE',
  FRANCHISE_FEE = 'FRANCHISE_FEE',
  ROYALTY = 'ROYALTY',
  ROYALTY_FEE = 'ROYALTY_FEE',
  MARKETING_FEE = 'MARKETING_FEE',
  PLATFORM_FEE = 'PLATFORM_FEE',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  NET_BANKING = 'NET_BANKING',
  UPI = 'UPI',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ACH = 'ACH',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  CHECK = 'CHECK'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  
  // Parties
  franchiseId: string;
  franchiseName: string;
  businessId: string;
  businessName: string;
  partnerId: string;
  partnerName: string;
  
  // Financial Details
  amount: number;
  platformFee: number; // 5% total (2.5% to business, 2.5% to partner)
  businessFee: number; // 2.5% of amount
  partnerFee: number; // 2.5% of amount
  netAmountToBusiness: number;
  netAmountToPartner: number;
  
  // Payment Information
  paymentMethod: PaymentMethod;
  paymentReference: string;
  
  // Metadata
  description: string;
  notes?: string;
  invoiceNumber: string;
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Related Documents
  invoiceUrl?: string;
  receiptUrl?: string;
  
  // Reconciliation
  isReconciled: boolean;
  reconciledAt?: Date;
  reconciledBy?: string;
}

export interface TransactionCreateData {
  type: TransactionType;
  franchiseId: string;
  businessId: string;
  partnerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  dueDate?: Date;
}

export interface TransactionSearchFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  franchiseId?: string;
  businessId?: string;
  partnerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
  sortBy?: 'date' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  totalPlatformFees: number;
  totalBusinessFees: number;
  totalPartnerFees: number;
  averageTransactionAmount: number;
  transactionsByType: { [key in TransactionType]: number };
  transactionsByStatus: { [key in TransactionStatus]: number };
  monthlyRevenue: MonthlyRevenue[];
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  totalAmount: number;
  platformFees: number;
  transactionCount: number;
}

export interface Invoice {
  id: string;
  transactionId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  
  // Billing Information
  billTo: {
    name: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    email: string;
  };
  
  billFrom: {
    name: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    email: string;
  };
  
  // Line Items
  lineItems: InvoiceLineItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  total: number;
  
  // Payment Information
  paymentTerms: string;
  paymentInstructions: string;
  
  // Status
  isPaid: boolean;
  paidAt?: Date;
  
  // Metadata
  notes?: string;
  createdAt: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
