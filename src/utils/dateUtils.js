// Date utility functions
export const getDayName = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getMonthName = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long' });
};

export const getFormattedDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const getFormattedDateTime = (date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

export const isSameMonth = (date1, date2) => {
  return date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

export const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  return new Date(d.setDate(diff));
};

export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  return { daysInMonth, startingDayOfWeek };
};

export const getPreviousMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
};

export const getNextMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

export const getWeekDays = (date) => {
  const start = getStartOfWeek(date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
};

export const isToday = (date) => {
  return isSameDay(date, new Date());
};

export const isOverdue = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

export const getTimeString = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

export const getDateString = (date) => {
  return date.toISOString().split('T')[0];
};

export const isWithin24Hours = (date) => {
  const now = new Date();
  const diff = new Date(date) - now;
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
};

export const getMinutesUntil = (date) => {
  const now = new Date();
  const diff = new Date(date) - now;
  return Math.floor(diff / (1000 * 60));
};

export const getPreviousDay = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
};

export const getNextDay = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
};
