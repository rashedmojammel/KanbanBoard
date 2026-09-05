'use client';

import { useCallback, useState } from 'react';
import { getErrorMessage } from '@/lib/error';

/**
 * Wraps a task mutation (create/update/delete/move) with consistent
 * isSubmitting/error state. The actual API calls and local state updates
 * live in useBoard - this hook is used by task UI (dialogs, menus) to
 * track the lifecycle of whichever mutation it's currently running.
 */
export function useTasks() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, error, run };
}
