import React from 'react';
import { Calendar, Clock, List, Eye, EyeOff, Briefcase, LogOut, Target } from 'lucide-react';

export const Header = ({
  view,
  onViewChange,
  searchActive,
  onSearchToggle,
  isDark,
  onSwitchToHROS,
  onSwitchToHiveLab,
  currentUser,
  onLogout
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0 z-10 w-full">
      <div className="flex-shrink-0 min-w-0 mr-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
          HROS Calendar
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block truncate">
          Life Management Dashboard
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-2">
          {onSwitchToHROS && (
            <button
              onClick={onSwitchToHROS}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
              title="Switch to HROS System"
            >
              <Briefcase size={16} />
              <span className="hidden sm:inline">HROS</span>
            </button>
          )}

          {onSwitchToHiveLab && (
            <button
              onClick={onSwitchToHiveLab}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm"
              title="Switch to HiveLab Management"
            >
              <Target size={16} />
              <span className="hidden sm:inline">HiveLab</span>
            </button>
          )}
        </div>
        
        {/* User Info and Logout */}
        {currentUser && (
          <div className="flex-shrink-0 flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-300 dark:border-gray-600">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                {currentUser.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition border border-transparent hover:border-red-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
        
        <div className="flex-shrink-0 flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onViewChange('day')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded font-medium transition text-xs ${
              view === 'day'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock size={16} />
            <span className="hidden xs:inline">Day</span>
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded font-medium transition text-xs ${
              view === 'week'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <List size={16} />
            <span className="hidden xs:inline">Week</span>
          </button>
          <button
            onClick={() => onViewChange('month')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded font-medium transition text-xs ${
              view === 'month'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Calendar size={16} />
            <span className="hidden xs:inline">Month</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
