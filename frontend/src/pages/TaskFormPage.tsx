import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTodoById, createTodo, updateTodo, deleteTodo } from '../api/todoApi';
import { fetchTeam } from '../api/teamApi';
import { TODO_STATUSES, statusLabel } from '../types/todo';
import type { TodoStatus } from '../types/todo';
import type { TeamMember } from '../types/team';

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('New');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) {
      fetchTeam()
        .then(setMembers)
        .catch(() => setError('Could not load team members — please try again.'));
      return;
    }

    Promise.all([
      fetchTodoById(Number(id)).then(todo => {
        setTitle(todo.title);
        setDescription(todo.description ?? '');
        setStatus(todo.status);
        setAssigneeId(todo.assigneeId ?? undefined);
        setDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
      }),
      fetchTeam().then(setMembers),
    ])
      .catch(() => setError('Failed to load task.'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateTodo(Number(id), {
          title: t,
          description: description.trim() || undefined,
          status,
          dueDate: dueDate || undefined,
          assigneeId,
        });
      } else {
        await createTodo(t, description.trim() || undefined, dueDate || undefined, assigneeId);
      }
      navigate('/tasks');
    } catch {
      setError('Could not save task — please try again.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    setSaving(true);
    try {
      await deleteTodo(Number(id));
      navigate('/tasks');
    } catch {
      setError('Could not delete the task — please try again.');
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><div className="status-msg">Loading...</div></div>;

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate('/tasks')}>
        ← Back to Tasks
      </button>
      <div className="page-header">
        <h2 className="page-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button className="error-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">Title</label>
          <input
            id="title"
            className="form-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div className="form-row">
          {isEdit && (
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as TodoStatus)}
              >
                {TODO_STATUSES.map(s => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="assignee">Assignee</label>
            <select
              id="assignee"
              className="form-select"
              value={assigneeId ?? ''}
              onChange={e => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              className="form-input"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/tasks')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="danger-zone">
          <p className="danger-label">Danger zone</p>
          <button className="btn-danger" onClick={handleDelete} disabled={saving}>
            Delete Task
          </button>
        </div>
      )}
    </div>
  );
}
