import { useState, useEffect } from 'react';
import { Users, UserPlus, Target, Briefcase } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { getInitials } from '../../utils/helpers';

const ROLE_BADGES = {
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  lead: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  curator: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const AVATAR_COLORS = [
  'from-blue-600 to-blue-700', 'from-purple-600 to-purple-700',
  'from-emerald-600 to-emerald-700', 'from-amber-600 to-amber-700',
  'from-rose-600 to-rose-700', 'from-cyan-600 to-cyan-700',
  'from-indigo-600 to-indigo-700', 'from-teal-600 to-teal-700',
];

export default function TeamRoster({ onSelectMember, onAddMember }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useRBAC();
  const canCreate = hasPermission('team_create');

  useEffect(() => {
    (async () => {
      const data = await HiveDeskStorage.getAll('HiveDeskUsers');
      setUsers(data.filter(u => u.isActive === 'true' || u.isActive === true || u.isActive === 'TRUE'));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Team Roster
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{users.length} members</span>
        </div>
        {canCreate && (
          <button onClick={onAddMember} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {users.map((u, i) => (
          <div key={u.id || i} onClick={() => onSelectMember(u)}
            className="card card-hover p-4 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-hd-text ring-1 ring-hd-border flex-shrink-0`}>
                {getInitials(u.Name || u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-hd-text truncate">{u.Name || u.name}</p>
                <p className="text-[11px] text-hd-muted truncate">{u.Email || u.email}</p>
              </div>
              <span className={`badge border ${(ROLE_BADGES[u.role] || ROLE_BADGES.curator)}`}>
                {u.role}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-hd-muted">
              {u.Domain && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {u.Domain}</span>}
              {u.weeklyTargetQuestions && <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {u.weeklyTargetQuestions}/wk</span>}
            </div>
          </div>
        ))}
        {users.length === 0 && !loading && (
          <div className="col-span-full card p-12 text-center">
            <Users className="w-10 h-10 mx-auto text-hd-muted/30 mb-3" />
            <p className="text-sm text-hd-muted">No team members yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

