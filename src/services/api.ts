import axios from 'axios';
import { Product, CreateProductDTO, UpdateProductDTO, ProductStats, PaginatedResponse } from '../types/product';
import { CreateSaleDTO, Sale, SaleStats, CashRegister, OpenCashRegisterDTO, CloseCashRegisterDTO } from '../types/sale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  // Obtener todos los productos con paginación
  getAll: async (search?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Product>> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  // Obtener producto por ID
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Crear producto
  create: async (data: CreateProductDTO): Promise<Product> => {
    const response = await api.post('/api/products', data);
    return response.data;
  },

  // Actualizar producto
  update: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const response = await api.put(`/api/products/${id}`, data);
    return response.data;
  },

  // Eliminar producto
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },

  // Obtener productos con stock bajo
  getLowStock: async (): Promise<Product[]> => {
    const response = await api.get('/api/products/low-stock');
    return response.data;
  },

  // Obtener estadísticas
  getStats: async (): Promise<ProductStats> => {
    const response = await api.get('/api/products/stats');
    return response.data;
  },
};

export const importService = {
  // Descargar plantilla Excel
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/api/import/template', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Importar productos desde Excel
  importProducts: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/import/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const salesService = {
  // Crear venta
  create: async (data: CreateSaleDTO): Promise<Sale> => {
    const response = await api.post('/api/sales', data);
    return response.data;
  },

  // Obtener todas las ventas
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Sale>> => {
    const response = await api.get('/api/sales', {
      params: { page, limit }
    });
    return response.data;
  },

  // Obtener estadísticas
  getStats: async (): Promise<SaleStats> => {
    const response = await api.get('/api/sales/stats');
    return response.data;
  },

  // Eliminar venta
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/sales/${id}`);
  },
};

export const cashRegisterService = {
  // Abrir caja
  open: async (data: OpenCashRegisterDTO): Promise<CashRegister> => {
    const response = await api.post('/api/cash-register/open', data);
    return response.data;
  },

  // Cerrar caja
  close: async (id: string, data: CloseCashRegisterDTO): Promise<CashRegister> => {
    const response = await api.post(`/api/cash-register/${id}/close`, data);
    return response.data;
  },

  // Obtener caja actual
  getCurrent: async (): Promise<CashRegister> => {
    const response = await api.get('/api/cash-register/current');
    return response.data;
  },

  // Obtener todas las cajas
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<CashRegister>> => {
    const response = await api.get('/api/cash-register', {
      params: { page, limit }
    });
    return response.data;
  },
};

export default api;