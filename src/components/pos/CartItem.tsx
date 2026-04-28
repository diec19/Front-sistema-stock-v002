import { Minus, Plus, X } from 'lucide-react';
import { SaleItem } from '../../../src/types/sale';
import { fmtARS } from '../../lib/format';

interface Props {
  item: SaleItem;
  onQtyChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onQtyChange, onRemove }: Props) {
  const initial = item.productName[0]?.toUpperCase() ?? '?';

  return (
    <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl p-2.5 group hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm font-black text-emerald-700 flex-shrink-0">
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{item.productName}</p>
        <p className="text-[11px] text-gray-400 tabular-nums">{fmtARS(item.unitPrice)} c/u</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onQtyChange(item.productId, item.quantity - 1)}
          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors"
        >
          <Minus size={10} strokeWidth={2.5} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-gray-900 tabular-nums">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(item.productId, item.quantity + 1)}
          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors"
        >
          <Plus size={10} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-[64px]">
        <span className="text-sm font-bold text-emerald-600 tabular-nums">{fmtARS(item.subtotal)}</span>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}
