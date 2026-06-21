import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodos, updateTodo, deleteTodo } from '../api/todoApi';
import { fetchTeam } from '../api/teamApi';
import type { Todo, TodoStatus, FilterType } from '../types/todo';
import type { TeamMember } from '../types/team';
import { TodoItem } from '../components/TodoItem';

const ONGOING_STATUSES: TodoStatus[] = ['Active', 'InProgress', 'Blocked'];

export function TasksPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<FilterType>('Ongoing');
  const [assigneeFilter, setAssigneeFilter] = useState<number | 'unassigned' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchTodos(), fetchTeam()])
      .then(([t, m]) => { setTodos(t); setMembers(m); })
      .catch(() => setError('Could not connect to the backend. Make sure the API is running on port 5000.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (
    id: number,
    data: { title: string; description?: string; status: TodoStatus; dueDate?: string; assigneeId?: number }
  ) => {
    try {
      const updated = await updateTodo(id, data);
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch {
      setError('Could not save changes — please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Could not delete the task — please try again.');
    }
  };

  const clearClosed = () => {
    const closed = todos.filter(t => t.status === 'Closed');
    Promise.all(closed.map(t => deleteTodo(t.id)))
      .then(() => setTodos(prev => prev.filter(t => t.status !== 'Closed')))
      .catch(() => setError('Could not clear closed tasks — please try again.'));
  };

  const filtered = todos.filter(t => {
    const statusMatch =
      filter === 'New' ? t.status === 'New' :
      filter === 'Ongoing' ? ONGOING_STATUSES.includes(t.status) :
      t.status === 'Closed';

    const assigneeMatch =
      assigneeFilter === null ? true :
      assigneeFilter === 'unassigned' ? !t.assigneeId :
      t.assigneeId === assigneeFilter;

    return statusMatch && assigneeMatch;
  });

  const filters: FilterType[] = ['New', 'Ongoing', 'Closed'];
  const openCount = todos.filter(t => t.status !== 'Closed').length;
  const closedCount = todos.filter(t => t.status === 'Closed').length;
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tasks</h2>
          {!loading && todos.length > 0 && (
            <p className="page-subtitle">{openCount} open · {closedCount} closed</p>
          )}
        </div>
        <button className="btn-primary" onClick={() => navigate('/tasks/new')}>
          + New Task
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button className="error-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="status-msg">Loading...</div>
      ) : (
        <>
          <div className="toolbar">
            <div className="filters" role="tablist" aria-label="Task filter">
              {filters.map((f, i) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  tabIndex={filter === f ? 0 : -1}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                  onKeyDown={e => {
                    let next: number | null = null;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      next = (i + 1) % filters.length;
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      next = (i - 1 + filters.length) % filters.length;
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      next = 0;
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      next = filters.length - 1;
                    }
                    if (next !== null) {
                      setFilter(filters[next]);
                      const tabs = e.currentTarget
                        .closest('[role="tablist"]')
                        ?.querySelectorAll<HTMLElement>('[role="tab"]');
                      tabs?.[next]?.focus();
                    }
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              {members.length > 0 && (
                <select
                  className="assignee-filter-select"
                  aria-label="Filter by person"
                  value={
                    assigneeFilter === null ? '' :
                    assigneeFilter === 'unassigned' ? 'unassigned' :
                    String(assigneeFilter)
                  }
                  onChange={e => {
                    const v = e.target.value;
                    setAssigneeFilter(v === '' ? null : v === 'unassigned' ? 'unassigned' : Number(v));
                  }}
                >
                  <option value="">All people</option>
                  <option value="unassigned">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
              {filter === 'Closed' && closedCount > 0 && (
                <button className="clear-btn" onClick={clearClosed}>Clear closed</button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="status-msg">
              {filter === 'New' && 'No new tasks.'}
              {filter === 'Ongoing' && 'No tasks in progress.'}
              {filter === 'Closed' && 'No closed tasks yet.'}
            </div>
          ) : (
            <>
              <ul className="todo-list">
                {filtered.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    members={members}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </>
          )}

          {todos.length > 0 && (
            <div className="list-footer">
              {openCount} open · {closedCount} closed
            </div>
          )}
        </>
      )}
    </div>
  );
}
