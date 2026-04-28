import { ShieldCheck } from 'lucide-react';
import Modal, { ModalField, ModalInput, ModalActions } from './Modal';

interface Props {
  username: string;
  password: string;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthModal({
  username, password, onChangeUsername, onChangePassword, onConfirm, onClose, title, message,
}: Props) {
  return (
    <Modal
      title={title ?? 'Acceso de administrador'}
      icon={<ShieldCheck size={17} className="text-violet-500" />}
      onClose={onClose}
    >
      {message && <p className="text-sm text-gray-500 -mt-1">{message}</p>}

      <ModalField label="Usuario">
        <ModalInput
          autoFocus
          placeholder="usuario"
          value={username}
          onChange={e => onChangeUsername(e.target.value)}
        />
      </ModalField>

      <ModalField label="Contraseña">
        <ModalInput
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => onChangePassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
        />
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
          disabled={!username || !password}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50"
        >
          Ingresar
        </button>
      </ModalActions>
    </Modal>
  );
}
