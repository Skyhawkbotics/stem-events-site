# Scrimmage Registration System

This document describes the new scrimmage registration system that allows teams to sign up for scrimmages and scrimmage owners to manage team registrations.

## Features

### For Teams
- **Sign up for scrimmages**: Teams can register with team name, contact info, size, and description
- **Registration status tracking**: View pending, approved, or rejected status
- **Cancel registrations**: Teams can cancel pending registrations
- **Duplicate prevention**: Users can only register once per scrimmage

### For Scrimmage Owners
- **Manage registrations**: View all team registrations for their scrimmages
- **Approve/Reject teams**: Accept or decline team applications
- **Registration overview**: See total spots, approved teams, pending applications, and available spots
- **Full control**: Can revoke approvals, delete registrations, and manage capacity

### For All Users
- **Real-time availability**: See available spots on scrimmage listings
- **Visual indicators**: Full scrimmages are clearly marked
- **Responsive design**: Works on all device sizes

## Database Schema

### scrimmage_registrations Table
```sql
CREATE TABLE scrimmage_registrations (
    id UUID PRIMARY KEY,
    scrimmage_id UUID REFERENCES scrimmages(id),
    team_name TEXT NOT NULL,
    team_contact TEXT NOT NULL,
    team_size INTEGER NOT NULL,
    team_description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features
- **Referential integrity**: Links to scrimmages and users with cascade deletes
- **Status validation**: Only allows valid status values
- **Team size limits**: Prevents unrealistic team sizes (1-50 members)
- **Timestamps**: Automatic creation and update tracking
- **Row Level Security**: Comprehensive access control policies

## Setup Instructions

### 1. Database Migration
Run the SQL migration file to create the required table:
```bash
# Copy the migration file to your Supabase SQL editor
# Or run it via your preferred database management tool
```

### 2. Row Level Security
The migration automatically sets up RLS policies:
- Users can only see their own registrations
- Scrimmage owners can see all registrations for their events
- Users can only modify their own pending registrations
- Scrimmage owners have full control over registrations

### 3. Component Integration
The system includes these new components:
- `ScrimmageSignup`: Team registration form
- `ScrimmageRegistrations`: Management interface for owners
- Updated scrimmage detail and listing pages

## Usage Flow

### Team Registration Process
1. **Browse scrimmages**: View available spots on the scrimmage listing page
2. **Select scrimmage**: Click on a scrimmage to view details
3. **Sign up**: Click "Sign Up for Scrimmage" button
4. **Fill form**: Provide team information (name, contact, size, description)
5. **Submit**: Registration is created with "pending" status
6. **Wait for approval**: Scrimmage owner reviews and approves/rejects

### Scrimmage Owner Management
1. **View registrations**: Access management interface on owned scrimmages
2. **Review applications**: See team details and registration status
3. **Approve/Reject**: Accept or decline team applications
4. **Monitor capacity**: Track available spots and registration counts
5. **Manage existing**: Revoke approvals or delete registrations as needed

## Component Details

### ScrimmageSignup Component
- **Location**: `/components/scrimmage-signup.tsx`
- **Purpose**: Team registration form and status display
- **Features**:
  - Modal-based signup form
  - Duplicate registration prevention
  - Real-time availability checking
  - Status display for existing registrations
  - Registration cancellation for pending applications

### ScrimmageRegistrations Component
- **Location**: `/components/scrimmage-registrations.tsx`
- **Purpose**: Registration management for scrimmage owners
- **Features**:
  - Registration summary dashboard
  - Individual registration management
  - Status updates (approve/reject/revoke)
  - Registration deletion
  - Real-time updates

## Security Features

### Row Level Security (RLS)
- **User isolation**: Users can only see their own registrations
- **Owner access**: Scrimmage owners can manage all registrations for their events
- **Status restrictions**: Users can only modify pending registrations
- **Cascade protection**: Deleted scrimmages automatically remove registrations

### Data Validation
- **Input sanitization**: All user inputs are validated and sanitized
- **Status constraints**: Only valid status values are allowed
- **Size limits**: Team sizes are constrained to reasonable ranges
- **Unique constraints**: Prevents duplicate registrations

## UI/UX Features

### Visual Indicators
- **Available spots**: Green text for available spots, red for full events
- **Status badges**: Color-coded registration status indicators
- **Full scrimmages**: Grayed-out appearance for full events
- **Responsive design**: Works seamlessly on mobile and desktop

### User Experience
- **Real-time updates**: Registration changes update immediately
- **Clear feedback**: Success/error messages for all actions
- **Confirmation dialogs**: Important actions require confirmation
- **Loading states**: Visual feedback during async operations

## API Endpoints

The system uses Supabase's built-in API with these operations:

### Read Operations
- `GET /scrimmage_registrations?scrimmage_id=eq.{id}` - Get registrations for a scrimmage
- `GET /scrimmage_registrations?user_id=eq.{id}` - Get user's registrations

### Write Operations
- `POST /scrimmage_registrations` - Create new registration
- `PATCH /scrimmage_registrations?id=eq.{id}` - Update registration status
- `DELETE /scrimmage_registrations?id=eq.{id}` - Delete registration

## Error Handling

### Common Scenarios
- **Duplicate registration**: User already registered for scrimmage
- **Full scrimmage**: No available spots remaining
- **Unauthorized access**: User doesn't have permission for action
- **Validation errors**: Invalid input data
- **Network issues**: Connection problems during operations

### User Feedback
- **Clear error messages**: Specific information about what went wrong
- **Success confirmations**: Positive feedback for completed actions
- **Loading indicators**: Visual feedback during processing
- **Graceful degradation**: System continues working even with errors

## Future Enhancements

### Potential Features
- **Email notifications**: Notify teams of approval/rejection
- **Waitlist system**: Queue teams when scrimmages are full
- **Team profiles**: Reusable team information across registrations
- **Bulk operations**: Approve/reject multiple registrations at once
- **Registration analytics**: Track registration patterns and trends
- **Integration**: Connect with external team management systems

### Technical Improvements
- **Real-time updates**: WebSocket integration for live updates
- **Offline support**: Service worker for offline functionality
- **Advanced filtering**: Search and filter registrations
- **Export functionality**: Download registration data
- **Audit logging**: Track all registration changes

## Troubleshooting

### Common Issues
1. **Registration not appearing**: Check RLS policies and user permissions
2. **Status not updating**: Verify user has appropriate access rights
3. **Duplicate registrations**: Check unique constraint implementation
4. **Performance issues**: Ensure database indexes are properly created

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify Supabase RLS policies are active
3. Confirm database table structure matches migration
4. Test with different user accounts and roles
5. Check network requests in browser dev tools

## Support

For technical support or feature requests:
1. Check the component documentation
2. Review the database schema and policies
3. Test with different user scenarios
4. Consult the Supabase documentation for RLS and policies

---

**Note**: This system requires Supabase with Row Level Security enabled and proper user authentication setup.
