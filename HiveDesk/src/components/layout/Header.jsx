import { RefreshCw, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import PageInfoButton from '../shared/PageInfoButton';

const STATUS_MAP = {
  online: { icon: Cloud, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Connected' },
  syncing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Syncing', spin: true },
  offline: { icon: CloudOff, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Offline' },
  error: { icon: CloudOff, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Error' },
};

export default function Header({ title, subtitle, onRefresh, loading, onToggleSidebar, activePage }) {
  const { cloudStatus } = useAuth();
  const st = STATUS_MAP[cloudStatus] || STATUS_MAP.offline;
  const StatusIcon = st.icon;

  return (
    <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-hd-border bg-hd-surface flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-hd-hover text-hd-muted"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-hd-text truncate">{title}</h1>
          {subtitle && <p className="text-xs text-hd-muted truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <PageInfoButton activePage={activePage} />
        <NotificationBell />

        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${st.bg} ${st.color} ${st.border}`}>
          <StatusIcon className={`w-3 h-3 ${st.spin ? 'animate-spin' : ''}`} />
          {st.label}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hd-border text-xs font-medium text-hd-muted hover:text-hd-text hover:bg-hd-hover transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}
      </div>
    </header>
  );
}
