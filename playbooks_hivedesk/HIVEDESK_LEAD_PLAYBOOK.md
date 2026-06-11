# HiveDesk Lead Playbook

> **Role:** Lead
> **Access Level:** Team Manager (21 boards, 52 permissions)
> **Last Updated:** June 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Board-by-Board Deep Dive](#2-board-by-board-deep-dive)
3. [Keyboard Shortcuts](#3-keyboard-shortcuts)
4. [Troubleshooting](#4-troubleshooting)

---

## 1. Getting Started

### Login

1. Navigate to the HiveDesk application URL
2. Enter your email and password
3. You'll land on the **War Room** dashboard

### Your Access Overview

As a Lead, you have access to **21 boards** (all except Users, Audit Log, Settings):

| Section | Your Access |
|---------|-------------|
| **Core** | War Room, My Queue, Standup, Bounties, Questions, Pipeline, Sprints, Reviews, Team, Check-Ins, Work Logs |
| **More** | Skills, Kudos, Goals, Achievements, Wrapped, Workload, Analytics, Mood Trends, Retro, Import |

### What You Can vs. Cannot Do

| Task | Curator | You (Lead) | Admin |
|------|---------|------------|-------|
| Create questions | Own only | Any question | Any question |
| Approve/reject questions | No | Yes | Yes |
| Assign reviewers | No | Yes | Yes |
| Create/edit sprints | No | Yes | Yes |
| View all work logs | No | Yes | Yes |
| View all check-ins | No | Yes | Yes |
| Manage buddy pairs | No | Yes | Yes |
| Import/export questions | No | Yes | Yes |
| Manage users | No | No | Yes |
| Change settings | No | No | Yes |
| View audit log | No | No | Yes |

### What You Inherit from Curator

Everything a Curator can do, you can do — plus elevated permissions on shared boards.

---

## 2. Board-by-Board Deep Dive

---

### CORE — Daily Operations

---

#### War Room (Dashboard)

**What it is:**
Your command center. Shows real-time metrics, weekly target progress, team activity, and what needs attention.

**Why it exists:**
Gives you a bird's-eye view of your team's health. Instead of checking 10+ boards, you see everything here. It's your morning briefing.

**When to use it:**
- Every morning when you start work
- After returning from a meeting
- When presenting team health to leadership

**What you see:**
- **Metric Cards** — Team members, total questions, published, average quality
- **Weekly Target Progress** — Visual bar showing progress
- **Question Pipeline** — Volume at each stage
- **Needs Attention** — Stuck questions, overdue reviews
- **Team Pulse** — Who's online, energy levels
- **Activity Feed** — Recent actions
- **Sprint Overview** — Current sprint status

**As a Lead, you specifically can:**
- See all team metrics (not just your own)
- Identify bottlenecks across the pipeline
- Monitor individual performance
- Use Quick Actions for common tasks

**What good looks like:**
- You scan the dashboard in 2 minutes and know what needs attention
- No questions are stuck for more than 2 days
- Team energy is healthy
- Weekly target is on track

**Best practices:**
- Check it first thing every morning
- Don't ignore "Needs Attention" items
- Review team pulse to spot disengagement early
- Use metrics to inform your management decisions

---

#### My Queue

**What it is:**
Your personal kanban board: Assigned to Me, Needs Revision, In Review, My Reviews, All Created.

**Why it exists:**
Shows you exactly what's on YOUR plate. Even as a Lead, you have personal work — questions to review, items to address.

**When to use it:**
- First thing every morning
- When you finish a task
- When planning your day

**What good looks like:**
- "Assigned to Me" isn't overloaded
- "Needs Revision" items are addressed within 24 hours
- You know exactly what to work on next

**Best practices:**
- Check it daily
- Address "Needs Revision" items first (they're unblocking others)
- Don't let your personal queue grow too large

---

#### Async Standup

**What it is:**
Daily async standup board. Each team member posts: Yesterday, Today, Blockers.

**Why it exists:**
Replaces daily synchronous standups. You can see the entire team's status without scheduling a meeting.

**When to use it:**
- Every morning: Post your standup
- Throughout the day: Check team standups
- When coordinating across the team

**As a Lead, you specifically can:**
- See all team standups
- Identify who's blocked
- Spot collaboration opportunities
- Monitor standup compliance

**What good looks like:**
- Everyone posts a standup daily
- Blockers are visible and addressed quickly
- You can scan the team's status in 2 minutes

**Best practices:**
- Post your standup every morning
- Be specific ("created 3 DSA questions" not "worked on questions")
- Flag blockers immediately
- Check team standups to identify who needs help
- Follow up with team members who haven't posted

---

#### Question Bounties

**What it is:**
Bounty board for high-value questions. Bonus point pools. First-come-first-served.

**Why it exists:**
Incentivizes work on high-priority or difficult questions.

**When to use it:**
- When you need to prioritize specific question types
- When certain questions are understaffed
- When you want to reward extra effort

**As a Lead, you specifically can:**
- Create bounties
- Set point values
- Track bounty completion
- Adjust bounties based on demand

---

#### Question Bank

**What it is:**
The full question management board. 6-column kanban: Draft → In Review → Needs Revision → Approved → Published → Rejected.

**Why it exists:**
This is the core workflow engine. Every question flows through these stages. As a Lead, you oversee this pipeline.

**When to use it:**
- When assigning reviewers
- When approving or rejecting questions
- When checking pipeline health
- When exporting question data

**As a Lead, you specifically can:**
- Create, edit, and delete ANY question (not just your own)
- Drag questions between any columns
- Approve or reject questions
- Assign reviewers
- Export questions (CSV/JSON)
- Bulk actions on multiple questions

**What good looks like:**
- Questions move through stages without lingering
- No question sits in "In Review" for more than 2 days
- Quality scores are consistently above 4.0
- The pipeline is balanced (no stage overloaded)

**Best practices:**
- Review the pipeline daily
- Assign reviewers promptly — don't let questions wait
- Use quality scores to identify improvement areas
- Export data regularly for backup
- Keep the pipeline clean — archive or reject stale questions
- Coach Curators on quality improvement

---

#### Question Pipeline

**What it is:**
Visual kanban view of the question workflow. Strategic view of pipeline health.

**Why it exists:**
Shows volume distribution and bottlenecks at each stage. Unlike the Question Bank (operational), this is strategic.

**When to use it:**
- Weekly: Review pipeline health
- When identifying bottlenecks
- When presenting to leadership

**As a Lead, you specifically can:**
- Drag questions between columns
- See the full pipeline across all domains
- Identify stuck questions

---

#### Reviews

**What it is:**
Review management board. 3-column kanban: Pending Review → In Progress → Completed.

**Why it exists:**
Quality control. Ensures every question gets reviewed before publication.

**When to use it:**
- When assigning reviews
- When conducting reviews
- When checking review status

**As a Lead, you specifically can:**
- Assign reviewers to any question
- Conduct reviews
- Override review decisions
- View all review history

**Review Scoring Dimensions:**

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **Accuracy** | 30% | Is the question technically correct? |
| **Completeness** | 25% | Are all components present? |
| **Clarity** | 15% | Is the problem statement clear? |
| **Difficulty Calibration** | 20% | Is the difficulty level accurate? |
| **Originality** | 10% | Is the question unique? |

**Best practices:**
- Assign reviews promptly
- Score all 5 dimensions honestly
- Provide specific, actionable feedback
- Use improvement notes to help Curators grow
- Review review history for patterns

---

#### Sprint Board

**What it is:**
Sprint lifecycle manager. 5-column kanban: Planning → Active → Review → Publish → Done.

**Why it exists:**
Sprints create rhythm and accountability. This board tracks each sprint from planning through completion.

**When to use it:**
- When planning a new sprint
- When starting a sprint
- When checking sprint progress
- When closing a sprint

**As a Lead, you specifically can:**
- Create and edit sprints
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
   - **Target Questions**
   - **Sprint Lead** — Usually you
3. Click **Save**

**Best practices:**
- Plan sprints before the current one ends
- Set realistic targets based on team capacity
- Review sprint burndown daily
- Close sprints on time
- Conduct retrospectives after each sprint

---

#### Sprint Burndown

**What it is:**
Burndown chart visualization for active sprints.

**Why it exists:**
Visualizes whether the sprint is on track.

**When to use it:**
- Daily during active sprints
- When checking sprint health

**What good looks like:**
- Actual line follows ideal line closely
- No flat periods or spikes

---

#### Sprint Timeline

**What it is:**
Timeline visualization of all sprints.

**When to use it:**
- When planning future sprints
- When reviewing sprint history

---

#### Sprint Retrospective

**What it is:**
Retro board: What went well, What to improve, Action items. Voting system.

**Why it exists:**
Continuous improvement requires reflection.

**When to use it:**
- After each sprint
- When process issues need addressing

**As a Lead, you specifically can:**
- Create retro boards
- Add items and vote
- Create action items

**Best practices:**
- Conduct retro after every sprint
- Create a safe space for honest feedback
- Follow up on previous action items

---

#### Team Roster

**What it is:**
Grid view of all team members with avatar, role badge, domain, weekly target.

**Why it exists:**
Quick overview of the team.

**When to use it:**
- When finding someone
- When reviewing team composition

---

#### Individual Dashboard

**What it is:**
Detailed view of a single team member's stats.

**Why it exists:**
Deep-dive into individual performance for 1:1s and reviews.

**When to use it:**
- Before 1:1 meetings
- During performance reviews
- When investigating work

---

#### Buddy Pair View

**What it is:**
Buddy pair system — pairs team members for peer support.

**Why it exists:**
Peer learning and support. Pairs help each other with questions, reviews, and skill development.

**When to use it:**
- When setting up peer pairs
- When checking pair activity
- When reassigning pairs

**As a Lead, you specifically can:**
- Create buddy pairs
- Edit pair assignments
- Delete pairs
- Monitor pair activity

**Best practices:**
- Pair people with complementary skills
- Ensure pairs meet regularly
- Rotate pairs quarterly for fresh perspectives

---

#### Work Logs

**What it is:**
Time tracking board. Log date, hours, task name, task type.

**Why it exists:**
Tracks where time is being spent.

**When to use it:**
- Daily: Log your time
- Weekly: Review team time allocation

**As a Lead, you specifically can:**
- View all team work logs
- Filter by person, date, or task type
- Identify time allocation patterns

**Best practices:**
- Log time daily
- Review logs weekly for patterns
- Identify overallocated team members

---

#### Check-Ins

**What it is:**
Weekly check-in form: accomplishments, plans, blockers, mood.

**When to use it:**
- Weekly: Submit your check-in
- When reviewing team check-ins

**As a Lead, you specifically can:**
- View all team check-ins
- Track mood trends
- Identify blockers across the team

---

### MORE — Culture & Growth

---

#### Skills Tracker

**What it is:**
Self-tag skills at 4 levels. Team skills matrix. Skill gap detection.

**When to use it:**
- When you learn a new skill
- When assigning work
- When planning training

**Best practices:**
- Update skills regularly
- Use the matrix to assign work to the right people
- Address skill gaps through training

---

#### Kudos Board

**What it is:**
Send kudos to teammates. Like/unlike. Chronological feed.

**When to use it:**
- When a teammate does great work
- When celebrating a win

**Best practices:**
- Be specific in your kudos
- Kudos publicly
- Recognize small wins, not just big ones

---

#### Goals & OKRs

**What it is:**
Personal weekly goals with progress tracking.

**When to use it:**
- Weekly: Set your goals
- Daily: Update progress

**Best practices:**
- Set 3-5 goals per week
- Make goals specific
- Update progress daily

---

#### Streaks & Badges

**What it is:**
Auto-earned badges and contribution streaks.

**When to use it:**
- Daily: Maintain your streak
- When you earn a badge

---

#### Weekly Wrapped

**What it is:**
Spotify Wrapped-style weekly summary.

**When to use it:**
- End of each week
- Before 1:1 meetings

---

#### Workload View

**What it is:**
Team capacity and allocation overview.

**Why it exists:**
Prevents burnout by visualizing who's overloaded.

**When to use it:**
- When assigning work
- Weekly: Review team capacity

**As a Lead, you specifically can:**
- View all team workloads
- Rebalance assignments
- Identify overallocated members

**Best practices:**
- Check workload before assigning new tasks
- Don't overload your best performers
- Redistribute work when someone is overwhelmed

---

#### Team Analytics

**What it is:**
Performance metrics, leaderboards, per-member stats, quality trends.

**Why it exists:**
Data-driven management.

**When to use it:**
- Weekly: Review team performance
- Monthly: Deep dive into trends

**As a Lead, you specifically can:**
- View all analytics
- Identify performance patterns
- Use data for management decisions

---

#### Mood Trends

**What it is:**
Aggregate team mood/energy trends over time.

**Why it exists:**
Early warning system for team health.

**When to use it:**
- Weekly: Check mood trends
- When team energy feels low

**As a Lead, you specifically can:**
- View mood trends
- Correlate with performance data
- Intervene when trends decline

---

#### Import

**What it is:**
Import questions from CSV, JSON, or Excel.

**Why it exists:**
Bulk question creation.

**When to use it:**
- When migrating questions from another system
- When bulk-creating questions

**As a Lead, you specifically can:**
- Import questions from all supported formats
- Preview before importing
- Validate imported data

**Best practices:**
- Always preview before importing
- Use the provided templates
- Validate data after import

---

## 3. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/ Cmd + K` | Global Search |
| `Ctrl/ Cmd + /` | Command Palette |
| `1-9` | Quick board switch |
| `Escape` | Close panels/modals |

---

## 4. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't see a board | Check your role permissions; contact admin |
| Can't approve a question | Only Leads+ can approve; verify your role |
| Sprint won't start | Ensure all prerequisites are met |
| Import failed | Check file format; use the provided template |
| Quality score seems wrong | Check quality weights with admin |

### Frequently Asked Questions

**Q: Can I delete users?**
A: No, only admins can manage users. Contact admin.

**Q: Can I change system settings?**
A: No, only admins can change settings. Contact admin.

**Q: Can I view the audit log?**
A: No, only admins can view the audit log.

**Q: How do I escalate an issue?**
A: Contact admin through your team's communication channel.

---

## Quick Reference Card

| You Want To... | Go To |
|----------------|-------|
| See team health | War Room |
| Manage questions | Question Bank |
| Assign reviews | Reviews |
| Create a sprint | Sprint Board |
| Check team capacity | Workload View |
| Review performance | Team Analytics |
| Check team mood | Mood Trends |
| Import questions | Import |
| Search everything | Ctrl+K |

---

*This playbook is maintained by the HiveDesk team. For questions, contact your system administrator.*
