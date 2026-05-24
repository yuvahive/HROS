import React, { useState, useEffect } from 'react'
import { Settings, Users, Key, Plus, Edit2, Trash2, Save, X, AlertCircle, Download, Upload, AlertTriangle, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminSettings() {
  const { 
    currentUser, users, addUser, updateUser, deleteUser, setIDPConfig, getIDPConfig, 
    hasPermission, exportSystemBackup, importSystemBackup 
  } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [userList, setUserList] = useState(users)
  const [editingUser, setEditingUser] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // IDP Config state
  const [idpConfig, setIdpConfigLocal] = useState(getIDPConfig() || {
    provider: 'custom',
    name: '',
    providerUrl: '',
    clientId: '',
    clientSecret: '',
    scopes: 'email,profile',
    enabled: false
  })

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee'
  })

  // IDP Assignment state
  const [assigningIDP, setAssigningIDP] = useState(null)
  const [selectedIDPForAssignment, setSelectedIDPForAssignment] = useState('password')

  useEffect(() => {
    setUserList(users)
  }, [users])

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access settings.</p>
        </div>
      </div>
    )
  }

  const handleAddUser = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!newUserForm.email || !newUserForm.password || !newUserForm.name) {
      setError('Please fill in all required fields')
      return
    }

    const result = addUser(newUserForm)
    if (result.success) {
      setSuccess('User created successfully')
      setNewUserForm({ email: '', password: '', name: '', role: 'employee' })
      setShowAddForm(false)
      setUserList([...userList, result.user])
    } else {
      setError(result.error)
    }
  }

  const handleUpdateUser = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Only include password if it's actually been changed/entered
    const updateData = { ...editingUser };
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    } else {
      updateData.password = updateData.password.trim();
    }

    const result = updateUser(editingUser.id, updateData)
    if (result.success) {
      setSuccess('User updated successfully')
      setEditingUser(null)
      setUserList(userList.map((u) => (u.id === editingUser.id ? { ...u, ...updateData } : u)))
    } else {
      setError(result.error)
    }
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      const result = deleteUser(userId)
      if (result.success) {
        setSuccess('User deleted successfully')
        setUserList(userList.filter((u) => u.id !== userId))
      } else {
        setError(result.error)
      }
    }
  }

  const handleAssignIDP = () => {
    if (!assigningIDP) return
    
    setError(null)
    setSuccess(null)

    const updatedUser = {
      ...assigningIDP,
      idpProvider: selectedIDPForAssignment
    }

    const result = updateUser(assigningIDP.id, updatedUser)
    if (result.success) {
      setSuccess(`IDP assignment updated: ${selectedIDPForAssignment === 'password' ? 'Password-based login' : selectedIDPForAssignment}`)
      setUserList(userList.map((u) => (u.id === assigningIDP.id ? updatedUser : u)))
      setAssigningIDP(null)
    } else {
      setError('Failed to assign IDP')
    }
  }

  const handleSaveIDPConfig = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (idpConfig.enabled) {
      if (!idpConfig.provider || !idpConfig.providerUrl) {
        setError('Please fill in required IDP fields')
        return
      }
    }

    const result = setIDPConfig(idpConfig)
    if (result.success) {
      setSuccess('IDP configuration saved successfully')
    } else {
      setError('Failed to save configuration')
    }
  }

  const handleExportSystem = () => {
    exportSystemBackup();
    setSuccess('System backup generated successfully');
  };

  const handleImportSystem = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.confirm('WARNING: Importing a backup will overwrite ALL current users, events, and settings. Continue?')) {
       try {
         const result = await importSystemBackup(file);
         setSuccess(`System restored successfully! ${result.count} users recovered.`);
         setTimeout(() => window.location.reload(), 1500); // Reload to ensure full state sync
       } catch (err) {
         setError('Failed to restore backup: ' + err.message);
       }
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm('DANGER: This will permanently delete ALL data. Are you absolutely sure?')) {
       localStorage.clear();
       window.location.reload();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-600" />
          System Settings
        </h1>
        <p className="text-gray-600 mt-1">Admin panel - Configure users and identity providers</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <p className="text-green-700">OK {success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b flex gap-1 px-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('idp')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'idp' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="w-4 h-4 inline mr-2" />
          Identity Providers
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'maintenance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Maintenance
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Add User Form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New User
              </button>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                        placeholder="********"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="intern">Intern</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Registered Users ({userList.length})</h3>
              <div className="grid gap-4">
                {userList.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      {editingUser?.id === user.id ? (
                        <form onSubmit={handleUpdateUser} className="space-y-3">
                          <div className="grid grid-cols-5 gap-3">
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                              placeholder="Name"
                            />
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                              placeholder="Email"
                            />
                            <input
                              type="password"
                              value={editingUser.password || ''}
                              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                               className="px-3 py-2 border border-gray-300 rounded text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                               placeholder="New Pass"
                            />
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="employee">Employee</option>
                              <option value="intern">Intern</option>
                            </select>
                            <select
                              value={editingUser.isActive ? 'active' : 'inactive'}
                              onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                              className="px-3 py-2 border border-gray-300 rounded text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUser(null)}
                              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">
                            {user.email} - <span className="capitalize">{user.role}</span> -{' '}
                            <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                          {/* Show IDP assignment status */}
                          {user.idpProvider && user.idpProvider !== 'password' && (
                            <p className="text-xs text-blue-600 mt-1">
                              IDP: <span className="font-medium capitalize">{user.idpProvider}</span>
                            </p>
                          )}
                          {!user.idpProvider || user.idpProvider === 'password' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Using: Password-based login
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editingUser?.id !== user.id && (
                        <>
                          <button
                            onClick={() => setAssigningIDP(user)}
                            className="p-2 hover:bg-blue-50 rounded"
                            title="Assign IDP Provider"
                          >
                            IDP
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IDP Assignment Modal */}
        {assigningIDP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assign IDP Provider</h3>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{assigningIDP.name}</p>
                <p className="text-xs text-gray-600">{assigningIDP.email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Role: <span className="capitalize font-medium">{assigningIDP.role}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication Method
                  </label>
                  <select
                    value={selectedIDPForAssignment}
                    onChange={(e) => setSelectedIDPForAssignment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="password">Password-based Login</option>
                    <option value="google">Google OAuth</option>
                    <option value="microsoft">Microsoft Entra</option>
                    <option value="okta">Okta SSO</option>
                    <option value="auth0">Auth0</option>
                    <option value="custom">Custom OIDC</option>
                  </select>
                </div>

                {selectedIDPForAssignment !== 'password' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900">
                      <strong>Assignment Ready</strong><br/>
                      This user can now login using their {selectedIDPForAssignment} account.
                      Share the login URL with them.
                    </p>
                  </div>
                )}

                {selectedIDPForAssignment === 'password' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-900">
                      User will use email/password to login.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setAssigningIDP(null)
                      setSelectedIDPForAssignment('password')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignIDP}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {selectedIDPForAssignment === 'password' ? 'Keep Password' : 'Assign IDP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'idp' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-6">Identity Provider Configuration</h3>

              <form onSubmit={handleSaveIDPConfig} className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    id="idp-enabled"
                    type="checkbox"
                    checked={idpConfig.enabled}
                    onChange={(e) => setIdpConfigLocal({ ...idpConfig, enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="idp-enabled" className="font-medium text-gray-900">
                    Enable External IDP
                  </label>
                  <span className="text-xs text-gray-600 ml-auto">
                    {idpConfig.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {idpConfig.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Provider Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type *</label>
                      <select
                        value={idpConfig.provider}
                        onChange={(e) => setIdpConfigLocal({ ...idpConfig, provider: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      >
                        <option value="custom">Custom OIDC</option>
                        <option value="google">Google</option>
                        <option value="microsoft">Microsoft Entra</option>
                        <option value="okta">Okta</option>
                        <option value="auth0">Auth0</option>
                      </select>
                    </div>

                    {/* Provider Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name *</label>
                      <input
                        type="text"
                        value={idpConfig.name}
                        onChange={(e) => setIdpConfigLocal({ ...idpConfig, name: e.target.value })}
                        placeholder="e.g., Company Active Directory"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>

                    {/* Provider URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Provider URL *</label>
                      <input
                        type="url"
                        value={idpConfig.providerUrl}
                        onChange={(e) => setIdpConfigLocal({ ...idpConfig, providerUrl: e.target.value })}
                        placeholder="https://idp.example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>

                    {/* Client ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                      <input
                        type="text"
                        value={idpConfig.clientId}
                        onChange={(e) => setIdpConfigLocal({ ...idpConfig, clientId: e.target.value })}
                        placeholder="OAuth Client ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>

                    {/* Client Secret */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                      <input
                        type="password"
                        value={idpConfig.clientSecret}
                        onChange={(e) => setIdpConfigLocal({ ...idpConfig, clientSecret: e.target.value })}
                        placeholder="OAuth Client Secret"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>

                    {/* Scopes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
                      <input
                        type="text"
                        value={idpConfig.scopes}
                        onChange={(e) => setIdpConfigLocal({ ...idpConfig, scopes: e.target.value })}
                        placeholder="email,profile,openid"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>

                    {/* Callback URL Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Callback URL:</strong> http://localhost:5173/auth/callback
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </button>
                </div>
              </form>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> This is a frontend-only configuration. For production, implement proper OAuth/SAML integration on the backend.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="max-w-4xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Backup Section */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Download size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">System Backup</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Download a complete snapshot of all users, organizational settings, 
                  calendar events, and system logs. Use this to migrate to another browser.
                </p>
                <button
                  onClick={handleExportSystem}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                   <Download size={18} />
                   Generate Full Backup (.json)
                </button>
              </div>

              {/* Restore Section */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Upload size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Restore System</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                   Upload a previously exported backup file to restore your entire database. 
                   <span className="text-red-500 font-bold ml-1">Warning: Overwrites existing data.</span>
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSystem}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition flex items-center justify-center gap-2">
                     <Upload size={18} />
                     Upload Backup File
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-3 mb-4 text-red-700">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-black uppercase tracking-wider text-red-800">Danger Zone</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-red-700 font-medium max-w-lg">
                  Factory Reset will permanently wipe your entire local database including all custom users, 
                  events, and settings. This cannot be undone.
                </p>
                <button 
                  onClick={handleFactoryReset}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20 whitespace-nowrap"
                >
                   System Factory Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

