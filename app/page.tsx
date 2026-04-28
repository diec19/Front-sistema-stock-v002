'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Package, AlertCircle, Search, ChevronLeft, ChevronRight, Upload, Download, FileSpreadsheet, X, CheckCircle, XCircle } from 'lucide-react';
import { productService, importService } from '../src/services/api';
import { Product, CreateProductDTO, ProductStats, PaginationInfo } from '../src/types/product';

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price.toString());
  return numPrice.toFixed(2);
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState<ProductStats>({ totalProducts: 0, lowStockCount: 0, totalValue: 0 });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  }, [pagination.page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadProducts(1, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProducts(pagination.page, searchTerm),
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

  const loadProducts = async (page: number = 1, search: string = '') => {
    try {
      const response = await productService.getAll(search, page, pagination.limit);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading products:', error);
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
      setFormData({ name: '', description: '', sku: '', price: 0, stock: 0, minStock: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await importService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_productos.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error al descargar la plantilla');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      setImportLoading(true);
      const result = await importService.importProducts(selectedFile);
      setImportResult(result);
      if (result.results.success > 0) {
        await loadData();
      }
    } catch (error: any) {
      console.error('Error importing products:', error);
      alert(error.response?.data?.error || 'Error al importar productos');
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl shadow-md shadow-blue-200">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Control de Stock</h1>
                <p className="text-sm text-gray-500">Gestión de inventario en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-emerald-200 text-sm"
              >
                <Upload className="w-4 h-4" />
                Importar Excel
              </button>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Total Productos</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Valor Total</div>
              <div className="text-3xl font-bold text-emerald-600">
                ${stats.totalValue.toFixed(2)}
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Stock Bajo</div>
              <div className="text-3xl font-bold text-red-500">{stats.lowStockCount}</div>
            </div>
          </div>

          {/* Alerts */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-600 font-semibold mb-1 text-sm">Productos con stock bajo</h3>
                  <div className="text-gray-700 text-sm">
                    {lowStockProducts.map(p => p.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-mono text-sm">{product.sku}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium text-sm">{product.name}</div>
                        <div className="text-gray-400 text-xs">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-semibold text-sm">${formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-semibold text-sm">{product.stock}</div>
                        <div className="text-gray-400 text-xs">Mín: {product.minStock}</div>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock <= product.minStock ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
                            Bajo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100"
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

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="text-gray-500 text-sm">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
                            pagination.page === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return <span key={pageNum} className="px-2 text-gray-400 self-center">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Producto */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl shadow-gray-300/40">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="SKU-001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: e.target.value ? parseFloat(e.target.value) : 0})}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Stock</label>
                    <input
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({...formData, stock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Stock Mínimo</label>
                    <input
                      type="number"
                      value={formData.minStock || ''}
                      onChange={(e) => setFormData({...formData, minStock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProduct}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-blue-200"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Importación */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-200 shadow-2xl shadow-gray-300/40">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-lg shadow-md shadow-emerald-200">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Importar Productos desde Excel</h2>
                </div>
                <button
                  onClick={closeImportModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-blue-700 font-semibold mb-2 text-sm">Instrucciones:</h3>
                  <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Descargá la plantilla Excel</li>
                    <li>Completá los datos de los productos (nombre, descripción, sku, precio, stock, stock_minimo)</li>
                    <li>Guardá el archivo y subilo aquí</li>
                  </ol>
                </div>

                {/* Botón descargar plantilla */}
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar Plantilla Excel
                </button>

                {/* Área de carga */}
                <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-8 text-center transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="bg-gray-100 p-4 rounded-full">
                      <Upload className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium mb-1 text-sm">
                        {selectedFile ? selectedFile.name : 'Click para seleccionar archivo'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        o arrastrá y soltá tu archivo Excel aquí
                      </p>
                    </div>
                  </label>
                </div>

                {/* Resultado de la importación */}
                {importResult && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h3 className="text-gray-900 font-semibold mb-3 text-sm">Resultado de la Importación</h3>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-blue-600 text-xs font-semibold mb-0.5">Total</div>
                          <div className="text-2xl font-bold text-gray-900">{importResult.results.total}</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1 mb-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Exitosos
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{importResult.results.success}</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-red-500 text-xs font-semibold flex items-center gap-1 mb-0.5">
                            <XCircle className="w-3.5 h-3.5" />
                            Errores
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{importResult.results.errors}</div>
                        </div>
                      </div>

                      {importResult.results.errorDetails.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-red-500 font-medium text-sm mb-2">Errores encontrados:</h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                            {importResult.results.errorDetails.map((error: any, index: number) => (
                              <div key={index} className="text-sm text-gray-700 mb-2 pb-2 border-b border-gray-100 last:border-0">
                                <span className="text-red-500 font-medium">Fila {error.row}:</span> {error.error}
                                <div className="text-gray-400 text-xs mt-1">
                                  SKU: {error.data.sku} - {error.data.nombre}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={closeImportModal}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-emerald-200"
                >
                  {importLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importar Productos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
