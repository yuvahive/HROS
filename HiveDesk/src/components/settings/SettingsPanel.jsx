import { useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Target, Gauge, Rocket, Globe, Layout, Lock } from 'lucide-react';
import { useConfig } from '../../config/ConfigContext';
import { useRBAC } from '../../auth/RBAC';

const CATEGORY_ICONS = {
  targets: Target,
  quality: Gauge,
  sprint: Rocket,
  domains: Globe,
  ui: Layout,
  permissions: Shield,
};

const CATEGORY_LABELS = {
  targets: 'Targets',
  quality: 'Quality Weights',
  sprint: 'Sprint',
  domains: 'Domains',
  ui: 'UI',
  permissions: 'Permissions',
};

export default function SettingsPanel() {
  const { configRows, loading, refresh, updateValue } = useConfig();
  const { isAdmin } = useRBAC();
  const [activeTab, setActiveTab] = useState('targets');
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = [...new Set(configRows.map(r => r.category))];
  const filtered = configRows.filter(r => r.category === activeTab);

  const handleEdit = (key, value) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(editValues)) {
      await updateValue(key, value);
    }
    setEditValues({});
    setSaving(false);
  };

  const hasChanges = Object.keys(editValues).length > 0;

  if (!isAdmin) {
    return (
      <div className="card p-12 text-center">
        <Lock className="w-10 h-10 mx-auto text-hd-muted/30 mb-3" />
        <h3 className="text-sm font-semibold text-hd-text mb-1">Access Restricted</h3>
        <p className="text-xs text-hd-muted">Only admins can modify system settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Settings className="w-5 h-5 text-hd-muted" /> System Settings
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="card px-3 py-1.5 text-xs text-hd-muted hover:text-hd-text flex items-center gap-1.5 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {hasChanges && (
            <button onClick={handleSave} disabled={saving} className="accent-gradient text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:opacity-90 transition-opacity">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : `Save (${Object.keys(editValues).length})`}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat] || Settings;
          return (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === cat ? 'bg-indigo-500/15 text-indigo-400' : 'text-hd-muted hover:bg-hd-hover'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {CATEGORY_LABELS[cat] || cat}
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-hd-border">
          {filtered.map(row => (
            <div key={row.key} className="flex items-center gap-4 px-4 py-3 hover:bg-hd-surface/[0.02] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-hd-text">{row.description || row.key}</p>
                <p className="text-[10px] text-hd-muted font-mono mt-0.5">{row.key}</p>
              </div>
              <div className="w-56 flex-shrink-0">
                {row.type === 'boolean' ? (
                  <select value={editValues[row.key] !== undefined ? editValues[row.key] : row.value}
                    onChange={e => handleEdit(row.key, e.target.value)}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-1.5 text-xs text-hd-secondary outline-none focus:border-indigo-500/50">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <input type={row.type === 'number' ? 'number' : 'text'}
                    value={editValues[row.key] !== undefined ? editValues[row.key] : row.value}
                    onChange={e => handleEdit(row.key, e.target.value)}
                    className="w-full bg-hd-surface border border-hd-border rounded-lg px-3 py-1.5 text-xs text-hd-secondary outline-none focus:border-indigo-500/50 font-mono" />
                )}
              </div>
              <span className="text-[9px] text-hd-muted uppercase w-12 text-right">{row.type}</span>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="p-12 text-center text-hd-muted text-xs">No settings in this category</div>
          )}
        </div>
      </div>
    </div>
  );
}

