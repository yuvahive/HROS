import { useState, useCallback, useEffect } from 'react';
import { initDB, saveEventsDB, loadEventsDB, deleteEventDB, updateEventDB, addEventDB } from '../utils/indexedDB';
import { saveEvents } from '../utils/storage';
import { CloudStorage } from '../services/GoogleSheetsService';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  // Initialize IndexedDB on mount
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        
        // 1. Try Cloud First
        const cloudData = await CloudStorage.fetchAll();
        let currentEvents = [];
        
        if (cloudData && cloudData.events) {
          currentEvents = cloudData.events;
          await saveEventsDB(currentEvents); // Sync locally
        } else {
          // 2. Fallback to Local
          currentEvents = await loadEventsDB();
        }
        
        setEvents(currentEvents);
        setDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbReady(true);
      }
    };

    initializeDB();
  }, []);

  // Sync to Cloud on change (including deletions/empty list)
  useEffect(() => {
    // Only push if DB is ready AND we have already attempted to load data (prevents wiping cloud on start)
    if (dbReady) {
      CloudStorage.update('events', events);
    }
  }, [events, dbReady]);

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
