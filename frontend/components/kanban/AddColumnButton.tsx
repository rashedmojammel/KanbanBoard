'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { FiPlus } from 'react-icons/fi';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { getErrorMessage } from '@/lib/error';

interface AddColumnButtonProps {
  onCreate: (name: string) => Promise<unknown>;
}

export function AddColumnButton({ onCreate }: AddColumnButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Column name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate(name.trim());
      setName('');
      setOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setName('');
          setError(null);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-fit w-72 shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent hover:text-foreground"
      >
        <FiPlus className="h-4 w-4" /> Add Column
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create column</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="column-name" error={error ?? undefined}>
            <Input
              id="column-name"
              placeholder="e.g. In Review"
              value={name}
              hasError={Boolean(error)}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
