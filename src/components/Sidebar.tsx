'use client';

import { Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    name: 'Productos',
    icon: Package,
    href: '/',
    color: 'blue'
  },
  {
    name: 'Punto de Venta',
    icon: ShoppingCart,
    href: '/pos',
    color: 'green'
  },
  {
    name: 'Clientes',
    icon: Users,
    href: '/clientes',
    color: 'purple',
    disabled: true
  },
  {
    name: 'Reportes',
    icon: BarChart3,
    href: '/reportes',
    color: 'orange',
    disabled: true
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">StockControl</h1>
            <p className="text-xs text-slate-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                ${item.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                ${isActive 
                  ? `bg-${item.color}-500/20 text-${item.color}-400 shadow-lg shadow-${item.color}-500/20` 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
              {item.disabled && (
                <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded">
                  Próximamente
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-slate-400 text-xs mb-1">Sistema Activo</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">En Línea</span>
          </div>
        </div>
      </div>
    </div>
  );
}