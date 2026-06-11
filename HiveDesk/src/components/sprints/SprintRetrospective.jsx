import React, { useState, useEffect } from 'react';
import { History, TrendingUp, Users, Target, Star, BarChart3, Lock } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { formatDate } from '../../utils/helpers';

export default function SprintRetrospective() {
  const { isLead } = useRBAC();
  const [sprints, setSprints] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (raw) {
        setSprints(Array.isArray(raw.HiveDeskSprints) ? raw.HiveDeskSprints : []);
        setQuestions(Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : []);
        setReviews(Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : []);
      }
      setLoading(false);
    })();
  }, []);

  const doneSprints = sprints.filter(s => s.status === 'done').sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const getSprintStats = (sprint) => {
    const sQuestions = questions.filter(q => {
      const created = new Date(q.createdAt);
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      return created >= start && created <= end;
    });
    const published = sQuestions.filter(q => q.status === 'published');
    const avgQuality = sQuestions.filter(q => q.qualityScore > 0).length > 0
      ? sQuestions.filter(q => q.qualityScore > 0).reduce((a, b) => a + Number(b.qualityScore), 0) / sQuestions.filter(q => q.qualityScore > 0).length
      : 0;
    const sReviews = reviews.filter(r => {
      const reviewed = new Date(r.reviewedAt);
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      return reviewed >= start && reviewed <= end;
    });

    const memberStats = {};
    sQuestions.forEach(q => {
      if (!memberStats[q.creatorId]) memberStats[q.creatorId] = { name: q.creatorName, created: 0, published: 0, avgQuality: 0, qualities: [] };
      memberStats[q.creatorId].created++;
      if (q.status === 'published') memberStats[q.creatorId].published++;
      if (q.qualityScore > 0) memberStats[q.creatorId].qualities.push(Number(q.qualityScore));
    });
    Object.values(memberStats).forEach(m => {
      m.avgQuality = m.qualities.length > 0 ? m.qualities.reduce((a, b) => a + b, 0) / m.qualities.length : 0;
      delete m.qualities;
    });

    return {
      totalQuestions: sQuestions.length,
      publishedCount: published.length,
      avgQuality: Math.round(avgQuality * 10) / 10,
      reviewsDone: sReviews.length,
      memberStats: Object.values(memberStats).sort((a, b) => b.published - a.published),
      completionRate: sprint.targetQuestions > 0 ? Math.round((sQuestions.length / sprint.targetQuestions) * 100) : 0,
    };
  };

  if (!isLead) {
    return (
      <div className="card p-12 text-center">
        <Lock className="w-10 h-10 mx-auto text-hd-muted/30 mb-3" />
        <h3 className="text-sm font-semibold text-hd-text mb-1">Access Restricted</h3>
        <p className="text-xs text-hd-muted">Sprint retrospectives are available to team leads and admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" /> Sprint Retrospective
        </h2>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {doneSprints.map(s => (
          <button key={s.id} onClick={() => setSelectedSprint(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedSprint?.id === s.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-hd-muted hover:bg-hd-hover'}`}>
            {s.name || `Sprint #${s.weekNumber}`}
          </button>
        ))}
        {doneSprints.length === 0 && !loading && <p className="text-xs text-hd-muted">No completed sprints yet</p>}
      </div>

      {selectedSprint && (() => {
        const stats = getSprintStats(selectedSprint);
        return (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-hd-text">{selectedSprint.name || `Sprint #${selectedSprint.weekNumber}`}</h3>
                <span className="text-[11px] text-hd-muted">{formatDate(selectedSprint.startDate)} — {formatDate(selectedSprint.endDate)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { label: 'Questions', value: stats.totalQuestions, sub: `of ${selectedSprint.targetQuestions || 0}` },
                  { label: 'Published', value: stats.publishedCount, color: 'text-emerald-400' },
                  { label: 'Quality', value: stats.avgQuality ? `${stats.avgQuality}` : '—', color: 'text-amber-400', sub: '/5' },
                  { label: 'Completion', value: `${stats.completionRate}%`, color: 'text-blue-400' },
                  { label: 'Reviews', value: stats.reviewsDone, color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="bg-hd-surface/[0.03] rounded-lg p-3 text-center border border-hd-border">
                    <p className={`text-lg font-bold ${s.color || 'text-hd-text'}`}>{s.value}{s.sub || ''}</p>
                    <p className="text-[10px] text-hd-muted uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-hd-text mb-3">Individual Performance</h3>
              <div className="space-y-1.5">
                {stats.memberStats.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-hd-hover transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-[11px] font-bold text-hd-secondary ring-1 ring-hd-border flex-shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-hd-text">{m.name}</p>
                    </div>
                    <div className="flex items-center gap-4 text-[13px]">
                      <div className="text-center w-12"><p className="font-bold text-hd-text">{m.created}</p><p className="text-[9px] text-hd-muted">Created</p></div>
                      <div className="text-center w-12"><p className="font-bold text-emerald-400">{m.published}</p><p className="text-[9px] text-hd-muted">Published</p></div>
                      <div className="text-center w-12"><p className="font-bold text-amber-400">{m.avgQuality ? m.avgQuality.toFixed(1) : '—'}</p><p className="text-[9px] text-hd-muted">Quality</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {!selectedSprint && doneSprints.length > 0 && (
        <div className="card p-12 text-center">
          <BarChart3 className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
          <p className="text-sm text-hd-muted">Select a completed sprint to view its retrospective</p>
        </div>
      )}
    </div>
  );
}
