'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import Sidebar from '../src/components/Sidebar';

// Pages only admins can access
const ADMIN_ONLY = ['/', '/reportes', '/usuarios'];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect cashiers away from admin-only pages
  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      if (ADMIN_ONLY.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        router.replace('/pos');
      }
    }
  }, [user, isLoading, pathname, router]);

  if (pathname === '/login') return <>{children}</>;

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
