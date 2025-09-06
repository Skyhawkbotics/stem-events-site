# Quick Setup Guide: Scrimmage Registration System

## Prerequisites
- Supabase project with authentication enabled
- Existing `scrimmages` table with the following columns:
  - `id` (UUID, primary key)
  - `title` (TEXT)
  - `scrimmage_description` (TEXT)
  - `scrimmage_date` (TIMESTAMP)
  - `location` (TEXT)
  - `number_teams` (INTEGER or TEXT)
  - `scrimmage_owner` (UUID, references auth.users)

## Step 1: Database Setup

### Option A: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/migrations/001_create_scrimmage_registrations.sql`
4. Click **Run** to execute the migration

### Option B: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 2: Verify Table Creation
1. Go to **Table Editor** in your Supabase dashboard
2. Confirm `scrimmage_registrations` table exists
3. Check that RLS is enabled
4. Verify the policies are created

## Step 3: Test the System

### Test Team Registration
1. Create a test scrimmage with `number_teams` set to a small number (e.g., 2)
2. Log in as a different user
3. Navigate to the scrimmage detail page
4. Try to sign up for the scrimmage
5. Verify the registration appears in the database

### Test Owner Management
1. Log in as the scrimmage owner
2. Navigate to the scrimmage detail page
3. Verify you can see the registration management interface
4. Test approving/rejecting registrations

## Step 4: Verify Components

The following components should now be available:
- ✅ `ScrimmageSignup` - Team registration form
- ✅ `ScrimmageRegistrations` - Owner management interface
- ✅ Updated scrimmage detail page
- ✅ Updated scrimmage listing page

## Common Issues & Solutions

### Issue: "Table doesn't exist" error
**Solution**: Run the SQL migration file in Supabase SQL Editor

### Issue: "RLS policy violation" error
**Solution**: Check that RLS policies were created correctly in the migration

### Issue: Registration not appearing
**Solution**: Verify the user is authenticated and check RLS policies

### Issue: Can't approve registrations
**Solution**: Ensure the user is the scrimmage owner (`scrimmage_owner` field matches user ID)

## Testing Checklist

- [ ] Database table created successfully
- [ ] RLS policies active
- [ ] Team can register for scrimmage
- [ ] Owner can see registration
- [ ] Owner can approve/reject registration
- [ ] Available spots update correctly
- [ ] Full scrimmages show correct status
- [ ] Users can't register twice for same scrimmage
- [ ] Users can cancel pending registrations

## Next Steps

After successful setup:
1. Test with real users and data
2. Customize the UI components as needed
3. Consider adding email notifications
4. Monitor performance and adjust indexes if needed

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase RLS policies
3. Test with different user accounts
4. Review the detailed README in `SCRIMMAGE_REGISTRATION_README.md`
