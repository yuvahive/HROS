# HROS - Human Resource Operating System

A comprehensive personal calendar and HR management web application built with React, Vite, and Tailwind CSS. Designed for efficient event management, task tracking, HR operations, and team collaboration.

## 🎯 Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser at http://localhost:5173
```

That's it! The app opens with a modern calendar interface ready for use.

---

## 📦 What's Included

### Core Features

#### 📅 **Calendar Views**
- **Month View** - Full calendar overview with all events visible
- **Week View** - Focused 7-day planning with hourly grid
- **Day View** - Detailed hourly schedule with 15-minute increments

#### ✅ **Event Management**
- Create, edit, delete, and complete events
- Event categories: Meeting, Call, Task, Personal
- Priority levels: Low, Medium, High  
- Time tracking and duration management
- Event descriptions and detailed notes

#### 🎯 **Smart Features**
- **Today's Schedule** - Quick overview of your day
- **Upcoming Events** - Next 24-hour preview
- **Overdue Tracking** - Automatic highlighting of past-due tasks
- **Browser Notifications** - 15-minute reminders before events
- **Color-Coded Display** - Visual distinction by category/priority

#### 🔍 **Search & Organization**
- Full-text event search (press `/`)
- Filter by category
- Filter by priority level
- Quick event list in sidebar

#### ⌨️ **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `N` | Create new event |
| `D` | Switch to Day view |
| `W` | Switch to Week view |
| `M` | Switch to Month view |
| `T` | Jump to today |
| `/` | Focus search |

#### 🌓 **User Preferences**
- Light/Dark mode toggle
- Automatic system theme detection
- Persistent preference storage

#### 💾 **Data Management**
- Browser localStorage for fast offline access
- Export events as JSON
- Import events from JSON file
- Automatic data persistence

#### 📱 **Responsive Design**
- Full desktop experience
- Mobile-optimized layouts
- Touch-friendly controls
- Works on all modern browsers

---

## 📂 Project Structure

```
HROS/
├── src/
│   ├── components/          (9 React components)
│   │   ├── HROSDashboard.jsx      (Main app container)
│   │   ├── LoginPage.jsx          (Authentication)
│   │   ├── DayView.jsx            (Day calendar view)
│   │   ├── WeekView.jsx           (Week calendar view)
│   │   ├── MonthView.jsx          (Month calendar view)
│   │   ├── EventModal.jsx         (Event creation/edit)
│   │   ├── Header.jsx             (Top navigation)
│   │   ├── Sidebar.jsx            (Left navigation)
│   │   └── [Other boards]         (Specialized views)
│   │
│   ├── hooks/              (4 custom React hooks)
│   │   ├── useEvents.js           (Event state management)
│   │   ├── useDarkMode.js         (Theme management)
│   │   ├── useKeyboardShortcuts.js (Keyboard handling)
│   │   └── useNotifications.js    (Browser notifications)
│   │
│   ├── utils/              (5+ utility modules)
│   │   ├── storage.js             (localStorage API)
│   │   ├── dateUtils.js           (Date/time helpers)
│   │   ├── eventHelpers.js        (Event logic)
│   │   ├── constants.js           (App constants)
│   │   ├── sampleData.js          (Demo data)
│   │   └── [More utilities]
│   │
│   ├── context/            (React Context)
│   │   └── AuthContext.jsx        (Auth state management)
│   │
│   ├── styles/             (Tailwind CSS)
│   │   └── index.css
│   │
│   ├── App.jsx            (Root component)
│   └── main.jsx           (Entry point)
│
├── public/                 (Static assets)
├── package.json           (Dependencies & scripts)
├── vite.config.js         (Vite bundler config)
├── tailwind.config.js     (Tailwind CSS config)
├── postcss.config.js      (PostCSS plugins)
└── README.md             (This file)
```

---

## 🛠️ Development

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start dev server with hot reload
npm run dev
```

Server runs at `http://localhost:5173`

### Production Build

```bash
# Create optimized production build
npm run build
```

Output is in the `dist/` folder.

### Preview Build

```bash
# Test production build locally
npm run preview
```

---

## 🚀 Deployment

### Deploy to GitHub Pages

1. Update `vite.config.js` with your repository name:
```javascript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Deploy:
```bash
npm run deploy
```

### Deploy to Other Platforms

The `dist/` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

---

## 📚 Documentation

This project includes comprehensive documentation:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and architecture overview
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Development guidelines and code structure
- **[USER_GUIDE_DETAILED.md](USER_GUIDE_DETAILED.md)** - Complete user documentation
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication system details
- **[HROS_SYSTEM_GUIDE.md](HROS_SYSTEM_GUIDE.md)** - Full system reference
- **[COMPONENTS.md](COMPONENTS.md)** - Component documentation
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Complete documentation index

---

## 🔐 Authentication

HROS supports multiple authentication methods:

- **Password Authentication** - Traditional email/password login
- **IDP Authentication** - Google, Microsoft, Okta, Auth0
- **Role-Based Access** - Admin, Employee, Manager roles

See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for setup details.

---

## 💻 Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Data Storage**: Browser localStorage
- **Utilities**: clsx for conditional classes

---

## 📋 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.24",
    "autoprefixer": "^10.4.14",
    "gh-pages": "^5.0.0"
  }
}
```

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 💡 Tips & Tricks

### Keyboard Power User
Press `/` to search, then use arrow keys to navigate results quickly.

### Dark Mode
The app automatically detects your system theme preference but can be toggled manually.

### Data Backup
Regularly export your events to backup. Use the export feature in settings.

### Sample Data
On first load, sample events are provided to demonstrate features.

---

## 🙋 Support

For detailed information on any feature:
1. Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for the full doc index
2. Review the [USER_GUIDE_DETAILED.md](USER_GUIDE_DETAILED.md) for user features
3. See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for development help

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

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
