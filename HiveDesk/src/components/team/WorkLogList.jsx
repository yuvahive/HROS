import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import WorkLogForm from './WorkLogForm';
import { getWorkLogs, deleteWorkLog } from '../../services/workLogService';
import { useAuth } from '../../auth/AuthContext';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

export default function WorkLogList() {
  const { user } = useAuth();
  const refreshSignal = useRefreshSignal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getWorkLogs({ personId: user.id });
    setLogs((data.data || data).sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const totalHours = logs.reduce((a, b) => a + (Number(b.hoursWorked) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> My Work Logs
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{totalHours.toFixed(1)}h total</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm(true)} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Log Work
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-hd-border text-hd-muted text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hd-border">
            {logs.map((l, i) => (
              <tr key={l.id || i} className="hover:bg-hd-surface/[0.02] transition-colors">
                <td className="px-4 py-3 text-[13px] text-hd-muted">{formatDate(l.date)}</td>
                <td className="px-4 py-3 text-[13px] font-medium text-hd-text">{l.taskName}</td>
                <td className="px-4 py-3 text-[11px] text-hd-muted capitalize">{l.taskType?.replace(/-/g, ' ')}</td>
                <td className="px-4 py-3 text-sm font-bold text-indigo-400">{l.hoursWorked}h</td>
                <td className="px-4 py-3 text-[11px] text-hd-muted max-w-[200px] truncate">{l.notes || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={async () => { await deleteWorkLog(l.id); load(); }} className="p-1.5 rounded-md hover:bg-red-500/10 text-hd-muted hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <Clock className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
                <p className="text-sm text-hd-muted">No work logs yet</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && <WorkLogForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  );
}

