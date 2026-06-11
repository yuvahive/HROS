import React from 'react';

const COLOR_MAP = {
  blue: { icon: 'bg-blue-500/15 text-blue-400', ring: 'ring-blue-500/10' },
  purple: { icon: 'bg-purple-500/15 text-purple-400', ring: 'ring-purple-500/10' },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-400', ring: 'ring-emerald-500/10' },
  amber: { icon: 'bg-amber-500/15 text-amber-400', ring: 'ring-amber-500/10' },
  red: { icon: 'bg-red-500/15 text-red-400', ring: 'ring-red-500/10' },
  indigo: { icon: 'bg-indigo-500/15 text-indigo-400', ring: 'ring-indigo-500/10' },
};

export default function MetricCard({ title, value, icon, color = 'blue', suffix = '', trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="card card-hover p-4 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-hd-muted uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-hd-text">{value}</span>
            {suffix && <span className="text-sm font-medium text-hd-muted">{suffix}</span>}
          </div>
          {trend !== undefined && (
            <p className={`text-[11px] font-semibold mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}% vs last week
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${c.ring} ${c.icon} flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
