import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Tag, Flag } from 'lucide-react';
import { CATEGORIES, PRIORITIES, getCategoryByName, getPriorityByValue } from '../utils/constants';
import { getDateString, getTimeString } from '../utils/dateUtils';

export const EventModal = ({ isOpen, onClose, onSave, initialEvent, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: getDateString(selectedDate || new Date()),
    startTime: '10:00',
    endTime: '11:00',
    category: 'Meeting',
    priority: 'medium',
    isCompleted: false
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title,
        description: initialEvent.description || '',
        date: getDateString(new Date(initialEvent.date)),
        startTime: initialEvent.startTime || '10:00',
        endTime: initialEvent.endTime || '11:00',
        category: initialEvent.category || 'Meeting',
        priority: initialEvent.priority || 'medium',
        isCompleted: initialEvent.isCompleted || false
      });
    } else {
      setFormData(prev => ({
        ...prev,
        date: getDateString(selectedDate || new Date())
      }));
    }
  }, [initialEvent, selectedDate, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    onSave(formData, initialEvent?.id);
    setFormData({
      title: '',
      description: '',
      date: getDateString(new Date()),
      startTime: '10:00',
      endTime: '11:00',
      category: 'Meeting',
      priority: 'medium',
      isCompleted: false
    });
    onClose();
  };

  if (!isOpen) return null;

  const categoryObj = getCategoryByName(formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add event details..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <CalendarIcon size={16} />
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Start
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag size={16} />
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.name }))}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    formData.category === cat.name
                      ? cat.bgColor + ' ' + cat.textColor + ' ring-2 ring-offset-2'
                      : cat.bgColor + ' ' + cat.textColor
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Flag size={16} />
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>
                  {p.name} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Completed */}
          {initialEvent && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isCompleted"
                checked={formData.isCompleted}
                onChange={handleChange}
                id="isCompleted"
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="isCompleted" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Mark as completed
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              {initialEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
