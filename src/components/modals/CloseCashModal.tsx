import { LogOut, TrendingDown } from 'lucide-react';
import { CashRegister } from '../../../src/types/sale';
import Modal, { ModalField, ModalInput, ModalActions } from './Modal';
import { fmtARS } from '../../lib/format';

interface Props {
  cashRegister: CashRegister;
  cashierName: string;
  closingAmount: string;
  onChangeCashier: (v: string) => void;
  onChangeAmount: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ? 'text-emerald-600 text-base' : 'text-gray-900'}`}>
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
  const closing  = parseFloat(closingAmount.replace(',', '.'));
  const diff     = closingAmount ? closing - expected : null;

  return (
    <Modal
      title="Cerrar caja"
      icon={<LogOut size={17} className="text-red-500" />}
      onClose={onClose}
    >
      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
        <SummaryRow label="Monto inicial"  value={fmtARS(cashRegister.openingAmount)} />
        <SummaryRow label="Ventas del día" value={String(cashRegister.stats?.totalSales ?? 0)} />
        <SummaryRow label="Ingresos"       value={fmtARS(cashRegister.stats?.totalRevenue ?? 0)} />

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-sm text-orange-600">
            <TrendingDown size={13} />
            Egresos
          </span>
          <span className="text-sm font-semibold tabular-nums text-orange-600">
            -{fmtARS(cashRegister.stats?.totalExpenses ?? 0)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <SummaryRow label="Monto esperado" value={fmtARS(expected)} highlight />
        </div>
      </div>

      <ModalField label="Quien cierra">
        <ModalInput
          placeholder="Ej: Juan Pérez"
          value={cashierName}
          onChange={e => onChangeCashier(e.target.value)}
        />
      </ModalField>

      <ModalField label="Monto real en caja ($)">
        <ModalInput
          inputMode="decimal"
          placeholder="0,00"
          value={closingAmount}
          onChange={e => onChangeAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
        />
      </ModalField>

      {diff !== null && !isNaN(diff) && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold border ${
          diff === 0
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : diff > 0
            ? 'bg-sky-50 text-sky-700 border-sky-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {diff === 0
            ? '✓ Arqueo correcto'
            : diff > 0
            ? `Sobrante: ${fmtARS(diff)}`
            : `Faltante: ${fmtARS(Math.abs(diff))}`}
        </div>
      )}

      <ModalActions>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          Cerrar caja
        </button>
      </ModalActions>
    </Modal>
  );
}
