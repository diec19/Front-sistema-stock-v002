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

export default function OpenCashModal({
  cashierName, openingAmount, onChangeCashier, onChangeAmount, onConfirm, onClose,
}: Props) {
  return (
    <Modal
      title="Abrir caja"
      icon={<LogIn size={17} className="text-emerald-400" />}
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

      <ModalField label="Monto inicial">
        <ModalInput
          type="number"
          step="0.01"
          placeholder="0.00"
          value={openingAmount}
          onChange={e => onChangeAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
        />
      </ModalField>

      <ModalActions>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
        >
          Abrir caja
        </button>
      </ModalActions>
    </Modal>
  );
}
