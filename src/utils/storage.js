// localStorage utility functions
const STORAGE_KEY = 'hros_events';

export const saveEvents = (events) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('Failed to save events:', error);
    return false;
  }
};

export const loadEvents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
};

export const deleteEvent = (eventId, events) => {
  return events.filter(event => event.id !== eventId);
};

export const updateEvent = (eventId, updatedEvent, events) => {
  return events.map(event => 
    event.id === eventId ? { ...event, ...updatedEvent } : event
  );
};

export const addEvent = (event, events) => {
  return [...events, event];
};

// Export events as JSON
export const exportEvents = (events) => {
  const element = document.createElement('a');
  const file = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  element.download = `hros-events-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(element);
  element.click();
  setTimeout(() => {
    URL.revokeObjectURL(element.href);
    document.body.removeChild(element);
  }, 100);
};

// Import events from JSON
export const importEvents = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const events = JSON.parse(e.target.result);
        resolve(events);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
