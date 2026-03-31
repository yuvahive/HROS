# Component Index

This file documents all available components and their usage.

## Components

### EventModal
Modal for creating and editing events.

**Props:**
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close handler
- `onSave` (function): Save handler with formData and eventId
- `initialEvent` (object): Event to edit, null for create
- `selectedDate` (Date): Pre-selected date

**Example:**
```jsx
<EventModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSave={handleSaveEvent}
  initialEvent={editingEvent}
  selectedDate={currentDate}
/>
```

### EventCard
Displays a single event with edit/delete options.

**Props:**
- `event` (object): Event to display
- `onEdit` (function): Edit handler
- `onDelete` (function): Delete handler
- `onToggleComplete` (function): Toggle completion

**Example:**
```jsx
<EventCard
  event={event}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleComplete={handleToggle}
/>
```

### MiniCalendar
Compact calendar view for date selection.

**Props:**
- `currentDate` (Date): Month to display
- `onDateSelect` (function): Date selection handler
- `selectedDate` (Date): Currently selected date

**Example:**
```jsx
<MiniCalendar
  currentDate={currentDate}
  onDateSelect={setSelectedDate}
  selectedDate={selectedDate}
/>
```

### Sidebar
Main navigation and filter sidebar.

**Props:**
- `currentDate` (Date): Current viewing date
- `selectedDate` (Date): Selected date
- `onDateSelect` (function): Date change handler
- `onNewEvent` (function): New event handler
- `selectedCategories` (array): Active categories
- `onCategoryToggle` (function): Category toggle handler
- `selectedPriorities` (array): Active priorities
- `onPriorityToggle` (function): Priority toggle handler
- `searchTerm` (string): Search query
- `onSearchChange` (function): Search change handler
- `onExport` (function): Export handler
- `onImport` (function): Import handler
- `isDark` (boolean): Dark mode state
- `onToggleDarkMode` (function): Dark mode toggle

### TodaySchedule
Shows today's events and upcoming events.

**Props:**
- `events` (array): All events
- `onEdit` (function): Edit handler
- `onDelete` (function): Delete handler
- `onToggleComplete` (function): Toggle completion

### MonthView
Calendar month grid view.

**Props:**
- `events` (array): All events
- `currentDate` (Date): Month to display
- `onPrevious` (function): Previous month handler
- `onNext` (function): Next month handler
- `onEditEvent` (function): Edit event handler
- `onDeleteEvent` (function): Delete event handler
- `onToggleComplete` (function): Toggle completion
- `selectedCategories` (array): Filter categories
- `searchTerm` (string): Search term

### WeekView
Calendar week column view.

**Props:**
- Same as MonthView

### DayView
Detailed daily schedule view.

**Props:**
- Same as MonthView

### Header
Top navigation bar with view switcher.

**Props:**
- `view` (string): Current view ('day', 'week', 'month')
- `onViewChange` (function): View change handler
- `searchActive` (boolean): Search mode
- `onSearchToggle` (function): Search toggle
- `isDark` (boolean): Dark mode state

## Import Structure

```javascript
// Components
import EventModal from './components/EventModal'
import EventCard from './components/EventCard'
import MiniCalendar from './components/MiniCalendar'
import Sidebar from './components/Sidebar'
import TodaySchedule from './components/TodaySchedule'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import DayView from './components/DayView'
import Header from './components/Header'

// Hooks
import useEvents from './hooks/useEvents'
import useDarkMode from './hooks/useDarkMode'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import useNotifications from './hooks/useNotifications'

// Utils
import { saveEvents, loadEvents, exportEvents, importEvents } from './utils/storage'
import * as dateUtils from './utils/dateUtils'
import { CATEGORIES, PRIORITIES } from './utils/constants'
import * as eventHelpers from './utils/eventHelpers'
```

## Creating Custom Components

1. Create file in `src/components/`
2. Export as named export
3. Import dependencies
4. Use hooks for state
5. Accept props for configuration
6. Use Tailwind classes for styling
7. Include event handlers

Example:
```jsx
import React from 'react'

export const MyComponent = ({ title, onClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-bold">{title}</h2>
      <button
        onClick={onClick}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Click me
      </button>
    </div>
  )
}

export default MyComponent
```
