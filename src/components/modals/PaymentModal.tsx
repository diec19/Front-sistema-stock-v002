import { useState } from 'react';
import { CreditCard, Banknote, CheckCircle, Wallet, Smartphone } from 'lucide-react';
import Modal, { ModalActions } from './Modal';
import { fmtARS } from '../../lib/format';

export type PaymentMethod = 'cash' | 'mercadopago';

interface Props {
  total: number;
  onConfirm: (method: PaymentMethod, phone?: string) => Promise<void>;
  onClose: () => void;
}

const QUICK_AMOUNTS = (total: number) => {
  const ceil = (n: number, to: number) => Math.ceil(n / to) * to;
  const base = ceil(total, 100);
  return [...new Set([base, ceil(total, 500), ceil(total, 1000)])].slice(0, 3);
};

export default function PaymentModal({ total, onConfirm, onClose }: Props) {
  const [method,     setMethod]     = useState<PaymentMethod | null>(null);
  const [cashGiven,  setCashGiven]  = useState('');
  const [whatsapp,   setWhatsapp]   = useState('');
  const [confirming, setConfirming] = useState(false);

  const given  = parseFloat(cashGiven.replace(',', '.')) || 0;
  const change = given - total;
  const canPay = method === 'mercadopago' || (method === 'cash' && given >= total);

  const handleConfirm = async () => {
    if (!method || !canPay) return;
    setConfirming(true);
    const phone = whatsapp.trim() || undefined;
    await onConfirm(method, phone);
    setConfirming(false);
  };

  return (
    <Modal
      title="Forma de pago"
      icon={<CreditCard size={17} className="text-blue-600" />}
      onClose={onClose}
    >
      {/* Total */}
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
        <span className="text-sm font-medium text-gray-600">Total a cobrar</span>
        <span className="text-3xl font-black text-emerald-600 tabular-nums">{fmtARS(total)}</span>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setMethod('cash'); setCashGiven(''); }}
          className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
            method === 'cash'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Banknote size={28} />
          <span className="text-sm font-bold">Efectivo</span>
        </button>

        <button
          onClick={() => { setMethod('mercadopago'); setCashGiven(''); }}
          className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
            method === 'mercadopago'
              ? 'bg-sky-50 border-sky-500 text-sky-700'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Wallet size={28} />
          <span className="text-sm font-bold">Billetera virtual</span>
        </button>
      </div>

      {/* Cash section */}
      {method === 'cash' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Monto entregado
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">$</span>
              <input
                autoFocus
                inputMode="decimal"
                placeholder="0,00"
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value.replace(/[^0-9.,]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-gray-900 text-xl font-bold tabular-nums outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {QUICK_AMOUNTS(total).map(amt => (
              <button
                key={amt}
                onClick={() => setCashGiven(String(amt))}
                className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-semibold text-gray-700 transition-colors tabular-nums"
              >
                {fmtARS(amt)}
              </button>
            ))}
          </div>

          {cashGiven !== '' && (
            <div className={`rounded-xl px-5 py-4 flex items-center justify-between border ${
              change >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {change >= 0 ? 'Vuelto' : 'Falta'}
                </p>
                <p className={`text-2xl font-black tabular-nums ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {fmtARS(Math.abs(change))}
                </p>
              </div>
              {change >= 0 && <CheckCircle size={32} className="text-emerald-500 opacity-60" />}
            </div>
          )}
        </div>
      )}

      {/* MP section */}
      {method === 'mercadopago' && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center">
            <Wallet size={28} className="text-sky-500" />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Presentá el código QR o solicitá la transferencia al cliente.
          </p>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-gray-500">Monto a transferir</span>
            <span className="text-base font-bold text-sky-600 tabular-nums">{fmtARS(total)}</span>
          </div>
        </div>
      )}

      {/* WhatsApp comprobante */}
      <div className="border-t border-gray-100 pt-1">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
          <Smartphone size={11} className="text-green-500" />
          Comprobante por WhatsApp
          <span className="normal-case font-normal text-gray-400">— opcional</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-gray-400 pointer-events-none select-none">
            +54
          </span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="1155667788"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 13))}
            className={`w-full bg-gray-50 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${
              whatsapp
                ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
            }`}
          />
          {whatsapp && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
              <Smartphone size={9} />
              WA
            </span>
          )}
        </div>
        {whatsapp && (
          <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1">
            <CheckCircle size={10} />
            Se abrirá WhatsApp con el comprobante al confirmar
          </p>
        )}
      </div>

      <ModalActions>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canPay || confirming}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {confirming
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando…</>
            : <><CheckCircle size={15} />Confirmar cobro</>}
        </button>
      </ModalActions>
    </Modal>
  );
}
