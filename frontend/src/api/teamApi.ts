import type { TeamMember } from '../types/team';

const BASE = '/api/team';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${options?.method ?? 'GET'} ${url} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const fetchTeam = (): Promise<TeamMember[]> =>
  request(BASE);

export const addMember = (name: string): Promise<TeamMember> =>
  request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const removeMember = (id: number): Promise<void> =>
  request(`${BASE}/${id}`, { method: 'DELETE' });
