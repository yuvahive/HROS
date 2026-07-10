import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileCode2, TrendingUp, ClipboardCheck, Clock, ArrowRight, Plus, Eye, Sparkles, AlertTriangle, Timer, Target } from 'lucide-react';
import MetricCard from './MetricCard';
import SprintStats from './SprintStats';
import TeamPulse from './TeamPulse';
import ActivityFeed from './ActivityFeed';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useConfig } from '../../config/ConfigContext';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'in-review': { label: 'In Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'needs-revision': { label: 'Needs Revision', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  approved: { label: 'Approved', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  published: { label: 'Published', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function getStatusBadge(status) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return <span className={`badge border ${s.color}`}>{s.label}</span>;
}

export default function WarRoomDashboard({ onNavigate }) {
  const [metrics, setMetrics] = useState({});
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [logs, setLogs] = useState([]);
  const { getVal } = useConfig();
  const { isAdmin, isLead } = useRBAC();
  const refreshSignal = useRefreshSignal();

  const load = async () => {
    try {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { return; }

      const allUsers = Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : [];
      const allQuestions = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
      const allReviews = Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : [];
      const allSprints = Array.isArray(raw.HiveDeskSprints) ? raw.HiveDeskSprints : [];
      const allLogs = Array.isArray(raw.HiveDeskLogs) ? raw.HiveDeskLogs : [];

      const activeUsers = allUsers.filter(u => u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE' || u.isActive === 'True');
      const published = allQuestions.filter(q => q.status === 'published');
      const inReview = allQuestions.filter(q => q.status === 'in-review');
      const draft = allQuestions.filter(q => q.status === 'draft' || !q.status);
      const needsRevision = allQuestions.filter(q => q.status === 'needs-revision');
      const pendingReviews = allReviews.filter(r => r.status === 'pending' || !r.status);
      const activeSprint = allSprints.find(s => s.status === 'active') || null;

      const qualityScores = published.filter(q => q.qualityScore && !isNaN(parseFloat(q.qualityScore)));
      const avgQuality = qualityScores.length > 0
        ? (qualityScores.reduce((sum, q) => sum + parseFloat(q.qualityScore), 0) / qualityScores.length).toFixed(1)
        : '—';

      setMetrics({
        activeTeamMembers: activeUsers.length,
        totalQuestions: allQuestions.length,
        publishedQuestions: published.length,
        draftQuestions: draft.length,
        inReviewQuestions: inReview.length,
        needsRevisionQuestions: needsRevision.length,
        pendingReviews: pendingReviews.length,
        avgQuality,
        activeSprint,
      });
      setUsers(allUsers);
      setQuestions(allQuestions);
      setReviews(allReviews);
      setSprints(allSprints);
      setLogs(allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (e) { console.error('[HiveDesk] Dashboard load failed:', e); }
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const teamTarget = getVal('target_team_questions_per_week', 40);
  const weeklyPublished = publishedCountThisWeek(questions);
  const weeklyProgress = teamTarget > 0 ? Math.round((weeklyPublished / teamTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard title="Team Members" value={metrics.activeTeamMembers || 0} icon={<Users className="w-5 h-5" />} color="blue" />
        <MetricCard title="Total Questions" value={metrics.totalQuestions || 0} icon={<FileCode2 className="w-5 h-5" />} color="purple" />
        <MetricCard title="Published" value={metrics.publishedQuestions || 0} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
        <MetricCard title="Avg Quality" value={metrics.avgQuality || '—'} suffix="/5" icon={<ClipboardCheck className="w-5 h-5" />} color="amber" />
      </div>

      {/* Weekly Target */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-hd-text">Weekly Target</span>
          </div>
          <span className="text-xs text-hd-muted">{weeklyPublished} / {teamTarget} published this week</span>
        </div>
        <div className="w-full bg-hd-surface/[0.05] h-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${Math.min(weeklyProgress, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-hd-muted mt-1">
          <span>{weeklyProgress}% complete</span>
          <span>{Math.max(0, teamTarget - weeklyPublished)} remaining</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <QuickAction icon={<Plus className="w-4 h-4" />} label="New Question" onClick={() => onNavigate?.('questions')} color="indigo" />
        <QuickAction icon={<Eye className="w-4 h-4" />} label="Review Queue" badge={metrics.pendingReviews || 0} onClick={() => onNavigate?.('reviews')} color="amber" />
        <QuickAction icon={<Target className="w-4 h-4" />} label="Sprints" onClick={() => onNavigate?.('sprints')} color="emerald" />
        <QuickAction icon={<Users className="w-4 h-4" />} label="Team" onClick={() => onNavigate?.('team')} color="blue" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <SprintStats sprint={metrics.activeSprint} />

          {/* Question Pipeline */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-hd-text">Question Pipeline</h3>
              </div>
              <button onClick={() => onNavigate?.('questions')} className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Draft', value: metrics.draftQuestions || 0, color: 'text-hd-muted' },
                { label: 'In Review', value: metrics.inReviewQuestions || 0, color: 'text-amber-400' },
                { label: 'Revision', value: metrics.needsRevisionQuestions || 0, color: 'text-red-400' },
                { label: 'Published', value: metrics.publishedQuestions || 0, color: 'text-emerald-400' },
                { label: 'Pending', value: metrics.pendingReviews || 0, color: 'text-purple-400' },
              ].map(item => (
                <div key={item.label} className="bg-hd-surface/[0.03] rounded-lg p-3 text-center border border-hd-border hover:border-hd-border transition-colors">
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-hd-muted uppercase tracking-wider mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention (Admin/Lead) */}
          {(isAdmin || isLead) && metrics.needsRevisionQuestions > 0 && (
            <div className="card p-5 border-amber-500/20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-hd-text">Needs Attention</h3>
              </div>
              <div className="space-y-1.5">
                {questions.filter(q => q.status === 'needs-revision').slice(0, 4).map((q, i) => (
                  <div key={q.id || i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-[13px] text-hd-text truncate flex-1">{q.title || q.Deliverable || 'Untitled'}</span>
                    {getStatusBadge(q.status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Questions */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-hd-text">Recent Questions</h3>
              </div>
              <span className="text-[11px] text-hd-muted">{questions.length} total</span>
            </div>
            <div className="space-y-1.5">
              {[...questions].reverse().slice(0, 6).map((q, i) => (
                <div key={q.id || q.MissionCode || i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-hd-hover transition-colors">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                    {q.prefix || q.id?.slice(0, 8) || `Q${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-hd-text truncate">{q.title || q.Deliverable || q.Name || 'Untitled'}</p>
                    <p className="text-[11px] text-hd-muted">{q.domain || q.Domain || '—'} {q.Creator ? `· ${q.Creator}` : ''}</p>
                  </div>
                  {getStatusBadge(q.status || 'draft')}
                </div>
              ))}
              {questions.length === 0 && (
                <div className="py-8 text-center">
                  <FileCode2 className="w-8 h-8 mx-auto text-hd-muted/40 mb-2" />
                  <p className="text-sm text-hd-muted">No questions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <TeamPulse members={users} questions={questions} />

          {/* Activity Feed (Admin/Lead) */}
          {(isAdmin || isLead) && <ActivityFeed logs={logs} maxItems={12} />}

          {/* Quick Stats */}
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-hd-text">Quick Stats</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Active Questions', value: (metrics.inReviewQuestions || 0) + (metrics.draftQuestions || 0), color: 'text-blue-400' },
                { label: 'Needs Revision', value: metrics.needsRevisionQuestions || 0, color: 'text-red-400' },
                { label: 'Pending Reviews', value: metrics.pendingReviews || 0, color: 'text-amber-400' },
                { label: 'Total Reviews', value: reviews.length, color: 'text-purple-400' },
                { label: 'Active Sprints', value: sprints.filter(s => s.status === 'active').length, color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-hd-muted">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Progress (Admin/Lead) */}
          {(isAdmin || isLead) && (
            <div className="card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-hd-text">Sprint Overview</h3>
              </div>
              <div className="space-y-2">
                {sprints.slice(0, 3).map((s, i) => (
                  <div key={s.id || i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-hd-surface/[0.03] border border-hd-border">
                    <div>
                      <p className="text-[13px] font-medium text-hd-text">{s.name || `Sprint ${i + 1}`}</p>
                      <p className="text-[11px] text-hd-muted">{s.startDate} → {s.endDate}</p>
                    </div>
                    <span className={`badge text-[10px] ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                      {s.status || 'planned'}
                    </span>
                  </div>
                ))}
                {sprints.length === 0 && <p className="text-xs text-hd-muted text-center py-2">No sprints yet</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, badge, onClick, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
  };

  return (
    <button onClick={onClick} className={`card card-hover p-3 flex items-center gap-3 border transition-all ${colors[color]}`}>
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-hd-text">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

function publishedCountThisWeek(questions) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return questions.filter(q => {
    if (q.status !== 'published') return false;
    if (q.publishedAt) return new Date(q.publishedAt) >= weekAgo;
    if (q.updatedAt) return new Date(q.updatedAt) >= weekAgo;
    return false;
  }).length;
}
