'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <FiLoader className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  );
}
