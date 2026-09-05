export type BoardRole = 'OWNER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface BoardOwner {
  id: string;
  name: string;
  email: string;
}

export interface BoardCounts {
  columns: number;
  members: number;
}

/**
 * Board as returned by GET /boards (summary) and GET/POST/PATCH /boards/:id (detail).
 * `_count` is present on the list endpoint; `columns` is present on create/detail/update.
 */
export interface Board {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: BoardOwner;
  columns?: Column[];
  _count?: BoardCounts;
  /** Present on GET /boards (list) only - total tasks across all columns. */
  taskCount?: number;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: string;
  user: BoardOwner;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  path?: string;
  timestamp?: string;
}
