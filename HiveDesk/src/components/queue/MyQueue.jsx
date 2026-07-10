import React, { useState, useEffect } from 'react';
import { Inbox, FileCode2, Clock, AlertTriangle, CheckCircle2, GripVertical, User } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

const COLUMNS = [
  { id: 'assigned', label: 'Assigned to Me', color: 'bg-indigo-400', dark: 'bg-indigo-500/15', border: 'border-indigo-500/20', icon: FileCode2, desc: 'Tasks assigned to you' },
  { id: 'needs-revision', label: 'Needs Revision', color: 'bg-red-400', dark: 'bg-red-500/15', border: 'border-red-500/20', icon: AlertTriangle, desc: 'Changes requested' },
  { id: 'in-review', label: 'In Review', color: 'bg-amber-400', dark: 'bg-amber-500/15', border: 'border-amber-500/20', icon: Clock, desc: 'Awaiting approval' },
  { id: 'my-reviews', label: 'My Reviews', color: 'bg-emerald-400', dark: 'bg-emerald-500/15', border: 'border-emerald-500/20', icon: CheckCircle2, desc: 'Reviews you owe' },
  { id: 'created', label: 'All Created', color: 'bg-purple-400', dark: 'bg-purple-500/15', border: 'border-purple-500/20', icon: FileCode2, desc: 'Everything you made' },
];

const STATUS_COLORS = {
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'in-review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'needs-revision': 'bg-red-500/10 text-red-400 border-red-500/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_COLORS = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-hd-muted bg-slate-500/10 border-slate-500/20',
};

