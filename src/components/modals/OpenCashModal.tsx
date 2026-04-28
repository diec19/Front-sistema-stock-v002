import { LogIn } from 'lucide-react';
import Modal, { ModalField, ModalInput, ModalActions } from './Modal';

interface Props {
  cashierName: string;
  openingAmount: string;
  onChangeCashier: (v: string) => void;
  onChangeAmount: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const sanitizeAmount = (raw: string) =>
  raw.replace(',', '.').replace(/[^0-9.]/g, '');

export default function OpenCashModal({
  cashierName, openingAmount, onChangeCashier, onChangeAmount, onConfirm, onClose,
}: Props) {
  const amount  = parseFloat(openingAmount);
  const invalid = openingAmount !== '' && (isNaN(amount) || amount < 0 || amount > 9_999_999.99);

  return (
    <Modal
      title="Abrir caja"
      icon={<LogIn size={17} className="text-emerald-600" />}
      onClose={onClose}
    >
      <ModalField label="Nombre del cajero">
        <ModalInput
          autoFocus
          placeholder="Ej: Juan Pérez"
          value={cashierName}
          onChange={e => onChangeCashier(e.target.value)}
        />
      </ModalField>

      <ModalField label="Monto inicial ($)">
        <ModalInput
          inputMode="decimal"
          placeholder="0,00"
          value={openingAmount}
          onChange={e => onChangeAmount(sanitizeAmount(e.target.value))}
          onKeyDown={e => e.key === 'Enter' && !invalid && onConfirm()}
        />
        {invalid && (
          <p className="text-xs text-red-500 mt-1">
            Ingresá un monto válido entre $0 y $9.999.999,99
          </p>
        )}
      </ModalField>

      <ModalActions>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!cashierName.trim() || !openingAmount || invalid}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Abrir caja
        </button>
      </ModalActions>
    </Modal>
  );
}
