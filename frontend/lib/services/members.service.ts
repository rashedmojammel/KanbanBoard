import { apiClient } from '@/lib/api';
import type { BoardMember } from '@/types';

export function getMembers(boardId: string): Promise<BoardMember[]> {
  return apiClient.get<BoardMember[]>(`/boards/${boardId}/members`);
}

export function addMember(boardId: string, email: string): Promise<BoardMember> {
  return apiClient.post<BoardMember>(`/boards/${boardId}/members`, { email });
}

export function removeMember(boardId: string, userId: string): Promise<void> {
  return apiClient.delete<void>(`/boards/${boardId}/members/${userId}`);
}
