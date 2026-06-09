export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// True when no real backend URL is configured — services use local mock/localStorage data
export const IS_MOCK =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL.startsWith('http://localhost') ||
  import.meta.env.VITE_API_URL.startsWith('http://127.0.0.1');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthHeader(): Record<string, string> {
  const raw = localStorage.getItem('lms_session_v1');
  if (!raw) return {};
  try {
    const session = JSON.parse(raw) as { token: string };
    return { Authorization: `Bearer ${session.token}` };
  } catch {
    return {};
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};