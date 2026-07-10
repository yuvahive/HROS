import { useState, useEffect } from 'react';
import { Flame, Calendar } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

export default function StreakTracker() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0, total: 0, days: [] });
  const [teamStreaks, setTeamStreaks] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logs, standups, questions, users] = await Promise.all([
        HiveDeskStorage.getAll('HiveDeskWorkLogs'),
        HiveDeskStorage.getAll('HiveDeskStandups'),
        HiveDeskStorage.getAll('HiveDeskQuestions'),
        HiveDeskStorage.getAll('HiveDeskUsers'),
      ]);

      const myLogs = logs.filter(l => l.personId === currentUser?.id);
      const myStandups = standups.filter(s => s.personId === currentUser?.id);
      const myQuestions = questions.filter(q => q.creatorId === currentUser?.id);

      const activityDates = new Set();
      myLogs.forEach(l => { if (l.date) activityDates.add(l.date.split('T')[0]); });
      myStandups.forEach(s => { if (s.date) activityDates.add(s.date); });
      myQuestions.forEach(q => { if (q.createdAt) activityDates.add(q.createdAt.split('T')[0]); });

      const sortedDates = [...activityDates].sort().reverse();
      let current = 0;
      let longest = 0;
      let tempStreak = 0;
      const today = new Date().toISOString().split('T')[0];

      for (let i = 0; i < sortedDates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];

        if (sortedDates[i] === expectedStr || (i === 0 && sortedDates[i] >= new Date(Date.now() - 86400000).toISOString().split('T')[0])) {
          tempStreak++;
          if (i === 0) current = tempStreak;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 0;
        }
      }
      longest = Math.max(longest, tempStreak, current);

      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        last7.push({
          date: dateStr,
          day: dayNames[d.getDay()],
          active: activityDates.has(dateStr),
        });
      }

      setStreakData({
        current,
        longest,
        total: activityDates.size,
        days: last7,
      });

      const team = users.filter(u => u.isActive === 'true' || u.isActive === true).map(u => {
        const userLogs = logs.filter(l => l.personId === u.id);
        const userStandups = standups.filter(s => s.personId === u.id);
        const userQs = questions.filter(q => q.creatorId === u.id);
        const dates = new Set();
        userLogs.forEach(l => { if (l.date) dates.add(l.date.split('T')[0]); });
        userStandups.forEach(s => { if (s.date) dates.add(s.date); });
        userQs.forEach(q => { if (q.createdAt) dates.add(q.createdAt.split('T')[0]); });
        return { name: u.name, count: dates.size };
      }).sort((a, b) => b.count - a.count);

      setTeamStreaks(team);
    } catch (err) {
      console.error('Failed to load streak data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Streak Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Keep your contribution streak alive</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white">
          <Flame className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{streakData.current}</p>
          <p className="text-sm opacity-80">Current Streak</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <Calendar className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-3xl font-bold text-gray-900">{streakData.longest}</p>
          <p className="text-sm text-gray-500">Longest Streak</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-3xl font-bold text-gray-900">{streakData.total}</p>
          <p className="text-sm text-gray-500">Total Active Days</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">This Week</h3>
        <div className="flex gap-2">
          {streakData.days.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-16 rounded-lg flex items-center justify-center text-2xl ${
                d.active ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {d.active ? '✅' : '—'}
              </div>
              <p className="text-xs text-gray-500 mt-1">{d.day}</p>
            </div>
          ))}
        </div>
        {streakData.current > 0 && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            {streakData.current >= streakData.longest
              ? `🔥 New record! ${streakData.current} days and counting!`
              : `${streakData.longest - streakData.current} more days to beat your record.`
            }
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Streaks</h3>
        <div className="space-y-2">
          {teamStreaks.slice(0, 10).map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="text-sm font-medium text-gray-700 w-32 truncate">{t.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (t.count / (streakData.longest || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">{t.count} days</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
