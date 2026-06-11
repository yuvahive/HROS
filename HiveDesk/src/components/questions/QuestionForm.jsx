import React, { useState } from 'react';
import { X, Save, Plus, ChevronDown, ChevronUp, Code2, FileText, Lightbulb } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useConfig } from '../../config/ConfigContext';
import { useNotifications } from '../../auth/Notifications';

export default function QuestionForm({ question, onClose, onSaved }) {
  const { user, users } = useAuth();
  const { getVal } = useConfig();
  const { notify } = useNotifications();
  const dsaDomains = getVal('dsa_domains', []);
  const fsDomains = getVal('fullstack_domains', []);
  const allDomains = [...dsaDomains, ...fsDomains];

  const [form, setForm] = useState({
    title: question?.title || '',
    prefix: question?.prefix || '',
    domain: question?.domain || '',
    topic: question?.topic || '',
    difficulty: question?.difficulty || 'Easy',
    testCasesCount: question?.testCasesCount || '',
    hintsCount: question?.hintsCount || '',
    hasStarterCode: question?.hasStarterCode || 'false',
    hasSolution: question?.hasSolution || 'false',
    hasPseudoCode: question?.hasPseudoCode || 'false',
    tags: question?.tags || '',
    notes: question?.notes || '',
    problemStatement: question?.problemStatement || '',
    starterCode: question?.starterCode || '',
    solutionCode: question?.solutionCode || '',
    pseudoCode: question?.pseudoCode || '',
    assigneeId: question?.assigneeId || '',
    assigneeName: question?.assigneeName || '',
    priority: question?.priority || 'medium',
    dueDate: question?.dueDate || '',
    bountyPoints: question?.bountyPoints || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const assignableUsers = (users || []).filter(u =>
    u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE'
  );

  const handleAssigneeChange = (userId) => {
    const u = assignableUsers.find(x => x.id === userId);
    setForm({ ...form, assigneeId: userId, assigneeName: u?.name || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (question?.id) {
        await HiveDeskStorage.update('HiveDeskQuestions', question.id, form);
        if (form.assigneeId && form.assigneeId !== question.assigneeId) {
          await notify({
            userId: form.assigneeId,
            type: 'assignment',
            title: 'Question Assigned',
            message: `You've been assigned "${form.title || 'Untitled'}" by ${user.name}`,
            resourceId: question.id,
            resourceType: 'question',
            fromUserId: user.id,
            fromUserName: user.name,
            link: 'questions'
          });
        }
      } else {
        const qId = await HiveDeskStorage.getNextQuestionId();
        await HiveDeskStorage.insert('HiveDeskQuestions', {
          ...form,
          id: qId,
          prefix: form.prefix || qId,
          creatorId: user.id,
          creatorName: user.name,
          status: form.assigneeId ? 'assigned' : 'draft',
          qualityScore: 0,
          completionRate: 0,
          rating: 0,
          submissions: 0,
          createdAt: new Date().toISOString(),
        });
        if (form.assigneeId) {
          await notify({
            userId: form.assigneeId,
            type: 'assignment',
            title: 'New Question Assigned',
            message: `${user.name} assigned you "${form.title || 'Untitled'}"`,
            resourceId: qId,
            resourceType: 'question',
            fromUserId: user.id,
            fromUserName: user.name,
            link: 'questions'
          });
        }
      }
      onSaved?.();
      onClose?.();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-hd-text">{question ? 'Edit Question' : 'New Question'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-hd-hover text-hd-muted"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Two Sum, Group Anagrams"
              className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 transition-colors" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Domain *</label>
              <select value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} required
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50">
                <option value="">Select</option>
                {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Topic</label>
              <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder="e.g. Hash Map"
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Test Cases</label>
              <input type="number" min="0" value={form.testCasesCount} onChange={e => setForm({...form, testCasesCount: e.target.value})}
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Hints (0-5)</label>
              <input type="number" min="0" max="5" value={form.hintsCount} onChange={e => setForm({...form, hintsCount: e.target.value})}
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Tags</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="comma-separated"
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Bounty Points</label>
              <input type="number" min="0" value={form.bountyPoints} onChange={e => setForm({...form, bountyPoints: e.target.value})} placeholder="0"
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          {/* Assign To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Assign To</label>
              <select value={form.assigneeId} onChange={e => handleAssigneeChange(e.target.value)}
                className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50">
                <option value="">Unassigned</option>
                {assignableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-4 pb-1">
              {[
                { key: 'hasStarterCode', label: 'Starter' },
                { key: 'hasSolution', label: 'Solution' },
                { key: 'hasPseudoCode', label: 'Pseudo' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-1.5 text-xs text-hd-muted cursor-pointer">
                  <input type="checkbox" checked={form[f.key] === 'true'}
                    onChange={e => setForm({...form, [f.key]: e.target.checked ? 'true' : 'false'})}
                    className="rounded border-hd-border bg-hd-raised accent-indigo-500" />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
              className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 resize-none" />
          </div>

          {/* Advanced Content Toggle */}
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAdvanced ? 'Hide' : 'Show'} Content Editor
          </button>

          {showAdvanced && (
            <div className="space-y-3 p-4 rounded-lg bg-hd-surface/[0.02] border border-hd-border">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] text-hd-muted uppercase tracking-wider mb-1">
                  <FileText className="w-3.5 h-3.5" /> Problem Statement
                </label>
                <textarea value={form.problemStatement} onChange={e => setForm({...form, problemStatement: e.target.value})} rows={4}
                  placeholder="Describe the problem, input/output format, constraints..."
                  className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 resize-none font-mono text-[13px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] text-hd-muted uppercase tracking-wider mb-1">
                    <Code2 className="w-3.5 h-3.5" /> Starter Code
                  </label>
                  <textarea value={form.starterCode} onChange={e => setForm({...form, starterCode: e.target.value})} rows={5}
                    placeholder="function solution() {&#10;  //&#10;}"
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 resize-none font-mono text-[13px]" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] text-hd-muted uppercase tracking-wider mb-1">
                    <Code2 className="w-3.5 h-3.5" /> Solution Code
                  </label>
                  <textarea value={form.solutionCode} onChange={e => setForm({...form, solutionCode: e.target.value})} rows={5}
                    placeholder="function solution() {&#10;  // full solution&#10;}"
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 resize-none font-mono text-[13px]" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] text-hd-muted uppercase tracking-wider mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Pseudo Code
                </label>
                <textarea value={form.pseudoCode} onChange={e => setForm({...form, pseudoCode: e.target.value})} rows={4}
                  placeholder="Step-by-step algorithm..."
                  className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 resize-none font-mono text-[13px]" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-hd-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-hd-border text-xs text-hd-muted hover:bg-hd-hover transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="accent-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : question ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

