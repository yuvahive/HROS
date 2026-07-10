import { useState, useEffect } from 'react';
import { Sparkles, FileCode2, CheckCircle2, Clock, Award, TrendingUp, RefreshCw, Save } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../utils/helpers';

const COLORS = ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-600'];

function getWeekKey(d = new Date()) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - jan1) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getWeekStart(d = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().split('T')[0];
}

export default function WeeklyWrapped() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [allWrapped, setAllWrapped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentWeekKey, setCurrentWeekKey] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await HiveDeskStorage.fetchAll();
      if (!raw) { setLoading(false); return; }
      const questions = Array.isArray(raw.HiveDeskQuestions) ? raw.HiveDeskQuestions : [];
      const reviews = Array.isArray(raw.HiveDeskReviews) ? raw.HiveDeskReviews : [];
      const workLogs = Array.isArray(raw.HiveDeskWorkLogs) ? raw.HiveDeskWorkLogs : [];
      const checkIns = Array.isArray(raw.HiveDeskCheckIns) ? raw.HiveDeskCheckIns : [];

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const myQuestions = questions.filter(q => q.creatorId === currentUser?.id && q.createdAt >= weekAgo);
      const myReviews = reviews.filter(r => r.reviewerId === currentUser?.id && r.createdAt >= weekAgo);
      const myLogs = workLogs.filter(w => (w.personId === currentUser?.id || w.personName === currentUser?.name) && w.date >= weekAgo.split('T')[0]);
      const myCheckIns = checkIns.filter(c => c.personId === currentUser?.id && c.createdAt >= weekAgo);

      const published = myQuestions.filter(q => q.status === 'published').length;
      const reviewed = myReviews.filter(r => r.status === 'completed').length;
      const hoursLogged = myLogs.reduce((s, w) => s + (Number(w.hoursWorked) || 0), 0);
      const checkInCount = myCheckIns.length;
      const totalCreated = myQuestions.length;

      const prevWeek = new Date(Date.now() - 14 * 86400000).toISOString();
      const prevQuestions = questions.filter(q => q.creatorId === currentUser?.id && q.createdAt >= prevWeek && q.createdAt < weekAgo);
      const prevPublished = prevQuestions.filter(q => q.status === 'published').length;
      const growth = prevPublished > 0 ? Math.round(((published - prevPublished) / prevPublished) * 100) : published > 0 ? 100 : 0;

      setData({ published, reviewed, hoursLogged, checkInCount, totalCreated, growth });

      const wrapped = await HiveDeskStorage.getAll('HiveDeskWrapped');
      const wrappedList = Array.isArray(wrapped) ? wrapped : [];
      setAllWrapped(wrappedList.sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf)));

      const wk = getWeekKey();
      setCurrentWeekKey(wk);
      const existing = wrappedList.find(w => w.weekKey === wk && w.userId === currentUser?.id);
      if (existing) setHasSaved(true);

      setLoading(false);
    })();
  }, []);

  const saveWrapped = async () => {
    if (!data || !currentUser) return;
    setSaving(true);
    try {
      await HiveDeskStorage.insert('HiveDeskWrapped', {
        userId: currentUser.id,
        userName: currentUser.name,
        weekKey: currentWeekKey,
        weekOf: getWeekStart(),
        published: data.published,
        reviewed: data.reviewed,
        hoursLogged: Number(data.hoursLogged.toFixed(1)),
        checkInCount: data.checkInCount,
        totalCreated: data.totalCreated,
        growth: data.growth,
        createdAt: new Date().toISOString(),
      });
      setHasSaved(true);
    } catch (e) {
      console.error('Failed to save wrapped:', e);
    }
    setSaving(false);
  };

  if (loading) return <div className="card p-12 text-center"><Sparkles className="w-10 h-10 mx-auto text-hd-muted/30 mb-3 animate-pulse" /><p className="text-sm text-hd-muted">Crunching your weekly numbers...</p></div>;

  const metrics = data ? [
    { label: 'Published', value: data.published, icon: FileCode2, color: 'text-emerald-400' },
    { label: 'Reviews Done', value: data.reviewed, icon: CheckCircle2, color: 'text-blue-400' },
    { label: 'Hours Logged', value: data.hoursLogged.toFixed(1), icon: Clock, color: 'text-amber-400' },
    { label: 'Check-Ins', value: data.checkInCount, icon: Award, color: 'text-pink-400' },
    { label: 'Growth', value: `${data.growth > 0 ? '+' : ''}${data.growth}%`, icon: TrendingUp, color: data.growth >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Weekly Wrapped
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{formatDate(new Date())}</span>
        </div>
        {data && !hasSaved && (
          <button onClick={saveWrapped} disabled={saving}
            className="accent-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:opacity-90 transition-opacity">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save This Week'}
          </button>
        )}
        {hasSaved && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>
        )}
      </div>

      {data && (
        <div className="card p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-hd-text">Your Week in Review</h3>
              <p className="text-sm text-hd-muted">{currentUser?.name} · Week of {getWeekStart()}</p>
            </div>
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className={`text-center p-4 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} bg-opacity-10`}>
                <m.icon className={`w-6 h-6 mx-auto mb-2 ${m.color}`} />
                <p className="text-2xl font-black text-hd-text">{m.value}</p>
                <p className="text-[10px] text-hd-secondary uppercase tracking-wider mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          {data.totalCreated > data.published && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400">You have <strong>{data.totalCreated - data.published}</strong> questions still in pipeline. Keep pushing!</p>
            </div>
          )}
        </div>
      )}

      {allWrapped.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-hd-text mb-3">Previous Weeks</h3>
          <div className="space-y-2">
            {allWrapped.slice(0, 8).map((w, i) => (
              <div key={w.id || i} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-hd-secondary">Week of {formatDate(w.weekOf)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-hd-muted">
                  <span>{w.published || 0} published</span>
                  <span>{w.reviewed || 0} reviews</span>
                  <span>{w.hoursLogged || 0}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
