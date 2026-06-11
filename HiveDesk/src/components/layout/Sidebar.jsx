import React from 'react';
import { LayoutDashboard, FileCode2, Rocket, ClipboardCheck, Users, Settings, LogOut, Clock, Heart, BarChart3, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Hexagon, Shield, FileSearch, Inbox, Columns3, Upload, Activity, Gauge, Sparkles, Award, DollarSign, BookOpen, MessageCircle, Flag } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useRBAC } from '../../auth/RBAC';

const CORE_ITEMS = [
  { id: 'dashboard', label: 'War Room', icon: LayoutDashboard, minRole: 'curator' },
  { id: 'queue', label: 'My Queue', icon: Inbox, minRole: 'curator' },
  { id: 'standup', label: 'Standup', icon: MessageCircle, minRole: 'curator' },
  { id: 'bounties', label: 'Bounties', icon: DollarSign, minRole: 'curator' },
  { id: 'questions', label: 'Questions', icon: FileCode2, minRole: 'curator' },
  { id: 'pipeline', label: 'Pipeline', icon: Columns3, minRole: 'curator' },
  { id: 'sprints', label: 'Sprints', icon: Rocket, minRole: 'curator' },
  { id: 'reviews', label: 'Reviews', icon: ClipboardCheck, minRole: 'curator' },
  { id: 'team', label: 'Team', icon: Users, minRole: 'curator' },
  { id: 'checkins', label: 'Check-Ins', icon: Heart, minRole: 'curator' },
  { id: 'worklogs', label: 'Work Logs', icon: Clock, minRole: 'curator' },
];

const MORE_ITEMS = [
  { id: 'skills', label: 'Skills', icon: BookOpen, minRole: 'curator' },
  { id: 'kudos', label: 'Kudos', icon: Heart, minRole: 'curator' },
  { id: 'goals', label: 'Goals', icon: Flag, minRole: 'curator' },
  { id: 'achievements', label: 'Achievements', icon: Award, minRole: 'curator' },
  { id: 'wrapped', label: 'Wrapped', icon: Sparkles, minRole: 'curator' },
  { id: 'workload', label: 'Workload', icon: Gauge, minRole: 'lead' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, minRole: 'lead' },
  { id: 'moods', label: 'Mood Trends', icon: Activity, minRole: 'lead' },
  { id: 'retro', label: 'Retro', icon: Activity, minRole: 'lead' },
  { id: 'import', label: 'Import', icon: Upload, minRole: 'lead' },
];

const ADMIN_ITEMS = [
  { id: 'users', label: 'Users', icon: Shield, minRole: 'admin' },
  { id: 'audit', label: 'Audit Log', icon: FileSearch, minRole: 'admin' },
  { id: 'settings', label: 'Settings', icon: Settings, minRole: 'admin' },
];

const ROLE_LEVELS = { admin: 3, lead: 2, curator: 1 };

function NavItem({ item, active, collapsed, onNavigate }) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-indigo-500/15 text-indigo-400'
          : 'text-hd-muted hover:bg-hd-hover hover:text-hd-text'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} strokeWidth={isActive ? 2.2 : 1.8} />
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}

