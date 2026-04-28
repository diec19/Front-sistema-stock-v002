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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={[
          'bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 flex flex-col',
          wide ? 'w-full max-w-2xl max-h-[82vh]' : 'w-full max-w-md',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            {icon}
            {title}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          >
            <X size={16} />
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

export function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
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
      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors w-full"
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
