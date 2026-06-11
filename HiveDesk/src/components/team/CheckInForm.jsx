import React, { useState } from 'react';
import { X, Save, Heart } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { createCheckIn } from '../../services/checkInService';

export default function CheckInForm({ onClose, onSaved }) {
  const { user } = useAuth();
  const weekNum = Math.ceil((new Date().getDate()) / 7);
  const [form, setForm] = useState({
    weekNumber: weekNum,
    mood: '',
    energy: 'medium',
    blockers: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const moods = [
    { value: 'great', label: 'Excellent', emoji: '🔥' },
    { value: 'good', label: 'Good', emoji: '😊' },
    { value: 'neutral', label: 'Okay', emoji: '😐' },
    { value: 'bad', label: 'Struggling', emoji: '😞' },
    { value: 'terrible', label: 'Need Help', emoji: '🚨' },
  ];

  const energies = [
    { value: 'high', label: 'High', color: 'text-emerald-400' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400' },
    { value: 'low', label: 'Low', color: 'text-red-400' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mood) { setError('Select your mood'); return; }
    setLoading(true);
    setError('');
    try {
      await createCheckIn(form, user.name, user.id);
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400" /> Weekly Check-In</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-hd-muted mb-2">How are you feeling? *</label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map(m => (
                <button key={m.value} type="button" onClick={() => setForm({...form, mood: m.value})}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.mood === m.value ? 'border-accent bg-accent/10 ring-1 ring-accent/30' : 'border-hd-border hover:bg-hd-hover'
                  }`}>
                  <span className="text-2xl block mb-1">{m.emoji}</span>
                  <span className="text-[10px] text-hd-muted">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-2">Energy Level</label>
            <div className="flex gap-3">
              {energies.map(e => (
                <button key={e.value} type="button" onClick={() => setForm({...form, energy: e.value})}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.energy === e.value ? 'border-accent bg-accent/10 text-accent' : 'border-hd-border text-hd-muted hover:bg-hd-hover'
                  }`}>{e.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-1">Blockers</label>
            <input value={form.blockers} onChange={e => setForm({...form, blockers: e.target.value})}
              placeholder="Anything blocking your progress?"
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors" />
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Anything else..."
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

