import React, { useState, useEffect } from 'react';
import { Users, Target, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { getInitials } from '../../utils/helpers';

const AVATAR_COLORS = [
  'from-blue-600 to-blue-700', 'from-purple-600 to-purple-700',
  'from-emerald-600 to-emerald-700', 'from-amber-600 to-amber-700',
  'from-rose-600 to-rose-700', 'from-cyan-600 to-cyan-700',
  'from-indigo-600 to-indigo-700', 'from-teal-600 to-teal-700',
];

export default function WorkloadView() {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }
      setUsers(Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : []);
      setQuestions(Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : []);
      setSprints(Array.isArray(raw.HiveDeskSprints) ? raw.HiveDeskSprints : []);
      setAssignments(Array.isArray(raw.HiveDeskSprintAssignments) ? raw.HiveDeskSprintAssignments : []);
      setLoading(false);
    })();
  }, []);

  const activeSprint = sprints.find(s => s.status === 'active');
  const activeUsers = users.filter(u => u.role !== 'admin' && (u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE'));

  const workload = activeUsers.map((u, i) => {
    const myQuestions = questions.filter(q => q.creatorId === u.id);
    const assigned = questions.filter(q => q.assigneeId === u.id && q.status !== 'published' && q.status !== 'rejected');
    const inReview = myQuestions.filter(q => q.status === 'in-review');
    const draft = myQuestions.filter(q => q.status === 'draft' || !q.status);
    const needsRevision = myQuestions.filter(q => q.status === 'needs-revision');
    const published = myQuestions.filter(q => q.status === 'published');
    const target = Number(u.weeklyTargetQuestions) || 5;
    const progress = target > 0 ? Math.round((published.length / target) * 100) : 0;
    const overload = assigned.length > target * 1.5;

    const sprintAssignment = assignments.find(a => a.sprintId === activeSprint?.id && a.personId === u.id);

    return {
      ...u, index: i,
      totalCreated: myQuestions.length,
      assignedCount: assigned.length,
      inReviewCount: inReview.length,
      draftCount: draft.length,
      needsRevisionCount: needsRevision.length,
      publishedCount: published.length,
      target,
      progress: Math.min(progress, 100),
      overload,
      sprintTarget: sprintAssignment ? Number(sprintAssignment.targetCount) : target,
      sprintActual: sprintAssignment ? Number(sprintAssignment.actualCount) : published.length,
    };
  }).sort((a, b) => b.assignedCount - a.assignedCount);

  const teamTarget = activeUsers.reduce((s, u) => s + (Number(u.weeklyTargetQuestions) || 5), 0);
  const teamPublished = workload.reduce((s, u) => s + u.publishedCount, 0);
  const teamProgress = teamTarget > 0 ? Math.round((teamPublished / teamTarget) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" /> Workload View
        </h2>
        {activeSprint && <span className="badge text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{activeSprint.name}</span>}
      </div>

      {/* Team Summary */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-hd-secondary">Team Progress</span>
          <span className="text-sm font-bold text-hd-text">{teamPublished}/{teamTarget} <span className="text-hd-muted font-normal">({teamProgress}%)</span></span>
        </div>
        <div className="w-full bg-hd-surface/[0.05] h-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(100, teamProgress)}%` }} />
        </div>
      </div>

      {/* Per-Member Workload */}
      <div className="space-y-2">
        {workload.map((m) => (
          <div key={m.id} className={`card card-hover p-4 ${m.overload ? 'border-red-500/30' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[m.index % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-hd-text ring-1 ring-hd-border`}>
                  {getInitials(m.name)}
                </div>
                {m.overload && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-2.5 h-2.5 text-hd-text" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[13px] font-semibold text-hd-text truncate">{m.name}</p>
                  <span className="text-[10px] text-hd-muted">{m.domain || 'General'}</span>
                  {m.overload && <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-medium">Overloaded</span>}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-hd-surface/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${m.progress >= 100 ? 'bg-emerald-500' : m.progress >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-hd-muted w-8 text-right">{m.progress}%</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-sm font-bold text-indigo-400">{m.assignedCount}</p>
                  <p className="text-[9px] text-hd-muted uppercase">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">{m.publishedCount}</p>
                  <p className="text-[9px] text-hd-muted uppercase">Done</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-amber-400">{m.inReviewCount}</p>
                  <p className="text-[9px] text-hd-muted uppercase">Review</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-hd-text">{m.target}</p>
                  <p className="text-[9px] text-hd-muted uppercase">Target</p>
                </div>
              </div>
            </div>

            {/* Detail chips */}
            <div className="flex items-center gap-2 mt-2 ml-14">
              {m.draftCount > 0 && <span className="text-[9px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded">{m.draftCount} drafts</span>}
              {m.needsRevisionCount > 0 && <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">{m.needsRevisionCount} need revision</span>}
              {m.inReviewCount > 0 && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{m.inReviewCount} in review</span>}
            </div>
          </div>
        ))}
        {workload.length === 0 && (
          <div className="card p-12 text-center">
            <Users className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
            <p className="text-sm text-hd-muted">No team members to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
