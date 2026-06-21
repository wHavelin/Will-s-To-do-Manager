import type { TeamMember } from './team';

export type TodoStatus = 'New' | 'Active' | 'InProgress' | 'Blocked' | 'Closed';

export const TODO_STATUSES: TodoStatus[] = ['New', 'Active', 'InProgress', 'Blocked', 'Closed'];

export function statusLabel(status: TodoStatus): string {
  return status === 'InProgress' ? 'In Progress' : status;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: TodoStatus;
  createdAt: string;
  dueDate?: string;
  assigneeId?: number;
  assignee?: TeamMember;
}

export type FilterType = 'New' | 'Ongoing' | 'Closed';
