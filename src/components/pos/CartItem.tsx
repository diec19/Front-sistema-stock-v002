import { Minus, Plus, Trash2 } from 'lucide-react';
import { SaleItem } from '../../../src/types/sale';

interface Props {
  item: SaleItem;
  onQtyChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export default function CartItem({ item, onQtyChange, onRemove }: Props) {
  return (
    <div className="flex flex-col gap-2 bg-slate-800/70 border border-slate-700/50 rounded-xl p-3">
      {/* Name + remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug line-clamp-1">
            {item.productName}
          </p>
          <p className="text-[11px] text-slate-500 tabular-nums">
            {fmt(item.unitPrice)} c/u
          </p>
        </div>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Qty controls + subtotal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQtyChange(item.productId, item.quantity - 1)}
            className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white flex items-center justify-center transition-colors"
          >
            <Minus size={11} />
          </button>
          <span className="w-7 text-center text-sm font-bold text-white tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onQtyChange(item.productId, item.quantity + 1)}
            className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white flex items-center justify-center transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>
        <span className="text-sm font-bold text-emerald-400 tabular-nums">
          {fmt(item.subtotal)}
        </span>
      </div>
    </div>
  );
}
