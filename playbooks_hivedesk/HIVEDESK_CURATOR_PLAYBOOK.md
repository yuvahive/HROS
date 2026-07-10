# HiveDesk Curator Playbook

> **Role:** Curator / Newcomer / Senior
> **Access:** Write questions, submit for review, see own stats
> **Last Updated:** July 2026

---

## First Time Setup

### Your Environment
- HiveDesk is live at the URL your Lead/Admin gave you
- Login with credentials from Admin
- You see the War Room dashboard

### Initial Setup Checklist
1. ✅ Login works
2. ✅ You can see War Room, Question Bank, Profile
3. ✅ Check your Profile → Verify role and domain
4. ✅ Check your buddy → See who's assigned
5. ✅ Review Mission Tree → Know what to work on

---

## What Do I Do Monday Morning?

1. **Open HiveDesk** → Land on **War Room**
2. **Check your assignments** → What's in progress?
3. **Check buddy queue** → Any questions pending your review?
4. **Import new work** → Zip your HiveLab folder, drag into Import Bridge
5. **Write or review** → See your daily workflow below

---

## Your Daily Workflow

### Writing Questions
1. **Write in HiveLab** — Create question, solution, tests
2. **Zip the folder** — Right-click folder → Send to → Compressed folder
3. **Import into HiveDesk** — Drag zip into Import Bridge
4. **Preview** — Verify all 5 questions are parsed correctly
5. **Submit** — System auto-assigns reviewer from buddy pair

### Reviewing Questions
1. **Check Notifications** — Bell icon shows pending reviews
2. **Open question** — Click to see question.md, Solution.py, tests.json
3. **Test in HiveLab** — Download zip, run locally, verify
4. **Approve/Request Changes** — Add comments, submit decision
5. **Next question** — Repeat until queue empty

### After Approval
1. **Monitor progress** — See questions move to "Approved"
2. **Check Profile** — Your quality score updates
3. **Streak** — Keep it going!

---

## Your Boards

### War Room
Quick overview:
- Your active slots
- Questions written/approved this week
- Your quality score
- Buddy pair status
- Notifications

### Question Bank
All questions you can work on:
- Filter by language, domain, status
- See which are open for editing
- Track your submissions

### Import Bridge
Drag-and-drop zip upload:
1. Zip your HiveLab question folder
2. Drag into Import Bridge
3. System parses all 5 questions
4. Preview shows parsed data
5. Click Submit
6. System validates against live schema
7. If valid → Creates Question Bank entry
8. If invalid → Shows errors, fix and retry

### Mission Tree
See your language's curriculum progress:
- Which missions/topics are published
- Which are in progress
- Your contribution to each
- Quality scores per mission

### Profile
Your stats and achievements:
- Questions written/approved
- Quality score and trend
- Level progression (Newcomer → Contributor → Reviewer → Senior → Master)
- Current streak
- Buddy pair info
- Recent activity

### Leaderboard
See how you rank:
- Quality-ranked (not just quantity)
- Your position
- Team comparison

### Streak Tracker
Your contribution streaks:
- Current streak length
- Team average comparison
- Streak history

---

## Importing Questions

### Step-by-Step
1. **In HiveLab**, write your questions:
   ```
   YH-PY-BASC/
   └── C1_basics/
       ├── Q1_hello_world/
       │   ├── question.md
       │   ├── Solution.py
       │   └── tests.json
       ├── Q2_variables/
       │   └── ...
       └── Q3/
           └── ...
   ```

2. **Zip the folder**: Right-click `C1_basics` → Send to → Compressed folder

3. **In HiveDesk**, go to Import Bridge

4. **Drag zip** into the drop zone

5. **Preview**: System shows parsed questions with all fields

6. **Verify**: Check question text, constraints, test cases look correct

7. **Submit**: Click "Submit for Review"

8. **Done**: System validates against schema, assigns reviewer, creates entry

### If Validation Fails
- Check what's missing (question.md? tests.json? required field?)
- Fix in HiveLab
- Re-zip and re-import

---

## Reviewing Questions

### From Buddy
1. Check Notifications → New review assigned
2. Click to open question
3. Download zip from Import Bridge
4. Extract and run locally:
   ```bash
   cd YH-PY-BASC/C1_basics/Q1_hello_world
   python Solution.py  # Test it runs
   python -m pytest tests.json  # Verify tests pass
   ```
5. Read question.md for clarity
6. Approve or Request Changes
7. Add comments explaining decision

### From Anyone (Load-Based)
- If buddy queue > BUDDY_CEILING
- System reassigns to lightest queue same language
- Same review process

---

## Quality Metrics

### What Gets Measured
- **Question clarity** (readability score)
- **Test coverage** (edge cases, happy path)
- **Solution correctness** (passes all tests)
- **Documentation** (question.md completeness)
- **Difficulty calibration** (matches intended tier)

### Quality Score Calculation
```
Quality = (
  clarity_score * 0.25 +
  test_coverage * 0.25 +
  solution_correctness * 0.20 +
  documentation * 0.15 +
  difficulty_calibration * 0.15
)
```

### Level Progression
| Level | Requirements |
|-------|-------------|
| Newcomer | First approved question → Auto-promoted to Curator |
| Curator | Default after promotion |
| Reviewer | 10+ approved questions, 4.0+ quality |
| Senior | 25+ approved, 4.2+ quality, 6+ months |
| Master | 50+ approved, 4.5+ quality, 12+ months |

---

## RBAC — What You Can and Can't Do

| Can Do | Can't Do |
|--------|----------|
| Write questions | Assign missions |
| Submit for review | Publish missions |
| Review assigned questions | Build missions |
| See own analytics | See others' analytics |
| See team leaderboard | Edit schema |
| Import zip files | Manage users |
| See mission tree | Change settings |

---

## Tips

- **Write consistently** — 5 questions per week minimum
- **Test locally first** — Don't submit broken code
- **Read the schema** — Know what's required before importing
- **Review promptly** — Don't let queue grow
- **Check notifications daily** — Stay on top of reviews
- **Keep streaks** — Quality over quantity

---

*HiveDesk Curator Playbook — July 2026*
