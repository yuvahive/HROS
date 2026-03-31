# 🔐 Authentication & Role-Based Access Control - Complete Guide

## Overview

Your HROS system now has a complete authentication layer with three user roles:
- **Admin**: Full system access - users management, IDP configuration, all boards
- **Employee**: Limited access - Daily Work, 1:1s, Metrics (read-only hiring/projects)
- **Intern**: Minimal access - Daily Work, Metrics, Onboarding only

---

## 🚀 Quick Start (User Guide)

### **First-Time Login (Default Admin Account)**

1. Open the app → You'll see the beautiful **Login Page**
2. Enter:
   - **Email**: `admin@hros.local`
   - **Password**: `admin123`
3. Click **Sign In** → Welcome to HROS! ✅

---

## 📋 Feature Summary by Role

### 🛑 Admin Role

**What Admins Can Do:**
- Access all 13 boards (Hiring, Daily Work, Onboarding, Team Pulse, Exits, Projects, Actions, 1:1s, Red Flags, Commands, Metrics, Reports)
- **Create/Edit/Delete** everything:
  - Hiring candidates
  - Team members & performance
  - Onboarding tasks
  - Project health tracking
  - Action items & decisions
  - Report generation & export
- **Manage Users**: Add, edit, delete employee & intern accounts
- **Configure Identity Providers**: Enable OAuth/SAML (Google, Microsoft Entra, Okta, Auth0, custom OIDC)
- **Access Admin Settings** (gear icon in top nav)

**Visible in HROSDashboard:**
- All HR boards
- All Execution boards
- All Support boards
- **Administration** section (unique to admins) with Settings

---

### 👥 Employee Role

**What Employees Can Do:**
- View **Daily Work** board (manage own tasks)
- Schedule **1:1 Meetings** with managers
- View **Metrics & KPIs**
- **Read-only access** to:
  - Hiring Pipeline (see open positions)
  - Reports (company analytics)
  - Action Items (see decisions)
  - Projects (track status)

**What Employees CANNOT Do:**
- Create/edit hiring candidates
- Manage other users
- Configure system settings
- Delete records
- Access Exit handling
- Team Pulse (sensitive employee data)

**Visible in HROSDashboard:**
- Only Daily Work, 1:1 Meetings, and Metrics boards
- No Admin Settings (permission denied)

---

### 🎓 Intern Role

**What Interns Can Do:**
- View **Daily Work** (own tasks only)
- View **Metrics & KPIs**
- View **Onboarding Progress** (their own checklist)
- See project **status tracking** (read-only)

**What Interns CANNOT Do:**
- Create/edit any records
- Access hiring pipeline
- View team pulse or employee data
- Manage system settings
- Delete anything

**Visible in HROSDashboard:**
- Only Daily Work and Metrics boards
- Onboarding checklist (for self-onboarding tracking)
- No admin or management features

---

## 🔑 How Authentication Works

### **Step 1: Login Page**
```
┌─────────────────────────────────┐
│   HROS Login                    │
├─────────────────────────────────┤
│ Email: admin@hros.local         │
│ Password: ••••••••••••••••••••••│
│ ☐ Remember me                   │
│                                 │
│  [  Sign In  ]                  │
│                                 │
│ Demo: admin@hros.local / admin  │
│                                 │
│ (Beautiful gradient background) │
└─────────────────────────────────┘
```

**Behind the scenes:**
1. Form validation (required fields)
2. Email + password lookup in localStorage
3. If match found → Create session token
4. Store in localStorage (`hros_current_user`)
5. Redirect to HROS Dashboard
6. If wrong credentials → Show error message

---

### **Step 2: Session Management**

**After Login:**
- User info shown in Header (top-right)
- User info shown in Sidebar (user details card)
- Logout button available everywhere
- Session persists if you refresh the page

**On Logout:**
- Clear current session
- Redirect to Login Page
- Boards hidden (permission denied)
- Data remains in database (safe)

---

### **Step 3: Permission Checking**

Every board & action checks:
```javascript
// Example: Can this user CREATE a hiring candidate?
if (!hasPermission('hiring', 'create')) {
  // Show access denied message
}

// Example: Can this user access Reports?
if (!hasPermission('reports', 'read')) {
  // Hide the Reports board
}
```

---

## 🛠️ Admin Settings Panel

### **Accessing Admin Settings**
1. Login as **admin**
2. Click **Admin Settings** (gear icon) in sidebar
3. Manage users or configure identity providers

---

### **Tab 1: User Management**

**View All Users**
- Name, Email, Role, Status (Active/Inactive)
- Deactivate users without deleting them

**Add New User**
```
Name: John Doe
Email: john@company.com
Password: SecurePass123
Role: [Dropdown - admin/employee/intern]
→ [Create User] button
```

**Edit User**
- Click pencil icon next to user
- Change role, deactivate/reactivate
- Click [Save] 

**Delete User**
- Click trash icon
- Confirm deletion (cannot delete self)
- User & all permissions removed

---

### **Tab 2: Identity Providers (IDP)**

**What is IDP?**
- Instead of remembering passwords, use Google/Microsoft/Okta to login
- Singles sign-on (SSO) across your organization

**Available Providers:**
- Custom OIDC
- Google OAuth
- Microsoft Entra (Azure AD)
- Okta
- Auth0

**Setup Steps:**
1. Enable "External IDP" toggle
2. Select provider from dropdown
3. Enter:
   - Provider Name (e.g., "Company Google Account")
   - Provider URL (OAuth endpoint)
   - Client ID (from IDP)
   - Client Secret (from IDP)
   - Scopes (email, profile, etc.)
4. Copy Callback URL to your IDP settings
5. Click [Save Configuration]

