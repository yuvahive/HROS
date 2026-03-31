import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekDays, getFormattedDate, isSameDay } from '../utils/dateUtils';
import EventCard from './EventCard';

export const WeekView = ({
  events,
  currentDate,
  onPrevious,
  onNext,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  selectedCategories,
  searchTerm
}) => {
  const weekDays = getWeekDays(currentDate);

  const getEventsForDate = (date) => {
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        if (!isSameDay(eventDate, date)) return false;
        if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) return false;
        if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const startDate = weekDays[0];
  const endDate = weekDays[6];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getFormattedDate(startDate)} - {getFormattedDate(endDate)}
        </h2>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRight size={24} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Days columns */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 flex-1 overflow-hidden">
        {weekDays.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-800 p-3 overflow-y-auto ${
                isToday ? 'ring-2 ring-inset ring-blue-500' : ''
              }`}
            >
              <div className={`text-sm font-bold mb-3 text-center p-2 rounded ${
                isToday
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div>{day.getDate()}</div>
              </div>
              <div className="space-y-2">
                {dayEvents.map(event => (
                  <div key={event.id} className="text-xs">
                    <EventCard
                      event={event}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                      onToggleComplete={onToggleComplete}
                    />
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-2 text-center">No events</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
