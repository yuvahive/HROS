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
  searchTerm,
  onDateSelect
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

  const getSummary = (dayEvents) => {
    if (dayEvents.length === 0) return null;
    
    const counts = {
      M: 0, // Meeting
      P: 0, // Personal
      T: 0, // Task
      C: 0, // Call
      O: 0  // Other
    };

    dayEvents.forEach(e => {
      const char = e.category?.[0]?.toUpperCase() || 'O';
      if (counts.hasOwnProperty(char)) {
        counts[char]++;
      } else {
        counts.O++;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([char, count]) => `${char}${count}`)
      .join(' ');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getMonthName(currentDate)} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button onClick={onPrevious} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md transition shadow-sm hover:shadow-md">
              <ChevronLeft size={18} />
            </button>
            <button onClick={onNext} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md transition shadow-sm hover:shadow-md">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-medium bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner">
          💡 Click a date to view full schedule
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto bg-gray-200 dark:bg-gray-700 no-scrollbar">
        <div className="grid grid-cols-7 gap-px min-h-full auto-rows-fr">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDate(day.date);
            const isCurrentMonth = day.isCurrentMonth;
            const isToday = isSameDay(day.date, new Date());
            const summary = getSummary(dayEvents);

            return (
              <div
                key={idx}
                onClick={() => onDateSelect(day.date)}
                className={`bg-white dark:bg-gray-800 p-2 min-h-[70px] md:min-h-[90px] cursor-pointer transition-all duration-300 hover:z-10 hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex flex-col group border border-gray-100 dark:border-transparent ${
                  isToday ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''
                } ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/40 opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-0.5">
                  <span className={`text-[11px] md:text-sm font-black ${
                    isToday 
                      ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/30' 
                      : isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {!isCurrentMonth && (
                    <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-0.5">
                  {summary ? (
                    <div className="bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all flex items-center gap-1">
                      <p className="text-[9px] md:text-[11px] font-black tracking-tight text-blue-800 dark:text-blue-300">
                        {summary}
                      </p>
                    </div>
                  ) : (
                    isCurrentMonth && <div className="w-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
