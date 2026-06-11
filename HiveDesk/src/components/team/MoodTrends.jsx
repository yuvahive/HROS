import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Heart, Smile, Frown, Meh } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function MoodTrends() {
  const { currentUser } = useAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }
      const all = Array.isArray(raw.HiveDeskCheckIns) ? raw.HiveDeskCheckIns : [];
      const workLogs = Array.isArray(raw.HiveDeskWorkLogs) ? raw.HiveDeskWorkLogs : [];
      const logsWithMood = workLogs.filter(w => w.mood);
      const combined = [
        ...all.map(c => ({ ...c, _type: 'checkin', _date: c.createdAt || c.date })),
        ...logsWithMood.map(l => ({ ...l, _type: 'mood', _date: l.date, mood: l.mood, energy: l.energy || 'medium' })),
      ];
      setCheckIns(combined.sort((a, b) => new Date(a._date) - new Date(b._date)));
      setLoading(false);
    })();
  }, []);

  const myCheckIns = checkIns.filter(c => c.personId === currentUser?.id);
  const teamCheckIns = checkIns;

  const moodEmojis = { '😤': 'stressed', '😰': 'anxious', '😐': 'neutral', '😊': 'good', '🔥': 'great', great: '🔥', good: '😊', neutral: '😐', bad: '😞', terrible: '🚨' };

  const weeks = {};
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().split('T')[0];
    if (!weeks[key]) weeks[key] = [];
    teamCheckIns.filter(c => {
      const cd = new Date(c._date);
      const cs = new Date(cd);
      cs.setDate(cs.getDate() - cs.getDay());
      return cs.toISOString().split('T')[0] === key;
    }).forEach(c => weeks[key].push(c));
  }

  const weeklyMoods = Object.entries(weeks).sort().map(([week, entries]) => {
    const scores = entries.map(e => {
      const mood = e.mood || e.moodValue;
      if (mood === 'great' || mood === '🔥' || mood === 5) return 100;
      if (mood === 'good' || mood === '😊' || mood === 4) return 75;
      if (mood === 'neutral' || mood === '😐' || mood === 3) return 50;
      if (mood === 'bad' || mood === '😞' || mood === 2) return 25;
      if (mood === 'terrible' || mood === '🚨' || mood === 1 || mood === '😤' || mood === '😰') return 10;
      return 50;
    });
    const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    return { week, avg, count: entries.length };
  });

  const latestAvg = weeklyMoods[weeklyMoods.length - 1]?.avg || 0;
  const trend = weeklyMoods.length >= 2 ? weeklyMoods[weeklyMoods.length - 1].avg - weeklyMoods[weeklyMoods.length - 2].avg : 0;

  if (loading) return <div className="card p-12 text-center"><Activity className="w-10 h-10 mx-auto text-hd-muted/30 mb-3 animate-pulse" /><p className="text-sm text-hd-muted">Analyzing mood trends...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
          <Activity className="w-5 h-5 text-pink-400" /> Mood Trends
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent">
          <Heart className="w-5 h-5 mx-auto mb-1 text-pink-400" />
          <p className="text-xl font-black text-hd-text">{teamCheckIns.length}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Total Check-Ins</p>
        </div>
        <div className="card p-4 text-center border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <Smile className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
          <p className="text-xl font-black text-hd-text">{latestAvg}%</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Current Mood</p>
        </div>
        <div className={`card p-4 text-center border-${trend >= 0 ? 'emerald' : 'red'}-500/20 bg-gradient-to-br from-${trend >= 0 ? 'emerald' : 'red'}-500/5 to-transparent`}>
          <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          <p className="text-xl font-black text-hd-text">{trend >= 0 ? '+' : ''}{trend}%</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Weekly Trend</p>
        </div>
        <div className="card p-4 text-center border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <Meh className="w-5 h-5 mx-auto mb-1 text-amber-400" />
          <p className="text-xl font-black text-hd-text">{weeklyMoods.filter(w => w.avg < 50).length}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Low Weeks</p>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-hd-text mb-4">Weekly Mood Trend</h3>
        <div className="space-y-2">
          {weeklyMoods.slice().reverse().map(w => {
            const barColor = w.avg >= 75 ? 'bg-emerald-500' : w.avg >= 50 ? 'bg-amber-500' : 'bg-red-500';
            const emoji = w.avg >= 75 ? '😊' : w.avg >= 50 ? '😐' : '😞';
            return (
              <div key={w.week} className="flex items-center gap-3">
                <span className="text-[10px] text-hd-muted w-20">{w.week.slice(5)}</span>
                <div className="flex-1 bg-hd-surface/[0.05] h-5 rounded-full overflow-hidden relative">
                  <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${w.avg}%` }} />
                </div>
                <span className="text-xs font-bold text-hd-text w-8 text-right">{w.avg}%</span>
                <span className="text-sm">{emoji}</span>
                <span className="text-[10px] text-hd-muted w-8">{w.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {myCheckIns.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-hd-text mb-3">Your Recent Check-Ins</h3>
          <div className="space-y-2">
            {myCheckIns.slice(-5).reverse().map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-hd-surface/[0.02]">
                <span className="text-lg">{moodEmojis[c.mood] || c.mood || '😐'}</span>
                <div className="flex-1">
                  <p className="text-xs text-hd-secondary">Mood: {c.mood} · Energy: {c.energy || '—'}</p>
                  {c.notes && <p className="text-[10px] text-hd-muted line-clamp-1">{c.notes}</p>}
                </div>
                <span className="text-[10px] text-hd-muted">{formatDate(c._date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamCheckIns.length === 0 && (
        <div className="card p-12 text-center">
          <Activity className="w-10 h-10 mx-auto text-pink-500/30 mb-3" />
          <p className="text-sm text-hd-muted">No mood data yet</p>
          <p className="text-xs text-hd-muted/60 mt-1">Check-ins and mood logs will appear here as the team participates.</p>
        </div>
      )}
    </div>
  );
}
