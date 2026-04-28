import { ShoppingCart, LogIn, LogOut, History, AlertCircle, TrendingDown, DollarSign } from 'lucide-react';
import { CashRegister } from '../../../src/types/sale';
import { fmtARS } from '../../lib/format';

interface Props {
  cashRegister: CashRegister | null;
  onOpenCash: () => void;
  onCloseCash: () => void;
  onHistory: () => void;
  onExpense: () => void;
}

export default function POSTopbar({ cashRegister, onOpenCash, onCloseCash, onHistory, onExpense }: Props) {
  const isOpen = !!cashRegister;

  return (
    <header className="flex items-center justify-between px-5 h-14 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:block">Punto de Venta</span>
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {isOpen ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {cashRegister!.openedBy}
            </div>
            {cashRegister!.stats && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-xs">
                <DollarSign size={11} className="text-emerald-600" />
                <span className="tabular-nums text-gray-900 font-semibold">{fmtARS(cashRegister!.stats.expectedAmount)}</span>
                <span className="text-gray-400">esperado</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            <AlertCircle size={11} />
            Caja cerrada
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-semibold transition-all"
        >
          <History size={13} />
          <span className="hidden sm:block">Historial</span>
        </button>

        {isOpen && (
          <button
            onClick={onExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 text-xs font-semibold transition-all"
          >
            <TrendingDown size={13} />
            <span className="hidden sm:block">Egreso</span>
          </button>
        )}

        {isOpen ? (
          <button
            onClick={onCloseCash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-sm shadow-red-200"
          >
            <LogOut size={13} />
            <span className="hidden sm:block">Cerrar caja</span>
          </button>
        ) : (
          <button
            onClick={onOpenCash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-200"
          >
            <LogIn size={13} />
            <span className="hidden sm:block">Abrir caja</span>
          </button>
        )}
      </div>
    </header>
  );
}
