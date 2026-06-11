# HiveDesk Admin Playbook

> **Role:** Admin
> **Access Level:** Full (All 25 boards, 60+ permissions)
> **Last Updated:** June 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Board-by-Board Deep Dive](#2-board-by-board-deep-dive)
3. [User Management](#3-user-management)
4. [System Settings](#4-system-settings)
5. [Audit Log](#5-audit-log)
6. [Keyboard Shortcuts](#6-keyboard-shortcuts)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Getting Started

### Login

1. Navigate to the HiveDesk application URL
2. Enter your email and password
3. You'll land on the **War Room** dashboard

### Default Credentials

| Email | Password | Role |
|-------|----------|------|
| `himanshuyadav4596@gmail.com` | (set by you) | admin |

### First-Time Setup Checklist

- [ ] Change the default admin password
- [ ] Create Lead and Curator user accounts
- [ ] Review system settings (targets, quality weights, sprint config)
- [ ] Set up sprint domains (DSA, Full-Stack)
- [ ] Configure weekly targets
- [ ] Verify Google Sheets connection is active

### Your Sidebar — All 25 Boards

As an admin, you see every board in the system:

| Section | Boards |
|---------|--------|
| **Core** | War Room, My Queue, Standup, Bounties, Questions, Pipeline, Sprints, Reviews, Team, Check-Ins, Work Logs |
| **More** | Skills, Kudos, Goals, Achievements, Wrapped, Workload, Analytics, Mood Trends, Retro, Import |
| **Admin** | Users, Audit Log, Settings |

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| **Curator** | 1 | Base contributor — creates and submits content |
| **Lead** | 2 | Team manager — oversees quality and workflows |
| **Admin** | 3 | System operator — full control over all features |

Higher roles inherit all permissions of lower roles.

---

## 2. Board-by-Board Deep Dive

---

### CORE — Daily Operations

---

#### War Room (Dashboard)

**What it is:**
Your command center. The first screen you see after login. Shows real-time metrics, weekly target progress, team activity, and what needs attention.

**Why it exists:**
Without a dashboard, you'd have to check 10+ boards individually. This surfaces everything — question pipeline health, team pulse, sprint status, and alerts — in one scannable view. It replaces your morning standup.

**When to use it:**
- Every morning when you start work
- After returning from a break
- When you need a quick status check
- When presenting team health to leadership

**What you see:**
- **Metric Cards** — Team members, total questions, published count, average quality
- **Weekly Target Progress** — Visual bar showing progress toward weekly goals
- **Question Pipeline** — How many questions are in each stage
- **Needs Attention** — Items requiring action (stuck questions, overdue reviews)
- **Recent Questions** — Latest submissions
- **Team Pulse** — Who's online, energy levels
- **Activity Feed** — Recent actions across the system
- **Sprint Overview** — Current sprint status

**What good looks like:**
- You open HiveDesk, glance at the dashboard, and immediately know what needs attention
- No questions are stuck in "In Review" for more than 2 days
- Weekly target progress is on track
- Team energy is healthy

**Best practices:**
- Check it first thing every morning
- Use Quick Actions for common tasks
- Don't ignore "Needs Attention" items
- Review team pulse to spot disengagement early

---

#### My Queue

**What it is:**
Your personal kanban board with 5 columns: Assigned to Me, Needs Revision, In Review, My Reviews, All Created. This is your personal work inbox.

**Why it exists:**
Shows you exactly what's on your plate. Instead of searching through the full question bank, you see only questions that need YOUR attention. It's your personal workflow tracker.

**When to use it:**
- First thing every morning (check what's assigned to you)
- When you finish a task (drag to next column)
- When you need to see your personal workload

**What you see:**
- **Assigned to Me** — Questions you need to work on
- **Needs Revision** — Questions that came back for changes
- **In Review** — Your questions currently being reviewed
- **My Reviews** — Questions you're reviewing for others
- **All Created** — Everything you've ever created

**What good looks like:**
- "Assigned to Me" column isn't overloaded
- "Needs Revision" items are addressed within 24 hours
- You know exactly what to work on next

**Best practices:**
- Check it daily
- Address "Needs Revision" items first (they're unblocking others)
- Keep "In Review" items moving — follow up if stuck
- Use it to plan your day

---

#### Async Standup

**What it is:**
A daily async standup board. Each team member posts: What they did yesterday, what they're doing today, and any blockers.

**Why it exists:**
Replaces daily synchronous standups. You can see the entire team's status without scheduling a meeting. It's especially useful across time zones.

**When to use it:**
- Every morning: Post your standup
- Throughout the day: Check team standups
- When you need to coordinate across the team

**What you see:**
- **Yesterday** — What each person accomplished
- **Today** — What each person is working on
- **Blockers** — Who's stuck and why

**What good looks like:**
- Everyone posts a standup daily
- Blockers are visible and addressed quickly
- You can scan the team's status in 2 minutes

**Best practices:**
- Post your standup every morning — it's your commitment to the team
- Be specific ("created 3 DSA questions") not vague ("worked on questions")
- Flag blockers immediately — don't wait
- Check team standups to identify collaboration opportunities

---

#### Question Bounties

**What it is:**
A bounty board for high-value questions. Bonus point pools are attached to specific questions. First-come-first-served claiming.

**Why it exists:**
Incentivizes work on high-priority or difficult questions. When you need specific questions created urgently, bounties attract attention and reward effort.

**When to use it:**
- When you need to prioritize specific question types
- When you want to reward extra effort
- When certain questions are understaffed

**What you see:**
- **Active Bounties** — Questions with bonus points available
- **Claimed** — Bounties someone has taken
- **Completed** — Finished bounties

**What good looks like:**
- Bounties are claimed quickly
- High-value questions don't sit unclaimed
- The bounty system motivates the right behavior

**Best practices:**
- Set bounties for genuinely difficult or urgent questions
- Don't overuse — bounties should feel special
- Ensure bounty requirements are clear
- Review bounty completion rates to adjust point values

---

#### Question Bank

**What it is:**
The full question management board. A 6-column kanban: Draft → In Review → Needs Revision → Approved → Published → Rejected. This is the core workflow engine.

**Why it exists:**
This is the heart of HiveDesk. Every question flows through these stages. It provides visibility into the entire question lifecycle, from first draft to published. Without it, questions would get lost in spreadsheets and chat messages.

**When to use it:**
- When creating new questions
- When reviewing questions
- When checking question status
- When exporting question data

**What you see:**
- **Draft** — Questions being written
- **In Review** — Submitted for review
- **Needs Revision** — Reviewer requested changes
- **Approved** — Ready to publish
- **Published** — Live and published
- **Rejected** — Not published (with reasons)

**What good looks like:**
- Questions move through stages without lingering
- No question sits in "In Review" for more than 2 days
- Quality scores are consistently above 4.0
- Draft → Published happens within one sprint

**As an Admin, you specifically can:**
- Create, edit, and delete any question
- Drag questions between any columns
- Approve or reject questions
- Assign reviewers
- Export questions (CSV/JSON)
- Bulk actions on multiple questions

**Drag & Drop:**
1. Grab a question card
2. Drag it to the target column
3. Drop it — status updates automatically

**Creating a Question:**
1. Click **"+ New Question"**
2. Fill in:
   - **Title** (required)
   - **Domain** — DSA / Full-Stack
   - **Topic** — Specific topic within domain
   - **Difficulty** — Easy / Medium / Hard
   - **Problem Statement** — Full question text
   - **Starter Code** — Code template (optional)
   - **Solution Code** — Reference solution
   - **Pseudo Code** — Algorithm outline
   - **Test Cases** — Number of test cases
   - **Hints** — Number of hints
   - **Tags** — Searchable keywords
3. Click **Save**

**Quality Score Formula:**
```
Quality = (Accuracy × 0.30) + (Completeness × 0.25) + (Clarity × 0.15) + (Difficulty Calibration × 0.20) + (Originality × 0.10)
```

**Best practices:**
- Review the pipeline daily
- Don't let questions sit in "In Review" — assign reviewers promptly
- Use quality scores to identify improvement areas
- Export data regularly for backup
- Keep the pipeline clean — archive or reject stale questions

---

#### Question Pipeline

**What it is:**
A visual kanban view of the question workflow. Shows the flow from creation to publication.

**Why it exists:**
Gives a bird's-eye view of the entire pipeline. Unlike the Question Bank (which is operational), this is strategic — it shows volume distribution and bottlenecks at each stage.

**When to use it:**
- Weekly: Review pipeline health
- When identifying bottlenecks
- When presenting to leadership

**What you see:**
- Volume at each stage
- Flow rates between stages
- Bottleneck indicators

**As an Admin, you specifically can:**
- Drag questions between columns
- See the full pipeline across all domains
- Identify stuck questions

**Best practices:**
- Review weekly for pipeline health
- Look for stages with high volume (bottlenecks)
- Ensure balanced flow through all stages

---

#### Reviews

**What it is:**
The review management board. 3-column kanban: Pending Review → In Progress → Completed. Where quality control happens.

**Why it exists:**
Quality is everything. This board ensures every question gets reviewed before publication. It tracks review assignments, scores, and feedback.

**When to use it:**
- When assigning reviews
- When conducting reviews
- When checking review status
- When reviewing review history

**What you see:**
- **Pending Review** — Questions waiting for a reviewer
- **In Progress** — Reviews currently being conducted
- **Completed** — Finished reviews with scores

**What good looks like:**
- No question sits in "Pending Review" for more than 24 hours
- Reviews are thorough (all 5 dimensions scored)
- Feedback is actionable and specific
- Quality scores improve over time

**As an Admin, you specifically can:**
- Assign reviewers to any question
- Conduct reviews
- Override review decisions
- View all review history

**Review Scoring Dimensions:**

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **Accuracy** | 30% | Is the question technically correct? |
| **Completeness** | 25% | Are all components present (test cases, solutions, hints)? |
| **Clarity** | 15% | Is the problem statement clear and unambiguous? |
| **Difficulty Calibration** | 20% | Is the difficulty level accurate? |
| **Originality** | 10% | Is the question unique and creative? |

**Best practices:**
- Assign reviews promptly — don't let questions wait
- Score all 5 dimensions honestly
- Provide specific, actionable feedback
- Use the improvement notes to help creators grow
- Review review history for patterns

---

#### Sprint Board

**What it is:**
The sprint lifecycle manager. 5-column kanban: Planning → Active → Review → Publish → Done. Manages weekly work cycles.

**Why it exists:**
Sprints create rhythm and accountability. This board tracks each sprint from planning through completion. It answers: "What are we working on this week, and are we on track?"

**When to use it:**
- When planning a new sprint
- When starting a sprint
- When checking sprint progress
- When closing a sprint

**What you see:**
- **Planning** — Sprints being set up
- **Active** — Currently running sprints
- **Review** — Sprints in review phase
- **Publish** — Sprints in publish phase
- **Done** — Completed sprints

**What good looks like:**
- Sprints are planned before the previous one ends
- Active sprints have clear targets
- Sprint burndown shows steady progress
- Sprints close on time

**As an Admin, you specifically can:**
- Create, edit, and delete sprints
- Drag sprints between columns
- Assign members to sprints
- Start and end sprints
- Set sprint targets

**Creating a Sprint:**
1. Click **"+ New Sprint"**
2. Fill in:
   - **Name** (required)
   - **Week Number**
   - **Start Date**
   - **End Date**
   - **Target Questions** — How many questions to publish
   - **Sprint Lead** — Who's leading
3. Click **Save**

**Sprint Lifecycle:**
```
Planning → Active → Review → Publish → Done
```

**Best practices:**
- Plan sprints before the current one ends
- Set realistic targets based on team capacity
- Review sprint burndown daily
- Close sprints on time — don't let them drag
- Conduct retrospectives after each sprint

---

#### Sprint Burndown

**What it is:**
A burndown chart visualization for active sprints. Shows work remaining over time.

**Why it exists:**
Visualizes whether the sprint is on track. A healthy burndown slopes downward steadily. A flat line means work isn't being completed. A spike means scope is increasing.

**When to use it:**
- Daily during active sprints
- When checking sprint health
- When presenting sprint status

**What you see:**
- **Ideal Line** — Where you should be
- **Actual Line** — Where you are
- **Remaining Work** — Questions left to complete

**What good looks like:**
- Actual line follows ideal line closely
- No flat periods (work is progressing)
- No spikes (scope is stable)

**Best practices:**
- Check daily during active sprints
- If behind, identify and address blockers immediately
- Don't add scope mid-sprint unless absolutely necessary

---

#### Sprint Timeline

**What it is:**
A timeline visualization of all sprints — past, present, and future.

**Why it exists:**
Shows sprint history and upcoming sprints in a visual timeline. Helps with planning and understanding team velocity over time.

**When to use it:**
- When planning future sprints
- When reviewing sprint history
- When presenting team velocity

---

#### Sprint Retrospective

**What it is:**
A retro board with three columns: What went well, What to improve, Action items. Team members can vote on items.

**Why it exists:**
Continuous improvement requires reflection. This board captures lessons learned from each sprint and turns them into action items. The voting system prioritizes the most impactful improvements.

**When to use it:**
- After each sprint (before planning the next)
- When team morale needs a boost
- When process issues need addressing

**What you see:**
- **What went well** — Wins and positives
- **What to improve** — Pain points and issues
- **Action items** — Specific improvements to implement
- **Voting** — Team votes on priorities

**What good looks like:**
- Everyone contributes items
- Voting identifies the most impactful improvements
- Action items have owners and deadlines
- Previous retro action items are followed up

**As an Admin, you specifically can:**
- Create retro boards for any sprint
- Add items
- Vote on items
- Create action items from retro discussions

**Best practices:**
- Conduct retro after every sprint
- Create a safe space for honest feedback
- Vote on the most impactful improvements
- Assign owners to action items
- Follow up on previous retro items before starting new ones

---

#### Team Roster

**What it is:**
A grid view of all team members with avatar, role badge, domain, and weekly target. Click to view individual dashboards.

**Why it exists:**
Quick overview of the team — who's who, what they do, and how they're performing. It's the team directory.

**When to use it:**
- When you need to find someone
- When reviewing team composition
- When checking individual performance

**What you see:**
- **Avatar** — Photo or initials
- **Name** — Team member name
- **Role Badge** — Curator / Lead / Admin
- **Domain** — DSA / Full-Stack
- **Weekly Target** — Questions per week

**What good looks like:**
- Every team member is visible
- Role badges are accurate
- Domains are correctly assigned
- Weekly targets are set

**Best practices:**
- Keep the roster updated
- Review team composition quarterly
- Ensure balanced domain coverage
- Set realistic weekly targets

---

#### Individual Dashboard

**What it is:**
A detailed view of a single team member's stats — their questions, reviews, contributions, and performance.

**Why it exists:**
Deep-dive into individual performance. Use it for 1:1s, performance reviews, or when you need to understand someone's contribution.

**When to use it:**
- Before 1:1 meetings
- During performance reviews
- When investigating a team member's work
- When recognizing contributions

---

#### Work Logs

**What it is:**
A time tracking board. Log date, hours worked, task name, and task type.

**Why it exists:**
Tracks where time is being spent. Helps identify if people are overallocated, underutilized, or spending time on the wrong things.

**When to use it:**
- Daily: Log your time
- Weekly: Review team time allocation
- When assessing workload

**As an Admin, you specifically can:**
- View all team work logs
- Filter by person, date, or task type
- Identify time allocation patterns

**Best practices:**
- Log time daily — don't let it pile up
- Be honest about hours worked
- Use task types consistently
- Review logs weekly for patterns

---

#### Check-Ins

**What it is:**
Weekly check-in form: accomplishments, plans, blockers, mood. Your own history view.

**Why it exists:**
Structured weekly reflection. Forces you to think about what you accomplished, what's next, and what's blocking you.

**When to use it:**
- Weekly: Submit your check-in
- When reviewing team check-ins
- Before 1:1 meetings

**As an Admin, you specifically can:**
- View all team check-ins
- Track mood trends
- Identify blockers across the team

---

### MORE — Culture & Growth

---

#### Skills Tracker

**What it is:**
Self-tag skills at 4 levels (beginner/intermediate/advanced/expert). Team skills matrix. Skill gap detection.

**Why it exists:**
Maps the team's capabilities. Helps identify who's strong in what area, where skill gaps exist, and who can mentor whom.

**When to use it:**
- When you learn a new skill (tag it)
- When assigning work (check who has the right skills)
- When planning training (identify gaps)

**What you see:**
- **My Skills** — Your self-assessed skills
- **Team Matrix** — All skills across the team
- **Gap Analysis** — Where the team is weak

**Best practices:**
- Update skills regularly
- Be honest about your level
- Use the matrix to assign work to the right people
- Address skill gaps through training or hiring

---

#### Kudos Board

**What it is:**
Send kudos to teammates with messages. Like/unlike. Chronological feed.

**Why it exists:**
Recognition matters. This board creates a culture of appreciation. Public recognition motivates people and reinforces good behavior.

**When to use it:**
- When a teammate does great work
- When someone helps you
- When you want to celebrate a win

**What good looks like:**
- Kudos flow regularly
- Messages are specific and genuine
- People feel appreciated

**Best practices:**
- Be specific ("Thanks for the thorough code review on HDQ-042") not generic ("Good job")
- Kudos publicly — it motivates the whole team
- Like others' kudos to amplify recognition
- Don't wait for big wins — recognize small ones too

---

#### Goals & OKRs

**What it is:**
Personal weekly goals with progress tracking (0-100%). Mark complete. Goal history.

**Why it exists:**
Creates personal accountability. When you set a goal publicly, you're more likely to achieve it. Progress tracking shows momentum.

**When to use it:**
- Weekly: Set your goals
- Daily: Update progress
- End of week: Review what you achieved

**What good looks like:**
- Goals are specific and measurable
- Progress is updated regularly
- Most goals are completed by week's end
- Goal history shows consistent achievement

**Best practices:**
- Set 3-5 goals per week (not too many)
- Make goals specific ("Create 5 DSA questions") not vague ("Work on questions")
- Update progress daily
- Review goal history to identify patterns

---

#### Streaks & Badges

**What it is:**
Auto-earned achievement badges and contribution streak tracking.

**Why it exists:**
Gamification drives engagement. Streaks create habits. Badges recognize milestones. Together, they make work feel rewarding.

**When to use it:**
- Daily: Maintain your streak
- When you earn a badge: Celebrate
- When reviewing team achievements

**Available Badges:**

| Badge | Requirement |
|-------|-------------|
| **First Published** | Get your first question published |
| **Review Machine** | Complete 10+ reviews |
| **5-Day Streak** | Maintain a 5-day contribution streak |
| **Speed Demon** | Complete a sprint target ahead of schedule |
| **Quality King** | Maintain 4.5+ average quality score |
| **Team Player** | Send 10+ kudos |
| **Mentor** | Help 3+ team members |

**What good looks like:**
- Streaks are maintained
- Badges are earned regularly
- The team celebrates achievements

**Best practices:**
- Log contributions daily to maintain streaks
- Celebrate badge wins publicly
- Use badges to recognize growth
- Don't game the system — badges should reflect real work

---

#### Weekly Wrapped

**What it is:**
Spotify Wrapped-style weekly summary: questions published, reviews completed, kudos, standup streak. Save to history.

**Why it exists:**
Makes your weekly contribution visible and fun. Instead of manually tracking what you did, the system generates a beautiful summary.

**When to use it:**
- End of each week
- Before 1:1 meetings
- When reflecting on your progress

**What you see:**
- Questions published this week
- Reviews completed
- Kudos received
- Standup streak
- Growth compared to previous weeks

**Best practices:**
- Review your wrapped weekly
- Use it as talking points for 1:1s
- Share wins with the team
- Track growth over time

---

#### Workload View

**What it is:**
Team capacity and allocation overview.

**Why it exists:**
Prevents burnout by visualizing who's overloaded and who has capacity. Ensures balanced work distribution.

**When to use it:**
- When assigning work
- Weekly: Review team capacity
- When someone reports feeling overwhelmed

**As a Lead+, you specifically can:**
- View all team workloads
- Rebalance assignments
- Identify overallocated members

---

#### Team Analytics

**What it is:**
Performance metrics, leaderboards, per-member stats, quality trends.

**Why it exists:**
Data-driven management. Shows who's performing well, where quality issues exist, and how the team trends over time.

**When to use it:**
- Weekly: Review team performance
- Monthly: Deep dive into trends
- When preparing for leadership reviews

**As a Lead+, you specifically can:**
- View all analytics
- Export data
- Identify performance patterns

---

#### Mood Trends

**What it is:**
Aggregate team mood/energy trends over time.

**Why it exists:**
Early warning system for team health. Declining mood trends predict turnover and disengagement.

**When to use it:**
- Weekly: Check mood trends
- When team energy feels low
- Before making team changes

**As a Lead+, you specifically can:**
- View mood trends
- Correlate with performance data
- Intervene when trends decline

---

#### Import

**What it is:**
Import questions from CSV, JSON, or Excel (.xlsx). Drag-and-drop file upload, preview, validation, template download.

**Why it exists:**
Bulk question creation. Instead of creating questions one-by-one, you can import dozens at once from existing spreadsheets.

**When to use it:**
- When migrating questions from another system
- When bulk-creating questions from a spreadsheet
- When the team has prepared questions offline

**Supported formats:**
- CSV
- JSON
- Excel (.xlsx)

**What good looks like:**
- Import preview shows data before committing
- Validation catches errors before import
- Templates are used for consistency

**Best practices:**
- Always preview before importing
- Use the provided templates
- Validate data after import
- Don't import duplicate questions

---

### ADMIN — System Management

---

#### User Management

**What it is:**
Full CRUD for user accounts. Create, edit, deactivate users. Assign roles.

**Why it exists:**
Centralizes user administration. Controls who has access to what.

**When to use it:**
- When onboarding new team members
- When someone changes roles
- When someone leaves the team
- When reviewing user access

**As an Admin, you specifically can:**
- Create new users
- Edit user details
- Assign roles (Curator/Lead/Admin)
- Deactivate users
- Import users in bulk

**Creating a User:**
1. Click **"+ Add User"**
2. Fill in:
   - **Name** (required)
   - **Email** (required)
   - **Password** (required)
   - **Role** — Curator / Lead / Admin
   - **Domain** — DSA / Full-Stack
   - **Weekly Target Questions**
   - **Weekly Target Reviews**
3. Click **Save**

**Best practices:**
- Create users with correct roles from the start
- Set realistic weekly targets
- Deactivate users immediately when they leave
- Review user list quarterly for stale accounts
- Assign domains based on expertise

---

#### Audit Log

**What it is:**
Complete system audit trail of all user actions.

**Why it exists:**
Accountability and compliance. When something goes wrong, logs tell you who did what and when.

**When to use it:**
- When investigating unauthorized access
- When resolving data disputes
- For compliance audits
- When debugging issues

**What you see:**
- **User** — Who performed the action
- **Action** — What was done
- **Resource** — What was affected
- **Details** — Specific changes
- **Timestamp** — When it happened

**Best practices:**
- Review logs regularly
- Export for compliance when needed
- Don't modify or delete logs
- Use filters to focus on relevant data

---

#### Settings

**What it is:**
System configuration panel. Controls targets, quality weights, sprint config, domains, UI, and permissions.

**Why it exists:**
Centralizes all system configuration. Instead of hardcoding values, you can adjust them through the UI.

**When to use it:**
- When changing team targets
- When adjusting quality weights
- When modifying sprint duration
- When adding new domains
- When changing UI settings

**Configuration Categories:**

| Category | What It Controls |
|----------|-----------------|
| **Targets** | Questions per person/week, team questions/week, sprint duration |
| **Quality** | Min quality score, scoring weights (accuracy, completeness, clarity, difficulty, originality) |
| **Sprint** | Review phase duration, publish phase duration, auto-close, buddy review requirement |
| **Domains** | DSA domains, Full-Stack domains |
| **UI** | Refresh interval, pagination size |
| **Permissions** | Role-based permission strings |

**What good looks like:**
- Settings reflect current team needs
- Changes are documented
- Team is notified of setting changes

**Best practices:**
- Change settings sparingly — stability matters
- Document all setting changes
- Notify the team when settings change
- Review settings quarterly
- Don't set targets too high — burnout is real

---

## 3. User Management

### Creating Users

1. Go to **Users**
2. Click **"+ Add User"**
3. Fill in all required fields
4. Set role and domain
5. Set weekly targets
6. Click **Save**

### Role Assignment Guide

| When to Assign | Role |
|----------------|------|
| Person creates questions and reviews | `Curator` |
| Person manages a team or workflow | `Lead` |
| Person needs full system control | `Admin` |

### Deactivating Users

1. Go to Users
2. Find the user
3. Click **Deactivate**
4. Confirm

> Deactivated users can no longer log in. Their data remains in the system.

---

## 4. System Settings

### Adjusting Targets

1. Go to Settings > Targets
2. Modify values:
   - Questions per person/week (default: 5)
   - Team questions/week (default: 40)
   - Team published/week (default: 24)
   - Sprint duration in days (default: 7)
3. Save

### Adjusting Quality Weights

1. Go to Settings > Quality
2. Modify weights (must sum to 100%):
   - Accuracy (default: 30%)
   - Completeness (default: 25%)
   - Clarity (default: 15%)
   - Difficulty Calibration (default: 20%)
   - Originality (default: 10%)
3. Save

### Managing Domains

1. Go to Settings > Domains
2. Add or remove DSA domains
3. Add or remove Full-Stack domains
4. Save

---

## 5. Audit Log

### Investigating Issues

1. Go to Audit Log
2. Filter by:
   - **User** — See one person's actions
   - **Action** — See specific actions (create, update, delete)
   - **Resource** — See changes to specific data
   - **Date range** — Narrow to a time period
3. Review the results
4. Export if needed

---

## 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/ Cmd + K` | Global Search |
| `Ctrl/ Cmd + /` | Command Palette |
| `1-9` | Quick board switch |
| `Escape` | Close panels/modals |

---

## 7. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't log in | Check email/password; verify user exists in Users |
| Data not syncing | Check Google Sheets connection; verify API key |
| Board shows empty | Check role permissions; verify data exists |
| Import failed | Check file format; verify column headers match template |
| Quality score seems wrong | Check quality weights in Settings |
| Sprint won't close | Ensure all questions are in final state |

### Emergency: Factory Reset

Contact the system administrator. Factory reset erases ALL data.

---

## Quick Reference Card

| You Want To... | Go To |
|----------------|-------|
| See team health | War Room |
| Manage questions | Question Bank |
| Assign reviews | Reviews |
| Create a sprint | Sprint Board |
| Add a user | Users > + Add User |
| Change settings | Settings |
| View audit trail | Audit Log |
| Check team mood | Mood Trends |
| Import questions | Import |
| Search everything | Ctrl+K |

---

*This playbook is maintained by the HiveDesk team. For questions, contact your system administrator.*
