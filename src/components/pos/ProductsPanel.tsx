import { useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Product } from '../../../src/types/product';
import { SaleItem } from '../../../src/types/sale';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  saleItems: SaleItem[];
  searchTerm: string;
  cashOpen: boolean;
  onSearch: (v: string) => void;
  onAddProduct: (p: Product) => void;
}

export default function ProductsPanel({
  products, saleItems, searchTerm, cashOpen, onSearch, onAddProduct,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <section className="flex flex-col overflow-hidden border-r border-slate-800">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            ref={ref}
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => { onSearch(''); ref.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
            <Package size={40} strokeWidth={1.2} />
            <p className="text-sm font-medium">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
            {products.map(product => {
              const item = saleItems.find(i => i.productId === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartQty={item?.quantity ?? 0}
                  disabled={product.stock === 0 || !cashOpen}
                  onClick={() => onAddProduct(product)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
