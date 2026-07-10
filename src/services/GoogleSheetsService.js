/**
 * Google Sheets Cloud Storage Service
 * Communicates with the GAS Web App Bridge
 * 
 * Strategy: CORS fetch first, JSONP fallback for GET if CORS fails.
 */

const GAS_URL = import.meta.env.VITE_GAS_URL || import.meta.env.REACT_APP_GAS_URL;
const GAS_API_KEY = import.meta.env.VITE_GAS_API_KEY || import.meta.env.REACT_APP_GAS_API_KEY;

if (!GAS_URL || !GAS_API_KEY) {
  console.warn('[SHEETS] Missing VITE_GAS_URL or VITE_GAS_API_KEY in environment');
}

const FETCH_TIMEOUT = 30000;
const UPDATE_TIMEOUT = 15000;

// Mapping: GAS sheet tab names → frontend STORES keys
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

/**
 * JSONP fetch fallback for GET requests when CORS is blocked.
 * Creates a <script> tag pointing to the GAS URL with a callback param.
 */
function jsonpFetch(url) {
  return new Promise((resolve, reject) => {
    const callbackName = '_hros_jsonp_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, FETCH_TIMEOUT);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    const script = document.createElement('script');
    script.src = url + '&callback=' + callbackName;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP load error'));
    };
    document.head.appendChild(script);
  });
}

export const CloudStorage = {
  /**
   * Fetch all system data from the cloud.
   * Tries CORS fetch first; falls back to JSONP if blocked.
   */
  async fetchAll() {
    // --- attempt 1: CORS fetch ---
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();
      if (raw.error) throw new Error(raw.error);

      const data = {};
      Object.keys(raw).forEach(sheetName => {
        const storeKey = mapSheetToStore(sheetName);
        data[storeKey] = Array.isArray(raw[sheetName]) ? raw[sheetName] : [];
      });
      return data;
    } catch (_) {
      // CORS blocked or network error — fall through to JSONP
    }

    // --- attempt 2: JSONP fallback ---
    try {
      const raw = await jsonpFetch(`${GAS_URL}?key=${GAS_API_KEY}`);
      if (raw.error) throw new Error(raw.error);

      const data = {};
      Object.keys(raw).forEach(sheetName => {
        const storeKey = mapSheetToStore(sheetName);
        data[storeKey] = Array.isArray(raw[sheetName]) ? raw[sheetName] : [];
      });
      return data;
    } catch (_) {
      return null;
    }
  },

  /**
   * Update or delete records in the cloud.
   * POST with text/plain avoids CORS preflight; uses no-cors as last resort.
   */
  async update(type, data, action = 'update', id = null) {
    const sheetName = mapStoreToSheet(type);
    const gasAction = action === 'delete' ? 'delete' : 'upsert';
    const payload = { key: GAS_API_KEY, type: sheetName, action: gasAction };
    if (gasAction === 'delete') {
      payload.id = id;
    } else {
      payload.data = Array.isArray(data) ? data : [data];
    }

    // --- attempt 1: normal CORS POST ---
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPDATE_TIMEOUT);

      const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok || response.status === 200;
    } catch (_) {
      // fall through
    }

    // --- attempt 2: no-cors POST (request goes through, response opaque) ---
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPDATE_TIMEOUT);

      await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return true; // opaque but request reached server
    } catch (_) {
      return false;
    }
  }
};
