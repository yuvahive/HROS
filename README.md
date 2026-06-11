# YUVAHIVE HROS — Human Resource Operating System

A complete HR management platform with real-time cloud sync, role-based access control, team management, and psychological design principles.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Icons | Lucide React |
| Backend | Google Apps Script (Code.gs v9.1) |
| Database | Google Sheets (cloud) + In-memory cache (local) |
| Auth | Email/password with session persistence |

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React App ←→ In-Memory Cache ←→ localStorage    │
│                    ↕ (3s pulse)                   │
│           Google Sheets Service                  │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────┐
│         Google Apps Script (Code.gs v9.1)        │
│  doGet / doPost → CRUD → Google Sheets           │
│  Auto-creates missing sheets with headers        │
│  Notification engine (email)                     │
└─────────────────────────────────────────────────┘
```

**Data Flow:**
1. User logs in → credentials validated against Users sheet
2. 3-second heartbeat fetches all sheet data into `liveCache`
3. Boards read from `liveCache` via `getAllFromDB()`
4. User actions write to `liveCache` + queue in localStorage
5. Next heartbeat pushes pending changes to Google Sheets via GAS

---

## Roles (5)

| Role | Description | Board Access |
|------|-------------|--------------|
| **admin** | Full system control. Manages users, settings, logs. Can impersonate any role via "View As". | 20 boards |
| **HR** | Organization-wide HR management. Full access to all HR operations and teams. | 20 boards |
| **TeamLead** | Team-level management. Sees only their assigned team's data via `filterByTeam()`. | 17 boards (no Commands, Logs, Settings) |
| **Employee** | Self-service + team visibility. Limited to own profile, team boards, and personal tasks. | 11 boards |
| **Intern** | Read-mostly. Minimal access to personal and team boards. | 7 boards |

---

## Sidebar Sections — Complete Reference

### MY SPACE

#### My Dashboard
Personal command center. Shows upcoming meetings, pending tasks, team status, and quick actions.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Can request meetings, log work, request time off |
| HR | ✅ | Same as admin |
| TeamLead | ✅ | Same as admin |
| Employee | ✅ | Same as admin |
| Intern | ✅ | Same as admin |

**Psychological purpose:** Anchoring. Users start here, feel oriented, then branch out. Prevents "where do I begin?" paralysis.

---

#### My Profile
Self-service profile management. Employees manage their identity, skills, preferences, and compensation history.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Can edit any field |
| HR | ✅ | Can edit any field |
| TeamLead | ✅ | Can edit own profile |
| Employee | ✅ | Can edit own profile |
| Intern | ✅ | Can edit own profile |

**Psychological purpose:** Autonomy. People feel invested in a system they help populate.

---

#### Organization
Org chart and team structure visualization. Shows reporting lines, team composition, and role distribution.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | View only |
| HR | ✅ | View only |
| TeamLead | ✅ | View only |
| Employee | 👁️ | View only |
| Intern | 👁️ | View only |

**Psychological purpose:** Social proof and orientation. New hires use this constantly. Reduces "who do I ask?" anxiety.

---

### TEAM

#### Team Sync
Real-time what everyone is working on. Async standup replacement.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | ✅ | Full CRUD |
| Intern | ✅ | Full CRUD |

**Psychological purpose:** Social facilitation. Knowing others can see your progress motivates action.

---

#### Team Work
Kanban task board. Visual workflow from "To Do" → "In Progress" → "Done".

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | ✅ | Full CRUD |
| Intern | ✅ | Full CRUD |

All roles have `hasPermission('actions', 'create/update/delete')` checks enforced.

**Psychological purpose:** Progress visualization. Moving cards releases dopamine. The "Done" column becomes a trophy wall.

---

#### 1:1 Meetings
Structured meeting scheduler with prep notes and follow-up tracking.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Can schedule, conduct, and review all meetings |
| HR | ✅ | Same as admin |
| TeamLead | ✅ | Same as admin |
| Employee | ✅ | Can request meetings with their lead |
| Intern | ✅ | Can request meetings with mentor/lead |

**Psychological purpose:** Psychological safety. Regular 1:1s signal "you matter as a person, not just a worker."

---

#### Projects
Cross-functional project health tracking with status, blockers, and ownership.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | 👁️ | Read only |
| Intern | ❌ | No access |

Employee has `projects: ['read']` in resource permissions. Board-level access includes `project-health` for employees.

**Psychological purpose:** Purpose. Connecting daily tasks to larger projects answers "why does my work matter?"

---

#### Action Items
Decision tracking with owners and deadlines. Prevents "who was supposed to do that?" syndrome.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | ✅ | Create, Read, Update (no delete) |
| Intern | 👁️ | Read only |

Employee has `actions: ['create', 'read', 'update']` — no delete permission.

**Psychological purpose:** Commitment. Written commitments are stronger than verbal ones.

---

### HR OPERATIONS

#### Hiring Pipeline
Candidate journey from application → screening → interview → offer → hire.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Create, Read, Update (no delete) |
| TeamLead | ✅ | Create, Read, Update (no delete) |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

HR and TeamLead have `hiring: ['create', 'read', 'update']`. Only admin can delete candidates.

**Psychological purpose:** Fairness. Structured pipelines reduce bias.

---

#### Onboarding
30-day new hire success roadmap with checklist, mentor assignment, and progress tracking.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Create, Read, Update (no delete) |
| TeamLead | ✅ | Create, Read, Update (no delete) |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

**Psychological purpose:** Belonging. A structured onboarding says "we planned for you."

---

#### Internships
Intern lifecycle: onboarding, goals, evaluations, and outcomes.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

**Psychological purpose:** Investment. Structured internships signal "we're building your future."

---

#### Team Pulse
Sentiment and mood tracking. Early warning system for team dysfunction.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

**Psychological purpose:** Emotional intelligence. Regular pulse checks normalize talking about feelings at work.

---

#### Exits & Alumni
Departure management and alumni network tracking.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD |
| HR | 👁️ | Read only (`exits: ['read']`) |
| TeamLead | 👁️ | Read only (`exits: ['read']`) |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

HR and TeamLead can view exit records but cannot create, edit, or delete them. Only admin has full CRUD on exits.

**Psychological purpose:** Closure. Structured exits prevent burning bridges.

---

### TEAMS

#### Teams
Team creation and management. HR/Admin creates teams, assigns TeamLeads, manages members.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD (create, read, update, delete) |
| HR | ✅ | Full CRUD (create, read, update, delete) |
| TeamLead | ✅ | Create, Read, Update (no delete) |
| Employee | 👁️ | Read only (`teams: ['read']`) |
| Intern | 👁️ | Read only (`teams: ['read']`) |

**Three views inside:**
1. **Org Chart** — Visual hierarchy: lead at top, members below with roles and task counts
2. **Tasks** — Kanban board of all tasks scoped to this team
3. **Members** — Card/list view with name, role, email, task count. Actions: Make Lead, Remove

**Psychological purpose:** Identity. Teams create "us" feeling. Knowing your team's composition creates belonging.

---

### WELLBEING

#### Team Wellness
Wellbeing check-ins. Tracks mental health indicators, energy levels, and support needs.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full CRUD (no internal `hasPermission` checks — board access = full access) |
| HR | ✅ | Full CRUD |
| TeamLead | ✅ | Full CRUD |
| Employee | ✅ | Full CRUD (board access granted, no internal permission checks) |
| Intern | ❌ | No access |

Note: WellnessBoard has no internal `hasPermission` checks. Board-level access via ProtectedRoute is the only gate. Employee has board access, so they have full CRUD within the board.

**Psychological purpose:** Care. When the org asks "how are you?" and acts on the answer, trust multiplies.

---

### INSIGHTS

#### Metrics
KPI dashboard with visual charts. Hiring velocity, onboarding completion, team health, action item rates.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Read only (dashboard, no CRUD) |
| HR | ✅ | Read only |
| TeamLead | ✅ | Read only |
| Employee | 👁️ | Read only |
| Intern | ❌ | No access |

MetricsDashboard is read-only — no create/edit/delete functionality.

**Psychological purpose:** Competence. Metrics prove "we're making progress." Reduces imposter syndrome.

---

#### Reports
Deep analytics with exportable data. Cross-tabulated reports and trend analysis.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Read + Export |
| HR | ✅ | Read + Export |
| TeamLead | ✅ | Read + Export |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

`reports: ['read', 'export']` for Admin, HR, TeamLead. Employee and intern have no reports access.

**Psychological purpose:** Authority. Data-backed arguments carry more weight.

---

### ADMIN

#### Commands
System command interface. Direct data manipulation and bulk operations.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full access |
| HR | ❌ | No access |
| TeamLead | ❌ | No access |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

**Psychological purpose:** Control. Admins feel powerful and responsive.

---

#### System Logs
Audit trail of all user actions with timestamp, user, and details.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full access |
| HR | ❌ | No access |
| TeamLead | ❌ | No access |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

**Psychological purpose:** Trust. When people know actions are logged, they behave more responsibly.

---

#### Admin Settings
User management, IDP configuration, backup/restore, factory reset.

| Role | Access | CRUD |
|------|--------|------|
| Admin | ✅ | Full access |
| HR | ❌ | No access |
| TeamLead | ❌ | No access |
| Employee | ❌ | No access |
| Intern | ❌ | No access |

**Psychological purpose:** Sovereignty. The admin owns the system.

---

## Complete Permission Matrix

### Board Access

| Board | ID | Admin | HR | TeamLead | Employee | Intern |
|-------|-----|-------|-----|----------|----------|--------|
| My Dashboard | `my-dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Profile | `my-profile` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organization | `org-chart` | ✅ | ✅ | ✅ | 👁️ | 👁️ |
| Team Sync | `team-sync` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team Work | `daily-work` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 1:1 Meetings | `one-on-ones` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects | `project-health` | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Action Items | `action-items` | ✅ | ✅ | ✅ | ✅ | 👁️ |
| Hiring Pipeline | `hiring` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Onboarding | `onboarding` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Internships | `internships` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Team Pulse | `performance` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Exits & Alumni | `exits` | ✅ | 👁️ | 👁️ | ❌ | ❌ |
| Teams | `teams` | ✅ | ✅ | ✅ | 👁️ | 👁️ |
| Team Wellness | `wellness` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Metrics | `metrics` | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Reports | `reports` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Commands | `commands` | ✅ | ❌ | ❌ | ❌ | ❌ |
| System Logs | `logs` | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin Settings | `settings` | ✅ | ❌ | ❌ | ❌ | ❌ |

