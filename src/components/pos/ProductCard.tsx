import { Plus } from 'lucide-react';
import { Product } from '../../../src/types/product';
import { fmtARS } from '../../lib/format';

interface Props {
  product: Product;
  cartQty: number;
  disabled: boolean;
  onClick: () => void;
}

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
];

function colorForName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % COLORS.length;
  return COLORS[h];
}

function stockBadge(stock: number, min: number) {
  if (stock === 0)  return { label: 'Sin stock', cls: 'bg-red-100 text-red-600 border-red-200' };
  if (stock <= min) return { label: `${stock} u.`, cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return             { label: `${stock} u.`,      cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
}

export default function ProductCard({ product, cartQty, disabled, onClick }: Props) {
  const badge   = stockBadge(product.stock, product.minStock);
  const inCart  = cartQty > 0;
  const color   = colorForName(product.name);
  const initial = product.name[0]?.toUpperCase() ?? '?';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative flex flex-col gap-2.5 p-3.5 rounded-2xl border text-left transition-all duration-150 group select-none',
        disabled
          ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
          : inCart
          ? 'bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-100 hover:border-emerald-400 hover:-translate-y-0.5 active:scale-[0.98]'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md hover:shadow-gray-100 hover:-translate-y-0.5 active:scale-[0.98]',
      ].join(' ')}
    >
      {inCart && (
        <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white z-10 shadow-md">
          {cartQty}
        </span>
      )}

      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black ${color}`}>
          {initial}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{product.name}</p>
        <p className="text-[10px] font-mono text-gray-400 mt-0.5">{product.sku}</p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className={`text-base font-black tabular-nums ${inCart ? 'text-emerald-600' : 'text-gray-900'}`}>
          {fmtARS(product.price)}
        </span>
        {!disabled && (
          <span className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            inCart
              ? 'bg-emerald-200 text-emerald-700'
              : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
          }`}>
            <Plus size={13} strokeWidth={2.5} />
          </span>
        )}
      </div>
    </button>
  );
}
