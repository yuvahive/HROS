# 🚀 YuvaHive HROS - Human Resources Operating System

**Status:** ✅ Phase 1 Complete - Core Architecture Ready

This is a fully integrated **HR + Execution Management System** built into your HROS calendar app. No backend needed - everything runs locally with IndexedDB + auto-backup to Downloads folder + optional Google Drive sync.

---

## 🎯 What Was Built

### Phase 1: Architecture & Core Components ✅

**1. Database Layer**
- ✅ **16 IndexedDB Tables** for complete HR system
  - HR: People, Hiring Pipeline, Onboarding, Exits
  - Execution: Work Logs, Projects, Tasks, Task Comments
  - Support: Check-Ins, 1:1 Meetings, Decisions, Action Items, Skills, Time Off, Compensation, Team Dynamics, Red Flags
- ✅ **Generic CRUD Functions** (getAllFromDB, getFromDB, addToDB, updateInDB, deleteFromDB, clearTableDB)
- ✅ **Auto-Initialization** with sample data for demo
- ✅ **Triple-Layer Data Protection**: IndexedDB + Auto-Backup + Google Drive (optional)

**2. UI Components**
- ✅ **Reusable Kanban Board** - Drag-and-drop column interface
- ✅ **Hiring Pipeline Board** - Track candidates from application to hire
- ✅ **Daily Work Board** - Real-time shipping tracker
- ✅ **Team Pulse Board** - Team health & sentiment monitoring
- ✅ **HROS Dashboard** - Central hub with 8 board options (3 implemented, 5 coming soon)

**3. Data Integration**
- ✅ HR Data Schemas - Complete structure definitions for all 16 tables
- ✅ Sample Data Generator - Initialize demo data for testing
- ✅ Real-time Board Updates - Drag-drop auto-saves to IndexedDB
- ✅ App Mode Toggle - Switch between Calendar and HROS seamlessly

---

## 📊 Available Boards (Status)

### Implemented ✅
1. **Hiring Pipeline** - Track candidates through stages
2. **Daily Work** - Real-time task shipping visibility
3. **Team Pulse** - Team health & sentiment monitoring

### Coming Soon 🚧
4. **Onboarding** - 30-day new hire tracker
5. **Exits & Alumni** - Departures and alumni network
6. **Project Health** - Project status and blockers
7. **Action Items** - Decision tracking and accountability
8. **1:1 Meetings** - Schedule and feedback logging

---

## 🚀 Quick Start

### 1. Open HROS System
```
Click "HROS" button in Calendar Header → Opens HROS Dashboard
```

### 2. View Boards
- **Hiring Pipeline**: See all candidates, drag between stages (Application → Hiring → Hired)
- **Daily Work**: See today's work logged by team, blockers flagged
- **Team Pulse**: See team health, who's green/yellow/red, who needs support

### 3. Test with Sample Data
App auto-initializes sample data on first load:
- 2 sample employees
- 3 hiring candidates
- 3 active projects
- 3 work logs for today

Delete sample data and add your own by:
```javascript
// In any board component:
await addToDB(STORES.hiringPipeline, newCandidate)
await updateInDB(STORES.people, updatedPerson)
await deleteFromDB(STORES.workLogs, logId)
```

---

## 📁 Files Created/Modified

### New Components
```
src/components/
├── KanbanBoard.jsx           # Reusable kanban board template
├── HiringPipelineBoard.jsx   # Hiring management board
├── DailyWorkBoard.jsx        # Work logging & shipping board
├── TeamPulseBoard.jsx        # Team health board
└── HROSDashboard.jsx         # Main HROS navigation hub
```

### New Utilities
```
src/utils/
├── indexedDB.js              # ENHANCED - 16 tables + generic CRUD
├── hrDataSchemas.js          # Data structure definitions
└── sampleData.js             # ENHANCED - HR demo data initializer
```

### Updated Files
```
src/
├── App.jsx                   # Added HROS mode toggle + sample data init
└── components/Header.jsx     # Added HROS button
```

---

## 🗄️ Data Schema Overview

### People Table (Key Fields)
```javascript
{
  id, name, email, role, team, status,
  salary, equity, skills, currentProjects,
  lastCheckInDate, redFlags
}
```

### Hiring Pipeline Table
```javascript
{
  id, name, role, stage, source,
  appliedDate, screeningScore, interviewDate,
  offerSalary, offerEquity, email, phone
}
```

### Work Logs Table (Daily)
```javascript
{
  id, date, personId, projectId, taskId,
  hoursWorked, hoursEstimated, status,
  mood, blockers, output, learnings
}
```

### Projects Table
```javascript
{
  id, name, owner, dueDate, completionPercent,
  status, priority, impact, blockers, risk
}
```

*See [hrDataSchemas.js](./src/utils/hrDataSchemas.js) for all 16 table definitions*

---

## 🤔 How to Use

### View Team Status
```javascript
// Hiring Pipeline
→ See candidates in each stage
→ Drag card to move to next stage
→ Auto-saves to IndexedDB

// Daily Work
→ See what team shipped today
→ See blockers (cards in red column)
→ Update hours worked, mark done

// Team Pulse
→ See team sentiment (green/yellow/red)
→ Auto-detects based on last check-in date
→ Green: Checked in <30 days ago
→ Red: Checked in >30 days ago
```

