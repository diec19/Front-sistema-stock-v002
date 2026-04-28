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
    <section className="flex flex-col h-full overflow-hidden border-r border-gray-200 bg-gray-50">
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={ref}
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            placeholder="Buscar producto o SKU…"
            className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => { onSearch(''); ref.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Package size={44} strokeWidth={1} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-400">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
