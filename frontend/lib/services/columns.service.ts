import { apiClient } from '@/lib/api';
import type { Column } from '@/types';

export function getColumns(boardId: string): Promise<Column[]> {
  return apiClient.get<Column[]>(`/boards/${boardId}/columns`);
}

export function createColumn(boardId: string, name: string): Promise<Column> {
  return apiClient.post<Column>(`/boards/${boardId}/columns`, { name });
}

export function updateColumn(columnId: string, payload: { name?: string; position?: number }): Promise<Column> {
  return apiClient.patch<Column>(`/columns/${columnId}`, payload);
}

export function deleteColumn(columnId: string): Promise<void> {
  return apiClient.delete<void>(`/columns/${columnId}`);
}
