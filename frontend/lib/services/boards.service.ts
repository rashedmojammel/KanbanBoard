import { apiClient } from '@/lib/api';
import type { Board } from '@/types';

export interface CreateBoardPayload {
  name: string;
  description?: string;
}

export type UpdateBoardPayload = Partial<CreateBoardPayload>;

export function getBoards(): Promise<Board[]> {
  return apiClient.get<Board[]>('/boards');
}

export function getBoard(boardId: string): Promise<Board> {
  return apiClient.get<Board>(`/boards/${boardId}`);
}

export function createBoard(payload: CreateBoardPayload): Promise<Board> {
  return apiClient.post<Board>('/boards', payload);
}

export function updateBoard(boardId: string, payload: UpdateBoardPayload): Promise<Board> {
  return apiClient.patch<Board>(`/boards/${boardId}`, payload);
}

export function deleteBoard(boardId: string): Promise<void> {
  return apiClient.delete<void>(`/boards/${boardId}`);
}
