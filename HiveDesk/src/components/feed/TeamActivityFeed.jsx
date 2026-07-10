import { useState, useEffect } from 'react';
import { Activity, FileCode2, CheckCircle2, Upload, Star, UserPlus, Clock } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getEventIcon(type) {
  switch (type) {
    case 'import': return <Upload className="w-4 h-4 text-blue-500" />;
    case 'review': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'approve': return <Star className="w-4 h-4 text-yellow-500" />;
    case 'create': return <FileCode2 className="w-4 h-4 text-indigo-500" />;
    case 'join': return <UserPlus className="w-4 h-4 text-purple-500" />;
    default: return <Activity className="w-4 h-4 text-gray-400" />;
  }
}

function getEventColor(type) {
  switch (type) {
    case 'import': return 'bg-blue-50 border-blue-200';
    case 'review': return 'bg-green-50 border-green-200';
    case 'approve': return 'bg-yellow-50 border-yellow-200';
    case 'create': return 'bg-indigo-50 border-indigo-200';
    case 'join': return 'bg-purple-50 border-purple-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

export default function TeamActivityFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = async () => {
    try {
      const [logs, questions, standups] = await Promise.all([
        HiveDeskStorage.getAll('HiveDeskLogs'),
        HiveDeskStorage.getAll('HiveDeskQuestions'),
        HiveDeskStorage.getAll('HiveDeskStandups'),
      ]);

      const allEvents = [];

      logs.forEach(log => {
        let type = 'other';
        if (log.action === 'insert' && log.resource === 'HiveDeskQuestions') type = 'create';
        else if (log.action === 'insert' && log.resource?.includes('Import')) type = 'import';
        else if (log.action === 'update' && log.resource === 'HiveDeskQuestions') type = 'review';
        else if (log.action === 'assign_buddy') type = 'join';
        else if (log.action === 'promote') type = 'join';

        allEvents.push({
          id: log.id,
          type,
          user: log.userName || 'System',
          message: `${log.action} on ${log.resource || 'system'}`,
          details: log.details,
          timestamp: log.timestamp,
        });
      });

      questions.forEach(q => {
        if (q.status === 'published' && q.publishedAt) {
          allEvents.push({
            id: `pub-${q.id}`,
            type: 'approve',
            user: q.creatorName || 'Unknown',
            message: `published "${q.title || q.id}"`,
            timestamp: q.publishedAt,
          });
        }
        if (q.status === 'in-review' && q.reviewedAt) {
          allEvents.push({
            id: `rev-${q.id}`,
            type: 'review',
            user: q.reviewerName || 'Unknown',
            message: `reviewing "${q.title || q.id}"`,
            timestamp: q.reviewedAt,
          });
        }
      });

      standups.forEach(s => {
        allEvents.push({
          id: `std-${s.id}`,
          type: 'create',
          user: s.personName || 'Unknown',
          message: `logged daily update`,
          timestamp: s.createdAt,
        });
      });

      allEvents.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setEvents(allEvents.slice(0, 50));
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Activity</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time feed of what everyone is building</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'create', 'import', 'review', 'approve'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((event, i) => (
          <div
            key={event.id || i}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(event.type)}`}
          >
            <div className="mt-0.5">{getEventIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{event.user}</span>{' '}
                {event.message}
              </p>
              {event.details && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{event.details}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {timeAgo(event.timestamp)}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No activity yet. Start working to see the feed light up.</p>
        </div>
      )}
    </div>
  );
}
