import React, { useState, useEffect } from 'react';
import { Shield, Search, FileText, Clock, User, Activity, Trash2, Filter } from 'lucide-react';
import LoggingService from '../services/LoggingService';

export const AdminLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    // Refresh logs on mount and every 30 seconds
    const fetchLogs = () => {
      setLogs(LoggingService.getAllLogs());
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      LoggingService.clearLogs();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(filter.toLowerCase()) ||
      log.userName.toLowerCase().includes(filter.toLowerCase()) ||
      log.resource.toLowerCase().includes(filter.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || log.userRole.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'LOGIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-indigo-600" size={28} />
            System Audit Logs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time tracking of all administrative and system actions
          </p>
        </div>
        
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-lg shadow-red-600/20 text-sm font-bold self-start md:self-center"
        >
          <Trash2 size={16} />
          Clear All Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by user, resource or details..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white py-2 px-4"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Resource</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {log.userName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">
                            {log.userName}
                          </p>
                          <p className="text-[10px] uppercase font-black tracking-tighter text-indigo-500 opacity-80">
                            {log.userRole}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                        <Activity size={14} className="text-indigo-400" />
                        {log.resource}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                        {log.details}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <FileText size={48} className="text-gray-300" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No system logs found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLogViewer;
