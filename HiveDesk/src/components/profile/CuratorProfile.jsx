import { useState, useEffect } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

const LEVELS = [
  { name: 'Newcomer', min: 0, icon: '🌱', color: 'text-gray-500' },
  { name: 'Contributor', min: 5, icon: '📝', color: 'text-blue-500' },
  { name: 'Reviewer', min: 15, icon: '👀', color: 'text-green-500' },
  { name: 'Senior', min: 30, icon: '⭐', color: 'text-yellow-500' },
  { name: 'Master', min: 50, icon: '🏆', color: 'text-purple-500' },
];

function getLevel(approvedCount) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (approvedCount >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export default function CuratorProfile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [qualityTrend, setQualityTrend] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questions, reviews, logs, standups] = await Promise.all([
        HiveDeskStorage.getAll('HiveDeskQuestions'),
        HiveDeskStorage.getAll('HiveDeskReviews'),
        HiveDeskStorage.getAll('HiveDeskWorkLogs'),
        HiveDeskStorage.getAll('HiveDeskStandups'),
      ]);

      const myQs = questions.filter(q => q.creatorId === currentUser?.id);
      const approved = myQs.filter(q => q.status === 'published' || q.status === 'approved');
      const myReviews = reviews.filter(r => r.reviewerId === currentUser?.id);
      const scores = myQs.filter(q => q.qualityScore && Number(q.qualityScore) > 0);
      const avgQuality = scores.length > 0
        ? scores.reduce((sum, q) => sum + Number(q.qualityScore), 0) / scores.length
        : 0;

      const activityDates = new Set();
      logs.filter(l => l.personId === currentUser?.id).forEach(l => {
        if (l.date) activityDates.add(l.date.split('T')[0]);
      });
      standups.filter(s => s.personId === currentUser?.id).forEach(s => {
        if (s.date) activityDates.add(s.date);
      });
      myQs.forEach(q => {
        if (q.createdAt) activityDates.add(q.createdAt.split('T')[0]);
      });

      const sortedDates = [...activityDates].sort().reverse();
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < sortedDates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (sortedDates[i] === expectedStr || (i === 0 && sortedDates[i] >= new Date(Date.now() - 86400000).toISOString().split('T')[0])) {
          currentStreak++;
        } else break;
      }

      const weeklyScores = [];
      for (let w = 3; w >= 0; w--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - w * 7);
        const weekQs = myQs.filter(q => {
          const d = new Date(q.createdAt);
          return d >= weekStart && d <= weekEnd && q.qualityScore;
        });
        const avg = weekQs.length > 0
          ? weekQs.reduce((s, q) => s + Number(q.qualityScore), 0) / weekQs.length
          : 0;
        weeklyScores.push({ week: `W${4 - w}`, score: avg });
      }

      setStats({
        written: myQs.length,
        approved: approved.length,
        reviewCount: myReviews.length,
        avgQuality: Math.round(avgQuality * 10) / 10,
        currentStreak,
        level: getLevel(approved.length),
        approvalRate: myQs.length > 0 ? Math.round((approved.length / myQs.length) * 100) : 0,
      });
      setQualityTrend(weeklyScores);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your stats, level, and impact</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            {stats.level.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
            <p className="text-white/80">{stats.level.name} • {currentUser?.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.written}</p>
            <p className="text-sm text-white/70">Written</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.approved}</p>
            <p className="text-sm text-white/70">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.avgQuality}</p>
            <p className="text-sm text-white/70">Quality</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{stats.currentStreak}</p>
            <p className="text-sm text-white/70">Streak</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700">Approval Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.approvalRate}%</p>
          <div className="mt-2 bg-gray-100 rounded-full h-2">
            <div
              className="bg-indigo-500 rounded-full h-2"
              style={{ width: `${stats.approvalRate}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-700">Reviews Done</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.reviewCount}</p>
          <p className="text-xs text-gray-500 mt-1">Peer reviews completed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quality Trend (Last 4 Weeks)</h3>
        <div className="flex items-end gap-3 h-32">
          {qualityTrend.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${w.score > 0 ? (w.score / 5) * 100 : 5}%` }}
              />
              <p className="text-xs text-gray-500 mt-1">{w.week}</p>
              <p className="text-xs font-medium text-gray-700">
                {w.score > 0 ? w.score.toFixed(1) : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Level Progress</h3>
        <div className="space-y-2">
          {LEVELS.map((level, i) => {
            const isCurrent = level.name === stats.level.name;
            const isPassed = stats.approved >= level.min;
            const nextMin = LEVELS[i + 1]?.min || level.min + 10;
            const progress = isPassed ? 100 : Math.round(((stats.approved - level.min) / (nextMin - level.min)) * 100);
            return (
              <div key={level.name} className={`flex items-center gap-3 py-2 px-3 rounded ${isCurrent ? 'bg-indigo-50 border border-indigo-200' : ''}`}>
                <span className="text-xl">{level.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>{level.name}</span>
                    {isCurrent && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Current</span>}
                  </div>
                  {!isPassed && (
                    <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-indigo-400 rounded-full h-1.5" style={{ width: `${Math.max(0, progress)}%` }} />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">{level.min}+ approved</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
