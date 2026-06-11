import React, { useState, useEffect, useRef } from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, MessageSquare, ArrowRight, GripVertical, Clock, User, Star } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

const COLUMNS = [
  { id: 'in-review', label: 'Pending Review', color: 'bg-amber-400', dark: 'bg-amber-500/15', border: 'border-amber-500/20', icon: ClipboardCheck, desc: 'Awaiting review' },
  { id: 'reviewing', label: 'In Progress', color: 'bg-blue-400', dark: 'bg-blue-500/15', border: 'border-blue-500/20', icon: AlertTriangle, desc: 'Being reviewed' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-400', dark: 'bg-emerald-500/15', border: 'border-emerald-500/20', icon: CheckCircle2, desc: 'Review finished' },
];

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ReviewQueue() {
  const refreshSignal = useRefreshSignal();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const dragRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const pending = await HiveDeskStorage.filter('HiveDeskQuestions', { status: 'in-review' });
    const reviewing = await HiveDeskStorage.filter('HiveDeskQuestions', { status: 'reviewing' });
    const completed = await HiveDeskStorage.filter('HiveDeskQuestions', { status: 'completed' });
    const all = [
      ...(pending.data || []).map(q => ({ ...q, _column: 'in-review' })),
      ...(reviewing.data || []).map(q => ({ ...q, _column: 'reviewing' })),
      ...(completed.data || []).map(q => ({ ...q, _column: 'completed' })),
    ];
    setQuestions(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const grouped = {};
  COLUMNS.forEach(c => { grouped[c.id] = []; });
  questions.forEach(q => {
    const col = q._column || 'in-review';
    if (grouped[col]) grouped[col].push(q);
  });

  const handleDragStart = (e, id) => {
    setDragged(id);
    dragRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    setDragged(null);
    setDragOverCol(null);
    dragRef.current = null;
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = (e, colId) => {
    if (dragOverCol === colId) setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!dragged) return;
    const q = questions.find(q => q.id === dragged);
    if (q && q._column !== targetStatus) {
      await HiveDeskStorage.update('HiveDeskQuestions', dragged, { status: targetStatus });
      load();
    }
    setDragged(null);
    setDragOverCol(null);
    dragRef.current = null;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center animate-pulse">
          <ClipboardCheck className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-sm text-hd-muted">Loading reviews...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hd-text flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
            </div>
            Review Queue
          </h2>
          <p className="text-xs text-hd-muted mt-0.5 ml-10">Drag cards between columns to update status</p>
        </div>
        <div className="flex items-center gap-2">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex items-center gap-1.5 bg-hd-surface/[0.04] px-2.5 py-1.5 rounded-lg">
              <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
              <span className="text-[11px] text-hd-muted">{grouped[col.id]?.length || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex md:grid md:grid-cols-3 gap-4 min-h-[500px] overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 snap-x snap-mandatory">
        {COLUMNS.map(col => {
          const ColIcon = col.icon;
          const items = grouped[col.id] || [];
          const isOver = dragOverCol === col.id;
          return (
            <div key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`min-w-[280px] md:min-w-0 snap-start rounded-xl border transition-all duration-200 flex flex-col ${
                isOver ? `${col.border} bg-hd-surface/[0.03] shadow-lg` : 'border-hd-border bg-hd-surface/[0.02]'
              }`}>
              <div className={`sticky top-0 z-10 ${col.dark} rounded-t-xl border-b ${col.border} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${col.color}/20 flex items-center justify-center`}>
                      <ColIcon className={`w-4 h-4 ${col.color.replace('bg-', 'text-').replace('-400', '-400')}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-hd-text">{col.label}</h3>
                      <p className="text-[10px] text-hd-muted">{col.desc}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${col.dark} ${col.color.replace('bg-', 'text-').replace('-400', '-400')}`}>
                    {items.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)]">
                {items.map((q, i) => (
                  <div key={q.id || i}
                    draggable
                    onDragStart={(e) => handleDragStart(e, q.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      dragged === q.id
                        ? 'opacity-40 scale-[0.97] ring-2 ring-indigo-500/40 border-indigo-500/30 shadow-xl shadow-indigo-500/10'
                        : 'border-hd-border bg-hd-surface hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5'
                    }`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-hd-border to-transparent pointer-events-none" />

                    <div className="relative p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-3.5 h-3.5 text-hd-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">
                          {q.prefix || q.id?.slice(0, 8)}
                        </span>
                        {q.difficulty && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[q.difficulty] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>

                      <h4 className="text-[13px] font-bold text-hd-text leading-snug mb-1.5 line-clamp-2">{q.title}</h4>

                      <div className="flex items-center gap-2 text-[10px] text-hd-muted mb-2.5">
                        {q.domain && (
                          <span className="bg-hd-surface/[0.04] px-1.5 py-0.5 rounded">{q.domain}</span>
                        )}
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {q.creatorName || '—'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-hd-muted mb-3">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {q.testCasesCount || 0} tests</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {q.hintsCount || 0} hints</span>
                        {q.hasStarterCode === 'true' && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-medium">Starter</span>}
                        {q.hasSolution === 'true' && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-medium">Solution</span>}
                      </div>

                      {col.id === 'in-review' && (
                        <button onClick={(e) => { e.stopPropagation(); setReviewing(q); }}
                          className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/20 hover:border-amber-500/30 text-amber-400 px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/5">
                          Start Review <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {col.id === 'reviewing' && (
                        <div className="flex items-center gap-2 text-[10px] text-blue-400 bg-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10">
                          <Clock className="w-3 h-3" />
                          <span>In progress by {q.assigneeName || 'someone'}</span>
                        </div>
                      )}

                      {col.id === 'completed' && (
                        <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-full bg-hd-surface/[0.03] flex items-center justify-center mb-2">
                      <ColIcon className={`w-4 h-4 ${col.color.replace('bg-', 'text-').replace('-400', '-400/30')}`} />
                    </div>
                    <p className="text-xs text-hd-muted/40">No items</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {reviewing && <ReviewForm question={reviewing} onClose={() => setReviewing(null)} onSaved={load} />}
    </div>
  );
}
