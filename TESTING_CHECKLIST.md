# ✅ IDP Assignment System - Complete Testing Checklist

## 🎯 Pre-Testing Setup

- [ ] Make sure all files are saved
- [ ] No compilation errors in VS Code
- [ ] Run: `npm run dev` 
- [ ] App loads at http://localhost:5173
- [ ] Clear localStorage: F12 → Application → localStorage → Clear all

---

## 📝 Test Suite 1: Foundation Testing

### **Test 1.1: Default Login System Still Works**
```
Goal: Verify password login not broken by new feature

Steps:
1. Open http://localhost:5173
2. Click [📝 Password Login] tab
3. Email: admin@hros.local
4. Password: admin123
5. [Sign In]

Expected:
✅ Login succeeds
✅ Dashboard loads
✅ See "Admin" role in header
✅ Admin access verified (Settings visible)
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 1.2: Create New Employee**
```
Goal: Set up test employee for IDP testing

Steps:
1. Click [⚙️ Admin Settings]
2. → [User Management]
3. Click [+ Add New User]
4. Fill form:
   - Name: Jane Test
   - Email: jane@company.com
   - Password: test123
   - Role: employee (not admin)
5. [Create User]

Expected:
✅ Success message appears
✅ Jane appears in user list
✅ No IDP assigned yet (shows 📝)
✅ Can see [🔐] button next to her name
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 1.3: Employee Can Login with Password**
```
Goal: Verify new employee can login before IDP assignment

Steps:
1. Logout (click [👤] → [Logout])
2. Email: jane@company.com
3. Password: test123
4. [Sign In]

Expected:
✅ Login succeeds
✅ Dashboard shows limited boards (Employee role)
✅ Can see user profile in header
✅ Check Admin Settings (should not appear for employee)
```

**Status:** ☐ PASS | ☐ FAIL

---

## 🔐 Test Suite 2: IDP Assignment

### **Test 2.1: Open IDP Assignment Modal**
```
Goal: Access IDP assignment UI

Steps:
1. Logout
2. Login as admin
3. Admin Settings → User Management
4. Find "Jane Test" in user list
5. Click [🔐] button next to her name

Expected:
✅ Modal appears: "Assign IDP Provider"
✅ Shows: "Jane Test (jane@company.com)"
✅ Dropdown visible with 6 providers
✅ Default provider: "Password-based Login"
✅ Can see [Cancel] and [Assign IDP] buttons
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 2.2: Assign Google OAuth**
```
Goal: Assign Google provider to employee

Steps:
1. Modal open (from Test 2.1)
2. Click dropdown
3. Select: 🔷 Google OAuth
4. Observe alert: "✓ Assignment Ready..."
5. [Assign IDP]

Expected:
✅ Modal closes
✅ Success message: "✓ IDP assignment updated: google"
✅ Jane's row now shows: "🔐 IDP: Google"
✅ Can click [🔐] again and see "google" selected
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 2.3: Change IDP Provider**
```
Goal: Verify provider can be changed

Steps:
1. User Management, find Jane
2. Click [🔐] button
3. Change provider: Google → Microsoft Entra
4. Click [Assign IDP]

Expected:
✅ Jane's row shows: "🔐 IDP: Microsoft"
✅ [🔐] button click shows: "microsoft" selected
✅ Old assignment (Google) replaced completely
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 2.4: Revert to Password**
```
Goal: Put user back to password-based login

Steps:
1. Jane Test user, click [🔐]
2. Select: 📝 Password-based Login
3. [Assign IDP]

Expected:
✅ Jane's row now shows: "📝 Using: Password-based login"
✅ No more IDP indicator
✅ User is back to password mode
```

**Status:** ☐ PASS | ☐ FAIL

---

## 🔑 Test Suite 3: IDP Login Flow

### **Test 3.1: IDP Login Tab Visible**
```
Goal: UI shows both password and IDP tabs

Steps:
1. Logout (any user)
2. Open http://localhost:5173
3. Look at top of login form

