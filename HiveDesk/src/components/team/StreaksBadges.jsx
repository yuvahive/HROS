import { useState, useEffect } from 'react';
import { Award, Flame, Zap, Star, Crown, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';

const BADGE_DEFS = [
  { id: 'first-published', label: 'First Published', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', desc: 'Published your first question' },
  { id: 'review-10', label: 'Review Machine', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', desc: 'Completed 10 reviews' },
  { id: 'streak-5', label: '5-Day Streak', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', desc: 'Contributed 5 days in a row' },
  { id: 'streak-10', label: '10-Day Streak', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', desc: 'Contributed 10 days in a row' },
  { id: 'helper', label: 'Helping Hand', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', desc: 'Reviewed 5 questions from others' },
  { id: 'publish-10', label: 'Publishing Pro', icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', desc: 'Published 10 questions' },
  { id: 'qa-star', label: 'Quality Star', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', desc: 'Avg quality score > 8.0' },
  { id: 'iron-man', label: 'Iron Contributor', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', desc: 'Published 25+ questions' },
];

export default function StreaksBadges() {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({ streak: 0, published: 0, reviews: 0, daysActive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }
      const questions = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
      const reviews = Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : [];
      const workLogs = Array.isArray(raw.HiveDeskWorkLogs) ? raw.HiveDeskWorkLogs : [];

      const myQ = questions.filter(q => q.creatorId === currentUser?.id);
      const myR = reviews.filter(r => r.reviewerId === currentUser?.id);
      const myLogs = workLogs.filter(w => w.personId === currentUser?.id || w.personName === currentUser?.name);
      const published = myQ.filter(q => q.status === 'published');
      const completedReviews = myR.filter(r => r.status === 'completed' || r.status === 'approved');

      const workDays = [...new Set(myLogs.map(l => l.date).filter(Boolean))].sort().reverse();
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const checkDate = (d) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };
      let cursor = today;
      for (const day of workDays) {
        if (checkDate(day) === cursor) { streak++; cursor = checkDate(new Date(new Date(cursor).getTime() - 86400000)); }
        else if (checkDate(day) < cursor) break;
      }

      const earned = [];
      if (published.length >= 1) earned.push('first-published');
      if (completedReviews.length >= 10) earned.push('review-10');
      if (streak >= 5) earned.push('streak-5');
      if (streak >= 10) earned.push('streak-10');
      const othersReviews = completedReviews.length;
      if (othersReviews >= 5) earned.push('helper');
      if (published.length >= 10) earned.push('publish-10');
      const avgQuality = published.filter(q => q.qualityScore).reduce((s, q) => s + Number(q.qualityScore), 0) / (published.filter(q => q.qualityScore).length || 1);
      if (avgQuality >= 8 && published.length > 0) earned.push('qa-star');
      if (published.length >= 25) earned.push('iron-man');

      setBadges(earned);
      setStats({ streak, published: published.length, reviews: completedReviews.length, daysActive: workDays.length });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="card p-12 text-center"><Award className="w-10 h-10 mx-auto text-hd-muted/30 mb-3 animate-pulse" /><p className="text-sm text-hd-muted">Calculating achievements...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Achievements
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <Flame className="w-6 h-6 mx-auto mb-1 text-orange-400" />
          <p className="text-xl font-black text-hd-text">{stats.streak}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Day Streak</p>
        </div>
        <div className="card p-4 text-center border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <TrendingUp className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
          <p className="text-xl font-black text-hd-text">{stats.published}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Published</p>
        </div>
        <div className="card p-4 text-center border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-blue-400" />
          <p className="text-xl font-black text-hd-text">{stats.reviews}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Reviews Done</p>
        </div>
        <div className="card p-4 text-center border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <Zap className="w-6 h-6 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-black text-hd-text">{stats.daysActive}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Active Days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BADGE_DEFS.map(b => {
          const earned = badges.includes(b.id);
          const Icon = b.icon;
          return (
            <div key={b.id} className={`card p-4 border ${earned ? b.bg : 'border-hd-border opacity-40'} transition-all`}>
              <Icon className={`w-6 h-6 mb-2 ${earned ? b.color : 'text-hd-muted'}`} />
              <p className={`text-sm font-semibold ${earned ? 'text-hd-text' : 'text-hd-muted'}`}>{b.label}</p>
              <p className="text-[10px] text-hd-muted mt-0.5">{b.desc}</p>
              {earned && <span className="text-[10px] text-emerald-400 font-medium mt-1 block">✓ Earned</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
