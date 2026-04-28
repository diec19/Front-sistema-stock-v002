import { Banknote, TrendingDown, Wallet } from 'lucide-react';
import Modal, { ModalField, ModalInput, ModalActions } from './Modal';

export type ExpensePaymentMethod = 'cash' | 'mercadopago';

interface Props {
  amount: string;
  description: string;
  operatorName: string;
  paymentMethod: ExpensePaymentMethod;
  processing: boolean;
  onChangeAmount: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeOperator: (v: string) => void;
  onChangePaymentMethod: (v: ExpensePaymentMethod) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const sanitize = (raw: string) => raw.replace(',', '.').replace(/[^0-9.]/g, '');

export default function ExpenseModal({
  amount, description, operatorName, paymentMethod, processing,
  onChangeAmount, onChangeDescription, onChangeOperator, onChangePaymentMethod,
  onConfirm, onClose,
}: Props) {
  const invalid    = amount !== '' && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0);
  const canConfirm = !processing && !!amount && !invalid && !!description && !!operatorName;

  return (
    <Modal
      title="Registrar egreso"
      icon={<TrendingDown size={17} className="text-orange-500" />}
      onClose={onClose}
    >
      <p className="text-xs text-gray-500 -mt-1">
        Registrá una salida de dinero de la caja (pagos, gastos, retiros).
      </p>

      <ModalField label="Concepto">
        <ModalInput
          autoFocus
          placeholder="Ej: Pago a proveedor, compra de insumos…"
          value={description}
          onChange={e => onChangeDescription(e.target.value)}
        />
      </ModalField>

      <ModalField label="Monto ($)">
        <ModalInput
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={e => onChangeAmount(sanitize(e.target.value))}
          onKeyDown={e => e.key === 'Enter' && canConfirm && onConfirm()}
        />
        {invalid && <p className="text-xs text-red-500 mt-1">Ingresá un monto válido mayor a $0</p>}
      </ModalField>

      <ModalField label="Medio de pago">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChangePaymentMethod('cash')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              paymentMethod === 'cash'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <Banknote size={16} /> Efectivo
          </button>
          <button
            onClick={() => onChangePaymentMethod('mercadopago')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              paymentMethod === 'mercadopago'
                ? 'bg-sky-50 border-sky-500 text-sky-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <Wallet size={16} /> Billetera virtual
          </button>
        </div>
      </ModalField>

      <ModalField label="Operador">
        <ModalInput
          placeholder="Nombre de quien registra"
          value={operatorName}
          onChange={e => onChangeOperator(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canConfirm && onConfirm()}
        />
      </ModalField>

      <ModalActions>
        <button
          onClick={onClose}
          disabled={processing}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Registrando…' : 'Registrar egreso'}
        </button>
      </ModalActions>
    </Modal>
  );
}
