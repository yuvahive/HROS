import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPreviousMonth, getNextMonth, getDaysInMonth, isSameDay, isSameMonth, getMonthName } from '../utils/dateUtils';
import EventCard from './EventCard';
import { getCategoryByName } from '../utils/constants';

export const MonthView = ({
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
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const prevMonth = getPreviousMonth(currentDate);
  const nextMonth = getNextMonth(currentDate);
  const prevDaysInMonth = getDaysInMonth(prevMonth).daysInMonth;

  const days = [];

  // Days from previous month
  for (let i = prevDaysInMonth - startingDayOfWeek + 1; i <= prevDaysInMonth; i++) {
    days.push({ date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i), isCurrentMonth: false });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isCurrentMonth: true });
  }

  // Days from next month
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i), isCurrentMonth: false });
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
          {getMonthName(currentDate)} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRight size={24} className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map(day => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800 p-3 text-center font-semibold text-gray-900 dark:text-white"
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 flex-1 overflow-hidden">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDate(day.date);
          const isCurrentMonth = day.isCurrentMonth;
          const isToday = isSameDay(day.date, new Date());

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-800 p-2 min-h-24 overflow-y-auto ${
                isToday ? 'ring-2 ring-inset ring-blue-500' : ''
              } ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900' : ''}`}
            >
              <div className={`text-sm font-semibold mb-2 ${
                isToday
                  ? 'text-blue-600 dark:text-blue-400'
                  : isCurrentMonth
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
