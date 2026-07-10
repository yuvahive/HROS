# HiveDesk Ecosystem Revamp

> Rebuilding HiveDesk so curators write questions, and everything else runs itself — and actually enjoy the process.

---

## The Problem

HiveDesk was built as a generic project management tool. The team behind HiveLab has a very specific workflow:

```
Pick a slot → Write questions → Test them → Submit → Lead reviews → 
Build mission.json → Upload to YuvaHive → Students learn
```

But the current HiveDesk doesn't know about any of this. Curators bounce between 3 tools (HiveDesk, VS Code, terminal), manually tracking everything. They spend more time on data entry than on writing questions. The boards are overwhelming (25+), permissions are wide open (`hasPermission: () => true`), and there's no sense of progress or accomplishment.

**The fix:** Make HiveDesk mirror the actual workflow. Automate everything except the creative work. Make it feel like building something, not filling out spreadsheets.

---

## The Three Systems

```
HiveLab (Local Folder)          HiveDesk (Web App)             YuvaHive (Student Platform)
C:\Users\himan\Desktop\HiveLab   Browser-based                 React + Node.js + MongoDB
        │                              │                              │
  Curators write               Team tracks work               Students solve
  questions in folders         Reviews, sprints               missions, earn XP
        │                              │                              │
  new.py → folders             Import/Export bridge            upload_mission.js
  run_tests.py → test          ←── zip upload ──→             → MongoDB
  build_mission.py → JSON      RBAC + automation              → Live for students
```

**HiveDesk** is the command center. **HiveLab** is the content factory. **YuvaHive** is where students consume the content.

---

## The Vision

### Current State (Painful)

| Step | Who | What | How |
|------|-----|------|-----|
| Assign slots | Lead | Tell curator what to work on | Manual message |
| Create folders | Curator | Run `new.py` scripts | Terminal commands |
| Write questions | Curator | Edit .md and .py files | VS Code |
| Test code | Curator | Run `run_tests.py` | Terminal |
| Track progress | Curator | Update HiveDesk manually | Browser |
| Submit for review | Curator | Mark status in HiveDesk | Browser |
| Assign reviewer | Lead | Pick who reviews | Manual |
| Review questions | Peer | Score and approve | HiveDesk |
| Build mission | Lead | Run `build_mission.py` | Terminal |
| Upload to YuvaHive | Lead | Run `upload_mission.js` | Terminal |

**Result:** Curators spend 40% of their time on data entry, 60% on actual work. No one knows what's happening until someone asks.

### Future State (Engaging)

| Step | Who | What | How |
|------|-----|------|-----|
| Assign slots | Lead | Click "Assign" | One click, multi-curator support |
| Create folders | Curator | Zip existing HiveLab folder | Drag & drop |
| Write questions | Curator | Edit .md and .py files | VS Code |
| Test code | Curator | Run `run_tests.py` | Terminal |
| Track progress | System | Auto-synced from import | Automatic |
| Submit for review | Curator | Click "Submit" | One click |
| Assign reviewer | System | Buddy pair + load balancing | Automatic |
| Review questions | Peer | Score and approve | HiveDesk |
| Build mission | Lead | Click "Build" when ready | One click |
| Upload to YuvaHive | Lead | Click "Publish" | One click |

**Result:** Curators spend 95%+ of their time on actual work. The system handles the rest. And they can see their impact.

---

## The Engaging Workflow

### What Makes This Different

This isn't just automation. It's a system that makes curators feel like they're building something real:

1. **Mission Tree** — See the curriculum light up as questions get approved. Like a skill tree in a game.
2. **Curator Profile** — Your stats, your quality score, your streak, your badges. All visible.
3. **Team Activity Feed** — See what everyone is building in real time. No more "what is Rahul doing?"
4. **Quality Leaderboard** — Ranked by quality, not quantity. The best curators are recognized.
5. **Streak Tracking** — Consecutive days of contribution. Keep the streak alive.
6. **Curator Levels** — Newcomer → Contributor → Reviewer → Senior → Master. Unlock new abilities.
7. **"Moment of Impact"** — See when students actually solve your questions. Your work matters.

---

### Phase 1: Slot Assignment (Lead)

```
LEAD ACTION:
  Click "Assign Slot"
  → Select: Mission (YH-PY-BASC), Topic (C3)
  → Assign: [Rahul] [Priya] (multi-curator — both work on same mission)
  → Click "Assign"

AUTOMATED:
  ✅ Two slot records created in HiveDesk
  ✅ Both curators get push notification: "You've been assigned YH-PY-BASC Topic C3"
  ✅ Both curators' War Rooms update: "Your Active Slot: YH-PY-BASC C3"
  ✅ Mission Tree shows C3 as "In Progress (2 curators)"
  ✅ Team Activity Feed: "Lead assigned Rahul + Priya to YH-PY-BASC C3"
```

**Multi-Curator Support:**
- Lead can assign 1+ curators to the same mission/topic
- Each curator works on different questions within the topic (or collaborates on the same ones)
- Both get credit on approved questions
- Lead sees combined progress for the mission
- Curators can see who else is working on the same mission

---

### Phase 2: Import (Curator)

```
CURATOR ACTION:
  Zip their HiveLab folder → Drag into HiveDesk Import Bridge

AUTOMATED:
  ✅ Parser reads the zip client-side (JSZip + questionSchema.json)
  ✅ Validates structure against schema
  ✅ Shows preview: 5 questions from YH-PY-BASC C3
  ✅ Auto-assigns reviewer (buddy pair or load-based fallback)
  ✅ Questions appear in HiveDesk with all metadata
  ✅ Reviewer gets notification: "5 questions from Rahul to review"
  ✅ Curator's stats update: "5 new questions added"
  ✅ Team Activity Feed: "Rahul imported 5 questions from YH-PY-BASC C3"
```

**Import Preview:**
```
┌─────────────────────────────────────────────────────────────┐
│  📦 YH-PY-BASC / C3 / building-things                      │
│                                                             │
│  Q1: FizzBuzz        ✅ 5/5 tests  🟢 100%                │
│  Q2: Temp Converter  ✅ 5/5 tests  🟢 100%                │
│  Q3: Password Check  ⚠️ 4/5 tests  🟡 80%                 │
│  Q4: Countdown Timer ✅ 5/5 tests  🟢 100%                │
│  Q5: Multiplication  ✅ 5/5 tests  🟢 100%                │
│                                                             │
│  Reviewer: Priya (buddy)                                    │
│  Priority: Normal                                           │
│                                                             │
│  [Import 5 Questions]  [Cancel]                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Peer Review (Buddy System)

```
REVIEWER (Priya) GETS NOTIFIED:
  "Rahul submitted 5 questions from YH-PY-BASC C3"
  → In-app bell + browser push notification

