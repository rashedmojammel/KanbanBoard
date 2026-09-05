'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiGrid } from 'react-icons/fi';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { fadeInUp } from '@/lib/motion';
import { AuthBrandPanel } from './AuthBrandPanel';

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
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="relative flex items-start justify-center px-4 pb-12 pt-16 sm:px-6 lg:items-center lg:py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-start lg:items-start">
            <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground lg:hidden">
              <FiGrid className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">{children}</div>

          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </motion.div>
      </div>
    </div>
  );
}