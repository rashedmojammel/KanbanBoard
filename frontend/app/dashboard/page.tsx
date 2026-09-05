'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiGrid } from 'react-icons/fi';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BoardCard } from '@/components/boards/BoardCard';
import { BoardFormDialog } from '@/components/boards/BoardFormDialog';
import { BoardGridSkeleton } from '@/components/boards/BoardGridSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { getErrorMessage } from '@/lib/error';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import type { Board } from '@/types';

function DashboardContent() {
  const { user } = useAuth();
  const { boards, isLoading, error, refetch, createBoard, updateBoard, deleteBoard } = useBoards();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredBoards = useMemo(() => {
    if (!search.trim()) return boards;
    const query = search.trim().toLowerCase();
    return boards.filter((b) => b.name.toLowerCase().includes(query));
  }, [boards, search]);

  const totalTasks = useMemo(() => boards.reduce((sum, b) => sum + (b.taskCount ?? 0), 0), [boards]);

  function openCreateDialog() {
    setEditingBoard(null);
    setFormOpen(true);
  }

  function openEditDialog(board: Board) {
    setEditingBoard(board);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingBoard) return;
    setIsDeleting(true);
    try {
      await deleteBoard(deletingBoard.id);
      toast.success('Board deleted successfully');
      setDeletingBoard(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-7xl py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Boards</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Your boards'}
              {!isLoading && !error && boards.length > 0 && (
                <>
                  {' · '}
                  {boards.length} {boards.length === 1 ? 'board' : 'boards'} · {totalTasks}{' '}
                  {totalTasks === 1 ? 'task' : 'tasks'}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:w-56"
                aria-label="Search boards"
              />
            </div>
            <Button onClick={openCreateDialog}>
              <FiPlus className="h-4 w-4" /> New Board
            </Button>
          </div>
        </motion.div>

        <div className="mt-6">
          {isLoading ? (
            <BoardGridSkeleton />
          ) : error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : boards.length === 0 ? (
            <EmptyState
              icon={<FiGrid className="h-8 w-8" />}
              title="No boards yet"
              description="Create your first board to get started organizing your team's work."
              action={
                <Button onClick={openCreateDialog}>
                  <FiPlus className="h-4 w-4" /> Create Board
                </Button>
              }
            />
          ) : filteredBoards.length === 0 ? (
            <EmptyState title="No boards match your search" description="Try a different search term." />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    isOwner={board.ownerId === user?.id}
                    onEdit={() => openEditDialog(board)}
                    onDelete={() => setDeletingBoard(board)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <BoardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        board={editingBoard}
        onSubmit={(values) =>
          editingBoard ? updateBoard(editingBoard.id, values) : createBoard(values)
        }
      />

      <ConfirmDialog
        open={Boolean(deletingBoard)}
        onOpenChange={(open) => !open && setDeletingBoard(null)}
        title="Delete this board?"
        description={`"${deletingBoard?.name}" and all of its columns and tasks will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}