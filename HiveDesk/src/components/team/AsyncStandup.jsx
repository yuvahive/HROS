import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Clock, CheckCircle2 } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

export default function AsyncStandup() {
  const { currentUser } = useAuth();
  const [standups, setStandups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshSignal = useRefreshSignal();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ yesterday: '', today: '', blockers: '' });

  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    const raw = await HiveDeskStorage.fetchAll();
    if (!raw) { setLoading(false); return; }
    const all = Array.isArray(raw.HiveDeskStandups) ? raw.HiveDeskStandups : [];
    const u = Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : [];
    setStandups(all);
    setUsers(u.filter(u => u.isActive === 'true' || u.isActive === true));
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const hasSubmittedToday = standups.some(s => s.personId === currentUser?.id && s.date === today);

  const handleSubmit = async () => {
    const entry = {
      id: `standup-${Date.now()}`,
      personId: currentUser?.id,
      personName: currentUser?.name,
      date: today,
      yesterday: form.yesterday,
      today: form.today,
      blockers: form.blockers,
      createdAt: new Date().toISOString(),
    };
    await HiveDeskStorage.insert('HiveDeskStandups', entry);
    setForm({ yesterday: '', today: '', blockers: '' });
    setShowForm(false);
    load();
  };

  const todayStandups = standups.filter(s => s.date === today).reverse();
  const recentStandups = standups.filter(s => s.date !== today).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);

  if (loading) return <div className="card p-12 text-center"><MessageCircle className="w-10 h-10 mx-auto text-hd-muted/30 mb-3 animate-pulse" /><p className="text-sm text-hd-muted">Loading standups...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" /> Async Standup
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{todayStandups.length} today</span>
        </div>
        {!hasSubmittedToday && (
          <button onClick={() => setShowForm(true)} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
            <MessageCircle className="w-4 h-4" /> Submit Standup
          </button>
        )}
      </div>

      {hasSubmittedToday && (
        <div className="card p-3 bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">You've submitted your standup for today. Great job!</span>
        </div>
      )}

      {todayStandups.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-hd-muted uppercase tracking-wider mb-3">Today's Standups</h3>
          <div className="space-y-2">
            {todayStandups.map(s => {
              const u = users.find(u => u.id === s.personId);
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-hd-text font-bold text-xs">
                      {s.personName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-hd-text">{s.personName}</p>
                      <p className="text-[10px] text-hd-muted">{u?.domain || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 rounded-lg bg-hd-surface/[0.02]">
                      <p className="text-[10px] text-hd-muted uppercase tracking-wider mb-1">Yesterday</p>
                      <p className="text-xs text-hd-secondary">{s.yesterday || '—'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-hd-surface/[0.02]">
                      <p className="text-[10px] text-hd-muted uppercase tracking-wider mb-1">Today</p>
                      <p className="text-xs text-hd-secondary">{s.today || '—'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-[10px] text-hd-muted uppercase tracking-wider mb-1">Blockers</p>
                      <p className="text-xs text-red-400">{s.blockers || 'None'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentStandups.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-hd-muted uppercase tracking-wider mb-3">Previous Updates</h3>
          <div className="space-y-1">
            {recentStandups.map(s => (
              <div key={s.id} className="card p-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-hd-text font-bold text-[10px] flex-shrink-0">
                  {s.personName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-hd-text">{s.personName}</span>
                    <span className="text-[10px] text-hd-muted">{s.date}</span>
                  </div>
                  <p className="text-[11px] text-hd-muted mt-0.5 line-clamp-1">Today: {s.today || '—'}</p>
                </div>
                {s.blockers && <span className="text-[10px] text-red-400 flex-shrink-0">⚠ Blocked</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {standups.length === 0 && (
        <div className="card p-12 text-center">
          <MessageCircle className="w-10 h-10 mx-auto text-emerald-500/30 mb-3" />
          <p className="text-sm text-hd-muted">No standups yet</p>
          <p className="text-xs text-hd-muted/60 mt-1">Be the first to share your daily update!</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-hd-text flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" /> Daily Standup
                </h3>
                <p className="text-xs text-hd-muted mt-0.5">{today}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-hd-muted mb-1">What did you do yesterday?</label>
                <textarea value={form.yesterday} onChange={e => setForm(f => ({ ...f, yesterday: e.target.value }))} rows={2} placeholder="Completed code review for..."
                  className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-emerald-500/50 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm text-hd-muted mb-1">What will you do today?</label>
                <textarea value={form.today} onChange={e => setForm(f => ({ ...f, today: e.target.value }))} rows={2} placeholder="Working on..."
                  className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-emerald-500/50 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm text-hd-muted mb-1">Any blockers? <span className="text-hd-muted">(optional)</span></label>
                <input value={form.blockers} onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))} placeholder="Nothing blocking"
                  className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-red-500/50 transition-colors" />
              </div>
              <button onClick={handleSubmit} className="w-full accent-gradient text-white font-semibold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit Standup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

