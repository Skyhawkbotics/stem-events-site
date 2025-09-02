# Dashboard

The dashboard is a protected page that displays scrimmages owned by the authenticated user.

## Features

### Authentication
- **Protected Route**: Only authenticated users can access the dashboard
- **Auto-redirect**: Unauthenticated users are redirected to `/auth/login`
- **User Context**: Displays personalized welcome message with user's email

### Scrimmage Management
- **Owned Scrimmages**: Shows all scrimmages where `scrimmage_owner` matches the current user ID
- **Status Indicators**: Visual badges showing if scrimmages are Past, Today, This Week, or Upcoming
- **Detailed View**: Each scrimmage card displays:
  - Title and description
  - Date and time (formatted for readability)
  - Location
  - Number of teams (if available)
  - Status badge
  - Action buttons (View Details, Edit)

### Statistics Overview
- **Total Scrimmages**: Count of all owned scrimmages
- **Upcoming Scrimmages**: Count of future scrimmages
- **Past Scrimmages**: Count of completed scrimmages

### Quick Actions
- **Create Scrimmage**: Direct link to create new scrimmages
- **Browse Events**: Link to STEM events list
- **Join Scrimmages**: Link to find scrimmages to join

### Empty State
- **No Scrimmages**: Helpful message and call-to-action when user has no scrimmages
- **Guidance**: Clear instructions on how to get started

## Technical Implementation

### Database Queries
```typescript
// Fetch user's owned scrimmages
const { data: ownedScrimmages } = await supabase
  .from("scrimmages")
  .select("*")
  .eq("scrimmage_owner", user.id)
  .order("scrimmage_date", { ascending: true });
```

### Authentication Flow
1. Check if user is authenticated via Supabase auth
2. Redirect to login if not authenticated
3. Fetch scrimmages using user ID as filter
4. Display personalized dashboard content

### UI Components
- **Cards**: Used for statistics and scrimmage display
- **Badges**: Status indicators with different variants
- **Responsive Grid**: Adapts to different screen sizes
- **Dark Mode Support**: Compatible with theme switching

## File Structure
```
site/app/dashboard/
└── page.tsx          # Main dashboard page
```

## Dependencies
- `@/lib/supabase/server` - Server-side Supabase client
- `@/components/ui/card` - Card UI components
- `@/components/ui/badge` - Badge UI components
- `@/components/navbar` - Navigation component
- `@/components/footer` - Footer component

## Future Enhancements
- Edit functionality for existing scrimmages
- Delete scrimmages with confirmation
- Team management for scrimmages
- Analytics and insights
- Calendar view of scrimmages
- Email notifications for upcoming scrimmages
