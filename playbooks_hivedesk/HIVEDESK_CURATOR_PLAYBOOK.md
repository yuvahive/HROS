# HiveDesk Curator Playbook

> **Role:** Curator
> **Access Level:** Base Contributor (18 boards, 36 permissions)
> **Last Updated:** June 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Board-by-Board Deep Dive](#2-board-by-board-deep-dive)
3. [Keyboard Shortcuts](#3-keyboard-shortcuts)
4. [Your First Week](#4-your-first-week)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Getting Started

### Login

1. Navigate to the HiveDesk application URL
2. Enter your email and password
3. You'll land on the **War Room** dashboard

### Your Access Overview

As a Curator, you have access to **18 boards**:

| Section | Your Access |
|---------|-------------|
| **Core** | War Room, My Queue, Standup, Bounties, Questions, Pipeline (read-only), Sprints (read-only), Reviews, Team, Check-Ins, Work Logs |
| **More** | Skills, Kudos, Goals, Achievements, Wrapped |

### What You Can Do

| Feature | Your Access |
|---------|-------------|
| Create questions | Own questions only |
| Submit for review | Yes |
| Publish approved questions | Yes |
| Create reviews | Yes |
| Submit scores | Yes |
| View sprint board | Read-only |
| Create work logs | Own only |
| Submit check-ins | Own only |
| View team roster | Read-only |

### What You Cannot Do

- Edit or delete others' questions
- Approve or reject questions
- Assign reviewers
- Create or edit sprints
- View all team work logs
- Import/export questions
- Manage users
- Change settings
- View audit log

---

## 2. Board-by-Board Deep Dive

---

### CORE — Daily Operations

---

#### War Room (Dashboard)

**What it is:**
Your command center. The first screen you see after login. Shows real-time metrics, weekly target progress, and what needs attention.

**Why it exists:**
Gives you a quick overview of the team's health and your own progress. Instead of checking multiple boards, you see everything here.

**When to use it:**
- Every morning when you start work
- After returning from a break
- When you need a quick status check

**What you see:**
- **Metric Cards** — Team members, total questions, published, average quality
- **Weekly Target Progress** — Your personal progress toward weekly goals
- **Question Pipeline** — How many questions are in each stage
- **Needs Attention** — Items requiring action
- **Recent Questions** — Latest submissions
- **Team Pulse** — Who's online, energy levels
- **Activity Feed** — Recent actions
- **Sprint Overview** — Current sprint status

**What good looks like:**
- You open HiveDesk, glance at the dashboard, and know what to work on
- Your weekly target progress is on track
- No questions you created are stuck

**Best practices:**
- Check it first thing every morning
- Use Quick Actions for common tasks
- Don't ignore "Needs Attention" items
- Track your weekly target progress

---

#### My Queue

**What it is:**
Your personal kanban board: Assigned to Me, Needs Revision, In Review, My Reviews, All Created. This is YOUR work inbox.

**Why it exists:**
Shows you exactly what's on your plate. Instead of searching through the full question bank, you see only questions that need YOUR attention.

**When to use it:**
- First thing every morning (check what's assigned to you)
- When you finish a task (drag to next column)
- When planning your day

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
- "In Review" items don't sit for more than 2 days

**Best practices:**
- Check it daily
- Address "Needs Revision" items first (they're unblocking others)
- Keep "In Review" items moving — follow up if stuck
- Use it to plan your day
- Don't let your queue grow too large

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

**Posting your standup:**
1. Click **"+ New Standup"**
2. Fill in:
   - **Yesterday** — What you accomplished yesterday
   - **Today** — What you're working on today
   - **Blockers** — Anything preventing your progress
3. Click **Save**

**What good looks like:**
- You post a standup every morning
- Your standup is specific and detailed
- Blockers are flagged immediately
- You check team standups to understand what others are doing

**Status guide:**

| What to Post | Example |
|-------------|---------|
| **Yesterday** | "Created 3 DSA questions on binary trees, reviewed 2 questions" |
| **Today** | "Working on 2 full-stack questions on React hooks" |
| **Blockers** | "Waiting for review on HDQ-042" or "None" |

**Best practices:**
- Post your standup every morning — it's your commitment to the team
- Be specific ("created 3 DSA questions" not "worked on questions")
- Flag blockers immediately — don't wait
- Check team standups to identify collaboration opportunities
- Don't skip days — consistency builds trust

---

#### Question Bounties

**What it is:**
Bounty board for high-value questions. Bonus point pools. First-come-first-served.

**Why it exists:**
Incentivizes work on high-priority or difficult questions.

**When to use it:**
- When you want to earn extra points
- When you're looking for a challenge
- When you want to help with urgent questions

**What you see:**
- **Active Bounties** — Questions with bonus points available
- **Claimed** — Bounties you've taken
- **Completed** — Finished bounties

**What good looks like:**
- You claim bounties that match your skills
- You complete claimed bounties on time
- The bounty system helps the team meet urgent needs

**Best practices:**
- Only claim bounties you can complete
- Don't claim too many at once
- Complete claimed bounties before taking new ones
- Use bounties to stretch your skills

---

#### Question Bank

**What it is:**
The full question management board. 6-column kanban: Draft → In Review → Needs Revision → Approved → Published → Rejected.

**Why it exists:**
This is where you create and manage your questions. Every question flows through these stages.

**When to use it:**
- When creating new questions
- When checking the status of your questions
- When viewing the full question bank

**What you see:**
- **Draft** — Your questions being written
- **In Review** — Submitted for review
- **Needs Revision** — Reviewer requested changes
- **Approved** — Ready to publish
- **Published** — Live and published
- **Rejected** — Not published

**As a Curator, you specifically can:**
- Create new questions
- Edit your own questions
- Submit your questions for review
- Publish approved questions
- View all questions (read-only for others' questions)

**Creating a Question:**
1. Click **"+ New Question"**
2. Fill in:
   - **Title** (required) — Clear, descriptive name
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
   - **Notes** — Additional context
3. Click **Save**

**Submitting for Review:**
1. Open your question card
2. Click **"Submit for Review"**
3. Question moves to "In Review" column
4. A reviewer will be assigned

**What happens after submission:**
1. A reviewer examines your question
2. They score it on 5 dimensions (accuracy, completeness, clarity, difficulty, originality)
3. You receive feedback and a quality score
4. If approved → moves to "Approved" (you can publish)
5. If needs revision → moves to "Needs Revision" (you make changes and resubmit)

**Quality Score Formula:**
```
Quality = (Accuracy × 0.30) + (Completeness × 0.25) + (Clarity × 0.15) + (Difficulty Calibration × 0.20) + (Originality × 0.10)
```

**Minimum quality score to pass: 4.0**

**What good looks like:**
- Questions are well-structured with clear problem statements
- Test cases are comprehensive
- Solutions are correct and complete
- Difficulty levels are accurate
- Quality scores are consistently above 4.0

**Best practices:**
- Write clear, unambiguous problem statements
- Include comprehensive test cases (edge cases matter)
- Provide working solutions (not pseudocode)
- Set accurate difficulty levels
- Add helpful hints
- Use relevant tags for searchability
- Review your question before submitting
- Address review feedback promptly

---

#### Question Pipeline

**What it is:**
Visual kanban view of the question workflow.

**Why it exists:**
Strategic view of pipeline health. Shows volume at each stage.

**When to use it:**
- When you want to see the big picture
- When you're curious about overall pipeline health

**What you can do:**
- View the pipeline (read-only)
- See how questions flow through stages

---

#### Reviews

**What it is:**
Review management board. 3-column kanban: Pending Review → In Progress → Completed.

**Why it exists:**
Quality control. You review other people's questions and they review yours.

**When to use it:**
- When you're assigned a review
- When checking review status
- When viewing your review history

**As a Curator, you specifically can:**
- View reviews assigned to you
- Conduct reviews
- Submit scores and feedback
- View your review history

**Conducting a Review:**
1. Open a question from the "Pending Review" column
2. Click **"Start Review"**
3. Read the question thoroughly
4. Score on 5 dimensions:
   - **Accuracy** (1-5) — Is the question technically correct?
   - **Completeness** (1-5) — Are all components present?
   - **Clarity** (1-5) — Is the problem statement clear?
   - **Difficulty Calibration** (1-5) — Is the difficulty level accurate?
   - **Originality** (1-5) — Is the question unique?
5. Add feedback and improvement notes
6. Click **"Submit Review"**

**Review Scoring Guide:**

| Score | What It Means |
|-------|---------------|
| **5** | Exceptional — no issues |
| **4** | Good — minor improvements possible |
| **3** | Adequate — some issues to address |
| **2** | Below average — significant issues |
| **1** | Poor — major problems |

**What good looks like:**
- Reviews are thorough (all 5 dimensions scored)
- Feedback is specific and actionable
- You explain why you gave each score
- Improvement notes help the creator grow

**Best practices:**
- Review questions thoroughly — don't rush
- Score honestly — don't inflate scores
- Provide specific feedback ("The test cases miss edge case X" not "needs improvement")
- Be constructive — help the creator improve
- Complete reviews within 24 hours
- Don't review your own questions

---

#### Sprint Board

**What it is:**
Sprint lifecycle manager. 5-column kanban: Planning → Active → Review → Publish → Done.

**Why it exists:**
Shows you what the team is working on this sprint.

**When to use it:**
- When you want to see sprint progress
- When checking your sprint assignments

**What you can do:**
- View the sprint board (read-only)
- See sprint assignments
- Track sprint progress

---

#### Team Roster

**What it is:**
Grid view of all team members with avatar, role badge, domain, weekly target.

**Why it exists:**
Quick overview of the team — who's who and what they do.

**When to use it:**
- When you need to find someone
- When you want to learn about team members
- When looking for a buddy or mentor

**What you see:**
- **Avatar** — Photo or initials
- **Name** — Team member name
- **Role Badge** — Curator / Lead / Admin
- **Domain** — DSA / Full-Stack
- **Weekly Target** — Questions per week

**Best practices:**
- Click on team members to learn about them
- Use the roster to find domain experts
- Reach out to Leads if you need help

---

#### Work Logs

**What it is:**
Time tracking board. Log date, hours, task name, task type.

**Why it exists:**
Tracks where your time is being spent.

**When to use it:**
- Daily: Log your time
- When reviewing your own time allocation

**As a Curator, you specifically can:**
- Create your own work logs
- View your own work log history
- Edit your own entries

**Creating a Work Log:**
1. Click **"+ Add Log"**
2. Fill in:
   - **Date**
   - **Hours Worked**
   - **Task Name** — What you worked on
   - **Task Type** — Question Creation / Review / Other
   - **Notes** — Additional context
3. Click **Save**

**Best practices:**
- Log time daily — don't let it pile up
- Be honest about hours worked
- Use task types consistently
- Review your logs weekly to understand time allocation

---

#### Check-Ins

**What it is:**
Weekly check-in form: accomplishments, plans, blockers, mood.

**Why it exists:**
Structured weekly reflection. Forces you to think about what you accomplished, what's next, and what's blocking you.

**When to use it:**
- Weekly: Submit your check-in
- When reflecting on your progress

**Submitting a Check-In:**
1. Click **"+ New Check-In"**
2. Fill in:
   - **Accomplishments** — What you achieved this week
   - **Plans** — What you're working on next week
   - **Blockers** — What's preventing your progress
   - **Mood** — How you're feeling (1-5 or emoji)
3. Click **Save**

**What good looks like:**
- Check-in is submitted weekly (don't skip)
- Accomplishments are specific and detailed
- Plans are realistic and actionable
- Blockers are honest and specific
- Mood reflects your actual state

**Best practices:**
- Submit your check-in every week — don't skip
- Be honest about blockers — they can't be helped if they're hidden
- Review your previous check-in before writing the new one
- Use check-ins as talking points for 1:1s

---

### MORE — Culture & Growth

---

#### Skills Tracker

**What it is:**
Self-tag skills at 4 levels (beginner/intermediate/advanced/expert). Team skills matrix. Skill gap detection.

**Why it exists:**
Maps the team's capabilities. Helps identify who's strong in what area and where skill gaps exist.

**When to use it:**
- When you learn a new skill (tag it)
- When you want to see what others know
- When looking for help from experts

**Updating your skills:**
1. Click **"+ Add Skill"**
2. Fill in:
   - **Skill** — What you know (e.g., "Binary Trees", "React Hooks")
   - **Level** — Beginner / Intermediate / Advanced / Expert
3. Click **Save**

**Skill Levels:**

| Level | What It Means |
|-------|---------------|
| **Beginner** | Learning the basics |
| **Intermediate** | Can work independently |
| **Advanced** | Can teach others |
| **Expert** | Can architect and lead |

**Best practices:**
- Update skills regularly as you learn
- Be honest about your level
- Use skills to find help from experts
- Track your growth over time

---

#### Kudos Board

**What it is:**
Send kudos to teammates with messages. Like/unlike. Chronological feed.

**Why it exists:**
Recognition matters. Public recognition motivates people and reinforces good behavior.

**When to use it:**
- When a teammate does great work
- When someone helps you
- When you want to celebrate a win

**Sending Kudos:**
1. Click **"+ Send Kudos"**
2. Fill in:
   - **To** — Who you're recognizing
   - **Message** — What they did and why it matters
3. Click **Send**

**What good looks like:**
- Kudos are specific and genuine
- You recognize both big and small wins
- You like others' kudos to amplify recognition

**Best practices:**
- Be specific ("Thanks for the thorough code review on HDQ-042") not generic ("Good job")
- Kudos publicly — it motivates the whole team
- Don't wait for big wins — recognize small ones too
- Like others' kudos to show support

---

#### Goals & OKRs

**What it is:**
Personal weekly goals with progress tracking (0-100%).

**Why it exists:**
Creates personal accountability. When you set a goal publicly, you're more likely to achieve it.

**When to use it:**
- Weekly: Set your goals
- Daily: Update progress
- End of week: Review what you achieved

**Setting Goals:**
1. Click **"+ New Goal"**
2. Fill in:
   - **Title** — What you want to achieve
   - **Description** — Details
   - **Target Date** — When you want to complete it
3. Click **Save**
4. Update **Progress** (0-100%) as you work

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
- Celebrate when you achieve goals

---

#### Streaks & Badges

**What it is:**
Auto-earned achievement badges and contribution streak tracking.

**Why it exists:**
Gamification drives engagement. Streaks create habits. Badges recognize milestones.

**When to use it:**
- Daily: Maintain your streak
- When you earn a badge: Celebrate
- When reviewing your achievements

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
- You're growing your achievement collection

**Best practices:**
- Log contributions daily to maintain streaks
- Celebrate badge wins
- Use badges to track your growth
- Don't game the system — badges should reflect real work

---

#### Weekly Wrapped

**What it is:**
Spotify Wrapped-style weekly summary: questions published, reviews completed, kudos, standup streak.

**Why it exists:**
Makes your weekly contribution visible and fun.

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

## 3. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/ Cmd + K` | Global Search |
| `Ctrl/ Cmd + /` | Command Palette |
| `1-9` | Quick board switch |
| `Escape` | Close panels/modals |

---

## 4. Your First Week

### Day 1: Setup
- [ ] Login and explore the dashboard
- [ ] Complete your profile
- [ ] Add your skills to the Skills Tracker
- [ ] Read this playbook
- [ ] Meet your buddy (if assigned)

### Day 2-3: Learn
- [ ] Explore the Question Bank
- [ ] Read existing questions to understand the format
- [ ] Understand the review process
- [ ] Post your first standup
- [ ] Submit your first check-in

### Day 4-5: Create
- [ ] Create your first question (start with a draft)
- [ ] Submit it for review
- [ ] Review a question if assigned
- [ ] Log your work hours
- [ ] Set your weekly goals

### End of Week 1
- [ ] Review your Weekly Wrapped
- [ ] Check your Streaks & Badges
- [ ] Reflect on what you learned
- [ ] Plan next week's goals

---

## 5. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't see a board | Your role has limited access; this is normal |
| Can't approve a question | Only Leads+ can approve; submit for review instead |
| Can't edit others' questions | Curators can only edit their own questions |
| Question rejected | Read the feedback, improve, and resubmit |
| Data not updating | Check internet connection; data syncs every 30 seconds |

### Frequently Asked Questions

**Q: Can I see who's reviewing my question?**
A: Yes, the reviewer's name appears on the question card.

**Q: Can I request a specific reviewer?**
A: No, reviewers are assigned by Leads. Contact your Lead if needed.

**Q: How long does review take?**
A: Reviews should be completed within 24-48 hours. If stuck, check with your Lead.

**Q: Can I publish my own question?**
A: Only after it's approved by a reviewer. Click "Publish" on approved questions.

**Q: How do I improve my quality score?**
A: Read the review feedback carefully. Focus on the dimensions with low scores. Ask your buddy for help.

**Q: Can I view other team members' work?**
A: You can view questions and reviews, but only edit your own.

**Q: What if I'm blocked on something?**
A: Post it in your standup. Flag it in your check-in. Reach out to your buddy or Lead.

**Q: How do I earn badges?**
A: Badges are earned automatically based on your contributions. Check the Streaks & Badges board for requirements.

---

## Quick Reference Card

| You Want To... | Go To |
|----------------|-------|
| See your tasks | My Queue |
| Create a question | Question Bank > + New Question |
| Submit for review | Open question > Submit for Review |
| Review a question | Reviews > Pending Review |
| Post standup | Standup > + New Standup |
| Log work | Work Logs > + Add Log |
| Submit check-in | Check-Ins > + New Check-In |
| Set goals | Goals > + New Goal |
| Send kudos | Kudos > + Send Kudos |
| Update skills | Skills > + Add Skill |
| Search anything | Ctrl+K |

---

## Tips for Success

1. **Post standups daily** — Consistency builds trust
2. **Log work daily** — Don't let it pile up
3. **Submit check-ins weekly** — Reflect on your progress
4. **Create quality questions** — Focus on clarity and completeness
5. **Review thoroughly** — Help others improve
6. **Set goals** — Track your growth
7. **Ask for help** — Don't stay blocked
8. **Celebrate wins** — Send and receive kudos
9. **Maintain streaks** — Build good habits
10. **Learn continuously** — Update your skills

---

*This playbook is maintained by the HiveDesk team. For questions, contact your Lead or system administrator.*