*(✅ = Full access, 👁️ = View/read only, ❌ = No access)*

### Resource-Level Permissions

| Resource | Admin | HR | TeamLead | Employee | Intern |
|----------|-------|-----|----------|----------|--------|
| users | C R U D | R U | R U | R | R |
| settings | R U | R | R | R | R |
| reports | R E | R E | R E | — | — |
| hiring | C R U D | C R U | C R U | — | — |
| onboarding | C R U D | C R U | C R U | — | — |
| exits | C R U D | R | R | — | — |
| projects | C R U D | C R U D | C R U D | R | R |
| actions | C R U D | C R U D | C R U D | C R U | R |
| teams | C R U D | C R U D | C R U | R | R |

*(C=Create, R=Read, U=Update, D=Delete, E=Export, —=No Access)*

---

## Data Visibility — Who Sees Whose Data

This section answers the critical question: **When I open a board, whose data do I see?**

### How Filtering Works

The system has three levels of data visibility:

1. **Board-level access** — Can you open this board at all? (ProtectedRoute + `hasPermission`)
2. **Team-level filtering** — `filterByTeam()` scopes data to your assigned team (TeamLead only)
3. **User-level filtering** — Some boards filter to only YOUR data (e.g., MyDashboard)

**Key rule:** `filterByTeam()` ONLY applies to the **TeamLead** role. Admin, HR, Employee, and Intern see ALL records (no team scoping) unless the board has additional user-level filtering.

