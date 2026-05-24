import React, { createContext, useState, useEffect, useContext } from 'react'
import { CloudStorage } from '../services/GoogleSheetsService'
import { syncAllFromCloud } from '../utils/indexedDB'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [idpConfig, setIdpConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cloudStatus, setCloudStatus] = useState('offline')
  const [lastPulse, setLastPulse] = useState(Date.now())

  // 1. Initial Load & Heartbeat (3-second Pulse)
  useEffect(() => {
    // A. INSTANT SESSION RESTORE (Avoids Re-login hindrance)
    const storedSession = localStorage.getItem('hros_current_user');
    if (storedSession) {
      setCurrentUser(JSON.parse(storedSession));
    }

    // B. Initial sync
    loadStoredDataWithCloud();

    // C. Setup 3-second heartbeat 
    const heartbeat = setInterval(() => {
      loadStoredDataWithCloud(true);
    }, 3000);

    return () => clearInterval(heartbeat);
  }, [])

  const loadStoredDataWithCloud = async (isSilent = false) => {
    if (!isSilent) setCloudStatus('syncing');
    
    try {
      // Pull Master System State from Cloud
      const cloudData = await syncAllFromCloud();
      
      if (cloudData) {
        // Mirrored memory state from cloud
        const cloudUsers = cloudData.Users || cloudData.users || [];
        const cloudConfig = (cloudData.Config && cloudData.Config[0]) || cloudData.idpConfig || null;

        setUsers(cloudUsers);
        setIdpConfig(cloudConfig);
        
        // Session Management (Only keep 'currentUser' in localStorage)
        if (!currentUser) {
          const storedSession = localStorage.getItem('hros_current_user');
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession);
            const validUser = cloudUsers.find(u => u.id === parsedSession.id && u.isActive);
            if (validUser) {
              setCurrentUser(parsedSession);
            } else {
              localStorage.removeItem('hros_current_user');
            }
          }
        }

        setCloudStatus('online');
        setLastPulse(Date.now());
      }
    } catch (error) {
      console.error('Cloud heartbeat failed:', error);
      if (!isSilent) setCloudStatus('error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  const login = (email, password) => {
    const user = users.find((u) => 
      u.email.toLowerCase() === email.trim().toLowerCase() && 
      u.password === password.trim() && 
      u.isActive
    )

    if (!user) return { success: false, error: 'Invalid credentials' }

    const userData = {
      id: user.id, email: user.email, name: user.name, role: user.role,
      loginTime: new Date().toISOString()
    }

    setCurrentUser(userData)
    localStorage.setItem('hros_current_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const loginWithIDP = (email, idpProvider) => {
    const user = users.find((u) => 
      u.email.toLowerCase() === email.trim().toLowerCase() && 
      u.isActive && 
      (u.idpProvider === idpProvider || !u.idpProvider)
    )

    if (!user) return { success: false, error: 'No account found' }

    const userData = {
      id: user.id, email: user.email, name: user.name, role: user.role,
      loginTime: new Date().toISOString(), idpProvider
    }

    setCurrentUser(userData)
    localStorage.setItem('hros_current_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('hros_current_user')
  }

  const addUser = async (userData) => {
    if (users.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      return { success: false, error: 'User already exists' }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    // Instant Cloud Write
    await CloudStorage.update('Users', updatedUsers);
    return { success: true, user: newUser }
  }

  const updateUser = async (userId, updates) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    setUsers(updatedUsers)
    await CloudStorage.update('Users', updatedUsers);

    if (currentUser?.id === userId) {
      const updated = { ...currentUser, ...updates }
      setCurrentUser(updated)
      localStorage.setItem('hros_current_user', JSON.stringify(updated))
    }
    return { success: true }
  }

  const deleteUser = async (userId) => {
    if (userId === currentUser?.id) return { success: false, error: 'Self-delete blocked' }
    const updatedUsers = users.filter((u) => u.id !== userId)
    setUsers(updatedUsers)
    await CloudStorage.update('Users', updatedUsers);
    return { success: true }
  }

  const setIDPConfig = async (config) => {
    setIdpConfig(config)
    await CloudStorage.update('Config', [config]);
    return { success: true }
  }

  const getIDPConfig = () => idpConfig

  const exportSystemBackup = () => {
    const backupData = {
      version: 'CLOUD-NATIVE',
      timestamp: new Date().toISOString(),
      users: users,
      config: idpConfig
    }
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }));
    element.download = `hros-cloud-dump-${new Date().toISOString().split('T')[0]}.json`;
    element.click();
  }

  const hasPermission = (resource, action) => {
    if (!currentUser) return false
    const permissions = {
      admin: {
        boards: ['all'], users: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'], reports: ['read', 'export'],
        hiring: ['create', 'read', 'update', 'delete'], onboarding: ['create', 'read', 'update', 'delete'],
        exits: ['create', 'read', 'update', 'delete'], projects: ['create', 'read', 'update', 'delete'],
        actions: ['create', 'read', 'update', 'delete']
      },
      employee: {
        boards: ['daily-work', 'one-on-ones', 'metrics'], users: ['read'],
        settings: ['read'], reports: ['read'],
        hiring: ['read'], onboarding: ['read'],
        exits: ['read'], projects: ['read'],
        actions: ['read']
      },
      intern: {
        boards: ['daily-work', 'metrics'], users: ['read'],
        settings: ['read'], reports: ['read'],
        hiring: [], onboarding: ['read'],
        exits: [], projects: ['read'],
        actions: ['read']
      }
    }
    const rolePerms = permissions[currentUser.role] || {}
    const acts = rolePerms[resource] || []
    return acts.includes('all') || acts.includes(action)
  }

  const value = {
    currentUser, users, idpConfig, loading, login, loginWithIDP, logout,
    addUser, updateUser, deleteUser, setIDPConfig, getIDPConfig,
    exportSystemBackup, hasPermission, cloudStatus, lastPulse
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
