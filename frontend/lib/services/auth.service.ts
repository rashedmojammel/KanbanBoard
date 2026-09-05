import { apiClient } from '@/lib/api';
import type { AuthResult, User } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return apiClient.post<AuthResult>('/auth/register', payload);
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return apiClient.post<AuthResult>('/auth/login', payload);
}

export function getCurrentUser(): Promise<User> {
  return apiClient.get<User>('/auth/me');
}
