import { useState, useEffect } from 'react';
import { X, Save, Target } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useConfig } from '../../config/ConfigContext';
import { generateId } from '../../utils/helpers';

export default function SprintAssignmentForm({ sprintId, onClose, onSaved }) {
  const { getVal } = useConfig();
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const u = await HiveDeskStorage.getAll('HiveDeskUsers');
      setUsers(u.filter(x => x.role !== 'admin'));
      const existing = await HiveDeskStorage.filter('HiveDeskSprintAssignments', { sprintId });
      setAssignments(existing.data || []);
    })();
  }, [sprintId]);

  const targetPerPerson = getVal('target_questions_per_person_per_week', 5);
  const reviewTarget = getVal('target_reviews_per_person_per_week', 5);

  const updateAssignment = (personId, field, value) => {
    const idx = assignments.findIndex(a => a.personId === personId);
    if (idx >= 0) {
      const updated = [...assignments];
      updated[idx] = { ...updated[idx], [field]: value };
      setAssignments(updated);
    } else {
      const user = users.find(u => u.id === personId);
      setAssignments([...assignments, {
        id: generateId('SA'),
        sprintId,
        personId,
        personName: user?.name || '',
        domain: user?.domain || '',
        targetCount: targetPerPerson,
        actualCount: 0,
        reviewedCount: 0,
        status: 'on-track',
        [field]: value,
      }]);
    }
  };

  const getAssignment = (personId) => assignments.find(a => a.personId === personId) || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      for (const a of assignments) {
        const existing = await HiveDeskStorage.filter('HiveDeskSprintAssignments', { sprintId: a.sprintId, personId: a.personId });
        const rows = existing.data || [];
        if (rows.length > 0) {
          await HiveDeskStorage.update('HiveDeskSprintAssignments', rows[0].id, a);
        } else {
          await HiveDeskStorage.insert('HiveDeskSprintAssignments', a);
        }
      }
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-accent" /> Assign Sprint Targets</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {users.map(u => {
            const a = getAssignment(u.id);
            return (
              <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-hd-raised border border-hd-border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-[11px] text-hd-muted">{u.domain || u.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <label className="text-[10px] text-hd-muted block mb-1">Create</label>
                    <input type="number" min="0" value={a.targetCount || targetPerPerson}
                      onChange={e => updateAssignment(u.id, 'targetCount', Number(e.target.value))}
                      className="w-16 bg-hd-raised border border-hd-border rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-accent" />
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] text-hd-muted block mb-1">Review</label>
                    <input type="number" min="0" value={a.reviewTarget || reviewTarget}
                      onChange={e => updateAssignment(u.id, 'reviewTarget', Number(e.target.value))}
                      className="w-16 bg-hd-raised border border-hd-border rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

