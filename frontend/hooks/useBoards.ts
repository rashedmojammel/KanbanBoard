'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Board } from '@/types';
import * as boardsService from '@/lib/services/boards.service';
import { getErrorMessage } from '@/lib/error';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await boardsService.getBoards();
      setBoards(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBoards();
  }, [fetchBoards]);

  const createBoard = useCallback(async (payload: boardsService.CreateBoardPayload) => {
    const board = await boardsService.createBoard(payload);
    setBoards((prev) => [board, ...prev]);
    return board;
  }, []);

  const updateBoard = useCallback(async (boardId: string, payload: boardsService.UpdateBoardPayload) => {
    const updated = await boardsService.updateBoard(boardId, payload);
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, ...updated } : b)));
    return updated;
  }, []);

  const deleteBoard = useCallback(async (boardId: string) => {
    await boardsService.deleteBoard(boardId);
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  }, []);

  return { boards, isLoading, error, refetch: fetchBoards, createBoard, updateBoard, deleteBoard };
}
