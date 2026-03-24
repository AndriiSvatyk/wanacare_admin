# Admin Panel Authentication

## How User Types Are Differentiated

The backend differentiates between **Admins**, **Clients**, and **Professionals** as follows:

### 1. **Clients**
- **Identification**: 
  - `user_type = 1` in the `users` table
  - Has an associated record in the `customers` table (via `Client` model)
- **Middleware**: `isClient` checks if `req.user.client` exists
- **Access**: Client-specific endpoints and features

### 2. **Professionals**
- **Identification**:
  - `user_type = 2` in the `users` table
  - Has an associated record in the `employees` table (via `Professional` model)
- **Middleware**: `isProfessional` checks if `req.user.professional` exists and is validated
- **Access**: Professional-specific endpoints and features

### 3. **Admins**
- **Identification**:
  - Email contains 'admin' (case-insensitive) **OR**
  - `is_admin = true` in the `users` table
- **Middleware**: `isAdmin` checks both conditions
- **Access**: Admin panel and admin-only endpoints

## Admin Panel Protection

The admin panel now enforces admin-only access:

1. **ProtectedRoute Component**: Checks if the logged-in user is an admin before allowing access
2. **Backend Middleware**: All admin routes use `isAdmin` middleware
3. **Login Validation**: Non-admin users are redirected with an error message

## Setting Up Admin Users

### Option 1: Run the Migration Script
```bash
cd Node_Backend
node scripts/add-is-admin-column.js
```

This will:
- Add the `is_admin` column to the `users` table
- Automatically mark existing users with 'admin' in their email as admins

### Option 2: Run Sequelize Migration
```bash
cd Node_Backend
npx sequelize-cli db:migrate
```

### Option 3: Manually Set Admin Flag
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'admin@test.com';
```

## Default Admin Credentials

- **Email**: `admin@test.com`
- **Password**: `password123`

After running the migration, this user will automatically be marked as an admin (because the email contains 'admin').

## Creating New Admin Users

1. **Via Database**:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'newadmin@example.com';
   ```

2. **Via Registration** (if you modify the registration to accept admin flag):
   - Currently, registration doesn't support setting admin flag directly
   - Admins must be created/updated manually in the database

## Security Notes

- The admin check uses **OR** logic: email contains 'admin' **OR** `is_admin = true`
- This means any user with 'admin' in their email is automatically an admin
- For production, consider:
  - Removing the email-based check
  - Using only the `is_admin` flag
  - Adding role-based access control (RBAC) for more granular permissions



