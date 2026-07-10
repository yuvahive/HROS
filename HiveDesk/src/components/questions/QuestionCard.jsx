import { useState } from 'react';
import { X, CheckCircle2, Code2, FileText, Lightbulb, AlertTriangle, MessageSquare } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import QuestionComments from './QuestionComments';

export default function QuestionCard({ question, onClose }) {
  const [tab, setTab] = useState('overview');
  if (!question) return null;

  const statusColor = {
    published: 'bg-emerald-500/10 text-emerald-400',
    'in-review': 'bg-amber-500/10 text-amber-400',
    'needs-revision': 'bg-red-500/10 text-red-400',
    draft: 'bg-gray-500/10 text-hd-muted',
    approved: 'bg-blue-500/10 text-blue-400',
    rejected: 'bg-red-500/10 text-red-400',
  }[question.status] || 'bg-gray-500/10 text-hd-muted';

  const diffColor = {
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-red-400',
  }[question.difficulty] || 'text-hd-muted';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'content', label: 'Content', icon: Code2 },
    { id: 'meta', label: 'Metadata', icon: AlertTriangle },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-accent">{question.prefix || question.id?.slice(0, 10)}</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColor}`}>{question.status}</span>
            <span className={`text-xs font-semibold ${diffColor}`}>{question.difficulty}</span>
            {question.priority && (
              <span className={`text-[10px] font-semibold uppercase ${question.priority === 'high' ? 'text-red-400' : question.priority === 'medium' ? 'text-amber-400' : 'text-hd-muted'}`}>
                {question.priority}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-hd-hover transition-colors"><X className="w-5 h-5 text-hd-muted" /></button>
        </div>

        <h3 className="text-xl font-bold mb-1">{question.title}</h3>
        <div className="flex items-center gap-3 text-xs text-hd-muted mb-4">
          <span>{question.domain}{question.topic ? ` > ${question.topic}` : ''}</span>
          <span>·</span>
          <span>by {question.creatorName || '—'}</span>
          {question.assigneeName && <><span>·</span><span className="text-indigo-400">assigned to {question.assigneeName}</span></>}
          <span>·</span>
          <span>{formatDate(question.createdAt)}</span>
        </div>

        <div className="flex gap-1 mb-6 border-b border-hd-border pb-2">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id ? 'bg-accent/10 text-accent' : 'text-hd-muted hover:text-hd-secondary'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Quality Score', value: question.qualityScore ? `${Number(question.qualityScore).toFixed(1)}/5` : '—' },
                { label: 'Completion Rate', value: question.completionRate ? `${question.completionRate}%` : '—' },
                { label: 'Submissions', value: question.submissions || '0' },
              ].map(s => (
                <div key={s.label} className="bg-hd-raised rounded-xl p-3 text-center">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-hd-muted uppercase">{s.label}</p>
                </div>
              ))}
            </div>

            {question.tags && (
              <div>
                <p className="text-xs text-hd-muted mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {question.tags.split(',').map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-hd-raised text-xs text-hd-muted">{t.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'content' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-hd-raised border border-hd-border">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-hd-secondary">Problem Statement</span>
              </div>
              <p className="text-sm text-hd-muted whitespace-pre-wrap">{question.problemStatement || question.notes || 'No problem statement added yet. Edit this question to add one.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-hd-raised border border-hd-border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-hd-secondary">Starter Code</span>
                </div>
                <pre className="text-xs text-hd-muted bg-hd-raised border border-hd-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                  {question.starterCode || '// Starter code will appear here'}
                </pre>
              </div>
              <div className="p-4 rounded-xl bg-hd-raised border border-hd-border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-hd-secondary">Solution</span>
                </div>
                <pre className="text-xs text-hd-muted bg-hd-raised border border-hd-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                  {question.solutionCode || '// Solution code will appear here'}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-hd-raised border border-hd-border">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-hd-secondary">Hints ({question.hintsCount || 0})</span>
              </div>
              <div className="space-y-2">
                {Array.from({ length: Number(question.hintsCount) || 0 }).map((_, i) => (
                  <div key={i} className="text-xs text-hd-muted bg-hd-raised border border-hd-border rounded-lg p-2">
                    <span className="font-semibold text-hd-muted">Hint {i + 1}:</span> Click to reveal
                  </div>
                ))}
                {!question.hintsCount && <p className="text-xs text-hd-muted">No hints added yet</p>}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-hd-raised border border-hd-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-hd-secondary">Pseudo Code</span>
              </div>
              <pre className="text-xs text-hd-muted bg-hd-raised border border-hd-border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {question.pseudoCode || '// Pseudo code will appear here'}
              </pre>
            </div>
          </div>
        )}

        {tab === 'meta' && (
          <div className="space-y-4">
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-hd-secondary">Content Checklist</h4>
              {[
                { label: 'Starter Code', value: question.hasStarterCode },
                { label: 'Solution', value: question.hasSolution },
                { label: 'Pseudo Code', value: question.hasPseudoCode },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.value === 'true' || item.value === true ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-hd-border" />
                  )}
                  <span className={item.value === 'true' ? 'text-hd-text' : 'text-hd-muted'}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-hd-muted">Test Cases:</span> <span className="text-hd-text">{question.testCasesCount || '—'}</span></div>
              <div><span className="text-hd-muted">Prefix:</span> <span className="text-hd-text font-mono">{question.prefix || '—'}</span></div>
              <div><span className="text-hd-muted">Created:</span> <span className="text-hd-text">{formatDate(question.createdAt)}</span></div>
              <div><span className="text-hd-muted">Reviewed:</span> <span className="text-hd-text">{formatDate(question.reviewedAt)}</span></div>
              <div><span className="text-hd-muted">Published:</span> <span className="text-hd-text">{formatDate(question.publishedAt)}</span></div>
              <div><span className="text-hd-muted">Quality Tier:</span> <span className="text-hd-text capitalize">{question.qualityTier || '—'}</span></div>
              {question.assigneeName && <div><span className="text-hd-muted">Assigned to:</span> <span className="text-indigo-400">{question.assigneeName}</span></div>}
              {question.dueDate && <div><span className="text-hd-muted">Due Date:</span> <span className="text-hd-text">{formatDate(question.dueDate)}</span></div>}
            </div>
          </div>
        )}

        {tab === 'discussion' && (
          <div className="h-[400px]">
            <QuestionComments questionId={question.id} />
          </div>
        )}
      </div>
    </div>
  );
}
