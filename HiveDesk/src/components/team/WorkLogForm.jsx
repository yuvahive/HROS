import { useState } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { createWorkLog } from '../../services/workLogService';

export default function WorkLogForm({ onClose, onSaved }) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    taskName: '',
    taskType: 'question-creation',
    hoursWorked: '',
    date: today,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createWorkLog(form, user.name, user.id);
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Log Work</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-hd-muted mb-1">Task Name *</label>
            <input value={form.taskName} onChange={e => setForm({...form, taskName: e.target.value})} required
              placeholder="e.g. Created Q-047 Two Sum"
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-hd-muted mb-1">Type</label>
              <select value={form.taskType} onChange={e => setForm({...form, taskType: e.target.value})}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
                <option value="question-creation">Question Creation</option>
                <option value="review">Review</option>
                <option value="revision">Revision</option>
                <option value="sprint-setup">Sprint Setup</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-hd-muted mb-1">Hours *</label>
              <input type="number" step="0.25" min="0" max="24" value={form.hoursWorked} onChange={e => setForm({...form, hoursWorked: e.target.value})} required
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-hd-muted mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm text-hd-muted mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

