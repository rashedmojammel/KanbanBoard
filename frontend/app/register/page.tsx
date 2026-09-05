import type { Metadata } from 'next';
import Link from 'next/link';
import { RequireGuest } from '@/components/auth/RequireGuest';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Create account · Mini Kanban Board' };

export default function RegisterPage() {
  return (
    <RequireGuest>
      <AuthShell
        title="Create your account"
        subtitle="Start organizing your team's work"
        footer={
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthShell>
    </RequireGuest>
  );
}
