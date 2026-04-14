import { ShoppingCart, LogIn, LogOut, History, AlertCircle } from 'lucide-react';
import { CashRegister } from '../../../src/types/sale';

interface Props {
  cashRegister: CashRegister | null;
  onOpenCash: () => void;
  onCloseCash: () => void;
  onHistory: () => void;
}

export default function POSTopbar({ cashRegister, onOpenCash, onCloseCash, onHistory }: Props) {
  const isOpen = !!cashRegister;

  return (
    <header className="flex items-center justify-between px-5 h-14 border-b border-slate-800 bg-slate-900 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
          <ShoppingCart size={18} />
        </div>
        <h1 className="text-base font-bold text-white tracking-tight">
          Punto de Venta
        </h1>

        {/* Cash status pill */}
        {isOpen ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Caja abierta · {cashRegister!.openedBy}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertCircle size={12} />
            Caja cerrada
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <History size={14} />
          Historial
        </button>

        {isOpen ? (
          <button
            onClick={onCloseCash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
          >
            <LogOut size={14} />
            Cerrar caja
          </button>
        ) : (
          <button
            onClick={onOpenCash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
          >
            <LogIn size={14} />
            Abrir caja
          </button>
        )}
      </div>
    </header>
  );
}
