import type { Metadata } from 'next';
import Link from 'next/link';
import { RequireGuest } from '@/components/auth/RequireGuest';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in · Mini Kanban Board' };

export default function LoginPage() {
  return (
    <RequireGuest>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to continue"
        footer={
          <>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>
    </RequireGuest>
  );
}
