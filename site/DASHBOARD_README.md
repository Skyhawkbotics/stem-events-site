# Dashboard

The dashboard is a protected page that displays both **Events** and **Scrimmages** owned by the authenticated user in a unified, aesthetically pleasing interface.

## Features

### Authentication
- **Protected Route**: Only authenticated users can access the dashboard
- **Auto-redirect**: Unauthenticated users are redirected to `/auth/login`
- **User Context**: Displays personalized welcome message with user's email

### Unified Content Management
- **Events & Scrimmages**: Shows all events and scrimmages where the user is the owner
- **Smart Organization**: Content is grouped by type with clear visual separation
- **Type Indicators**: Color-coded badges and borders to distinguish between events and scrimmages
- **Status Indicators**: Visual badges showing if items are Past, Today, This Week, or Upcoming

### Enhanced Statistics Overview
- **Total Items**: Combined count of all owned events and scrimmages
- **Upcoming Items**: Count of future events and scrimmages
- **Past Items**: Count of completed events and scrimmages
- **Scrimmages Count**: Dedicated count of owned scrimmages
- **Gradient Cards**: Beautiful gradient backgrounds with color-coded themes

### Content Display
Each content item displays:
- **Type Badge**: Clear identification as Event or Scrimmage
- **Status Badge**: Time-based status (Past, Today, This Week, Upcoming)
- **Title and Description**: Full content details
- **Date and Time**: Formatted for readability
- **Location**: Where applicable
- **Action Buttons**: View Details and Edit options

### Visual Design
- **Color Coding**: Blue for scrimmages, green for events
- **Left Border Accents**: Color-coded left borders for quick type identification
- **Gradient Backgrounds**: Subtle gradients for statistics cards
- **Hover Effects**: Smooth transitions and shadow effects
- **Icon Integration**: Relevant icons for each content type

### Quick Actions
- **Create Scrimmage**: Direct link to create new scrimmages
- **Create Event**: Direct link to create new STEM events
- **Join Scrimmages**: Link to find scrimmages to join
- **Enhanced UI**: Color-coded action cards with hover effects

### Empty State
- **No Content**: Helpful message when user has no events or scrimmages
- **Dual Call-to-Action**: Buttons for both scrimmage and event creation
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

// Fetch user's owned events
const { data: ownedEvents } = await supabase
  .from("events")
  .select("*")
  .eq("event_owner", user.id)
  .order("eventTime", { ascending: true });
```

### Authentication Flow
1. Check if user is authenticated via Supabase auth
2. Redirect to login if not authenticated
3. Fetch both scrimmages and events using user ID as filter
4. Display unified dashboard content

### UI Components
- **Cards**: Used for statistics, content display, and quick actions
- **Badges**: Type and status indicators with custom styling
- **Responsive Grid**: Adapts to different screen sizes
- **Gradient Backgrounds**: Subtle color themes for visual appeal
- **Dark Mode Support**: Compatible with theme switching

## File Structure
```
site/app/dashboard/
└── page.tsx          # Main dashboard page with unified content
```

## Dependencies
- `@/lib/supabase/server` - Server-side Supabase client
- `@/components/ui/card` - Card UI components
- `@/components/ui/badge` - Badge UI components
- `@/components/navbar` - Navigation component
- `@/components/footer` - Footer component

## Color Scheme
- **Blue (#3B82F6)**: Scrimmages and related elements
- **Green (#10B981)**: Events and related elements
- **Purple (#8B5CF6)**: Scrimmage statistics
- **Gray**: Neutral elements and past items

## Future Enhancements
- Edit functionality for existing events and scrimmages
- Delete functionality with confirmation dialogs
- Team management for scrimmages
- Event registration and attendee management
- Analytics and insights dashboard
- Calendar view of all content
- Email notifications for upcoming items
- Content filtering and search
- Bulk actions for multiple items
