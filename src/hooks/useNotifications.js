import { useCallback, useEffect, useRef } from 'react';
import { realtimeSync } from '../services/realtimeSync';

let swRegistration = null;

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return swRegistration;
  } catch (e) { return null; }
}

function firePush(title, body, url) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (swRegistration && swRegistration.active) {
    swRegistration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      notification: { title, body, tag: `hros-${Date.now()}`, url }
    });
  } else {
    new Notification(title, { body, icon: '/favicon.svg' });
  }
}

export const useNotifications = () => {
  useEffect(() => {
    registerServiceWorker();
    realtimeSync.init();
    return () => realtimeSync.destroy();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      return (await Notification.requestPermission()) === 'granted';
    }
    return false;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    firePush(title, options.body || '', options.url);
  }, []);

  const scheduleNotification = useCallback((eventDate, eventTitle, minutesBefore = 15) => {
    const delay = new Date(eventDate).getTime() - Date.now() - (minutesBefore * 60 * 1000);
    if (delay > 0) {
      return setTimeout(() => {
        firePush(`Reminder: ${eventTitle}`, `Your event starts in ${minutesBefore} minutes`);
      }, delay);
    }
    return null;
  }, []);

  return { requestPermission, sendNotification, scheduleNotification };
};

export default useNotifications;
