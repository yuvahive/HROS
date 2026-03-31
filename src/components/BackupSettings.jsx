import React, { useState, useEffect } from 'react';
import { Download, Cloud, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { triggerBackupNow, getBackupInfo, setAutoBackupEnabled, isAutoBackupEnabled } from '../utils/autoBackup';
import { getDBStats } from '../utils/indexedDB';

export const BackupSettings = ({ events, onExport }) => {
  const [backupInfo, setBackupInfo] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [autoBackupEnabled, setAutoBackupEnabledState] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const updateInfo = async () => {
      setBackupInfo(getBackupInfo());
      try {
        const stats = await getDBStats();
        setDbStats(stats);
      } catch (error) {
        console.error('Failed to get DB stats:', error);
      }
    };

    updateInfo();
    const interval = setInterval(updateInfo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleBackupNow = () => {
    const success = triggerBackupNow(events);
    if (success) {
      alert('Backup created! Check your Downloads folder.');
      setBackupInfo(getBackupInfo());
    }
  };

  const handleAutoBackupToggle = (enabled) => {
    setAutoBackupEnabled(enabled);
    setAutoBackupEnabledState(enabled);
  };

  const getLastBackupTimeFormatted = () => {
    if (!backupInfo?.lastBackup) return 'Never';
    const date = new Date(backupInfo.lastBackup);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Download size={18} />
          Data Protection
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Status Summary */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">IndexedDB Active</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {dbStats?.totalEvents || 0} events stored • Survives cache clear
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Download size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Auto-Backup</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {autoBackupEnabled ? 'Enabled' : 'Disabled'} • Last: {getLastBackupTimeFormatted()}
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={(e) => handleAutoBackupToggle(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Auto-backup to Downloads (hourly)
            </span>
          </label>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleBackupNow}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          <Download size={16} /> Backup Now
        </button>

        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          <Cloud size={16} /> Export (Manual)
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          ✓ Data stored in browser (IndexedDB) - survives cache clear<br/>
          ✓ Auto-backups to Downloads folder hourly<br/>
          ✓ Always export important events manually
        </p>
      </div>
    </div>
  );
};

export default BackupSettings;
