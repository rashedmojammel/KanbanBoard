import { getStoredToken, clearStoredToken } from './auth';
import type { ApiErrorPayload } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/** Dispatched when the API returns 401 so the auth context can react (clear user, redirect). */
export const UNAUTHORIZED_EVENT = 'kanban:unauthorized';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
  }

  const rawText = await response.text();
  const data = rawText ? safeJsonParse(rawText) : undefined;

  if (!response.ok) {
    const payload = data as ApiErrorPayload | undefined;
    const message = normalizeMessage(payload?.message) ?? `Request failed with status ${response.status}`;

    if (response.status === 401) {
      clearStoredToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
    }

    throw new ApiError(response.status, message);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function normalizeMessage(message: string | string[] | undefined): string | undefined {
  if (Array.isArray(message)) return message.join(', ');
  return message;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ?? {} }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
