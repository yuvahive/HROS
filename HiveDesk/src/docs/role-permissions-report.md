# HiveDesk Role-Based Access Control Report

> **Version:** 2.0  
> **Last Updated:** June 2026  
> **System:** HiveDesk War Room Management

---

## Role Hierarchy

| Role    | Level | Description                             |
|---------|-------|-----------------------------------------|
| Curator | 1     | Base contributor — creates and submits content |
| Lead    | 2     | Team manager — oversees quality and workflows |
| Admin   | 3     | System operator — full control over all features |

**Inheritance:** Higher-level roles inherit **all** permissions of lower-level roles.  
Example: An Admin has every permission a Lead and Curator has, plus admin-exclusive permissions.

### Permission Enforcement Layers

| Layer | Mechanism | Description |
|-------|-----------|-------------|
| 1 | Sidebar filtering | Items with `minRole` above the user's level are hidden from navigation entirely |
| 2 | Component gates | `PermissionGate`, `RoleGate`, or inline `if (!isAdmin)` guards block access even if navigated directly via URL |
| 3 | Server-side | GAS backend validates user role before executing write operations |

---

## Section 1: Curator

Curators are the base-level contributors. They can access **18 of 25** sidebar items and have full CRUD on most content they own.

### Visible Boards & Capabilities

| Board / Page       | Access | Capabilities |
|--------------------|--------|--------------|
| **War Room**       | ✅ Full | View all metric cards (Active Questions, In Review, Published, Avg Quality, Completion Rate, Active Sprints). View Recent Questions list. View Quick Stats (completion rate, avg quality, total questions). View TeamPulse section (online members, energy level). |
| **My Queue**       | ✅ Full | View own assigned/created/in-review items across three columns (To Do, In Progress, Done). Drag cards between columns to update status. Filter by priority, difficulty, status. View question details inline. |
| **Question Bank**  | ✅ Full | View all questions across all statuses. **Create** new questions with title, domain, topic, difficulty, test cases, hints, tags, and notes. Drag cards between columns (Draft → In Review → Needs Revision → Published). View question details, comments, and metadata. |
| **Question Pipeline** | ✅ View-only | View pipeline kanban board. **Create** questions. ❌ **Cannot drag** cards between columns (leads/admins only). View question distribution by domain and difficulty. |
| **Reviews**        | ✅ Full | View all reviews in the queue. Drag cards between columns (Pending → In Progress → Completed). Start reviews on assigned questions. Submit review scores and feedback. |
| **Review History** | ✅ Full | View complete review history with scores, reviewer names, dates, and feedback. Filter by reviewer, score range, and date. |
| **Sprints**        | ✅ View-only | View sprint board with all sprints and their statuses. View sprint details (name, dates, target, lead, members). ❌ Cannot create, edit, assign, start, end, or delete sprints. |
| **Bounties**       | ✅ Full | View bounty questions with point values. Claim available bounties (first-come-first-served). View bounty status (Open, Claimed, Completed). |
| **Standup**        | ✅ Full | Submit daily async standup (Today, Blockers, Mood). View team standups for the current day. View historical standup entries. |
| **Skills**         | ✅ Full | Self-tag skills (beginner, intermediate, advanced, expert). View team skills matrix. View skill gap detection (team-wide analysis). Add/remove skill endorsements for self. |
| **Kudos**          | ✅ Full | Send kudos to teammates with message and category. Receive kudos. Like/unlike kudos. View kudos feed sorted by date. |
| **Goals**          | ✅ Full | Create personal weekly OKRs (Objectives & Key Results). Track progress with percentage completion. Mark goals as completed. View goal history. |
| **Achievements**   | ✅ View-only | View auto-earned badges (Publish 5, Review 10, Sprint Complete, Kudos Given, Active 30 Days). View streak stats (day streak, total published, reviews done, active days). Badges unlock automatically based on activity. |
| **Weekly Wrapped** | ✅ Full | View own weekly stats (questions published, reviews completed, kudos given/received, standup streak). Browse previous weeks. View achievement highlights. |
| **Work Logs**      | ✅ Own only | CRUD own work logs (date, hours, description, category). ❌ Cannot view other team members' logs. Track time against projects. |
| **Check-Ins**      | ✅ Own only | Submit own weekly check-in (accomplishments, plans, blockers, mood). ❌ Cannot view all team check-ins. View own check-in history. |
| **Team Roster**    | ✅ View-only | View team roster with names, roles, status (active/inactive), join dates. View individual member profiles. ❌ Cannot add, edit, or delete members. |
| **Buddy Pairs**    | ✅ View-only | View existing buddy pairs. ❌ Cannot create, edit, or delete buddy pairs. View pair activity and check-in status. |

