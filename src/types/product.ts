export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number | string;
  costPrice: number | string;
  category: string;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  sku: string;
  price: number;
  costPrice: number;
  category: string;
  stock: number;
  minStock: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  costPrice?: number;
  category?: string;
  stock?: number;
  minStock?: number;
}

export interface ProductStats {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  totalCostValue: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}