### Add New Records
```javascript
// Example: Add hiring candidate
const newCandidate = {
  id: 'hire-123',
  name: 'John Smith',
  role: 'Backend Engineer',
  stage: 'applicant',
  appliedDate: '2024-03-27',
  // ... other fields
}
await addToDB(STORES.hiringPipeline, newCandidate)
```

### Update Records
```javascript
const updated = {
  ...existingRecord,
  stage: 'interview'  // Move to next stage
}
await updateInDB(STORES.hiringPipeline, updated)
```

---

## 🔧 Architecture

```
HROS System
├── App.jsx (appMode: 'calendar' vs 'hros')
│
├── HROSDashboard (Central Hub)
│   ├── Sidebar (Board Navigation)
│   └── Main Content Area
│
├── Board Components (Reusable)
│   ├── HiringPipelineBoard
│   │   └── KanbanBoard (columns: applicant, screening, interview, offered, hired)
│   │
│   ├── DailyWorkBoard
│   │   └── KanbanBoard (columns: today, blockers, completed, notes)
│   │
│   └── TeamPulseBoard
│       └── KanbanBoard (columns: green, yellow, red, on-leave)
│
└── Data Layer
    ├── IndexedDB (Primary Storage)
    │   ├── 16 Object Stores
    │   └── Generic CRUD Functions
    │
    ├── Auto-Backup (Hourly)
    │   └── JSON files to Downloads folder
    │
    └── Google Drive (Optional)
        └── User's personal cloud account
```

---

## 🎯 Next Steps (Phase 2)

### High Priority
1. **Add Hiring Forms** - Modal to create/edit candidates
2. **Add 1:1 Meeting Tracker** - Schedule and log feedback
3. **Red Flag Detection System** - Auto-alert on burnout/blockers/disengagement
4. **Slack Commands UI** - Mock /hr commands interface

### Medium Priority
5. **Project Health Board** - Show project status, blockers, timeline
6. **Onboarding Board** - Track new hire progress (Day 1-30)
7. **Metrics Dashboard** - KPIs: hiring funnel, velocity, team sentiment trends
8. **Compensation Module** - Salary history, promotion recommendations

### Low Priority
9. **Exits & Alumni Board** - Track departures and stay connected
10. **Action Items Board** - Decision tracking and execution
11. **Skills Matrix** - Who has what skills
12. **Time Off Management** - Vacation and burnout prevention

---

## 📱 Data Persistence

**Where Your Data Lives:**
1. **Primary**: IndexedDB in your browser profile
   - Survives cache clear
   - 50MB+ capacity
   - Fast access for boards

2. **Backup 1**: Auto-backup JSON files
   - Location: `C:\Users\[You]\Downloads\HROS-backup-*.json`
   - Frequency: Every 60 minutes
   - Portable - can restore anytime

3. **Backup 2**: Google Drive (optional)
   - User configures their own OAuth
   - No backend/server involved
   - Can restore from cloud anytime

**Recovery Scenario:**
```
IndexedDB corrupted? → Use auto-backup JSON files
Forgot to backup? → Check Google Drive
Need to restore? → Use Import button
```

---

## 🔐 Privacy & Security

✅ **All data stays on your device**
✅ **No backend servers** - pure frontend
✅ **No tracking or analytics**
✅ **Google Drive is your personal account only**
✅ **All communications local only**

---

## 💡 Example: Adding a New Board

```jsx
// 1. Create component: src/components/MyNewBoard.jsx
export default function MyNewBoard() {
  const [cards, setCards] = useState({})
  
  useEffect(() => {
    const loadData = async () => {
      const records = await getAllFromDB(STORES.myTable)
      // Transform to board format
    }
    loadData()
  }, [])
  
  return (
    <KanbanBoard
      columns={boardColumns}
      onDragEnd={handleDragEnd}
      // ... other props
    />
  )
}

// 2. Add to HROSDashboard.jsx boards list
{
  id: 'my-board',
  name: 'My New Board',
  description: 'Board description',
  icon: MyIcon,
  component: MyNewBoard,
  category: 'HR'
}
```

---

## 🧪 Testing

### Test Hiring Pipeline
1. Open HROS → Hiring Pipeline
2. You'll see 3 sample candidates
3. Drag a card to next column
4. Check browser DevTools → IndexedDB → HROS_Calendar → hiringPipeline
5. Data should update in real-time

### Test Daily Work
1. Open HROS → Daily Work
2. You'll see 3 work logs for today
3. Drag a card to "Completed"
4. Status updates from "in-progress" to "done"

### Test Team Pulse
1. Open HROS → Team Pulse
2. You'll see 2 team members
3. Sentiment auto-calculated based on last check-in
4. People who haven't had check-in >30 days show as Red

---

## 📝 Notes

- **No migrations needed** - IndexedDB handles versioning
- **Sample data safe** - Won't interfere with real data
- **All changes auto-save** - Every drag/drop/update commits to IndexedDB
- **Fully offline** - Works without internet once loaded
- **Mobile friendly** - Responsive design included

---

## 🎓 Learning Resources

- [IndexedDB Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [React Hooks Pattern](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

## 📧 Support

For questions or to extend the system:
1. Check `hrDataSchemas.js` for data structure
2. Review existing board components for patterns
3. Use generic CRUD functions for database operations
4. Add new tables by updating `STORES` in `indexedDB.js`

---

**Built with ❤️ for YuvaHive**
**Version 1.0 - Phase 1 Complete**
**All data stays with you • No backend • All local**