Expected:
✅ Two tabs visible:
   - [📝 Password Login] (with blue border/background)
   - [🔐 IDP Login]
✅ Password form showing below tabs
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 3.2: Switch to IDP Login Tab**
```
Goal: Switch from password to IDP form

Steps:
1. Click [🔐 IDP Login] tab
2. Observe form change

Expected:
✅ Form changes to IDP mode
✅ Shows:
   - Info alert: "Contact your HR administrator..."
   - Email field
   - Provider dropdown (5 providers listed)
   - Button says: "🔐 Connect with google"
✅ Password field gone
✅ Remember me checkbox gone
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 3.3: Try IDP Login with Correct Provider**
```
Goal: Login via IDP with matching provider

Setup:
- Jane Test assigned to Google (from Test 2.2)

Steps:
1. On [🔐 IDP Login] tab
2. Email: jane@company.com
3. Provider: google (selected)
4. [Connect with google]

Expected:
✅ Loading state: "Connecting..."
✅ Login succeeds!
✅ Redirects to Dashboard
✅ Header shows: jane@company.com
✅ Role shows: Employee
✅ Check: "🔐 Google" or similar auth indicator
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 3.4: Try IDP Login with Wrong Provider**
```
Goal: Verify system rejects mismatched provider

Setup:
- Jane Test assigned to Google

Steps:
1. On [🔐 IDP Login] tab
2. Email: jane@company.com
3. Provider: microsoft (WRONG!)
4. [Connect with google]

Expected:
❌ Login FAILS
❌ Error message appears: 
   "No account found for jane@company.com with provider microsoft"
   OR
   "Not assigned to this provider"
✅ Stays on login page
✅ Can retry with correct provider
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 3.5: Try IDP Login with Invalid Email**
```
Goal: Verify system rejects non-existent emails

Steps:
1. On [🔐 IDP Login] tab
2. Email: nonexistent@company.com
3. Provider: google
4. [Connect with google]

Expected:
❌ Login FAILS
❌ Error message: "No account found..."
✅ Stays on login page
```

**Status:** ☐ PASS | ☐ FAIL

---

## 👤 Test Suite 4: Multiple Users Testing

### **Test 4.1: Create Second Employee with Different Provider**
```
Goal: Test system with multiple IDP assignments

Steps:
1. Login as admin
2. Admin Settings → User Management
3. [+ Add New User]
   - Name: Mark Davis
   - Email: mark@company.com
   - Password: test123
   - Role: employee
4. [Create User]
5. Click [🔐] on Mark
6. Select: ☁️ Microsoft Entra
7. [Assign IDP]

Expected:
✅ Mark created
✅ Mark assigned to Microsoft
✅ User list shows:
   - Jane Test: 🔐 IDP: Google
   - Mark Davis: 🔐 IDP: Microsoft
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 4.2: Test Both Users Login Separately**
```
Goal: Verify both IDP assignments work

Test 4.2a - Jane with Google:
1. Logout
2. [🔐 IDP Login] → jane@company.com → google
3. [Connect with google]
4. ✅ Should login as Jane Employee
5. Check header: Shows Jane's info

Test 4.2b - Switch to Mark with Microsoft:
1. Logout
2. [🔐 IDP Login] → mark@company.com → microsoft
3. [Connect with microsoft]
4. ✅ Should login as Mark Employee
5. Check header: Shows Mark's info

Test 4.2c - Try Jane with Wrong Provider:
1. Logout
2. [🔐 IDP Login] → jane@company.com → microsoft
3. [Connect with microsoft]
4. ❌ Should FAIL with error
5. Can login with correct google provider

Expected:
✅ Each user can ONLY login with their assigned provider
✅ Mismatched email/provider combination fails
✅ System correctly isolates users
```

**Status:** ☐ PASS | ☐ FAIL

---

## 🔄 Test Suite 5: Backward Compatibility

