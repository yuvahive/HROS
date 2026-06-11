import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { formatDateTime, getInitials } from '../../utils/helpers';

export default function QuestionComments({ questionId, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await HiveDeskStorage.getAll('HiveDeskLogs');
    const qComments = all.filter(l =>
      l.resource === 'HiveDeskQuestions' &&
      l.resourceId === questionId &&
      l.action === 'comment'
    );
    qComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setComments(qComments);
    setLoading(false);
  };

  useEffect(() => { if (questionId) load(); }, [questionId]);

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;
    setSending(true);
    try {
      await HiveDeskStorage.insert('HiveDeskLogs', {
        userId: user.id,
        userName: user.name,
        action: 'comment',
        resource: 'HiveDeskQuestions',
        resourceId: questionId,
        details: JSON.stringify({ text: newComment.trim() }),
        timestamp: new Date().toISOString(),
      });
      setNewComment('');
      load();
    } catch (e) { console.error('[HiveDesk] Comment failed:', e); }
    setSending(false);
  };

  const handleDelete = async (commentId) => {
    await HiveDeskStorage.remove('HiveDeskLogs', commentId);
    load();
  };

  const parseComment = (details) => {
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      return parsed?.text || details || '';
    } catch { return details || ''; }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-hd-text">Discussion</h3>
        <span className="text-[10px] text-hd-muted bg-hd-surface/[0.05] px-1.5 py-0.5 rounded-full">{comments.length}</span>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {comments.length === 0 && !loading && (
          <div className="py-8 text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
            <p className="text-xs text-hd-muted">No comments yet. Start the discussion.</p>
          </div>
        )}
        {comments.map((c, i) => {
          const isOwn = c.userId === user?.id;
          const text = parseComment(c.details);
          return (
            <div key={c.id || i} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-[9px] font-bold text-hd-secondary ring-1 ring-hd-border flex-shrink-0">
                {getInitials(c.userName)}
              </div>
              <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[85%] ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    {!isOwn && <span className="text-[11px] font-medium text-hd-secondary">{c.userName}</span>}
                    <span className="text-[9px] text-hd-muted">{formatDateTime(c.timestamp)}</span>
                  </div>
                  <div className={`inline-block px-3 py-2 rounded-xl text-[13px] text-left ${isOwn ? 'bg-indigo-500/15 text-indigo-100 rounded-tr-sm' : 'bg-hd-surface/[0.05] text-hd-text rounded-tl-sm'}`}>
                    {text}
                  </div>
                </div>
                {isOwn && (
                  <button onClick={() => handleDelete(c.id)} className="p-1 rounded-md hover:bg-red-500/10 text-hd-muted hover:text-red-400 transition-colors ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-hd-border">
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a comment..."
          className="flex-1 bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 transition-colors"
        />
        <button onClick={handleSend} disabled={!newComment.trim() || sending}
          className="p-2 rounded-lg bg-indigo-500 text-hd-text disabled:opacity-30 hover:bg-indigo-600 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
