/**
 * Google Sheets Cloud Storage Service
 * Communicates with the GAS Web App Bridge
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxczr_BAqXdmta5XMBxKibIMJlwZLGox-LknMoNRCaIkgL1JERqDgP1vmgfNuMWvuScIw/exec';
const GAS_API_KEY = 'hros-secure-key-2026';
const FETCH_TIMEOUT = 30000;
const UPDATE_TIMEOUT = 15000;

// Mapping: GAS sheet tab names → frontend STORES keys
// Only needed for names that differ. Same names pass through.
const SHEET_TO_STORE = {
  'People': 'people',
  'Teams': 'teams',
  'HiringPipeline': 'hiringPipeline',
  'Internships': 'internships',
  'Onboarding': 'onboarding',
  'Exits': 'exits',
  'WorkLogs': 'workLogs',
  'Projects': 'projects',
  'Tasks': 'tasks',
  'TaskComments': 'taskComments',
  'CheckIns': 'checkIns',
  'OneOnOnes': 'oneOnOnes',
  'Decisions': 'decisions',
  'ActionItems': 'actionItems',
  'Skills': 'skills',
  'TimeOff': 'timeOff',
  'CompensationHistory': 'compensationHistory',
  'TeamDynamics': 'teamDynamics',
  'RedFlags': 'redFlags',
  'Events': 'events',
  'WorkUploads': 'workUploads',
};

// Reverse mapping: frontend STORES keys → GAS sheet tab names
const STORE_TO_SHEET = {};
Object.entries(SHEET_TO_STORE).forEach(([sheet, store]) => {
  STORE_TO_SHEET[store] = sheet;
});

function mapSheetToStore(sheetName) {
  return SHEET_TO_STORE[sheetName] || sheetName;
}

function mapStoreToSheet(storeKey) {
  return STORE_TO_SHEET[storeKey] || storeKey;
}

export const CloudStorage = {
  /**
   * Fetch all system data from the cloud
   * Returns: { "people": [...], "Users": [...], ... }
   */
  async fetchAll() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error('Cloud sync timeout'));
      }, FETCH_TIMEOUT);

      const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();

      if (raw.error) throw new Error(raw.error);

      // Map sheet tab names to STORES keys
      const data = {};
      Object.keys(raw).forEach(sheetName => {
        const storeKey = mapSheetToStore(sheetName);
        data[storeKey] = Array.isArray(raw[sheetName]) ? raw[sheetName] : [];
      });
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update or delete records in the cloud
   */
  async update(type, data, action = 'update', id = null) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error('Cloud update timeout'));
      }, UPDATE_TIMEOUT);

      const sheetName = mapStoreToSheet(type);
      const gasAction = action === 'delete' ? 'delete' : 'upsert';
      const payload = { key: GAS_API_KEY, type: sheetName, action: gasAction };
      if (gasAction === 'delete') {
        payload.id = id;
      } else {
        payload.data = Array.isArray(data) ? data : [data];
      }

      const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 200;
    } catch (error) {
      return false;
    }
  }
};
