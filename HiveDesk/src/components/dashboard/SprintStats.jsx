import React from 'react';
import { Rocket, Calendar, Target } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function SprintStats({ sprint }) {
  if (!sprint) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-hd-text">Current Sprint</h3>
        </div>
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-hd-surface/[0.03] flex items-center justify-center mb-3">
            <Rocket className="w-5 h-5 text-hd-muted" />
          </div>
          <p className="text-sm text-hd-muted">No active sprint</p>
          <p className="text-xs text-hd-muted/60 mt-1">Create one to start tracking iterations</p>
        </div>
      </div>
    );
  }

  const target = Number(sprint.targetQuestions) || 0;
  const actual = Number(sprint.actualQuestions) || 0;
  const published = Number(sprint.publishedCount) || 0;
  const progress = target > 0 ? Math.round((actual / target) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-hd-text">{sprint.name || 'Sprint #' + (sprint.weekNumber || '?')}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] text-hd-muted">
                <Calendar className="w-3 h-3" /> {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
              </span>
            </div>
          </div>
        </div>
        <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Active
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-hd-muted">Sprint Progress</span>
          <span className="font-semibold text-hd-text">{actual}/{target} <span className="text-hd-muted font-normal">questions</span></span>
        </div>
        <div className="w-full bg-hd-surface/[0.05] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-hd-muted mt-1">
          <span>0%</span>
          <span>{progress}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-hd-surface/[0.03] rounded-lg p-3 text-center border border-hd-border">
          <p className="text-lg font-bold text-hd-text">{published}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Published</p>
        </div>
        <div className="bg-hd-surface/[0.03] rounded-lg p-3 text-center border border-hd-border">
          <p className="text-lg font-bold text-hd-text">{sprint.avgQualityScore ? Number(sprint.avgQualityScore).toFixed(1) : '—'}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Quality</p>
        </div>
        <div className="bg-hd-surface/[0.03] rounded-lg p-3 text-center border border-hd-border">
          <p className="text-lg font-bold text-hd-text">{target - actual > 0 ? target - actual : 0}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Remaining</p>
        </div>
      </div>
    </div>
  );
}
