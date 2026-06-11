// Helper functions for common operations

export const getEventsByCategory = (events, category) => {
  return events.filter(e => e.category === category);
};

export const getEventsByPriority = (events, priority) => {
  return events.filter(e => e.priority === priority);
};

export const getCompletedTasks = (events) => {
  return events.filter(e => e.isCompleted);
};

export const getIncompleteTasks = (events) => {
  return events.filter(e => !e.isCompleted);
};

export const searchEvents = (events, searchTerm) => {
  const term = (searchTerm || '').toLowerCase();
  return events.filter(e => 
    (e.title || '').toLowerCase().includes(term) ||
    (e.description && e.description.toLowerCase().includes(term))
  );
};

export const sortEventsByDate = (events) => {
  return [...events].sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });
};

export const sortEventsByPriority = (events) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...events].sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));
};

export const getEventStats = (events) => {
  return {
    total: events.length,
    completed: events.filter(e => e.isCompleted).length,
    incomplete: events.filter(e => !e.isCompleted).length,
    byCategory: {
      meeting: events.filter(e => e.category === 'Meeting').length,
      call: events.filter(e => e.category === 'Call').length,
      task: events.filter(e => e.category === 'Task').length,
      personal: events.filter(e => e.category === 'Personal').length,
    },
    byPriority: {
      high: events.filter(e => e.priority === 'high').length,
      medium: events.filter(e => e.priority === 'medium').length,
      low: events.filter(e => e.priority === 'low').length,
    }
  };
};

export const getDueDate = (event) => {
  return new Date(`${event.date}T${event.endTime}`);
};

export const getEventDuration = (event) => {
  const [startHour, startMin] = event.startTime.split(':').map(Number);
  const [endHour, endMin] = event.endTime.split(':').map(Number);
  
  let hours = endHour - startHour;
  let minutes = endMin - startMin;
  
  if (minutes < 0) {
    hours--;
    minutes += 60;
  }
  
  if (hours < 0) {
    hours += 24;
  }
  
  return { hours, minutes };
};

export const formatDuration = (duration) => {
  const { hours, minutes } = duration;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const isEventEqual = (event1, event2) => {
  return JSON.stringify(event1) === JSON.stringify(event2);
};

export const mergeEvents = (oldEvents, newEvents) => {
  const eventMap = new Map(oldEvents.map(e => [e.id, e]));
  
  newEvents.forEach(newEvent => {
    if (!eventMap.has(newEvent.id)) {
      eventMap.set(newEvent.id, newEvent);
    }
  });
  
  return Array.from(eventMap.values());
};
