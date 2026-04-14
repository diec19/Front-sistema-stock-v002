import { LogOut } from 'lucide-react';
import { CashRegister } from '../../../src/types/sale';
import Modal, { ModalField, ModalInput, ModalActions } from './Modal';

interface Props {
  cashRegister: CashRegister;
  cashierName: string;
  closingAmount: string;
  onChangeCashier: (v: string) => void;
  onChangeAmount: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const fmt = (n: number | string) => `$${parseFloat(n.toString()).toFixed(2)}`;

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ? 'text-emerald-400 text-base' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

export default function CloseCashModal({
  cashRegister, cashierName, closingAmount,
  onChangeCashier, onChangeAmount, onConfirm, onClose,
}: Props) {
  const expected = cashRegister.stats?.expectedAmount ?? 0;
  const closing  = parseFloat(closingAmount);
  const diff     = closingAmount ? closing - expected : null;

  return (
    <Modal
      title="Cerrar caja"
      icon={<LogOut size={17} className="text-red-400" />}
      onClose={onClose}
    >
      {/* Summary */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
        <SummaryRow label="Monto inicial"  value={fmt(cashRegister.openingAmount)} />
        <SummaryRow label="Ventas del día" value={String(cashRegister.stats?.totalSales ?? 0)} />
        <SummaryRow label="Ingresos"       value={fmt(cashRegister.stats?.totalRevenue ?? 0)} />
        <div className="border-t border-slate-700 pt-3">
          <SummaryRow label="Monto esperado" value={fmt(expected)} highlight />
        </div>
      </div>

      <ModalField label="Quien cierra">
        <ModalInput
          placeholder="Ej: Juan Pérez"
          value={cashierName}
          onChange={e => onChangeCashier(e.target.value)}
        />
      </ModalField>

      <ModalField label="Monto real en caja">
        <ModalInput
          type="number"
          step="0.01"
          placeholder="0.00"
          value={closingAmount}
          onChange={e => onChangeAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
        />
      </ModalField>

      {/* Diff indicator */}
      {diff !== null && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
          diff === 0
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {diff === 0 ? '✓ Arqueo correcto' : `Diferencia: ${fmt(diff)}`}
        </div>
      )}

      <ModalActions>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 hover:bg-red-400 text-white transition-colors"
        >
          Cerrar caja
        </button>
      </ModalActions>
    </Modal>
  );
}
