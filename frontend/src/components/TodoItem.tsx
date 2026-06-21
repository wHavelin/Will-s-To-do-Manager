import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TODO_STATUSES, statusLabel } from '../types/todo';
import type { Todo, TodoStatus } from '../types/todo';
import { memberColor, memberInitials } from '../types/team';
import type { TeamMember } from '../types/team';

interface Props {
  todo: Todo;
  members: TeamMember[];
  onUpdate: (id: number, data: { title: string; description?: string; status: TodoStatus; dueDate?: string; assigneeId?: number }) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, members, onUpdate, onDelete }: Props) {
  const navigate = useNavigate();
  const liRef = useRef<HTMLLIElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleStatusChange = (status: TodoStatus) => {
    onUpdate(todo.id, { title: todo.title, description: todo.description, status, dueDate: todo.dueDate, assigneeId: todo.assigneeId });
  };

  const handleAssigneeChange = (assigneeId: number | undefined) => {
    onUpdate(todo.id, { title: todo.title, description: todo.description, status: todo.status, dueDate: todo.dueDate, assigneeId });
  };

  const getControls = (): HTMLElement[] =>
    Array.from(liRef.current?.querySelectorAll<HTMLElement>('select, button') ?? []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();

    const controls = getControls();
    const base = controls.findIndex(c => c === document.activeElement);
    const from = base >= 0 ? base : activeIdx;

    let next: number;
    if (e.key === 'ArrowRight') next = Math.min(from + 1, controls.length - 1);
    else if (e.key === 'ArrowLeft') next = Math.max(from - 1, 0);
    else if (e.key === 'Home') next = 0;
    else next = controls.length - 1;

    setActiveIdx(next);
    controls[next].focus();
  };

  const handleFocusIn = (e: React.FocusEvent<HTMLLIElement>) => {
    const idx = getControls().indexOf(e.target as HTMLElement);
    if (idx >= 0) setActiveIdx(idx);
  };

  const dueDateLabel = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isOverdue = todo.dueDate && todo.status !== 'Closed' && new Date(todo.dueDate) < todayStart;

  // DOM order: [0] status-select, [1] assignee-select (if members), [1|2] btn-edit, [2|3] btn-delete
  const editIdx = members.length > 0 ? 2 : 1;
  const deleteIdx = members.length > 0 ? 3 : 2;

  return (
    <li
      ref={liRef}
      className={`todo-item status-${todo.status.toLowerCase()}${todo.status === 'Closed' ? ' closed' : ''}`}
      onKeyDown={handleKeyDown}
      onFocus={handleFocusIn}
    >
      <div className={`status-select-wrapper status-${todo.status.toLowerCase()}`}>
        <select
          className="status-select"
          value={todo.status}
          onChange={e => handleStatusChange(e.target.value as TodoStatus)}
          aria-label="Status"
          tabIndex={activeIdx === 0 ? 0 : -1}
        >
          {TODO_STATUSES.map(s => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="todo-body" onClick={() => navigate(`/tasks/${todo.id}`)}>
        <span className="todo-title">{todo.title}</span>
        {todo.description && <span className="todo-desc">{todo.description}</span>}
        {dueDateLabel && (
          <span className={`todo-due${isOverdue ? ' overdue' : ''}`}>{dueDateLabel}</span>
        )}
        {isOverdue && <span className="overdue-tag">Overdue</span>}
      </div>

      {members.length > 0 && (
        <div className="assignee-cell">
          {todo.assignee && (
            <span
              className="avatar avatar-sm"
              style={{ background: memberColor(todo.assignee.id) }}
              title={todo.assignee.name}
            >
              {memberInitials(todo.assignee.name)}
            </span>
          )}
          <select
            className={`assignee-select${!todo.assignee ? ' unassigned' : ''}`}
            value={todo.assigneeId ?? ''}
            onChange={e => handleAssigneeChange(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Assignee"
            tabIndex={activeIdx === 1 ? 0 : -1}
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="todo-actions">
        <button className="btn-edit" onClick={() => navigate(`/tasks/${todo.id}`)} aria-label="Edit" tabIndex={activeIdx === editIdx ? 0 : -1}>✎</button>
        <button className="btn-delete" onClick={() => onDelete(todo.id)} aria-label="Delete" tabIndex={activeIdx === deleteIdx ? 0 : -1}>✕</button>
      </div>
    </li>
  );
}
