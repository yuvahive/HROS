import React, { useState, useEffect } from 'react';
import { Plus, FileCode2, GripVertical, User, Star, Clock, CheckCircle2, AlertTriangle, Ban, Archive, Hourglass, Download } from 'lucide-react';
import QuestionForm from './QuestionForm';
import QuestionCard from './QuestionCard';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';
import { exportToCSV, exportToJSON } from '../../utils/export';

const COLUMNS = [
  { id: 'draft', label: 'Draft', color: 'bg-slate-400', dark: 'bg-slate-500/15', border: 'border-slate-500/20', icon: FileCode2, desc: 'Unpublished drafts' },
  { id: 'in-review', label: 'In Review', color: 'bg-amber-400', dark: 'bg-amber-500/15', border: 'border-amber-500/20', icon: Hourglass, desc: 'Awaiting approval' },
  { id: 'needs-revision', label: 'Needs Revision', color: 'bg-red-400', dark: 'bg-red-500/15', border: 'border-red-500/20', icon: AlertTriangle, desc: 'Changes requested' },
  { id: 'approved', label: 'Approved', color: 'bg-blue-400', dark: 'bg-blue-500/15', border: 'border-blue-500/20', icon: CheckCircle2, desc: 'Ready to publish' },
  { id: 'published', label: 'Published', color: 'bg-emerald-400', dark: 'bg-emerald-500/15', border: 'border-emerald-500/20', icon: Archive, desc: 'Live questions' },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-400', dark: 'bg-rose-500/15', border: 'border-rose-500/20', icon: Ban, desc: 'Not accepted' },
];

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function QuestionBank() {
  const refreshSignal = useRefreshSignal();
  const { hasPermission } = useRBAC();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedQ, setSelectedQ] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const canCreate = hasPermission('questions_create');
  const canExport = hasPermission('questions_export');
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await HiveDeskStorage.getAll('HiveDeskQuestions');
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const grouped = {};
  COLUMNS.forEach(c => { grouped[c.id] = []; });
  questions.forEach(q => {
    const col = COLUMNS.find(c => c.id === q.status) ? q.status : 'draft';
    grouped[col].push(q);
  });

  const handleDragStart = (e, id) => {
    setDragged(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    setDragged(null);
    setDragOverCol(null);
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
    if (q && q.status !== targetStatus) {
      await HiveDeskStorage.update('HiveDeskQuestions', dragged, { status: targetStatus });
      load();
    }
    setDragged(null);
    setDragOverCol(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center animate-pulse">
          <FileCode2 className="w-5 h-5 text-purple-400" />
        </div>
        <p className="text-sm text-hd-muted">Loading questions...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hd-text flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <FileCode2 className="w-4 h-4 text-purple-400" />
            </div>
            Question Bank
          </h2>
          <p className="text-xs text-hd-muted mt-0.5 ml-10">Drag questions between columns to update status · {questions.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <div className="relative">
              <button onClick={() => setShowExport(!showExport)}
                className="px-3 py-2 rounded-xl border border-hd-border text-xs text-hd-muted hover:bg-hd-hover flex items-center gap-1.5 transition-colors">
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2 rounded-xl text-hd-text text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30">
              <Plus className="w-4 h-4" /> New Question
            </button>
          )}
        </div>
      </div>

      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[500px] overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 snap-x snap-mandatory">
        {COLUMNS.map(col => {
          const Icon = col.icon;
          const items = grouped[col.id] || [];
          const isOver = dragOverCol === col.id;
          return (
            <div key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`min-w-[260px] md:min-w-0 snap-start rounded-xl border transition-all duration-200 flex flex-col ${
                isOver ? `${col.border} bg-hd-surface/[0.03] shadow-lg` : 'border-hd-border bg-hd-surface/[0.02]'
              }`}>
              <div className={`sticky top-0 z-10 ${col.dark} rounded-t-xl border-b ${col.border} px-3 py-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${col.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${col.color.replace('bg-', 'text-').replace('-400', '-400')}`} />
                    </div>
                    <span className="text-xs font-bold text-hd-text truncate">{col.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1 ${col.dark} ${col.color.replace('bg-', 'text-').replace('-400', '-400')}`}>
                    {items.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
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

                    <div className="relative p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <GripVertical className="w-3 h-3 text-hd-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/10 truncate">
                          {q.prefix || q.id?.slice(0, 8)}
                        </span>
                        {q.difficulty && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${DIFFICULTY_STYLES[q.difficulty] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            {q.difficulty === 'Medium' ? 'Med' : q.difficulty === 'Easy' ? 'Ez' : q.difficulty === 'Hard' ? 'Hd' : q.difficulty?.slice(0, 3)}
                          </span>
                        )}
                      </div>

                      <button onClick={() => setSelectedQ(q)} className="text-left w-full">
                        <h4 className="text-[12px] font-bold text-hd-text leading-snug mb-1 line-clamp-2 hover:text-indigo-400 transition-colors">
                          {q.title || 'Untitled'}
                        </h4>
                      </button>

                      <div className="flex items-center gap-1.5 text-[10px] text-hd-muted mt-1.5 flex-wrap">
                        {q.domain && <span className="bg-hd-surface/[0.04] px-1.5 py-0.5 rounded truncate max-w-[100px]">{q.domain}</span>}
                        {q.qualityScore && (
                          <span className="flex items-center gap-0.5 text-hd-text font-bold" title="Quality Score">
                            <Star className="w-3 h-3 text-amber-400" />
                            {Number(q.qualityScore).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <p className="text-[9px] text-hd-muted mt-2 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {q.creatorName || '—'} · <Clock className="w-2.5 h-2.5" />{formatDate(q.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-8 h-8 rounded-full bg-hd-surface/[0.03] flex items-center justify-center mb-1.5">
                      <Icon className={`w-3.5 h-3.5 ${col.color.replace('bg-', 'text-').replace('-400', '-400/30')}`} />
                    </div>
                    <p className="text-[11px] text-hd-muted/40">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && <QuestionForm question={editingQ} onClose={() => { setShowForm(false); setEditingQ(null); }} onSaved={load} />}
      {selectedQ && <QuestionCard question={selectedQ} onClose={() => setSelectedQ(null)} />}
    </div>
  );
}
