'use client';

import { useState, useEffect, useRef } from 'react';
import { productService, salesService, cashRegisterService, expenseService } from '../../src/services/api';
import { Product } from '../../src/types/product';
import { SaleItem, SaleStats, CashRegister, SessionEntry } from '../../src/types/sale';
import api from '../../src/services/api';
import { fmtARS } from '../../src/lib/format';

// Components
import POSTopbar            from '../../src/components/pos/POSTopbar';
import ProductsPanel        from '../../src/components/pos/ProductsPanel';
import CartPanel            from '../../src/components/pos/CartPanel';
import SuccessToast         from '../../src/components/pos/SuccessToast';
import AuthModal            from '../../src/components/modals/AuthModal';
import OpenCashModal        from '../../src/components/modals/OpenCashModal';
import CloseCashModal       from '../../src/components/modals/CloseCashModal';
import SalesHistoryModal    from '../../src/components/modals/SalesHistoryModal';
import PaymentModal, { PaymentMethod } from '../../src/components/modals/PaymentModal';
import ExpenseModal, { ExpensePaymentMethod } from '../../src/components/modals/ExpenseModal';

export default function POSPage() {
  // ── Data state ────────────────────────────────────────────
  const [products,        setProducts]        = useState<Product[]>([]);
  const [stats,           setStats]           = useState<SaleStats>({ totalSales: 0, totalRevenue: 0, todaySales: 0, todayRevenue: 0 });
  const [cashRegister,    setCashRegister]    = useState<CashRegister | null>(null);
  const [sessionHistory,  setSessionHistory]  = useState<SessionEntry[]>([]);
  const [saleItems,       setSaleItems]       = useState<SaleItem[]>([]);

  // ── UI state ──────────────────────────────────────────────
  const [loading,           setLoading]           = useState(true);
  const [processing,        setProcessing]        = useState(false);
  const [searchTerm,        setSearchTerm]        = useState('');
  const [showSuccess,       setShowSuccess]       = useState(false);
  const [showOpenModal,     setShowOpenModal]     = useState(false);
  const [showCloseModal,    setShowCloseModal]    = useState(false);
  const [showSalesModal,    setShowSalesModal]    = useState(false);
  const [showAuthModal,        setShowAuthModal]        = useState(false);
  const [showOpenAuthModal,    setShowOpenAuthModal]    = useState(false);
  const [showExpenseAuthModal, setShowExpenseAuthModal] = useState(false);
  const [showPaymentModal,     setShowPaymentModal]     = useState(false);
  const [showExpenseModal,     setShowExpenseModal]     = useState(false);

  // ── Form state ────────────────────────────────────────────
  const [openingAmount,         setOpeningAmount]         = useState('');
  const [closingAmount,         setClosingAmount]         = useState('');
  const [cashierName,           setCashierName]           = useState('');
  const [authUsername,          setAuthUsername]          = useState('');
  const [authPassword,          setAuthPassword]          = useState('');
  const [expenseAmount,         setExpenseAmount]         = useState('');
  const [expenseDescription,    setExpenseDescription]    = useState('');
  const [expenseOperator,       setExpenseOperator]       = useState('');
  const [expensePaymentMethod,  setExpensePaymentMethod]  = useState<ExpensePaymentMethod>('cash');
  const [expenseProcessing,     setExpenseProcessing]     = useState(false);

  // ── Refs ──────────────────────────────────────────────────
  const audioContextRef = useRef<AudioContext | null>(null);

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Audio ─────────────────────────────────────────────────
  const playBeep = (freq: number, duration: number, volume = 0.4) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = volume;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
      if (window.navigator?.vibrate) window.navigator.vibrate(40);
    } catch { /* ignore */ }
  };

  // ── Data loaders ──────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const [pd, sd] = await Promise.all([
        productService.getAll('', 1, 100),
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
      const d = await productService.getAll(s, 1, 100);
      setProducts(d.data);
    } catch (e) { console.error(e); }
  };

  const loadSessionHistory = async (register: CashRegister | null = cashRegister) => {
    if (!register) { setSessionHistory([]); setShowSalesModal(true); return; }
    try {
      const [salesRes, expensesRes] = await Promise.all([
        salesService.getAll(1, 200, register.id),
        expenseService.getAll(register.id),
      ]);
      const entries: SessionEntry[] = [
        ...salesRes.data.map(s => ({ kind: 'sale'    as const, data: s })),
        ...expensesRes.data.map(e => ({ kind: 'expense' as const, data: e })),
      ].sort((a, b) =>
        new Date((b.data as any).createdAt).getTime() -
        new Date((a.data as any).createdAt).getTime()
      );
      setSessionHistory(entries);
      setShowSalesModal(true);
    } catch (e) { console.error(e); }
  };

  // ── Auth ──────────────────────────────────────────────────
  const verifyAndShowHistory = async () => {
    try {
      const res = await api.post('/api/auth/login', { username: authUsername, password: authPassword });
      if (res.data.user.role === 'admin') {
        await loadSessionHistory();
        setShowAuthModal(false);
        setAuthUsername(''); setAuthPassword('');
      } else {
        alert('Solo administradores pueden ver el historial');
      }
    } catch { alert('Credenciales incorrectas'); }
  };

  const verifyAndShowExpense = async () => {
    try {
      const res = await api.post('/api/auth/login', { username: authUsername, password: authPassword });
      if (res.data.user.role === 'admin') {
        setShowExpenseAuthModal(false);
        setAuthUsername(''); setAuthPassword('');
        setShowExpenseModal(true);
      } else {
        alert('Solo administradores pueden registrar egresos');
      }
    } catch { alert('Credenciales incorrectas'); }
  };

  const verifyAndOpenCash = async () => {
    try {
      const res = await api.post('/api/auth/login', { username: authUsername, password: authPassword });
      if (res.data.user.role === 'admin') {
        setShowOpenAuthModal(false);
        setAuthUsername(''); setAuthPassword('');
        setShowOpenModal(true);
      } else {
        alert('Solo administradores pueden abrir la caja');
        setShowOpenAuthModal(false);
        setAuthUsername(''); setAuthPassword('');
      }
    } catch { alert('Credenciales incorrectas'); }
  };

  // ── Cash register ─────────────────────────────────────────
  const openCashRegister = async () => {
    if (!cashierName || !openingAmount) { alert('Completá todos los campos'); return; }
    try {
      setCashRegister(await cashRegisterService.open({
        openingAmount: parseFloat(openingAmount.replace(',', '.')),
        openedBy: cashierName,
      }));
      setShowOpenModal(false);
      setOpeningAmount(''); setCashierName('');
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al abrir la caja');
    }
  };

  const closeCashRegister = async () => {
    if (!cashRegister || !closingAmount || !cashierName) { alert('Completá todos los campos'); return; }
    try {
      await cashRegisterService.close(cashRegister.id, {
        closingAmount: parseFloat(closingAmount.replace(',', '.')),
        closedBy: cashierName,
      });
      setCashRegister(null);
      setSessionHistory([]);
      setShowCloseModal(false);
      setClosingAmount(''); setCashierName('');
      setSaleItems([]);
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al cerrar la caja');
    }
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
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: price,
        subtotal: price,
      }]);
    }
    playBeep(1200, 0.12);
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

  const handleCompleteSale = () => {
    if (!saleItems.length) { alert('Agregá productos primero'); return; }
    if (!cashRegister) { alert('Abrí la caja primero'); return; }
    setShowPaymentModal(true);
  };

  const completeSale = async (method: PaymentMethod, phone?: string) => {
    const snapshot = [...saleItems];
    const total    = snapshot.reduce((s, i) => s + i.subtotal, 0);
    try {
      setProcessing(true);
      await salesService.create({
        items: snapshot.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        paymentMethod: method,
      });
      playBeep(880, 0.4, 0.3);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSaleItems([]);
      setShowPaymentModal(false);
      await loadData();

      if (phone) {
        const digits = phone.replace(/\D/g, '');
        const normalized = digits.startsWith('54') ? digits : digits.startsWith('0') ? '54' + digits.slice(1) : '54' + digits;
        const now  = new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const lines = [
          '🧾 *Comprobante de venta*',
          `📅 ${now}`,
          '',
          '*Detalle:*',
          ...snapshot.map(i => `• ${i.productName} x${i.quantity}  →  ${fmtARS(i.subtotal)}`),
          '',
          `💰 *Total: ${fmtARS(total)}*`,
          `Pago: ${method === 'cash' ? 'Efectivo 💵' : 'Billetera virtual 📱'}`,
        ];
        window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
      }
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al procesar');
    } finally {
      setProcessing(false);
    }
  };

  // ── Expenses ──────────────────────────────────────────────
  const registerExpense = async () => {
    if (!expenseAmount || !expenseDescription || !expenseOperator) {
      alert('Completá todos los campos');
      return;
    }
    try {
      setExpenseProcessing(true);
      await expenseService.create({
        amount: parseFloat(expenseAmount.replace(',', '.')),
        description: expenseDescription,
        createdBy: expenseOperator,
        paymentMethod: expensePaymentMethod,
      });
      setShowExpenseModal(false);
      setExpenseAmount(''); setExpenseDescription('');
      setExpenseOperator(''); setExpensePaymentMethod('cash');
      try {
        const cr = await cashRegisterService.getCurrent();
        setCashRegister(cr);
        if (showSalesModal) await loadSessionHistory(cr);
      } catch { /* caja cerrada */ }
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al registrar el egreso');
    } finally {
      setExpenseProcessing(false);
    }
  };

  // ── History actions ───────────────────────────────────────
  const deleteSale = async (id: string) => {
    if (!confirm('¿Anular esta venta? Se devolverá el stock.')) return;
    try {
      await salesService.delete(id);
      await Promise.all([loadSessionHistory(), loadData()]);
    } catch (e: any) { alert(e.response?.data?.error || 'Error al anular'); }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('¿Eliminar este egreso?')) return;
    try {
      await expenseService.delete(id);
      try {
        const cr = await cashRegisterService.getCurrent();
        setCashRegister(cr);
        await loadSessionHistory(cr);
      } catch { await loadSessionHistory(); }
    } catch (e: any) { alert(e.response?.data?.error || 'Error al eliminar el egreso'); }
  };

  const saleTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-500">Cargando POS…</span>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <POSTopbar
        cashRegister={cashRegister}
        onOpenCash={() => setShowOpenAuthModal(true)}
        onCloseCash={() => setShowCloseModal(true)}
        onHistory={() => setShowAuthModal(true)}
        onExpense={() => setShowExpenseAuthModal(true)}
      />

      <div className="grid grid-cols-[1fr_380px]" style={{ height: 'calc(100vh - 56px)' }}>
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
          onComplete={handleCompleteSale}
          onCancel={cancelSale}
        />
      </div>

      {/* Auth para egresos */}
      {showExpenseAuthModal && (
        <AuthModal
          username={authUsername}
          password={authPassword}
          onChangeUsername={setAuthUsername}
          onChangePassword={setAuthPassword}
          onConfirm={verifyAndShowExpense}
          onClose={() => { setShowExpenseAuthModal(false); setAuthUsername(''); setAuthPassword(''); }}
          title="Autenticación requerida"
          message="Solo administradores pueden registrar egresos"
        />
      )}

      {/* Auth para abrir caja */}
      {showOpenAuthModal && (
        <AuthModal
          username={authUsername}
          password={authPassword}
          onChangeUsername={setAuthUsername}
          onChangePassword={setAuthPassword}
          onConfirm={verifyAndOpenCash}
          onClose={() => { setShowOpenAuthModal(false); setAuthUsername(''); setAuthPassword(''); }}
          title="Autenticación requerida"
          message="Solo administradores pueden abrir la caja"
        />
      )}

      {/* Auth para historial */}
      {showAuthModal && (
        <AuthModal
          username={authUsername}
          password={authPassword}
          onChangeUsername={setAuthUsername}
          onChangePassword={setAuthPassword}
          onConfirm={verifyAndShowHistory}
          onClose={() => { setShowAuthModal(false); setAuthUsername(''); setAuthPassword(''); }}
          title="Autenticación requerida"
          message="Solo administradores pueden ver el historial"
        />
      )}

      {/* Apertura de caja */}
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

      {/* Cierre de caja */}
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

      {/* Pago */}
      {showPaymentModal && (
        <PaymentModal
          total={saleTotal}
          onConfirm={completeSale}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Historial de sesión */}
      {showSalesModal && (
        <SalesHistoryModal
          entries={sessionHistory}
          onDeleteSale={deleteSale}
          onDeleteExpense={deleteExpense}
          onClose={() => setShowSalesModal(false)}
        />
      )}

      {/* Egreso */}
      {showExpenseModal && (
        <ExpenseModal
          amount={expenseAmount}
          description={expenseDescription}
          operatorName={expenseOperator}
          paymentMethod={expensePaymentMethod}
          processing={expenseProcessing}
          onChangeAmount={setExpenseAmount}
          onChangeDescription={setExpenseDescription}
          onChangeOperator={setExpenseOperator}
          onChangePaymentMethod={setExpensePaymentMethod}
          onConfirm={registerExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setExpenseAmount(''); setExpenseDescription('');
            setExpenseOperator(''); setExpensePaymentMethod('cash');
          }}
        />
      )}

      <SuccessToast show={showSuccess} />
    </div>
  );
}
