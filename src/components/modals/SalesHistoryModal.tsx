import { History, Trash2 } from 'lucide-react';
import { Sale } from '../../../src/types/sale';
import Modal from './Modal';

interface Props {
  sales: Sale[];
  onDelete: (id: string) => void;
  onClose: () => void;
}

const fmt = (n: number | string) => `$${parseFloat(n.toString()).toFixed(2)}`;

export default function SalesHistoryModal({ sales, onDelete, onClose }: Props) {
  return (
    <Modal
      title="Historial de ventas"
      icon={<History size={17} className="text-sky-400" />}
      onClose={onClose}
      wide
    >
      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
          <History size={40} strokeWidth={1.2} />
          <p className="text-sm font-medium">Sin ventas registradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map(sale => (
            <div
              key={sale.id}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
            >
              {/* Sale header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white font-mono">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(sale.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-emerald-400 tabular-nums">
                    {fmt(sale.total)}
                  </p>
                  <button
                    onClick={() => onDelete(sale.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors mt-1 ml-auto"
                  >
                    <Trash2 size={11} />
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-slate-700/50 pt-3 flex flex-col gap-1.5">
                {sale.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      {item.product.name}{' '}
                      <span className="text-slate-500">×{item.quantity}</span>
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {fmt(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