### Hidden / Restricted Pages

| Board / Page  | Sidebar? | Direct URL Access | Behavior |
|---------------|----------|-------------------|----------|
| Workload      | ❌ Hidden | Page loads | Data filters out admin-level users |
| Analytics     | ❌ Hidden | Page loads | Data filters out admin-level users |
| Mood Trends   | ❌ Hidden | Page loads | Can view aggregate team trends |
| Retro         | ❌ Hidden | ❌ Blocked | Shows "Access Restricted" lock screen |
| Users         | ❌ Hidden | ❌ Blocked | Shows "Administrator Only" lock screen |
| Import        | ❌ Hidden | ❌ Blocked | Shows "Admin or Lead Only" lock screen |
| Export        | ❌ Hidden | ❌ Blocked | Shows "Admin or Lead Only" lock screen |
| Audit Log     | ❌ Hidden | ❌ Blocked | Shows "Administrator Only" lock screen |
| Settings      | ❌ Hidden | ❌ Blocked | Shows "Admin Only" lock screen |

### Fine-Grained Permissions

| Permission | Curator | Description |
|------------|---------|-------------|
| `questions_create` | ✅ | Create new questions with metadata (title, domain, topic, difficulty, test cases, hints, tags, notes) |
| `questions_read` | ✅ | View all questions regardless of status or creator |
| `questions_update_own` | ✅ | Edit questions they created (title, domain, topic, difficulty, test cases, hints, tags, notes) |
| `questions_update_any` | ❌ | Cannot edit questions created by others |
| `questions_delete` | ❌ | Cannot delete any questions |
| `questions_submit_for_review` | ✅ | Move questions from Draft to In Review status |
| `questions_approve` | ❌ | Cannot approve questions for publishing |
| `questions_reject` | ❌ | Cannot reject questions (send back to author) |
| `questions_publish` | ✅ | Can publish approved questions |
| `questions_import` | ❌ | Cannot batch import questions via JSON/Excel |
| `questions_export` | ❌ | Cannot export questions to JSON/Excel |
| `reviews_create` | ✅ | Create reviews on assigned questions |
| `reviews_read` | ✅ | View all reviews in the system |
| `reviews_read_others` | ❌ | Cannot view reviews written by other curators |
| `reviews_score` | ✅ | Submit scores (1-10) with written feedback |
| `reviews_approve` | ❌ | Cannot approve reviews |
| `sprints_read` | ✅ | View sprint board and sprint details |
| `sprints_create` | ❌ | Cannot create new sprints |
| `team_read` | ✅ | View team roster and member profiles |
| `worklogs_create` | ✅ | Create work log entries (date, hours, description, category) |
| `worklogs_read_own` | ✅ | View own work log entries only |
| `worklogs_read_all` | ❌ | Cannot view other team members' logs |
| `checkins_create` | ✅ | Submit weekly check-ins |
| `checkins_read_own` | ✅ | View own check-in history only |
| `checkins_read_all` | ❌ | Cannot view team check-ins |
| `dashboard_my_stats` | ✅ | View personal metrics on War Room dashboard |

---

## Section 2: Lead

Leads are team managers. They inherit **all 36 Curator permissions** plus access to team-level oversight and workflow management tools.

### Additional Boards Visible (beyond Curator)

| Board / Page    | Access | Capabilities |
|-----------------|--------|--------------|
| **Workload**    | ✅ Full | View workload distribution across the team. See capacity allocation per member. View task count and hours per person. Admin users are filtered from workload data. |
| **Analytics**   | ✅ Full | View team analytics dashboard. See performance metrics, leaderboards, and trends. View question quality trends over time. Admin users are filtered from analytics data. |
| **Mood Trends** | ✅ Full | View aggregate team mood/energy trends. See weekly mood chart with historical data. View check-in sentiment analysis. Identify team wellness patterns. |
| **Retro**       | ✅ Full | View and participate in sprint retrospectives. Add retro items (What went well, What to improve, Action items). Vote on retro items. View retro history for completed sprints. |
| **Import**      | ✅ Full | Batch import questions via **CSV**, **JSON**, or **Excel (.xlsx)**. Upload questions with full metadata including test cases, solutions, and hints. Download import templates. Preview and validate before importing. |
| **Export**      | ✅ Full | Export questions to **CSV** or **JSON** format. Export filtered sets (by status, domain, difficulty). Export with or without solutions. Download as file. |

