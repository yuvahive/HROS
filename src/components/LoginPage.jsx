import React, { useState } from 'react'
import { Lock, LogIn, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, loginWithIDP } = useAuth()
  const [loginMode, setLoginMode] = useState('password') // 'password' or 'idp'
  const [email, setEmail] = useState('admin@hros.local')
  const [password, setPassword] = useState('admin123')
  const [idpEmail, setIdpEmail] = useState('')
  const [selectedIDP, setSelectedIDP] = useState('google')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Simulate auth delay
    setTimeout(() => {
      let result

      if (loginMode === 'password') {
        result = login(email, password)
      } else {
        result = loginWithIDP(idpEmail, selectedIDP)
      }

      if (result.success) {
        // Page will re-render after state update
      } else {
        setError(result.error)
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white text-center">YuvaHive HROS</h1>
            <p className="text-blue-100 text-center mt-2">Employee Management System</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setLoginMode('password')
                setError(null)
              }}
              className={`flex-1 px-4 py-4 font-medium transition-colors border-b-2 ${
                loginMode === 'password'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => {
                setLoginMode('idp')
                setError(null)
              }}
              className={`flex-1 px-4 py-4 font-medium transition-colors border-b-2 ${
                loginMode === 'idp'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              IDP Login
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loginMode === 'password' ? (
              <>
                {/* Password Login Form */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Demo: admin@hros.local</p>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="********"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Demo: admin123</p>
                </div>
              </>
            ) : (
              <>
                {/* IDP Login Form */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>IDP Login Enabled</strong><br/>
                    Sign in with your assigned identity provider (Google, Microsoft, Okta, etc.)
                  </p>
                </div>

                <div>
                  <label htmlFor="idp-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="idp-email"
                    type="email"
                    value={idpEmail}
                    onChange={(e) => setIdpEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="your@company.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the email associated with your IDP account
                  </p>
                </div>

                <div>
                  <label htmlFor="idp-provider" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Identity Provider
                  </label>
                  <select
                    id="idp-provider"
                    value={selectedIDP}
                    onChange={(e) => setSelectedIDP(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  >
                    <option value="google">Google</option>
                    <option value="microsoft">Microsoft Entra</option>
                    <option value="okta">Okta</option>
                    <option value="auth0">Auth0</option>
                    <option value="custom">Custom OIDC</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact HR if your provider isn't listed
                  </p>
                </div>
              </>
            )}

            {/* Remember Me (Password mode only) */}
            {loginMode === 'password' && (
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {loginMode === 'password' ? 'Signing in...' : 'Connecting...'}
                </>
              ) : (
                <>
                  {loginMode === 'password' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Connect with {selectedIDP}
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="space-y-2 text-xs text-gray-600">
              <p>
                <strong>Demo Admin:</strong> admin@hros.local / admin123
              </p>
              <p>
                <em>This is a frontend-only demo. Data persists in browser storage.</em>
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-md text-white text-sm">
          <p>
            <strong>Security Note:</strong> This is a demo system with frontend-only authentication. For production, use proper
            OAuth/SAML integration.
          </p>
        </div>
      </div>
    </div>
  )
}

