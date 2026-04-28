'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      router.replace('/pos');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;
  if (!user || user.role !== 'admin') return null;

  return <>{children}</>;
}
