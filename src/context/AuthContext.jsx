import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [idpConfig, setIdpConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize on mount
  useEffect(() => {
    loadStoredData()
  }, [])

  const loadStoredData = () => {
    try {
      // Load stored users
      const storedUsers = localStorage.getItem('hros_users')
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      } else {
        // Create default admin on first load
        const defaultAdmin = {
          id: 'admin-001',
          email: 'admin@hros.local',
          password: 'admin123', // Default password - should be changed
          name: 'System Administrator',
          role: 'admin',
          createdAt: new Date().toISOString(),
          isActive: true
        }
        setUsers([defaultAdmin])
        localStorage.setItem('hros_users', JSON.stringify([defaultAdmin]))
      }

      // Load IDP config
      const storedIDP = localStorage.getItem('hros_idp_config')
      if (storedIDP) {
        setIdpConfig(JSON.parse(storedIDP))
      }

      // Load current session
      const storedUser = localStorage.getItem('hros_current_user')
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error loading stored data:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = (email, password) => {
    const user = users.find((u) => u.email === email && u.password === password && u.isActive)

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    }

    setCurrentUser(userData)
    localStorage.setItem('hros_current_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }

  // Login with IDP provider (Google, Microsoft, Okta, etc.)
  const loginWithIDP = (email, idpProvider) => {
    const user = users.find((u) => u.email === email && u.isActive && (u.idpProvider === idpProvider || !u.idpProvider))

    if (!user) {
      return { 
        success: false, 
        error: `No account found for this email, or not assigned to ${idpProvider}. Contact your HR administrator.` 
      }
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString(),
      idpProvider: idpProvider
    }

    setCurrentUser(userData)
    localStorage.setItem('hros_current_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('hros_current_user')
  }

  const addUser = (userData) => {
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('hros_users', JSON.stringify(updatedUsers))
    return { success: true, user: newUser }
  }

  const updateUser = (userId, updates) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    setUsers(updatedUsers)
    localStorage.setItem('hros_users', JSON.stringify(updatedUsers))

    // Update current user if it's the logged-in user
    if (currentUser?.id === userId) {
      const updated = { ...currentUser, ...updates }
      setCurrentUser(updated)
      localStorage.setItem('hros_current_user', JSON.stringify(updated))
    }

    return { success: true }
  }

  const deleteUser = (userId) => {
    if (userId === currentUser?.id) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    const updatedUsers = users.filter((u) => u.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem('hros_users', JSON.stringify(updatedUsers))
    return { success: true }
  }

  const setIDPConfig = (config) => {
    setIdpConfig(config)
    localStorage.setItem('hros_idp_config', JSON.stringify(config))
    return { success: true }
  }

  const getIDPConfig = () => {
    return idpConfig
  }

  const hasPermission = (resource, action) => {
    if (!currentUser) return false

    const permissions = {
      admin: {
        boards: ['all'],
        users: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'],
        reports: ['read', 'export'],
        hiring: ['create', 'read', 'update', 'delete'],
        onboarding: ['create', 'read', 'update', 'delete'],
        exits: ['create', 'read', 'update', 'delete'],
        projects: ['create', 'read', 'update', 'delete'],
        actions: ['create', 'read', 'update', 'delete']
      },
      employee: {
        boards: ['daily-work', 'one-on-ones', 'metrics'],
        users: ['read'], // Can only read their own profile
        settings: ['read'], // Can see settings but not change
        reports: ['read'],
        hiring: ['read'],
        onboarding: ['read'],
        exits: ['read'],
        projects: ['read'],
        actions: ['read']
      },
      intern: {
        boards: ['daily-work', 'metrics'],
        users: ['read'],
        settings: ['read'],
        reports: ['read'],
        hiring: [],
        onboarding: ['read'],
        exits: [],
        projects: ['read'],
        actions: ['read']
      }
    }

    const userPermissions = permissions[currentUser.role] || {}
    const resourceActions = userPermissions[resource] || []

    if (resourceActions.includes('all')) return true
    return resourceActions.includes(action)
  }

  const value = {
    currentUser,
    users,
    idpConfig,
    loading,
    login,
    loginWithIDP,
    logout,
    addUser,
    updateUser,
    deleteUser,
    setIDPConfig,
    getIDPConfig,
    hasPermission
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