### **Test 5.1: Can Still Use Password with IDP-Assigned User**
```
Goal: Verify password login still works even with IDP assigned

Setup: 
- Jane Test assigned to Google

Steps:
1. Click [📝 Password Login] tab
2. Email: jane@company.com
3. Password: test123
4. [Sign In]

Expected:
✅ Password login STILL WORKS!
✅ Redirects to Dashboard as Jane
✅ Shows: Employee role
✅ Can navigate normally
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 5.2: Can Switch Between Password and IDP Tabs**
```
Goal: User can easily switch login methods

Steps:
1. Logout
2. [📝 Password Login] - view password form
3. [🔐 IDP Login] - form changes
4. [📝 Password Login] - back to password form
5. [🔐 IDP Login] - back to IDP form

Expected:
✅ Smooth tab switching
✅ Forms completely different
✅ No data leakage between tabs
✅ Can type in either form without interference
```

**Status:** ☐ PASS | ☐ FAIL

---

## 💾 Test Suite 6: Data Persistence

### **Test 6.1: IDP Assignment Persists After Refresh**
```
Goal: localStorage correctly saves IDP assignments

Setup: Jane assigned to Google

Steps:
1. Admin panel visible
2. Refresh page (F5)
3. After reload, Admin Settings → User Management
4. Find Jane Test

Expected:
✅ Page reloads completely
✅ Jane still shows: "🔐 IDP: Google"
✅ Assignment data survived refresh
✅ [🔐] click still shows Google selected
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 6.2: Session Persists Across Pages**
```
Goal: Logged-in user stays logged in when navigating

Steps:
1. Login as Jane via IDP (google)
2. Dashboard loads
3. Click different boards (1:1, Analytics, etc.)
4. Check header - still shows Jane ✅
5. Refresh page (F5)
6. Page reloads - still logged in ✅

Expected:
✅ User stays logged in across page navigation
✅ Role-based access maintained
✅ Session survives refresh
```

**Status:** ☐ PASS | ☐ FAIL

---

## 🎯 Test Suite 7: Role-Based Access Control

### **Test 7.1: Admin Can Access User Management**
```
Goal: Verify role permissions with IDP

Steps:
1. Login as admin
2. Admin Settings → User Management
3. Verify [🔐] button visible for each user
4. Can click [🔐] and assign IDP? YES

Expected:
✅ Admin sees full user management
✅ Can assign IDP to any user
✅ Can edit/delete users
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 7.2: Employee CANNOT Access User Management**
```
Goal: Non-admin cannot see admin features

Steps:
1. Login as Jane (IDP method)
2. Check [⚙️] Admin Settings button
3. Should be disabled/hidden? YES

Expected:
✅ Employee doesn't see Admin Settings in sidebar
✅ Can't access /admin-settings URL
✅ Dashboard only shows allowed boards
```

**Status:** ☐ PASS | ☐ FAIL

---

## 🚨 Test Suite 8: Error Handling

### **Test 8.1: Display Helpful Error Messages**
```
Goal: Errors are clear and actionable

Test 8.1a - Wrong Provider:
1. Jane assigned to Google
2. Try login: jane@company.com with Microsoft
3. Check error message

Expected:
✅ Clear error (not cryptic)
✅ Suggests action: "Check with HR..." or similar
✅ User can understand what went wrong

Test 8.1b - Non-existent User:
1. Try: nonexistent@email.com with any provider
2. Check error message

Expected:
✅ Says "No account found" or similar
✅ Not a generic error
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 8.2: No Unhandled Exceptions**
```
Goal: System doesn't crash on weird input

Steps:
1. Try edge cases:
   - Empty email + any provider
   - Email with special chars: test+tag@company.com
   - Email with spaces: " jane@company.com"
   - Very long email
   - Provider: "invalid_provider"

Expected:
✅ No crashes
✅ Graceful error messages
✅ System stays responsive
```

**Status:** ☐ PASS | ☐ FAIL

---

## 🎨 Test Suite 9: UI/UX Verification

