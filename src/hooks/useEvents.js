import { useState, useCallback, useEffect } from 'react';
import { initDB, saveEventsDB, loadEventsDB, deleteEventDB, updateEventDB, addEventDB } from '../utils/indexedDB';
import { saveEvents } from '../utils/storage';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  // Initialize IndexedDB on mount
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        const loadedEvents = await loadEventsDB();
        setEvents(loadedEvents);
        setDbReady(true);
        console.log('Events loaded from IndexedDB:', loadedEvents.length);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to localStorage if IndexedDB fails
        setDbReady(true);
      }
    };

    initializeDB();
  }, []);

  const addEvent = useCallback((event) => {
    setEvents(prev => {
      const newEvents = [...prev, event];
      saveEventsDB(newEvents).catch(err => console.error('Save failed:', err));
      return newEvents;
    });
  }, []);

  const updateEvent = useCallback((eventId, updatedEvent) => {
    setEvents(prev => {
      const newEvents = prev.map(e => 
        e.id === eventId ? { ...e, ...updatedEvent } : e
      );
      saveEventsDB(newEvents).catch(err => console.error('Update failed:', err));
      return newEvents;
    });
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => {
      const newEvents = prev.filter(e => e.id !== eventId);
      saveEventsDB(newEvents).catch(err => console.error('Delete failed:', err));
      deleteEventDB(eventId).catch(err => console.error('DB delete failed:', err));
      return newEvents;
    });
  }, []);

  const bulkImportEvents = useCallback((importedEvents) => {
    setEvents(prev => {
      const newEvents = [...prev, ...importedEvents];
      saveEventsDB(newEvents).catch(err => console.error('Import failed:', err));
      return newEvents;
    });
  }, []);

  const clearAllEvents = useCallback(() => {
    setEvents([]);
    saveEventsDB([]).catch(err => console.error('Clear failed:', err));
  }, []);

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    bulkImportEvents,
    clearAllEvents,
    dbReady
  };
};

export default useEvents;
