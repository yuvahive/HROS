import { Users } from 'lucide-react';
import { getInitials } from '../../utils/helpers';

const AVATAR_COLORS = [
  'from-blue-600 to-blue-700',
  'from-purple-600 to-purple-700',
  'from-emerald-600 to-emerald-700',
  'from-amber-600 to-amber-700',
  'from-rose-600 to-rose-700',
  'from-cyan-600 to-cyan-700',
  'from-indigo-600 to-indigo-700',
  'from-teal-600 to-teal-700',
];

export default function TeamPulse({ members, questions }) {
  const memberStats = members
    .filter(m => m.role !== 'admin' || m.isActive === 'true' || m.isActive === true)
    .map(m => {
      const created = (questions || []).filter(q => q.creatorId === m.id || q.Creator === m.Name || q.CreatorId === m.id).length;
      const reviewed = (questions || []).filter(q => q.reviewerId === m.id || q.Reviewer === m.Name).length;
      return { ...m, created, reviewed };
    })
    .sort((a, b) => b.created - a.created)
    .slice(0, 8);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-hd-text">Team Pulse</h3>
        </div>
        <span className="text-[11px] text-hd-muted">{memberStats.length} members</span>
      </div>

      <div className="space-y-1.5">
        {memberStats.map((m, i) => (
          <div key={m.id || i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-hd-hover transition-colors group">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[10px] font-bold text-hd-text ring-1 ring-hd-border flex-shrink-0`}>
              {getInitials(m.Name || m.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-hd-text truncate">{m.Name || m.name}</p>
              <p className="text-[11px] text-hd-muted">{m.Domain || m.domain || m.Role || m.role || 'Member'}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center">
                <p className="text-sm font-semibold text-hd-text">{m.created}</p>
                <p className="text-[9px] text-hd-muted uppercase">Created</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-hd-text">{m.reviewed}</p>
                <p className="text-[9px] text-hd-muted uppercase">Reviewed</p>
              </div>
            </div>
          </div>
        ))}
        {memberStats.length === 0 && (
          <div className="py-8 text-center">
            <Users className="w-8 h-8 mx-auto text-hd-muted/40 mb-2" />
            <p className="text-sm text-hd-muted">No team members yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
