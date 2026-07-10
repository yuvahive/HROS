# HiveDesk Lead Playbook

> **Role:** Lead (per language domain)
> **Access:** Assign missions, manage reviewers, build/publish, view all analytics
> **Last Updated:** July 2026

---

## First Time Setup

### Your Environment
- HiveDesk is live at the URL your Admin deployed
- Login with credentials given to you by Admin
- You see the War Room dashboard

### Initial Setup Checklist
1. ✅ Login works
2. ✅ You can see War Room, Mission Tree, Analytics
3. ✅ Go to Users → Verify your role is "lead"
4. ✅ Go to Schema → Verify default fields are present
5. ✅ Go to Settings → Review team targets

---

## What Do I Do Monday Morning?

1. **Open HiveDesk** → Land on **War Room**
2. **Check team health** → Active slots, pending reviews, overdue items
3. **Assign new missions** → Who's available? Who needs work?
4. **Review quality trends** → Analytics dashboard
5. **Build/publish** → When missions are ready
6. **Manage buddy pairs** → Rotate quarterly

---

## Your Daily Workflow

### Morning (10 min)
- War Room → Check team stats
- Activity Feed → See what happened overnight
- Reviews pending → Check if any are overdue
- Assign new slots if needed

### Midday
- Monitor import activity
- Check quality scores
- Handle buddy overloads

### End of Day
- Review analytics
- Plan tomorrow's assignments
- Check mission progress

---

## Your Boards

### War Room
Team health at a glance:
- Active slots vs total capacity
- Questions written/approved this week
- Pending reviews
- Average quality score

### Mission Tree
Visual progress of all missions in your language. Click to see:
- Which topics are published
- Which are in review
- Which aren't started
- Who's working on what

### Analytics
Individual curator stats:
- Questions written/approved
- Quality scores and trends
- Review turnaround time
- Workload distribution

### Slot Assignment
Assign curators to missions:
- Select mission + topic
- Assign 1+ curators (multi-curator support)
- Choose work mode: parallel, collaborative, mentoring
- Auto-assign reviewer

### Build Pipeline
Track missions through build process:
- All questions approved? → Ready to build
- Click Build → mission.json generated
- Validation passes? → Ready to publish
- Click Publish → Live on YuvaHive

### Schema
Edit the question schema:
- Add/remove required fields
- Set constraints (min length, test cases, etc.)
- Changes take effect immediately for all importers

---

## Assigning Missions

### Single Curator
1. Go to Slot Assignment
2. Select mission + topic
3. Select curator
4. Click Assign

### Multi-Curator
1. Select mission + topic
2. Select 2+ curators
3. Choose work mode:
   - **Parallel** — Each writes different questions
   - **Collaborative** — Both work on same questions
   - **Mentoring** — Senior guides newcomer
4. Click Assign

### Auto-Reviewer Assignment
System automatically assigns reviewer:
1. First tries buddy pair
2. If buddy overloaded → least-loaded same language
3. If no one available → notifies you

---

## Managing Reviewers

### Buddy System
- Pairs auto-assigned on signup
- Rotate quarterly (click "Rotate Buddies")
- Can manually override any assignment

### Overload Protection
- BUDDY_CEILING config (default: 7)
- If reviewer queue > ceiling → auto-reassign
- You get notified of reassignment

### Manual Override
- Go to Reviews → Reassign
- Select new reviewer
- Both old and new reviewer notified

---

## Building Missions

1. Go to Build Pipeline
2. Find mission with all questions approved
3. Click **Build**
4. System runs build_mission.py
5. If validation passes → **Publish** button enabled
6. Click **Publish**
7. Mission live on YuvaHive
8. Curators notified: "Your questions are live!"

---

## Analytics Dashboard

### Individual View
For each curator:
- Questions written/approved
- Quality score and trend
- Review turnaround time
- Current streak
- Buddy pair performance

### Team View
- Total questions by status
- Quality distribution
- Language breakdown
- Workload per person
- Overdue reviews

### Mission Progress
- Each mission's completion percentage
- Questions per topic
- Quality scores per mission

---

## RBAC — What You Can and Can't Do

| Can Do | Can't Do |
|--------|----------|
| Assign missions | Manage users |
| Override buddy assignments | Edit system settings |
| Build/publish missions | — |
| View all analytics | — |
| Edit schema | — |
| Promote curators | — |
| Rotate buddy pairs | — |

---

## Tips

- **Check analytics daily** — Catch quality drops early
- **Don't overload anyone** — Watch the workload view
- **Rotate buddies quarterly** — Fresh perspectives
- **Use multi-curator** — For tight deadlines
- **Build early** — Don't wait for perfection

---

*HiveDesk Lead Playbook — July 2026*
