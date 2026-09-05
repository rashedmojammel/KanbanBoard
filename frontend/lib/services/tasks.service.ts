import { apiClient } from '@/lib/api';
import type { Task } from '@/types';

export interface TaskPayload {
  title: string;
  description?: string;
}

export type UpdateTaskPayload = Partial<TaskPayload>;

export interface MoveTaskPayload {
  targetColumnId: string;
  position: number;
}

export function getTasks(columnId: string): Promise<Task[]> {
  return apiClient.get<Task[]>(`/columns/${columnId}/tasks`);
}

export function createTask(columnId: string, payload: TaskPayload): Promise<Task> {
  return apiClient.post<Task>(`/columns/${columnId}/tasks`, payload);
}

export function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
  return apiClient.patch<Task>(`/tasks/${taskId}`, payload);
}

export function deleteTask(taskId: string): Promise<void> {
  return apiClient.delete<void>(`/tasks/${taskId}`);
}

export function moveTask(taskId: string, payload: MoveTaskPayload): Promise<Task> {
  return apiClient.patch<Task>(`/tasks/${taskId}/move`, payload);
}
