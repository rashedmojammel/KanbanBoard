'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiGrid } from 'react-icons/fi';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { fadeInUp } from '@/lib/motion';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FiGrid className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{children}</div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </motion.div>
    </div>
  );
}
