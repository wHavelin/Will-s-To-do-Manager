import type { Todo, TodoStatus } from '../types/todo';

const BASE = '/api/todos';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${options?.method ?? 'GET'} ${url} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const fetchTodos = (): Promise<Todo[]> =>
  request(BASE);

export const fetchTodoById = (id: number): Promise<Todo> =>
  request(`${BASE}/${id}`);

export const createTodo = (
  title: string,
  description?: string,
  dueDate?: string,
  assigneeId?: number
): Promise<Todo> =>
  request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, dueDate, assigneeId }),
  });

export const updateTodo = (
  id: number,
  data: { title: string; description?: string; status: TodoStatus; dueDate?: string; assigneeId?: number }
): Promise<Todo> =>
  request(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteTodo = (id: number): Promise<void> =>
  request(`${BASE}/${id}`, { method: 'DELETE' });
