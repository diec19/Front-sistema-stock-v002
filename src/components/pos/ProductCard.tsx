import { Product } from '../../../src/types/product';

interface Props {
  product: Product;
  cartQty: number;
  disabled: boolean;
  onClick: () => void;
}

function stockBadge(stock: number, min: number) {
  if (stock === 0)  return { label: 'Sin stock',      cls: 'bg-red-500/15 text-red-400' };
  if (stock <= min) return { label: `${stock} unid.`, cls: 'bg-amber-500/15 text-amber-400' };
  return             { label: `${stock} unid.`,       cls: 'bg-emerald-500/15 text-emerald-400' };
}

const fmt = (n: number | string) =>
  `$${parseFloat(n.toString()).toFixed(2)}`;

export default function ProductCard({ product, cartQty, disabled, onClick }: Props) {
  const badge   = stockBadge(product.stock, product.minStock);
  const inCart  = cartQty > 0;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-150 group',
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-800/40 border-slate-800'
          : inCart
          ? 'bg-emerald-950/40 border-emerald-600/50 hover:border-emerald-500 hover:-translate-y-0.5'
          : 'bg-slate-800/60 border-slate-700/60 hover:border-emerald-500/60 hover:bg-slate-800 hover:-translate-y-0.5',
      ].join(' ')}
    >
      {/* Cart qty badge */}
      {inCart && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 z-10">
          {cartQty}
        </span>
      )}

      {/* Header: name + stock badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-white leading-snug line-clamp-2 flex-1">
          {product.name}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* SKU */}
      <span className="text-[11px] font-mono text-slate-500">
        {product.sku}
      </span>

      {/* Price */}
      <span className="text-base font-bold text-emerald-400 tabular-nums">
        {fmt(product.price)}
      </span>
    </button>
  );
}
