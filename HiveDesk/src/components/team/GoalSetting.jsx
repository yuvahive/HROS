import { useState, useEffect } from 'react';
import { Flag, Plus, X, CheckCircle2, Clock } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

export default function GoalSetting() {
  const { currentUser } = useAuth();
  const refreshSignal = useRefreshSignal();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });

  const load = async () => {
    const raw = await HiveDeskStorage.fetchAll();
    if (!raw) { setLoading(false); return; }
    const all = Array.isArray(raw.HiveDeskGoals) ? raw.HiveDeskGoals : [];
    setGoals(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const handleAdd = async () => {
    if (!form.title) return;
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    const goal = {
      id: `goal-${Date.now()}`,
      personId: currentUser?.id,
      personName: currentUser?.name,
      title: form.title,
      description: form.description,
      targetDate: form.targetDate || endOfWeek.toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    await HiveDeskStorage.insert('HiveDeskGoals', goal);
    setForm({ title: '', description: '', targetDate: '' });
    setShowForm(false);
    load();
  };

  const handleProgress = async (goal, progress) => {
    const updated = { ...goal, progress: Math.min(100, Math.max(0, (goal.progress || 0) + progress)), status: progress >= 100 ? 'completed' : 'active' };
    await HiveDeskStorage.update('HiveDeskGoals', goal.id, updated);
    load();
  };

  const myGoals = goals.filter(g => g.personId === currentUser?.id);
  const teamGoals = goals.filter(g => g.personId !== currentUser?.id);

  const activeGoals = myGoals.filter(g => g.status === 'active');
  const completedGoals = myGoals.filter(g => g.status === 'completed');
  const completionRate = myGoals.length > 0 ? Math.round((completedGoals.length / myGoals.length) * 100) : 0;

  if (loading) return <div className="card p-12 text-center"><Flag className="w-10 h-10 mx-auto text-hd-muted/30 mb-3 animate-pulse" /><p className="text-sm text-hd-muted">Loading goals...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-400" /> Goals & OKRs
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{myGoals.length} goals</span>
        </div>
        <button onClick={() => setShowForm(true)} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {myGoals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center border-rose-500/20">
            <p className="text-xl font-black text-hd-text">{activeGoals.length}</p>
            <p className="text-[10px] text-hd-muted uppercase">Active</p>
          </div>
          <div className="card p-3 text-center border-emerald-500/20">
            <p className="text-xl font-black text-emerald-400">{completedGoals.length}</p>
            <p className="text-[10px] text-hd-muted uppercase">Completed</p>
          </div>
          <div className="card p-3 text-center border-indigo-500/20">
            <p className="text-xl font-black text-indigo-400">{completionRate}%</p>
            <p className="text-[10px] text-hd-muted uppercase">Rate</p>
          </div>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-hd-muted uppercase tracking-wider mb-3">Active Goals</h3>
          <div className="space-y-2">
            {activeGoals.map(g => (
              <div key={g.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Flag className="w-4 h-4 text-rose-400" />
                      <h4 className="text-sm font-semibold text-hd-text">{g.title}</h4>
                    </div>
                    {g.description && <p className="text-xs text-hd-muted mb-2">{g.description}</p>}
                    <div className="flex items-center gap-3 text-[10px] text-hd-muted">
                      {g.targetDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {formatDate(g.targetDate)}</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-hd-surface/[0.05] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-indigo-500" style={{ width: `${g.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-hd-text w-8 text-right">{g.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleProgress(g, 10)} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] hover:bg-emerald-500/20 transition-colors">+10%</button>
                    <button onClick={() => handleProgress(g, 25)} className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] hover:bg-blue-500/20 transition-colors">+25%</button>
                    <button onClick={() => handleProgress(g, 100)} className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] hover:bg-purple-500/20 transition-colors">Done</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-hd-muted uppercase tracking-wider mb-3">Completed</h3>
          <div className="flex flex-wrap gap-2">
            {completedGoals.map(g => (
              <div key={g.id} className="card p-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-hd-muted line-through">{g.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamGoals.filter(g => g.status === 'active').length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-hd-muted uppercase tracking-wider mb-3">Team Goals</h3>
          <div className="space-y-2">
            {teamGoals.filter(g => g.status === 'active').map(g => (
              <div key={g.id} className="card p-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-hd-text font-bold text-[10px]">{g.personName?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-hd-text truncate">{g.title}</p>
                    <p className="text-[10px] text-hd-muted">{g.personName}</p>
                  </div>
                  <div className="w-16 bg-hd-surface/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${g.progress || 0}%` }} />
                  </div>
                  <span className="text-[10px] text-hd-muted w-6">{g.progress || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="card p-12 text-center">
          <Flag className="w-10 h-10 mx-auto text-rose-500/30 mb-3" />
          <p className="text-sm text-hd-muted">No goals yet</p>
          <p className="text-xs text-hd-muted/60 mt-1">Set your first weekly goal to start tracking progress!</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-hd-text flex items-center gap-2"><Flag className="w-5 h-5 text-rose-400" /> New Goal</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
            </div>
            <div className="space-y-4">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What do you want to achieve this week?"
                className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-rose-500/50" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Add details (optional)"
                className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-rose-500/50 resize-none" />
              <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-rose-500/50" />
              <button onClick={handleAdd} disabled={!form.title} className="w-full accent-gradient text-white font-semibold disabled:opacity-50">
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

