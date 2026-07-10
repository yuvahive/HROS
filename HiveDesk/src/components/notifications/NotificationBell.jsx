import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, FileCode2, UserPlus, AlertTriangle, MessageSquare, Clock } from 'lucide-react';
import { useNotifications } from '../../auth/Notifications';
import { formatDateTime } from '../../utils/helpers';

const TYPE_ICONS = {
  assignment: UserPlus,
  review: FileCode2,
  status_change: AlertTriangle,
  comment: MessageSquare,
  info: Bell,
};

const TYPE_COLORS = {
  assignment: 'text-blue-400 bg-blue-500/10',
  review: 'text-amber-400 bg-amber-500/10',
  status_change: 'text-purple-400 bg-purple-500/10',
  comment: 'text-emerald-400 bg-emerald-500/10',
  info: 'text-hd-muted bg-slate-500/10',
};

export default function NotificationBell() {
  const { unreadCount, unread, markRead, markAllRead, live } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-hd-hover text-hd-muted hover:text-hd-text transition-colors"
        title="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {live && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" title="Live sync active" />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-hd-text px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-hd-surface border border-hd-border rounded-xl shadow-2xl shadow-black/40 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hd-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-hd-text">Notifications</h3>
              {unreadCount > 0 && <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-medium">{unreadCount} new</span>}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-500/10 transition-colors">
                  <CheckCheck className="w-3.5 h-3.5 inline mr-1" />Mark all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-hd-hover text-hd-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {unread.length === 0 && (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
                <p className="text-xs text-hd-muted">No new notifications</p>
              </div>
            )}
            {unread.map(n => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              const color = TYPE_COLORS[n.type] || TYPE_COLORS.info;
              return (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-hd-hover transition-colors border-b border-hd-border/50 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-hd-text leading-tight">{n.title}</p>
                    <p className="text-[11px] text-hd-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-hd-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDateTime(n.createdAt)}
                      </span>
                      {n.fromUserName && <span className="text-[10px] text-indigo-400">from {n.fromUserName}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead([n.id]); }}
                    className="p-1 rounded-md hover:bg-hd-hover text-hd-muted hover:text-emerald-400 transition-colors flex-shrink-0"
                    title="Mark read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
