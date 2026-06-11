import { HiveDeskStorage } from './HiveDeskStorage';

let cachedConfig = null;

export async function loadConfig() {
  const rows = await HiveDeskStorage.getConfig();
  const config = {};
  rows.forEach(row => {
    let val = row.value;
    if (row.type === 'number') val = Number(val) || 0;
    else if (row.type === 'boolean') val = val === 'true';
    else if (row.type === 'json') {
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        // Already parsed by GAS backend
      } else {
        try { val = JSON.parse(val); } catch { val = []; }
      }
    }
    config[row.key] = val;
  });
  cachedConfig = config;
  return config;
}

export function getCachedConfig() {
  return cachedConfig || {};
}

export function getConfigValue(key, fallback) {
  if (!cachedConfig) return fallback;
  const val = cachedConfig[key];
  return val !== undefined && val !== null && val !== '' ? val : fallback;
}

export async function updateConfigValue(key, value, userName) {
  const res = await HiveDeskStorage.updateConfig(key, String(value), userName);
  if (res.success && cachedConfig) {
    cachedConfig[key] = value;
  }
  return res;
}

export function getAllConfigRows() {
  return HiveDeskStorage.getConfig();
}
