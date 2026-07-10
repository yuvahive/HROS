// Real-time sync service — BroadcastChannel + smart diff polling
const CHANNEL_NAME = 'hros-sync';
const POLL_INTERVAL = 5000;
let channel = null;
let listeners = new Set();
let lastDataHash = '';
let pollTimer = null;
let active = true;

function hashData(data) {
  try { return JSON.stringify(data).length; } catch { return String(Date.now()); }
}

function init() {
  if (channel) return;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'DATA_CHANGED') listeners.forEach(fn => fn(payload));
    };
  }
  window.addEventListener('storage', (e) => {
    if (e.key === 'hros-sync-event') {
      try { listeners.forEach(fn => fn(JSON.parse(e.newValue))); } catch {}
    }
  });
}

function broadcast(type, payload) {
  if (channel) channel.postMessage({ type, payload });
  try { localStorage.setItem('hros-sync-event', JSON.stringify({ type, payload, ts: Date.now() })); } catch {}
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

function onData(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function destroy() { stopPolling(); listeners.clear(); if (channel) { channel.close(); channel = null; } }

export const realtimeSync = { init, broadcast, startPolling, stopPolling, onData, destroy };
export default realtimeSync;
