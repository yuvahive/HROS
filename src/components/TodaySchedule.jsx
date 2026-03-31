import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { isSameDay, isOverdue, getTimeString, isWithin24Hours } from '../utils/dateUtils';
import { getCategoryByName } from '../utils/constants';

export const TodaySchedule = ({ events, onEdit, onDelete, onToggleComplete }) => {
  const today = new Date();
  const todayEvents = events
    .filter(e => isSameDay(new Date(e.date), today))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingEvents = events
    .filter(e => isWithin24Hours(new Date(`${e.date}T${e.startTime}`)))
    .filter(e => !isSameDay(new Date(e.date), today))
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      {/* Today's Schedule */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock size={24} className="text-blue-500" />
          Today's Schedule
        </h2>

        {todayEvents.length > 0 ? (
          <div className="space-y-3">
            {todayEvents.map(event => {
              const category = getCategoryByName(event.category);
              return (
                <div
                  key={event.id}
                  className={`${category.bgColor} ${category.borderColor} border-l-4 p-3 rounded-lg flex items-start justify-between group hover:shadow-md transition ${
                    event.isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex-1 flex items-start gap-3">
                    <button
                      onClick={() => onToggleComplete(event.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
                    >
                      {event.isCompleted ? (
                        <CheckCircle2 size={18} className="text-green-600" />
                      ) : (
                        <div className="w-[18px] h-[18px] border-2 border-current rounded-full" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${category.textColor}`}>
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {event.startTime} - {event.endTime}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onEdit(event)}
                    className="ml-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm italic">
            No events scheduled for today. Enjoy your free time!
          </p>
        )}
      </div>

      {/* Upcoming in 24 hours */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">
            Upcoming (Next 24 hrs)
          </h3>
          <div className="space-y-2">
            {upcomingEvents.map(event => {
              const category = getCategoryByName(event.category);
              return (
                <div
                  key={event.id}
                  className={`${category.bgColor} ${category.borderColor} border-l-4 p-2 rounded text-xs`}
                >
                  <p className={`font-semibold ${category.textColor}`}>
                    {event.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.startTime}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaySchedule;
