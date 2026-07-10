import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { getInitials } from '../../utils/helpers';

const AVATAR_COLORS = [
  'from-blue-600 to-blue-700', 'from-purple-600 to-purple-700',
  'from-emerald-600 to-emerald-700', 'from-amber-600 to-amber-700',
  'from-rose-600 to-rose-700', 'from-cyan-600 to-cyan-700',
  'from-indigo-600 to-indigo-700', 'from-teal-600 to-teal-700',
];

export default function TeamAnalytics() {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tab, setTab] = useState('leaderboard');

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { return; }
      setUsers(Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : []);
      setQuestions(Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : []);
      setReviews(Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : []);
      setSprints(Array.isArray(raw.HiveDeskSprints) ? raw.HiveDeskSprints : []);
    })();
  }, []);

  const activeUsers = users.filter(u => u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE');

  // Build per-member stats
  const memberStats = activeUsers.filter(u => u.role !== 'admin').map(m => {
    const created = questions.filter(q => q.creatorId === m.id);
    const reviewed = reviews.filter(r => r.reviewerId === m.id);
    const published = created.filter(q => q.status === 'published');
    const inReview = created.filter(q => q.status === 'in-review');
    const draft = created.filter(q => q.status === 'draft' || !q.status);
    const avgQuality = published.length > 0
      ? (published.reduce((s, q) => s + (Number(q.qualityScore) || 0), 0) / published.length).toFixed(1)
      : '—';
    return {
      ...m,
      createdCount: created.length,
      publishedCount: published.length,
      inReviewCount: inReview.length,
      draftCount: draft.length,
      reviewedCount: reviewed.length,
      avgQuality,
      completionRate: created.length > 0 ? Math.round((published.length / created.length) * 100) : 0,
    };
  }).sort((a, b) => b.publishedCount - a.publishedCount);

  // Domain distribution
  const domainStats = {};
  questions.forEach(q => {
    const d = q.domain || 'Unknown';
    if (!domainStats[d]) domainStats[d] = { total: 0, published: 0, inReview: 0, draft: 0 };
    domainStats[d].total++;
    if (q.status === 'published') domainStats[d].published++;
    else if (q.status === 'in-review') domainStats[d].inReview++;
    else domainStats[d].draft++;
  });

  // Difficulty distribution
  const diffStats = { Easy: 0, Medium: 0, Hard: 0 };
  questions.forEach(q => { if (diffStats[q.difficulty] !== undefined) diffStats[q.difficulty]++; });

  // Sprint velocity
  const sprintVelocity = sprints.filter(s => s.status === 'done' || s.status === 'active').map(s => ({
    name: s.name || `Sprint ${s.weekNumber || '?'}`,
    target: Number(s.targetQuestions) || 0,
    actual: Number(s.actualQuestions) || 0,
    published: Number(s.publishedCount) || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Team Analytics
        </h2>
        <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{questions.length} questions tracked</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {[{ id: 'leaderboard', label: 'Leaderboard', icon: Award }, { id: 'domains', label: 'Domains', icon: Target }, { id: 'velocity', label: 'Velocity', icon: TrendingUp }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-hd-muted hover:bg-hd-hover'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="space-y-2">
          {memberStats.map((m, i) => (
            <div key={m.id || i} className="card card-hover p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-hd-text ring-1 ring-hd-border`}>
                    {getInitials(m.name)}
                  </div>
                  {i < 3 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-300 text-black' : 'bg-amber-600 text-hd-text'}`}>
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-hd-text truncate">{m.name}</p>
                    <span className="badge text-[9px] bg-slate-500/10 text-slate-400 border border-slate-500/20 capitalize">{m.role}</span>
                  </div>
                  <p className="text-[11px] text-hd-muted">{m.domain || 'General'}</p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-hd-text">{m.publishedCount}</p>
                    <p className="text-[9px] text-hd-muted uppercase">Published</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-hd-text">{m.createdCount}</p>
                    <p className="text-[9px] text-hd-muted uppercase">Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-hd-text">{m.reviewedCount}</p>
                    <p className="text-[9px] text-hd-muted uppercase">Reviewed</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-bold ${m.avgQuality !== '—' && Number(m.avgQuality) >= 4 ? 'text-emerald-400' : 'text-hd-text'}`}>{m.avgQuality}</p>
                    <p className="text-[9px] text-hd-muted uppercase">Quality</p>
                  </div>
                  <div className="w-20">
                    <div className="w-full bg-hd-surface/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${m.completionRate}%` }} />
                    </div>
                    <p className="text-[9px] text-hd-muted text-center mt-0.5">{m.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {memberStats.length === 0 && (
            <div className="card p-12 text-center">
              <Award className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
              <p className="text-sm text-hd-muted">No team data yet</p>
            </div>
          )}
        </div>
      )}

      {/* Domain Distribution */}
      {tab === 'domains' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(domainStats).sort((a, b) => b[1].total - a[1].total).map(([domain, stats]) => (
            <div key={domain} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[13px] font-semibold text-hd-text capitalize">{domain}</h4>
                <span className="text-xs text-hd-muted">{stats.total} total</span>
              </div>
              <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-hd-surface/[0.05]">
                {stats.published > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(stats.published / stats.total) * 100}%` }} />}
                {stats.inReview > 0 && <div className="h-full bg-amber-500" style={{ width: `${(stats.inReview / stats.total) * 100}%` }} />}
                {stats.draft > 0 && <div className="h-full bg-slate-500" style={{ width: `${(stats.draft / stats.total) * 100}%` }} />}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats.published} published</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {stats.inReview} in review</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> {stats.draft} draft</span>
              </div>
            </div>
          ))}
          {Object.keys(domainStats).length === 0 && (
            <div className="col-span-full card p-12 text-center">
              <Target className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
              <p className="text-sm text-hd-muted">No domain data yet</p>
            </div>
          )}

          {/* Difficulty Distribution */}
          <div className="card p-4">
            <h4 className="text-[13px] font-semibold text-hd-text mb-3">Difficulty Distribution</h4>
            <div className="space-y-2">
              {Object.entries(diffStats).map(([diff, count]) => {
                const pct = questions.length > 0 ? Math.round((count / questions.length) * 100) : 0;
                const colors = { Easy: 'bg-emerald-500', Medium: 'bg-amber-500', Hard: 'bg-red-500' };
                return (
                  <div key={diff}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-hd-secondary">{diff}</span>
                      <span className="text-hd-muted">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-hd-surface/[0.05] h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[diff]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sprint Velocity */}
      {tab === 'velocity' && (
        <div className="space-y-3">
          {sprintVelocity.length > 0 && (
            <div className="card p-5">
              <h4 className="text-[13px] font-semibold text-hd-text mb-4">Sprint Velocity</h4>
              <div className="space-y-3">
                {sprintVelocity.map((s, i) => {
                  const targetPct = s.target > 0 ? Math.round((s.actual / s.target) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-hd-secondary">{s.name}</span>
                        <span className="text-hd-muted">{s.actual}/{s.target} ({targetPct}%)</span>
                      </div>
                      <div className="w-full bg-hd-surface/[0.05] h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(100, targetPct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {sprintVelocity.length === 0 && (
            <div className="card p-12 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
              <p className="text-sm text-hd-muted">No sprint data yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
