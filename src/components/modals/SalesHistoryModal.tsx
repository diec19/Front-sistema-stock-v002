import { History, Trash2, TrendingDown, ShoppingCart, Banknote, Wallet } from 'lucide-react';
import { SessionEntry } from '../../../src/types/sale';
import Modal from './Modal';
import { fmtARS } from '../../lib/format';

interface Props {
  entries: SessionEntry[];
  onDeleteSale: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onClose: () => void;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

function PaymentBadge({ method }: { method?: string }) {
  return method === 'mercadopago' ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-full">
      <Wallet size={9} /> Billetera
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
      <Banknote size={9} /> Efectivo
    </span>
  );
}

export default function SalesHistoryModal({ entries, onDeleteSale, onDeleteExpense, onClose }: Props) {
  const totalIngresos = entries.filter(e => e.kind === 'sale')
    .reduce((s, e) => s + parseFloat((e.data as any).total.toString()), 0);
  const totalEgresos = entries.filter(e => e.kind === 'expense')
    .reduce((s, e) => s + parseFloat((e.data as any).amount.toString()), 0);

  return (
    <Modal title="Historial de sesión" icon={<History size={17} className="text-blue-600" />} onClose={onClose} wide>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <History size={40} strokeWidth={1} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-400">Sin movimientos en esta sesión</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {entries.map(entry =>
              entry.kind === 'sale'
                ? <SaleEntry    key={`s-${entry.data.id}`} sale={entry.data as any}    onDelete={onDeleteSale} />
                : <ExpenseEntry key={`e-${entry.data.id}`} expense={entry.data as any} onDelete={onDeleteExpense} />
            )}
          </div>

          <div className="mt-2 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Movimientos</p>
              <p className="text-lg font-black text-gray-900">{entries.length}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-emerald-600 uppercase font-semibold mb-1">Ingresos</p>
              <p className="text-base font-black text-emerald-600 tabular-nums">{fmtARS(totalIngresos)}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-orange-600 uppercase font-semibold mb-1">Egresos</p>
              <p className="text-base font-black text-orange-600 tabular-nums">-{fmtARS(totalEgresos)}</p>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function SaleEntry({ sale, onDelete }: { sale: any; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
            <ShoppingCart size={13} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 font-mono">#{sale.id.slice(0, 8).toUpperCase()}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] text-gray-400">{fmtTime(sale.createdAt)}</p>
              <PaymentBadge method={sale.paymentMethod} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-emerald-600 tabular-nums">{fmtARS(sale.total)}</p>
          <button
            onClick={() => onDelete(sale.id)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors mt-0.5 ml-auto"
          >
            <Trash2 size={10} /> Anular
          </button>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-2 flex flex-col gap-1">
        {sale.items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-xs">
            <span className="text-gray-600">{item.product.name}<span className="text-gray-400 ml-1">×{item.quantity}</span></span>
            <span className="text-gray-500 tabular-nums">{fmtARS(item.subtotal)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseEntry({ expense, onDelete }: { expense: any; onDelete: (id: string) => void }) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="bg-white border border-orange-200 p-1.5 rounded-lg">
          <TrendingDown size={13} className="text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{expense.description}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[10px] text-gray-400">{expense.createdBy} · {fmtTime(expense.createdAt)}</p>
            <PaymentBadge method={expense.paymentMethod} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-base font-black text-orange-600 tabular-nums">-{fmtARS(expense.amount)}</p>
        <button
          onClick={() => onDelete(expense.id)}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={10} /> Eliminar
        </button>
      </div>
    </div>
  );
}
