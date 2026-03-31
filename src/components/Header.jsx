import React from 'react';
import { Calendar, Clock, List, Eye, EyeOff, Briefcase, LogOut } from 'lucide-react';

export const Header = ({
  view,
  onViewChange,
  searchActive,
  onSearchToggle,
  isDark,
  onSwitchToHROS,
  currentUser,
  onLogout
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          HROS Calendar
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Life Management Dashboard
        </p>
      </div>

      <div className="flex items-center gap-4">
        {onSwitchToHROS && (
          <button
            onClick={onSwitchToHROS}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            title="Switch to HROS System"
          >
            <Briefcase size={18} />
            HROS
          </button>
        )}
        
        {/* User Info and Logout */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-gray-600">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {currentUser.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 rounded transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewChange('day')}
            className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition ${
              view === 'day'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Day View (D)"
          >
            <Clock size={18} />
            Day
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition ${
              view === 'week'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Week View (W)"
          >
            <List size={18} />
            Week
          </button>
          <button
            onClick={() => onViewChange('month')}
            className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition ${
              view === 'month'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Month View (M)"
          >
            <Calendar size={18} />
            Month
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
