import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { formatDate, getStatusColor } from '../../utils/helpers';

export default function SprintTimeline() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await HiveDeskStorage.getAll('HiveDeskSprints');
      setSprints(data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Sprint Timeline</h3>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-hd-surface/10" />

        <div className="space-y-6">
          {sprints.map((s, i) => {
            const Icon = s.status === 'done' ? CheckCircle2 : s.status === 'active' ? Clock : AlertCircle;
            return (
              <div key={s.id || i} className="relative pl-10">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full bg-${getStatusColor(s.status)}-400 ring-4 ring-[var(--color-background)]`} />
                <div className="glass-card p-4 hover:border-accent/20 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${getStatusColor(s.status)}-400`} />
                      <span className="font-semibold text-sm">{s.name || `Sprint #${s.weekNumber || '?'}`}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-${getStatusColor(s.status)}-500/10 text-${getStatusColor(s.status)}-400`}>{s.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-hd-muted">
                    <span>{formatDate(s.startDate)} — {formatDate(s.endDate)}</span>
                    <span>Lead: {s.sprintLeadName || '—'}</span>
                    <span>{s.actualQuestions || 0}/{s.targetQuestions || 0} questions</span>
                  </div>
                  {s.notes && <p className="text-xs text-hd-muted mt-2">{s.notes}</p>}
                </div>
              </div>
            );
          })}
          {sprints.length === 0 && !loading && (
            <p className="text-hd-muted text-sm text-center py-8">No sprints yet. Create one to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}
