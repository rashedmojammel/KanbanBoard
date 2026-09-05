'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { FiUserPlus, FiX } from 'react-icons/fi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NameAvatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/error';
import type { Board, BoardMember } from '@/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board;
  isOwner: boolean;
  members: BoardMember[];
  isLoading: boolean;
  error: string | null;
  addMember: (email: string) => Promise<BoardMember>;
  removeMember: (userId: string) => Promise<void>;
}

export function ShareDialog({
  open,
  onOpenChange,
  board,
  isOwner,
  members,
  isLoading,
  error,
  addMember,
  removeMember,
}: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setFormError('Enter an email address');
      return;
    }
    setFormError(null);
    setIsAdding(true);
    try {
      await addMember(email.trim());
      toast.success('Board shared successfully');
      setEmail('');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemove(userId: string) {
    setRemovingUserId(userId);
    try {
      await removeMember(userId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription>Give registered users access to &quot;{board.name}&quot;.</DialogDescription>
        </DialogHeader>

        {isOwner && (
          <form onSubmit={handleAdd} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                hasError={Boolean(formError)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
              />
              <Button type="submit" isLoading={isAdding}>
                <FiUserPlus className="h-4 w-4" /> Add
              </Button>
            </div>
            {formError && (
              <p className="text-xs text-destructive" role="alert">
                {formError}
              </p>
            )}
          </form>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Members</p>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-2 rounded-md px-1 py-1.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <NameAvatar name={member.user.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{member.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant={member.role === 'OWNER' ? 'default' : 'outline'}>
                      {member.role === 'OWNER' ? 'Owner' : 'Member'}
                    </Badge>
                    {isOwner && member.role !== 'OWNER' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Remove ${member.user.name}`}
                        isLoading={removingUserId === member.userId}
                        onClick={() => handleRemove(member.userId)}
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
