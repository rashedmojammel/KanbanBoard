'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { BoardHeader } from '@/components/boards/BoardHeader';
import { BoardFormDialog } from '@/components/boards/BoardFormDialog';
import { ShareDialog } from '@/components/members/ShareDialog';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { KanbanBoardSkeleton } from '@/components/kanban/KanbanBoardSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useBoard } from '@/hooks/useBoard';
import { useMembers } from '@/hooks/useMembers';
import { getErrorMessage } from '@/lib/error';
import { fadeIn } from '@/lib/motion';
import { deleteBoard } from '@/lib/services/boards.service';

function BoardPageContent() {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const router = useRouter();
  const { user } = useAuth();

  const {
    board,
    columns,
    isLoading,
    error,
    refetch,
    updateBoardMeta,
    createColumn,
    renameColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoard(boardId);

  const membersApi = useMembers(boardId, Boolean(board));

  const [shareOpen, setShareOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);

  const isOwner = board?.ownerId === user?.id;

  async function handleDeleteBoard() {
    setIsDeletingBoard(true);
    try {
      await deleteBoard(boardId);
      toast.success('Board deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsDeletingBoard(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {board && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <BoardHeader
            board={board}
            members={membersApi.members}
            isOwner={isOwner}
            onShare={() => setShareOpen(true)}
            onEdit={() => setEditBoardOpen(true)}
            onDelete={() => setDeleteBoardOpen(true)}
          />
        </motion.div>
      )}

      <main className="container max-w-[calc(100vw-2rem)] flex-1 overflow-hidden py-4 lg:max-w-7xl">
        <AnimatePresence mode="wait" initial={false}>
          {isLoading ? (
            <motion.div key="skeleton" initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
              <KanbanBoardSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial="hidden" animate="visible" variants={fadeIn}>
              <ErrorState description={error} onRetry={refetch} />
            </motion.div>
          ) : (
            <motion.div key="board" initial="hidden" animate="visible" variants={fadeIn} className="h-full">
              <KanbanBoard
                columns={columns}
                createColumn={createColumn}
                renameColumn={renameColumn}
                deleteColumn={deleteColumn}
                createTask={createTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
                moveTask={moveTask}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {board && (
        <>
          <BoardFormDialog
            open={editBoardOpen}
            onOpenChange={setEditBoardOpen}
            board={board}
            onSubmit={(values) => updateBoardMeta(values)}
          />

          <ShareDialog
            open={shareOpen}
            onOpenChange={setShareOpen}
            board={board}
            isOwner={isOwner}
            members={membersApi.members}
            isLoading={membersApi.isLoading}
            error={membersApi.error}
            addMember={membersApi.addMember}
            removeMember={membersApi.removeMember}
          />

          <ConfirmDialog
            open={deleteBoardOpen}
            onOpenChange={setDeleteBoardOpen}
            title="Delete this board?"
            description={`"${board.name}" and all of its columns and tasks will be permanently deleted. This action cannot be undone.`}
            confirmLabel="Delete"
            isLoading={isDeletingBoard}
            onConfirm={handleDeleteBoard}
          />
        </>
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <RequireAuth>
      <BoardPageContent />
    </RequireAuth>
  );
}
