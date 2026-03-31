import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPreviousMonth, getNextMonth, getDaysInMonth, isSameDay, isSameMonth } from '../utils/dateUtils';

export const MiniCalendar = ({ currentDate, onDateSelect, selectedDate }) => {
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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-4">
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
          const isToday = isSameDay(day.date, new Date());
          const isCurrentMonth = day.isCurrentMonth;

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(day.date)}
              className={`aspect-square text-xs font-medium rounded transition ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : isToday
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : isCurrentMonth
                  ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
