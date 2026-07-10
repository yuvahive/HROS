import { useState, useEffect } from 'react';
import { Heart, Send, X, ThumbsUp, MessageCircle } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useNotifications } from '../../auth/Notifications';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { formatDate } from '../../utils/helpers';

export default function KudosBoard() {
  const { currentUser } = useAuth();
  const { notify } = useNotifications();
  const refreshSignal = useRefreshSignal();
  const [kudos, setKudos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ to: '', message: '' });

  const load = async () => {
    const raw = await HiveDeskStorage.fetchAll();
    const k = Array.isArray(raw?.HiveDeskKudos) ? raw.HiveDeskKudos : [];
    const u = Array.isArray(raw?.HiveDeskUsers) ? raw.HiveDeskUsers : [];
    setKudos(k.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setUsers(u.filter(u => u.isActive === 'true' || u.isActive === true));
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const handleSend = async () => {
    if (!form.to || !form.message) return;
    const kudo = {
      id: `kudo-${Date.now()}`,
      from: currentUser?.name || 'Anonymous',
      fromId: currentUser?.id,
      to: form.to,
      message: form.message,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    await HiveDeskStorage.insert('HiveDeskKudos', kudo);
    const recipient = users.find(u => u.name === form.to);
    if (recipient?.id) {
      notify({
        userId: recipient.id,
        type: 'kudos',
        title: 'Kudos Received',
        message: `${currentUser?.name} gave you kudos: "${form.message}"`,
        resourceType: 'kudos',
        fromUserId: currentUser?.id,
        fromUserName: currentUser?.name,
        link: 'kudos'
      });
    }
    setForm({ to: '', message: '' });
    setShowForm(false);
    load();
  };

  const handleLike = async (kudo) => {
    const hasLiked = (kudo.likedBy || []).includes(currentUser?.id);
    const updated = {
      ...kudo,
      likes: hasLiked ? (kudo.likes || 1) - 1 : (kudo.likes || 0) + 1,
      likedBy: hasLiked
        ? (kudo.likedBy || []).filter(id => id !== currentUser?.id)
        : [...(kudo.likedBy || []), currentUser?.id],
    };
    await HiveDeskStorage.update('HiveDeskKudos', kudo.id, updated);
    load();
  };

  const myKudos = kudos.filter(k => k.from === currentUser?.name || k.to === currentUser?.name);
  const recentKudos = kudos.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" /> Kudos Board
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{kudos.length} kudos</span>
        </div>
        <button onClick={() => setShowForm(true)} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
          <Heart className="w-4 h-4" /> Send Kudos
        </button>
      </div>

      {kudos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentKudos.map(k => (
            <div key={k.id} className="card p-4 border border-pink-500/10 bg-gradient-to-br from-pink-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-hd-text font-bold text-xs">
                  {k.from?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-hd-text">{k.from}</p>
                  <p className="text-[10px] text-pink-400">→ {k.to}</p>
                </div>
                <Heart className="w-4 h-4 text-pink-400 ml-auto" fill="#f472b6" />
              </div>
              <p className="text-sm text-hd-secondary line-clamp-3">{k.message}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-hd-border">
                <button onClick={() => handleLike(k)} className="flex items-center gap-1 text-xs text-hd-muted hover:text-pink-400 transition-colors">
                  <ThumbsUp className={`w-3 h-3 ${(k.likedBy || []).includes(currentUser?.id) ? 'fill-pink-400 text-pink-400' : ''}`} />
                  {k.likes || 0}
                </button>
                <span className="text-[10px] text-hd-muted">{formatDate(k.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {myKudos.length > 0 && (
        <div className="card p-4 border border-indigo-500/10">
          <h3 className="text-sm font-semibold text-hd-text mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-indigo-400" /> Your Kudos
          </h3>
          <div className="space-y-2">
            {myKudos.slice(0, 5).map(k => (
              <div key={k.id} className="flex items-start gap-3 p-2 rounded-lg bg-hd-surface/[0.02]">
                <Heart className={`w-4 h-4 mt-0.5 ${k.from === currentUser?.name ? 'text-pink-400' : 'text-indigo-400'}`} />
                <div className="flex-1">
                  <p className="text-xs text-hd-secondary">
                    <span className="font-semibold text-hd-text">{k.from}</span>
                    {k.from === currentUser?.name ? ' thanked ' : ' received from '}
                    <span className="font-semibold text-hd-text">{k.from === currentUser?.name ? k.to : k.from}</span>
                  </p>
                  <p className="text-[11px] text-hd-muted mt-0.5 line-clamp-1">{k.message}</p>
                </div>
                <span className="text-[10px] text-hd-muted">{formatDate(k.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {kudos.map(k => (
          <div key={k.id} className="card card-hover p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-hd-text font-bold text-sm flex-shrink-0">
                {k.from?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-hd-text">{k.from}</span>
                  <Heart className="w-3 h-3 text-pink-400" fill="#f472b6" />
                  <span className="text-sm text-pink-400">→ {k.to}</span>
                  <span className="text-[10px] text-hd-muted ml-auto">{formatDate(k.createdAt)}</span>
                </div>
                <p className="text-sm text-hd-secondary">{k.message}</p>
              </div>
              <button onClick={() => handleLike(k)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hd-surface/[0.03] hover:bg-hd-surface/[0.06] transition-colors flex-shrink-0">
                <ThumbsUp className={`w-4 h-4 ${(k.likedBy || []).includes(currentUser?.id) ? 'fill-pink-400 text-pink-400' : 'text-hd-muted'}`} />
                <span className="text-xs font-medium text-hd-muted">{k.likes || 0}</span>
              </button>
            </div>
          </div>
        ))}
        {kudos.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <Heart className="w-10 h-10 mx-auto text-pink-500/30 mb-3" />
            <p className="text-sm text-hd-muted">No kudos yet</p>
            <p className="text-xs text-hd-muted/60 mt-1">Be the first to appreciate a teammate!</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-hd-text flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" /> Send Kudos
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-hd-muted mb-1">To</label>
                <select value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                  className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-pink-500/50 transition-colors">
                  <option value="">Select a teammate...</option>
                  {users.filter(u => u.name !== currentUser?.name).map(u => (
                    <option key={u.id} value={u.Name || u.name}>{u.Name || u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-hd-muted mb-1">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3}
                  placeholder="What would you like to thank them for?"
                  className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-pink-500/50 transition-colors resize-none" />
              </div>
              <button onClick={handleSend} disabled={!form.to || !form.message}
                className="w-full accent-gradient text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" /> Send Kudos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