export default function MyQueue() {
  const refreshSignal = useRefreshSignal();
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState({ assigned: [], created: [], inReview: [], needsRevision: [] });
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragged, setDragged] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }

      const allQ = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
      const allR = Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : [];
      const allN = Array.isArray(raw.HiveDeskNotifications) ? raw.HiveDeskNotifications : [];

      const myAssigned = allQ.filter(q =>
        q.assigneeId === currentUser?.id && q.status !== 'published' && q.status !== 'rejected'
      );
      const myCreated = allQ.filter(q => q.creatorId === currentUser?.id);
      const myReviews = allR.filter(r =>
        r.reviewerId === currentUser?.id && r.status !== 'completed'
      );
      const myNotifs = allN.filter(n => n.userId === currentUser?.id && (n.isRead === false || n.isRead === 'false'));
      const myInReview = allQ.filter(q => q.creatorId === currentUser?.id && q.status === 'in-review');
      const myNeedsRevision = allQ.filter(q => (q.assigneeId === currentUser?.id || q.creatorId === currentUser?.id) && q.status === 'needs-revision');

      setQuestions({
        assigned: myAssigned.sort((a, b) => {
          const priority = { high: 0, medium: 1, low: 2 };
          return (priority[a.priority] || 1) - (priority[b.priority] || 1);
        }),
        created: myCreated,
        inReview: myInReview,
        needsRevision: myNeedsRevision,
      });
      setReviews(myReviews);
      setNotifications(myNotifs);
    } catch (e) { console.error('[HiveDesk] Queue load failed:', e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const getGrouped = () => {
    const g = {};
    COLUMNS.forEach(c => { g[c.id] = []; });
    (questions.assigned || []).forEach(q => g.assigned.push({ ...q, _column: 'assigned', _type: 'question' }));
    (questions.needsRevision || []).forEach(q => g['needs-revision'].push({ ...q, _column: 'needs-revision', _type: 'question' }));
    (questions.inReview || []).forEach(q => g['in-review'].push({ ...q, _column: 'in-review', _type: 'question' }));
    reviews.forEach(r => g['my-reviews'].push({ ...r, _column: 'my-reviews', _type: 'review', title: r.questionTitle || 'Review', prefix: r.id?.slice(0, 8) }));
    (questions.created || []).forEach(q => {
      if (!Object.values(g).flat().find(item => item.id === q.id)) {
        g.created.push({ ...q, _column: 'created', _type: 'question' });
      }
    });
    return g;
  };

  const handleDragStart = (e, id) => {
    setDragged(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDragged(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    if (!dragged) return;
    const allItems = Object.values(getGrouped()).flat();
    const item = allItems.find(q => q.id === dragged);
    if (item && item._column !== targetColumn && item._type === 'question') {
      let newStatus = targetColumn;
      if (targetColumn === 'assigned') newStatus = 'draft';
      if (targetColumn === 'my-reviews') newStatus = 'in-review';
      if (targetColumn === 'created') newStatus = 'draft';
      await HiveDeskStorage.update('HiveDeskQuestions', dragged, { status: newStatus });
      load();
    }
    setDragged(null);
  };

  const grouped = getGrouped();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center animate-pulse">
          <Inbox className="w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-sm text-hd-muted">Loading your queue...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hd-text flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-indigo-400" />
            </div>
            My Queue
          </h2>
          <p className="text-xs text-hd-muted mt-0.5 ml-10">Drag questions between columns to update status</p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <span className="text-[10px] bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {notifications.length} unread
            </span>
          )}
          {COLUMNS.slice(0, 4).map(col => (
            <div key={col.id} className="flex items-center gap-1.5 bg-hd-surface/[0.04] px-2.5 py-1.5 rounded-lg">
              <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
              <span className="text-[11px] text-hd-muted">{grouped[col.id]?.length || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<FileCode2 className="w-4 h-4" />} label="Assigned" value={questions.assigned?.length || 0} color="indigo" />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} label="Needs Fix" value={questions.needsRevision?.length || 0} color="red" />
        <SummaryCard icon={<Clock className="w-4 h-4" />} label="In Review" value={questions.inReview?.length || 0} color="amber" />
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4" />} label="To Review" value={reviews.length || 0} color="emerald" />
      </div>

      <div className="flex md:grid md:grid-cols-5 gap-4 min-h-[500px] overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 snap-x snap-mandatory">
        {COLUMNS.map(col => {
          const ColIcon = col.icon;
          const items = grouped[col.id] || [];
          return (
            <div key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`min-w-[260px] md:min-w-0 snap-start rounded-xl border border-hd-border bg-hd-surface/[0.02] flex flex-col transition-all duration-200`}>
              <div className={`sticky top-0 z-10 ${col.dark} rounded-t-xl border-b ${col.border} px-3 py-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${col.color}/20 flex items-center justify-center`}>
                      <ColIcon className={`w-3.5 h-3.5 ${col.color.replace('bg-', 'text-').replace('-400', '-400')}`} />
                    </div>
                    <span className="text-xs font-bold text-hd-text truncate">{col.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${col.dark} ${col.color.replace('bg-', 'text-').replace('-400', '-400')}`}>
                    {items.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)]">
                {items.map((q, i) => (
                  <div key={q.id || i}
                    draggable={q._type === 'question'}
                    onDragStart={(e) => handleDragStart(e, q.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-xl border transition-all duration-200 ${
                      q._type === 'question' ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      dragged === q.id
                        ? 'opacity-40 scale-[0.97] ring-2 ring-indigo-500/40 border-indigo-500/30'
                        : 'border-hd-border bg-hd-surface hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5'
                    }`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-hd-border to-transparent pointer-events-none" />

                    <div className="relative p-3">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        {q._type === 'question' && (
                          <GripVertical className="w-3 h-3 text-hd-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <span className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/10">
                          {q.prefix || q.id?.slice(0, 8)}
                        </span>
                        {q.status && (
                          <span className={`badge text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[q.status] || STATUS_COLORS.draft}`}>{q.status}</span>
                        )}
                        {q.priority && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[q.priority] || 'text-hd-muted'}`}>
                            {q.priority}
                          </span>
                        )}
                      </div>

                      <h4 className="text-[12px] font-bold text-hd-text leading-snug mb-1 line-clamp-2">{q.title || 'Untitled'}</h4>

                      <div className="flex items-center gap-2 text-[10px] text-hd-muted mt-1.5 flex-wrap">
                        {q.domain && <span className="bg-hd-surface/[0.04] px-1.5 py-0.5 rounded">{q.domain}</span>}
                        {q.difficulty && <span>{q.difficulty}</span>}
                        {q.creatorName && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {q.creatorName}</span>}
                        {q.dueDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(q.dueDate)}</span>}
                      </div>

                      {q.status === 'needs-revision' && q.notes && (
                        <div className="mt-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                          <p className="text-[10px] text-red-400 font-semibold mb-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Revision Notes:
                          </p>
                          <p className="text-[10px] text-hd-secondary line-clamp-2">{q.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-8 h-8 rounded-full bg-hd-surface/[0.03] flex items-center justify-center mb-1.5">
                      <ColIcon className={`w-3.5 h-3.5 ${col.color.replace('bg-', 'text-').replace('-400', '-400/30')}`} />
                    </div>
                    <p className="text-[11px] text-hd-muted/40">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  const colors = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
  };
  const dotColors = {
    indigo: 'bg-indigo-400',
    red: 'bg-red-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  };
  return (
    <div className={`card p-3.5 border bg-gradient-to-br ${colors[color]} hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-5 h-5 rounded-lg ${dotColors[color]}/20 flex items-center justify-center`}>
          {icon && React.cloneElement(icon, { className: `${dotColors[color].replace('bg-', 'text-')}` })}
        </div>
        <span className="text-[11px] text-hd-muted uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-2xl font-black text-hd-text mt-1">{value}</p>
    </div>
  );
}
