'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { getErrorMessage } from '@/lib/error';
import type { Board } from '@/types';

interface BoardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board | null;
  onSubmit: (values: { name: string; description?: string }) => Promise<unknown>;
}

export function BoardFormDialog({ open, onOpenChange, board, onSubmit }: BoardFormDialogProps) {
  const isEditMode = Boolean(board);
  const [name, setName] = useState(board?.name ?? '');
  const [description, setDescription] = useState(board?.description ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(board?.name ?? '');
      setDescription(board?.description ?? '');
      setNameError(null);
    }
  }, [open, board]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError('Board name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      toast.success(isEditMode ? 'Board updated' : 'Board created successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit board' : 'Create board'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update your board details.' : 'Give your board a name to get started.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="board-name" error={nameError ?? undefined}>
            <Input
              id="board-name"
              placeholder="e.g. Product Roadmap"
              value={name}
              hasError={Boolean(nameError)}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              autoFocus
            />
          </FormField>

          <FormField label="Description (optional)" htmlFor="board-description">
            <Textarea
              id="board-description"
              placeholder="What's this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditMode ? 'Save changes' : 'Create board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
