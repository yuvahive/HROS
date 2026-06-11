import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HiveDeskStorage } from '../services/HiveDeskStorage';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const data = await HiveDeskStorage.getAll('HiveDeskNotifications');
      const mine = data.filter(n => n.userId === currentUser.id);
      mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(mine);
    } catch (e) { console.error('[HiveDesk] Notification load failed:', e); }
    setLoading(false);
  }, [currentUser?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id, load]);

  const unread = notifications.filter(n => n.isRead === false || n.isRead === 'false');
  const unreadCount = unread.length;

  const markRead = useCallback(async (ids = []) => {
    if (!currentUser?.id) return;
    await HiveDeskStorage.markNotificationsRead(currentUser.id, ids);
    setNotifications(prev => prev.map(n => {
      if (ids.length === 0 || ids.includes(n.id)) return { ...n, isRead: true };
      return n;
    }));
  }, [currentUser?.id]);

  const markAllRead = useCallback(async () => {
    if (!currentUser?.id) return;
    await HiveDeskStorage.markNotificationsRead(currentUser.id, []);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [currentUser?.id]);

  const notify = useCallback(async ({ userId, type, title, message, resourceId, resourceType, fromUserId, fromUserName, link }) => {
    await HiveDeskStorage.createNotification({
      userId, type: type || 'info', title, message,
      resourceId: resourceId || '', resourceType: resourceType || '',
      fromUserId: fromUserId || '', fromUserName: fromUserName || '',
      link: link || ''
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, unread, loading, markRead, markAllRead, notify, refresh: load }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
