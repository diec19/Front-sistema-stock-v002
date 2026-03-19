'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, AlertCircle, Search } from 'lucide-react';
import { productService } from '../src/services/api';
import { Product, CreateProductDTO, ProductStats } from '../src/types/product';

// Helper para formatear precio
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price.toString());
  return numPrice.toFixed(2);
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({ totalProducts: 0, lowStockCount: 0, totalValue: 0 });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    stock: 0,
    minStock: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchProducts(searchTerm);
      } else {
        loadProducts();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProducts(),
        loadStats(),
        loadLowStock()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const searchProducts = async (search: string) => {
    try {
      const data = await productService.getAll(search);
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await productService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadLowStock = async () => {
    try {
      const data = await productService.getLowStock();
      setLowStockProducts(data);
    } catch (error) {
      console.error('Error loading low stock:', error);
    }
  };

  const saveProduct = async () => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      await loadData();
      closeModal();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.error || 'Error al guardar el producto');
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price.toString()),
        stock: product.stock,
        minStock: product.minStock
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        stock: 0,
        minStock: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Control de Stock - Ilucion Creativa</h1>
                <p className="text-slate-400">Gestión de inventario en tiempo real</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Total Productos</div>
              <div className="text-3xl font-bold text-white">{stats.totalProducts}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Valor Total</div>
              <div className="text-3xl font-bold text-green-400">
                ${stats.totalValue.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Stock Bajo</div>
              <div className="text-3xl font-bold text-red-400">{stats.lowStockCount}</div>
            </div>
          </div>

          {/* Alerts */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Productos con stock bajo</h3>
                  <div className="text-slate-300 text-sm">
                    {lowStockProducts.map(p => p.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/80">
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">SKU</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Producto</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Precio</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Stock</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Estado</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">{product.sku}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-slate-400 text-sm">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 text-green-400 font-semibold">${formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{product.stock}</div>
                        <div className="text-slate-400 text-xs">Mín: {product.minStock}</div>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock <= product.minStock ? (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                            Bajo
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SKU-001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: e.target.value ? parseFloat(e.target.value) : 0})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({...formData, stock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Stock Mínimo</label>
                    <input
                      type="number"
                      value={formData.minStock || ''}
                      onChange={(e) => setFormData({...formData, minStock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProduct}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}