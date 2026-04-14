'use client';

import { useState, useEffect } from 'react';
import { productService, salesService, cashRegisterService } from '../../src/services/api';
import { Product } from '../../src/types/product';
import { SaleItem, SaleStats, CashRegister, Sale } from '../../src/types/sale';
import api from '../../src/services/api';

// Components
import POSTopbar            from '../../src/components/pos/POSTopbar';
//import StatsStrip           from '../../src/components/pos/StatsStrip';
import ProductsPanel        from '../../src/components/pos/ProductsPanel';
import CartPanel            from '../../src/components/pos//CartPanel';
import SuccessToast         from '../../src/components/pos/SuccessToast';
import AuthModal            from '../../src/components/modals/AuthModal';
import OpenCashModal        from '../../src/components/modals/OpenCashModal';
import CloseCashModal       from '../../src/components/modals/CloseCashModal';
import SalesHistoryModal    from '../../src/components/modals/SalesHistoryModal';

export default function POSPage() {
  // ── Data state ────────────────────────────────────────────
  const [products,     setProducts]     = useState<Product[]>([]);
  const [stats,        setStats]        = useState<SaleStats>({ totalSales: 0, totalRevenue: 0, todaySales: 0, todayRevenue: 0 });
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [sales,        setSales]        = useState<Sale[]>([]);
  const [saleItems,    setSaleItems]    = useState<SaleItem[]>([]);

  // ── UI state ──────────────────────────────────────────────
  const [loading,        setLoading]        = useState(true);
  const [processing,     setProcessing]     = useState(false);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [showOpenModal,  setShowOpenModal]  = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showAuthModal,  setShowAuthModal]  = useState(false);

  // ── Form state ────────────────────────────────────────────
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [cashierName,   setCashierName]   = useState('');
  const [authUsername,  setAuthUsername]  = useState('');
  const [authPassword,  setAuthPassword]  = useState('');

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Data loaders ──────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const [pd, sd] = await Promise.all([
        productService.getAll('', 1, 50),
        salesService.getStats(),
      ]);
      setProducts(pd.data);
      setStats(sd);
      try { setCashRegister(await cashRegisterService.getCurrent()); }
      catch { setCashRegister(null); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const searchProducts = async (s: string) => {
    try {
      const d = await productService.getAll(s, 1, 50);
      setProducts(d.data);
    } catch (e) { console.error(e); }
  };

  const loadSales = async () => {
    try {
      const r = await salesService.getAll(1, 20);
      setSales(r.data);
      setShowSalesModal(true);
    } catch (e) { console.error(e); }
  };

  // ── Auth / history ────────────────────────────────────────
  const verifyAndShowHistory = async () => {
    try {
      const res = await api.post('/api/auth/login', { username: authUsername, password: authPassword });
      if (res.data.user.role === 'admin') {
        await loadSales();
        setShowAuthModal(false);
        setAuthUsername('');
        setAuthPassword('');
      } else {
        alert('Solo administradores pueden ver el historial');
      }
    } catch { alert('Credenciales incorrectas'); }
  };

  // ── Cash register ─────────────────────────────────────────
  const openCashRegister = async () => {
    if (!cashierName || !openingAmount) { alert('Completá todos los campos'); return; }
    try {
      setCashRegister(await cashRegisterService.open({
        openingAmount: parseFloat(openingAmount),
        openedBy: cashierName,
      }));
      setShowOpenModal(false);
      setOpeningAmount('');
      setCashierName('');
      await loadData();
    } catch (e: any) { alert(e.response?.data?.error || 'Error al abrir la caja'); }
  };

  const closeCashRegister = async () => {
    if (!cashRegister || !closingAmount || !cashierName) { alert('Completá todos los campos'); return; }
    try {
      await cashRegisterService.close(cashRegister.id, {
        closingAmount: parseFloat(closingAmount),
        closedBy: cashierName,
      });
      setCashRegister(null);
      setShowCloseModal(false);
      setClosingAmount('');
      setCashierName('');
      setSaleItems([]);
      await loadData();
    } catch (e: any) { alert(e.response?.data?.error || 'Error al cerrar la caja'); }
  };

  // ── Cart ──────────────────────────────────────────────────
  const addToSale = (product: Product) => {
    if (!cashRegister) { alert('Abrí la caja primero'); return; }
    const existing = saleItems.find(i => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) { alert(`Solo hay ${product.stock} unidades.`); return; }
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      if (product.stock === 0) { alert('Sin stock disponible.'); return; }
      const price = typeof product.price === 'number' ? product.price : parseFloat(product.price.toString());
      setSaleItems(prev => [...prev, {
        productId: product.id, productName: product.name,
        quantity: 1, unitPrice: price, subtotal: price,
      }]);
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) { removeItem(productId); return; }
    const p = products.find(p => p.id === productId);
    if (p && qty > p.stock) { alert(`Solo hay ${p.stock} unidades.`); return; }
    setSaleItems(prev => prev.map(i =>
      i.productId === productId ? { ...i, quantity: qty, subtotal: i.unitPrice * qty } : i
    ));
  };

  const removeItem = (productId: string) =>
    setSaleItems(prev => prev.filter(i => i.productId !== productId));

  const cancelSale = () => {
    if (saleItems.length && confirm('¿Cancelar esta venta?')) setSaleItems([]);
  };

  const completeSale = async () => {
    if (!saleItems.length) { alert('Agregá productos primero'); return; }
    if (!cashRegister)     { alert('Abrí la caja primero'); return; }
    try {
      setProcessing(true);
      await salesService.create({
        items: saleItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSaleItems([]);
      await loadData();
    } catch (e: any) { alert(e.response?.data?.error || 'Error al procesar'); }
    finally { setProcessing(false); }
  };

  // ── Sales history ─────────────────────────────────────────
  const deleteSale = async (id: string) => {
    if (!confirm('¿Eliminar esta venta? Se devolverá el stock.')) return;
    try {
      await salesService.delete(id);
      await loadSales();
      await loadData();
    } catch (e: any) { alert(e.response?.data?.error || 'Error al eliminar'); }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando POS…</span>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">

      <POSTopbar
        cashRegister={cashRegister}
        onOpenCash={() => setShowOpenModal(true)}
        onCloseCash={() => setShowCloseModal(true)}
        onHistory={() => setShowAuthModal(true)}
      />

      {/*<StatsStrip stats={stats} />*/}

      {/* Main area: products + cart */}
      <div className="flex-1 grid grid-cols-[1fr_320px] overflow-hidden">
        <ProductsPanel
          products={products}
          saleItems={saleItems}
          searchTerm={searchTerm}
          cashOpen={!!cashRegister}
          onSearch={setSearchTerm}
          onAddProduct={addToSale}
        />
        <CartPanel
          saleItems={saleItems}
          processing={processing}
          cashOpen={!!cashRegister}
          onUpdateQty={updateQuantity}
          onRemove={removeItem}
          onComplete={completeSale}
          onCancel={cancelSale}
        />
      </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          username={authUsername}
          password={authPassword}
          onChangeUsername={setAuthUsername}
          onChangePassword={setAuthPassword}
          onConfirm={verifyAndShowHistory}
          onClose={() => { setShowAuthModal(false); setAuthUsername(''); setAuthPassword(''); }}
        />
      )}

      {showOpenModal && (
        <OpenCashModal
          cashierName={cashierName}
          openingAmount={openingAmount}
          onChangeCashier={setCashierName}
          onChangeAmount={setOpeningAmount}
          onConfirm={openCashRegister}
          onClose={() => { setShowOpenModal(false); setCashierName(''); setOpeningAmount(''); }}
        />
      )}

      {showCloseModal && cashRegister && (
        <CloseCashModal
          cashRegister={cashRegister}
          cashierName={cashierName}
          closingAmount={closingAmount}
          onChangeCashier={setCashierName}
          onChangeAmount={setClosingAmount}
          onConfirm={closeCashRegister}
          onClose={() => { setShowCloseModal(false); setCashierName(''); setClosingAmount(''); }}
        />
      )}

      {showSalesModal && (
        <SalesHistoryModal
          sales={sales}
          onDelete={deleteSale}
          onClose={() => setShowSalesModal(false)}
        />
      )}

      <SuccessToast show={showSuccess} />
    </div>
  );
}