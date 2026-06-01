# Task 9 Testing & Review Guide

## Step-by-Step Testing Instructions

### Part 1: Role-Based Access Control Testing

#### Test 1.1: Create User Account and Test Access
1. Navigate to signup page
2. Fill in:
   - Email: `user@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - **Role: User** (select from dropdown)
3. Click "Sign Up"
4. Verify redirect to login page
5. On login page:
   - Enter `user@example.com`
   - Enter `password123`
   - Select role: **User**
   - Click "Login"

**Expected Result**: 
- User logged in successfully
- Sidebar shows only: Dashboard, Employees
- Departments, Attendance, Settings tabs NOT visible

#### Test 1.2: Create Admin Account and Test Full Access
1. Navigate to signup page
2. Fill in:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Confirm Password: `admin123`
   - **Role: Admin** (select from dropdown)
3. Click "Sign Up"
4. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: **Admin**

**Expected Result**:
- Admin logged in successfully
- Sidebar shows all tabs: Dashboard, Employees, Departments, Attendance, Settings

#### Test 1.3: Test Unauthorized Access Blocking
1. Login as User role
2. Try to manually navigate to `/dashboard/departments`
3. Try to manually navigate to `/dashboard/attendance`
4. Try to manually navigate to `/dashboard/settings`

**Expected Result**:
- All unauthorized routes redirect to `/dashboard`
- URL changes but page content shows dashboard

---

### Part 2: Forgot Password Testing

#### Test 2.1: Successful Password Reset
1. Click "Forgot Password?" on login page
2. Enter email: `user@example.com` (registered user)
3. Enter new password: `newpass123`
4. Confirm new password: `newpass123`
5. Click "Reset Password"

**Expected Result**:
- Success message: "Password updated successfully. Please login."
- Form clears (except email)
- User can login with new credentials

#### Test 2.2: Invalid Email
1. On Forgot Password page
2. Enter non-existent email: `nonexistent@test.com`
3. Enter password: `test123`
4. Confirm password: `test123`
5. Click "Reset Password"

**Expected Result**:
- Error message: "No registered user found with this email."
- Form stays populated
- User cannot proceed

#### Test 2.3: Password Mismatch
1. Enter registered email
2. Enter password: `pass123`
3. Confirm with different password: `different456`
4. Click "Reset Password"

**Expected Result**:
- Error message: "Passwords do not match."
- Form stays populated
- User must correct passwords

#### Test 2.4: Login with New Password
1. After successful reset, go to login
2. Enter email and new password
3. Select role and login

**Expected Result**:
- Login successful with new password
- Old password no longer works

---

### Part 3: Add Employee Validation Testing

#### Test 3.1: Button Disable/Enable on Load
1. Login as Admin
2. Go to Employees tab
3. Click "Add Employee"

**Expected Result**:
- Modal opens
- "Add Employee" button is **DISABLED** (grayed out)
- Button label is gray, cursor shows "not-allowed"

#### Test 3.2: Button Enables with All Fields Filled
1. Keep modal open
2. Enter all mandatory fields:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Role: Select a role from dropdown
   - Department: Select a department from dropdown
3. Observe button state

**Expected Result**:
- Button becomes **ENABLED** (blue)
- Button is clickable
- Cursor shows normal pointer

#### Test 3.3: Button Disables with Empty Name
1. In modal with all fields filled
2. Clear the Name field
3. Click elsewhere or tab out

**Expected Result**:
- Button becomes **DISABLED** again
- Error message shows: "Name is required."
- Button is gray and not clickable

#### Test 3.4: Button Disables with Invalid Email
1. Fill all fields
2. Enter invalid email: `notanemail`
3. Click elsewhere or tab out

**Expected Result**:
- Button becomes **DISABLED**
- Error message shows: "Please enter a valid email address."

#### Test 3.5: Email Validation Examples
Try these emails - observe which ones enable the button:

| Email | Valid? | Expected Result |
|-------|--------|-----------------|
| `user@example.com` | ✓ Yes | Button enabled |
| `test@domain.co.uk` | ✓ Yes | Button enabled |
| `name@company.org` | ✓ Yes | Button enabled |
| `invalid@` | ✗ No | Button disabled, error shown |
| `@example.com` | ✗ No | Button disabled, error shown |
| `noemail` | ✗ No | Button disabled, error shown |
| `name @example.com` | ✗ No | Button disabled, error shown |

#### Test 3.6: Joined Date Optional
1. Leave all mandatory fields filled
2. Leave "Joined Date (Optional)" empty
3. Click "Add Employee"

**Expected Result**:
- Employee added successfully (no error for missing date)
- Joined date is empty in the record

#### Test 3.7: Error Message Clearing
1. In modal, enter invalid email: `invalid@`
2. See error message
3. Edit the email field to valid: `valid@example.com`

**Expected Result**:
- Error message disappears immediately
- Button becomes enabled
- No manual refresh needed

#### Test 3.8: Add Employee Success
1. Fill all mandatory fields with valid data
2. Button is enabled
3. Click "Add Employee"

**Expected Result**:
- Modal closes
- New employee appears in the table
- Success toast notification shown
- Employee count stat updated

---

### Part 4: Attendance Report Download Testing

#### Test 4.1: Admin Can Download Report
1. Login as Admin
2. Go to Attendance tab
3. Look for "Download Report" button

**Expected Result**:
- Button is visible
- Button is clickable

#### Test 4.2: User Cannot See Download Button
1. Login as User role
2. Go to Employees tab
3. Try to navigate to Attendance tab

**Expected Result**:
- Cannot access Attendance tab (redirected to dashboard)
- Download button never appears for user role

#### Test 4.3: Download File Format
1. As Admin, click "Download Report"
2. File downloads automatically

**Expected Result**:
- Filename: `attendance-report.csv`
- File opens in text editor or spreadsheet
- Contains headers: Employee Name, Department, Status, Date
- Contains employee records in CSV format
- Data is comma-separated and properly quoted

#### Test 4.4: CSV Format Validation
1. Download the report
2. Open in Excel or text editor
3. Check structure:

```
"Employee Name","Department","Status","Date"
"Thejaswi","ASE","Present","2026-05-28"
"Pushpa","Design","Absent","2026-05-28"
...
```

**Expected Result**:
- All fields are quoted
- Proper comma separation
- No corrupted data
- Can be imported into Excel/Google Sheets

---

### Part 5: Integration Testing

#### Test 5.1: Complete User Journey
1. Create new user account
2. Login as user
3. Access allowed pages (Dashboard, Employees)
4. Verify restricted pages redirect
5. Logout

#### Test 5.2: Complete Admin Journey
1. Create new admin account
2. Login as admin
3. Access all pages successfully
4. Add employee (with proper validation)
5. Download attendance report
6. Logout

#### Test 5.3: Session Persistence
1. Login as user
2. Refresh page (F5)

**Expected Result**:
- User still logged in
- Session maintained
- No redirect to login

#### Test 5.4: Logout and Re-login
1. Login as user
2. Click Logout
3. Try to access dashboard directly

**Expected Result**:
- Redirected to login
- Must login again
- Previous session cleared

---

## Review Discussion Points

### 1. Role-Based Access Flow
- **Question**: How does the application determine and verify the user's role?
- **Expected Answer**: Role is stored in AuthContext and checked by ProtectedRoute component on each protected route
- **Code Location**: `src/context/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`

- **Question**: What happens when a user tries to access an unauthorized page?
- **Expected Answer**: ProtectedRoute checks the role and redirects to dashboard if not authorized
- **Code Location**: `src/components/ProtectedRoute.jsx` line 13-17

### 2. Validation Logic
- **Question**: How is email validation performed and why use regex?
- **Expected Answer**: Uses regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` to validate basic email format
- **Code Location**: `src/components/employees/AddEmployeeModal.jsx`

