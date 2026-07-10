import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, ClipboardCheck, Target, Calendar } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { getInitials } from '../../utils/helpers';

export default function IndividualDashboard({ member, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    if (!member) return;
    (async () => {
      const [q, r, c] = await Promise.all([
        HiveDeskStorage.filter('HiveDeskQuestions', { creatorId: member.id }),
        HiveDeskStorage.filter('HiveDeskReviews', { reviewerId: member.id }),
        HiveDeskStorage.filter('HiveDeskCheckIns', { personId: member.id }),
      ]);
      setQuestions(q.data || []);
      setReviews(r.data || []);
      setCheckIns(c.data || []);
    })();
  }, [member]);

  if (!member) return null;

  const published = questions.filter(q => q.status === 'published').length;
  const avgQuality = questions.filter(q => q.qualityScore > 0).length > 0
    ? questions.filter(q => q.qualityScore > 0).reduce((a, b) => a + Number(b.qualityScore), 0) / questions.filter(q => q.qualityScore > 0).length
    : 0;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-hd-muted hover:text-hd-text text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Team
      </button>

      <div className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold ring-2 ring-hd-border">
            {getInitials(member.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <p className="text-hd-muted text-sm">{member.email} · <span className="capitalize">{member.role}</span> · {member.domain || 'No domain'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <Target className="w-5 h-5" />, label: 'Created', value: questions.length, color: 'blue' },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Published', value: published, color: 'emerald' },
          { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Reviews Done', value: reviews.length, color: 'purple' },
          { icon: <Calendar className="w-5 h-5" />, label: 'Avg Quality', value: avgQuality ? avgQuality.toFixed(1) + '/5' : '—', color: 'amber' },
        ].map(s => (
          <div key={s.label} className="glass-card p-5 text-center">
            <div className="flex justify-center mb-2 text-hd-muted">{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[11px] text-hd-muted uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Questions</h3>
          <div className="space-y-2">
            {questions.slice(-5).reverse().map((q, i) => (
              <div key={q.id || i} className="flex items-center justify-between p-3 rounded-xl bg-hd-surface/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-accent">{q.prefix || q.id?.slice(0, 8)}</span>
                  <span className="text-sm">{q.title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  q.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                  q.status === 'in-review' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-gray-500/10 text-hd-muted'
                }`}>{q.status}</span>
              </div>
            ))}
            {questions.length === 0 && <p className="text-hd-muted text-sm">No questions yet</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
          <div className="space-y-3">
            {checkIns.slice(-4).reverse().map((c, i) => (
              <div key={c.id || i} className="p-3 rounded-xl bg-hd-surface/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-hd-muted">Week {c.weekNumber || '—'}</span>
                  <span className="text-lg">{c.mood === 'good' ? '😊' : c.mood === 'neutral' ? '😐' : c.mood === 'bad' ? '😞' : '—'}</span>
                </div>
                {c.blockers && <p className="text-xs text-red-400">Blocker: {c.blockers}</p>}
                {c.notes && <p className="text-xs text-hd-muted mt-1">{c.notes}</p>}
              </div>
            ))}
            {checkIns.length === 0 && <p className="text-hd-muted text-sm">No check-ins yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