### Elevated Capabilities on Shared Boards

| Board / Page       | Additional Capabilities (beyond Curator) |
|--------------------|------------------------------------------|
| **War Room**       | ✅ View **Needs Attention** section (questions needing review/revision). ✅ View **Activity Feed** (recent actions by team). ✅ View **Sprint Overview** (active sprint progress). |
| **Question Bank**  | ✅ **Drag** cards between all columns (including cross-status moves). ✅ **Bulk actions** (approve, reject, publish, delete multiple). ✅ **Assign reviewers** to questions. |
| **Question Pipeline** | ✅ **Drag** cards between columns (curators cannot). ✅ Reorder questions within pipeline stages. |
| **Sprints**        | ✅ **Create** new sprints (name, dates, target questions, lead assignment). ✅ **Assign members** to sprints. ✅ **Start/end** sprints (change status). ❌ Cannot delete sprints. |
| **Team Roster**    | ❌ Still cannot add members (admin only). ✅ Can view detailed member stats. |
| **Buddy Pairs**    | ✅ **Create** new buddy pairs. ✅ **Edit** existing pairs (reassign buddies). ✅ **Delete** buddy pairs. |
| **Work Logs**      | ✅ **View all** team work logs (not just own). ✅ Filter by member, date range, category. |
| **Check-Ins**      | ✅ **View all** team check-ins. ✅ View check-in history for any member. ✅ See blocker resolution status. |
| **Member Form**    | ❌ Role dropdown is disabled (cannot assign admin role). Can edit member profiles but not elevate to admin. |

### Fine-Grained Permissions (additional to Curator)

| Permission | Lead | Description |
|------------|------|-------------|
| `questions_update_any` | ✅ | Edit any question regardless of creator |
| `questions_delete` | ✅ | Delete questions (with confirmation) |
| `questions_bulk_action` | ✅ | Perform bulk operations (approve, reject, publish, delete) on multiple questions |
| `questions_assign_reviewer` | ✅ | Assign specific reviewers to questions |
| `questions_approve` | ✅ | Approve questions for publishing |
| `questions_reject` | ✅ | Reject questions and send back to author with feedback |
| `questions_publish` | ✅ | Publish approved questions to the public bank |
| `questions_import` | ✅ | Batch import questions via CSV, JSON, or Excel |
| `questions_export` | ✅ | Export questions to CSV or JSON |
| `reviews_read_others` | ✅ | View reviews written by other team members |
| `reviews_approve` | ✅ | Approve completed reviews |
| `sprints_create` | ✅ | Create new sprints with configuration |
| `sprints_update` | ✅ | Edit sprint details (name, dates, target, members) |
| `sprints_assign_members` | ✅ | Assign team members to sprints |
| `sprints_start_end` | ✅ | Start active sprints and end completed ones |
| `team_view_workload` | ✅ | View team workload distribution and capacity |
| `team_manage_buddy_pairs` | ✅ | Create, edit, and delete buddy pairs |
| `worklogs_read_all` | ✅ | View work logs from all team members |
| `checkins_read_all` | ✅ | View check-ins from all team members |
| `dashboard_team_stats` | ✅ | View team-level statistics on War Room |
| `settings_read` | ✅ | View system settings (read-only) |

---

## Section 3: Admin

Admins are system operators. They inherit **all 52 Lead permissions** plus full system control, user management, and audit capabilities.

### Additional Boards Visible (beyond Lead)

