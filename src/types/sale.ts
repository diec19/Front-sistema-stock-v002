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
}

export interface Sale {
  id: string;
  total: number;
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