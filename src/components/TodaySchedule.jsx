import React from 'react';
import { Clock, CheckCircle2, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { isSameDay, isWithin24Hours } from '../utils/dateUtils';
import { getCategoryByName } from '../utils/constants';

export const TodaySchedule = ({ events, onEdit, onDelete, onToggleComplete, selectedDate, onNewEvent }) => {
  const displayDate = selectedDate || new Date();
  const isSelectedToday = isSameDay(displayDate, new Date());
  
  const filteredEvents = events
    .filter(e => isSameDay(new Date(e.date), displayDate))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingEvents = events
    .filter(e => {
      try {
        return isWithin24Hours(new Date(`${e.date}T${e.startTime || '00:00'}`))
      } catch {
        return false
      }
    })
    .filter(e => !isSameDay(new Date(e.date), displayDate))
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
              <Clock size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {isSelectedToday ? "Today's Schedule" : "Day Schedule"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={onNewEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-blue-500/20 group"
            title="Add Event"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {/* Day Events */}
        <div>
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map(event => {
                const category = getCategoryByName(event.category) || { bgColor: 'bg-gray-50', borderColor: 'border-gray-300', textColor: 'text-gray-700' };
                return (
                  <div
                    key={event.id}
                    className={`${category.bgColor} ${category.borderColor} border-l-4 p-4 rounded-xl flex items-start justify-between group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border dark:border-gray-700 ${
                      event.isCompleted ? 'opacity-60 saturate-[0.2]' : ''
                    }`}
                  >
                    <div className="flex-1 flex items-start gap-4">
                      <button
                        onClick={() => onToggleComplete(event.id)}
                        className="mt-1 transition-all duration-300 flex-shrink-0"
                      >
                        {event.isCompleted ? (
                          <CheckCircle2 size={20} className="text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-bold text-sm leading-tight truncate ${category.textColor} ${
                            event.isCompleted ? 'line-through opacity-70' : ''
                          }`}>
                            {event.title}
                          </p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                            event.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {event.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                           <span className="flex items-center gap-1">
                             <Clock size={12} />
                             {event.startTime} - {event.endTime}
                           </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onEdit(event)}
                        className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(event.id)}
                        className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <Zap size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No events for this day
              </p>
              <button 
                onClick={onNewEvent}
                className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Schedule something?
              </button>
            </div>
          )}
        </div>

        {/* Upcoming context */}
        {isSelectedToday && upcomingEvents.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Coming Up (Next 24h)
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const category = getCategoryByName(event.category);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${category.textColor.replace('text-', 'bg-')}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.startTime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
