import { useState, useEffect } from 'react';
import { Columns3, Plus, GripVertical, CheckCircle2, AlertTriangle, FileCode2, Eye, Download } from 'lucide-react';
import QuestionForm from '../questions/QuestionForm';
import QuestionCard from '../questions/QuestionCard';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { exportToCSV, exportToJSON } from '../../utils/export';

const COLUMNS = [
  { id: 'draft', label: 'Draft', color: 'bg-slate-400', icon: FileCode2 },
  { id: 'in-review', label: 'In Review', color: 'bg-amber-400', icon: Eye },
  { id: 'needs-revision', label: 'Needs Revision', color: 'bg-red-400', icon: AlertTriangle },
  { id: 'approved', label: 'Approved', color: 'bg-blue-400', icon: CheckCircle2 },
  { id: 'published', label: 'Published', color: 'bg-emerald-400', icon: CheckCircle2 },
];

const DIFFICULTY_COLORS = { Easy: 'text-emerald-400', Medium: 'text-amber-400', Hard: 'text-red-400' };

export default function QuestionPipeline() {
  const { isAdmin, isLead, hasPermission } = useRBAC();
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [filterDomain, setFilterDomain] = useState('');

  const refreshSignal = useRefreshSignal();
  const canDrag = isAdmin || isLead;
  const canCreate = hasPermission('questions_create');
  const canExport = hasPermission('questions_export');
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    const data = await HiveDeskStorage.getAll('HiveDeskQuestions');
    setQuestions(data);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const grouped = {};
  COLUMNS.forEach(c => { grouped[c.id] = []; });
  questions.forEach(q => {
    const col = COLUMNS.find(c => c.id === q.status) ? q.status : 'draft';
    if (!filterDomain || q.domain === filterDomain) {
      grouped[col].push(q);
    }
  });

  const allDomains = [...new Set(questions.map(q => q.domain).filter(Boolean))];

  const handleDragStart = (e, qId) => {
    if (!canDrag) return;
    setDragged(qId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDragged(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!dragged || !canDrag) return;
    const q = questions.find(x => x.id === dragged);
    if (q && q.status !== targetStatus) {
      await HiveDeskStorage.update('HiveDeskQuestions', dragged, { status: targetStatus });
      load();
    }
    setDragged(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Columns3 className="w-5 h-5 text-cyan-400" /> Question Pipeline
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{questions.length} questions</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
            className="bg-hd-surface border border-hd-border rounded-lg px-3 py-1.5 text-xs text-hd-secondary outline-none">
            <option value="">All Domains</option>
            {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {canExport && (
            <div className="relative">
              <button onClick={() => setShowExport(!showExport)}
                className="px-2.5 py-1.5 rounded-lg border border-hd-border text-xs text-hd-muted hover:bg-hd-hover flex items-center gap-1 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              {showExport && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-hd-raised border border-hd-border rounded-lg shadow-xl py-1 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={() => { exportToCSV(questions, 'hivedesk-questions'); setShowExport(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-hd-text hover:bg-hd-hover flex items-center gap-2">
                      <FileCode2 className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
                    </button>
                    <button onClick={() => { exportToJSON(questions, 'hivedesk-questions'); setShowExport(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-hd-text hover:bg-hd-hover flex items-center gap-2">
                      <FileCode2 className="w-3.5 h-3.5 text-amber-400" /> Export JSON
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {canCreate && (
            <button onClick={() => { setEditingQ(null); setShowForm(true); }}
              className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-h-[400px]">
        {COLUMNS.map(col => {
          return (
            <div key={col.id} className="space-y-2" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-hd-muted">{col.label}</h3>
                <span className="text-[10px] text-hd-muted bg-hd-surface/[0.05] px-1.5 py-0.5 rounded">{grouped[col.id].length}</span>
              </div>
              {grouped[col.id].map(q => (
                <div key={q.id} draggable={canDrag} onDragStart={(e) => handleDragStart(e, q.id)} onDragEnd={handleDragEnd}
                  className={`card card-hover p-3 ${dragged === q.id ? 'opacity-50 ring-1 ring-indigo-500/30' : ''} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {canDrag && <GripVertical className="w-3 h-3 text-hd-muted flex-shrink-0" />}
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">{q.prefix || q.id?.slice(0, 8)}</span>
                    <span className={`text-[10px] font-semibold ${DIFFICULTY_COLORS[q.difficulty] || 'text-hd-muted'}`}>{q.difficulty}</span>
                  </div>
                  <p className="text-[12px] font-medium text-hd-text truncate cursor-pointer hover:text-indigo-400" onClick={() => setSelectedQ(q)}>
                    {q.title || 'Untitled'}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-hd-muted">
                    <span>{q.domain || '—'}</span>
                    <span>{q.creatorName?.split(' ')[0] || '—'}</span>
                  </div>
                  {q.qualityScore > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="flex-1 bg-hd-surface/[0.05] h-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (Number(q.qualityScore) / 5) * 100)}%` }} />
                      </div>
                      <span className="text-[9px] text-indigo-400 font-mono">{Number(q.qualityScore).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              ))}
              {grouped[col.id].length === 0 && (
                <div className="text-center py-6 text-hd-muted/40 text-[11px]">Empty</div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && <QuestionForm question={editingQ} onClose={() => { setShowForm(false); setEditingQ(null); }} onSaved={load} />}
      {selectedQ && <QuestionCard question={selectedQ} onClose={() => setSelectedQ(null)} />}
    </div>
  );
}

