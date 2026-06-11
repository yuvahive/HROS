import React, { useState, useEffect } from 'react';
import { Link2, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { getInitials } from '../../utils/helpers';

export default function BuddyPairView({ onAdd, onEdit }) {
  const [pairs, setPairs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, u] = await Promise.all([
        HiveDeskStorage.getAll('HiveDeskBuddyPairs'),
        HiveDeskStorage.getAll('HiveDeskUsers'),
      ]);
      setPairs(p);
      setUsers(u);
      setLoading(false);
    })();
  }, []);

  const activePairs = pairs.filter(p => p.active === 'true' || p.active === true);
  const { isAdmin, isLead } = useAuth();

  const handleDelete = async (id) => {
    if (!confirm('Delete this buddy pair?')) return;
    await HiveDeskStorage.remove('HiveDeskBuddyPairs', id);
    setPairs(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Buddy Pairs</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-hd-muted">{activePairs.length} active</span>
          {(isAdmin || isLead) && (
            <button onClick={onAdd} className="p-2 rounded-lg hover:bg-hd-hover text-hd-muted hover:text-accent transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activePairs.map((pair, i) => (
          <div key={pair.id || i} className="p-4 rounded-xl bg-hd-raised border border-hd-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                  {getInitials(pair.personAName)}
                </div>
                <div>
                  <p className="text-sm font-medium">{pair.personAName}</p>
                  <p className="text-[11px] text-hd-muted">A</p>
                </div>
              </div>
              <Link2 className="w-4 h-4 text-hd-muted" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                  {getInitials(pair.personBName)}
                </div>
                <div>
                  <p className="text-sm font-medium">{pair.personBName}</p>
                  <p className="text-[11px] text-hd-muted">B</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-hd-muted">Domain: <span className="text-hd-secondary">{pair.domain || '—'}</span></span>
              {(isAdmin || isLead) && (
                <div className="flex gap-1">
                  <button onClick={() => onEdit?.(pair)} className="p-1 rounded hover:bg-hd-hover text-hd-muted hover:text-accent transition-colors">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(pair.id)} className="p-1 rounded hover:bg-red-500/10 text-hd-muted hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {activePairs.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-hd-muted text-sm">No buddy pairs assigned yet</div>
        )}
      </div>
    </div>
  );
}
