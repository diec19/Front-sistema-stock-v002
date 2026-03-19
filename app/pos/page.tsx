'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, Package, TrendingUp, CheckCircle } from 'lucide-react';
import { productService, salesService } from '../../src/services/api';
import { Product } from '../../src/types/product';
import { SaleItem, SaleStats } from '../../src/types/sale';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<SaleStats>({ totalSales: 0, totalRevenue: 0, todaySales: 0, todayRevenue: 0 });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, statsData] = await Promise.all([
        productService.getAll('', 1, 50),
        salesService.getStats()
      ]);
      setProducts(productsData.data);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (search: string) => {
    try {
      const data = await productService.getAll(search, 1, 50);
      setProducts(data.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const addToSale = (product: Product) => {
    const existingItem = saleItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Verificar stock antes de incrementar
      if (existingItem.quantity >= product.stock) {
        alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      if (product.stock === 0) {
        alert('Este producto no tiene stock disponible.');
        return;
      }
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: typeof product.price === 'number' ? product.price : parseFloat(product.price.toString()),
        subtotal: typeof product.price === 'number' ? product.price : parseFloat(product.price.toString())
      };
      setSaleItems([...saleItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles.`);
      return;
    }

    setSaleItems(saleItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const getTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const completeSale = async () => {
    if (saleItems.length === 0) {
      alert('Agrega productos a la venta');
      return;
    }

    try {
      setProcessing(true);
      await salesService.create({
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Limpiar venta y recargar datos
      setSaleItems([]);
      await loadData();
    } catch (error: any) {
      console.error('Error completing sale:', error);
      alert(error.response?.data?.error || 'Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  const cancelSale = () => {
    if (saleItems.length > 0 && window.confirm('¿Estás seguro de cancelar esta venta?')) {
      setSaleItems([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Punto de Venta</h1>
              <p className="text-slate-400">Realiza ventas y gestiona transacciones</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Ventas Totales</div>
                  <div className="text-2xl font-bold text-white">{stats.totalSales}</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Ingresos Totales</div>
                  <div className="text-2xl font-bold text-green-400">${stats.totalRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Ventas Hoy</div>
                  <div className="text-2xl font-bold text-white">{stats.todaySales}</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Ingresos Hoy</div>
                  <div className="text-2xl font-bold text-orange-400">${stats.todayRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Productos Disponibles</h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToSale(product)}
                    disabled={product.stock === 0}
                    className={`
                      p-4 rounded-lg border text-left transition-all
                      ${product.stock === 0
                        ? 'bg-slate-800/30 border-slate-700 opacity-50 cursor-not-allowed'
                        : 'bg-slate-800 border-slate-700 hover:border-green-500 hover:bg-slate-700/50 cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{product.name}</h3>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.stock === 0 
                          ? 'bg-red-500/20 text-red-400' 
                          : product.stock <= product.minStock
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {product.stock === 0 ? 'Sin stock' : `${product.stock} unid.`}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{product.sku}</p>
                    <p className="text-green-400 font-bold text-lg">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price.toString()).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sale Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">Venta Actual</h2>

              {saleItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No hay productos agregados</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                    {saleItems.map((item) => (
                      <div key={item.productId} className="bg-slate-900 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{item.productName}</h4>
                            <p className="text-slate-400 text-xs">${item.unitPrice.toFixed(2)} c/u</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="bg-slate-800 hover:bg-slate-700 text-white p-1 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="bg-slate-800 hover:bg-slate-700 text-white p-1 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-green-400 font-bold">${item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-700 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-white font-medium">${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total</span>
                      <span className="text-3xl font-bold text-green-400">${getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={completeSale}
                      disabled={processing}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Completar Venta
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelSale}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">¡Venta completada!</p>
            <p className="text-sm text-green-100">El stock se actualizó correctamente</p>
          </div>
        </div>
      )}
    </div>
  );
}