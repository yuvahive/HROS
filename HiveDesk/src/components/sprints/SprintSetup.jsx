import React, { useState } from 'react';
import { X, Save, Rocket } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useConfig } from '../../config/ConfigContext';
import { generateId } from '../../utils/helpers';

export default function SprintSetup({ onClose, onSaved }) {
  const { getVal } = useConfig();
  const duration = getVal('target_sprint_duration_days', 7);
  const teamTarget = getVal('target_team_questions_per_week', 40);

  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + duration * 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    weekNumber: '',
    startDate: today,
    endDate: endDate,
    sprintLeadId: '',
    sprintLeadName: '',
    targetQuestions: teamTarget,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  React.useEffect(() => {
    HiveDeskStorage.getAll('HiveDeskUsers').then(setUsers);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await HiveDeskStorage.insert('HiveDeskSprints', {
        ...form,
        id: generateId('SP'),
        status: 'planning',
        actualQuestions: 0,
        publishedCount: 0,
        avgQualityScore: 0,
        avgCompletionRate: 0,
        createdAt: new Date().toISOString(),
      });
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Rocket className="w-5 h-5 text-purple-400" /> New Sprint</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover transition-colors"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-hd-muted mb-1">Sprint Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Arrays & Strings Deep Dive"
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-hd-muted mb-1">Week Number</label>
              <input type="number" min="1" value={form.weekNumber} onChange={e => setForm({...form, weekNumber: e.target.value})}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-hd-muted mb-1">Target Questions</label>
              <input type="number" min="1" value={form.targetQuestions} onChange={e => setForm({...form, targetQuestions: e.target.value})}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-hd-muted mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-hd-muted mb-1">End Date *</label>
              <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-1">Sprint Lead</label>
            <select value={form.sprintLeadId} onChange={e => {
              const u = users.find(u => u.id === e.target.value);
              setForm({...form, sprintLeadId: e.target.value, sprintLeadName: u?.name || ''});
            }}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors">
              <option value="">Select lead</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

