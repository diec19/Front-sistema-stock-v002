import { CheckCircle } from 'lucide-react';

interface Props {
  show: boolean;
}

export default function SuccessToast({ show }: Props) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(34,197,94,0.35)] animate-in slide-in-from-bottom-4 duration-300">
      <CheckCircle size={18} />
      <div>
        <p className="text-sm font-bold">¡Venta completada!</p>
        <p className="text-xs opacity-80">Stock actualizado correctamente</p>
      </div>
    </div>
  );
}
