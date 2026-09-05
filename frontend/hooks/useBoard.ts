'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Board, Column, Task } from '@/types';
import * as boardsService from '@/lib/services/boards.service';
import * as columnsService from '@/lib/services/columns.service';
import * as tasksService from '@/lib/services/tasks.service';
import { getErrorMessage } from '@/lib/error';

export function useBoard(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await boardsService.getBoard(boardId);
      setBoard(data);
      setColumns([...(data.columns ?? [])].sort((a, b) => a.position - b.position));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  const reloadColumns = useCallback(async () => {
    const fresh = await columnsService.getColumns(boardId);
    setColumns([...fresh].sort((a, b) => a.position - b.position));
  }, [boardId]);

  const updateBoardMeta = useCallback(
    async (payload: boardsService.UpdateBoardPayload) => {
      const updated = await boardsService.updateBoard(boardId, payload);
      setBoard((prev) => (prev ? { ...prev, ...updated } : updated));
      return updated;
    },
    [boardId],
  );

  const createColumn = useCallback(
    async (name: string) => {
      const column = await columnsService.createColumn(boardId, name);
      setColumns((prev) => [...prev, { ...column, tasks: [] }]);
      return column;
    },
    [boardId],
  );

  const renameColumn = useCallback(async (columnId: string, name: string) => {
    const updated = await columnsService.updateColumn(columnId, { name });
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, name: updated.name } : c)));
  }, []);

  const deleteColumn = useCallback(
    async (columnId: string) => {
      await columnsService.deleteColumn(columnId);
      await reloadColumns();
    },
    [reloadColumns],
  );

  const createTask = useCallback(async (columnId: string, payload: tasksService.TaskPayload) => {
    const task = await tasksService.createTask(columnId, payload);
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, tasks: [...(c.tasks ?? []), task] } : c)),
    );
    return task;
  }, []);

  const updateTask = useCallback(async (taskId: string, payload: tasksService.UpdateTaskPayload) => {
    const updated = await tasksService.updateTask(taskId, payload);
    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        tasks: (c.tasks ?? []).map((t) => (t.id === taskId ? updated : t)),
      })),
    );
    return updated;
  }, []);

  const deleteTask = useCallback(async (taskId: string, columnId: string) => {
    await tasksService.deleteTask(taskId);
    setColumns((prev) =>
      prev.map((c) => {
        if (c.id !== columnId) return c;
        const tasks = c.tasks ?? [];
        const removed = tasks.find((t) => t.id === taskId);
        const remaining = tasks.filter((t) => t.id !== taskId);
        if (!removed) return { ...c, tasks: remaining };
        return {
          ...c,
          tasks: remaining.map((t) => (t.position > removed.position ? { ...t, position: t.position - 1 } : t)),
        };
      }),
    );
  }, []);

  /**
   * Optimistically applies a task move to local state, then confirms with the
   * server. On failure the previous state is restored and the error is rethrown
   * so the caller can surface a toast.
   */
  const moveTask = useCallback(
    async (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
      const snapshot = columns;

      setColumns((prev) => applyLocalMove(prev, taskId, sourceColumnId, targetColumnId, targetIndex));

      try {
        await tasksService.moveTask(taskId, { targetColumnId, position: targetIndex });
      } catch (err) {
        setColumns(snapshot);
        throw err;
      }
    },
    [columns],
  );

  return {
    board,
    columns,
    isLoading,
    error,
    refetch: fetchBoard,
    updateBoardMeta,
    createColumn,
    renameColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}

function applyLocalMove(
  columns: Column[],
  taskId: string,
  sourceColumnId: string,
  targetColumnId: string,
  targetIndex: number,
): Column[] {
  const sourceColumn = columns.find((c) => c.id === sourceColumnId);
  const task = sourceColumn?.tasks?.find((t) => t.id === taskId);
  if (!sourceColumn || !task) return columns;

  return columns.map((column) => {
    if (column.id === sourceColumnId && column.id === targetColumnId) {
      const tasks = [...(column.tasks ?? [])];
      const fromIndex = tasks.findIndex((t) => t.id === taskId);
      tasks.splice(fromIndex, 1);
      const clampedIndex = Math.max(0, Math.min(targetIndex, tasks.length));
      tasks.splice(clampedIndex, 0, task);
      return { ...column, tasks: tasks.map((t, i) => ({ ...t, position: i })) };
    }
    if (column.id === sourceColumnId) {
      const tasks = (column.tasks ?? []).filter((t) => t.id !== taskId).map((t, i) => ({ ...t, position: i }));
      return { ...column, tasks };
    }
    if (column.id === targetColumnId) {
      const tasks = [...(column.tasks ?? [])];
      const clampedIndex = Math.max(0, Math.min(targetIndex, tasks.length));
      tasks.splice(clampedIndex, 0, { ...task, columnId: targetColumnId });
      return { ...column, tasks: tasks.map((t, i) => ({ ...t, position: i })) };
    }
    return column;
  });
}