---

### Board-by-Board Visibility

#### My Dashboard
**Data scope: OWN data only**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| Work logs | Only YOUR work logs | `w.personId === currentUser.id \|\| w.personName === currentUser.name` |
| 1:1 meetings | Only YOUR meetings (as participant or manager) | `m.personId === currentUser.id \|\| m.managerId === currentUser.id` |
| Team section | Your direct reports, your manager, same-team peers | `p.manager === myInfo.id \|\| p.id === myInfo.manager \|\| p.team === myInfo.team` |
| Fallback | If no person record found, shows first 6 people | `people.slice(0, 6)` — potential data leak |

| Role | Sees Their Own? | Sees Others? |
|------|-----------------|--------------|
| Admin | ✅ Own data | ❌ Cannot see other dashboards |
| HR | ✅ Own data | ❌ Cannot see other dashboards |
| TeamLead | ✅ Own data | ❌ Cannot see other dashboards |
| Employee | ✅ Own data | ❌ Cannot see other dashboards |
| Intern | ✅ Own data | ❌ Cannot see other dashboards |

**Answer: No, admin/HR CANNOT view an employee's personal dashboard. Everyone sees only their own.**

---

#### My Profile (EmployeeSelfService)
**Data scope: OWN profile only**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| Profile | Only YOUR person record | `p.id === currentUser.id \|\| p.name === currentUser.name` |
| Work logs | Only YOUR work logs | `w.personId === currentUser.id \|\| w.personName === currentUser.name` |
| 1:1 meetings | Only YOUR meetings | `m.personId === currentUser.id \|\| m.managerId === currentUser.id` |
| Time off | Only YOUR time off requests | `t.personId === currentUser.id` |