| Board / Page   | Access | Capabilities |
|----------------|--------|--------------|
| **Users**      | ✅ Full | Full user management: create new users, edit profiles, assign any role (including admin), activate/deactivate accounts, delete users. View user activity stats. |
| **Import**     | ✅ Full | Same as Lead plus: import user data, import sprint configurations, import system settings. Override duplicate detection. |
| **Audit Log**  | ✅ Full | View complete system audit trail. See all user actions (create, update, delete, login, import, export). Filter by user, action type, date range, resource type. Export audit logs. |
| **Settings**   | ✅ Full | Read and update system configuration. Modify dashboard refresh interval, review thresholds, quality weights, role permissions, notification settings. Reset to defaults. |

### Elevated Capabilities on Shared Boards

| Board / Page   | Additional Capabilities (beyond Lead) |
|----------------|---------------------------------------|
| **Sprints**    | ✅ **Delete** sprints (with confirmation). ✅ **Drag** sprints between columns on the sprint board. |
| **Team Roster** | ✅ **Add** new team members. ✅ **Update** any member profile including role assignment. ✅ **Delete** (deactivate) team members. |
| **Member Form** | ✅ Role dropdown is **enabled**. Can assign any role including admin. Can set custom permissions. |
| **Import**     | ✅ Import **user accounts** (CSV/JSON). ✅ Import **sprint configurations**. ✅ **Override** duplicate detection (force re-import). |
| **Audit Log**  | ✅ **Export** audit logs. ✅ **Purge** old audit entries. ✅ View **system-level** events. |

### Fine-Grained Permissions (additional to Lead)

| Permission | Admin | Description |
|------------|-------|-------------|
| `sprints_delete` | ✅ | Delete sprints permanently (with confirmation) |
| `team_create` | ✅ | Create new team member accounts |
| `team_update` | ✅ | Update any member profile including role assignment |
| `team_delete` | ✅ | Deactivate/delete team member accounts |
| `settings_read` | ✅ | View all system settings |
| `settings_update` | ✅ | Modify system configuration values |
| `audit_read` | ✅ | View complete system audit trail |
| `audit_export` | ✅ | Export audit logs to CSV/JSON |
| `users_import` | ✅ | Import user accounts via CSV/JSON |
| `dashboard_admin_stats` | ✅ | View admin-level statistics on War Room |

---

## Full Permission Matrix

| Permission | Curator | Lead | Admin | Description |
|------------|:-------:|:----:|:-----:|-------------|
| `questions_create` | ✅ | ✅ | ✅ | Create new questions |
| `questions_read` | ✅ | ✅ | ✅ | View all questions |
| `questions_update_own` | ✅ | ✅ | ✅ | Edit own questions |
| `questions_update_any` | ❌ | ✅ | ✅ | Edit any question |
| `questions_delete` | ❌ | ✅ | ✅ | Delete questions |
| `questions_bulk_action` | ❌ | ✅ | ✅ | Bulk approve/reject/publish/delete |
| `questions_assign_reviewer` | ❌ | ✅ | ✅ | Assign reviewers to questions |
| `questions_submit_for_review` | ✅ | ✅ | ✅ | Submit questions for review |
| `questions_approve` | ❌ | ✅ | ✅ | Approve questions |
| `questions_reject` | ❌ | ✅ | ✅ | Reject questions with feedback |
| `questions_publish` | ❌ | ✅ | ✅ | Publish approved questions |
| `questions_import` | ❌ | ✅ | ✅ | Batch import (CSV/JSON/Excel) |
| `questions_export` | ❌ | ✅ | ✅ | Export to CSV/JSON |
| `reviews_create` | ✅ | ✅ | ✅ | Create reviews |
| `reviews_read` | ✅ | ✅ | ✅ | View all reviews |
| `reviews_read_others` | ❌ | ✅ | ✅ | View reviews by other curators |
| `reviews_score` | ✅ | ✅ | ✅ | Submit review scores |
| `reviews_approve` | ❌ | ✅ | ✅ | Approve completed reviews |
| `sprints_create` | ❌ | ✅ | ✅ | Create new sprints |
| `sprints_read` | ✅ | ✅ | ✅ | View sprint board |
| `sprints_update` | ❌ | ✅ | ✅ | Edit sprint details |
| `sprints_delete` | ❌ | ❌ | ✅ | Delete sprints |
| `sprints_assign_members` | ❌ | ✅ | ✅ | Assign members to sprints |
| `sprints_start_end` | ❌ | ✅ | ✅ | Start/end sprints |
| `team_read` | ✅ | ✅ | ✅ | View team roster |
| `team_create` | ❌ | ❌ | ✅ | Create team members |
| `team_update` | ❌ | ❌ | ✅ | Update team members |
| `team_delete` | ❌ | ❌ | ✅ | Delete team members |
| `team_view_workload` | ❌ | ✅ | ✅ | View workload distribution |
| `team_manage_buddy_pairs` | ❌ | ✅ | ✅ | Manage buddy pairs |
| `worklogs_create` | ✅ | ✅ | ✅ | Create work logs |
| `worklogs_read_own` | ✅ | ✅ | ✅ | View own work logs |
| `worklogs_read_all` | ❌ | ✅ | ✅ | View all work logs |
| `checkins_create` | ✅ | ✅ | ✅ | Submit check-ins |
| `checkins_read_own` | ✅ | ✅ | ✅ | View own check-ins |
| `checkins_read_all` | ❌ | ✅ | ✅ | View all check-ins |
| `settings_read` | ❌ | ✅ | ✅ | View system settings |
| `settings_update` | ❌ | ❌ | ✅ | Update system settings |
| `audit_read` | ❌ | ❌ | ✅ | View audit log |
| `audit_export` | ❌ | ❌ | ✅ | Export audit logs |
| `users_import` | ❌ | ❌ | ✅ | Import user accounts |
| `dashboard_my_stats` | ✅ | ✅ | ✅ | View personal stats |
| `dashboard_team_stats` | ❌ | ✅ | ✅ | View team stats |
| `dashboard_admin_stats` | ❌ | ❌ | ✅ | View admin stats |

