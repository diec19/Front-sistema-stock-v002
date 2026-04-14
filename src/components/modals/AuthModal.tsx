import { LogIn } from 'lucide-react';
import Modal, { ModalField, ModalInput, ModalActions } from './Modal';

interface Props {
  username: string;
  password: string;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AuthModal({
  username, password, onChangeUsername, onChangePassword, onConfirm, onClose,
}: Props) {
  return (
    <Modal
      title="Acceso de administrador"
      icon={<LogIn size={17} className="text-sky-400" />}
      onClose={onClose}
    >
      <p className="text-sm text-slate-400">
        Solo los administradores pueden ver el historial de ventas.
      </p>

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
          className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-colors"
        >
          Ingresar
        </button>
      </ModalActions>
    </Modal>
  );
}
