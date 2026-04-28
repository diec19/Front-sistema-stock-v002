'use client';

import { Package, ShoppingCart, BarChart3, LogOut, Users2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

type Role = 'admin' | 'cashier';

const ALL_ITEMS = [
  { name: 'Productos',      icon: Package,     href: '/',         color: 'blue',   roles: ['admin'] as Role[] },
  { name: 'Punto de Venta', icon: ShoppingCart, href: '/pos',      color: 'emerald', roles: ['admin', 'cashier'] as Role[] },
  { name: 'Reportes',       icon: BarChart3,    href: '/reportes', color: 'amber',  roles: ['admin'] as Role[] },
  { name: 'Usuarios',       icon: Users2,       href: '/usuarios', color: 'violet', roles: ['admin'] as Role[] },
];

const COLOR_MAP: Record<string, { active: string; dot: string; icon: string }> = {
  blue:    { active: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-500',    icon: 'text-blue-600' },
  emerald: { active: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', icon: 'text-emerald-600' },
  amber:   { active: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-500',   icon: 'text-amber-600' },
  violet:  { active: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500',  icon: 'text-violet-600' },
};

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const role  = (user?.role ?? 'cashier') as Role;
  const items = ALL_ITEMS.filter(i => i.roles.includes(role));

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">StockControl</h1>
            <p className="text-[11px] text-gray-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {role === 'admin' && <ShieldCheck size={11} className="text-violet-500" />}
                <p className="text-[11px] text-gray-400">{role === 'admin' ? 'Administrador' : 'Cajero'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {items.map(item => {
          const Icon     = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const colors   = COLOR_MAP[item.color];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? `${colors.active} shadow-sm`
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? colors.icon : ''}`} />
              <span>{item.name}</span>
              {isActive && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${colors.dot}`} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      {/* Status */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="text-xs text-gray-400">Sistema en línea</span>
        </div>
      </div>
    </div>
  );
}
