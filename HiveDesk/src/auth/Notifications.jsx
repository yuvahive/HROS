import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { HiveDeskStorage } from '../services/HiveDeskStorage';
import { useAuth } from './AuthContext';
import { realtimeSync } from '../services/realtimeSync';

const NotificationContext = createContext(null);

let swRegistration = null;

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return swRegistration;
  } catch (e) {
    console.warn('[HiveDesk] SW registration failed:', e);
    return null;
  }
}

function fireBrowserNotification(title, body, url) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  if (swRegistration && swRegistration.active) {
    swRegistration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      notification: { title, body, tag: `hivedesk-${Date.now()}`, url }
    });
  } else {
    new Notification(title, { body, icon: '/favicon.svg', tag: `hivedesk-${Date.now()}` });
  }
}

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const seenIdsRef = useRef(new Set());
  const initialLoadDone = useRef(false);

  // Register service worker
  useEffect(() => {
    registerServiceWorker();
    realtimeSync.init();
    return () => realtimeSync.destroy();
  }, []);

  const processNotifications = useCallback(async (silent = false) => {
    if (!currentUser?.id) return;
    if (!silent) setLoading(true);
    try {
      const data = await HiveDeskStorage.getAll('HiveDeskNotifications');
      const mine = data.filter(n => n.userId === currentUser.id);
      mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Detect NEW unread → fire browser push
      if (initialLoadDone.current) {
        const newUnread = mine.filter(n =>
          (n.isRead === false || n.isRead === 'false') && !seenIdsRef.current.has(n.id)
        );
        newUnread.forEach(n => {
          fireBrowserNotification(
            n.title || 'HiveDesk',
            n.message || '',
            n.link ? `/${n.link}` : '/'
          );
        });
      }

      mine.forEach(n => seenIdsRef.current.add(n.id));
      initialLoadDone.current = true;
      setNotifications(mine);
    } catch (e) { console.error('[HiveDesk] Notification load failed:', e); }
    setLoading(false);
  }, [currentUser?.id]);

  // Initial load + real-time listener
  useEffect(() => {
    if (!currentUser?.id) return;
    processNotifications();
    setLive(true);

    // Listen for real-time updates from other tabs or polling
    const unsub = realtimeSync.onData(() => processNotifications(true));

    // Start smart polling (5s, diff-based)
    realtimeSync.startPolling(async () => {
      const data = await HiveDeskStorage.getAll('HiveDeskNotifications');
      return data;
    });

    return () => {
      unsub();
      realtimeSync.stopPolling();
      setLive(false);
    };
  }, [currentUser?.id, processNotifications]);

  const unread = notifications.filter(n => n.isRead === false || n.isRead === 'false');
  const unreadCount = unread.length;

  const markRead = useCallback(async (ids = []) => {
    if (!currentUser?.id) return;
    await HiveDeskStorage.markNotificationsRead(currentUser.id, ids);
    setNotifications(prev => prev.map(n => {
      if (ids.length === 0 || ids.includes(n.id)) return { ...n, isRead: true };
      return n;
    }));
    // Broadcast change to other tabs
    realtimeSync.broadcast('NOTIFICATION_READ', { userId: currentUser.id, ids });
  }, [currentUser?.id]);

  const markAllRead = useCallback(async () => {
    if (!currentUser?.id) return;
    await HiveDeskStorage.markNotificationsRead(currentUser.id, []);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    realtimeSync.broadcast('NOTIFICATION_READ_ALL', { userId: currentUser.id });
  }, [currentUser?.id]);

  const notify = useCallback(async ({ userId, type, title, message, resourceId, resourceType, fromUserId, fromUserName, link }) => {
    await HiveDeskStorage.createNotification({
      userId, type: type || 'info', title, message,
      resourceId: resourceId || '', resourceType: resourceType || '',
      fromUserId: fromUserId || '', fromUserName: fromUserName || '',
      link: link || ''
    });

    // Fire browser push for self immediately
    if (userId === currentUser?.id) {
      fireBrowserNotification(title, message, link ? `/${link}` : '/');
    }

    // Broadcast to all tabs
    realtimeSync.broadcast('NEW_NOTIFICATION', { userId, title, message });
  }, [currentUser?.id]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, unread, loading, live,
      markRead, markAllRead, notify, refresh: () => processNotifications(),
      requestPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
