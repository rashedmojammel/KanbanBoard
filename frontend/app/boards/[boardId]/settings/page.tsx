'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FiChevronLeft, FiUserPlus, FiX } from 'react-icons/fi';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Badge } from '@/components/ui/badge';
import { NameAvatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useAuth } from '@/hooks/useAuth';
import { useBoard } from '@/hooks/useBoard';
import { useMembers } from '@/hooks/useMembers';
import { getErrorMessage } from '@/lib/error';

function BoardSettingsContent() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const { user } = useAuth();

  const { board, isLoading, error, updateBoardMeta } = useBoard(boardId);
  const membersApi = useMembers(boardId, Boolean(board));

  const isOwner = board?.ownerId === user?.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description ?? '');
    }
  }, [board]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateBoardMeta({ name: name.trim(), description: description.trim() || undefined });
      toast.success('Board updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddMember(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setAddError('Enter an email address');
      return;
    }
    setAddError(null);
    setIsAdding(true);
    try {
      await membersApi.addMember(email.trim());
      toast.success('Board shared successfully');
      setEmail('');
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemovingUserId(userId);
    try {
      await membersApi.removeMember(userId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-8">
        <Link
          href={`/boards/${boardId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <FiChevronLeft className="h-4 w-4" /> Back to board
        </Link>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error || !board ? (
          <ErrorState description={error ?? 'Board not found'} />
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Board settings</h1>
              <p className="text-sm text-muted-foreground">Manage details and access for &quot;{board.name}&quot;.</p>
            </div>

            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Board details</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <FormField label="Name" htmlFor="settings-name">
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isOwner}
                  />
                </FormField>
                <FormField label="Description" htmlFor="settings-description">
                  <Textarea
                    id="settings-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={!isOwner}
                  />
                </FormField>
                {isOwner && (
                  <Button type="submit" isLoading={isSaving}>
                    Save changes
                  </Button>
                )}
              </form>
            </section>

            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Members</h2>

              {isOwner && (
                <form onSubmit={handleAddMember} className="mb-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      hasError={Boolean(addError)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (addError) setAddError(null);
                      }}
                    />
                    <Button type="submit" isLoading={isAdding}>
                      <FiUserPlus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  {addError && (
                    <p className="text-xs text-destructive" role="alert">
                      {addError}
                    </p>
                  )}
                </form>
              )}

              {membersApi.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ul className="space-y-1">
                  {membersApi.members.map((member) => (
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
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            <FiX className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BoardSettingsPage() {
  return (
    <RequireAuth>
      <BoardSettingsContent />
    </RequireAuth>
  );
}
