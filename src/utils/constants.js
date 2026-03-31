// Constants for the app
export const CATEGORIES = [
  { name: 'Meeting', color: '#3b82f6', bgColor: 'bg-blue-100', textColor: 'text-blue-900', borderColor: 'border-blue-200' },
  { name: 'Call', color: '#10b981', bgColor: 'bg-green-100', textColor: 'text-green-900', borderColor: 'border-green-200' },
  { name: 'Task', color: '#f59e0b', bgColor: 'bg-amber-100', textColor: 'text-amber-900', borderColor: 'border-amber-200' },
  { name: 'Personal', color: '#8b5cf6', bgColor: 'bg-purple-100', textColor: 'text-purple-900', borderColor: 'border-purple-200' },
];

export const PRIORITIES = [
  { name: 'Low', value: 'low', color: '#6b7280' },
  { name: 'Medium', value: 'medium', color: '#f59e0b' },
  { name: 'High', value: 'high', color: '#ef4444' },
];

export const KEYBOARD_SHORTCUTS = {
  NEW_EVENT: 'n',
  DAY_VIEW: 'd',
  WEEK_VIEW: 'w',
  MONTH_VIEW: 'm',
  TODAY: 't',
  SEARCH: '/',
};

export const getCategoryByName = (name) => {
  return CATEGORIES.find(cat => cat.name === name) || CATEGORIES[0];
};

export const getPriorityByValue = (value) => {
  return PRIORITIES.find(p => p.value === value) || PRIORITIES[1];
};