| Role | Sees Their Profile? | Sees Others' Profiles? |
|------|--------------------|-----------------------|
| Admin | ✅ Own profile | ❌ Cannot view others' profiles here |
| HR | ✅ Own profile | ❌ Cannot view others' profiles here |
| TeamLead | ✅ Own profile | ❌ Cannot view others' profiles here |
| Employee | ✅ Own profile | ❌ Cannot view others' profiles here |
| Intern | ✅ Own profile | ❌ Cannot view others' profiles here |

**Answer: No, you CANNOT view another person's profile through My Profile. It's strictly self-service.**

---

#### Organization (Org Chart)
**Data scope: EVERYONE — fully transparent**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| People | ALL people in the system | No filtering — `getAllFromDB(STORES.people)` |
| Teams | ALL teams | Grouped by `person.team` field |
| Tree | Full org hierarchy | Built from `person.manager` references |

| Role | Sees Everyone? | Can Search? |
|------|---------------|-------------|
| Admin | ✅ Everyone | ✅ |
| HR | ✅ Everyone | ✅ |
| TeamLead | ✅ Everyone | ✅ |
| Employee | ✅ Everyone | ✅ |
| Intern | ✅ Everyone | ✅ |

**Answer: YES, everyone can see everyone in the Org Chart. It's fully transparent. No role restrictions.**

---

#### Team Sync
**Data scope: ALL people (TeamLead: team only)**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| People | ALL people (TeamLead: team only) | `filterByTeam(peopleRaw)` |
| Sync data | Per-person sync items matched by name | Cross-referenced against people list |

| Role | Data Scope |
|------|-----------|
| Admin | All teams, all people |
| HR | All teams, all people |
| TeamLead | Own team only (via `filterByTeam`) |
| Employee | All teams, all people |
| Intern | All teams, all people |

**Answer: Employee and intern can see ALL teams' sync data. Only TeamLead is scoped to their team.**

---

#### Team Work (Daily Work)
**Data scope: ALL work logs (TeamLead: team only)**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| Work logs | ALL today's work logs (TeamLead: team only) | `filterByTeam(workLogs)` then filtered to today |

| Role | Data Scope |
|------|-----------|
| Admin | All work logs, all people |
| HR | All work logs, all people |
| TeamLead | Own team's work logs only |
| Employee | All work logs, all people |
| Intern | All work logs, all people |

**Answer: Employee/intern can see what EVERYONE is working on today. No privacy filtering.**

---

#### 1:1 Meetings
**Data scope: ROLE-DEPENDENT — most sophisticated filtering**

| Role | What They See | Filter Mechanism |
|------|--------------|------------------|
| Admin | ALL meetings across all teams | `['admin','HR','TeamLead'].includes(role) ? allUpcoming : myUpcoming` |
| HR | ALL meetings across all teams | Same role check |
| TeamLead | ALL meetings (own team via `filterByTeam`) | `filterByTeam` + role check |
| Employee | Only THEIR OWN meetings | `m.personId === currentUser.id \|\| m.managerId === currentUser.id` |
| Intern | Only THEIR OWN meetings | Same user-level filter |

| Role | Sees Others' 1:1s? |
|------|-------------------|
| Admin | ✅ Yes, all |
| HR | ✅ Yes, all |
| TeamLead | ✅ Yes, all (own team) |
| Employee | ❌ No, only own |
| Intern | ❌ No, only own |

**Answer: Admin/HR/TeamLead CAN see other people's 1:1 meetings. Employee/intern can ONLY see their own.**

---

#### Projects
**Data scope: ALL projects (TeamLead: team only)**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| Projects | ALL projects (TeamLead: team only) | `filterByTeam(projects)` |

