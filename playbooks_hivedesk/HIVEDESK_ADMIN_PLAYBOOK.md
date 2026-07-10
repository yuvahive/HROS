# HiveDesk Admin Playbook

> **Role:** Admin
> **Access:** Everything. System config, user management, audit logs.
> **Last Updated:** July 2026

---

## First Time Setup (Deploying HiveDesk)

### Step 1: Create .env File

In `HiveDesk/` root, create `.env`:

```
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_GAS_API_KEY=your-secure-key-here
```

Get these from Google Apps Script → Deployment → Web app URL.

### Step 2: Deploy Code to Google Apps Script

1. Open Google Apps Script → your project
2. Delete all existing code in `Code.gs`
3. Copy entire contents of `HROS/HiveDesk/code.gs`
4. Paste into Apps Script editor → Save
5. Click **Deploy** → **New deployment**
6. Type: **Web app**
7. Execute as: **Me**
8. Who has access: **Anyone** (API key handles auth)
9. Click **Deploy**
10. Copy the new deployment URL

### Step 3: Set Script Properties

In Apps Script → **Project Settings** → **Script Properties** → Add:

| Property | Value |
|----------|-------|
| `API_KEY` | Your secure key (same as in .env) |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_NAME` | Your admin name |
| `ADMIN_PASSWORD` | Your admin password |

**Never commit these to git.**

### Step 4: Initialize Sheets

In Apps Script → **Executions** → Run `ensureAllSheets` once.
This creates all required sheets including `HiveDeskSchema`.

### Step 5: Build and Deploy Frontend

```bash
cd HiveDesk
npm run build
```

Upload `dist/` to GitHub Pages or your hosting.

### Step 6: Verify

1. Open HiveDesk URL
2. Login with admin credentials from Script Properties
3. Check Admin Dashboard → All sheets should show data
4. Check Schema → Should have default fields
5. Check Users → Admin should appear

---

## What Do I Do Monday Morning?

1. **Open HiveDesk** → Land on **War Room**
2. **Check Admin Dashboard** → System health, user status
3. **Review audit log** — Any suspicious activity?
4. **Check pending promotions** — Newcomers ready to level up?
5. **Monitor schema** — Any changes needed?

---

## Your Boards

### Admin Dashboard
Full system visibility:
- Total users, questions, published count
- Role breakdown (admin/lead/senior/curator/newcomer)
- Question status distribution
- Recent activity log
- Schema overview

### Users
Manage all team members:
- View/edit roles
- Change domains
- Reassign buddies
- Deactivate accounts
- Impersonate for troubleshooting

### Audit Log
Complete action history:
- Who did what, when
- Filter by user, action, resource
- Export for compliance

### Schema
Edit question schema:
- Add/remove fields
- Set constraints
- Changes propagate to all importers immediately

### Settings
System configuration:
- Target questions per person per week
- Quality weights
- Review turnaround limits
- Sprint duration
- Permission rules

---

## User Management

### Adding Users
1. Go to Users → Add User
2. Enter name, email, role, domain
3. Set initial password
4. User appears in roster

### Changing Roles
1. Find user → Edit
2. Change role dropdown
3. Save
4. User's permissions update immediately

### Role Hierarchy
```
Admin → Lead → Senior → Curator → Newcomer
```
Each level inherits permissions from below.

### Promotions
- **Newcomer → Curator**: Auto-promoted on first approved question
- **Curator → Senior**: Manual (4.0+ quality for 2+ months)
- **Senior → Lead**: Manual (appointed by Admin)

### Deactivating Users
1. Find user → Edit
2. Set isActive = false
3. User can't login but data preserved

---

## Impersonation

For troubleshooting:
1. Go to Users → Find user
2. Click "Login as [user]"
3. You see their view
4. Click "Stop Impersonating" to return

---

## Schema Management

The schema defines what files are required when curators import questions.

### Editing Schema
1. Go to Schema (or Admin Dashboard → Schema tab)
2. Click Edit on any field
3. Modify constraints (min length, required, etc.)
4. Save

### Adding a Field
1. Click "+ Add Field"
2. Enter field name, type, constraints
3. Save
4. All importers see the new field on next import

### Removing a Field
1. Click Remove on the field
2. Save
3. Field no longer validated on import

---

## System Configuration

### Key Settings
| Setting | Default | Description |
|---------|---------|-------------|
| target_questions_per_person_per_week | 5 | Min questions per curator per week |
| target_reviews_per_person_per_week | 5 | Min reviews per curator per week |
| buddy_review_ceiling | 7 | Max reviews before buddy overload |
| min_quality_score | 4.0 | Minimum quality to publish |
| auto_close_sprint | true | Auto-close sprint when deadline passes |

### Editing Settings
1. Go to Settings
2. Find the setting
3. Click Edit
4. Change value
5. Save

---

## Security

### What's Protected
- API keys stored in Script Properties (not in code)
- Session tokens with 30-day expiry
- Server-side role validation on all write operations
- Audit logging on all actions

### API Key Management
1. Go to Google Apps Script → Project Settings
2. Script Properties → Add/Edit API_KEY
3. Never commit keys to git

### Session Management
- Sessions expire after 30 days
- Stored in Google Apps Script Properties
- Invalidated on logout

---

## Audit Log

### Viewing
1. Go to Audit Log
2. Filter by user, action, or date
3. Click any entry for details

### Exporting
1. Click Export
2. Download CSV
3. Use for compliance or reporting

---

## Troubleshooting

### "Unauthorized" Error
- Check .env has correct VITE_GAS_URL and VITE_GAS_API_KEY
- Check Script Properties has matching API_KEY
- Check deployment is active (not expired)

### Login Fails
- Verify ADMIN_EMAIL and ADMIN_PASSWORD in Script Properties
- Check HiveDeskUsers sheet has the admin row
- Try re-running seedAdminIfNeeded in Apps Script

### Import Fails
- Check browser console for errors
- Verify GAS deployment is set to "Anyone" access
- Check network tab for failed requests

### Schema Not Loading
- Verify HiveDeskSchema sheet exists (run ensureAllSheets)
- Check GAS deployment URL is correct
- Try refreshing the page

---

## RBAC — What You Can and Can't Do

| Can Do | Can't Do |
|--------|----------|
| Everything | — |
| Manage users | — |
| Edit schema | — |
| View audit logs | — |
| Impersonate users | — |
| System settings | — |

---

## Tips

- **Check audit log weekly** — Catch issues early
- **Review promotions monthly** — Keep team growing
- **Monitor schema changes** — Ensure they don't break imports
- **Use impersonation sparingly** — Only for troubleshooting
- **Back up settings** — Before major changes

---

*HiveDesk Admin Playbook — July 2026*
