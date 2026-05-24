import React, { useState, useEffect } from 'react';
import { Layout, Users, Target, BookOpen, Send, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { HiveLabStorage, setGasUrl } from './services/HiveLabStorage';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUrlSet, setIsUrlSet] = useState(false);

  // Load URL from local storage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('hivelab_gas_url');
    if (savedUrl) {
      setGasUrl(savedUrl);
      setUrlInput(savedUrl);
      setIsUrlSet(true);
      fetchLatestData();
    }
  }, []);

  const fetchLatestData = async () => {
    setLoading(true);
    const result = await HiveLabStorage.fetchData();
    setData(result);
    setLoading(false);
  };

  const handleSetUrl = () => {
    localStorage.setItem('hivelab_gas_url', urlInput);
    setGasUrl(urlInput);
    setIsUrlSet(true);
    fetchLatestData();
  };

  if (!isUrlSet) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-accent/20">
            <Layout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold premium-text-gradient mb-2">HiveLab Setup</h1>
          <p className="text-gray-400 mb-8">Please enter your Google Apps Script Web App URL to begin syncing.</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="https://script.google.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
            />
            <button 
              onClick={handleSetUrl}
              className="w-full premium-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              Connect System
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-4xl font-bold premium-text-gradient">HiveLab Management</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Monitoring active missions and team performance
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={fetchLatestData}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 font-medium"
              >
                {loading ? 'Syncing...' : 'Refresh Data'}
              </button>
              <button 
                className="premium-gradient px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg shadow-accent/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Assign Mission
              </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Team Members" value={new Set(data.map(d => d.Phone)).size} icon={<Users />} color="blue" />
          <StatCard title="Active Missions" value={data.filter(d => !d.Score).length} icon={<Target />} color="purple" />
          <StatCard title="Avg Score" value={Math.round(data.reduce((a, b) => a + (Number(b.Score) || 0), 0) / (data.filter(d => d.Score).length || 1))} icon={<TrendingUp />} color="emerald" suffix="%" />
          <StatCard title="Submissions" value={data.filter(d => d.Solution).length} icon={<BookOpen />} color="amber" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Table Area */}
          <div className="xl:col-span-2 glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Layout className="w-5 h-5 text-accent" />
                Assignment Tracker
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Team Member</th>
                    <th className="px-6 py-4 font-medium">Mission</th>
                    <th className="px-6 py-4 font-medium">Language</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                        No active assignments found. Start by assigning a mission.
                      </td>
                    </tr>
                  ) : (
                    data.sort((a, b) => b.Score ? -1 : 1).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold ring-2 ring-white/5 group-hover:ring-accent/30 transition-all">
                              {row.Name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-200">{row.Name}</div>
                              <div className="text-xs text-gray-500">{row.Phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-accent">{row.MissionID}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-400 border border-white/5">
                            {row.Language || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {row.Score ? (
                             <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                               <TrendingUp className="w-3 h-3" /> Evaluated
                             </span>
                          ) : row.Solution ? (
                            <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold animate-pulse">
                              <AlertCircle className="w-3 h-3" /> Pending Review
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                              <Target className="w-3 h-3" /> In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {row.Score ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${row.Score}%` }} />
                              </div>
                              <span className="font-bold text-sm">{row.Score}/100</span>
                            </div>
                          ) : (
                            <button className="text-xs text-accent hover:underline font-semibold">Evaluate</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Team Socials
              </h3>
              <div className="space-y-4">
                {Array.from(new Set(data.map(d => d.Phone))).slice(0, 5).map((phone, i) => {
                  const member = data.find(d => d.Phone === phone);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                          {member.Name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.Name}</p>
                          <p className="text-xs text-gray-500">{member.Role}</p>
                        </div>
                      </div>
                      <Send className="w-4 h-4 text-gray-600 hover:text-accent cursor-pointer transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, suffix = "" }) {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/5 text-amber-400",
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} -mr-8 -mt-8 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5 ${colors[color].split(' ')[1]}`}>
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}{suffix}</h3>
      </div>
    </div>
  );
}
