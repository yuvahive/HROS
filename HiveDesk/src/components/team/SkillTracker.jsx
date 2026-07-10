import { useState, useEffect } from 'react';
import { BookOpen, Plus, X, CheckCircle2, Target } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useRefreshSignal } from '../../auth/RefreshContext';

const ALL_SKILLS = [
  'React', 'Node.js', 'Python', 'SQL', 'TypeScript', 'System Design', 'DSA', 'DevOps',
  'Machine Learning', 'Docker', 'Kubernetes', 'GraphQL', 'AWS', 'Testing', 'Git',
  'REST APIs', 'CSS/Tailwind', 'MongoDB', 'PostgreSQL', 'Redis', 'CI/CD',
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-slate-500/10 text-slate-400' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-500/10 text-blue-400' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-500/10 text-purple-400' },
  { value: 'expert', label: 'Expert', color: 'bg-amber-500/10 text-amber-400' },
];

export default function SkillTracker() {
  const { currentUser } = useAuth();
  const refreshSignal = useRefreshSignal();
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('intermediate');

  const load = async () => {
    const raw = await HiveDeskStorage.fetchAll();
    if (!raw) { setLoading(false); return; }
    const allSkills = Array.isArray(raw.HiveDeskSkills) ? raw.HiveDeskSkills : [];
    const u = Array.isArray(raw.HiveDeskUsers) ? raw.HiveDeskUsers : [];
    setSkills(allSkills);
    setUsers(u.filter(u => u.isActive === 'true' || u.isActive === true));
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const mySkills = skills.filter(s => s.personId === currentUser?.id);

  const handleAdd = async () => {
    if (!newSkill) return;
    const entry = { id: `skill-${Date.now()}`, personId: currentUser?.id, personName: currentUser?.name, skill: newSkill, level: newLevel, createdAt: new Date().toISOString() };
    await HiveDeskStorage.insert('HiveDeskSkills', entry);
    setNewSkill('');
    setNewLevel('intermediate');
    setShowForm(false);
    load();
  };

  const handleRemove = async (id) => {
    await HiveDeskStorage.remove('HiveDeskSkills', id);
    load();
  };

  const skillGaps = ALL_SKILLS.filter(skill => {
    const count = skills.filter(s => s.skill === skill).length;
    const activeCount = users.length;
    return count < Math.ceil(activeCount * 0.4) && count > 0;
  });

  if (loading) return <div className="card p-12 text-center"><BookOpen className="w-10 h-10 mx-auto text-hd-muted/30 mb-3 animate-pulse" /><p className="text-sm text-hd-muted">Loading skills...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Skill Tracker
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{skills.length} skills tracked</span>
        </div>
        <button onClick={() => setShowForm(true)} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {skillGaps.length > 0 && (
        <div className="card p-4 border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent">
          <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1 mb-2"><Target className="w-3 h-3" /> Skill Gaps Detected</h3>
          <div className="flex flex-wrap gap-1.5">
            {skillGaps.map(s => (
              <span key={s} className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">{s}</span>
            ))}
          </div>
          <p className="text-[10px] text-hd-muted mt-1">Fewer than 40% of team members have these skills</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-hd-text mb-3">Your Skills</h3>
          {mySkills.length === 0 ? (
            <p className="text-xs text-hd-muted text-center py-6">No skills added yet. Click "Add Skill" to get started.</p>
          ) : (
            <div className="space-y-2">
              {mySkills.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-hd-surface/[0.02] group">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-hd-text">{s.skill}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${LEVELS.find(l => l.value === s.level)?.color || ''}`}>{s.level}</span>
                  </div>
                  <button onClick={() => handleRemove(s.id)} className="text-[10px] text-hd-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-hd-text mb-3">Team Skills Matrix</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {ALL_SKILLS.filter(s => skills.some(sk => sk.skill === s)).map(skill => {
              const people = skills.filter(s => s.skill === skill);
              return (
                <div key={skill} className="p-2 rounded-lg bg-hd-surface/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-hd-text">{skill}</span>
                    <span className="text-[10px] text-hd-muted">{people.length} member{people.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {people.map(p => (
                      <span key={p.id} className="text-[9px] px-1.5 py-0.5 rounded bg-hd-raised text-hd-muted">{p.personName}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-hd-text flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-400" /> Add Skill</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-hd-hover"><X className="w-5 h-5 text-hd-muted" /></button>
            </div>
            <div className="space-y-4">
              <select value={newSkill} onChange={e => setNewSkill(e.target.value)}
                className="w-full bg-hd-surface border border-hd-border rounded-xl px-4 py-2.5 text-sm text-hd-text outline-none focus:border-cyan-500/50">
                <option value="">Select a skill...</option>
                {ALL_SKILLS.filter(s => !mySkills.find(m => m.skill === s)).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-2">
                {LEVELS.map(l => (
                  <button key={l.value} onClick={() => setNewLevel(l.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                      newLevel === l.value ? 'border-accent bg-accent/10 text-accent' : 'border-hd-border text-hd-muted hover:bg-hd-hover'
                    }`}>{l.label}</button>
                ))}
              </div>
              <button onClick={handleAdd} disabled={!newSkill} className="w-full accent-gradient text-white font-semibold disabled:opacity-50">
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

