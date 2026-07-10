import { createContext, useState, useEffect, useContext } from 'react';
import { HiveDeskStorage } from '../services/HiveDeskStorage';

const AuthContext = createContext();

const USERS_CACHE_KEY = 'hivedesk_cached_users';

const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days

const DEFAULT_ADMIN = {
  id: 'hros-admin-001',
  name: 'Admin',
  email: 'admin@hros.local',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString()
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState('offline');
  const [lastPulse, setLastPulse] = useState(Date.now());
  const [impersonatedRole, setImpersonatedRole] = useState(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('hivedesk_current_user');
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      const loginTime = parsed.loginTime ? new Date(parsed.loginTime).getTime() : 0;
      const now = Date.now();
      if (loginTime && (now - loginTime) > SESSION_TIMEOUT) {
        localStorage.removeItem('hivedesk_current_user');
      } else {
        setCurrentUser(parsed);
      }
    }

    loadFromCloud();

    let heartbeat = null;
    const startHeartbeat = () => {
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = setInterval(() => {
        if (!document.hidden) {
          loadFromCloud(true);
        }
      }, 3000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFromCloud(true);
      }
    };

    startHeartbeat();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadFromCloud = async (isSilent = false) => {
    if (!isSilent) setCloudStatus('syncing');
    console.log('[HiveDesk] GAS_URL:', import.meta.env.VITE_GAS_URL);
    console.log('[HiveDesk] GAS_API_KEY:', import.meta.env.VITE_GAS_API_KEY ? 'set' : 'MISSING');

    try {
      const cloudData = await HiveDeskStorage.fetchAll();

      if (cloudData && cloudData.HiveDeskUsers && cloudData.HiveDeskUsers.length > 0) {
        const cloudUsers = cloudData.HiveDeskUsers;

        setUsers(cloudUsers);
        localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(cloudUsers));

        if (!currentUser) {
          const storedSession = localStorage.getItem('hivedesk_current_user');
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession);
            const validUser = cloudUsers.find(u => u.id === parsedSession.id && u.isActive);
            if (validUser) {
              setCurrentUser(parsedSession);
            } else {
              localStorage.removeItem('hivedesk_current_user');
            }
          }
        }

        setCloudStatus('online');
      } else if (!isSilent) {
        setUsers(() => {
          const cached = localStorage.getItem(USERS_CACHE_KEY);
          const cachedUsers = cached ? JSON.parse(cached) : [];
          if (cachedUsers.length > 0) return cachedUsers;
          const seeded = [DEFAULT_ADMIN];
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(seeded));
          return seeded;
        });
        setCloudStatus('offline');
      }

      if (cloudData && Object.keys(cloudData).length > 0) {
        setLastPulse(Date.now());
      }
    } catch (error) {
      console.error('[HiveDesk] Cloud heartbeat failed:', error);
      if (!isSilent) setCloudStatus('error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const GAS_URL = import.meta.env.VITE_GAS_URL;
      const GAS_API_KEY = import.meta.env.VITE_GAS_API_KEY;
      const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ key: GAS_API_KEY, action: 'login', email, password })
      });
      const result = await response.json();
      if (!result.success) return { success: false, error: result.error };

      const userData = {
        id: result.user.id, email: result.user.email, name: result.user.name,
        role: result.user.role, domain: result.user.domain || '',
        loginTime: new Date().toISOString(),
        sessionToken: result.sessionToken,
        expiresAt: result.expiresAt
      };

      setCurrentUser(userData);
      localStorage.setItem('hivedesk_current_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hivedesk_current_user');
  };

  const addUser = async (userData) => {
    if (users.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      return { success: false, error: 'User already exists' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await HiveDeskStorage.insert('HiveDeskUsers', newUser);
    return { success: true, user: newUser };
  };

  const updateUser = async (userId, updates) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updatedUsers);
    await HiveDeskStorage.update('HiveDeskUsers', userId, updates);

    if (currentUser?.id === userId) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem('hivedesk_current_user', JSON.stringify(updated));
    }
    return { success: true };
  };

  const deleteUser = async (userId) => {
    if (userId === currentUser?.id) return { success: false, error: 'Self-delete blocked' };
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    await HiveDeskStorage.remove('HiveDeskUsers', userId);
    return { success: true };
  };

  const value = {
    currentUser, user: currentUser, users, loading, cloudStatus, lastPulse,
    isAdmin: currentUser?.role === 'admin',
    isLead: currentUser?.role === 'lead' || currentUser?.role === 'admin',
    login, logout, addUser, updateUser, deleteUser,
    refresh: () => loadFromCloud(false),
    impersonatedRole,
    startImpersonation: (role) => setImpersonatedRole(role),
    stopImpersonation: () => setImpersonatedRole(null),
    effectiveRole: impersonatedRole || currentUser?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
