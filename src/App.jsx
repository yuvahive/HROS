import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EventModal from './components/EventModal';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import TodaySchedule from './components/TodaySchedule';
import useEvents from './hooks/useEvents';
import useDarkMode from './hooks/useDarkMode';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useNotifications from './hooks/useNotifications';
import { exportEvents, importEvents } from './utils/storage';
import { setupAutoBackup, isAutoBackupEnabled } from './utils/autoBackup';
import { getPreviousMonth, getNextMonth } from './utils/dateUtils';
import { initializeSampleData } from './utils/sampleData';
import OnboardingPrompt from './components/OnboardingPrompt';
import './styles/index.css';

const HROSDashboard = lazy(() => import('./components/HROSDashboard'));
const HiveDeskDashboard = lazy(() => import('../HiveDesk/src/HiveDeskApp'));

// Generate unique ID (module scope to avoid stale closure)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function AppContent() {
  const { currentUser, logout, cloudStatus, loading: authLoading } = useAuth();
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

  // Listen for HiveDesk "back to calendar" event
  useEffect(() => {
    const handler = () => setAppMode('calendar');
    window.addEventListener('hivedesk-back', handler);
    return () => window.removeEventListener('hivedesk-back', handler);
  }, []);

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
        // Sample data already exists or initialization failed
      }
    };
    initData();
  }, []);

  // Setup auto-backup on mount
  useEffect(() => {
    if (isAutoBackupEnabled() && events.length > 0) {
      const backupInterval = setupAutoBackup(() => events, 60); // Every 60 minutes
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

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Show loading screen during initial cloud sync */}
      {authLoading ? (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic">HROS <span className="text-blue-600 italic">CLOUD</span></h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Synchronizing organizational state...</p>
              </div>
           </div>
        </div>
      ) : appMode === 'hivedesk' ? (
            <div className="h-screen w-screen">
              <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div></div>}>
                <HiveDeskDashboard />
              </Suspense>
            </div>
      ) : !currentUser ? (
        <LoginPage onSwitchToHiveDesk={() => setAppMode('hivedesk')} />
      ) : (
        <>
          {appMode === 'hros' ? (
            <div className="h-screen w-screen">
              <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div></div>}>
                <HROSDashboard
                  currentUser={currentUser}
                  logout={logout}
                  onBackToCalendar={() => setAppMode('calendar')}
                  isDark={isDark}
                  onToggleDarkMode={toggleDarkMode}
                />
              </Suspense>
            </div>
          ) : (
            // Calendar Mode (original UI)
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
              {/* Sidebar */}
              <div className="w-80 hidden md:flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
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
                  currentUser={currentUser}
                  onLogout={logout}
                  cloudStatus={cloudStatus}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                  view={view}
                  onViewChange={handleViewChange}
                  isDark={isDark}
                  onSwitchToHROS={() => setAppMode('hros')}
                  currentUser={currentUser}
                  onLogout={logout}
                />

                <div className="flex-1 min-h-0 overflow-hidden flex gap-4 p-4">
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
                        onDateSelect={setSelectedDate}
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
                        onDateSelect={setSelectedDate}
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
                        onDateSelect={setSelectedDate}
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
                      selectedDate={selectedDate || new Date()}
                      onNewEvent={() => handleOpenModal()}
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
      <OnboardingPrompt />
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
