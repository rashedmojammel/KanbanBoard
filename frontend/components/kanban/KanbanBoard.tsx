'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanColumn } from './KanbanColumn';
import { AddColumnButton } from './AddColumnButton';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { getErrorMessage } from '@/lib/error';
import { staggerContainer } from '@/lib/motion';
import type { useBoard } from '@/hooks/useBoard';
import type { Column, Task } from '@/types';
import { FiColumns } from 'react-icons/fi';

type BoardApi = ReturnType<typeof useBoard>;

interface KanbanBoardProps {
  columns: Column[];
  createColumn: BoardApi['createColumn'];
  renameColumn: BoardApi['renameColumn'];
  deleteColumn: BoardApi['deleteColumn'];
  createTask: BoardApi['createTask'];
  updateTask: BoardApi['updateTask'];
  deleteTask: BoardApi['deleteTask'];
  moveTask: BoardApi['moveTask'];
}

export function KanbanBoard({
  columns,
  createColumn,
  renameColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskDialog, setTaskDialog] = useState<{ open: boolean; task: Task | null; columnId: string | null }>({
    open: false,
    task: null,
    columnId: null,
  });
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function findTask(taskId: string): { task: Task; column: Column } | null {
    for (const column of columns) {
      const task = column.tasks?.find((t) => t.id === taskId);
      if (task) return { task, column };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const found = findTask(String(event.active.id));
    setActiveTask(found?.task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const source = findTask(String(active.id));
    if (!source) return;

    const overData = over.data.current as { type?: string; columnId?: string } | undefined;
    let targetColumnId: string;
    let targetIndex: number;

    if (overData?.type === 'task' && overData.columnId) {
      targetColumnId = overData.columnId;
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn?.tasks?.findIndex((t) => t.id === over.id) ?? 0;
    } else {
      // Dropped directly on a column's droppable area (empty column or below the last card).
      targetColumnId = String(over.id);
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      if (!targetColumn) return;
      targetIndex = targetColumn.tasks?.length ?? 0;
    }

    const sourceIndex = source.column.tasks?.findIndex((t) => t.id === source.task.id) ?? 0;
    if (source.column.id === targetColumnId && sourceIndex === targetIndex) return;

    try {
      await moveTask(source.task.id, source.column.id, targetColumnId, targetIndex);
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to move task');
    }
  }

  function openCreateTaskDialog(columnId: string) {
    setTaskDialog({ open: true, task: null, columnId });
  }

  function openEditTaskDialog(task: Task) {
    setTaskDialog({ open: true, task, columnId: task.columnId });
  }

  async function handleMoveViaMenu(task: Task, targetColumnId: string) {
    const targetColumn = columns.find((c) => c.id === targetColumnId);
    const targetIndex = targetColumn?.tasks?.length ?? 0;
    try {
      await moveTask(task.id, task.columnId, targetColumnId, targetIndex);
      toast.success('Task moved successfully');
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to move task');
    }
  }

  async function handleDeleteTaskConfirm() {
    if (!deletingTask) return;
    setIsDeletingTask(true);
    try {
      await deleteTask(deletingTask.id, deletingTask.columnId);
      toast.success('Task deleted successfully');
      setDeletingTask(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeletingTask(false);
    }
  }

  if (columns.length === 0) {
    return (
      <EmptyState
        icon={<FiColumns className="h-8 w-8" />}
        title="No columns yet"
        description="Add your first column (like To Do, In Progress, Done) to start planning work."
        action={
          <AddColumnButton onCreate={createColumn} />
        }
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex h-full gap-4 overflow-x-auto pb-4 scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              allColumns={columns}
              onRenameColumn={(name) => renameColumn(column.id, name)}
              onDeleteColumn={() => deleteColumn(column.id)}
              onAddTask={() => openCreateTaskDialog(column.id)}
              onEditTask={openEditTaskDialog}
              onDeleteTask={setDeletingTask}
              onMoveTaskToColumn={handleMoveViaMenu}
            />
          ))}
        </AnimatePresence>
        <AddColumnButton onCreate={createColumn} />
      </motion.div>

                 <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {activeTask ? (
          <div className="w-72 rotate-2 scale-[1.03] rounded-lg border border-brand-accent/40 bg-card p-3 shadow-xl">
            <p className="text-sm font-medium text-foreground">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(open) => setTaskDialog((prev) => ({ ...prev, open }))}
        task={taskDialog.task}
        onSubmit={(values) =>
          taskDialog.task
            ? updateTask(taskDialog.task.id, values)
            : createTask(taskDialog.columnId as string, values)
        }
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Delete this task?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeletingTask}
        onConfirm={handleDeleteTaskConfirm}
      />
    </DndContext>
  );
}
