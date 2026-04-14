import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ title, icon, onClose, children, wide = false }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={[
          'bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col',
          wide ? 'w-full max-w-2xl max-h-[82vh]' : 'w-full max-w-md',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            {icon}
            {title}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components used inside modals ── */

export function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ModalInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors w-full"
    />
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      {children}
    </div>
  );
}
