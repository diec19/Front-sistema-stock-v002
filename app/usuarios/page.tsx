'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users2, Plus, ShieldCheck, UserRound, Pencil, Trash2,
  KeyRound, X, Eye, EyeOff, Check, AlertCircle,
} from 'lucide-react';
import { userService } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import AdminRoute from '../../src/components/AdminRoute';

interface AppUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
  createdAt: string;
}

type Modal =
  | { type: 'create' }
  | { type: 'edit';  user: AppUser }
  | { type: 'password'; user: AppUser }
  | { type: 'delete'; user: AppUser }
  | null;

// ─── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
      <ShieldCheck size={11} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
      <UserRound size={11} /> Cajero
    </span>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, role }: { name: string; role: string }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
      role === 'admin'
        ? 'bg-violet-100 text-violet-700 border border-violet-200'
        : 'bg-sky-100 text-sky-700 border border-sky-200'
    }`}>
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ─── Password input ────────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder = 'Contraseña', autoFocus = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, autoFocus = false }: {
  value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean;
}) {
  return (
    <input
      type="text"
      autoFocus={autoFocus}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
    />
  );
}

function RoleSelector({ value, onChange }: { value: string; onChange: (v: 'admin' | 'cashier') => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange('cashier')}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
          value === 'cashier'
            ? 'bg-sky-50 border-sky-500 text-sky-700'
            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <UserRound size={15} /> Cajero
      </button>
      <button
        type="button"
        onClick={() => onChange('admin')}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
          value === 'admin'
            ? 'bg-violet-50 border-violet-500 text-violet-700'
            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <ShieldCheck size={15} /> Admin
      </button>
    </div>
  );
}

// ─── Modal shell ───────────────────────────────────────────────────────────────
function ModalShell({ title, icon, onClose, children }: {
  title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl shadow-gray-300/40">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {icon}
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-600">
      <AlertCircle size={14} className="flex-shrink-0" />
      {msg}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function UsuariosPage() {
  return (
    <AdminRoute>
      <UsersContent />
    </AdminRoute>
  );
}

function UsersContent() {
  const { user: me } = useAuth();
  const [users,   setUsers]   = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<Modal>(null);
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);

  const [name,     setName]     = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<'admin' | 'cashier'>('cashier');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setUsers(await userService.getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setName(''); setUsername(''); setPassword(''); setRole('cashier'); setError('');
    setModal({ type: 'create' });
  };

  const openEdit = (u: AppUser) => {
    setName(u.name); setRole(u.role); setError('');
    setModal({ type: 'edit', user: u });
  };

  const openPassword = (u: AppUser) => {
    setPassword(''); setError('');
    setModal({ type: 'password', user: u });
  };

  const openDelete = (u: AppUser) => {
    setError('');
    setModal({ type: 'delete', user: u });
  };

  const closeModal = () => { setModal(null); setError(''); setSaving(false); };

  const handleCreate = async () => {
    if (!name.trim() || !username.trim() || !password) {
      setError('Todos los campos son requeridos'); return;
    }
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); return; }
    try {
      setSaving(true); setError('');
      await userService.create({ name: name.trim(), username: username.trim(), password, role });
      await load();
      closeModal();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al crear usuario');
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    const u = (modal as { user: AppUser }).user;
    try {
      setSaving(true); setError('');
      await userService.update(u.id, { name: name.trim(), role });
      await load();
      closeModal();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al actualizar usuario');
    } finally { setSaving(false); }
  };

  const handlePassword = async () => {
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); return; }
    const u = (modal as { user: AppUser }).user;
    try {
      setSaving(true); setError('');
      await userService.resetPassword(u.id, password);
      closeModal();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al cambiar contraseña');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    const u = (modal as { user: AppUser }).user;
    try {
      setSaving(true); setError('');
      await userService.delete(u.id);
      await load();
      closeModal();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al eliminar usuario');
    } finally { setSaving(false); }
  };

  const admins   = users.filter(u => u.role === 'admin').length;
  const cashiers = users.filter(u => u.role === 'cashier').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center">
            <Users2 size={20} className="text-violet-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-xs text-gray-500">Gestioná los accesos al sistema</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold transition-colors shadow-md shadow-violet-200"
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total usuarios',   value: users.length, color: 'text-gray-900',   bg: 'bg-white border-gray-200' },
          { label: 'Administradores',  value: admins,       color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
          { label: 'Cajeros',          value: cashiers,     color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 shadow-sm ${s.bg}`}>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Users2 size={40} strokeWidth={1} />
            <p className="text-sm">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Usuario</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Login</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Rol</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} role={u.role} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{u.name}</p>
                        {u.id === me?.id && (
                          <p className="text-[10px] text-gray-400">Sos vos</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-500 font-mono">{u.username}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(u)}
                        title="Editar"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => openPassword(u)}
                        title="Cambiar contraseña"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <KeyRound size={13} />
                      </button>
                      {u.id !== me?.id && (
                        <button
                          onClick={() => openDelete(u)}
                          title="Eliminar"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Create */}
      {modal?.type === 'create' && (
        <ModalShell title="Nuevo usuario" icon={<Plus size={16} className="text-violet-600" />} onClose={closeModal}>
          {error && <ErrorBanner msg={error} />}
          <Field label="Nombre completo">
            <TextInput value={name} onChange={setName} placeholder="Ej: María García" autoFocus />
          </Field>
          <Field label="Usuario (login)">
            <TextInput value={username} onChange={setUsername} placeholder="Ej: mgarcia" />
          </Field>
          <Field label="Contraseña">
            <PasswordInput value={password} onChange={setPassword} />
          </Field>
          <Field label="Rol">
            <RoleSelector value={role} onChange={setRole} />
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-medium text-gray-700 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Crear usuario</>}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Edit */}
      {modal?.type === 'edit' && (
        <ModalShell title="Editar usuario" icon={<Pencil size={16} className="text-violet-600" />} onClose={closeModal}>
          {error && <ErrorBanner msg={error} />}
          <Field label="Nombre completo">
            <TextInput value={name} onChange={setName} placeholder="Nombre" autoFocus />
          </Field>
          <Field label="Rol">
            <RoleSelector value={role} onChange={r => {
              if (modal.user.id === me?.id && r !== 'admin') return;
              setRole(r);
            }} />
            {modal.user.id === me?.id && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <AlertCircle size={11} /> No podés cambiar tu propio rol
              </p>
            )}
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-medium text-gray-700 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleEdit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Guardar cambios</>}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Password */}
      {modal?.type === 'password' && (
        <ModalShell title="Cambiar contraseña" icon={<KeyRound size={16} className="text-amber-500" />} onClose={closeModal}>
          {error && <ErrorBanner msg={error} />}
          <p className="text-sm text-gray-600">
            Cambiando contraseña de <span className="font-semibold text-gray-900">{modal.user.name}</span>
          </p>
          <Field label="Nueva contraseña">
            <PasswordInput value={password} onChange={setPassword} placeholder="Mínimo 4 caracteres" autoFocus />
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-medium text-gray-700 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handlePassword}
              disabled={saving || password.length < 4}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound size={14} /> Cambiar</>}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Delete */}
      {modal?.type === 'delete' && (
        <ModalShell title="Eliminar usuario" icon={<Trash2 size={16} className="text-red-500" />} onClose={closeModal}>
          {error && <ErrorBanner msg={error} />}
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <Avatar name={modal.user.name} role={modal.user.role} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{modal.user.name}</p>
              <p className="text-xs text-gray-500">@{modal.user.username} · <span className="capitalize">{modal.user.role}</span></p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Esta acción es permanente y no se puede deshacer. El usuario no podrá iniciar sesión.
          </p>
          <div className="flex gap-2 pt-1">
            <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-medium text-gray-700 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 size={14} /> Eliminar</>}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
