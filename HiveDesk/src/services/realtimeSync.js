// Real-time sync service — BroadcastChannel + smart diff polling
// Works across tabs in same browser. Instant in-app updates.

const CHANNEL_NAME = 'hivedesk-sync';
const POLL_INTERVAL = 5000; // 5 seconds
let channel = null;
let listeners = new Set();
let lastDataHash = '';
let pollTimer = null;
let active = true;

function hashData(data) {
  try {
    return JSON.stringify(data).length + '-' + (data?.HiveDeskNotifications?.length || 0);
  } catch { return String(Date.now()); }
}

function init() {
  if (channel) return;

  // BroadcastChannel for cross-tab instant sync
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'DATA_CHANGED') {
        listeners.forEach(fn => fn(payload));
      }
    };
  }

  // Also listen for localStorage changes (fallback for older browsers)
  window.addEventListener('storage', (e) => {
    if (e.key === 'hivedesk-sync-event') {
      try {
        const payload = JSON.parse(e.newValue);
        listeners.forEach(fn => fn(payload));
      } catch {}
    }
  });

  // Visibility change — resume polling when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && active) startPolling();
  });
}

function broadcast(type, payload) {
  // Broadcast to other tabs
  if (channel) {
    channel.postMessage({ type, payload });
  }
  // Fallback via localStorage
  try {
    localStorage.setItem('hivedesk-sync-event', JSON.stringify({ type, payload, ts: Date.now() }));
  } catch {}
}

function startPolling(fetchFn) {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (document.hidden || !active) return;
    try {
      const data = await fetchFn();
      const hash = hashData(data);
      if (hash !== lastDataHash) {
        lastDataHash = hash;
        listeners.forEach(fn => fn(data));
      }
    } catch {}
  }, POLL_INTERVAL);
}

function stopPolling() {
  active = false;
  if (pollTimer) clearInterval(pollTimer);
}

function onData(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function destroy() {
  stopPolling();
  listeners.clear();
  if (channel) { channel.close(); channel = null; }
}

export const realtimeSync = {
  init,
  broadcast,
  startPolling,
  stopPolling,
  onData,
  destroy,
};

export default realtimeSync;