| Role | Sees All Projects? | Can Create? | Can Edit? | Can Delete? |
|------|-------------------|-------------|-----------|-------------|
| Admin | ✅ All | ✅ | ✅ | ✅ |
| HR | ✅ All | ✅ | ✅ | ✅ |
| TeamLead | ✅ All (own team only) | ✅ | ✅ | ✅ |
| Employee | 👁️ All (read only) | ❌ | ❌ | ❌ |
| Intern | ❌ No access | ❌ | ❌ | ❌ |

**Answer: Employee CAN view all projects but cannot edit. TeamLead scoped to their team only.**

---

#### Action Items
**Data scope: ALL items (TeamLead: team only)**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| Action items | ALL items (TeamLead: team only) | `filterByTeam(allActions)` |

| Role | Sees All? | Can Create? | Can Edit? | Can Delete? |
|------|----------|-------------|-----------|-------------|
| Admin | ✅ All | ✅ | ✅ | ✅ |
| HR | ✅ All | ✅ | ✅ | ✅ |
| TeamLead | ✅ All (own team) | ✅ | ✅ | ✅ |
| Employee | ✅ All | ✅ | ✅ | ❌ |
| Intern | 👁️ Read only | ❌ | ❌ | ❌ |

**Answer: Employee CAN see all action items and create/edit their own. Cannot delete. Intern is read-only.**

---

#### Hiring Pipeline
**Data scope: ALL candidates (TeamLead: team only)**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| Candidates | ALL candidates (TeamLead: team only) | `filterByTeam(hiringPipeline)` |

| Role | Access |
|------|--------|
| Admin | ✅ Full CRUD |
| HR | ✅ Create, Read, Update |
| TeamLead | ✅ Create, Read, Update (own team) |
| Employee | ❌ No access |
| Intern | ❌ No access |

---

#### Onboarding
**Data scope: ALL new hires (TeamLead: team only)**

| Role | Access |
|------|--------|
| Admin | ✅ Full CRUD |
| HR | ✅ Create, Read, Update |
| TeamLead | ✅ Create, Read, Update (own team) |
| Employee | ❌ No access |
| Intern | ❌ No access |

---

#### Internships
**Data scope: ALL interns (TeamLead: team only)**

| Role | Access |
|------|--------|
| Admin | ✅ Full CRUD |
| HR | ✅ Full CRUD |
| TeamLead | ✅ Full CRUD (own team) |
| Employee | ❌ No access |
| Intern | ❌ No access |

---

#### Team Pulse
**Data scope: ALL pulse data (TeamLead: team only)**

| Role | Access |
|------|--------|
| Admin | ✅ Full CRUD |
| HR | ✅ Full CRUD |
| TeamLead | ✅ Full CRUD (own team) |
| Employee | ❌ No access |
| Intern | ❌ No access |

---

#### Exits & Alumni
**Data scope: ALL exits (TeamLead: team only)**

| Role | Access |
|------|--------|
| Admin | ✅ Full CRUD |
| HR | 👁️ Read only |
| TeamLead | 👁️ Read only (own team) |
| Employee | ❌ No access |
| Intern | ❌ No access |

---

#### Teams
**Data scope: ALL teams (TeamLead: team only)**

| Role | Sees All Teams? | Can Create? | Can Edit? | Can Delete? |
|------|----------------|-------------|-----------|-------------|
| Admin | ✅ All | ✅ | ✅ | ✅ |
| HR | ✅ All | ✅ | ✅ | ✅ |
| TeamLead | ✅ All (own team only) | ✅ | ✅ | ❌ |
| Employee | 👁️ Read only | ❌ | ❌ | ❌ |
| Intern | 👁️ Read only | ❌ | ❌ | ❌ |

Note: TeamArena loads `people`, `workLogs`, and `projects` **unfiltered** into memory. The UI scopes views to the selected team, but raw data is accessible in memory.

---

#### Team Wellness
**Data scope: MIXED — partially filtered**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| People | Team-scoped (TeamLead) / All (others) | `filterByTeam(peopleDataRaw)` ✅ |
| Work logs | ALL (no filter) | `getAllFromDB(STORES.workLogs)` ❌ |
| Check-ins | ALL (no filter) | `getAllFromDB(STORES.checkIns)` ❌ |
| 1:1 meetings | ALL (no filter) | `getAllFromDB(STORES.oneOnOnes)` ❌ |

