// Auto-backup feature - periodically save events to browser's download folder
import { exportEvents } from './storage'

export const setupAutoBackup = (events, intervalMinutes = 60) => {
  // Auto-backup every N minutes
  const intervalMs = intervalMinutes * 60 * 1000

  const backupInterval = setInterval(() => {
    if (events && events.length > 0) {
      console.log(`Auto-backup triggered at ${new Date().toLocaleTimeString()}`)
      exportEvents(events)
    }
  }, intervalMs)

  return backupInterval // Return to allow clearing if needed
}

// Manual backup trigger
export const triggerBackupNow = (events) => {
  if (events && events.length > 0) {
    console.log('Manual backup triggered')
    exportEvents(events)
    return true
  }
  return false
}

// Store backup schedule preference
export const setAutoBackupInterval = (intervalMinutes) => {
  localStorage.setItem('hros_backup_interval', intervalMinutes)
}

export const getAutoBackupInterval = () => {
  return parseInt(localStorage.getItem('hros_backup_interval') || '60')
}

// Enable/disable auto-backup
export const setAutoBackupEnabled = (enabled) => {
  localStorage.setItem('hros_auto_backup_enabled', enabled)
}

export const isAutoBackupEnabled = () => {
  return localStorage.getItem('hros_auto_backup_enabled') !== 'false'
}

// Get last backup time
export const getLastBackupTime = () => {
  return localStorage.getItem('hros_last_backup_time')
}

export const setLastBackupTime = (time) => {
  localStorage.setItem('hros_last_backup_time', time || new Date().toISOString())
}

// Backup storage info
export const getBackupInfo = () => {
  return {
    lastBackup: getLastBackupTime(),
    autoBackupEnabled: isAutoBackupEnabled(),
    backupInterval: getAutoBackupInterval()
  }
}
