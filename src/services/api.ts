import axios from 'axios';
import { Product, CreateProductDTO, UpdateProductDTO, ProductStats, PaginatedResponse } from '@/types/product';

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

export default api;