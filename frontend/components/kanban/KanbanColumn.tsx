'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ColumnHeader } from './ColumnHeader';
import { AddTaskButton } from './AddTaskButton';
import { TaskCard } from './TaskCard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getErrorMessage } from '@/lib/error';
import { staggerItem } from '@/lib/motion';
import { toast } from 'sonner';
import type { Column, Task } from '@/types';

interface KanbanColumnProps {
  column: Column;
  allColumns: Column[];
  onRenameColumn: (name: string) => Promise<void>;
  onDeleteColumn: () => Promise<void>;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTaskToColumn: (task: Task, targetColumnId: string) => void;
}

export function KanbanColumn({
  column,
  allColumns,
  onRenameColumn,
  onDeleteColumn,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTaskToColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column' } });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tasks = column.tasks ?? [];

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await onDeleteColumn();
      setConfirmDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <motion.div variants={staggerItem} className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-muted/50 p-3">
      <ColumnHeader name={column.name} taskCount={tasks.length} onRename={onRenameColumn} onDelete={() => setConfirmDeleteOpen(true)} />

      <div
        ref={setNodeRef}
        className={`flex min-h-[2rem] flex-col gap-2 rounded-md p-0.5 transition-colors ${isOver ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No tasks yet
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columns={allColumns}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task)}
                  onMoveToColumn={(targetColumnId) => onMoveTaskToColumn(task, targetColumnId)}
                />
              ))}
            </AnimatePresence>
          )}
        </SortableContext>
      </div>

      <AddTaskButton onClick={onAddTask} />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete this column?"
        description={
          tasks.length > 0
            ? `"${column.name}" has ${tasks.length} task${tasks.length === 1 ? '' : 's'} that will also be deleted. This action cannot be undone.`
            : `"${column.name}" will be permanently deleted. This action cannot be undone.`
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