**Data leak:** TeamLead sees team-scoped people but ALL work logs, check-ins, and meetings. This means wellness signals (mood, energy, blockers) from other teams are visible.

| Role | Data Scope |
|------|-----------|
| Admin | All people, all wellness data |
| HR | All people, all wellness data |
| TeamLead | Team people + ALL wellness data (partial filter) |
| Employee | All people, all wellness data |
| Intern | ❌ No access |

---

#### Metrics
**Data scope: FULLY ORG-WIDE — no filtering**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| All metrics | Global aggregates across ALL data | No filtering whatsoever |

| Role | Access |
|------|--------|
| Admin | ✅ Full view |
| HR | ✅ Full view |
| TeamLead | ✅ Full view |
| Employee | 👁️ Full view (read only) |
| Intern | ❌ No access |

**Answer: Metrics are ALWAYS org-wide. No team or user scoping.**

---

#### Reports
**Data scope: FULLY ORG-WIDE — no filtering**

| Data Type | What You See | Filter Mechanism |
|-----------|-------------|------------------|
| All reports | Global data across ALL stores | No filtering whatsoever |

| Role | Access |
|------|--------|
| Admin | ✅ Read + Export |
| HR | ✅ Read + Export |
| TeamLead | ✅ Read + Export |
| Employee | ❌ No access |
| Intern | ❌ No access |

**Answer: Reports are ALWAYS org-wide. No team or user scoping.**

---

### Quick Reference — Can I See Others' Data?

| Question | Answer |
|----------|--------|
| Can admin view an employee's personal dashboard? | ❌ No — My Dashboard is own-data-only |
| Can admin view an employee's profile? | ❌ No — My Profile is own-data-only |
| Can admin see the org chart? | ✅ Yes — everyone sees everyone |
| Can admin see what an employee is working on today? | ✅ Yes — Team Work shows all |
| Can admin see an employee's 1:1 meetings? | ✅ Yes — admin sees all 1:1s |
| Can HR see an employee's profile? | ❌ No — My Profile is own-data-only |
| Can HR see all candidates in hiring pipeline? | ✅ Yes — HR sees all |
| Can TeamLead see other teams' data? | ❌ No — `filterByTeam()` scopes to own team |
| Can employee see other employees' tasks? | ✅ Yes — Team Work shows all |
| Can employee see other employees' 1:1s? | ❌ No — employee only sees own 1:1s |
| Can employee see all projects? | 👁️ Yes, read only |
| Can intern see anything beyond their own data? | ✅ Yes — Org Chart, Team Sync, Team Work are transparent |
| Are metrics org-wide? | ✅ Yes — always global |
| Are reports org-wide? | ✅ Yes — always global |

---

### Known Data Visibility Issues

| Issue | Board | Severity | Description |
|-------|-------|----------|-------------|
| My Dashboard fallback | MyDashboard | Low | If no person record found, falls back to `people.slice(0, 6)` — shows 6 random people |
| Wellness data leak | WellnessBoard | Medium | `workLogs`, `checkIns`, `oneOnOnes` loaded without `filterByTeam()` — TeamLead sees cross-team wellness signals |
| TeamArena raw data | TeamArena | Low | `people`, `workLogs`, `projects` loaded unfiltered into memory — UI scopes to selected team but raw data is accessible |
| OrgChart fully transparent | OrgChart | Info | Everyone sees everyone — intentional for org transparency but no privacy option |

---

## Key Features

### Admin Impersonation ("View As")
- Only the admin role can use this feature
- Header shows "View As" button → dropdown of all roles
- Switches sidebar boards and permissions to that role
- Badge shows "Viewing as [role]" in yellow
- "Back to Admin" button reverts

### Team-Based Filtering (`filterByTeam`)
- TeamLead users see only their assigned team's data
- `filterByTeam()` is called in 12 board components
- Filters records where `team === teamId` or `teamId === teamId`
- Admin and HR see all data (no filtering)

### ProtectedRoute
- Wraps every board in HROSDashboard
- Checks `hasPermission(boardId, 'read')` before rendering
- Shows "Access Denied" with lock icon if unauthorized
- Prevents direct URL access to restricted boards

### Dark Mode
- CSS override system in `src/styles/index.css`
- Covers all boards with `!important` dark variants
- Toggle in header (sun/moon icon)
- Persists across sessions

### Cloud Sync
- 3-second heartbeat polling (pauses when tab hidden)
- Bidirectional sync with conflict detection
- Pending updates queue in localStorage for retry
- Offline fallback with seeded admin account

