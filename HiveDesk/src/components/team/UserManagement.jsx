import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, Shield, Search, X, Save, Briefcase, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';
import { useRBAC } from '../../auth/RBAC';
import { useRefreshSignal } from '../../auth/RefreshContext';
import { getInitials, generateId } from '../../utils/helpers';

const ROLE_BADGES = {
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  lead: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  curator: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const AVATAR_COLORS = [
  'from-blue-600 to-blue-700', 'from-purple-600 to-purple-700',
  'from-emerald-600 to-emerald-700', 'from-amber-600 to-amber-700',
  'from-rose-600 to-rose-700', 'from-cyan-600 to-cyan-700',
  'from-indigo-600 to-indigo-700', 'from-teal-600 to-teal-700',
];

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'curator', domain: '',
  weeklyTargetQuestions: '5', weeklyTargetReviews: '5', isActive: 'true',
};

export default function UserManagement() {
  const { currentUser, addUser, updateUser, deleteUser } = useAuth();
  const { isAdmin } = useRBAC();
  const refreshSignal = useRefreshSignal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await HiveDeskStorage.getAll('HiveDeskUsers');
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshSignal]);

  const filtered = users.filter(u => {
    if (filterRole && u.role !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.domain || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q);
    }
    return true;
  });

  const roleCounts = {};
  users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

  const openAdd = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'curator',
      domain: u.domain || '',
      weeklyTargetQuestions: u.weeklyTargetQuestions || '5',
      weeklyTargetReviews: u.weeklyTargetReviews || '5',
      isActive: (u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE') ? 'true' : 'false',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingUser) {
        const updates = { ...form };
        if (!updates.password) delete updates.password;
        if (updates.isActive !== undefined) updates.isActive = updates.isActive === 'true';
        await HiveDeskStorage.update('HiveDeskUsers', editingUser.id, updates);
        await updateUser(editingUser.id, updates);
      } else {
        if (!form.password) {
          setFormError('Password is required for new users');
          setFormLoading(false);
          return;
        }
        const newUser = {
          id: generateId('USR'),
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          domain: form.domain,
          weeklyTargetQuestions: form.weeklyTargetQuestions,
          weeklyTargetReviews: form.weeklyTargetReviews,
          isActive: form.isActive === 'true',
          createdAt: new Date().toISOString(),
        };
        await addUser(newUser);
      }
      setShowForm(false);
      setEditingUser(null);
      load();
    } catch (e) { setFormError(e.message || 'Save failed'); }
    setFormLoading(false);
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser?.id) return;
    await HiveDeskStorage.remove('HiveDeskUsers', u.id);
    await deleteUser(u.id);
    setConfirmDelete(null);
    load();
  };

  const toggleActive = async (u) => {
    const newActive = !(u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE');
    await HiveDeskStorage.update('HiveDeskUsers', u.id, { isActive: newActive });
    load();
  };

  if (!isAdmin) {
    return (
      <div className="card p-12 text-center">
        <Shield className="w-10 h-10 mx-auto text-hd-muted/30 mb-3" />
        <h3 className="text-sm font-semibold text-hd-text mb-1">Admin Only</h3>
        <p className="text-xs text-hd-muted">User management is restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> User Management
          </h2>
          <span className="text-xs text-hd-muted bg-hd-surface/[0.05] px-2 py-0.5 rounded-full">{users.length} users</span>
        </div>
        <button onClick={openAdd} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => setFilterRole('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterRole ? 'bg-indigo-500/15 text-indigo-400' : 'text-hd-muted hover:bg-hd-hover'}`}>
          All ({users.length})
        </button>
        {['admin', 'lead', 'curator'].map(r => (
          <button key={r} onClick={() => setFilterRole(filterRole === r ? '' : r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterRole === r ? 'bg-indigo-500/15 text-indigo-400' : 'text-hd-muted hover:bg-hd-hover'}`}>
            {r} ({roleCounts[r] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-hd-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search by name, email, domain, or role..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-hd-surface border border-hd-border rounded-lg pl-9 pr-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50 transition-colors" />
        {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-hd-muted hover:text-hd-text"><X className="w-4 h-4" /></button>}
      </div>

      {/* User List */}
      <div className="space-y-2">
        {filtered.map((u, i) => {
          const isActive = u.isActive === true || u.isActive === 'true' || u.isActive === 'TRUE';
          const isSelf = u.id === currentUser?.id;
          return (
            <div key={u.id || i} className={`card card-hover p-4 ${!isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-hd-text ring-1 ring-hd-border flex-shrink-0`}>
                  {getInitials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-hd-text truncate">{u.name}</p>
                    {isSelf && <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px]">You</span>}
                    {!isActive && <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-[9px]">Inactive</span>}
                  </div>
                  <p className="text-[11px] text-hd-muted truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {u.domain && <span className="text-[11px] text-hd-muted hidden md:flex items-center gap-1"><Briefcase className="w-3 h-3" /> {u.domain}</span>}
                  <span className={`badge border capitalize ${ROLE_BADGES[u.role] || ROLE_BADGES.curator}`}>{u.role}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(u)} className="p-1.5 rounded-md hover:bg-hd-hover transition-colors" title={isActive ? 'Deactivate' : 'Activate'}>
                    {isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-hd-muted" />}
                  </button>
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-hd-hover text-hd-muted hover:text-indigo-400 transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!isSelf && (
                    <button onClick={() => setConfirmDelete(u)} className="p-1.5 rounded-md hover:bg-red-500/10 text-hd-muted hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 ml-15 text-[11px] text-hd-muted">
                <span>Target: {u.weeklyTargetQuestions || '—'}/wk create</span>
                <span>{u.weeklyTargetReviews || '—'}/wk review</span>
                {u.createdAt && <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <Users className="w-8 h-8 mx-auto text-hd-muted/30 mb-2" />
            <p className="text-sm text-hd-muted">No users found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-hd-text">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => { setShowForm(false); setEditingUser(null); }} className="p-1.5 rounded-md hover:bg-hd-hover text-hd-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{formError}</div>}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">{editingUser ? 'New Password (blank = keep)' : 'Password *'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editingUser}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Role *</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50">
                    <option value="curator">Curator</option>
                    <option value="lead">Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Domain</label>
                <input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})}
                  placeholder="e.g. DSA, Fullstack, DevOps"
                  className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text placeholder-hd-muted outline-none focus:border-indigo-500/50" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Target Create/wk</label>
                  <input type="number" min="0" value={form.weeklyTargetQuestions} onChange={e => setForm({...form, weeklyTargetQuestions: e.target.value})}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Target Review/wk</label>
                  <input type="number" min="0" value={form.weeklyTargetReviews} onChange={e => setForm({...form, weeklyTargetReviews: e.target.value})}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-[11px] text-hd-muted uppercase tracking-wider mb-1">Status</label>
                  <select value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value})}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-2 text-sm text-hd-text outline-none focus:border-indigo-500/50">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-hd-border">
                <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="px-4 py-2 rounded-lg border border-hd-border text-xs text-hd-muted hover:bg-hd-hover transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading} className="accent-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2">
                  <Save className="w-4 h-4" /> {formLoading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-hd-text mb-1">Delete User</h3>
              <p className="text-xs text-hd-muted mb-4">Remove <strong className="text-hd-text">{confirmDelete.name}</strong> from the team? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-lg border border-hd-border text-xs text-hd-muted hover:bg-hd-hover">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold border border-red-500/20 hover:bg-red-500/25">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

