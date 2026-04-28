'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  ShoppingBag, Package, Calendar, AlertCircle, RefreshCw,
} from 'lucide-react';
import { reportService } from '../../src/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Summary     { totalSales: number; totalRevenue: number; totalExpenses: number; netBalance: number; }
interface TopProduct  { productId: string; productName: string; sku: string; totalQuantity: number; totalRevenue: number; }
interface SalesByDay  { date: string; total: number; count: number; }
interface SalesByHour { hour: number; label: string; total: number; count: number; }
interface CashReg     { id: string; status: string; openedBy: string; closedBy?: string; openedAt: string; closedAt?: string; openingAmount: number; closingAmount?: number; totalSales: number; totalRevenue: number; totalExpenses: number; expectedAmount: number; }
interface ExpenseItem { id: string; description: string; createdBy: string; amount: number; createdAt: string; cashRegister: { openedBy: string; openedAt: string }; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

const fmtDateFull = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PERIODS = [
  { label: 'Hoy',    value: 1  },
  { label: '7 días', value: 7  },
  { label: '30 días',value: 30 },
  { label: 'Todo',   value: 0  },
];

const REFRESH_INTERVAL = 30;

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({ title, value, sub, icon: Icon, accent }: {
  title: string; value: string; sub?: string; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-2.5 rounded-xl shrink-0 ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-black text-gray-900 tabular-nums truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

interface BarData { label: string; total: number; count: number; sublabel?: string; }

function BarChart({ data, emptyText = 'Sin datos' }: { data: BarData[]; emptyText?: string }) {
  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const step     = Math.max(1, Math.floor(data.length / 8));
  const hasData  = data.some(d => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
        <Calendar size={28} strokeWidth={1.2} />
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-[3px] h-40">
        {data.map((d, i) => {
          const pct = (d.total / maxTotal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
              {d.total > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center">
                  <span className="font-bold block">{fmt(d.total)}</span>
                  <span className="text-gray-400">{d.count} venta{d.count !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div
                className={`w-full rounded-t-sm transition-colors ${
                  d.total > 0 ? 'bg-emerald-400/50 group-hover:bg-emerald-500' : 'bg-gray-100'
                }`}
                style={{ height: `${Math.max(pct, d.total > 0 ? 4 : 1)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex mt-1.5 gap-[3px]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex justify-center">
            {i % step === 0 && (
              <span className="text-[9px] text-gray-400 truncate">{d.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-gray-400">$0</span>
        <span className="text-[9px] text-gray-400">{fmt(maxTotal)}</span>
      </div>
    </div>
  );
}

// ── Top Products ──────────────────────────────────────────────────────────────

function TopProductsList({ data }: { data: TopProduct[] }) {
  const maxQty = Math.max(...data.map(p => p.totalQuantity), 1);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
        <Package size={28} strokeWidth={1.2} />
        <p className="text-sm">Sin ventas en el período</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {data.map((p, i) => (
        <div key={p.productId} className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 w-4 shrink-0 text-right">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-900 font-medium truncate pr-2">{p.productName}</span>
              <span className="text-xs text-gray-500 shrink-0">{p.totalQuantity} un.</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${(p.totalQuantity / maxQty) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-emerald-600 tabular-nums font-semibold shrink-0 w-20 text-right">
            {fmt(p.totalRevenue)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Countdown ring ────────────────────────────────────────────────────────────

function LiveIndicator({ countdown }: { countdown: number }) {
  const pct   = countdown / REFRESH_INTERVAL;
  const r     = 8;
  const circ  = 2 * Math.PI * r;
  const dash  = circ * pct;

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
          <circle
            cx="10" cy="10" r={r} fill="none"
            stroke="#22c55e" strokeWidth="2.5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center w-1.5 h-1.5 m-auto rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <span className="text-xs text-emerald-600 font-semibold">En vivo</span>
      <span className="text-xs text-gray-500">· actualiza en {countdown}s</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const [period,      setPeriod]      = useState(1);
  const [summary,     setSummary]     = useState<Summary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesByDay,  setSalesByDay]  = useState<SalesByDay[]>([]);
  const [salesByHour, setSalesByHour] = useState<SalesByHour[]>([]);
  const [cashRegs,    setCashRegs]    = useState<CashReg[]>([]);
  const [expenses,    setExpenses]    = useState<ExpenseItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');
  const [countdown,   setCountdown]   = useState(REFRESH_INTERVAL);

  const periodRef = useRef(period);
  periodRef.current = period;

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const p = periodRef.current;
      const [s, tp, sbd, sbh, cr, exp] = await Promise.all([
        reportService.getSummary(p),
        reportService.getTopProducts(p),
        reportService.getSalesByDay(p),
        reportService.getSalesByHour(),
        reportService.getCashRegisters(),
        reportService.getExpenses(p),
      ]);
      setSummary(s);
      setTopProducts(tp);
      setSalesByDay(sbd);
      setSalesByHour(sbh);
      setCashRegs(cr);
      setExpenses(exp.data);
    } catch {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(REFRESH_INTERVAL);
    }
  }, []);

  useEffect(() => { loadAll(); }, [period, loadAll]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadAll(true);
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [loadAll]);

  const dailyBars: BarData[] = salesByDay.map(d => ({
    label: fmtDate(d.date),
    total: d.total,
    count: d.count,
  }));

  const hourlyBars: BarData[] = salesByHour.map(h => ({
    label: h.hour % 3 === 0 ? h.label : '',
    total: h.total,
    count: h.count,
  }));

  const isToday    = period === 1;
  const chartBars  = isToday ? hourlyBars : dailyBars;
  const chartTitle = isToday
    ? 'Ventas de hoy por hora'
    : `Ventas por día — últimos ${salesByDay.length} días`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando reportes…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500 max-w-sm text-center">
          <AlertCircle size={36} className="text-red-500" />
          <p className="text-sm">{error}</p>
          <button onClick={() => loadAll()} className="text-xs px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const positiveBalance = (summary?.netBalance ?? 0) >= 0;

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2 rounded-xl">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
            <p className="text-xs text-gray-500">Resumen de actividad del negocio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LiveIndicator countdown={countdown} />

          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  period === p.value
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Ventas"
          value={String(summary?.totalSales ?? 0)}
          sub="transacciones"
          icon={ShoppingBag}
          accent="bg-sky-500"
        />
        <KPICard
          title="Ingresos"
          value={fmt(summary?.totalRevenue ?? 0)}
          sub="ventas cobradas"
          icon={TrendingUp}
          accent="bg-emerald-500"
        />
        <KPICard
          title="Egresos"
          value={fmt(summary?.totalExpenses ?? 0)}
          sub="retiros de caja"
          icon={TrendingDown}
          accent="bg-orange-500"
        />
        <KPICard
          title="Balance neto"
          value={fmt(summary?.netBalance ?? 0)}
          sub={positiveBalance ? 'resultado positivo' : 'resultado negativo'}
          icon={DollarSign}
          accent={positiveBalance ? 'bg-purple-500' : 'bg-red-500'}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-[1fr_380px] gap-4">
        <Section title={chartTitle} subtitle={isToday ? 'Cada barra representa 1 hora del día' : undefined}>
          <BarChart
            data={chartBars}
            emptyText={isToday ? 'Sin ventas hoy todavía' : 'Sin ventas en el período'}
          />
        </Section>

        <Section title="Productos más vendidos" subtitle="Por unidades vendidas">
          <TopProductsList data={topProducts} />
        </Section>
      </div>

      {/* ── Hoy: tabla de ventas por hora ── */}
      {isToday && (
        <Section title="Detalle por hora — hoy" subtitle="Todas las horas con actividad">
          {salesByHour.every(h => h.count === 0) ? (
            <p className="text-sm text-gray-400 py-6 text-center">Sin ventas registradas hoy</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Hora', 'Ventas', 'Ingresos'].map(h => (
                      <th key={h} className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wide pb-3 pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesByHour.filter(h => h.count > 0).map(h => (
                    <tr key={h.hour} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-6 text-gray-700 font-mono">{h.label}</td>
                      <td className="py-2.5 pr-6 text-gray-500 tabular-nums">{h.count}</td>
                      <td className="py-2.5 text-emerald-600 font-semibold tabular-nums">{fmt(h.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td className="pt-3 text-gray-500 font-semibold text-xs uppercase">Total</td>
                    <td className="pt-3 text-gray-900 font-bold tabular-nums">
                      {salesByHour.reduce((s, h) => s + h.count, 0)}
                    </td>
                    <td className="pt-3 text-emerald-600 font-black tabular-nums">
                      {fmt(salesByHour.reduce((s, h) => s + h.total, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Section>
      )}

      {/* ── Arqueos de caja ── */}
      <Section title="Arqueos de caja" subtitle="Últimas 20 sesiones">
        {cashRegs.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Sin sesiones registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Apertura', 'Cajero', 'Ventas', 'Ingresos', 'Egresos', 'Esperado', 'Real', 'Estado'].map(h => (
                    <th key={h} className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cashRegs.map(r => {
                  const diff = r.closingAmount != null ? r.closingAmount - r.expectedAmount : null;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{fmtDateFull(r.openedAt)}</td>
                      <td className="py-3 pr-4 text-gray-900 font-medium">{r.openedBy}</td>
                      <td className="py-3 pr-4 text-gray-700 tabular-nums">{r.totalSales}</td>
                      <td className="py-3 pr-4 text-emerald-600 tabular-nums font-semibold">{fmt(r.totalRevenue)}</td>
                      <td className="py-3 pr-4 text-orange-500 tabular-nums font-semibold">
                        {r.totalExpenses > 0 ? `-${fmt(r.totalExpenses)}` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 tabular-nums">{fmt(r.expectedAmount)}</td>
                      <td className="py-3 pr-4 tabular-nums">
                        {r.closingAmount != null ? (
                          <span className={diff === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                            {fmt(r.closingAmount)}
                            {diff !== null && diff !== 0 && (
                              <span className="text-[10px] ml-1 opacity-70">({diff > 0 ? '+' : ''}{fmt(diff)})</span>
                            )}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.status === 'open' ? 'Abierta' : 'Cerrada'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Egresos ── */}
      <Section
        title="Historial de egresos"
        subtitle={period ? `Últimos ${period} día${period !== 1 ? 's' : ''}` : 'Todos los registros'}
      >
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Sin egresos en el período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Fecha', 'Concepto', 'Registrado por', 'Sesión de caja', 'Monto'].map(h => (
                    <th key={h} className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{fmtDateFull(e.createdAt)}</td>
                    <td className="py-3 pr-4 text-gray-900">{e.description}</td>
                    <td className="py-3 pr-4 text-gray-700">{e.createdBy}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{e.cashRegister.openedBy}</td>
                    <td className="py-3 font-bold text-orange-500 tabular-nums">-{fmt(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

    </div>
  );
}