---

## Default Credentials

| Product | Email | Password | Role |
|---------|-------|----------|------|
| HROS | `admin@hros.local` | `admin123` | admin (offline fallback) |
| HROS | `himanshuyadav4596@gmail.com` | `hivemaster` | admin (from Google Sheet) |
| HiveDesk | `admin@hivedesk.local` | `admin123` | admin (offline fallback) |

---

## Google Apps Script (Code.gs v9.1)

### Auto-Sheet Creation
The GAS code auto-creates all 23 required sheets with headers on first request. No manual sheet creation needed.

### Required Sheets
People, Teams, Users, Config, HiringPipeline, Internships, Onboarding, Exits, WorkLogs, Projects, Tasks, TaskComments, CheckIns, OneOnOnes, Decisions, ActionItems, Skills, TimeOff, CompensationHistory, TeamDynamics, RedFlags, Events, Logs

### API Actions
- `get` — Get single record by ID
- `filter` — Get sheet data with filtering and pagination
- `metrics` — Get dashboard metrics
- `search` — Search across all sheets
- `insert` — Insert new record
- `update` — Update existing record
- `upsert` — Bulk insert or update
- `delete` — Delete record by ID
- `notify` — Send email notification

### Deployed URL
```
https://script.google.com/macros/s/AKfycbzQeWX6_1kYMYGIZeoKqitykSNBuOjWAsSa6n8c6ghWkWHZ_nIYQKXKDuo2mUrxfOacrw/exec
```

---

## Project Structure

```
src/
├── components/
│   ├── HROSDashboard.jsx      # Main dashboard with sidebar + board routing
│   ├── ProtectedRoute.jsx     # Permission-based route guard
│   ├── KanbanBoard.jsx        # Shared kanban component (all boards)
│   ├── TeamArena.jsx          # Team management view
│   ├── TeamForm.jsx           # Create/edit team modal
│   ├── MyDashboard.jsx        # Personal command center
│   ├── EmployeeSelfService.jsx # My Profile
│   ├── OrgChart.jsx           # Organization chart
│   ├── TeamSyncBoard.jsx      # Team sync updates
│   ├── DailyWorkBoard.jsx     # Task kanban
│   ├── OneOnOneBoard.jsx      # 1:1 meeting scheduler
│   ├── ProjectHealthBoard.jsx # Project tracking
│   ├── ActionItemsBoard.jsx   # Decision tracking
│   ├── HiringPipelineBoard.jsx # Hiring pipeline
│   ├── OnboardingBoard.jsx    # New hire onboarding
│   ├── InternshipBoard.jsx    # Intern management
│   ├── TeamPulseBoard.jsx     # Sentiment tracking
│   ├── ExitsBoard.jsx         # Exit management
│   ├── WellnessBoard.jsx      # Team wellness
│   ├── MetricsDashboard.jsx   # KPI dashboard
│   ├── ReportsBoard.jsx       # Analytics & export
│   ├── SlackCommandConsole.jsx # Command interface
│   ├── AdminSettings.jsx      # User management & config
│   ├── AdminLogViewer.jsx     # Audit logs
│   ├── NotificationPanel.jsx  # Notification center
│   ├── GlobalSearch.jsx       # Cross-board search
│   └── CommandPalette.jsx     # Quick command access
├── context/
│   └── AuthContext.jsx         # Auth, RBAC, cloud sync, impersonation
├── services/
│   ├── GoogleSheetsService.js  # GAS cloud bridge
│   └── LoggingService.js       # Audit logging
├── utils/
│   ├── indexedDB.js            # In-memory cache + CRUD operations
│   └── sampleData.js           # ID generation
├── hivedesk/
│   ├── HiveDeskDashboard.jsx   # Separate product (not HROS)
│   └── HiveDeskStorage.js      # HiveDesk cloud sync
└── styles/
    └── index.css               # Dark mode + responsive overrides
```

---

## Build & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Version History

| Version | Changes |
|---------|---------|
| v9.1 | Added Teams sheet, auto-sheet creation, `ensureAllSheets()` |
| v9.0 | Complete GAS rewrite with flat array responses |
| v5.0 | Role system: admin, HR, TeamLead, employee, intern |
| v4.0 | Team Arena with org chart, tasks, and member views |
| v3.0 | Dark mode, responsive design, per-action RBAC |