REVIEWER OPENS REVIEW:
  Sees each question with:
  - question.md content (rendered)
  - Solution.py code (syntax highlighted)
  - tests.json test cases
  - Test results (all passing)

  Reviews each question:
  ☐ Accuracy (1-5)
  ☐ Completeness (1-5)
  ☐ Clarity (1-5)
  ☐ Difficulty Calibration (1-5)
  ☐ Originality (1-5)

  [Approve] [Needs Revision] [Skip]

ON APPROVE:
  ✅ Question status → "Approved"
  ✅ Curator notified: "Q1 approved by Priya"
  ✅ Curator's quality score updates
  ✅ Reviewer's "reviews completed" count increments
  ✅ If all 5 approved → Lead notified: "Rahul's C3 is ready to build"
  ✅ Team Activity Feed: "Priya approved Rahul's Q1: FizzBuzz"

ON NEEDS REVISION:
  ✅ Question status → "Needs Revision"
  ✅ Curator notified: "Q2 needs revision — feedback: edge cases missing"
  ✅ Curator sees feedback in My Queue
  ✅ Team Activity Feed: "Priya requested revision on Rahul's Q2"
```

---

### Phase 4: Mission Build (Lead)

```
LEAD GETS NOTIFIED:
  "YH-PY-BASC C3 is ready to build (5/5 approved)"
  → In-app bell + browser push

ON CLICK "BUILD":
  ✅ build_mission.py runs
  ✅ mission.json generated
  ✅ validate_mission.py runs automatically
  ✅ If valid → "Ready to publish" + green checkmark
  ✅ If invalid → "Validation failed: Q3 hints missing" + red alert

ON CLICK "PUBLISH":
  ✅ upload_mission.js runs
  ✅ Mission uploaded to YuvaHive MongoDB
  ✅ Students can now see and solve the questions
  ✅ Lead notified: "YH-PY-BASC C3 published to YuvaHive"
  ✅ Curator notified: "Your questions are live!"
  ✅ Mission Tree: C3 → "Published" ✅ (lights up green)
  ✅ Team Activity Feed: "YH-PY-BASC C3 published — 5 questions live!"
  ✅ "Moment of Impact" counter starts: "0 students attempted"
```

---

## The Buddy System

### How It Works

Every curator is automatically paired with a buddy when they join. Buddies review each other's work, track each other's progress, and keep each other accountable.

```
BUDDY PAIRS:
┌──────────────┬──────────────┬──────────┬──────────┐
│ Curator      │ Buddy        │ Language │ Reviews  │
├──────────────┼──────────────┼──────────┼──────────┤
│ Rahul        │ Priya        │ Python   │ 12 done  │
│ Priya        │ Rahul        │ Python   │ 15 done  │
│ Amit         │ Sneha        │ C        │ 8 done   │
│ Sneha        │ Amit         │ C        │ 10 done  │
│ Dev          │ Kavya        │ Java     │ 6 done   │
│ Kavya        │ Dev          │ Java     │ 7 done   │
└──────────────┴──────────────┴──────────┴──────────┘
```

### Assignment Logic

```
WHEN QUESTIONS ARE SUBMITTED FOR REVIEW:

  1. Find curator's buddy
     → Is buddy available? (queue < BUDDY_CEILING)
     → YES → Assign to buddy

  2. Buddy overloaded?
     → Find least-loaded curator with same language
     → Assign to them
     → Notify Lead: "Buddy overloaded, reassigned to [name]"

  3. No one available?
     → Notify Lead: "All reviewers busy for [language]"
     → Lead manually assigns

  4. Lead override?
     → Lead can reassign any reviewer at any time
     → System notifies both old and new reviewer
