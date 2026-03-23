'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, Package, TrendingUp, CheckCircle, LogOut, LogIn, AlertCircle, History, X } from 'lucide-react';
import { productService, salesService, cashRegisterService } from '../../src/services/api';
import { Product } from '../../src/types/product';
import { SaleItem, SaleStats, CashRegister, Sale } from '../../src/types/sale';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<SaleStats>({ totalSales: 0, totalRevenue: 0, todaySales: 0, todayRevenue: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [cashierName, setCashierName] = useState('');
  // Agregar estos estados
const [showAuthModal, setShowAuthModal] = useState(false);
const [authUsername, setAuthUsername] = useState('');
const [authPassword, setAuthPassword] = useState('');

// Función para verificar credenciales antes de mostrar historial
const handleShowHistory = async () => {
  setShowAuthModal(true);
};

const verifyAndShowHistory = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: authUsername,
      password: authPassword
    });
    
    if (response.data.user.role === 'admin') {
      await loadSales();
      setShowAuthModal(false);
      setAuthUsername('');
      setAuthPassword('');
    } else {
      alert('Solo administradores pueden ver el historial');
    }
  } catch (error) {
    alert('Credenciales incorrectas');
  }
};


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
      
      // Intentar cargar caja actual
      try {
        const currentCash = await cashRegisterService.getCurrent();
        setCashRegister(currentCash);
      } catch (error) {
        setCashRegister(null);
      }
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

  const openCashRegister = async () => {
    if (!cashierName || !openingAmount) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const newCash = await cashRegisterService.open({
        openingAmount: parseFloat(openingAmount),
        openedBy: cashierName
      });
      setCashRegister(newCash);
      setShowOpenModal(false);
      setOpeningAmount('');
      setCashierName('');
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al abrir la caja');
    }
  };

  const closeCashRegister = async () => {
    if (!cashRegister || !closingAmount || !cashierName) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      await cashRegisterService.close(cashRegister.id, {
        closingAmount: parseFloat(closingAmount),
        closedBy: cashierName
      });
      setCashRegister(null);
      setShowCloseModal(false);
      setClosingAmount('');
      setCashierName('');
      setSaleItems([]);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al cerrar la caja');
    }
  };

  const loadSales = async () => {
    try {
      const response = await salesService.getAll(1, 20);
      setSales(response.data);
      setShowSalesModal(true);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const deleteSale = async (saleId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta? Se devolverá el stock.')) {
      return;
    }

    try {
      await salesService.delete(saleId);
      await loadSales();
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar la venta');
    }
  };

  const addToSale = (product: Product) => {
    if (!cashRegister) {
      alert('Debes abrir una caja antes de realizar ventas');
      return;
    }

    const existingItem = saleItems.find(item => item.productId === product.id);
    
    if (existingItem) {
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

    if (!cashRegister) {
      alert('Debes abrir una caja antes de realizar ventas');
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

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Punto de Venta</h1>
                <p className="text-slate-400">Realiza ventas y gestiona transacciones</p>
              </div>
            </div>

            {/* Cash Register Status & Actions */}
            <div className="flex items-center gap-3">
             <button
                onClick={handleShowHistory}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <History className="w-5 h-5" />
                Historial
              </button>

              {cashRegister ? (
                <>
                  <div className="bg-green-500/20 border border-green-500 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-semibold">Caja Abierta</span>
                    </div>
                    <p className="text-xs text-green-300">Por: {cashRegister.openedBy}</p>
                  </div>
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar Caja
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-red-500/20 border border-red-500 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-semibold">Caja Cerrada</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOpenModal(true)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Abrir Caja
                  </button>
                </>
              )}
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
                    disabled={product.stock === 0 || !cashRegister}
                    className={`
                      p-4 rounded-lg border text-left transition-all
                      ${product.stock === 0 || !cashRegister
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
                      disabled={processing || !cashRegister}
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

      {/* Modal Abrir Caja */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LogIn className="w-6 h-6 text-green-500" />
                Abrir Caja
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Nombre del Cajero</label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Monto Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={openCashRegister}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Abrir Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cerrar Caja */}
      {showCloseModal && cashRegister && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LogOut className="w-6 h-6 text-red-500" />
                Cerrar Caja
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Inicial:</span>
                  <span className="text-white font-semibold">${Number(cashRegister.openingAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ventas del Día:</span>
                  <span className="text-white font-semibold">{cashRegister.stats?.totalSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ingresos:</span>
                  <span className="text-green-400 font-semibold">${cashRegister.stats?.totalRevenue.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2">
                  <span className="text-white font-semibold">Monto Esperado:</span>
                  <span className="text-green-400 font-bold text-lg">${cashRegister.stats?.expectedAmount.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Quien cierra</label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Monto Real en Caja</label>
                <input
                  type="number"
                  step="0.01"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                />
              </div>

              {closingAmount && cashRegister.stats && (
                <div className={`rounded-lg p-3 ${
                  parseFloat(closingAmount) === cashRegister.stats.expectedAmount
                    ? 'bg-green-500/20 border border-green-500'
                    : 'bg-yellow-500/20 border border-yellow-500'
                }`}>
                  <p className={`text-sm font-medium ${
                    parseFloat(closingAmount) === cashRegister.stats.expectedAmount
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}>
                    {parseFloat(closingAmount) === cashRegister.stats.expectedAmount
                      ? '✓ El arqueo está correcto'
                      : `Diferencia: $${(parseFloat(closingAmount) - cashRegister.stats.expectedAmount).toFixed(2)}`
                    }
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={closeCashRegister}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cerrar Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial de Ventas */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full border border-slate-700 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <History className="w-6 h-6 text-blue-500" />
                Historial de Ventas
              </h2>
              <button
                onClick={() => setShowSalesModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {sales.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No hay ventas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sales.map((sale) => (
                    <div key={sale.id} className="bg-slate-900 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-semibold">Venta #{sale.id.slice(0, 8)}</p>
                          <p className="text-slate-400 text-sm">{new Date(sale.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">${Number(sale.total).toFixed(2)}</p>
                          <button
                            onClick={() => deleteSale(sale.id)}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mt-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-slate-700 pt-2 space-y-1">
                        {sale.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.product.name} x{item.quantity}</span>
                            <span className="text-slate-400">${Number(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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