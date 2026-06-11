import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, Flame, CheckCircle2, Clock, User } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function QuestionBounties() {
  const { currentUser } = useAuth();
  const [bounties, setBounties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }
      const questions = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
      const u = Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : [];
      setBounties(questions.filter(q => q.bountyPoints && Number(q.bountyPoints) > 0 && q.status !== 'published' && q.status !== 'rejected'));
      setUsers(u.filter(u => u.isActive === 'true' || u.isActive === true));
      setLoading(false);
    })();
  }, []);

  const handleClaim = async (q) => {
    if (!window.confirm(`Claim "${q.title}"? This will assign it to you.`)) return;
    await HiveDeskStorage.update('HiveDeskQuestions', q.id, { assigneeId: currentUser?.id, assigneeName: currentUser?.name, status: 'in-review' });
    setBounties(prev => prev.filter(b => b.id !== q.id));
  };

  const totalPool = bounties.reduce((s, q) => s + Number(q.bountyPoints), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" /> Question Bounties
          </h2>
          <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">{bounties.length} bounties</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-amber-400">{totalPool}</p>
          <p className="text-[10px] text-hd-muted uppercase tracking-wider">Total Points Pool</p>
        </div>
      </div>

      {bounties.length > 0 && (
        <div className="card p-4 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10">
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Bounties are high-value questions needing attention. Claim one and earn points!
          </p>
        </div>
      )}

      <div className="space-y-2">
        {bounties.map((q, i) => (
          <div key={q.id || i} className="card card-hover p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-hd-text font-bold text-sm flex-shrink-0">
                {q.bountyPoints}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{q.prefix || q.id?.slice(0, 8)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>{q.difficulty}</span>
                </div>
                <h4 className="text-sm font-semibold text-hd-text truncate">{q.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-hd-muted">
                  <span>{q.domain || '—'}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {q.creatorName || '—'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(q.createdAt)}</span>
                </div>
              </div>
              <button onClick={() => handleClaim(q)} disabled={q.assigneeId}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  q.assigneeId ? 'bg-slate-500/10 text-slate-400 cursor-not-allowed' : 'accent-gradient text-white shadow-lg shadow-indigo-500/20 hover:opacity-90'
                }`}>
                {q.assigneeId ? 'Claimed' : <><Zap className="w-3 h-3" /> Claim Bounty</>}
              </button>
            </div>
          </div>
        ))}
        {bounties.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <DollarSign className="w-10 h-10 mx-auto text-amber-500/30 mb-3" />
            <p className="text-sm text-hd-muted">No active bounties</p>
            <p className="text-xs text-hd-muted/60 mt-1">All caught up! Come back later for new challenges.</p>
          </div>
        )}
      </div>
    </div>
  );
}

