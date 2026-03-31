import { useCallback } from 'react';

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.svg',
        ...options
      });
    }
  }, []);

  const scheduleNotification = useCallback((eventDate, eventTitle, minutesBefore = 15) => {
    const notificationTime = new Date(eventDate).getTime() - (minutesBefore * 60 * 1000);
    const now = new Date().getTime();
    const delay = notificationTime - now;

    if (delay > 0) {
      return setTimeout(() => {
        sendNotification(`Reminder: ${eventTitle}`, {
          body: `Your event starts in ${minutesBefore} minutes`,
          tag: `reminder-${eventTitle}`,
          requireInteraction: true
        });
      }, delay);
    }

    return null;
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    scheduleNotification
  };
};

export default useNotifications;