---

## Sidebar Visibility by Role

| Sidebar Item    | minRole  | Curator | Lead | Admin |
|-----------------|----------|:-------:|:----:|:-----:|
| War Room        | curator  | ✅ | ✅ | ✅ |
| My Queue        | curator  | ✅ | ✅ | ✅ |
| Standup         | curator  | ✅ | ✅ | ✅ |
| Bounties        | curator  | ✅ | ✅ | ✅ |
| Questions       | curator  | ✅ | ✅ | ✅ |
| Pipeline        | curator  | ✅ | ✅ | ✅ |
| Sprints         | curator  | ✅ | ✅ | ✅ |
| Reviews         | curator  | ✅ | ✅ | ✅ |
| Team            | curator  | ✅ | ✅ | ✅ |
| Check-Ins       | curator  | ✅ | ✅ | ✅ |
| Work Logs       | curator  | ✅ | ✅ | ✅ |
| Skills          | curator  | ✅ | ✅ | ✅ |
| Kudos           | curator  | ✅ | ✅ | ✅ |
| Goals           | curator  | ✅ | ✅ | ✅ |
| Achievements    | curator  | ✅ | ✅ | ✅ |
| Wrapped         | curator  | ✅ | ✅ | ✅ |
| Workload        | lead     | ❌ | ✅ | ✅ |
| Analytics       | lead     | ❌ | ✅ | ✅ |
| Mood Trends     | lead     | ❌ | ✅ | ✅ |
| Retro           | lead     | ❌ | ✅ | ✅ |
| Import          | lead     | ❌ | ✅ | ✅ |
| Export          | lead     | ❌ | ✅ | ✅ |
| Users           | admin    | ❌ | ❌ | ✅ |
| Audit Log       | admin    | ❌ | ❌ | ✅ |
| Settings        | admin    | ❌ | ❌ | ✅ |

---

## Import/Export Feature Details

### Supported Formats

| Format | Import | Export | Notes |
|--------|:------:|:------:|-------|
| **CSV** | ✅ | ✅ | Comma-separated values. Header row required. |
| **JSON** | ✅ | ✅ | Array of question objects. Full metadata support. |
| **Excel (.xlsx)** | ✅ | ❌ | Microsoft Excel format. Requires `xlsx` library. |

### Import Capabilities

| Feature | Description |
|---------|-------------|
| **Question Metadata** | Title, domain, topic, difficulty, tags, notes |
| **Test Cases** | Array of test case objects (input, expected output, isHidden) |
| **Hints** | Array of hint strings |
| **Solutions** | Solution code with language and approach description |
| **Drag & Drop** | Drop zone for file upload with visual feedback |
| **Preview** | Preview parsed data before importing (shows title, domain, difficulty) |
| **Validation** | Required field validation (title, domain). Row-level error reporting. |
| **Template Download** | Download CSV template with example data |
| **Bulk Import** | Import multiple questions in a single operation |
| **Duplicate Handling** | Skip duplicates by title or import with override flag |

