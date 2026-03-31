import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFormattedDate, isSameDay } from '../utils/dateUtils';
import EventCard from './EventCard';

export const DayView = ({
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
  const dayEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      if (!isSameDay(eventDate, currentDate)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) return false;
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getHourEvents = (hour) => {
    return dayEvents.filter(event => {
      const [startHour] = event.startTime.split(':').map(Number);
      return startHour === hour;
    });
  };

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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getFormattedDate(currentDate)}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
          </p>
        </div>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRight size={24} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {dayEvents.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dayEvents.map(event => (
              <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {event.startTime}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      - {event.endTime}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <EventCard
                      event={event}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                      onToggleComplete={onToggleComplete}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No events scheduled for this day
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