---

## 📊 Permission Matrix

```
Resource      │ Admin  │ Employee │ Intern
──────────────┼────────┼──────────┼────────
hiring        │ CRUD   │ R        │ ✗
onboarding    │ CRUD   │ R        │ R
exits         │ CRUD   │ ✗        │ ✗
team-pulse    │ CRUD   │ ✗        │ ✗
projects      │ CRUD   │ R        │ R
actions       │ CRUD   │ R        │ ✗
daily-work    │ CRUD   │ CRUD     │ CRUD
one-on-ones   │ CRUD   │ CRUD     │ ✗
metrics       │ R      │ R        │ R
reports       │ R      │ R        │ ✗
users         │ CRUD   │ ✗        │ ✗
settings      │ RU     │ ✗        │ ✗

C = Create  | R = Read  | U = Update  | D = Delete
```

---

## 🔐 Data Storage

**All stored locally in browser (no server needed):**

**localStorage Keys:**
```javascript
// Users database
localStorage.getItem('hros_users')
// Returns: [{id, name, email, password, role, active, loginTime}, ...]

// Current session
localStorage.getItem('hros_current_user')
// Returns: {id, name, email, role, loginTime} or null

// IDP configuration
localStorage.getItem('hros_idp_config')
// Returns: {enabled, provider, url, clientId, clientSecret, scopes}
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Admin Creates Employee**
```
1. Login: admin@hros.local / admin123
2. Click "Admin Settings" → "User Management"
3. Click "Add New User"
4. Fill:
   - Name: Jane Doe
   - Email: jane@company.com
   - Password: jane123
   - Role: employee ✓
5. Click "Create User"
6. ✓ Jane now appears in user list
```

### **Scenario 2: Employee Views Limited Boards**
```
1. Login: jane@company.com / jane123
2. Look at sidebar → Only sees:
   - Daily Work ✓
   - 1:1 Meetings ✓
   - Metrics ✓
3. Try to click "Hiring Pipeline" → "Access Denied" ✓
```

### **Scenario 3: Intern Tries Admin Panel**
```
1. Login as intern
2. Click "Admin Settings"
3. See: "Access Denied - Admin only" ✓
4. Logout button appears normally
```

---

## 🖥️ Component Architecture

```
App.jsx (Wrapped with AuthProvider)
├── LoginPage.jsx
│   └── Form submission → AuthContext.login()
│       └── Validates credentials
│       └── Sets currentUser in localStorage
│       └── Redirects to HROS
│
└── AppContent.jsx (if currentUser exists)
    ├── Header.jsx
    │   └── Shows currentUser.name + role
    │   └── Logout button
    │
    ├── Sidebar.jsx
    │   └── Shows currentUser info card
    │   └── Logout button
    │
    └── HROSDashboard.jsx
        ├── Filters boards by role
        ├── Admin Settings (admin only)
        └── Currently active board component
            └── Uses hasPermission() for buttons
```

---

## 🔧 Creating Protected Features

### **Example: Protect a Create Button**

```javascript
import { useAuth } from '../context/AuthContext';

export default function HiringBoard() {
  const { currentUser, hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('hiring', 'create') && (
        <button className="bg-blue-600">
          + Add Candidate
        </button>
      )}
    </div>
  );
}
```

### **Example: Show Role-Specific Boards**

```javascript
{currentUser?.role === 'admin' && (
  <AdminSettingsBoard />
)}

{(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
  <ReportsBoard />
)}
```

---

## 📚 Extending the System

### **Add a New User Role**

1. Edit `AuthContext.jsx`
2. Add to `PERMISSION_MATRIX`:
   ```javascript
   manager: {
     boards: ['hiring', 'team-pulse', 'daily-work', 'metrics'],
     users: ['read'],  // Can see but not modify
     hiring: ['read', 'update'],  // Can review candidates
     // ... etc
   }
   ```
3. Update AdminSettings role dropdown
4. Test access to boards

### **Add Permission to a Resource**

Example: Allow employees to create action items
```javascript
// In AuthContext.jsx
employee: {
  actions: ['create', 'read'],  // Changed from ['read'] only
}
```

---

## 🎯 Real-World Usage

**Monday Morning Workflow:**

1. Intern logs in → Sees Daily Standup + Onboarding tasks
2. Employee logs in → Sees team Daily Work + their 1:1 schedule
3. Manager logs in → Full access, sees Team Pulse + hiring pipeline
4. CEO logs in → Views all reports + company metrics

**Admin Monday:**

1. Admin logs in
2. Creates new intern account (onboarding starts)
3. Configures Google OAuth (employees can use SSO now)
4. Exports reports for board meeting
5. Logs out

---

## 🐛 Troubleshooting

**"Can't see a board I should have access to"**
- Check your role (click your name in sidebar)
- Ask admin to verify permissions in User Management
- Refresh the page

**"Admin Settings button doesn't appear"**
- You're not an admin
- Admin-only feature for system configuration
- Ask system admin for help

**"My password isn't working"**
- Password is case-sensitive
- Check Caps Lock
- Ask admin to reset your password in User Management

**"Want to use Google OAuth instead of passwords"**
- Admin goes to Admin Settings → Identity Providers
- Enables Google OAuth
- Copies callback URL to Google Cloud Console
- Users can now sign in with Google

---

## 📞 Support

**Default Admin Account:**
- Email: `admin@hros.local`
- Password: `admin123`
- Use this to create your actual admin account

**First Time Setup:**
1. Login with default admin
2. Create new admin account with your email
3. Create employee accounts
4. Configure IDP (optional, email/password works fine)
5. Users can now login individually

---

**✅ Your HROS is now enterprise-ready with authentication!**
