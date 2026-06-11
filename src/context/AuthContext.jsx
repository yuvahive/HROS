import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { CloudStorage } from '../services/GoogleSheetsService'
import { syncAllFromCloud, addToDB, getAllFromDB, STORES } from '../utils/indexedDB'

export const AuthContext = createContext()

const CLOUD_PULSE_EVENT = 'hros-cloud-pulse'

export function useCloudPulse() {
  const [lastPulse, setLastPulse] = useState(() => Date.now())

  useEffect(() => {
    const handler = (e) => setLastPulse(e.detail.timestamp)
    window.addEventListener(CLOUD_PULSE_EVENT, handler)
    return () => window.removeEventListener(CLOUD_PULSE_EVENT, handler)
  }, [])

  return lastPulse
}

const USERS_CACHE_KEY = 'hros_cached_users'
const USERS_CONFIG_KEY = 'hros_cached_idp'

const DEFAULT_ADMIN = {
  id: 'hros-admin-001',
  name: 'Admin',
  email: 'admin@hros.local',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString()
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(() => {
    const cached = localStorage.getItem(USERS_CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  })
  const [idpConfig, setIdpConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cloudStatus, setCloudStatus] = useState('offline')
  const [viewingAs, setViewingAs] = useState(null) // Admin impersonation: null = viewing as self

  // 1. Initial Load & Heartbeat (3-second Pulse, pauses when tab hidden)
  useEffect(() => {
    // A. INSTANT SESSION RESTORE (Avoids Re-login hindrance)
    const storedSession = localStorage.getItem('hros_current_user');
    if (storedSession) {
      setCurrentUser(JSON.parse(storedSession));
    }

    // B. Initial sync
    loadStoredDataWithCloud();

    // C. Setup 3-second heartbeat that pauses when tab is hidden
    let heartbeat = null

    const startHeartbeat = () => {
      if (heartbeat) clearInterval(heartbeat)
      heartbeat = setInterval(() => {
        if (!document.hidden) {
          loadStoredDataWithCloud(true)
        }
      }, 3000)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible — sync immediately
        loadStoredDataWithCloud(true)
      }
    }

    startHeartbeat()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(heartbeat)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadStoredDataWithCloud = async (isSilent = false) => {
    if (!isSilent) setCloudStatus('syncing');
    
    try {
      // Pull Master System State from Cloud
      const cloudData = await syncAllFromCloud();
      
      if (cloudData && (cloudData.Users?.length > 0 || cloudData.users?.length > 0)) {
        // ONLY update if we got actual fresh user data
        const cloudUsers = cloudData.Users || cloudData.users || [];
        const cloudConfig = (cloudData.Config && cloudData.Config[0]) || cloudData.idpConfig || null;

        setUsers(cloudUsers);
        setIdpConfig(cloudConfig);
        localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(cloudUsers));
        if (cloudConfig) localStorage.setItem(USERS_CONFIG_KEY, JSON.stringify(cloudConfig));
        
        // Session Validation: Only when we have fresh user data
        // Don't validate against empty/stale lists
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
      } else if (!isSilent) {
        // Cloud sync failed or returned empty data
        // If users are empty, seed default admin so login isn't locked out
        setUsers(prev => {
          const cached = localStorage.getItem(USERS_CACHE_KEY);
          const cachedUsers = cached ? JSON.parse(cached) : [];
          if (cachedUsers.length > 0) return cachedUsers;
          // No cloud data, no cache — seed a default admin
          const seeded = [DEFAULT_ADMIN];
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(seeded));
          return seeded;
        });
        setCloudStatus('offline');
      }
      
      // Update lastPulse ONLY if sync succeeded with data
      // This prevents components from refreshing with stale cached data
      if (cloudData && Object.keys(cloudData).length > 0) {
        window.dispatchEvent(new CustomEvent(CLOUD_PULSE_EVENT, { detail: { timestamp: Date.now() } }))

        // Auto-create Person records for users missing them
        ensurePeopleRecords(cloudData);
      }
    } catch (error) {
      console.error('Cloud heartbeat failed:', error);
      if (!isSilent) setCloudStatus('error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  /**
   * Auto-create Person records for any User that doesn't have one.
   * This ensures boards like 1:1 Meetings, Org Chart, Team Sync
   * always have people data to display.
   */
  const ensurePeopleRecords = async (cloudData) => {
    try {
      const cloudUsers = cloudData?.Users || cloudData?.users || []
      const peopleData = await getAllFromDB(STORES.people)
      const existingIds = new Set((peopleData || []).map(p => p.id))
      const existingEmails = new Set((peopleData || []).map(p => p.email).filter(Boolean))

      for (const user of cloudUsers) {
        if (!user.isActive) continue
        if (existingIds.has(user.id) || existingEmails.has(user.email)) continue

        const personData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: '',
          teamId: user.teamId || '',
          status: 'active',
          seniority: 'mid',
          manager: '',
          startDate: new Date().toISOString().split('T')[0],
          skills: [],
          lastCheckInDate: new Date().toISOString().split('T')[0],
          notes: ''
        }
        await addToDB(STORES.people, personData)
      }
    } catch (error) {
      console.error('[AUTH] Failed to auto-create people records:', error)
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
    // Atomic delete - remove row from Google Sheets
    try {
      await CloudStorage.update('Users', null, 'delete', userId)
    } catch (error) {
      console.error('[AUTH] Delete user cloud sync failed:', error)
    }
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

  const importSystemBackup = async (file) => {
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      if (backupData.users) {
        setUsers(backupData.users)
        await CloudStorage.update('Users', backupData.users)
      }
      if (backupData.config) {
        setIdpConfig(backupData.config)
        await CloudStorage.update('Config', [backupData.config])
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const hasPermission = (resource, action) => {
    if (!currentUser) return false
    const effectiveRole = (viewingAs && currentUser.role === 'admin') ? viewingAs : currentUser.role

    // Board-level access: resource is a board ID like 'my-dashboard'
    const allBoardIds = [
      'my-dashboard', 'my-profile', 'org-chart', 'team-sync', 'daily-work', 'one-on-ones',
      'project-health', 'action-items', 'hiring', 'onboarding', 'internships', 'performance',
      'exits', 'teams', 'wellness', 'metrics', 'reports', 'commands', 'logs', 'settings',
      'work-uploads'
    ]
    if (allBoardIds.includes(resource)) {
      const boardAccess = {
        admin: allBoardIds,
        HR: allBoardIds,
        TeamLead: allBoardIds.filter(b => !['commands', 'logs', 'settings'].includes(b)),
        employee: ['my-dashboard', 'my-profile', 'org-chart', 'team-sync', 'daily-work', 'one-on-ones', 'project-health', 'action-items', 'teams', 'wellness', 'metrics', 'work-uploads'],
        intern: ['my-dashboard', 'my-profile', 'org-chart', 'team-sync', 'daily-work', 'one-on-ones', 'teams', 'work-uploads']
      }
      const allowed = boardAccess[effectiveRole] || []
      return allowed.includes(resource)
    }

    // Resource-level permissions
    const permissions = {
      admin: {
        boards: ['all'], users: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'], reports: ['read', 'export'],
        hiring: ['create', 'read', 'update', 'delete'], onboarding: ['create', 'read', 'update', 'delete'],
        exits: ['create', 'read', 'update', 'delete'], projects: ['create', 'read', 'update', 'delete'],
        actions: ['create', 'read', 'update', 'delete'],
        teams: ['create', 'read', 'update', 'delete'],
        workUploads: ['create', 'read', 'update', 'delete', 'review']
      },
      HR: {
        boards: ['all'], users: ['read', 'update'],
        settings: ['read'], reports: ['read', 'export'],
        hiring: ['create', 'read', 'update'], onboarding: ['create', 'read', 'update'],
        exits: ['read'], projects: ['create', 'read', 'update', 'delete'],
        actions: ['create', 'read', 'update', 'delete'],
        teams: ['create', 'read', 'update', 'delete'],
        workUploads: ['create', 'read', 'update', 'review']
      },
      TeamLead: {
        boards: ['all'], users: ['read', 'update'],
        settings: ['read'], reports: ['read', 'export'],
        hiring: ['create', 'read', 'update'], onboarding: ['create', 'read', 'update'],
        exits: ['read'], projects: ['create', 'read', 'update', 'delete'],
        actions: ['create', 'read', 'update', 'delete'],
        teams: ['create', 'read', 'update'],
        workUploads: ['create', 'read', 'update', 'review']
      },
      employee: {
        boards: ['my-dashboard', 'my-profile', 'org-chart', 'team-sync', 'daily-work', 'one-on-ones', 'project-health', 'action-items', 'teams', 'wellness', 'metrics', 'work-uploads'],
        users: ['read'], settings: ['read'], reports: ['read'],
        hiring: [], onboarding: [], exits: [], projects: ['read'],
        actions: ['create', 'read', 'update'],
        teams: ['read'],
        workUploads: ['create', 'read', 'update']
      },
      intern: {
        boards: ['my-dashboard', 'my-profile', 'org-chart', 'team-sync', 'daily-work', 'one-on-ones', 'teams', 'work-uploads'],
        users: ['read'], settings: ['read'], reports: ['read'],
        hiring: [], onboarding: [], exits: [], projects: ['read'],
        actions: ['read'],
        teams: ['read'],
        workUploads: ['create', 'read']
      }
    }
    const rolePerms = permissions[effectiveRole] || {}
    const acts = rolePerms[resource] || []
    return acts.includes('all') || acts.includes(action)
  }

  const stopImpersonation = () => setViewingAs(null)

  const filterByTeam = (records) => {
    if (!currentUser) return records
    const effectiveRole = (viewingAs && currentUser.role === 'admin') ? viewingAs : currentUser.role
    if (effectiveRole !== 'TeamLead') return records
    const teamId = currentUser.teamId
    if (!teamId) return records
    return records.filter(r => r.team === teamId || r.teamId === teamId || !r.team)
  }

  const value = {
    currentUser, users, idpConfig, loading, login, loginWithIDP, logout,
    addUser, updateUser, deleteUser, setIDPConfig, getIDPConfig,
    exportSystemBackup, importSystemBackup, hasPermission, cloudStatus,
    viewingAs, setViewingAs, stopImpersonation, filterByTeam
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
