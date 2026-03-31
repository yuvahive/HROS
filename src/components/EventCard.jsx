import React from 'react';
import { Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react';
import { getCategoryByName, getPriorityByValue } from '../utils/constants';
import { getFormattedDateTime, isOverdue } from '../utils/dateUtils';

export const EventCard = ({ event, onEdit, onDelete, onToggleComplete, isDragSource }) => {
  const category = getCategoryByName(event.category);
  const priority = getPriorityByValue(event.priority);
  const eventDate = new Date(event.date);
  const isEventOverdue = isOverdue(eventDate) && !event.isCompleted;

  return (
    <div
      className={`${category.bgColor} ${category.borderColor} border-l-4 p-3 rounded-lg cursor-pointer group hover:shadow-md transition ${
        event.isCompleted ? 'opacity-60' : ''
      } ${isDragSource ? 'opacity-50' : ''}`}
      draggable="true"
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex items-start gap-2">
            <button
              onClick={() => onToggleComplete(event.id)}
              className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
            >
              {event.isCompleted ? (
                <CheckCircle2 size={18} className="text-green-600" />
              ) : (
                <Circle size={18} />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${category.textColor} ${
                event.isCompleted ? 'line-through text-gray-500' : ''
              }`}>
                {event.title}
              </h4>
              {isEventOverdue && !event.isCompleted && (
                <p className="text-xs text-red-600 font-semibold">Overdue</p>
              )}
            </div>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded ${
            priority.value === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' :
            priority.value === 'medium' ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
            'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {priority.name}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Time */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          🕐 {event.startTime} - {event.endTime}
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition pt-1">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-medium py-1 rounded text-xs flex items-center justify-center gap-1 transition"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="flex-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 font-medium py-1 rounded text-xs flex items-center justify-center gap-1 transition"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