```

### Buddy Features

| Feature | Description |
|---------|-------------|
| **Buddy Dashboard** | See your buddy's stats, current slot, recent reviews |
| **Buddy Reviews** | Review each other's questions (default assignment) |
| **Buddy Streaks** | Track consecutive days both buddies contributed |
| **Buddy Challenges** | Optional: "Let's both write 5 questions this week" |
| **Buddy Rotation** | Pairs rotate quarterly (Lead can override) |
| **Buddy Fallback** | If buddy is overloaded, auto-assign to lightest queue |

### Buddy Pair Performance

```
BUDDY PAIR: Rahul + Priya (Python)
┌─────────────────────────────────────────────────────────────┐
│  Combined Stats                                             │
│  Questions Written: 34 (Rahul: 18, Priya: 16)              │
│  Questions Approved: 31 (88% approval rate)                 │
│  Avg Quality Score: 4.3 / 5.0                               │
│  Reviews Completed: 27 (Rahul: 12, Priya: 15)              │
│  Current Streak: 8 days                                     │
│  Longest Streak: 14 days                                    │
│                                                             │
│  This Week                                                  │
│  Rahul: 3 questions written, 2 approved                     │
│  Priya: 2 questions written, 3 reviews done                 │
└─────────────────────────────────────────────────────────────┘
```

---

## RBAC — Role-Based Access Control

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN                                                      │
│  Everything. System config. User management. Audit logs.    │
│  Can impersonate any role for troubleshooting.               │
├─────────────────────────────────────────────────────────────┤
│  LEAD (per language)                                        │
│  Assign missions. View all analytics for their language.    │
│  Manage reviewers. Override buddy assignments.              │
│  Build and publish missions.                                │
├─────────────────────────────────────────────────────────────┤
│  SENIOR CURATOR                                             │
│  Review questions within their language/domain.             │
│  Cannot modify others' questions. Can approve/reject.       │
│  Earned by maintaining 4.0+ quality score for 2+ months.    │
├─────────────────────────────────────────────────────────────┤
│  CURATOR                                                    │
│  Write questions. Import via zip. Self-report.              │
│  View own stats only. Cannot review others' work.           │
│  Default role for content creators.                         │
├─────────────────────────────────────────────────────────────┤
│  NEWCOMER                                                   │
│  Read-only access. Cannot import until Lead approves.       │
│  Sees playbooks, mission tree, team activity.               │
│  Auto-promoted to Curator after first approved question.    │
└─────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Permission | Newcomer | Curator | Senior | Lead | Admin |
|------------|----------|---------|--------|------|-------|
| View Mission Tree | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Activity | ✅ | ✅ | ✅ | ✅ | �| View Own Stats | ❌ | ✅ | ✅ | ✅ | ✅ |
| View All Stats | ❌ | ❌ | ❌ | ✅ | ✅ |
| Import Questions | ❌ | ✅ (own) | ✅ (own) | ✅ (any) | ✅ (any) |
| Submit for Review | ❌ | ✅ | ✅ | ✅ | ✅ |
| Review Questions | ❌ | ❌ | ✅ (same lang) | ✅ (any) | ✅ (any) |
| Assign Missions | ❌ | ❌ | ❌ | ✅ | ✅ |
| Override Buddy | ❌ | ❌ | ❌ | ✅ | ✅ |
| Build Mission | ❌ | ❌ | ❌ | ✅ | ✅ |
| Publish Mission | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Audit Log | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| Impersonate Role | ❌ | ❌ | ❌ | ❌ | ✅ |

### Promotion Rules

| From | To | Condition |
|------|----|-----------|
| Newcomer | Curator | First question approved |
| Curator | Senior | 4.0+ quality score for 2+ months, 20+ questions approved |
| Senior | Lead | Appointed by Admin |
| Lead | Admin | Appointed by Admin |

### RBAC on Import

| Role | Can Import | Can Select Reviewer | Can Override Tests | Can Bulk Import |
|------|-----------|--------------------|--------------------|-----------------|
| Curator | Own questions only | From buddy pair | No | No |
| Senior | Own questions only | From buddy pair | No | No |
| Lead | Any curator | Anyone | Yes | Yes |
| Admin | Anyone | Anyone | Yes | Yes |

---

## Multi-Curator Missions

### How It Works

Lead can assign 2+ curators to the same mission/topic. This is useful for:
- **Parallel work** — Two curators write different questions in the same topic
- **Collaboration** — Two curators co-write questions for faster completion
- **Mentoring** — Senior curator paired with newcomer on same mission

### Lead Assignment Interface

```
ASSIGN MISSION
┌─────────────────────────────────────────────────────────────┐
│  Mission: [YH-PY-BASC ▼]                                    │
│  Topic: [C3 — Building Things ▼]                            │
│                                                             │
│  Assign Curators:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Rahul ✓]  [Priya ✓]  [Amit]  [Sneha]  [Dev]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Work Mode:                                                  │
│  ○ Parallel — Each works on different questions             │
│  ● Collaborative — Both work on same questions              │
│  ○ Mentoring — Senior guides newcomer                       │
│                                                             │
│  [Assign 2 Curators]                                        │
└─────────────────────────────────────────────────────────────┘
```

### Mission Progress (Multi-Curator)

```
YH-PY-BASC C3 — Building Things
┌─────────────────────────────────────────────────────────────┐
│  Curators: Rahul + Priya                                    │
│  Work Mode: Collaborative                                   │
│  Status: In Progress                                        │
│                                                             │
│  Progress:                                                   │
│  Q1: FizzBuzz        ✅ Written (Rahul)  ✅ Approved        │
│  Q2: Temp Converter  ✅ Written (Priya)  ✅ Approved        │
│  Q3: Password Check  ✅ Written (Rahul)  ⏳ In Review       │
│  Q4: Countdown Timer ✅ Written (Priya)  ⏳ In Review       │
│  Q5: Multiplication  ⏳ In Progress (Rahul)                 │
│                                                             │
│  Combined: 4/5 written, 2/5 approved                        │
│  Quality Score: 4.2 / 5.0                                   │
│                                                             │
│  [View Rahul's Stats]  [View Priya's Stats]                │
└─────────────────────────────────────────────────────────────┘
```

---

## Lead Analytics Dashboard

The Lead sees everything about their language domain. Not just what's happening, but what it means.

### Lead Dashboard

```
LEAD DASHBOARD — Python
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  TEAM HEALTH                                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Curators: 6 │ Active: 5   │ Reviews Due:3│ Avg Score:4.2│ │
│  │ Questions: 89│ Approved: 76│ Published: 12│ Velocity: 4.1│ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
│                                                             │
│  MISSION PROGRESS                                           │
│  YH-PY-BASC: ████████████████░░░░ 88% (15/17)              │
│  YH-PY-EASY: ██████████░░░░░░░░░░ 50% (10/20)              │
│  YH-PY-MEDI: ████░░░░░░░░░░░░░░░░ 20% (4/20)              │
│                                                             │
│  CURATOR PERFORMANCE                                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Curator  │ Written  │ Approved │ Quality  │ Streak   │  │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤  │
│  │ Rahul    │ 18       │ 16       │ 4.3 ⭐   │ 8 days   │  │
│  │ Priya    │ 16       │ 15       │ 4.4 ⭐   │ 12 days  │  │
│  │ Amit     │ 12       │ 10       │ 4.1      │ 5 days   │  │
│  │ Sneha    │ 10       │ 9        │ 4.2      │ 3 days   │  │
│  │ Dev      │ 8        │ 7        │ 4.0      │ 0 days   │  │
│  │ Kavya    │ 6        │ 5        │ 3.9      │ 1 day    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                             │
│  WORKLOAD                                                   │
│  Rahul:  ████████░░ 80% (4/5 slots)                        │
│  Priya:  ██████░░░░ 60% (3/5 slots)                        │
│  Amit:   ████░░░░░░ 40% (2/5 slots)                        │
│  Sneha:  ██████████ 100% (5/5 slots) ⚠️ Overloaded         │
│  Dev:    ██░░░░░░░░ 20% (1/5 slots)                        │
│  Kavya:  █░░░░░░░░░ 10% (0.5/5 slots)                      │
│                                                             │
│  REVIEWS OVERDUE                                            │
│  ⚠️ 3 reviews pending > 24 hours                            │
│  → Priya: 2 reviews (Rahul's Q3, Q4)                       │
│  → Amit: 1 review (Sneha's Q1)                             │
│                                                             │
│  [View All]  [Assign Slots]  [Override Buddy]              │
└─────────────────────────────────────────────────────────────┘
```

### Lead Analytics — Individual Curator View

```
CURATOR: Rahul (Python)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STATS                                                      │
│  Questions Written: 18                                      │
│  Questions Approved: 16 (89% approval rate)                 │
│  Avg Quality Score: 4.3 / 5.0                               │
│  Current Streak: 8 days                                     │
│  Longest Streak: 14 days                                    │
│  Reviews Completed: 12                                      │
│  Avg Review Time: 4.2 hours                                 │
│                                                             │
│  QUALITY TREND (Last 30 Days)                               │
│  5.0 ┤                                                      │
│  4.5 ┤         ●───●                                        │
│  4.0 ┤    ●───●     ●───●───●                               │
│  3.5 ┤───●                              ●───●               │
│  3.0 ┤                                                      │
│      └──────────────────────────────────────                 │
│      Week 1    Week 2    Week 3    Week 4                   │
│                                                             │
│  CURRENT ASSIGNMENTS                                        │
│  YH-PY-BASC C3: 3/5 written, 2/5 approved                  │
│  YH-PY-EASY Q2: 1/5 written, 0/5 approved                  │
│                                                             │
│  BUDDY: Priya                                               │
│  Combined Quality: 4.35                                     │
│  Combined Reviews: 27                                       │
│                                                             │
│  [View Questions]  [View Reviews]  [Reassign]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Admin Full Visibility

Admin sees everything. Every user, every mission, every action. Plus system-level controls.

### Admin Dashboard

```
ADMIN DASHBOARD
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  SYSTEM HEALTH                                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Users: 24   │ Active: 21  │ Questions:347│ Published:48│ │
│  │ Languages:5 │ Missions:12 │ Avg Score:4.1│ Uptime:99.8%│ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
│                                                             │
│  ALL MISSIONS (All Languages)                               │
│  ┌──────────────┬──────────┬──────────┬──────────┬────────┐│
│  │ Mission      │ Language │ Progress │ Quality  │ Status ││
│  ├──────────────┼──────────┼──────────┼──────────┼────────┤│
│  │ YH-PY-BASC   │ Python   │ 88%      │ 4.3      │ Active ││
│  │ YH-PY-EASY   │ Python   │ 50%      │ 4.1      │ Active ││
│  │ YH-C-BASC    │ C        │ 47%      │ 4.0      │ Active ││
│  │ YH-CP-BASC   │ C++      │ 18%      │ 3.9      │ Active ││
│  │ YH-JS-BASC   │ JS       │ 0%       │ —        │ Planned││
│  │ YH-JV-BASC   │ Java     │ 0%       │ —        │ Planned││
│  └──────────────┴──────────┴──────────┴──────────┴────────┘│
│                                                             │
│  ALL USERS                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ User     │ Role     │ Language │ Quality  │ Status   │  │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤  │
│  │ Rahul    │ Curator  │ Python   │ 4.3      │ Active   │  │
│  │ Priya    │ Senior   │ Python   │ 4.4      │ Active   │  │
│  │ Amit     │ Curator  │ C        │ 4.1      │ Active   │  │
│  │ Sneha    │ Lead     │ C        │ 4.2      │ Active   │  │
│  │ Dev      │ Curator  │ Java     │ 4.0      │ Active   │  │
│  │ Kavya    │ Newcomer │ Java     │ 3.9      │ Onboard  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                             │
│  RECENT ACTIVITY (All Users)                                │
│  09:42 — Rahul imported 5 questions (YH-PY-BASC C3)        │
│  09:38 — Priya approved Rahul's Q1: FizzBuzz                │
│  09:15 — Amit submitted 3 questions (YH-C-BASC C2)         │
│  09:02 — Sneha published YH-C-BASC C1                      │
│  08:45 — Dev joined as Newcomer (Java)                      │
│                                                             │
│  AUDIT LOG                                                  │
│  [View Full Log]  [Export]  [Filter by User]               │
│                                                             │
│  USER MANAGEMENT                                            │
│  [Add User]  [Manage Roles]  [Deactivate]                  │
│                                                             │
│  [Impersonate User]  [System Settings]  [Export Data]      │
└─────────────────────────────────────────────────────────────┘
```

### Admin — Audit Log

```
AUDIT LOG (Last 24 Hours)
┌──────────┬──────────┬──────────────────────────────────────┐
│ Time     │ User     │ Action                               │
├──────────┼──────────┼──────────────────────────────────────┤
│ 09:42    │ Rahul    │ Imported 5 questions (YH-PY-BASC C3) │
│ 09:38    │ Priya    │ Approved Q1: FizzBuzz (score: 4.5)   │
│ 09:15    │ Amit     │ Submitted 3 questions (YH-C-BASC C2) │
│ 09:02    │ Sneha    │ Published YH-C-BASC C1               │
│ 08:45    │ Dev      │ Account created (Newcomer)            │
│ 08:30    │ Admin    │ Promoted Priya to Senior Curator      │
│ 08:15    │ Lead     │ Assigned Rahul + Priya to YH-PY-BASC │
│ 08:00    │ System   │ Auto-assigned buddy pairs (rotation)  │
│ 07:45    │ Admin    │ Updated BUDDY_CEILING from 5 to 7     │
│ 07:30    │ System   │ Session expired for inactive user     │
└──────────┴──────────┴──────────────────────────────────────┘
```

### Admin — User Management

```
USER: Rahul
┌─────────────────────────────────────────────────────────────┐
│  Name: Rahul                                                │
│  Email: rahul@hiveos.dev                                    │
│  Role: Curator                                             │
│  Language: Python                                           │
│  Buddy: Priya                                              │
│  Joined: 2026-01-15                                        │
│  Last Active: 2026-07-08                                   │
│                                                             │
│  Stats:                                                     │
│  Questions Written: 18                                      │
│  Questions Approved: 16 (89%)                               │
│  Avg Quality: 4.3                                           │
│  Reviews Done: 12                                           │
│  Streak: 8 days                                             │
│                                                             │
│  Actions:                                                   │
│  [Change Role]  [Change Language]  [Reassign Buddy]        │
│  [View Activity]  [View Audit Log]  [Deactivate]           │
│                                                             │
│  Impersonate: [Login as Rahul]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## The Import Bridge

### How It Works

HiveDesk is a browser app hosted on GitHub Pages. It can't read local files. The bridge connects them:

```
HiveLab Folder                Zip Upload               HiveDesk (GitHub Pages)
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ PY-BASC/         │    │                  │    │ ImportBridge.jsx │
│   C3/            │───►│  Curator zips    │───►│                  │
│     Q1/          │    │  folder, drags   │    │ JSZip parses     │
│       question.md│    │  into browser    │    │ client-side      │
│       Solution.py│    │                  │    │                  │
│       tests.json │    └──────────────────┘    │ Validates against│
│     Q2/          │                            │ LIVE schema from │
│       ...        │                            │ GAS endpoint     │
└──────────────────┘                            └──────────────────┘
                                                        │
                                                  POST to GAS API
                                                        │
                                                  Google Sheets
                                                        │
                                            HiveDeskSchema sheet
                                            (Lead/Admin editable)
```

### Why Zip Upload (Not Local Script)

- **No terminal required** — Curators stay in the browser
- **No Python dependency** — Works on any OS
- **No auth needed** — Browser handles everything
- **Works on GitHub Pages** — No server, no CORS issues
- **Schema validation client-side** — Fetches live schema from GAS endpoint

### Schema — Live, Editable, Single Source of Truth

The schema is NOT a static file. It's a **live Google Sheet** that Lead and Admin can edit through the UI. Changes take effect immediately for all importers.

```
HiveDeskSchema Sheet (Google Sheets)
┌─────────────────────────────────────────────────────────────┐
│  field        │ type      │ required │ constraints          │
├───────────────┼───────────┼──────────┼──────────────────────┤
│ question.md   │ file      │ true     │ min_length: 100      │
│ Solution.py   │ file      │ true     │ min_length: 50       │
│ tests.json    │ file      │ true     │ min_cases: 3         │
│ hints         │ folder    │ true     │ count: 3             │
│ folder.name   │ pattern   │ true     │ regex: Q[1-5]        │
│ folder.count  │ number    │ true     │ min: 3, max: 5       │
└───────────────┴───────────┴──────────┴──────────────────────┘
                     ↑
                     │ Lead/Admin edits via UI
                     │ Changes take effect immediately
                     │
              GAS GET /schema
                     │
              ImportBridge.jsx fetches & validates
              HiveLab scripts fetch & validate locally
```

**Schema Editor (Lead/Admin only):**

```
SCHEMA EDITOR
┌─────────────────────────────────────────────────────────────┐
│  Question Schema                                     [Edit] │
│                                                             │
│  Required Files:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ question.md    [Required ✓]  Min length: [100]      │   │
│  │ Solution.py    [Required ✓]  Min length: [50]       │   │
│  │ tests.json     [Required ✓]  Min cases: [3]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Hints:  [Required: 3]  Min length each: [50]             │
│  Folder: [Q prefix ✓]  Min folders: [3]  Max: [5]         │
│                                                             │
│  [Save]  [Reset to Default]  [View History]                │
└─────────────────────────────────────────────────────────────┘
```

**Why this works:**
- **No file sync** — Single source of truth in Google Sheets
- **No network dependency for HiveLab** — Scripts fetch from GAS endpoint once, cache locally
- **Lead/Admin control** — Adapt schema as curriculum evolves, no code changes needed
- **Instant propagation** — All importers see the updated schema on next import
- **Audit trail** — Schema changes logged in HiveDeskAuditLog

---

## HiveDesk Board Changes

### Consolidated Boards (Before → After)

```
BEFORE (25 boards):                    AFTER (~12 boards):
┌──────────────────────┐              ┌──────────────────────┐
│ War Room             │              │ War Room             │
│ My Queue             │              │ My Slot              │
│ Standup              │              │ My Questions         │
│ Work Logs            │              │ My Reviews           │
│ Check-Ins            │              │                      │
│ Bounties             │              │ Team                 │
│ Questions            │              │ DailyLog             │ ← Merged 3 forms
│ Pipeline             │              │ Reviews              │
│ Sprints              │              │                      │
│ Burndown             │              │ Growth               │
│ Reviews              │              │ Achievements         │
│ Team                 │              │ Leaderboard          │ ← NEW
│ Skills               │              │ Streak               │ ← NEW
│ Kudos                │              │                      │
│ Goals                │              │ Missions             │
│ Achievements         │              │ Mission Tree         │ ← NEW
│ Wrapped              │              │ Build Pipeline       │ ← NEW
│ Workload             │              │ Import Bridge        │ ← NEW
│ Analytics            │              │                      │
│ Mood Trends          │              │ Admin (hidden)       │
│ Retro                │              │ Users                │
│ Import               │              │ Audit Log            │
│ Users                │              │ Settings             │
│ Audit Log            │              │                      │
│ Settings             │              └──────────────────────┘
└──────────────────────┘
```

### New Boards

#### 1. Mission Tree

Visual curriculum progress at a glance. Like a skill tree in a game.

```
MISSION TREE
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  YH-PY-BASC (Python Beginner)                    88% ████░ │
│  ├── C1 First Candy      ✅ Published    (4.3)             │
│  ├── C2 Getting Cozy     ✅ Published    (4.2)             │
│  ├── C3 Building Things  🔨 In Review    (4.4)             │
│  │   ├── Q1 FizzBuzz     ✅ Approved                         │
│  │   ├── Q2 Temp Conv    ✅ Approved                         │
│  │   ├── Q3 Password     ⏳ Review                          │
│  │   ├── Q4 Countdown    ⏳ Review                          │
│  │   └── Q5 Multiply     ⏳ In Progress                     │
│  └── C4 Level Up         ⏳ In Progress (Rahul)            │
│                                                             │
│  YH-C-BASC (C Beginner)                        47% ██░░░   │
│  ├── C1 First Candy      ✅ Published    (4.0)             │
│  ├── C2 Getting Cozy     🔨 Building     (4.1)             │
│  ├── C3 Building Things  ⏳ Not started                     │
│  └── C4 Level Up         ⏳ Not started                     │
│                                                             │
│  YH-CP-BASC (C++ Beginner)                     18% █░░░░   │
│  ├── C1 First Candy      🔨 In Progress (Sneha)            │
│  ├── C2 Getting Cozy     ⏳ Not started                     │
│  ├── C3 Building Things  ⏳ Not started                     │
│  └── C4 Level Up         ⏳ Not started                     │
│                                                             │
│  ─────────────────────────────────────────────────          │
│  Legend: ✅ Published  🔨 In Progress  ⏳ Pending            │
│  Numbers in parentheses = quality score                     │
└─────────────────────────────────────────────────────────────┘
```

#### 2. DailyLog (Merged Standup + Work Logs + Check-Ins)

One form replaces three. One entry per person per day.

```
DAILY LOG — Rahul (2026-07-08)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  What I did today:                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Wrote Q3 and Q4 for YH-PY-BASC C3                   │   │
│  │ Reviewed Priya's Q2 (approved)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Blockers:                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ None                                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Hours: [4]  Mood: [😊 Happy]                              │
│                                                             │
│  [Submit]                                                    │
└─────────────────────────────────────────────────────────────┘

WEEKLY SUMMARY (auto-computed, not a separate form):
┌─────────────────────────────────────────────────────────────┐
│  Week of July 7-12, 2026                                    │
│                                                             │
│  Days Logged: 5/5                                           │
│  Avg Hours: 3.8                                             │
│  Questions Written: 8                                       │
│  Questions Reviewed: 6                                      │
│  Quality Score: 4.3                                         │
│                                                             │
│  Mood Trend: 😊😊😊😊😊                                    │
│                                                             │
│  Blockers This Week: None                                   │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Leaderboard

Quality-ranked, not quantity-ranked. The best curators are recognized.

```
LEADERBOARD — Python (This Month)
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Rank     │ Curator  │ Written  │ Approved │ Quality  │ Streak   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 🥇 1     │ Priya    │ 16       │ 15       │ 4.4      │ 12 days  │
│ 🥈 2     │ Rahul    │ 18       │ 16       │ 4.3      │ 8 days   │
│ 🥉 3     │ Sneha    │ 10       │ 9        │ 4.2      │ 3 days   │
│ 4        │ Amit     │ 12       │ 10       │ 4.1      │ 5 days   │
│ 5        │ Dev      │ 8        │ 7        │ 4.0      │ 0 days   │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Badges:
  🏆 Quality King — Priya (highest quality score this month)
  🔥 Streak Master — Priya (longest active streak)
  📝 Prolific Writer — Rahul (most questions written)
  👀 Review Champion — Priya (most reviews completed)
  🌟 Rising Star — Dev (biggest quality improvement)
```

#### 4. Streak Tracker

```
YOUR STREAK — Rahul
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Current Streak: 8 days 🔥                                  │
│  Longest Streak: 14 days                                    │
│  Total Contribution Days: 47                                │
│                                                             │
│  This Month:                                                │
│  Mon ████████████ ✅                                        │
│  Tue ████████████ ✅                                        │
│  Wed ████████████ ✅                                        │
│  Thu ████████████ ✅                                        │
│  Fri ████████████ ✅                                        │
│  Sat ░░░░░░░░░░░░ ❌ (missed)                               │
│  Sun ░░░░░░░░░░░░ ❌ (missed)                               │
│                                                             │
│  Keep it up! 2 more days to beat your record.               │
│                                                             │
│  TEAM STREAKS:                                              │
│  Priya: 12 days 🔥                                          │
│  Amit: 5 days                                               │
│  Sneha: 3 days                                              │
│  Dev: 0 days                                                │
└─────────────────────────────────────────────────────────────┘
```

#### 5. Curator Profile

```
CURATOR PROFILE — Rahul
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Level: ⭐ Senior Curator                                   │
│  Language: Python                                           │
│  Buddy: Priya                                              │
│                                                             │
│  ─────────────────────────────────────────────────          │
│                                                             │
│  STATS                                                      │
│  Questions Written: 18                                      │
│  Questions Approved: 16 (89% approval rate)                 │
│  Avg Quality Score: 4.3 / 5.0                               │
│  Reviews Completed: 12                                      │
│  Current Streak: 8 days                                     │
│  Longest Streak: 14 days                                    │
│  Member Since: Jan 2026                                     │
│                                                             │
│  ─────────────────────────────────────────────────          │
│                                                             │
│  BADGES                                                     │
│  🏆 Quality King (3x)                                       │
│  🔥 Streak Master (2x)                                      │
│  📝 Prolific Writer (1x)                                    │
│  👀 Review Champion (1x)                                    │
│                                                             │
│  ─────────────────────────────────────────────────          │
│                                                             │
│  QUALITY TREND (Last 90 Days)                               │
│  5.0 ┤                                                      │
│  4.5 ┤         ●───●                                        │
│  4.0 ┤    ●───●     ●───●───●───●                           │
│  3.5 ┤───●                              ●───●───●           │
│  3.0 ┤                                                      │
│      └──────────────────────────────────────────             │
│                                                             │
│  ─────────────────────────────────────────────────          │
│                                                             │
│  IMPACT                                                     │
│  Questions Published: 12                                    │
│  Students Who Solved Them: 847                              │
│  Avg Student Score: 78%                                     │
│  "Moment of Impact": Your FizzBuzz question has been        │
│  solved by 234 students this week! 🎯                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 6. Team Activity Feed

```
TEAM ACTIVITY — Python (Today)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  09:42 — Rahul imported 5 questions (YH-PY-BASC C3)        │
│  09:38 — Priya approved Rahul's Q1: FizzBuzz (4.5)         │
│  09:15 — Amit submitted 3 questions (YH-C-BASC C2)         │
│  09:02 — Sneha published YH-C-BASC C1                      │
│  08:45 — Dev joined as Newcomer (Java)                      │
│  08:30 — Rahul's streak reached 8 days 🔥                   │
│  08:15 — Priya's streak reached 12 days 🔥🔥                 │
│  08:00 — System auto-assigned buddy pairs (rotation)        │
│                                                             │
│  ─────────────────────────────────────────────────          │
│                                                             │
│  YESTERDAY                                                  │
│  17:30 — Lead assigned Rahul + Priya to YH-PY-BASC C3      │
│  16:45 — Amit approved Sneha's Q3: Loop Pattern (4.0)      │
│  15:20 — Rahul wrote Q1: FizzBuzz (100% tests)             │
│  14:10 — Priya wrote Q2: Temp Converter (100% tests)       │
│  13:00 — Dev completed onboarding (Newcomer → Curator)      │
│                                                             │
│  [View All]  [Filter by Curator]  [Filter by Event]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Updated Data Models

### HiveDeskSlots Sheet

| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique slot ID |
| curatorId | string | Assigned curator |
| missionCode | string | e.g., YH-PY-BASC |
| topicId | string | e.g., C3 |
| topicName | string | e.g., Building Things |
| language | string | e.g., python |
| status | string | draft / in-progress / submitted / review / approved / published |
| reviewerId | string | Assigned peer reviewer (from buddy pair or load-based) |
| workMode | string | parallel / collaborative / mentoring |
| startDate | date | When assigned |
| endDate | date | Target completion |
| questionCount | number | Total questions needed |
| completedCount | number | Questions completed |
| testPassRate | number | % of tests passing |

### Updated HiveDeskQuestions Sheet

| Column | Type | Description |
|--------|------|-------------|
| id | string | HDQ-NNN |
| slotId | string | Reference to slot |
| missionCode | string | e.g., YH-PY-BASC |
| topicId | string | e.g., C3 |
| questionId | string | e.g., Q1 |
| language | string | e.g., python |
| folderPath | string | e.g., PY-BASC/building-things/Q1 |
| title | string | Question title |
| status | string | draft / in-progress / submitted / review / approved / published / needs-revision |
| curatorTestResult | string | PASS / FAIL / PENDING (curator's own report) |
| reviewerTestResult | string | PASS / FAIL / PENDING (reviewer's report) |
| leadTestResult | string | PASS / FAIL / PENDING (lead's report) |
| testScore | number | 0-100 |
| solutionScore | number | Code quality score (0-100) |
| reviewerId | string | Who's reviewing |
| reviewScore | number | Average review score (1-5) |
| hivelabSynced | date | Last sync timestamp |

### HiveDeskUsers Sheet

| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique user ID |
| name | string | Display name |
| email | string | Email address |
| role | string | newcomer / curator / senior / lead / admin |
| language | string | Primary language |
| buddyId | string | Assigned buddy |
| qualityScore | number | Running average (1-5) |
| questionsWritten | number | Total written |
| questionsApproved | number | Total approved |
| reviewsCompleted | number | Total reviews done |
| currentStreak | number | Consecutive contribution days |
| longestStreak | number | Best streak ever |
| joinedAt | date | Account creation date |
| lastActive | date | Last activity timestamp |
| status | string | active / inactive / deactivated |

### HiveDeskAuditLog Sheet

| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique log ID |
| timestamp | date | When action occurred |
| userId | string | Who performed action |
| action | string | e.g., import, review, approve, publish, role_change |
| target | string | What was affected (question ID, mission code, etc.) |
| details | string | JSON blob with extra context |
| ipAddress | string | For security auditing |

---

## Notification System

### In-App Bell (Primary)

Always works. No opt-in required. Shows count of unread notifications.

```
NOTIFICATION BELL (top right):
  🔔 3  ← unread count

DROPDOWN:
┌─────────────────────────────────────────────────────────────┐
│  Notifications (3 unread)                                   │
│                                                             │
│  🔴 Priya approved your Q1: FizzBuzz (4.5)     2 min ago  │
│  🔴 You have 2 questions to review              15 min ago │
│  🔴 YH-PY-BASC C3 is 80% complete              1 hour ago │
│                                                             │
│  ⚪ Lead assigned you to YH-PY-BASC C3          3 hours ago│
│  ⚪ Priya submitted Q2: Temp Converter          5 hours ago│
│                                                             │
│  [Mark All Read]  [View All]                                │
└─────────────────────────────────────────────────────────────┘
```

### Browser Push (Opt-In)

Request permission once. Shows system notification even when tab is not active.

```
BROWSER PUSH NOTIFICATION:
┌─────────────────────────────────────┐
│  🔔 HiveDesk                        │
│                                     │
│  Priya approved your Q1: FizzBuzz   │
│  Score: 4.5 / 5.0                   │
│                                     │
│  [View]  [Dismiss]                  │
└─────────────────────────────────────┘
```

### Notification Triggers

| Event | Who Gets Notified | Channel | Message |
|-------|-------------------|---------|---------|
| Slot assigned | Curator | Bell + Push | "You've been assigned {mission} Topic {topic}" |
| Questions imported | Reviewer | Bell + Push | "{curator} submitted {count} questions to review" |
| Review completed | Curator | Bell + Push | "Your {question} was {approved/needs revision}" |
| All questions approved | Lead | Bell + Push | "{curator}'s {topic} is ready to build" |
| Mission built | Lead | Bell | "{mission} mission.json generated" |
| Mission published | Curator + Lead | Bell + Push | "{mission} is now live on YuvaHive" |
| Stale review (24h) | Lead | Bell | "Review for {question} is overdue" |
| Stale slot (7 days) | Lead + Curator | Bell | "Slot {mission} {topic} hasn't started" |
| Buddy overloaded | Lead | Bell | "Buddy {name} queue full, reassigned to {other}" |
| Streak milestone | Curator | Bell + Push | "You're on a 7-day streak! 🔥" |
| Quality milestone | Curator | Bell + Push | "Your quality score reached 4.5! ⭐" |

---

## Auto-Assignment Rules

### Reviewer Assignment

```
WHEN QUESTIONS ARE SUBMITTED FOR REVIEW:

  1. Find curator's buddy (from HiveDeskUsers.buddyId)
     → Is buddy available? (queue < BUDDY_CEILING, configurable in Settings)
     → YES → Assign to buddy
     → Notify buddy: "You have {count} questions from {curator} to review"

  2. Buddy overloaded?
     → Find least-loaded curator with same language
     → Assign to them
     → Notify Lead: "Buddy overloaded, reassigned to {name}"

  3. No one available?
     → Notify Lead: "All reviewers busy for {language}"
     → Lead manually assigns

  4. Lead override?
     → Lead can reassign any reviewer at any time
     → System notifies both old and new reviewer
     → Audit log records the override
```

### Buddy Pair Rotation

```
EVERY QUARTER:
  → System suggests new buddy pairs based on:
    - Same language
    - Similar experience level (within 1 level)
    - Not paired before (if possible)
    - Balanced workload
  → Lead reviews and approves/adjusts
  → New pairs take effect Monday
  → Audit log records the rotation
```

---

## Implementation Phases

### Phase 1: Security P0 (Days 1-2)

| Task | Effort | Files |
|------|--------|-------|
| Fix `hasPermission: () => true` bypass | 30 min | AuthContext.jsx |
| Add server-side role validation to GAS | 3 hours | code.gs |
| Remove hardcoded API keys | 2 hours | HiveDeskStorage.js, GoogleSheetsService.js |
| Remove plaintext passwords | 2 hours | code.gs (both copies) |
| Add session tokens (30 days) | 3 hours | AuthContext.jsx, code.gs |
| Create HiveDeskUsers sheet | 2 hours | code.gs, HiveDeskStorage.js |
| Create HiveDeskAuditLog sheet | 2 hours | code.gs, HiveDeskStorage.js |

### Phase 2: RBAC + Buddy System (Days 3-4)

| Task | Effort | Files |
|------|--------|-------|
| Implement proper RBAC with 5 roles | 4 hours | RBAC.jsx, AuthContext.jsx |
| Build buddy pair assignment logic | 3 hours | code.gs, HiveDeskStorage.js |
| Build buddy rotation system | 2 hours | code.gs |
| Build promotion rules (Newcomer → Curator) | 2 hours | code.gs |
| Add audit logging | 3 hours | code.gs, HiveDeskStorage.js |

### Phase 3: Import Bridge + Schema (Days 5-6)

| Task | Effort | Files |
|------|--------|-------|
| Create HiveDeskSchema sheet + GAS endpoint | 2 hours | code.gs, HiveDeskStorage.js |
| Build Schema Editor component (Lead/Admin) | 3 hours | HiveDesk/src/components/admin/SchemaEditor.jsx |
| Build questionParser.js (JSZip + live schema) | 4 hours | HiveDesk/src/utils/ |
| Build ImportBridge.jsx | 4 hours | HiveDesk/src/components/imports/ |
| Add reviewer auto-assignment on import | 2 hours | ImportBridge.jsx |
| Add schema endpoint for HiveLab scripts | 1 hour | code.gs |

### Phase 4: Engagement (Days 7-9)

| Task | Effort | Files |
|------|--------|-------|
| Build MissionTree component | 4 hours | HiveDesk/src/components/missions/ |
| Build CuratorProfile component | 3 hours | HiveDesk/src/components/profile/ |
| Build Leaderboard component | 3 hours | HiveDesk/src/components/leaderboard/ |
| Build StreakTracker component | 2 hours | HiveDesk/src/components/streak/ |
| Build TeamActivityFeed component | 3 hours | HiveDesk/src/components/feed/ |
| Build DailyLog (merge 3 forms) | 3 hours | HiveDesk/src/components/dailylog/ |
| Update War Room with engagement data | 3 hours | WarRoomDashboard.jsx |

### Phase 5: Analytics (Days 10-11)

| Task | Effort | Files |
|------|--------|-------|
| Build Lead Analytics Dashboard | 4 hours | HiveDesk/src/components/analytics/ |
| Build Admin Dashboard | 4 hours | HiveDesk/src/components/admin/ |
| Build Audit Log viewer | 2 hours | HiveDesk/src/components/admin/ |
| Build User Management panel | 2 hours | HiveDesk/src/components/admin/ |
| Add "Moment of Impact" counter | 2 hours | HiveDesk/src/components/profile/ |

### Phase 6: Boards + Polish (Days 12-13)

| Task | Effort | Files |
|------|--------|-------|
| Consolidate boards (25 → ~12) | 4 hours | Sidebar.jsx, various |
| Add notification system (bell + push) | 4 hours | HiveDesk/src/components/notifications/ |
| Update Question Bank with HiveLab fields | 2 hours | QuestionBank.jsx |
| Update export functionality | 2 hours | export.js |
| Testing and bug fixes | 4 hours | Various |

### Phase 7: Playbooks + Pilot (Days 14-15)

| Task | Effort | Files |
|------|--------|-------|
| Rewrite Curator Playbook (workflow-first) | 3 hours | playbooks_hivedesk/ |
| Rewrite Lead Playbook (workflow-first) | 3 hours | playbooks_hivedesk/ |
| Rewrite Admin Playbook (workflow-first) | 2 hours | playbooks_hivedesk/ |
| Pilot with 2 curators | 4 hours | — |
| Bug fixes from pilot | 4 hours | Various |

---

## File Manifest

### New Files

```
HROS/
├── revamp/
│   └── README.md                        ← This file
│
├── HiveDesk/
│   └── src/
│       ├── utils/
│       │   └── questionParser.js        ← JSZip + live schema validation
│       └── components/
│           ├── missions/
│           │   └── MissionTree.jsx      ← Curriculum progress visualizer
│           ├── slots/
│           │   └── SlotAssignment.jsx   ← Lead assigns curators (multi-curator)
│           ├── build/
│           │   └── BuildPipeline.jsx    ← Mission → JSON → upload
│           ├── imports/
│           │   └── ImportBridge.jsx     ← Zip upload with client-side parsing
│           ├── profile/
│           │   └── CuratorProfile.jsx   ← Stats, badges, quality, impact
│           ├── leaderboard/
│           │   └── Leaderboard.jsx      ← Quality-ranked leaderboard
│           ├── streak/
│           │   └── StreakTracker.jsx    ← Contribution streaks
│           ├── feed/
│           │   └── TeamActivityFeed.jsx ← Real-time team activity
│           ├── dailylog/
│           │   └── DailyLog.jsx         ← Merged standup + work log + check-in
│           ├── notifications/
│           │   └── NotificationBell.jsx ← In-app bell + browser push
│           └── admin/
│               ├── AdminDashboard.jsx   ← Full system visibility
│               ├── SchemaEditor.jsx     ← Lead/Admin edits question schema
│               ├── AuditLog.jsx         ← Action audit trail
│               └── UserManagement.jsx   ← User role management
│
└── playbooks_hivedesk/
    ├── HIVEDESK_CURATOR_PLAYBOOK.md     ← Rewritten (workflow-first)
    ├── HIVEDESK_LEAD_PLAYBOOK.md        ← Rewritten (workflow-first)
    └── HIVEDESK_ADMIN_PLAYBOOK.md       ← Rewritten (workflow-first)
```

### Modified Files

```
HiveDesk/
├── src/
│   ├── auth/
│   │   ├── AuthContext.jsx              ← Fix hasPermission, session tokens, RBAC
│   │   └── RBAC.jsx                     ← Proper 5-role permission system
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── WarRoomDashboard.jsx     ← Add mission progress + engagement
│   │   ├── questions/
│   │   │   └── QuestionBank.jsx         ← Add HiveLab fields + view toggle
│   │   └── layout/
│   │       └── Sidebar.jsx             ← Consolidated nav (25 → ~12 boards)
│   └── services/
│       ├── HiveDeskStorage.js           ← Add Users, AuditLog, Slots, Schema sheets
│       └── GoogleSheetsService.js       ← Remove hardcoded API key
│
└── code.gs                              ← Add RBAC, audit logging, notifications, schema endpoint
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time from assignment to submission | 5-7 days | 3-4 days |
| Time from submission to review | 2-3 days | < 24 hours |
| Time from approval to publish | 1-2 days | < 4 hours |
| Curator time on data entry | ~40% | < 5% |
| Curator time on content creation | ~60% | > 95% |
| Questions published per week | 10-15 | 25-30 |
| Average quality score | 3.8 | 4.2+ |
| Curator engagement (daily active) | ~50% | > 80% |
| Review turnaround (buddy pair) | 2-3 days | < 12 hours |
| New curator onboarding time | 1 week | 1 day (playbook only) |

---

## Summary

```
BEFORE:
  Curator: "I write questions, then I manually update HiveDesk,
            then I push to git, then I tell the lead, then..."

  Lead: "I manually check who's doing what, manually assign reviewers,
         manually build missions, manually upload..."

  Admin: "I have no idea what's happening until someone tells me."

AFTER:
  Curator: "I write questions. The system tracks everything.
            I can see my stats, my streak, my impact.
            My buddy and I keep each other accountable."

  Lead: "I assign missions (2+ curators if needed), monitor analytics,
         review quality trends, and publish when ready."

  Admin: "I see everything. Every user, every mission, every action.
          I can manage roles, impersonate users, and audit the system."
```

The curators become content creators, not data entry operators. The system handles the workflow, tracking, notifications, builds, and publishing. And they can see their impact — their questions are being solved by real students.

---

*HiveDesk Ecosystem Revamp — July 2026*
