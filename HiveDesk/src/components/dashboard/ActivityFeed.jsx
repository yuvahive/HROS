import { formatDateTime } from '../../utils/helpers';
import { FileCode2, UserPlus, CheckCircle2, AlertTriangle, ClipboardCheck, TrendingUp, Eye } from 'lucide-react';

const ACTION_CONFIG = {
  insert: { icon: FileCode2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  update: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  delete: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  status_change: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  review: { icon: ClipboardCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  assign: { icon: UserPlus, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  publish: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const RESOURCE_LABELS = {
  HiveDeskQuestions: 'Question',
  HiveDeskSprints: 'Sprint',
  HiveDeskReviews: 'Review',
  HiveDeskUsers: 'User',
  HiveDeskConfig: 'Config',
  HiveDeskLogs: 'Audit Log',
  HiveDeskWorkLogs: 'Work Log',
  HiveDeskCheckIns: 'Check-In',
  HiveDeskNotifications: 'Notification',
};

function describeAction(entry) {
  const action = entry.action || '';
  const resource = RESOURCE_LABELS[entry.resource] || entry.resource || '';
  const details = entry.details ? (typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)) : '';
  let parsed = {};
  try { parsed = JSON.parse(details); } catch { /* ignore */ }

  if (action === 'insert' && resource) return `Created ${resource}`;
  if (action === 'update' && resource) return `Updated ${resource}`;
  if (action === 'delete' && resource) return `Deleted ${resource}`;
  if (parsed.status) return `${resource} → ${parsed.status}`;
  return `${action} ${resource}`;
}

export default function ActivityFeed({ logs = [], maxItems = 15 }) {
  const items = logs.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-hd-text">Activity Feed</h3>
        </div>
        <div className="py-6 text-center">
          <Eye className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
          <p className="text-xs text-hd-muted">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-hd-text">Activity Feed</h3>
        </div>
        <span className="text-[11px] text-hd-muted">{items.length} recent</span>
      </div>
      <div className="space-y-1">
        {items.map((entry, i) => {
          const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.update;
          const Icon = cfg.icon;
          return (
            <div key={entry.id || i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-hd-hover transition-colors">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-hd-text leading-tight">{describeAction(entry)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-hd-muted">{entry.userName || 'system'}</span>
                  <span className="text-[10px] text-hd-muted">·</span>
                  <span className="text-[10px] text-hd-muted">{formatDateTime(entry.timestamp)}</span>
                  {entry.resourceId && <span className="text-[10px] text-indigo-400 font-mono">{entry.resourceId}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