- **Question**: Why is the button disabled and enabled dynamically?
- **Expected Answer**: Provides better UX by preventing form submission errors and guiding users to complete all required fields
- **Code Location**: `src/components/employees/AddEmployeeModal.jsx` - `isMandatoryFieldsFilled()` function

### 3. Conditional Rendering
- **Question**: How does the sidebar show different options for different roles?
- **Expected Answer**: Uses `isAdmin` variable to conditionally render admin-only menu items
- **Code Location**: `src/components/layout/Sidebar.jsx` - `{isAdmin && <NavLink>...}</NavLink>`

- **Question**: How is the download button conditionally rendered?
- **Expected Answer**: Uses `canDownload = user?.role === "admin"` to show button only for admins
- **Code Location**: `src/pages/dashboard/Attendance.jsx`

### 4. Authentication Handling
- **Question**: How is user authentication persisted across page refreshes?
- **Expected Answer**: User data stored in localStorage, AuthContext retrieves it on mount
- **Code Location**: `src/context/AuthContext.jsx` - `getSavedUser()` function

- **Question**: What happens to user data when they logout?
- **Expected Answer**: User removed from context and localStorage, user is null
- **Code Location**: `src/context/AuthContext.jsx` - `logout()` function

### 5. Report Download Implementation
- **Question**: Why is the download restricted to admin role?
- **Expected Answer**: Sensitive attendance data should only be accessible to administrators
- **Recommendation**: Could be extended to include date-range filtering and multiple export formats

- **Question**: How can the download feature be extended?
- **Expected Answers**: 
  - Add Excel export using xlsx library
  - Add PDF export using pdfkit
  - Add date range filtering
  - Add department-specific filtering

---

## Regression Testing

### After Each Change, Verify:
- [ ] User role can access Dashboard and Employees only
- [ ] Admin role can access all tabs
- [ ] Add Employee button validation works
- [ ] Password reset functionality works
- [ ] Download button visible only for admins
- [ ] Logout clears session
- [ ] Login works for both roles
- [ ] No console errors

---

## Performance Testing

1. **Button Response Time**
   - Type in fields and observe button enable/disable
   - Should be instant (no noticeable lag)

2. **Form Validation**
   - Should not cause performance issues even with many fields
   - Error messages should appear/disappear instantly

3. **Report Download**
   - Should start download immediately
   - No page reload needed
   - File size should be reasonable for given data

---

## Browser Compatibility Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Verify all features work consistently across browsers.

---

## Mobile Responsiveness Testing

1. Test on mobile viewport
2. Verify modals are readable
3. Verify buttons are clickable
4. Verify forms are usable

---

## Accessibility Testing

1. **Keyboard Navigation**
   - Can navigate all form fields with Tab key
   - Can submit forms with Enter key
   - Can access all features without mouse

2. **Color Contrast**
   - Disabled button is still readable
   - Error messages are visible
   - All text meets WCAG standards

3. **Screen Reader**
   - Form labels properly associated
   - Error messages are announced
   - Button states are conveyed

---

## Documentation Verification

Verify all documentation matches implementation:
- [ ] IMPLEMENTATION_SUMMARY.md is accurate
- [ ] TASK_9_QUICK_REFERENCE.md has correct information
- [ ] Code comments explain complex logic
- [ ] Error messages are user-friendly

---

## Conclusion

This testing guide covers:
✓ All 4 major features in Task 9
✓ Integration scenarios
✓ Edge cases and error conditions
✓ Discussion points for review
✓ Performance and accessibility

Use this guide as a checklist to verify implementation completeness before deployment.