function NavContent({ coreItems, moreItems, adminItems, active, onNavigate, collapsed, user, onLogout, moreOpen, onToggleMore }) {
  const showAdmin = adminItems.length > 0;

  if (collapsed) {
    return (
      <>
        <div className="px-3 pt-4 pb-3 border-b border-hd-border">
          <div className="flex items-center justify-center">
            <div className="w-9 h-9 accent-gradient rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <Hexagon className="w-5 h-5 text-hd-text" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {[...coreItems, ...moreItems, ...adminItems].map(item => (
            <NavItem key={item.id} item={item} active={active} collapsed={true} onNavigate={onNavigate} />
          ))}
        </nav>

        <div className="p-2 border-t border-hd-border space-y-1">
          <button onClick={() => window.dispatchEvent(new Event('hivedesk-back'))}
            className="w-full flex items-center justify-center px-2 py-2 rounded-lg text-[13px] font-medium text-hd-muted hover:bg-hd-hover hover:text-hd-text transition-all"
            title="Back to Calendar">
            <ArrowLeft className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
          </button>
          <button onClick={onLogout} className="w-full flex items-center justify-center px-2 py-2 rounded-lg text-hd-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-3 pt-4 pb-3 border-b border-hd-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 accent-gradient rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <Hexagon className="w-5 h-5 text-hd-text" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight text-hd-text">HiveDesk</h1>
            <p className="text-[10px] text-hd-muted uppercase tracking-widest">War Room</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {coreItems.map(item => (
          <NavItem key={item.id} item={item} active={active} collapsed={false} onNavigate={onNavigate} />
        ))}

        {moreItems.length > 0 && (
          <>
            <div className="pt-3 pb-0.5">
              <button onClick={onToggleMore}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-hd-muted hover:text-hd-secondary hover:bg-hd-hover transition-all">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? '' : '-rotate-90'}`} />
                More
                <span className="text-[10px] text-hd-muted font-normal ml-auto">{moreItems.length}</span>
              </button>
            </div>
            {moreOpen && moreItems.map(item => (
              <NavItem key={item.id} item={item} active={active} collapsed={false} onNavigate={onNavigate} />
            ))}
          </>
        )}

        {showAdmin && (
          <>
            <div className="pt-3 pb-0.5">
              <div className="flex items-center gap-2 px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-hd-muted">Admin</span>
              </div>
            </div>
            {adminItems.map(item => (
              <NavItem key={item.id} item={item} active={active} collapsed={false} onNavigate={onNavigate} />
            ))}
          </>
        )}
      </nav>

      <div className="p-2 border-t border-hd-border space-y-1">
        <button onClick={() => window.dispatchEvent(new Event('hivedesk-back'))}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-hd-muted hover:bg-hd-hover hover:text-hd-text transition-all"
          title="Back to Calendar">
          <ArrowLeft className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
          <span>Back to Calendar</span>
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-hd-surface/[0.03]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-[11px] font-bold text-hd-secondary ring-1 ring-hd-border flex-shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-hd-text truncate">{user?.name}</p>
            <p className="text-[10px] text-hd-muted capitalize">{user?.role}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-md text-hd-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Sign Out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ active, onNavigate, collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const { role } = useRBAC();
  const userLevel = ROLE_LEVELS[role] || 0;
  const [moreOpen, setMoreOpen] = React.useState(() => {
    const moreIds = MORE_ITEMS.map(i => i.id);
    return moreIds.includes(active);
  });

  const filterByRole = React.useCallback((items) =>
    items.filter(i => (ROLE_LEVELS[i.minRole] || 0) <= userLevel),
    [userLevel]
  );

  const coreItems = React.useMemo(() => filterByRole(CORE_ITEMS), [filterByRole]);
  const moreItems = React.useMemo(() => filterByRole(MORE_ITEMS), [filterByRole]);
  const adminItems = React.useMemo(() => filterByRole(ADMIN_ITEMS), [filterByRole]);

  React.useEffect(() => {
    const moreIds = MORE_ITEMS.map(i => i.id);
    if (moreIds.includes(active)) setMoreOpen(true);
  }, [active]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-64 bg-hd-surface border-r border-hd-border flex flex-col animate-in fade-in duration-150">
            <div className="flex items-center justify-end p-2">
              <button onClick={onMobileClose} className="p-1.5 rounded-md hover:bg-hd-hover text-hd-muted">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavContent coreItems={coreItems} moreItems={moreItems} adminItems={adminItems}
              active={active} onNavigate={onNavigate} collapsed={false}
              user={user} onLogout={logout}
              moreOpen={moreOpen} onToggleMore={() => setMoreOpen(o => !o)} />
          </div>
        </div>
      )}

      <div className={`hidden md:flex h-full bg-hd-surface border-r border-hd-border flex-col flex-shrink-0 transition-all duration-200 ${collapsed ? 'w-[60px]' : 'w-56'}`}>
        <div className="flex items-center justify-end p-1.5">
          <button onClick={onToggleCollapse} className="p-1.5 rounded-md hover:bg-hd-hover text-hd-muted hover:text-hd-secondary transition-colors">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
        <NavContent coreItems={coreItems} moreItems={moreItems} adminItems={adminItems}
          active={active} onNavigate={onNavigate} collapsed={collapsed}
          user={user} onLogout={logout}
          moreOpen={moreOpen} onToggleMore={() => setMoreOpen(o => !o)} />
      </div>
    </>
  );
}

