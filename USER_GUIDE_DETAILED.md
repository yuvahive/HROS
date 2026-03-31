# YuvaHive HROS - Complete User Guide

**Version:** 1.0  
**Date:** March 30, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [App Overview](#app-overview)
3. [Switching Between Modes](#switching-between-modes)
4. [Understanding the Sidebar](#understanding-the-sidebar)
5. [Board-by-Board Guide](#board-by-board-guide)
6. [Common Actions](#common-actions)
7. [Tips & Tricks](#tips--tricks)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Step 1: Install and Run

**In PowerShell, navigate to the HROS folder:**
```powershell
cd c:\Users\himan\Desktop\HROS
```

**Install dependencies (first time only):**
```powershell
npm install
```

**Start the development server:**
```powershell
npm run dev
```

**You'll see:**
```
  VITE v4.5.14  ready in 655 ms
  ➜  Local:   http://localhost:5173/
```

### Step 2: Open in Browser

Copy the URL `http://localhost:5173/` and paste into your browser's address bar, then press Enter.

### Step 3: Wait for App to Load

The app takes 2-3 seconds to load. You'll see the **Calendar Mode** first (default view).

---

## App Overview

The HROS system has **2 modes**:

### 📅 Calendar Mode (Default)
- Monthly calendar view
- Event management
- Scheduling interface
- Classic calendar functionality

### 🏢 HROS Mode (HR Operating System)
- 12 HR management boards
- Employee data tracking
- Project management
- Analytics & reporting

---

## Switching Between Modes

### Go from Calendar → HROS

1. Look for the **blue button** in the **top-right corner**
2. Click **"Switch to HROS"**
3. You'll see the HROS dashboard with the sidebar on the left

### Go from HROS → Calendar

In HROS mode, there's a **back button** in the top-right:
- Click **"← Back to Calendar"**
- Returns to calendar view

---

## Understanding the Sidebar

When in HROS mode, the **left sidebar** shows all 12 boards organized by category:

### 📋 HR Boards Section
- **Hiring Pipeline** - Recruit and track candidates
- **Onboarding** - Track 30-day new hire progress
- **Exits & Alumni** - Manage departures and alumni
- **Team Pulse** - Monitor team health and sentiment

### ⚡ Execution Boards Section
- **Daily Work** - Real-time shipping/delivery tracker
- **Project Health** - Manage projects and risks
- **Action Items** - Track decisions and follow-ups

### 🛠️ Support Boards Section
- **1:1 Meetings** - Schedule and track conversations
- **Red Flags** - Auto-detect burnout and issues
- **Commands** - Slack-like CLI interface
- **Metrics** - View KPI dashboards
- **Reports** - Analytics and CSV export

### How to Use the Sidebar

1. **Click any board name** to open that board
2. The **current board is highlighted** in blue
3. Each board has its own icon for quick identification
4. Boards are **organized by function** for easy navigation

---

## Board-by-Board Guide

### 1️⃣ HIRING PIPELINE
**Purpose:** Recruit and track candidates through hiring stages

#### How to Use:
1. Click **"Hiring Pipeline"** in sidebar
2. See candidates organized by stage:
   - **Applied** - New applicants
   - **Screening** - Initial review
   - **Interview** - Interview process
   - **Offer** - Made offer, waiting response

#### Create a New Candidate:
1. Click **"+ New Candidate"** button
2. Fill in form fields:
   - **Name** (required)
   - **Position** (required)
   - **Stage** (required) - Applied, Screening, Interview, Offer
   - **Notes** - Optional context
3. Click **"Add Candidate"**
4. Candidate appears in the corresponding stage column

#### Update a Candidate:
1. Click on the **candidate card**
2. Click **edit icon** (pencil)
3. Update any field
4. Click **"Save"**

#### Move to Next Stage:
1. **Drag the candidate card** to the next stage column
2. Drop it
3. Status automatically saves

#### Delete a Candidate:
1. Click on candidate card
2. Click **trash icon** (delete button)
3. Candidate is removed from system

---

### 2️⃣ ONBOARDING
**Purpose:** Track 30-day new hire onboarding milestones

#### How to Use:
1. Click **"Onboarding"** in sidebar
2. See onboarding progress for new hires
3. Each card shows:
   - **New hire name**
   - **Start date**
   - **Days in progress** (e.g., "15 days")
   - **Progress %** (0-100%)
   - **Current status badge** (New, Started, Ramping, Review, Completed)

#### Create New Hire:
1. Click **"+ New Hire"** button
2. Fill form:
   - **Name** (required)
   - **Role** (required)
   - **Department** (required)
   - **Start Date** (required)
   - **Manager** - Person's direct manager
   - **Mentor** - Person assigned to help
   - **Email** - Contact info
   - **Phone** - Contact info
3. Click **"Add New Hire"**

#### Track Milestones:
The system automatically tracks **4 milestones**:
- **Day 1:** Office tour, IT setup
- **Week 1:** First feedback
- **Week 2:** Ramping up
- **Day 30:** Full review

#### Complete Milestones:
1. Click on the hire's card
2. Check the **milestone checkboxes** as they complete
3. ✓ checks auto-save to database
4. Progress % increases with each checkbox

#### Status Auto-Detection:
- **Days 0-7:** 🆕 New
- **Days 8-13:** 🚀 Started
- **Days 14-29:** 📈 Ramping
- **Days 30+:** 👀 Review / ✨ Completed

---

### 3️⃣ EXITS & ALUMNI
**Purpose:** Manage departures and maintain alumni network

#### How to Use:
1. Click **"Exits & Alumni"** in sidebar
2. See all employee departures
3. Cards show:
   - **Employee name**
   - **Last day countdown** (red if overdue)
   - **Exit checklist progress**
   - **Status** (Pending, Completed, Alumni)

#### Record a Departure:
1. Click **"+ Record Departure"** button
2. Fill form:
   - **Name** (required)
   - **Role** (required)
   - **Department** (required)
   - **Last Day** (required) - Date they're leaving
   - **Reason** - Voluntary, Involuntary, Retirement, Health
   - **Manager** - Their direct manager
   - **Notes** - Any context
3. Click **"Save Departure"**

#### Complete Exit Checklist:
The system tracks **4 exit steps**:
- **Knowledge Transfer** ✓
- **Equipment Return** ✓
- **Access Removal** ✓
- **Exit Interview** ✓

1. Click on departure card
2. Check boxes as you complete each step
3. Checkmarks auto-save

#### Capture Exit Interview:
1. Click on the card
2. Scroll to "Exit Interview" section
3. Select rating:
   - 👎 Negative
   - 😐 Neutral
   - 👍 Positive
4. Add feedback in text area
5. Auto-saves

#### Manage Alumni Network:
1. Find the departing employee
2. Toggle **Alumni Status**:
   - **Inactive** (default)
   - **Active** (keep in touch)
3. Filter by "Alumni" tab to see former employees you're tracking

---

### 4️⃣ TEAM PULSE
**Purpose:** Monitor team health and sentiment

#### How to Use:
1. Click **"Team Pulse"** in sidebar
2. See team members in columns:
   - **Thriving** 💚
   - **Stable** 🟡
   - **Needs Support** ❤️

#### Add Team Member:
1. Click **"+ Add Team Member"** button
2. Fill form:
   - **Name** (required)
   - **Role** (required)
   - **Department** (required)
   - **Sentiment** - Select (Green/Yellow/Red)
   - **Notes** - Context about their situation
3. Click **"Add"**

#### Update Sentiment:
1. Click on team member card
2. Click **edit icon**
3. Change sentiment
4. Click **"Save"**

#### View Red Flags:
- The system auto-detects issues:
  - Last 1:1 > 30 days ago
  - Working > 45 hrs/week
  - No time off > 3 months
  - Mood declining
- Red issues shown in **Needs Support** column

---

### 5️⃣ DAILY WORK
**Purpose:** Real-time shipping and delivery tracking

#### How to Use:
1. Click **"Daily Work"** in sidebar
2. See work items organized by status:
   - **Today's Tasks**
   - **In Progress**
   - **Completed**

#### Create Task:
1. Click **"+ Add Task"** button
2. Fill form:
   - **Title** (required)
   - **Description** - What needs to be done
   - **Due Date** - When it's due
   - **Status** - Today, In Progress, Completed
3. Click **"Add Task"**

#### Update Task Status:
1. **Drag task card** between columns
2. Automatically saves new status
3. Can also click edit to change status

#### Mark Complete:
1. Drag task to **"Completed"** column, OR
2. Click edit → change status → save

---

### 6️⃣ PROJECT HEALTH
**Purpose:** Track projects and identify at-risk work

#### How to Use:
1. Click **"Project Health"** in sidebar
2. See projects in 6 columns:
   - **Planning** 📋
   - **In Progress** 🚀
   - **At Risk** ⚠️ (deadline ≤7 days)
   - **Blocked** 🚧
   - **Completed** ✅
   - **On Hold** ⏸️

#### Create Project:
1. Click **"+ New Project"** button
2. Fill form:
   - **Name** (required)
   - **Owner** (required) - Project lead
   - **Priority** - Low, Medium, High, Critical
   - **Start Date** - When it started
   - **Due Date** - Target completion (required)
   - **Progress %** - 0-100% slider
   - **Description** - What the project is
   - **Team Members** - Who's on the team
   - **Blockers** - What's stopping progress
3. Click **"Save Project"**

#### Track Progress:
1. Click on project card
2. Adjust **progress slider** (0-100%)
3. Auto-saves immediately

#### Add Blockers:
1. Click on project card
2. Add blocker in form:
   - Type blocker name (e.g., "API integration pending")
   - Click **"Add Blocker"**
3. Blockers appear on card
4. Click **X** to remove blocker

#### Move Project:
1. **Drag project card** between columns
2. Automatically updates status
3. Cards turn red if overdue

#### Risk Detection:
- System auto-flags projects:
  - **Red** = Past due date
  - **At Risk** = ≤7 days to deadline
- Auto-move when deadline approaches

---

### 7️⃣ ACTION ITEMS
**Purpose:** Track decisions and action items

#### How to Use:
1. Click **"Action Items"** in sidebar
2. See actions in 5 columns:
   - **New Decisions** 💡
   - **Assigned** 👤
   - **In Progress** ⏳
   - **Blocked** 🚧
   - **Completed** ✅

#### Create Action Item:
1. Click **"+ New Action"** button
2. Fill form:
   - **Title** (required) - What needs to happen
   - **Owner** (required) - Who's responsible
   - **Due Date** (required) - When it's due
   - **Status** - Current status (5 options)
   - **Priority** - Low, Medium, High, Critical
   - **Category** - Follow-up, Decision, Task
   - **Decision Context** - Which decision this came from
   - **Description** - Details
   - **Notes** - Additional context
3. Click **"Save Action Item"**

#### Move Through Workflow:
1. **Drag card** between columns
2. Auto-saves new status
3. Progress from New → Assigned → In Progress → (Blocked if needed) → Completed

#### Overdue Tracking:
- Cards show **"OVERDUE by X days"** in red
- Overdue count shown in header
- Helps prioritize urgent items

---

### 8️⃣ ONE-ON-ONE MEETINGS
**Purpose:** Schedule and track 1:1 conversations

#### How to Use:
1. Click **"1:1 Meetings"** in sidebar
2. See scheduled and completed 1:1s
3. Filter by employee or manager

#### Schedule 1:1:
1. Click **"+ Schedule 1:1"** button
2. Fill form:
   - **With** (required) - Employee name
   - **Manager** (required) - Manager name
   - **Scheduled Date** (required) - When to meet
   - **Topics** - What to discuss
   - **Duration** - Minutes (default 30)
   - **Notes** - Pre-meeting notes
3. Click **"Schedule"**

#### Complete 1:1:
1. Click on scheduled meeting
2. Click **"Mark Complete"**
3. Modal opens to record results:
   - **Shipping Progress** - What they shipped
   - **Growth Opportunities** - Learning opportunities
   - **Wellbeing Assessment** - How they're doing
   - **Blockers Discussed** - What's stopping them
   - **Follow-up Actions** - What needs to happen next
4. Click **"Save Results"**

#### View History:
- **Completed** section shows past 1:1s
- Review notes and outcomes
- Track trends over time

---

### 9️⃣ RED FLAGS
**Purpose:** Auto-detect burnout and employee wellbeing issues

#### How to Use:
1. Click **"Red Flags"** in sidebar
2. System automatically detects issues:
   - ⚠️ **Excessive Work Hours** (>45 hrs/week)
   - 😟 **Mood Declining** (mood trend is down)
   - 🏖️ **No Time Off** (>3 months without break)
   - 🚧 **Many Blocked Tasks** (≥3 tasks stuck)
   - 😐 **No Recent 1:1** (>2 weeks since meeting)
   - 😐 **Low Shipping Rate** (not completing tasks)

#### Understand Red Flag Severity:
- 🔴 **CRITICAL** - Urgent action needed
- 🟠 **HIGH** - Address soon
- 🟡 **MEDIUM** - Monitor and follow up
- 🟢 **LOW** - Keep an eye on

#### Respond to Flags:
1. Click on red flag card
2. See recommended action
3. Click **"Mark Resolved"** when addressed
4. System removes flag

#### How Flags Are Detected:
- **Burnout Indicators:**
  - Excessive hours worked
  - Declining mood/sentiment
  - No time off taken
- **Blocker Indicators:**
  - Multiple blocked tasks
  - Dead-ended projects
- **Disengagement Indicators:**
  - Infrequent 1:1s
  - Low task completion
  - Declining output

---

### 🔟 COMMANDS (Slack-like CLI)
**Purpose:** Execute common tasks via command interface

#### How to Use:
1. Click **"Commands"** in sidebar
2. See command input box at top
3. Type commands like Slack

#### Available Commands:

**Create Commands:**
```
/hire [name] [role]
/onboard [name] [date]
/exit [name] [date]
/project [name] [deadline]
/action [title] [owner]
```

**View Commands:**
```
/list-hires
/list-projects
/list-onboarding
/list-actions
```

**Search Commands:**
```
/find [keyword]
/search-name [name]
/search-role [role]
```

**Status Commands:**
```
/metrics
/health
/status
```

#### Example:
Type: `/hire Jane Doe Senior Engineer`
Result: New candidate "Jane Doe" created as "Senior Engineer"

---

### 1️⃣1️⃣ METRICS DASHBOARD
**Purpose:** View KPI dashboards and analytics

#### How to Use:
1. Click **"Metrics"** in sidebar
2. See 5 metric categories:

#### 1. Hiring Metrics
- Total applications
- Hired count
- Rejection rate
- Pipeline value
- Time-to-hire (days)

#### 2. Performance Metrics
- Team pulse summary
- Sentiment distribution
- Red flag count
- Burnout cases
- Engagement scores

#### 3. Onboarding Metrics
- New hires in progress
- Completion rate
- Average progress
- Milestones tracked

#### 4. Exit Metrics
- Departures this month
- Alumni network size
- Exit interview completion
- Reason breakdown

#### 5. Project Metrics
- Total projects
- Completion rate
- At-risk projects
- Average progress
- Blockers pending

---

### 1️⃣2️⃣ REPORTS & ANALYTICS
**Purpose:** Generate company-wide reports and export data

#### How to Use:
1. Click **"Reports"** in sidebar
2. Select **date range**:
   - This Month (default)
   - Last Month
   - This Quarter
   - This Year
   - All Time
3. View automatic analytics

#### What You'll See:

**Executive Overview:**
- Total employees
- Active hires
- Monthly departures
- Active projects
- Overdue actions

**Hiring Analytics:**
- Total applications
- Conversion rate (%)
- Average time to hire
- Pipeline value ($K)
- Stage breakdown

**Performance Data:**
- Onboarding completion %
- Red flags detected
- Burnout cases
- 1:1 frequency

**Operations Data:**
- Project completion rate
- At-risk projects
- Blocked projects
- Average progress %
- Work hours logged

**Key Insights:**
- Auto-generated recommendations
- Alert on overdue items
- Risk warnings
- Performance highlights

#### Export Report as CSV:
1. Click **"Export CSV"** button
2. File downloads automatically:
   - Named: `hros-report-thisMonth-2026-03-30.csv`
3. Open in Excel or Google Sheets
4. Share with stakeholders

---

## Common Actions

### How to Create a Record (Any Board)

**Pattern is the same everywhere:**

1. Look for **blue "+ [New Item]"** button
2. Click it
3. Modal form appears
4. Fill **required fields** (marked with *)
5. Optional fields can be left blank
6. Click **"Save"** or **"Add"** button
7. Record appears in board/list

### How to Edit a Record

1. Click on the **record card** or **row**
2. Click **pencil icon** (edit)
3. Modal opens with current data
4. Change any field
5. Click **"Save"**
6. Changes auto-save to database

### How to Delete a Record

1. Click on the **record card**
2. Click **trash icon** (delete)
3. Confirm on prompt (optional)
4. Record is removed permanently

### How to Search/Filter

**In supported boards:**
1. Look for **filter/search input** near top
2. Type keyword
3. Results filter in real-time
4. Clear to see all again

### How to Drag-Drop (Kanban Boards)

Boards: Hiring, Daily Work, Projects, Actions

1. Click on a **card**
2. **Drag** it to a different column
3. **Drop** (let go of mouse)
4. Status automatically updates and saves

### How to Update with Checkboxes (Onboarding, Exits)

1. Click on **record card**
2. Find **checkboxes** in the card
3. Click checkbox to toggle
4. ✓ saves automatically
5. Progress % updates

---

## Tips & Tricks

### 🎯 Better Organization
- Use **consistent naming** for employees and projects
- Add **detailed notes** when creating records
- Set **realistic deadlines** for better tracking
- Categorize **blockers specifically** for clarity

### ⚡ Productivity Tips
- Check **Red Flags board** daily to catch issues early
- Review **Daily Work board** first thing in morning
- Use **Commands** for quick entry (faster than forms)
- Export **Reports** weekly to track trends

### 📊 Data Management
- **Backup** your data monthly by exporting as CSV
- Keep **naming conventions** consistent
- Use **Notes fields** liberally for context
- Clear completed items regularly (keeps boards clean)

### 🚀 Workflow Optimization
- **Set realistic progress percentages** (don't overpromise)
- **Call out blockers early** (don't wait until deadline)
- **Use decision context** when tracking action items
- **Link 1:1 notes** to action items that came from meetings

### 📱 Cross-Device Sync
- **Note:** System currently stores data locally (single browser)
- Export as CSV to transfer between computers
- Phone: Can view-only by using responsive design

---

## Troubleshooting

### "Page shows blank/404"

**Solution:**
1. Press `F5` to refresh
2. Check browser console (F12) for errors
3. Restart dev server:
   - Press `Ctrl+C` in PowerShell
   - Run `npm run dev`
4. Clear browser cache (Ctrl+Shift+Delete)

### "Data disappeared"

**Note:** Data is stored locally in browser IndexedDB
- It persists when you close browser
- Only disappears if you:
  - Clear browser cache
  - Use private/incognito mode
  - Switch to different browser

**To backup:**
- Export as CSV from Reports board
- Save file locally
- Re-import if needed

### "Can't create record"

**Check:**
1. All **required fields** are filled (marked with *)
2. **Date format** is correct (YYYY-MM-DD)
3. No **duplicate entries** (system may block)
4. Form **didn't error** (check for red error text)

### "Drag-drop not working"

**Solution:**
1. Refresh page (F5)
2. Try again
3. If still stuck, use edit modal instead
4. Report bug with details

### "Form validation errors"

**Error Examples:**
- "Name required" → Fill in name field
- "Invalid date format" → Use date picker
- "Email invalid" → Check email format

**To fix:**
1. Read error message carefully
2. Find the problematic field
3. Correct the value
4. Click Submit again

### "Performance is slow"

**If app becomes slow:**
1. Check how many records you have
   - 1,000+ records can slow down views
   - Archive/delete old records
2. Close other browser tabs
3. Reduce browser extensions
4. Restart the app

### "Some features not working"

**Quick fix checklist:**
- [ ] Refreshed browser (F5)?
- [ ] Restarted dev server?
- [ ] Cleared browser cache?
- [ ] Using supported browser (Chrome, Firefox, Edge)?

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Stop dev server (in PowerShell) |
| `F5` | Refresh browser |
| `F12` | Open browser console (debugging) |
| `Ctrl+Shift+Delete` | Clear browser cache |
| `Escape` | Close modal/form |
| `Ctrl+S` | Save (some forms) |

---

## Data Persistence

### How Data is Saved
- **IndexedDB** (browser database)
- **Auto-save** on every action
- **No internet needed**

### Backup Your Data
1. Go to **Reports** board
2. Select date range (All Time)
3. Click **"Export CSV"**
4. Save file to computer
5. Keep copies somewhere safe

### Restore from Backup
- Currently manual (import CSV manually)
- Data persists in browser by default

---

## Getting Help

### If Something Breaks
1. Note what you were doing
2. Check the **Console** (F12) for error messages
3. Restart the dev server
4. Take a screenshot of error
5. Share details for debugging

### Feature Requests
- Think about what would be useful
- Create note in your workflow
- Can be added in future updates

---

## Summary Checklist

You now know how to:

- [x] Start the app (`npm run dev`)
- [x] Access HROS mode (click button)
- [x] Navigate all 12 boards
- [x] Create records in any board
- [x] Edit records
- [x] Delete records
- [x] Use forms with validation
- [x] Drag-drop on Kanban boards
- [x] Check milestones and checklists
- [x] Export data as CSV
- [x] Search and filter
- [x] Handle common issues

---

## Next Steps

### Start Using Today
1. Run `npm run dev`
2. Switch to HROS mode
3. Start with **Hiring Pipeline** or **Onboarding**
4. Create a few test records
5. Explore all boards

### Weekly Routine (Suggested)
- **Daily:** Check Daily Work & Red Flags
- **Weekly:** Review Metrics & Reports
- **Monthly:** Export CSV backup
- **Quarterly:** Review all project completions

### Monthly Review
1. Export Reports as CSV
2. Review completion rates
3. Archive finished projects
4. Plan next month's actions

---

## Conclusion

You now have **everything you need** to use YuvaHive HROS effectively!

**Key Takeaway:** HROS is designed to be intuitive. Every board follows the same pattern:
- **Create** → Click "+ button" → Fill form → Save
- **Read** → Click board → See all records
- **Update** → Click record → Edit → Save
- **Delete** → Click record → Delete

**Happy using!** 🎉

---

**Need help?** Check the [SYSTEM_100_PERCENT_COMPLETE.md](SYSTEM_100_PERCENT_COMPLETE.md) for more details.
