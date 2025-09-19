export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

// Core transaction interface matching Prisma model
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: Date;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Foreign keys
  userId: string;
  propertyId: string;
  categoryId: string;
  
  // Related data (when joined)
  category?: {
    id: string;
    name: string;
    type: TransactionType;
    description?: string;
  };
  property?: {
    id: string;
    name: string;
    address: string;
  };
}

// Filter interface for transaction queries (client-side, uses strings for stability)
export interface TransactionFilters {
  // Date range (strings for server/client component stability)
  dateFrom?: string;
  dateTo?: string;
  
  // Transaction type
  type?: TransactionType | 'all';
  
  // Amount range
  amountMin?: number;
  amountMax?: number;
  
  // Category filter
  categoryIds?: string[];
  
  // Recurring filter
  isRecurring?: boolean;
  
  // Property filter (for global view)
  propertyId?: string;
  
  // Search term for description
  search?: string;
  
  // Sorting
  sortBy?: 'transactionDate' | 'amount' | 'type' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// Database-specific filter interface (server-side, uses Date objects for database queries)
export interface DatabaseTransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType | 'all';
  amountMin?: number;
  amountMax?: number;
  categoryIds?: string[];
  isRecurring?: boolean;
  propertyId?: string;
  search?: string;
  sortBy?: 'transactionDate' | 'amount' | 'type' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// API response interfaces
export interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  type: TransactionType;
}

export interface PropertyOption {
  id: string;
  name: string;
  address: string;
  occupancy?: "OCCUPIED" | "AVAILABLE";
}

// Table component props interfaces
export interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  showPropertyColumn?: boolean;
  onSort?: (column: keyof Transaction, direction: 'asc' | 'desc') => void;
  sortConfig?: {
    column: keyof Transaction;
    direction: 'asc' | 'desc';
  };
  emptyMessage?: string;
  className?: string;
}

// Filter component props interface
export interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  showPropertyFilter?: boolean;
  availableProperties?: PropertyOption[];
  availableCategories?: CategoryOption[];
}

// Hook return types
export interface UseTransactionFiltersReturn {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  updateFilter: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void;
  clearFilters: () => void;
}

export interface UsePropertyTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}