import { createContext, useContext, useState, useEffect } from 'react';
import { loadConfig, updateConfigValue, getAllConfigRows } from '../services/configService';
import { useAuth } from '../auth/AuthContext';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({});
  const [configRows, setConfigRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refresh = async () => {
    setLoading(true);
    try {
      const cfg = await loadConfig();
      setConfig(cfg);
      const rows = await getAllConfigRows();
      setConfigRows(rows);
    } catch (e) { console.error('Config load failed:', e); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const updateValue = async (key, value) => {
    const res = await updateConfigValue(key, value, user?.name || 'unknown');
    if (res.success) {
      setConfig(prev => ({ ...prev, [key]: value }));
      setConfigRows(prev => prev.map(r => r.key === key ? { ...r, value: String(value) } : r));
    }
    return res;
  };

  const getVal = (key, fallback) => {
    const v = config[key];
    return v !== undefined && v !== null && v !== '' ? v : fallback;
  };

  return (
    <ConfigContext.Provider value={{ config, configRows, loading, refresh, updateValue, getVal }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
