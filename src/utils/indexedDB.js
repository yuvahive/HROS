/**
 * HROS Cloud-Native Storage Bridge
 * 
 * This module replaces persistent IndexedDB with a Live In-Memory Cache
 * that synchronizes with Google Sheets every 3 seconds.
 * 
 * Result: No local storage on disk. Shared real-time state.
 */

import { CloudStorage } from '../services/GoogleSheetsService';
import LoggingService from '../services/LoggingService';

// The "Single Source of Truth" in memory, persisted to localStorage as fallback
const CACHE_KEY = 'hros_live_cache'

const defaultCache = {
  events: [],
  people: [],
  teams: [],
  hiringPipeline: [],
  internships: [],
  onboarding: [],
  exits: [],
  workLogs: [],
  projects: [],
  tasks: [],
  taskComments: [],
  checkIns: [],
  oneOnOnes: [],
  decisions: [],
  actionItems: [],
  skills: [],
  timeOff: [],
  compensationHistory: [],
  teamDynamics: [],
  redFlags: [],
  workUploads: [],
  Users: [],
  Config: [],
  Logs: []
}

// Load from localStorage if available
let liveCache = (() => {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('[CACHE] Restored from localStorage')
      return { ...defaultCache, ...parsed }
    }
  } catch (e) {
    console.warn('[CACHE] Failed to restore from localStorage:', e)
  }
  return { ...defaultCache }
})();

// Save to localStorage (debounced)
let saveTimeout = null
const saveCacheToDisk = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(liveCache))
    } catch (e) {
      console.warn('[CACHE] Failed to save to localStorage:', e)
    }
  }, 500)
}

// Track when local changes were made (for conflict detection)
let lastLocalUpdate = {};

