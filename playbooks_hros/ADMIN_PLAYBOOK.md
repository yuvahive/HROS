# HROS Admin Playbook

> **Role:** System Administrator
> **Access Level:** Full (All 20 Boards)
> **Last Updated:** June 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Board-by-Board Deep Dive](#2-board-by-board-deep-dive)
3. [Admin Settings (User Management)](#3-admin-settings-user-management)
4. [System Logs (Audit Trail)](#4-system-logs-audit-trail)
5. [Commands (Direct Data Manipulation)](#5-commands-direct-data-manipulation)
6. [IDP Configuration](#6-idp-configuration)
7. [Backup & Restore](#7-backup--restore)
8. [Bulk Import](#8-bulk-import)
9. [View As (Impersonation)](#9-view-as-impersonation)
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Getting Started

### Login

1. Navigate to the HROS application URL
2. Enter your email and password on the login screen
3. Default admin credentials:
   - Email: `admin@hros.local`
   - Password: `admin123`

### First-Time Setup Checklist

- [ ] Change the default admin password immediately
- [ ] Create HR and TeamLead user accounts
- [ ] Configure IDP settings if using SSO
- [ ] Review and customize organization settings
- [ ] Set up notification preferences
- [ ] Verify Google Sheets connection is active

### Understanding Your Sidebar

As an admin, you see **all 7 categories and 20 boards**:

| Category | Boards |
|----------|--------|
| MY SPACE | My Dashboard, My Profile, Organization, Work Uploads |
| TEAM | Team Sync, Team Work, 1:1 Meetings, Projects, Action Items |
| HR OPERATIONS | Hiring Pipeline, Onboarding, Internships, Team Pulse, Exits & Alumni |
| TEAMS | Teams |
| WELLBEING | Team Wellness |
| INSIGHTS | Metrics, Reports |
| ADMIN | Commands, System Logs, Admin Settings |

---

## 2. Board-by-Board Deep Dive

Every board in HROS is designed with a specific purpose. Below is a detailed breakdown of what each board does, why it exists, when to use it, and how to get the most out of it.

---

### MY SPACE — Personal Boards

---

#### My Dashboard

**What it is:**
Your personal command center. This is the first screen you see after login. It aggregates everything that needs your attention into a single, scannable view.

**Why it exists:**
Without a dashboard, you'd have to check 5+ boards individually every morning. This board eliminates that by surfacing urgent items — upcoming meetings, pending tasks, team alerts — in one place. It reduces context-switching and helps you prioritize your day.

**When to use it:**
- Every morning when you start work
- After returning from a break
- When you need a quick status check without navigating multiple boards

**What good looks like:**
- You open HROS, glance at the dashboard, and immediately know what needs attention
- No pending tasks are overdue because you caught them here
- You use Quick Actions to log work or request time off without leaving the page

**As an Admin, you specifically see:**
- All pending tasks across the org (not just your own)
- System health indicators
- Quick access to admin functions

**Best practices:**
- Check it first thing every morning
- Use Quick Action buttons for common tasks
- Don't ignore the "Pending Tasks" section — overdue items stack up fast

---

#### My Profile

**What it is:**
Your personal identity card within HROS. It stores your name, email, role, team, skills, preferences, and compensation history.

**Why it exists:**
Centralizes your professional identity so other boards can reference it. When you're assigned to a project or team, your profile data flows into org charts, team views, and reports automatically.

**When to use it:**
- When you first join the organization (set up your profile)
- When you gain new skills or certifications
- When you want to review your compensation history
- When HR requests updated information

**What good looks like:**
- Complete profile with all fields filled in
- Skills list updated regularly as you learn new things
- Preferences reflecting your current work style

**As an Admin, you specifically can:**
- View all user profiles
- Edit any user's profile fields
- Manage role assignments

**Best practices:**
- Keep your skills list current — it helps with project assignments
- Review compensation history before salary discussions
- Update preferences if your work situation changes

---

#### Organization (Org Chart)

**What it is:**
A visual map of your entire company's reporting structure. Shows who reports to whom, team compositions, and role distributions.

**Why it exists:**
Provides transparency. Every employee can see the full hierarchy. This builds trust, helps people understand reporting lines, and makes it easy to find the right person for cross-functional work.

**When to use it:**
- When you need to find someone's manager
- When you're onboarding new employees and want to show them the structure
- When reorganizing teams (see the before/after)
- When resolving reporting confusion

**What good looks like:**
- Every person is visible and correctly placed
- Reporting lines are accurate and up-to-date
- Team groupings are clear and logical

**As an Admin, you specifically can:**
- See the full org chart with all details
- Identify gaps or misalignments
- Use it for organizational planning

**Best practices:**
- Keep team assignments updated when people move teams
- Use the search bar to quickly find specific people
- Zoom out to see the big picture, zoom in for details

---

#### Work Uploads

**What it is:**
A centralized workspace for sharing, reviewing, and managing work deliverables. Think of it as a formal "show your work" board.

**Why it exists:**
Replaces scattered file shares, email attachments, and chat links with a structured review workflow. Every upload goes through a clear pipeline: Uploaded → Under Review → Approved/Needs Revision/Rejected. This creates accountability and a paper trail.

**When to use it:**
- When you've completed a deliverable that needs review
- When you need to submit work for approval
- When you want to showcase finished projects
- When reviewing team members' submissions

**What good looks like:**
- Clear titles that describe the work
- Detailed descriptions explaining context and purpose
- Correct categorization (Document, Code, Design, Presentation)
- Timely reviews with constructive feedback

**As an Admin, you specifically can:**
- Review uploads from anyone in the org
- Override review decisions
- Monitor upload patterns across teams

**Best practices:**
- Upload finished work, not drafts
- Include a summary in the description
- Respond to "Needs Revision" feedback promptly
- Use categories consistently for searchability

---

### TEAM — Collaboration Boards

---

#### Team Sync

**What it is:**
A real-time standup replacement. Instead of scheduling a daily meeting, team members post what they're working on, their status (On Track / Blocked / Needs Help), and when they last updated.

**Why it exists:**
Daily standups are hard to schedule across time zones and busy calendars. Team Sync gives you the same information asynchronously. It surfaces blockers instantly, so you can help before they become crises.

**When to use it:**
- Start of day: Post what you plan to work on
- Mid-day: Update progress if significant
- End of day: Post what you accomplished
- Immediately: If you hit a blocker

**What good looks like:**
- Everyone on the team updates daily
- "Blocked" statuses get resolved within hours
- Notes provide enough context that you don't need to ask clarifying questions
- You can scan the board in 30 seconds and know the team's pulse

**As an Admin, you specifically can:**
- See all team updates across all teams
- Identify org-wide patterns (multiple teams blocked = systemic issue)
- Monitor sync frequency to ensure teams are engaged

**Best practices:**
- Update at least once daily
- Be specific in "Working On" — "coding feature X" is better than "working"
- Change "Blocked" to "On Track" immediately when unblocked
- Check for teammates' blocked statuses and offer help

---

#### Team Work (Kanban)

**What it is:**
A visual task management board using the Kanban methodology. Tasks move through columns: To Do → In Progress → Done.

**Why it exists:**
Provides a shared, visual representation of all work. Everyone can see what's being worked on, what's queued, and what's finished. It prevents work from falling through the cracks and makes bottlenecks visible.

**When to use it:**
- When you start working on something (drag to In Progress)
- When you finish something (drag to Done)
- When your manager assigns you new work (it appears in To Do)
- During sprint planning (prioritize the To Do column)

**What good looks like:**
- Tasks are small and focused (can be completed in 1-3 days)
- "In Progress" column isn't overloaded (max 3-5 tasks per person)
- "Done" column gets cleared regularly
- Each task has clear acceptance criteria

**As an Admin, you specifically can:**
- Create tasks for anyone
- Move tasks between any columns
- Delete test or duplicate tasks
- See task distribution across all teams

**Best practices:**
- Keep tasks small — break large work into smaller pieces
- Don't leave tasks in "In Progress" for more than 3 days
- Update task status daily
- Add notes when something changes
- Use priority levels (Critical/High/Medium/Low) consistently

---

#### 1:1 Meetings

**What it is:**
A structured meeting scheduler and agenda manager for one-on-one meetings between managers and their reports.

**Why it exists:**
1:1 meetings are the most important recurring meeting in any organization. This board ensures they actually happen, are well-prepared, and produce actionable outcomes. It tracks prep notes, discussion topics, and follow-up items.

**When to use it:**
- Before a meeting: Add prep notes and topics
- During the meeting: Take notes and record action items
- After the meeting: Summarize key decisions and create action items
- Between meetings: Review previous action items

**What good looks like:**
- Prep notes are written before the meeting (not improvised)
- Action items have owners and deadlines
- Meeting summaries capture key decisions
- Follow-up items are tracked to completion

**As an Admin, you specifically can:**
- See all 1:1 meetings across the org
- Monitor meeting frequency and quality
- Identify teams with infrequent 1:1s

**Best practices:**
- Hold 1:1s weekly (non-negotiable)
- Let the direct report set the agenda
- Focus on their growth, not just status updates
- Always create action items for decisions made
- Follow up on previous action items before starting new topics

---

#### Projects

**What it is:**
A health-tracking board for all active projects. Shows status, progress percentage, blockers, risk levels, and ownership.

**Why it exists:**
Projects fail silently when no one is tracking them. This board makes project health visible to everyone. It answers: "Is this project on track?" at a glance. It surfaces blockers and risks before they become emergencies.

**When to use it:**
- When starting a new project (create a card)
- Weekly: Update completion percentage and status
- When blockers arise: Flag them immediately
- When risk level changes: Update and escalate

**What good looks like:**
- Completion percentage is updated weekly
- Status accurately reflects reality (not just "In Progress" forever)
- Blockers are specific and have owners
- Risk levels are honest (not always "Low")

**As an Admin, you specifically can:**
- Create, edit, and delete any project
- See all projects across all teams
- Override project ownership
- Monitor project health org-wide

**Best practices:**
- Assign a single owner to each project
- Update completion % weekly at minimum
- When status is "At Risk," add a specific plan to fix it
- Close completed projects (don't leave them in "Complete" forever)
- Link projects to relevant tasks on the Team Work board

---

#### Action Items

**What it is:**
A decision-tracking and accountability board. Records decisions made in meetings, assigns owners, sets deadlines, and tracks completion.

**Why it exists:**
Decisions without owners don't get done. This board turns every decision into a trackable action item. It creates accountability by making who-owes-what-when explicit and visible.

**When to use it:**
- After any meeting where decisions were made
- When someone volunteers to do something
- When you need to follow up on a promise
- When creating goals or OKRs

**What good looks like:**
- Every action item has a single owner
- Due dates are realistic and specific
- Status is updated regularly
- Completed items are cleared from the board

**As an Admin, you specifically can:**
- Create action items for anyone
- See all action items across the org
- Monitor completion rates
- Identify chronic non-completers

**Best practices:**
- Assign ONE owner per action item (shared ownership = no ownership)
- Set realistic due dates (not "ASAP")
- Break large items into smaller, completable tasks
- Check action items daily
- Follow up on overdue items immediately

---

### HR OPERATIONS — People Lifecycle Boards

---

#### Hiring Pipeline

**What it is:**
A Kanban board tracking every candidate from application to hire. Stages: Application → Screening → Interview → Offered → Hired.

**Why it exists:**
Hiring is a process with many steps and stakeholders. Without a pipeline, candidates fall through cracks, interview feedback gets lost, and offers get delayed. This board creates a structured, visible hiring process.

**When to use it:**
- When a new candidate applies
- After screening a resume
- After conducting an interview
- When making an offer
- When a candidate is hired

**What good looks like:**
- Every candidate is in the correct stage
- Screening scores are filled in before advancing
- Interview notes are detailed and actionable
- Offer details include salary, deadline, and conditions

**As an Admin, you specifically can:**
- Create, read, update, and delete candidates
- Move candidates through all stages
- See the full pipeline at a glance
- Manage hiring for all roles

**Best practices:**
- Don't keep rejected candidates in the pipeline — archive or delete
- Add screening scores consistently (1-10 scale)
- Include specific interview feedback, not just "good" or "bad"
- Track candidate source to identify best recruiting channels
- Review the pipeline weekly to identify stuck candidates

---

#### Onboarding

**What it is:**
A 30-day roadmap for new hires. Tracks checklist items, milestones, and progress from Day 1 through completion.

**Why it exists:**
First impressions matter. A disorganized onboarding process makes new hires feel unwelcome and unprepared. This board ensures every new hire gets a consistent, thorough onboarding experience.

**When to use it:**
- When a new hire starts (create their onboarding card)
- Daily during their first week (check off items)
- Weekly for the first month (update progress)
- At 30 days (complete onboarding)

**What good looks like:**
- Checklist items are checked off promptly
- Manager notes are added regularly
- Blockers are flagged and resolved quickly
- Onboarding is completed within 30 days

**As an Admin, you specifically can:**
- Create onboarding cards for any new hire
- Reassign buddies/mentors
- Override onboarding status
- Monitor onboarding completion rates

**Best practices:**
- Start onboarding before Day 1 (send welcome email, prepare equipment)
- Assign a buddy before the new hire starts
- Schedule the first 1:1 on Day 1
- Don't skip the 30-day review
- Document blockers so you can improve the process

---

#### Internships

**What it is:**
Manages the full intern lifecycle: onboarding, goal setting, evaluations, certificate generation, and FTE recommendations.

**Why it exists:**
Internships are structured learning experiences, not just free labor. This board ensures interns get proper mentorship, clear goals, regular feedback, and a meaningful evaluation at the end.

**When to use it:**
- When an intern starts
- When setting goals (first week)
- During evaluations (weekly or bi-weekly)
- When generating completion certificates
- When recommending FTE conversion

**What good looks like:**
- Goals are specific and measurable
- Evaluations happen on schedule
- FTE recommendations are data-driven
- Certificates are generated and sent

**As an Admin, you specifically can:**
- Manage the full intern lifecycle
- Generate certificates
- Make FTE recommendations
- Track intern outcomes

**Best practices:**
- Set goals in the first week
- Conduct evaluations regularly (not just at the end)
- Document strengths and areas for improvement
- Generate certificates promptly upon completion
- Make FTE recommendations based on evaluation data

---

#### Team Pulse

**What it is:**
A real-time sentiment and mood tracker for teams. Shows energy levels, collaboration scores, morale, and workload balance.

**Why it exists:**
Teams don't fail because of technical problems — they fail because of people problems. This board detects early warning signs of dysfunction before they become crises. It's an early warning system for team health.

**When to use it:**
- Weekly: Add a pulse check for your team
- When you notice mood changes
- After significant events (reorgs, layoffs, wins)
- When team performance dips

**What good looks like:**
- Pulse checks happen regularly (weekly)
- Scores are honest (not always "5/5")
- Notes explain the context behind scores
- Action items are created from concerning trends

**As an Admin, you specifically can:**
- See pulse data for all teams
- Identify org-wide sentiment trends
- Correlate pulse data with performance data
- Intervene when multiple teams show warning signs

**Best practices:**
- Don't skip weeks — consistency matters
- Be honest about scores (hiding problems doesn't fix them)
- When energy is low, investigate workload distribution
- When morale is negative, schedule a team conversation
- Track trends over time, not just single data points

---

#### Exits & Alumni

**What it is:**
Manages employee departures: exit interviews, knowledge transfer, access revocation, and alumni network tracking.

**Why it exists:**
How you treat departing employees defines your employer brand. This board ensures departures are handled professionally, knowledge is transferred, and the door is left open for future rehires (boomerangs).

**When to use it:**
- When an employee gives notice
- During the notice period (track KT)
- On the employee's last day
- After departure (alumni tracking)

**What good looks like:**
- KT is completed before the last day
- Exit interview notes are detailed and honest
- Access is revoked on the last day
- Alumni network is maintained

**As an Admin, you specifically can:**
- Create, edit, and delete exit records
- Track KT status across all departures
- Manage the alumni network
- Score boomerang potential

**Best practices:**
- Start KT planning immediately (don't wait until the last week)
- Conduct exit interviews in a safe, private setting
- Be honest about why people leave — it's valuable data
- Keep alumni contact info updated for potential rehires
- Review exit data quarterly for patterns

---

### TEAMS

---

#### Teams

**What it is:**
The team management hub. Three views: Org Chart (visual hierarchy), Tasks (team-level kanban), and Members (card/list of team members).

**Why it exists:**
Teams are the fundamental unit of work. This board defines who's on which team, who leads each team, and what teams are working on. It's the source of truth for team structure.

**When to use it:**
- When creating a new team
- When adding or removing team members
- When reassigning team leads
- When reviewing team composition

**What good looks like:**
- Every team has a clear lead
- Team members are correctly assigned
- Team descriptions are up-to-date
- No one is on multiple teams (unless intentional)

**As an Admin, you specifically can:**
- Create and delete teams
- Assign/reassign team leads
- Add/remove members from any team
- Merge teams if needed

**Best practices:**
- Keep team sizes manageable (3-8 people ideal)
- Assign a single team lead per team
- Update team composition when people change roles
- Review team structure quarterly

---

### WELLBEING

---

#### Team Wellness

**What it is:**
Tracks individual employee wellbeing: mental health indicators, energy levels, and support needs. Creates a safe space for employees to signal when they need help.

**Why it exists:**
Burnout is expensive. Mental health issues cost organizations billions annually. This board creates a structured way for employees to share how they're doing, and for managers to respond proactively.

**When to use it:**
- When you notice someone struggling
- During regular check-ins
- After a high-stress period
- When an employee signals they need support

**What good looks like:**
- Check-ins happen regularly
- "Struggling" statuses get immediate attention
- Support needed is specific and actionable
- Confidentiality is maintained

**As an Admin, you specifically can:**
- See wellness data across the org (in aggregate)
- Identify teams with high "Struggling" rates
- Ensure managers are conducting check-ins
- Monitor org-wide wellbeing trends

**Best practices:**
- Take "Struggling" seriously — don't just log it
- Follow up with specific support offers
- Maintain confidentiality (wellness data is sensitive)
- Look for patterns (multiple "Okay" statuses = trending downward)
- Connect employees with resources when needed

---

### INSIGHTS — Data & Analytics Boards

---

#### Metrics

**What it is:**
A read-only KPI dashboard showing organization-wide metrics: hiring velocity, onboarding completion, team health scores, action item rates, and shipping metrics.

**Why it exists:**
You can't improve what you can't measure. This board provides a single source of truth for organizational health metrics. It's designed for quick scanning, not deep analysis (use Reports for that).

**When to use it:**
- Daily: Quick health check
- Weekly: Review trends
- Monthly: Deep dive into metrics
- When presenting to leadership

**What good looks like:**
- Metrics are moving in the right direction
- You can explain why any metric changed
- You take action when metrics decline

**As an Admin, you specifically can:**
- View all org-wide metrics
- See metric trends over time
- Use metrics to inform decisions

**Best practices:**
- Don't just look at numbers — understand the story behind them
- Share relevant metrics with your team
- Use metrics to identify problems, not just to report
- Compare metrics over time (this month vs. last month)

---

#### Reports

**What it is:**
A deep analytics engine. Generate cross-tabulated reports, trend analysis, and exportable data across all boards.

**Why it exists:**
Metrics tell you "what." Reports tell you "why." This board lets you slice and dice data to find root causes, identify patterns, and make data-driven decisions.

**When to use it:**
- When investigating a metric change
- When preparing for leadership reviews
- When identifying hiring or retention patterns
- When benchmarking team performance

**What good looks like:**
- Reports are generated with specific questions in mind
- Filters are applied correctly
- Insights are actionable
- Reports are shared with relevant stakeholders

**As an Admin, you specifically can:**
- Generate any report type
- Apply cross-tabulation
- Export data as CSV
- Share reports with the organization

**Best practices:**
- Start with a question ("Why is turnover up?")
- Use filters to narrow the data
- Look for correlations, not just causation
- Export and share findings
- Act on insights — reports without action are wasted effort

---

### ADMIN — System Management Boards

---

#### Commands

**What it is:**
A direct data manipulation interface. Execute commands against any sheet: get, insert, update, delete, upsert, search.

**Why it exists:**
Sometimes you need to do things the UI can't: bulk updates, data cleanup, complex queries, or emergency fixes. Commands give you direct access to the data layer.

**When to use it:**
- Bulk updating records
- Running complex queries
- Cleaning up test data
- Emergency data fixes
- Migrating data between sheets

**What good looks like:**
- Commands are tested before execution
- Parameters are double-checked
- Results are verified
- Changes are documented

**Best practices:**
- Always create a backup before bulk operations
- Test commands with small datasets first
- Document what you changed and why
- Don't use commands for routine operations — use the UI
- Verify results after execution

---

#### System Logs

**What it is:**
A complete audit trail of every user action in the system. Logs timestamp, user, action, and details for every change.

**Why it exists:**
Accountability and compliance. When something goes wrong, logs tell you who did what and when. They're essential for security investigations, compliance audits, and dispute resolution.

**When to use it:**
- When investigating unauthorized access
- When resolving data modification disputes
- For compliance audits
- When debugging system issues
- When monitoring user activity

**What good looks like:**
- Logs are reviewed regularly
- Suspicious patterns are investigated
- Logs are exported for compliance when needed
- Log data is retained for the required period

**Best practices:**
- Don't wait for incidents — review logs proactively
- Use filters to focus on relevant data
- Export logs for compliance audits
- Keep logs for at least 1 year
- Never modify or delete logs

---

#### Admin Settings

**What it is:**
The system control panel. Manage users, configure IDP, run backups, import data, and manage system-wide settings.

**Why it exists:**
Centralizes all administrative functions in one place. Instead of scattered configuration pages, everything is here: user management, security settings, backup/restore, and system configuration.

**When to use it:**
- When onboarding new employees (create users)
- When someone changes roles (update role)
- When setting up SSO (configure IDP)
- When backing up the system
- When restoring from backup

**What good looks like:**
- Users are created with correct roles
- IDP is configured and tested
- Backups run regularly
- System settings are documented

**Best practices:**
- Create users with correct roles from the start
- Test IDP configuration before rolling out
- Back up before major changes
- Document all system configuration changes
- Review user list quarterly for stale accounts

---

## 3. Admin Settings (User Management)

### Creating a New User

1. Click **"+ Add User"** button
2. Fill in the form:
   - **Name** (required) — Full name
   - **Email** (required) — Must be unique
   - **Password** (required) — Minimum 6 characters
   - **Role** (required) — Select from dropdown
   - **Team** — Assign to a team (optional)
   - **Department** — Department assignment (optional)
   - **Seniority** — Level/title (optional)
3. Click **Save**

### Role Assignment Guide

| When to Assign | Role |
|----------------|------|
| Person needs full system control | `admin` |
| Person manages HR operations org-wide | `HR` |
| Person leads a team | `TeamLead` |
| Regular team member | `Employee` |
| Temporary/learning position | `Intern` |

---

## 4. System Logs (Audit Trail)

### Common Use Cases

| Scenario | How to Investigate |
|----------|-------------------|
| Suspected unauthorized access | Filter by user + login/logout actions |
| Data modification dispute | Filter by resource type + update actions |
| Performance review | Filter by date range + all actions |
| Compliance audit | Export full logs for the period |

---

## 5. Commands (Direct Data Manipulation)

### Running a Command

1. Select the **command type** from the dropdown
2. Select the **target sheet** (People, Teams, Tasks, etc.)
3. Enter the **parameters** (JSON format for complex queries)
4. Click **"Execute"**
5. Review the result in the output panel

> **Caution:** Commands execute immediately. Always double-check your parameters before running. There is no undo for delete operations.

---

## 6. IDP Configuration

### Supported Providers

| Provider | Setup Complexity |
|----------|-----------------|
| Google | Easy — OAuth 2.0 |
| Microsoft Entra | Medium — Azure AD config |
| Okta | Medium — SAML/OIDC |
| Auth0 | Easy — OIDC |
| Custom OIDC | Advanced — Custom endpoint |

---

## 7. Backup & Restore

### Automatic Backups

- HROS performs **automatic backups every 60 minutes**
- Backups are saved to your Downloads folder as JSON files
- File naming: `hros-backup-YYYY-MM-DD-HHMMSS.json`

### Manual Backup

1. Go to **Admin Settings**
2. Click **"Backup Now"**
3. File downloads immediately
4. Store in a secure location

---

## 8. Bulk Import

### Importing Users via CSV

1. Prepare a CSV file with columns:
   ```
   name,email,password,role,team,department,seniority
   ```
2. Go to **Admin Settings > Bulk Import**
3. Click **"Upload CSV"**
4. Select your file
5. Preview the import
6. Click **"Confirm Import"**

---

## 9. View As (Impersonation)

### Use Cases

| Scenario | View As |
|----------|---------|
| Employee reports they can't see a board | View as Employee |
| TeamLead says data is missing | View as TeamLead |
| HR can't access hiring pipeline | View as HR |
| Test new feature visibility | View as Intern |

---

## 10. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/ Cmd + K` | Open Global Search |
| `Ctrl/ Cmd + /` | Open Command Palette |
| `1-9` | Quick board switch (by visible order) |
| `Escape` | Close panels/modals |

---

## 11. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't log in | Check email/password; verify user exists in Admin Settings |
| Data not syncing | Check Google Sheets connection; verify API key |
| Board shows empty | Check user's role permissions; verify data exists |
| "View As" not working | Only admin role can use this feature |
| Import failed | Check CSV format; verify email uniqueness |
| Backup not downloading | Check browser download permissions |

### Emergency: Factory Reset

1. Go to Admin Settings
2. Scroll to **"Factory Reset"**
3. Click the button
4. Confirm the reset
5. System returns to default state with admin account

> **Caution:** Factory reset erases ALL data. Only use as a last resort.

---

## Quick Reference Card

| You Want To... | Go To |
|----------------|-------|
| Add a new user | Admin Settings > + Add User |
| View who did what | System Logs |
| Run a data command | Commands |
| Configure SSO | Admin Settings > IDP |
| Back up the system | Admin Settings > Backup Now |
| Import many users | Admin Settings > Bulk Import |
| See how a role works | View As (header dropdown) |
| Check hiring pipeline | HR Operations > Hiring Pipeline |
| Track project health | Team > Projects |
| Generate a report | Insights > Reports |
| Search everything | Ctrl+K |
| Quick actions | Ctrl+/ |

---

*This playbook is maintained by the HROS team. For questions, contact your system administrator.*
