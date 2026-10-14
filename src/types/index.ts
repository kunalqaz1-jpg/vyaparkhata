export type Role = 'owner' | 'admin' | 'manager' | 'accountant' | 'sales' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  activeBusinessId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  category?: string;
  businessType?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  upiId?: string;
  currency?: string;
  currencySymbol?: string;
  timezone?: string;
  ownerId: string;
  ownerEmail?: string;
  allowedEmails?: string[];
  city?: string;
  state?: string;
  pincode?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  userEmail: string;
  displayName: string;
  role: Role;
  status: 'active' | 'invited' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  openingBalance: number; // positive = customer owes business, negative = advance/credit
  currentBalance: number;
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  openingBalance: number; // positive = business owes supplier
  currentBalance: number;
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'you_gave' | 'you_got' | 'payment_in' | 'payment_out' | 'opening_balance';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other';

export interface Transaction {
  id: string;
  businessId: string;
  partyType: 'customer' | 'supplier';
  partyId: string;
  partyName?: string;
  partyPhone?: string;
  type: TransactionType;
  amount: number;
  balanceAfter?: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  description?: string;
  billNumber?: string;
  date: string;
  status?: 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number; // 0, 5, 12, 18, 28 %
  discountPercent?: number;
  amount: number; // net total with tax
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGstin?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
  issueDate: string;
  dueDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku?: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockAlert: number;
  taxRate: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  notes?: string;
  date: string;
  billNumber?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  dueDate: string;
  notes?: string;
  status: 'pending' | 'completed' | 'snoozed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
