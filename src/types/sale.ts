export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleDTO {
  items: CreateSaleItemDTO[];
  paymentMethod?: string;
}

export interface Sale {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }[];
}

export interface SaleStats {
  totalSales: number;
  totalRevenue: number;
  todaySales: number;
  todayRevenue: number;
}

export interface CashRegister {
  id: string;
  openingAmount: number;
  closingAmount?: number;
  status: string;
  openedBy: string;
  closedBy?: string;
  openedAt: string;
  closedAt?: string;
  sales?: Sale[];
  stats?: {
    totalSales: number;
    totalRevenue: number;
    totalExpenses: number;
    expectedAmount: number;
  };
}

export interface OpenCashRegisterDTO {
  openingAmount: number;
  openedBy: string;
}

export interface CloseCashRegisterDTO {
  closingAmount: number;
  closedBy: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  paymentMethod: string;
  createdBy: string;
  cashRegisterId: string;
  createdAt: string;
}

export interface CreateExpenseDTO {
  amount: number;
  description: string;
  createdBy: string;
  paymentMethod?: string;
}

export type SessionEntry =
  | { kind: 'sale';    data: Sale }
  | { kind: 'expense'; data: Expense };