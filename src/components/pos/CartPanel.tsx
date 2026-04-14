import { ShoppingCart, CheckCircle, ChevronRight } from 'lucide-react';
import { SaleItem } from '../../../src/types/sale';
import CartItem from './CartItem';

interface Props {
  saleItems: SaleItem[];
  processing: boolean;
  cashOpen: boolean;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onComplete: () => void;
  onCancel: () => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export default function CartPanel({
  saleItems, processing, cashOpen,
  onUpdateQty, onRemove, onComplete, onCancel,
}: Props) {
  const total     = saleItems.reduce((s, i) => s + i.subtotal, 0);
  const itemCount = saleItems.reduce((s, i) => s + i.quantity, 0);
  const isEmpty   = saleItems.length === 0;

  return (
    <aside className="flex flex-col bg-slate-900/80 border-l border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Venta actual</span>
          {itemCount > 0 && (
            <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        {!isEmpty && (
          <button
            onClick={onCancel}
            className="text-[11px] font-medium text-slate-500 hover:text-red-400 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600 px-6 text-center">
            <ShoppingCart size={36} strokeWidth={1.2} />
            <div>
              <p className="text-sm font-semibold text-slate-400">Carrito vacío</p>
              <p className="text-xs text-slate-600 mt-1">
                Seleccioná productos del panel izquierdo
              </p>
            </div>
          </div>
        ) : (
          saleItems.map(item => (
            <CartItem
              key={item.productId}
              item={item}
              onQtyChange={onUpdateQty}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="border-t border-slate-800 p-4 flex flex-col gap-3 flex-shrink-0">
          {/* Totals */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'ítem' : 'ítems'})</span>
              <span className="tabular-nums">{fmt(total)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-2xl font-black text-emerald-400 tabular-nums">
                {fmt(total)}
              </span>
            </div>
          </div>

          {/* Complete */}
          <button
            onClick={onComplete}
            disabled={processing || !cashOpen}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando…
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Cobrar {fmt(total)}
                <ChevronRight size={14} className="ml-auto" />
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="w-full text-xs font-medium text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/40 rounded-lg py-2 transition-colors"
          >
            Cancelar venta
          </button>
        </div>
      )}
    </aside>
  );
}
