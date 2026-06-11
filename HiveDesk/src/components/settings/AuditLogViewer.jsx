import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, Download, Lock } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDateTime } from '../../utils/helpers';

export default function AuditLogViewer() {
  const { isAdmin } = useRBAC();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshSignal = useRefreshSignal();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await HiveDeskStorage.getAll('HiveDeskLogs');
    setLogs(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const safeStr = (val, fallback = '—') => {
    if (val == null) return fallback;
    if (typeof val === 'object') return val.name || val.email || val.id || fallback;
    return String(val);
  };

  const filtered = logs.filter(l => {
    if (filterAction && l.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      return Object.values(l).some(v => v && String(v).toLowerCase().includes(q));
    }
    return true;
  });

  const actions = [...new Set(logs.map(l => l.action))];

  if (!isAdmin) {
    return (
      <div className="card p-12 text-center">
        <Lock className="w-10 h-10 mx-auto text-hd-muted/30 mb-3" />
        <h3 className="text-sm font-semibold text-hd-text mb-1">Admin Only</h3>
        <p className="text-xs text-hd-muted">Audit logs are restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" /> Audit Logs
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{filtered.length} entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="card px-3 py-1.5 text-xs text-hd-muted hover:text-hd-text flex items-center gap-1.5 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-hd-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full bg-hd-surface border border-hd-border rounded-lg pl-9 pr-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-xs text-hd-secondary outline-none">
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{safeStr(a)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hd-border text-hd-muted text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hd-border">
              {filtered.slice(0, 200).map((l, i) => (
                <tr key={l.id || i} className="hover:bg-hd-surface/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[11px] text-hd-muted whitespace-nowrap">{formatDateTime(l.timestamp)}</td>
                  <td className="px-4 py-3 text-[13px] text-hd-text">{safeStr(l.userName || l.userId)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${l.action === 'delete' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : l.action === 'insert' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{safeStr(l.action)}</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-hd-muted font-mono">{safeStr(l.resource)}</td>
                  <td className="px-4 py-3 text-[11px] text-hd-muted max-w-[200px] truncate">{safeStr(l.details)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-hd-muted text-xs">No logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
