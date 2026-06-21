import { useState, useEffect } from 'react';
import { fetchTeam, addMember, removeMember } from '../api/teamApi';
import { fetchTodos } from '../api/todoApi';
import { memberColor, memberInitials } from '../types/team';
import type { TeamMember } from '../types/team';

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<number, number>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchTeam(), fetchTodos()])
      .then(([m, todos]) => {
        setMembers(m);
        const counts: Record<number, number> = {};
        for (const todo of todos) {
          if (todo.assigneeId) counts[todo.assigneeId] = (counts[todo.assigneeId] ?? 0) + 1;
        }
        setTaskCounts(counts);
      })
      .catch(() => setError('Could not connect to the backend.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    setSaving(true);
    try {
      const member = await addMember(name);
      setMembers(prev => [...prev, member]);
      setInput('');
    } catch {
      setError('Could not add team member — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch {
      setError('Could not remove team member — please try again.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Team</h2>
          {!loading && (
            <p className="page-subtitle">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
          )}
        </div>
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
          {members.length === 0 ? (
            <div className="status-msg">No team members yet. Add one below.</div>
          ) : (
            <ul className="member-list-full">
              {members.map(m => {
                const count = taskCounts[m.id] ?? 0;
                return (
                  <li key={m.id} className="member-row">
                    <span
                      className="avatar avatar-lg"
                      style={{ background: memberColor(m.id) }}
                    >
                      {memberInitials(m.name)}
                    </span>
                    <span className="member-row-name">{m.name}</span>
                    <span className="member-task-count">
                      {count} {count === 1 ? 'task' : 'tasks'}
                    </span>
                    <button
                      className="btn-danger-sm"
                      onClick={() => handleRemove(m.id)}
                      aria-label={`Remove ${m.name}`}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="team-add-section">
            <h3 className="section-label">Add team member</h3>
            <form className="team-add-form" onSubmit={handleAdd}>
              <input
                className="form-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Full name"
              />
              <button
                className="btn-primary"
                type="submit"
                disabled={saving || !input.trim()}
              >
                {saving ? 'Adding…' : 'Add Member'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
