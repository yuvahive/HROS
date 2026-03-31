import React, { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EventModal from './components/EventModal';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import TodaySchedule from './components/TodaySchedule';
import HROSDashboard from './components/HROSDashboard';
import useEvents from './hooks/useEvents';
import useDarkMode from './hooks/useDarkMode';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useNotifications from './hooks/useNotifications';
import { exportEvents, importEvents } from './utils/storage';
import { setupAutoBackup, isAutoBackupEnabled } from './utils/autoBackup';
import { getPreviousMonth, getNextMonth } from './utils/dateUtils';
import { initializeSampleData } from './utils/sampleData';
import './styles/index.css';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent, bulkImportEvents } = useEvents();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { requestPermission, scheduleNotification } = useNotifications();

  const [view, setView] = useState('month');
  const [appMode, setAppMode] = useState('calendar'); // 'calendar' or 'hros'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Meeting', 'Call', 'Task', 'Personal']);
  const [selectedPriorities, setSelectedPriorities] = useState(['low', 'medium', 'high']);

  // Request notification permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Initialize sample HROS data on first load
  useEffect(() => {
    const initData = async () => {
      try {
        await initializeSampleData();
      } catch (error) {
        console.log('Sample data already exists or error:', error);
      }
    };
    initData();
  }, []);

  // Setup auto-backup on mount
  useEffect(() => {
    if (isAutoBackupEnabled() && events.length > 0) {
      console.log('Auto-backup enabled, scheduling backups...');
      const backupInterval = setupAutoBackup(events, 60); // Every 60 minutes
      return () => {
        if (backupInterval) clearInterval(backupInterval);
      };
    }
  }, [events]);

  // Keyboard shortcuts
  const handleNewEvent = useCallback(() => {
    setSelectedDate(currentDate);
    setEditingEvent(null);
    setIsModalOpen(true);
  }, [currentDate]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleToggleSearch = useCallback(() => {
    // Focus search in sidebar
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  useKeyboardShortcuts({
    ['n']: handleNewEvent,
    ['d']: () => handleViewChange('day'),
    ['w']: () => handleViewChange('week'),
    ['m']: () => handleViewChange('month'),
    ['t']: handleToday,
    ['/']: handleToggleSearch,
  });

  const handlePreviousDate = useCallback(() => {
    setCurrentDate(prev => {
      if (view === 'day') {
        return new Date(prev.setDate(prev.getDate() - 1));
      } else if (view === 'week') {
        return new Date(prev.setDate(prev.getDate() - 7));
      } else {
        return getPreviousMonth(prev);
      }
    });
  }, [view]);

  const handleNextDate = useCallback(() => {
    setCurrentDate(prev => {
      if (view === 'day') {
        return new Date(prev.setDate(prev.getDate() + 1));
      } else if (view === 'week') {
        return new Date(prev.setDate(prev.getDate() + 7));
      } else {
        return getNextMonth(prev);
      }
    });
  }, [view]);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setSelectedDate(new Date(event.date));
    } else {
      setEditingEvent(null);
      setSelectedDate(currentDate);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (formData, eventId) => {
    const eventDateTime = new Date(`${formData.date}T${formData.startTime}`);

    if (eventId) {
      updateEvent(eventId, {
        ...formData,
        date: formData.date,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newEvent = {
        id: generateUUID(),
        ...formData,
        date: formData.date,
        createdAt: new Date().toISOString(),
      };
      addEvent(newEvent);
      // Schedule notification
      scheduleNotification(eventDateTime, formData.title, 15);
    }
  };

  const handleToggleComplete = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      updateEvent(eventId, { isCompleted: !event.isCompleted });
    }
  };

  const handleExport = () => {
    exportEvents(events);
  };

  const handleImport = async (file) => {
    try {
      const importedEvents = await importEvents(file);
      if (Array.isArray(importedEvents)) {
        bulkImportEvents(importedEvents);
        alert(`Successfully imported ${importedEvents.length} events!`);
      }
    } catch (error) {
      alert('Failed to import events: ' + error.message);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePriorityToggle = (priority) => {
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // Generate unique ID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Show login page if not authenticated */}
      {!currentUser ? (
        <LoginPage />
      ) : (
        <>
          {/* HROS Dashboard Mode */}
          {appMode === 'hros' ? (
            <div className="h-screen w-screen">
              <HROSDashboard currentUser={currentUser} logout={logout} />
              <div className="fixed top-4 right-4 z-50">
                <button
                  onClick={() => setAppMode('calendar')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                >
                  ← Back to Calendar
                </button>
              </div>
            </div>
          ) : (
            // Calendar Mode (original UI)
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
              {/* Sidebar */}
              <div className="w-80 hidden md:flex flex-col">
                <Sidebar
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onNewEvent={() => handleOpenModal()}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                  selectedPriorities={selectedPriorities}
                  onPriorityToggle={handlePriorityToggle}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onExport={handleExport}
                  onImport={handleImport}
                  isDark={isDark}
                  onToggleDarkMode={toggleDarkMode}
                  events={events}
                  currentUser={currentUser}
                  onLogout={logout}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                  view={view}
                  onViewChange={handleViewChange}
                  isDark={isDark}
                  onSwitchToHROS={() => setAppMode('hros')}
                  currentUser={currentUser}
                  onLogout={logout}
                />

                <div className="flex-1 overflow-hidden flex gap-4 p-4">
                  {/* Calendar View */}
                  <div className="flex-1 overflow-hidden">
                    {view === 'month' && (
                      <MonthView
                        events={events}
                        currentDate={currentDate}
                        onPrevious={handlePreviousDate}
                        onNext={handleNextDate}
                        onEditEvent={handleOpenModal}
                        onDeleteEvent={deleteEvent}
                        onToggleComplete={handleToggleComplete}
                        selectedCategories={selectedCategories}
                        searchTerm={searchTerm}
                      />
                    )}
                    {view === 'week' && (
                      <WeekView
                        events={events}
                        currentDate={currentDate}
                        onPrevious={handlePreviousDate}
                        onNext={handleNextDate}
                        onEditEvent={handleOpenModal}
                        onDeleteEvent={deleteEvent}
                        onToggleComplete={handleToggleComplete}
                        selectedCategories={selectedCategories}
                        searchTerm={searchTerm}
                      />
                    )}
                    {view === 'day' && (
                      <DayView
                        events={events}
                        currentDate={currentDate}
                        onPrevious={handlePreviousDate}
                        onNext={handleNextDate}
                        onEditEvent={handleOpenModal}
                        onDeleteEvent={deleteEvent}
                        onToggleComplete={handleToggleComplete}
                        selectedCategories={selectedCategories}
                        searchTerm={searchTerm}
                      />
                    )}
                  </div>

                  {/* Today's Schedule Sidebar */}
                  <div className="w-96 hidden lg:block overflow-y-auto">
                    <TodaySchedule
                      events={events}
                      onEdit={handleOpenModal}
                      onDelete={deleteEvent}
                      onToggleComplete={handleToggleComplete}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Modal */}
          {appMode === 'calendar' && (
            <EventModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveEvent}
              initialEvent={editingEvent}
              selectedDate={selectedDate || currentDate}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
