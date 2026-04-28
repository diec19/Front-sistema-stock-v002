import { ShoppingCart, Zap } from 'lucide-react';
import { SaleItem } from '../../../src/types/sale';
import { fmtARS } from '../../lib/format';
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

export default function CartPanel({
  saleItems, processing, cashOpen,
  onUpdateQty, onRemove, onComplete, onCancel,
}: Props) {
  const total     = saleItems.reduce((s, i) => s + i.subtotal, 0);
  const itemCount = saleItems.reduce((s, i) => s + i.quantity, 0);
  const isEmpty   = saleItems.length === 0;

  return (
    <aside className="flex flex-col bg-white border-l border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <ShoppingCart size={13} className="text-emerald-600" />
          </div>
          <span className="text-sm font-bold text-gray-900">Venta actual</span>
          {itemCount > 0 && (
            <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {itemCount}
            </span>
          )}
        </div>
        {!isEmpty && (
          <button onClick={onCancel} className="text-[11px] font-medium text-gray-400 hover:text-red-500 transition-colors">
            Limpiar
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
              <ShoppingCart size={28} strokeWidth={1} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Carrito vacío</p>
              <p className="text-xs text-gray-400 mt-1">
                {cashOpen ? 'Seleccioná un producto para agregar' : 'Abrí la caja para empezar a vender'}
              </p>
            </div>
          </div>
        ) : (
          saleItems.map(item => (
            <CartItem key={item.productId} item={item} onQtyChange={onUpdateQty} onRemove={onRemove} />
          ))
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="border-t border-gray-200 p-4 flex flex-col gap-3 flex-shrink-0 bg-white">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-1.5">
            <div className="text-xs text-gray-400">
              {saleItems.length} {saleItems.length === 1 ? 'producto' : 'productos'} · {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-500">Total</span>
              <span className="text-2xl font-black text-gray-900 tabular-nums">{fmtARS(total)}</span>
            </div>
          </div>

          <button
            onClick={onComplete}
            disabled={processing || !cashOpen}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md shadow-emerald-200"
          >
            {processing ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando…</>
            ) : (
              <><Zap size={15} />Cobrar {fmtARS(total)}</>
            )}
          </button>

          <button
            onClick={onCancel}
            className="w-full text-xs font-medium text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl py-2 transition-colors"
          >
            Cancelar venta
          </button>
        </div>
      )}
    </aside>
  );
}
