import { ShoppingCart, DollarSign, TrendingUp, BarChart2 } from 'lucide-react';
import { SaleStats } from '../../../src/types/sale';

const fmt = (n: number) => `$${n.toFixed(2)}`;

interface Props {
  stats: SaleStats;
}

const STATS = (stats: SaleStats) => [
  {
    icon: <ShoppingCart size={15} />,
    label: 'Ventas totales',
    value: String(stats.totalSales),
    accent: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: <DollarSign size={15} />,
    label: 'Ingresos totales',
    value: fmt(stats.totalRevenue),
    accent: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: <TrendingUp size={15} />,
    label: 'Ventas hoy',
    value: String(stats.todaySales),
    accent: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    icon: <BarChart2 size={15} />,
    label: 'Ingresos hoy',
    value: fmt(stats.todayRevenue),
    accent: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
];

export default function StatsStrip({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 border-b border-slate-800">
      {STATS(stats).map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-3 border-r border-slate-800 last:border-r-0 bg-slate-900/60"
        >
          <div className={`${s.bg} ${s.accent} p-2 rounded-lg flex-shrink-0`}>
            {s.icon}
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              {s.label}
            </p>
            <p className={`text-lg font-bold tabular-nums leading-tight ${s.accent}`}>
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
