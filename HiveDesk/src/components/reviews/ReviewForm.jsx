import { useState } from 'react';
import { X, Save, Star } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useConfig } from '../../config/ConfigContext';
import { useNotifications } from '../../auth/Notifications';
import { generateId, calculateQualityScore } from '../../utils/helpers';

function StarRating({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-hd-muted w-28">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`p-0.5 transition-colors ${n <= value ? 'text-amber-400' : 'text-hd-muted hover:text-hd-muted'}`}>
            <Star className="w-4 h-4" fill={n <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <span className="text-xs font-mono text-hd-muted w-6 text-right">{value || 0}</span>
    </div>
  );
}

export default function ReviewForm({ question, onClose, onSaved }) {
  const { user } = useAuth();
  const { config } = useConfig();
  const { notify } = useNotifications();
  const [form, setForm] = useState({
    accuracyScore: 0,
    completenessScore: 0,
    clarityScore: 0,
    difficultyCalibration: 0,
    originalityScore: 0,
    feedback: '',
    improvementNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const overallScore = calculateQualityScore(form, config);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await HiveDeskStorage.insert('HiveDeskReviews', {
        id: generateId('RV'),
        questionId: question.id,
        questionTitle: question.title,
        sprintId: '',
        reviewerId: user.id,
        reviewerName: user.name,
        creatorId: question.creatorId,
        creatorName: question.creatorName,
        ...form,
        overallScore,
        status: 'pending',
        revisionCount: 0,
        reviewedAt: new Date().toISOString(),
      });
      if (question.creatorId) {
        notify({
          userId: question.creatorId,
          type: 'review',
          title: 'Review Submitted',
          message: `${user.name} reviewed "${question.title}" — Score: ${overallScore.toFixed(1)}/5`,
          resourceId: question.id,
          resourceType: 'question',
          fromUserId: user.id,
          fromUserName: user.name,
          link: 'reviews'
        });
      }
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">Review Question</h3>
            <p className="text-xs text-hd-muted mt-1">{question.prefix || question.id?.slice(0, 8)} — {question.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover transition-colors"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 p-4 rounded-xl bg-hd-surface/5">
            <StarRating value={form.accuracyScore} onChange={v => setForm({...form, accuracyScore: v})} label="Accuracy (30%)" />
            <StarRating value={form.completenessScore} onChange={v => setForm({...form, completenessScore: v})} label="Completeness (25%)" />
            <StarRating value={form.clarityScore} onChange={v => setForm({...form, clarityScore: v})} label="Clarity (15%)" />
            <StarRating value={form.difficultyCalibration} onChange={v => setForm({...form, difficultyCalibration: v})} label="Difficulty (20%)" />
            <StarRating value={form.originalityScore} onChange={v => setForm({...form, originalityScore: v})} label="Originality (10%)" />
          </div>

          <div className="flex items-center justify-center p-3 rounded-xl bg-accent/10 border border-accent/20">
            <span className="text-sm text-hd-muted mr-3">Overall Quality Score:</span>
            <span className="text-2xl font-bold text-accent">{overallScore.toFixed(1)}/5</span>
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-1">Feedback</label>
            <textarea value={form.feedback} onChange={e => setForm({...form, feedback: e.target.value})} rows={3} placeholder="General feedback..."
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-sm text-hd-muted mb-1">Improvement Notes</label>
            <textarea value={form.improvementNotes} onChange={e => setForm({...form, improvementNotes: e.target.value})} rows={2} placeholder="Specific improvements needed..."
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-hd-border text-hd-muted text-sm hover:bg-hd-hover transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="premium-gradient text-white text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