### **Test 9.1: Visual Indicators Show Correctly**
```
Goal: Users understand IDP status at a glance

Steps:
1. Admin Settings → User Management
2. Look at user list
3. Verify indicators:

Expected:
✅ Jane (Google): Shows 🔐 IDP: Google
✅ Mark (Microsoft): Shows 🔐 IDP: Microsoft  
✅ Other (Password): Shows 📝 Using: Password
✅ Icons clear and consistent
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 9.2: Responsive on Different Screens**
```
Goal: Works on desktop, tablet, mobile

Steps:
1. Test on full screen (F11 fullscreen)
   - Verify all buttons visible
   - Modal centered and readable
   
2. Test on tablet size (F12 toggle device)
   - Dropdown works
   - Buttons clickable
   
3. Test on mobile (narrow screen)
   - No layout broken
   - Can still interact

Expected:
✅ Works on all screen sizes
✅ Forms look good everywhere
✅ Buttons clickable on touchscreen
```

**Status:** ☐ PASS | ☐ FAIL

---

## 📊 Test Suite 10: Performance

### **Test 10.1: IDP Assignment is Instant**
```
Goal: No lag when assigning providers

Steps:
1. Open IDP modal
2. Change provider in dropdown
3. Click [Assign IDP]
4. Verify instant response

Expected:
✅ Modal opens < 200ms
✅ Dropdown changes instantly
✅ Assignment completes < 500ms
⚡ No freezing or stuttering
```

**Status:** ☐ PASS | ☐ FAIL

### **Test 10.2: Login is Fast**
```
Goal: IDP login comparable to password login

Steps:
1. Time password login: admin@hros.local
2. Time IDP login: jane@company.com (google)
3. Compare speeds

Expected:
✅ Both methods similarly fast
✅ No noticeable lag
✅ Dashboard loads within 1-2 seconds
```

**Status:** ☐ PASS | ☐ FAIL

---

## 📋 Final Summary

### **Test Results**

| Test Suite | Status | Notes |
|-----------|--------|-------|
| 1. Foundation | ☐ | Password login, user creation |
| 2. IDP Assignment | ☐ | Assign, change, revert providers |
| 3. IDP Login Flow | ☐ | Tab switching, provider validation |
| 4. Multiple Users | ☐ | Different providers, isolation |
| 5. Backward Compat | ☐ | Password still works |
| 6. Data Persistence | ☐ | localStorage, sessions |
| 7. Access Control | ☐ | Role-based permissions |
| 8. Error Handling | ☐ | Clear, helpful errors |
| 9. UI/UX | ☐ | Responsive, accessible |
| 10. Performance | ☐ | Fast, no lag |

**Overall Status:** 

- ✅ **READY FOR PRODUCTION** (if all tests pass)
- ⚠️ **NEEDS FIXES** (if any test fails)
- 🔴 **BLOCKED** (if critical test fails)

---

## 📝 Issues Found (If Any)

```
Test Number | Issue | Severity | Fix Applied
────────────|───────|──────────|─────────────
            |       |          |
            |       |          |
            |       |          |
```

---

## ✅ Sign-Off

- [ ] All tests reviewed
- [ ] All tests passed
- [ ] No critical issues
- [ ] Documentation complete
- [ ] Ready for user deployment

**Tested by:** ___________________
**Date:** ___________________
**Sign-off:** ___________________

---

## 🎉 Next Steps After Testing

✅ **If All Tests Pass:**
1. Prepare deployment bundle
2. Send email to HR team with documentation
3. Host live demo
4. Monitor first-time users

⚠️ **If Tests Fail:**
1. Document exact failure scenario
2. Check error messages
3. Review code in DEVELOPER_GUIDE.md
4. Fix issues
5. Re-run failing tests

---

**Your HROS IDP Assignment System is Ready for Testing! 🚀**

Use this checklist to verify every feature works as expected.
**Print this out or use digitally during testing.**

Built with ❤️ for Quality Assurance
