# Getting Started Guide

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React 18
- Tailwind CSS
- Vite
- Lucide React Icons

### Step 2: Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 3: Start Creating Events!

1. **Create Your First Event**
   - Click "New Event" or press `N`
   - Fill in the details
   - Choose a category and priority
   - Click "Create Event"

2. **Switch Between Views**
   - Use Day (D), Week (W), Month (M) buttons
   - Or press the shortcut keys

3. **Manage Events**
   - Click events to edit
   - Check off completed tasks
   - Delete events you no longer need

## Key Features to Try

### 📅 Calendar Views
- **Month View**: See your entire month at a glance
- **Week View**: Focus on a specific week
- **Day View**: Detailed hourly breakdown

### 🎯 Event Management
- **Add Events**: Quick creation with category and priority
- **Edit Events**: Click edit to modify details
- **Mark Complete**: Check off tasks when done
- **Delete**: Remove events with confirmation

### 🔍 Organization
- **Search**: Type `/` then search by event title
- **Filter**: Select which categories to show
- **Categories**: Meeting, Call, Task, Personal

### 💾 Data Management
- **Auto-save**: All changes saved to localStorage
- **Export**: Download all events as JSON
- **Import**: Upload events from a JSON file

### 🌓 Preferences
- **Dark Mode**: Toggle theme with the moon/sun icon
- **Remember Settings**: Your preferences are saved

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| N | New Event |
| D | Day View |
| W | Week View |
| M | Month View |
| T | Jump to Today |
| / | Search Events |

## Browser Features

### Notifications
- Allow notifications when prompted
- Get reminders 15 minutes before events
- Works even when browser is minimized

### Storage
- All data stored locally in your browser
- No server needed, no privacy concerns
- Choose which categories/events to keep

## Tips for Best Experience

1. **Use Categories Wisely**
   - Color-code your events for quick identification
   - Group similar event types together

2. **Set Priorities**
   - Mark important items as "High"
   - Low priority items can wait
   - Medium for everything else

3. **Export Regularly**
   - Backup your events as JSON
   - Keep multiple copies
   - Share events with colleagues

4. **Mobile Ready**
   - Works on phones and tablets
   - Touch-friendly interface
   - Responsive design

## Troubleshooting

### The app won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Data not saving
1. Check localStorage is enabled in browser settings
2. Check you have enough storage space
3. Try clearing browser cache

### Dark mode looks weird
1. Clear localStorage: `localStorage.clear()`
2. Refresh the page

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with optimized files ready for deployment.

## Deploying to GitHub Pages

See `DEPLOYMENT.md` for detailed instructions.

Quick version:
```bash
npm run deploy
```

## Common Tasks

### I want to rename a category
Currently categories are built-in. To customize:
1. Edit `src/utils/constants.js`
2. Update the `CATEGORIES` array
3. Rebuild the app

### I want to change colors
Edit `src/utils/constants.js` and modify the color hex codes in the `CATEGORIES` array.

### How do I backup my events?
1. Click "Export" button
2. Save the JSON file somewhere safe
3. You can import it later if needed

### Can I sync across devices?
Not yet - data is stored locally. Workaround:
1. Export events on Device A
2. Import events on Device B

## Need More Help?

1. Check `README.md` for comprehensive documentation
2. Look at component files for implementation details
3. Review `DEPLOYMENT.md` for deployment questions

## Next Steps

- Create your first event
- Set up reminders
- Organize by category
- Export your data
- Share with others

Happy scheduling! 🎉
