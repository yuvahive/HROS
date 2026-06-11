import React, { useState, useEffect } from 'react';
import { Rocket, Plus, GripVertical } from 'lucide-react';
import SprintSetup from './SprintSetup';
import SprintAssignmentForm from './SprintAssignmentForm';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

const COLUMNS = ['planning', 'active', 'review', 'publish', 'done'];
const COL_LABELS = { planning: 'Planning', active: 'Active', review: 'Review', publish: 'Publish', done: 'Done' };
const COL_COLORS = {
  planning: 'bg-slate-400', active: 'bg-emerald-400', review: 'bg-amber-400', publish: 'bg-blue-400', done: 'bg-purple-400'
};

export default function SprintBoard() {
  const { isAdmin, isLead } = useRBAC();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshSignal = useRefreshSignal();
  const [showForm, setShowForm] = useState(false);
  const [assignSprint, setAssignSprint] = useState(null);
  const [dragged, setDragged] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await HiveDeskStorage.getAll('HiveDeskSprints');
    setSprints(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const grouped = {};
  COLUMNS.forEach(c => { grouped[c] = []; });
  sprints.forEach(s => {
    const col = COLUMNS.includes(s.status) ? s.status : 'planning';
    grouped[col].push(s);
  });

  const handleDragStart = (e, sprintId) => {
    setDragged(sprintId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDragged(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!dragged || !isAdmin) return;
    const sprint = sprints.find(s => s.id === dragged);
    if (sprint && sprint.status !== targetStatus) {
      await HiveDeskStorage.update('HiveDeskSprints', dragged, { status: targetStatus });
      load();
    }
    setDragged(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-400" /> Sprints
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{sprints.length} sprints</span>
        </div>
        {(isAdmin || isLead) && (
          <button onClick={() => setShowForm(true)} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Sprint
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-h-[400px]">
        {COLUMNS.map(col => (
          <div key={col} className="space-y-2" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col)}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={`w-2 h-2 rounded-full ${COL_COLORS[col]}`} />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-hd-muted">{COL_LABELS[col]}</h3>
              <span className="text-[10px] text-hd-muted bg-hd-surface/[0.05] px-1.5 py-0.5 rounded">{grouped[col].length}</span>
            </div>
            {grouped[col].map(s => (
              <div key={s.id} draggable={isAdmin} onDragStart={(e) => handleDragStart(e, s.id)} onDragEnd={handleDragEnd}
                className={`card card-hover p-3 ${dragged === s.id ? 'opacity-50 ring-1 ring-indigo-500/30' : ''} ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {isAdmin && <GripVertical className="w-3 h-3 text-hd-muted flex-shrink-0" />}
                  <p className="text-[13px] font-semibold text-hd-text truncate">{s.name || `Sprint #${s.weekNumber || '?'}`}</p>
                </div>
                <p className="text-[11px] text-hd-muted mb-2">{formatDate(s.startDate)} — {formatDate(s.endDate)}</p>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="text-hd-muted">{s.sprintLeadName || 'No lead'}</span>
                  <span className="font-mono text-indigo-400">{s.targetQuestions || 0}</span>
                </div>
                {s.actualQuestions > 0 && (
                  <div className="mt-1">
                    <div className="w-full bg-hd-surface/[0.05] h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (s.actualQuestions / (s.targetQuestions || 1)) * 100)}%` }} />
                    </div>
                  </div>
                )}
                {(isAdmin || isLead) && (
                  <button onClick={(e) => { e.stopPropagation(); setAssignSprint(s); }}
                    className="mt-2 w-full text-center py-1.5 rounded-lg border border-hd-border text-[11px] text-hd-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                    Assign
                  </button>
                )}
              </div>
            ))}
            {grouped[col].length === 0 && (
              <div className="text-center py-6 text-hd-muted/40 text-[11px]">Empty</div>
            )}
          </div>
        ))}
      </div>

      {showForm && <SprintSetup onClose={() => setShowForm(false)} onSaved={load} />}
      {assignSprint && <SprintAssignmentForm sprintId={assignSprint.id} onClose={() => setAssignSprint(null)} onSaved={load} />}
    </div>
  );
}