// Queue for failed updates to retry (persisted to localStorage)
const PENDING_KEY = 'hros_pending_updates'
let pendingUpdates = (() => {
  try {
    const stored = localStorage.getItem(PENDING_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[PENDING] Restored ${parsed.length} failed updates from localStorage`)
        return parsed
      }
    }
  } catch (e) {
    console.warn('[PENDING] Failed to restore from localStorage:', e)
  }
  return []
})();

const savePendingToDisk = () => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingUpdates))
  } catch (e) {
    console.warn('[PENDING] Failed to save to localStorage:', e)
  }
}

// Prevent concurrent syncs from stacking
let isSyncing = false;

const STORES = {
  events: 'events',
  people: 'people',
  teams: 'teams',
  hiringPipeline: 'hiringPipeline',
  internships: 'internships',
  onboarding: 'onboarding',
  exits: 'exits',
  workLogs: 'workLogs',
  projects: 'projects',
  tasks: 'tasks',
  taskComments: 'taskComments',
  checkIns: 'checkIns',
  oneOnOnes: 'oneOnOnes',
  decisions: 'decisions',
  actionItems: 'actionItems',
  skills: 'skills',
  timeOff: 'timeOff',
  compensationHistory: 'compensationHistory',
  teamDynamics: 'teamDynamics',
  redFlags: 'redFlags',
  workUploads: 'workUploads'
};

// ==================== LIVE SYNC ENGINE ====================

/**
 * Global Poller - Pulled by AuthContext every 3s
 * Prevents concurrent syncs from stacking
 */
export const syncAllFromCloud = async () => {
  // Skip if sync already in progress
  if (isSyncing) {
    console.log('[LIVE SYNC] Sync already in progress, skipping pulse');
    return liveCache;
  }
  
  isSyncing = true;
  try {
    const cloudData = await CloudStorage.fetchAll();
    if (!cloudData) return liveCache;

    // Smart merge: Only update if cloud is newer OR local hasn't changed recently
    Object.keys(cloudData).forEach(tabName => {
      if (Array.isArray(cloudData[tabName])) {
        const timeSinceLocalUpdate = Date.now() - (lastLocalUpdate[tabName] || 0);
        
        // If local was updated less than 2 seconds ago, don't overwrite
        // This gives time for the cloud update to complete
        if (timeSinceLocalUpdate < 2000) {
          console.log(`[LIVE SYNC] Skipping ${tabName} - recent local changes (${timeSinceLocalUpdate}ms ago)`);
          return; // Skip this table
        }
        
        // Merge strategy: combine arrays, removing duplicates by ID
        if (liveCache[tabName] && Array.isArray(liveCache[tabName])) {
          const localIds = new Set(liveCache[tabName].map(r => r.id));
          const cloudIds = new Set(cloudData[tabName].map(r => r.id));
          
          // Keep local items not in cloud (they're pending sync)
          const pendingLocal = liveCache[tabName].filter(r => !cloudIds.has(r.id));
          
          // Merge: cloud items + pending local items
          liveCache[tabName] = [...cloudData[tabName], ...pendingLocal];
        } else {
          liveCache[tabName] = cloudData[tabName];
        }
      }
    });

    // Retry failed updates
    if (pendingUpdates.length > 0) {
      console.log(`[LIVE SYNC] Retrying ${pendingUpdates.length} failed updates...`);
      const updates = [...pendingUpdates];
      pendingUpdates = [];
      savePendingToDisk();
      
      for (const update of updates) {
        const success = await CloudStorage.update(update.type, update.data, update.action, update.id);
        if (!success) {
          pendingUpdates.push(update); // Re-queue if failed
        }
      }
      savePendingToDisk();
    }

    saveCacheToDisk()
    return liveCache;
  } catch (error) {
    return liveCache;
  } finally {
    isSyncing = false;
  }
};

/**
 * Initialize - Dummy for compatibility
 */
export const initDB = () => Promise.resolve(true);

// ==================== GENERIC CRUD OVERRIDES ====================
// These now work with memory and push to cloud immediately

export const getAllFromDB = (tableName) => {
  return Promise.resolve(liveCache[tableName] || []);
};

export const getFromDB = (tableName, id) => {
  const record = (liveCache[tableName] || []).find(r => r.id === id);
  return Promise.resolve(record);
};

export const addToDB = async (tableName, record) => {
  if (!liveCache[tableName]) liveCache[tableName] = [];
  liveCache[tableName].push(record);
  lastLocalUpdate[tableName] = Date.now();
  saveCacheToDisk();
  
  // Instant Push with error handling
  try {
    const success = await CloudStorage.update(tableName, liveCache[tableName]);
    if (!success) {
      pendingUpdates.push({ type: tableName, data: liveCache[tableName], action: 'update' });
      savePendingToDisk();
      console.warn(`[DB ADD] Update queued for retry: ${tableName}`);
    }
  } catch (error) {
    console.error(`[DB ADD] Error pushing to cloud:`, error);
    pendingUpdates.push({ type: tableName, data: liveCache[tableName], action: 'update' });
    savePendingToDisk();
  }
  return record;
};

export const updateInDB = async (tableName, record) => {
  if (!liveCache[tableName]) liveCache[tableName] = [];
  liveCache[tableName] = liveCache[tableName].map(r => r.id === record.id ? record : r);
  lastLocalUpdate[tableName] = Date.now();
  saveCacheToDisk();
  
  // Instant Push with error handling
  try {
    const success = await CloudStorage.update(tableName, liveCache[tableName]);
    if (!success) {
      pendingUpdates.push({ type: tableName, data: liveCache[tableName], action: 'update' });
      savePendingToDisk();
      console.warn(`[DB UPDATE] Update queued for retry: ${tableName}`);
    }
  } catch (error) {
    console.error(`[DB UPDATE] Error pushing to cloud:`, error);
    pendingUpdates.push({ type: tableName, data: liveCache[tableName], action: 'update' });
    savePendingToDisk();
  }
  return record;
};

export const deleteFromDB = async (tableName, id) => {
  if (!liveCache[tableName]) return true;
  liveCache[tableName] = liveCache[tableName].filter(r => r.id !== id);
  lastLocalUpdate[tableName] = Date.now();
  saveCacheToDisk();
  
  // ATOMIC DELETE PUSH with error handling
  try {
    const success = await CloudStorage.update(tableName, null, 'delete', id);
    if (!success) {
      pendingUpdates.push({ type: tableName, action: 'delete', id });
      savePendingToDisk();
      console.warn(`[DB DELETE] Delete queued for retry: ${tableName} ${id}`);
    }
  } catch (error) {
    console.error(`[DB DELETE] Error pushing to cloud:`, error);
    pendingUpdates.push({ type: tableName, action: 'delete', id });
    savePendingToDisk();
  }
  return true;
};

export const clearTableDB = async (tableName) => {
  liveCache[tableName] = [];
  saveCacheToDisk();
  await CloudStorage.update(tableName, []);
  return true;
};

// ==================== BACKWARDS COMPATIBILITY ====================

export const saveEventsDB = (events) => {
  liveCache.events = events;
  return CloudStorage.update('events', events);
};

export const loadEventsDB = () => Promise.resolve(liveCache.events || []);
export const deleteEventDB = (id) => deleteFromDB('events', id);
export const updateEventDB = (e) => updateInDB('events', e);
export const addEventDB = (e) => addToDB('events', e);
export const clearAllEventsDB = () => clearTableDB('events');

export const getDBStats = () => {
  const stats = {
    dbName: 'HROS_CLOUD_MEMORY',
    version: 'LIVE',
    tables: {}
  };
  Object.keys(liveCache).forEach(k => {
    stats.tables[k] = liveCache[k]?.length || 0;
  });
  return Promise.resolve(stats);
};

export { STORES };
