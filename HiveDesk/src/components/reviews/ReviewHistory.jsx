import React, { useState, useEffect } from 'react';
import { History, Star, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { formatDateTime } from '../../utils/helpers';

export default function ReviewHistory() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await HiveDeskStorage.filter('HiveDeskReviews', { reviewerId: user.id });
      setReviews((res.data || []).sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt)));
      setLoading(false);
    })();
  }, [user]);

  const statusIcon = (s) => {
    if (s === 'approved') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === 'needs-revision') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">My Review History</h3>
      </div>

      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={r.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-hd-raised border border-hd-border">
            {statusIcon(r.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-hd-text truncate">{r.questionTitle || r.questionId}</p>
              <p className="text-[11px] text-hd-muted">by {r.creatorName || '—'} · {formatDateTime(r.reviewedAt)}</p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
              <span className="font-bold">{r.overallScore ? Number(r.overallScore).toFixed(1) : '—'}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
              r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
              r.status === 'needs-revision' ? 'bg-red-500/10 text-red-400' :
              'bg-amber-500/10 text-amber-400'
            }`}>{r.status}</span>
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <p className="text-hd-muted text-sm text-center py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