### Export Capabilities

| Feature | Description |
|---------|-------------|
| **Filter by Status** | Export only draft, in-review, published, etc. |
| **Filter by Domain** | Export questions from specific domains |
| **Filter by Difficulty** | Export easy, medium, or hard questions |
| **Include Solutions** | Option to include/exclude solution code |
| **Include Test Cases** | Option to include/exclude test case data |
| **Format Selection** | Choose between CSV and JSON output |

### JSON Import Schema

```json
{
  "title": "Two Sum",
  "domain": "arrays",
  "topic": "hash-map",
  "difficulty": "Easy",
  "tags": ["hash-table", "two-pointer"],
  "notes": "Classic problem",
  "testCases": [
    {
      "input": "[2,7,11,15]\n9",
      "expectedOutput": "[0,1]",
      "isHidden": false
    }
  ],
  "hints": [
    "Try using a hash map to store complements",
    "One pass solution is possible"
  ],
  "solution": {
    "language": "python",
    "code": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i",
    "approach": "Hash map one-pass solution with O(n) time complexity"
  }
}
```

### CSV Import Columns

| Column | Required | Description |
|--------|:--------:|-------------|
| `title` | ✅ | Question title (unique identifier) |
| `domain` | ✅ | Problem domain (e.g., arrays, trees, graphs) |
| `topic` | ❌ | Specific topic within domain |
| `difficulty` | ❌ | Easy, Medium, or Hard (default: Easy) |
| `tags` | ❌ | Comma-separated tags |
| `notes` | ❌ | Additional notes or context |
| `testCasesCount` | ❌ | Number of test cases (for metadata) |
| `hintsCount` | ❌ | Number of hints available |

---

## API Integration

### Google Apps Script Backend

All CRUD operations go through the GAS backend at:
```
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

| Operation | HTTP Method | Auth Required | Rate Limit |
|-----------|:-----------:|:-------------:|:----------:|
| Fetch all data | GET | ✅ | 60 req/min |
| Insert record | POST | ✅ | 30 req/min |
| Update record | PUT | ✅ | 30 req/min |
| Delete record | DELETE | ✅ | 10 req/min |

### Data Storage

| Sheet/Table | Key Fields | Description |
|-------------|------------|-------------|
| HiveDeskUsers | id, name, email, role, isActive, joinDate | User accounts and profiles |
| HiveDeskQuestions | id, title, domain, difficulty, status, creatorId, solution | Question bank with metadata |
| HiveDeskReviews | id, questionId, reviewerId, score, feedback | Peer review records |
| HiveDeskSprints | id, name, startDate, endDate, targetQuestions, status | Sprint planning data |
| HiveDeskLogs | id, userId, date, hours, description, category | Work log entries |
| HiveDeskCheckins | id, userId, week, today, blockers, mood | Weekly check-in data |
| HiveDeskKudos | id, fromUserId, toUserId, message, category | Kudos and recognition |
| HiveDeskSkills | id, userId, skill, level | Team skill assessments |
| HiveDeskGoals | id, userId, week, objective, keyResults, progress | Weekly OKRs |
| HiveDeskBuddyPairs | id, member1Id, member2Id, startDate | Buddy pair assignments |
| HiveDeskAudit | id, userId, action, resource, details, timestamp | System audit trail |
| HiveDeskSettings | key, value | System configuration |
| HiveDeskNotifications | id, userId, type, title, message, read | User notifications |

---

## Security Considerations

| Concern | Implementation |
|---------|----------------|
| **Authentication** | Email/password login with role-based session management |
| **Authorization** | Three-layer enforcement (sidebar, component, server-side) |
| **Data Isolation** | Curators can only modify their own content; leads see team data; admins see everything |
| **Role Elevation** | Only admins can assign the admin role; leads cannot self-promote |
| **Audit Trail** | All write operations logged with user ID, timestamp, action, and resource |
| **Input Validation** | Client-side validation + server-side sanitization in GAS |
| **Rate Limiting** | GAS built-in quotas (60 GET, 30 POST/PUT, 10 DELETE per minute) |
