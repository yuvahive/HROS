# HROS - Life Management Calendar

A powerful, modern personal calendar and task management web app built with React and Tailwind CSS. Perfect for tracking meetings, calls, tasks, and daily schedules efficiently.

## Features

### 📅 Calendar Views
- **Month View** - See all your events at a glance
- **Week View** - Focused week planning
- **Day View** - Detailed hourly schedule

### ✅ Smart Task Management
- Create events with title, description, date, and time
- Categorize events (Meeting, Call, Task, Personal)
- Set priorities (Low, Medium, High)
- Mark tasks as completed
- Track overdue tasks
- Color-coded events for easy identification

### 🎯 Productivity Features
- **Today's Schedule Panel** - See your day at a glance
- **Upcoming Events** - Get a heads-up for events in the next 24 hours
- **Smart Reminders** - Browser notifications 15 minutes before events
- **Overdue Highlighting** - Never miss important tasks

### 🔍 Search & Filter
- Search events by title
- Filter by category
- Filter by priority

### ⌨️ Keyboard Shortcuts
- `N` - Create new event
- `D/W/M` - Switch between Day/Week/Month views
- `T` - Jump to today
- `/` - Focus search

### 🌓 Dark/Light Mode
- Automatic dark mode detection
- Toggle between themes
- Persistent theme preference

### 💾 Data Management
- All data stored in browser's localStorage
- Auto-loads on refresh
- Export events as JSON
- Import events from JSON file

### 📱 Responsive Design
- Works perfectly on desktop
- Mobile-optimized interface
- Touch-friendly controls

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/HROS.git
cd HROS
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Deploying to GitHub Pages

1. Update the `vite.config.js` file with your repository name:
```javascript
export default defineConfig({
  base: '/your-repo-name/',
  ...
})
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

Or manually:
```bash
npm run build
npx gh-pages -d dist
```

## Project Structure

```
src/
├── components/        # React components
│   ├── EventModal.jsx      # Event creation/editing modal
│   ├── EventCard.jsx       # Event display card
│   ├── MonthView.jsx       # Month calendar view
│   ├── WeekView.jsx        # Week calendar view
│   ├── DayView.jsx         # Day calendar view
│   ├── TodaySchedule.jsx   # Today's schedule panel
│   ├── MiniCalendar.jsx    # Sidebar mini calendar
│   ├── Sidebar.jsx         # Main sidebar
│   └── Header.jsx          # Top navigation
├── hooks/            # Custom React hooks
│   ├── useEvents.js        # Event management
│   ├── useDarkMode.js      # Dark mode toggle
│   ├── useKeyboardShortcuts.js  # Keyboard shortcuts
│   └── useNotifications.js # Browser notifications
├── utils/            # Utility functions
│   ├── storage.js    # localStorage operations
│   ├── dateUtils.js  # Date manipulation
│   └── constants.js  # App constants
├── styles/           # CSS styles
│   └── index.css     # Global styles
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Technology Stack

- **React** - UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Lightning-fast build tool
- **LocalStorage API** - Client-side data persistence
- **Lucide React** - Beautiful, consistent icons

## Usage Guide

### Creating an Event
1. Click the "New Event (N)" button or press `N`
2. Fill in the event details
3. Select a category and priority
4. Click "Create Event"

### Editing an Event
1. Click the "Edit" button on any event card
2. Modify the details
3. Click "Update Event"

### Deleting an Event
1. Hover over an event card
2. Click the "Delete" button

### Switching Views
- Use the buttons in the top navigation: Day (D), Week (W), Month (M)
- Or use keyboard shortcuts

### Exporting Events
1. Click the "Export" button in the sidebar
2. Your events will be saved as a JSON file

### Importing Events
1. Click the "Import" button in the sidebar
2. Select a previously exported JSON file
3. Imported events will be added to your calendar

### Setting Reminders
- Events automatically trigger browser notifications 15 minutes before the scheduled time
- Allow notifications when prompted by the browser

## Data Format

Events are stored with the following structure:
```javascript
{
  id: "unique-id",
  title: "Event Title",
  description: "Event description",
  date: "2024-03-27",
  startTime: "10:00",
  endTime: "11:00",
  category: "Meeting", // Meeting, Call, Task, Personal
  priority: "medium",  // low, medium, high
  isCompleted: false,
  createdAt: "2024-03-27T10:00:00Z"
}
```

## Local Storage

The app stores data in `localStorage` under the key `hros_events`. The data is automatically persisted whenever you add, edit, or delete an event.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- ⚡ Fast load times with Vite
- 📦 Optimized bundle size
- 🎯 Efficient re-renders with React hooks
- 💾 Lazy loading where applicable

## Tips & Tricks

1. **Color Code Your Events** - Use categories to visually organize your calendar
2. **Use Priority Levels** - Mark important tasks as High priority to stand out
3. **Search Regularly** - Use `/` to quickly find events
4. **Export Backup** - Periodically export your events as a backup
5. **Mobile First** - The app works great on mobile for quick event checks

## Keyboard Shortcuts Quick Reference

| Key | Action |
|-----|--------|
| N | New Event |
| D | Day View |
| W | Week View |
| M | Month View |
| T | Today |
| / | Search |

## Troubleshooting

### Events not saving?
- Check browser's localStorage is enabled
- Check you have storage space available
- Try clearing browser cache and reload

### Notifications not working?
- Allow notifications when prompted by browser
- Check browser notification settings
- Ensure JavaScript is enabled

### Dark mode not working?
- Clear localStorage: `localStorage.clear()`
- Refresh the page

## Future Enhancements

Possible features for future versions:
- Recurring events
- Event reminders with custom intervals
- Collaboration features
- Sync across devices
- Voice input for events
- Advanced scheduling (time zones, calendars)
- Analytics dashboard

## Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please create an issue on GitHub.

---

Made with ❤️ for better life management
