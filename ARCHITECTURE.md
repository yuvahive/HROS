# HROS Architecture & Components

## Component Hierarchy

```
App.jsx (Main Application)
├── Sidebar
│   ├── MiniCalendar
│   └── Category Filters
├── Header
│   └── View Switcher (Day/Week/Month)
├── Calendar View (one of):
│   ├── DayView
│   │   └── EventCard (multiple)
│   ├── WeekView
│   │   ├── Day Columns (7)
│   │   └── EventCard (multiple)
│   └── MonthView
│       ├── Day Cells (32-42)
│       └── EventCard (multiple)
├── TodaySchedule (Right Sidebar)
│   └── EventCard (multiple)
└── EventModal
    └── Form Inputs & Buttons
```

## State Management

### Global State (App.jsx)
- `events`: Array of event objects
- `currentDate`: Currently viewing date
- `selectedDate`: Date selected for new event
- `view`: 'day' | 'week' | 'month'
- `isModalOpen`: Boolean for modal visibility
- `editingEvent`: Event being edited or null
- `searchTerm`: Search query string
- `selectedCategories`: Filtered categories
- `selectedPriorities`: Filtered priorities

### Custom Hooks
- `useEvents`: Event CRUD operations
- `useDarkMode`: Theme management
- `useKeyboardShortcuts`: Keyboard event handling
- `useNotifications`: Browser notifications

### Local Storage
- Key: `hros_events`
- Key: `hros_dark_mode`

## Data Models

### Event Object
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  date: string (YYYY-MM-DD),
  startTime: string (HH:MM),
  endTime: string (HH:MM),
  category: 'Meeting' | 'Call' | 'Task' | 'Personal',
  priority: 'low' | 'medium' | 'high',
  isCompleted: boolean,
  createdAt: string (ISO),
  updatedAt?: string (ISO)
}
```

### Category Object
```javascript
{
  name: string,
  color: string (hex),
  bgColor: string (Tailwind class),
  textColor: string (Tailwind class),
  borderColor: string (Tailwind class)
}
```

## Utility Modules

### storage.js
- `saveEvents(events)`: Save to localStorage
- `loadEvents()`: Load from localStorage
- `deleteEvent(id, events)`: Remove from array
- `updateEvent(id, changes, events)`: Update in array
- `addEvent(event, events)`: Add to array
- `exportEvents(events)`: Download JSON
- `importEvents(file)`: Import from JSON

### dateUtils.js
- Calendar manipulation
- Date comparisons
- Time formatting
- Week/month calculations

### constants.js
- Category definitions
- Priority definitions
- Keyboard shortcuts map

### eventHelpers.js
- Event filtering & sorting
- Event statistics
- Duration calculations
- Event merging

## File Structure

```
src/
├── components/
│   ├── DayView.jsx
│   ├── EventCard.jsx
│   ├── EventModal.jsx
│   ├── Header.jsx
│   ├── MiniCalendar.jsx
│   ├── MonthView.jsx
│   ├── Sidebar.jsx
│   ├── TodaySchedule.jsx
│   └── WeekView.jsx
├── hooks/
│   ├── useDarkMode.js
│   ├── useEvents.js
│   ├── useKeyboardShortcuts.js
│   └── useNotifications.js
├── utils/
│   ├── constants.js
│   ├── dateUtils.js
│   ├── eventHelpers.js
│   └── storage.js
├── styles/
│   └── index.css
├── App.jsx
└── main.jsx

public/
├── index.html
└── favicon.svg

Configuration Files:
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── GETTING_STARTED.md
└── ARCHITECTURE.md
```

## Event Flow

### Creating an Event
1. User clicks "New Event" or presses N
2. Modal opens with selectedDate
3. User fills form
4. onSave is called with formData
5. generateUUID creates unique ID
6. addEvent adds to state
7. saveEvents persists to localStorage
8. Modal closes

### Editing an Event
1. User clicks Edit on event card
2. Modal opens with initialEvent
3. Form preloads event data
4. User modifies data
5. onSave is called with eventId
6. updateEvent modifies in state
7. saveEvents persists changes
8. Modal closes

### Deleting an Event
1. User clicks Delete
2. deleteEvent removes from state
3. saveEvents persists deletion

### View Switching
1. User clicks view button or presses shortcut
2. setView updates state
3. Component re-renders with appropriate view
4. Navigation buttons update prev/next functions

### Filtering Events
1. User toggles category filter
2. selectedCategories state updates
3. getEventsForDate filters by category
4. Components re-render filtered events

## Performance Optimizations

1. **Memoization**: useCallback for event handlers
2. **Lazy Loading**: Only render visible months/days
3. **Event Delegation**: Single handlers run multiple events
4. **Efficient Filtering**: Pre-filtered event arrays
5. **CSS Transitions**: Hardware-accelerated animations
6. **Responsive Images**: Scalable SVG favicon
7. **Bundle Splitting**: Vite code splitting

## Browser APIs Used

- **localStorage**: Data persistence
- **Notification API**: Browser notifications
- **setTimeout**: Notification scheduling
- **FileReader API**: Import events
- **Blob API**: Export events
- **Date API**: Date calculations
- **matchMedia**: Dark mode detection

## Dependencies

- **react** (^18.2.0): UI framework
- **react-dom** (^18.2.0): DOM rendering
- **lucide-react** (^0.263.1): Icons
- **clsx** (^2.0.0): Class name conditional
- **tailwindcss** (^3.3.0): CSS framework
- **vite** (^4.3.0): Build tool

## Responsive Design

- Mobile: Full width, stacked layout
- Tablet: 2-column layout
- Desktop: 3-column layout with sidebar

## Accessibility Features

- Semantic HTML
- Keyboard navigation
- Focus indicators
- Color contrast
- ARIA labels where needed
- Screen reader friendly

## Security Considerations

- No external API calls
- No authentication required
- Data stays in browser (localStorage)
- No third-party scripts
- XSS protection via React
- CSRF not applicable (no server)

## Testing Recommendations

- Unit tests for utility functions
- Component tests for React components
- Integration tests for workflows
- E2E tests for user flows
- Browser testing across versions
