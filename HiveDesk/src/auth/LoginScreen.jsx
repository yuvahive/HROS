import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) setError(result.error);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-hd-bg flex items-center justify-center p-6">
      <div className="glass-card p-8 max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-accent/20">
          <LogIn className="w-8 h-8 text-hd-text" />
        </div>
        <h1 className="text-3xl font-bold premium-text-gradient text-center mb-2">HiveDesk</h1>
        <p className="text-hd-muted text-center mb-8">War Room Management System</p>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-hd-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-hd-text placeholder-hd-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-hd-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full bg-hd-raised border border-hd-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-hd-text placeholder-hd-muted"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full premium-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

