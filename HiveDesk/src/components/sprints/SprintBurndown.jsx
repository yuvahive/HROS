import React, { useState, useEffect } from 'react';
import { TrendingDown, Calendar, Target, BarChart3 } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { formatDate } from '../../utils/helpers';

export default function SprintBurndown() {
  const [sprints, setSprints] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }
      const allSprints = Array.isArray(raw.HiveDeskSprints) ? raw.HiveDeskSprints : [];
      const allQ = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
      setSprints(allSprints);
      setQuestions(allQ);
      setActiveSprint(allSprints.find(s => s.status === 'active') || allSprints[0] || null);
      setLoading(false);
    })();
  }, []);

  if (!activeSprint) {
  return (
      <div className="card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-hd-text">Sprint Burndown</h3>
        </div>
        <div className="py-8 text-center">
          <BarChart3 className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
          <p className="text-xs text-hd-muted">No active sprint to display</p>
        </div>
      </div>
    );
  }

  const target = Number(activeSprint.targetQuestions) || 0;
  const startDate = new Date(activeSprint.startDate);
  const endDate = new Date(activeSprint.endDate);
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const today = new Date();
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))));
  const dayNames = Array.from({ length: totalDays + 1 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  });

  // Compute completed per day (simulated from question data)
  const completedPerDay = [];
  let remaining = target;
  for (let i = 0; i <= totalDays; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + i);
    const dayStr = dayDate.toISOString().split('T')[0];
    const publishedThatDay = questions.filter(q => {
      if (q.status !== 'published') return false;
      const pubDate = q.publishedAt || q.updatedAt;
      return pubDate && new Date(pubDate).toISOString().split('T')[0] === dayStr;
    }).length;
    remaining = Math.max(0, remaining - publishedThatDay);
    completedPerDay.push(remaining);
  }

  // Ideal burndown line
  const idealLine = Array.from({ length: totalDays + 1 }, (_, i) => {
    return Math.round(target * (1 - i / totalDays) * 10) / 10;
  });

  // SVG chart dimensions
  const W = 500, H = 200, PAD = 30;
  const xScale = (i) => PAD + (i / totalDays) * (W - PAD * 2);
  const yScale = (v) => PAD + (1 - v / Math.max(target, 1)) * (H - PAD * 2);

  const actualPath = completedPerDay.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(v)}`).join(' ');
  const idealPath = idealLine.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(v)}`).join(' ');

  const completed = target - completedPerDay[completedPerDay.length - 1];
  const progress = target > 0 ? Math.round((completed / target) * 100) : 0;
  const isOnTrack = completedPerDay[elapsedDays] <= idealLine[elapsedDays];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-hd-text">Sprint Burndown</h3>
            <p className="text-[11px] text-hd-muted">{activeSprint.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-hd-text">{completed}/{target}</p>
            <p className="text-[10px] text-hd-muted">completed</p>
          </div>
          <span className={`badge text-[10px] ${isOnTrack ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {isOnTrack ? 'On Track' : 'Behind'}
          </span>
        </div>
      </div>

      {/* SVG Burndown Chart */}
      <div className="bg-hd-surface/[0.02] rounded-lg p-3 border border-hd-border">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
            <g key={pct}>
              <line x1={PAD} y1={yScale(target * pct)} x2={W - PAD} y2={yScale(target * pct)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={PAD - 4} y={yScale(target * pct) + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8">{Math.round(target * pct)}</text>
            </g>
          ))}
          {/* X-axis labels */}
          {dayNames.map((name, i) => {
            if (totalDays > 10 && i % 2 !== 0) return null;
            return <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">{name}</text>;
          })}
          {/* Ideal line (dashed) */}
          <path d={idealPath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* Actual line */}
          <path d={actualPath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Actual dots */}
          {completedPerDay.map((v, i) => (
            <circle key={i} cx={xScale(i)} cy={yScale(v)} r="3" fill="#818cf8" stroke="rgba(15,17,23,0.8)" strokeWidth="1.5" />
          ))}
          {/* Today marker */}
          {elapsedDays <= totalDays && (
            <line x1={xScale(elapsedDays)} y1={PAD} x2={xScale(elapsedDays)} y2={H - PAD} stroke="rgba(251,191,36,0.4)" strokeWidth="1" strokeDasharray="3,3" />
          )}
        </svg>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-hd-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-400 rounded" /> Actual</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-hd-surface/20 rounded" style={{borderTop:'1px dashed rgba(255,255,255,0.3)'}} /> Ideal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400/40" /> Today</span>
        </div>
      </div>

      {/* Sprint Summary */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-hd-surface/[0.03] rounded-lg p-2.5 text-center border border-hd-border">
          <p className="text-lg font-bold text-hd-text">{progress}%</p>
          <p className="text-[9px] text-hd-muted uppercase tracking-wider">Progress</p>
        </div>
        <div className="bg-hd-surface/[0.03] rounded-lg p-2.5 text-center border border-hd-border">
          <p className="text-lg font-bold text-hd-text">{Math.max(0, totalDays - elapsedDays)}</p>
          <p className="text-[9px] text-hd-muted uppercase tracking-wider">Days Left</p>
        </div>
        <div className="bg-hd-surface/[0.03] rounded-lg p-2.5 text-center border border-hd-border">
          <p className="text-lg font-bold text-hd-text">{target > 0 ? Math.round(completed / Math.max(1, elapsedDays) * (totalDays - elapsedDays) + completed) : 0}</p>
          <p className="text-[9px] text-hd-muted uppercase tracking-wider">Projected</p>
        </div>
      </div>
    </div>
  );
}
