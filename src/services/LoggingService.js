import { CloudStorage } from './GoogleSheetsService';

const LOGS_KEY = 'hros_system_logs';
const MAX_LOGS = 1000;

class LoggingService {
  /**
   * Log a system action
   * @param {Object} user - The current user object { name, role }
   * @param {string} action - The action being performed (e.g., 'CREATE', 'DELETE', 'LOGIN')
   * @param {string} resource - The target resource (e.g., 'CALENDAR_EVENT', 'HR_HIRE', 'SYSTEM')
   * @param {string} details - Detailed description of the action
   */
  static log(user, action, resource, details) {
    try {
      const logs = this.getAllLogs();
      const newLog = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        userName: user?.name || 'Unknown User',
        userRole: user?.role || 'Guest',
        action,
        resource,
        details
      };

      // Add to start and limit size
      const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
      localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
      
      // Also push to cloud
      CloudStorage.update('Logs', updatedLogs);
      
      console.log(`[SYSTEM LOG] ${action} on ${resource}: ${details}`);
    } catch (error) {
      console.error('Failed to save system log:', error);
    }
  }

  static getAllLogs() {
    try {
      const logs = localStorage.getItem(LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  }

  static clearLogs() {
    localStorage.removeItem(LOGS_KEY);
    CloudStorage.update('Logs', []);
  }
}

export default LoggingService;
