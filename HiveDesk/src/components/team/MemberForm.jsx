import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { generateId } from '../../utils/helpers';

export default function MemberForm({ member, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || 'curator',
    domain: member?.domain || '',
    weeklyTargetQuestions: member?.weeklyTargetQuestions || '5',
    weeklyTargetReviews: member?.weeklyTargetReviews || '5',
    isActive: member?.isActive !== false ? 'true' : 'false',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (member?.id) {
        const result = await HiveDeskStorage.update('HiveDeskUsers', member.id, form);
        if (!result) throw new Error('Failed to save to cloud');
      } else {
        const result = await HiveDeskStorage.insert('HiveDeskUsers', {
          ...form,
          id: generateId('USR'),
          createdAt: new Date().toISOString(),
          password: 'changeme123',
        });
        if (!result) throw new Error('Failed to save to cloud');
      }
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message || 'Save failed'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{member ? 'Edit Member' : 'Add Member'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover transition-colors">
            <X className="w-5 h-5 text-hd-muted" />
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-hd-muted mb-1">Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-hd-muted mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-hd-muted mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} disabled={!isAdmin}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors disabled:opacity-50">
                <option value="curator">Curator</option>
                <option value="lead">Lead</option>
                {isAdmin && <option value="admin">Admin</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm text-hd-muted mb-1">Domain</label>
              <input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-hd-muted mb-1">Weekly Target (Create)</label>
              <input type="number" min="0" value={form.weeklyTargetQuestions} onChange={e => setForm({...form, weeklyTargetQuestions: e.target.value})}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-hd-muted mb-1">Weekly Target (Review)</label>
              <input type="number" min="0" value={form.weeklyTargetReviews} onChange={e => setForm({...form, weeklyTargetReviews: e.target.value})}
                className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

