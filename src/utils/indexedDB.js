/**
 * HROS Cloud-Native Storage Bridge
 * 
 * This module replaces persistent IndexedDB with a Live In-Memory Cache
 * that synchronizes with Google Sheets every 3 seconds.
 * 
 * Result: No local storage on disk. Shared real-time state.
 */

import { CloudStorage } from '../services/GoogleSheetsService';

// The "Single Source of Truth" in memory
let liveCache = {
  events: [],
  people: [],
  hiringPipeline: [],
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
  Users: [],
  Config: [],
  Logs: []
};

const STORES = {
  events: 'events',
  people: 'people',
  hiringPipeline: 'hiringPipeline',
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
  redFlags: 'redFlags'
};

// ==================== LIVE SYNC ENGINE ====================

/**
 * Global Poller - Pulled by AuthContext every 3s
 */
export const syncAllFromCloud = async () => {
  try {
    const cloudData = await CloudStorage.fetchAll();
    if (!cloudData) return liveCache;

    // Merge cloud data into our live cache
    // We favor cloud data as the master
    Object.keys(cloudData).forEach(tabName => {
      if (Array.isArray(cloudData[tabName])) {
        liveCache[tabName] = cloudData[tabName];
      }
    });

    console.log('[LIVE SYNC] Pulse complete - Cloud state mirrored to memory');
    return liveCache;
  } catch (error) {
    console.error('[LIVE SYNC] Pulse failed:', error);
    return liveCache;
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
  
  // Instant Push
  await CloudStorage.update(tableName, liveCache[tableName]);
  return record;
};

export const updateInDB = async (tableName, record) => {
  if (!liveCache[tableName]) liveCache[tableName] = [];
  liveCache[tableName] = liveCache[tableName].map(r => r.id === record.id ? record : r);
  
  // Instant Push
  await CloudStorage.update(tableName, liveCache[tableName]);
  return record;
};

export const deleteFromDB = async (tableName, id) => {
  if (!liveCache[tableName]) return true;
  liveCache[tableName] = liveCache[tableName].filter(r => r.id !== id);
  
  // ATOMIC DELETE PUSH
  await CloudStorage.update(tableName, null, 'delete', id);
  return true;
};

export const clearTableDB = async (tableName) => {
  liveCache[tableName] = [];
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
