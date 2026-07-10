import { useState, useEffect } from 'react';
import { X, Save, Link2 } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useNotifications } from '../../auth/Notifications';
import { generateId } from '../../utils/helpers';

export default function BuddyPairForm({ pair, onClose, onSaved }) {
  const { notify } = useNotifications();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    personAId: pair?.personAId || '',
    personAName: pair?.personAName || '',
    personBId: pair?.personBId || '',
    personBName: pair?.personBName || '',
    domain: pair?.domain || '',
    active: pair?.active !== undefined ? String(pair.active) : 'true',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    HiveDeskStorage.getAll('HiveDeskUsers').then(setUsers);
  }, []);

  const selectUser = (field, nameField, userId) => {
    const u = users.find(u => u.id === userId);
    setForm(prev => ({ ...prev, [field]: userId, [nameField]: u?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.personAId || !form.personBId) { setError('Select both members'); return; }
    if (form.personAId === form.personBId) { setError('Select different members'); return; }
    setLoading(true);
    setError('');
    try {
      if (pair?.id) {
        await HiveDeskStorage.update('HiveDeskBuddyPairs', pair.id, form);
      } else {
        await HiveDeskStorage.insert('HiveDeskBuddyPairs', {
          ...form,
          id: generateId('BP'),
          createdAt: new Date().toISOString(),
        });
        [form.personAId, form.personBId].forEach(id => {
          if (id) notify({
            userId: id,
            type: 'info',
            title: 'Buddy Pair Assigned',
            message: `You've been paired with ${id === form.personAId ? form.personBName : form.personAName}`,
            resourceType: 'buddy',
            link: 'team'
          });
        });
      }
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Link2 className="w-5 h-5 text-accent" /> {pair ? 'Edit' : 'Create'} Buddy Pair</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-hd-muted mb-1">Member A *</label>
            <select value={form.personAId} onChange={e => selectUser('personAId', 'personAName', e.target.value)}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
              <option value="">Select member</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.domain || u.role})</option>)}
            </select>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-hd-raised flex items-center justify-center">
              <Link2 className="w-4 h-4 text-hd-muted" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-hd-muted mb-1">Member B *</label>
            <select value={form.personBId} onChange={e => selectUser('personBId', 'personBName', e.target.value)}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
              <option value="">Select member</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.domain || u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-hd-muted mb-1">Domain Focus</label>
            <input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} placeholder="e.g. DSA, Full-Stack"
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm text-hd-muted mb-1">Status</label>
            <select value={form.active} onChange={e => setForm({...form, active: e.target.value})}
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

