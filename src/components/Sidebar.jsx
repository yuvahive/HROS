import React, { useState } from 'react';
import { Plus, Search, Download, Upload, Settings, ChevronDown, ChevronUp, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import MiniCalendar from './MiniCalendar';
import BackupSettings from './BackupSettings';
import { CATEGORIES } from '../utils/constants';

export const Sidebar = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onNewEvent,
  selectedCategories,
  onCategoryToggle,
  selectedPriorities,
  onPriorityToggle,
  searchTerm,
  onSearchChange,
  onExport,
  onImport,
  isDark,
  onToggleDarkMode,
  events,
  currentUser,
  onLogout,
  cloudStatus
}) => {
  const [expandedSections, setExpandedSections] = useState({
    calendar: true,
    categories: true,
    filters: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        onImport(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {/* Header with User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HROS</h1>
          <button
            onClick={onToggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Current User Display */}
        {currentUser && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Logged in as:</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{currentUser.role}</p>
            </div>
            
            {/* Cloud Sync Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              cloudStatus === 'online' ? 'bg-green-50 text-green-700 border-green-200' :
              cloudStatus === 'syncing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              cloudStatus === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {cloudStatus === 'online' && <Cloud size={12} />}
              {cloudStatus === 'syncing' && <RefreshCw size={12} className="animate-spin" />}
              {(cloudStatus === 'error' || cloudStatus === 'offline') && <CloudOff size={12} />}
              Cloud Sync: {cloudStatus}
            </div>
          </div>
        )}

        {/* Quick Add */}
        <button
          onClick={onNewEvent}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
        >
          <Plus size={20} /> New Event (N)
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events... (/)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection('calendar')}
          className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900 dark:text-white"
        >
          Calendar
          {expandedSections.calendar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.calendar && (
          <MiniCalendar
            currentDate={currentDate}
            onDateSelect={onDateSelect}
            selectedDate={selectedDate}
          />
        )}
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900 dark:text-white"
        >
          Categories
          {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <label key={category.name} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => onCategoryToggle(category.name)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Export/Import */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={onExport}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          <Download size={16} /> Export
        </button>
        <button
          onClick={handleImportClick}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          <Upload size={16} /> Import
        </button>
      </div>

      {/* Backup Settings */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <BackupSettings 
          events={events}
          onExport={onExport}
        />
      </div>

      {/* Help */}
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
        <p><span className="font-mono">N</span> - New event</p>
        <p><span className="font-mono">D/W/M</span> - Day/Week/Month</p>
        <p><span className="font-mono">T</span> - Today</p>
        <p><span className="font-mono">/</span> - Search</p>
      </div>

      {/* Logout Button */}
      {currentUser && onLogout && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
