-- First, let's check what tables exist and their structure
-- This will help us create the right foreign key constraints

-- Check if scrimmages table exists and get its structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scrimmages') THEN
        RAISE EXCEPTION 'Table "scrimmages" does not exist. Please create it first or check the table name.';
    END IF;
END $$;

-- Check if auth.users table exists (for Supabase auth)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE EXCEPTION 'Table "auth.users" does not exist. This suggests Supabase auth is not set up.';
    END IF;
END $$;

-- Create scrimmage_registrations table with flexible foreign key handling
CREATE TABLE IF NOT EXISTS scrimmage_registrations (
    id SERIAL PRIMARY KEY,
    scrimmage_id INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    team_contact TEXT NOT NULL,
    team_size INTEGER NOT NULL CHECK (team_size > 0 AND team_size <= 50),
    team_description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Try to add foreign key constraints, but handle errors gracefully
DO $$
BEGIN
    -- Try to add scrimmage_id foreign key
    BEGIN
        ALTER TABLE scrimmage_registrations 
        ADD CONSTRAINT fk_scrimmage_registrations_scrimmage_id 
        FOREIGN KEY (scrimmage_id) REFERENCES scrimmages(id) ON DELETE CASCADE;
        RAISE NOTICE 'Successfully added scrimmage_id foreign key constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add scrimmage_id foreign key: %', SQLERRM;
        RAISE NOTICE 'This might be due to column type mismatch. Check that scrimmages.id is INTEGER type.';
    END;

    -- Try to add user_id foreign key
    BEGIN
        ALTER TABLE scrimmage_registrations 
        ADD CONSTRAINT fk_scrimmage_registrations_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Successfully added user_id foreign key constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add user_id foreign key: %', SQLERRM;
        RAISE NOTICE 'This might be due to auth.users table structure issues.';
    END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scrimmage_registrations_scrimmage_id ON scrimmage_registrations(scrimmage_id);
CREATE INDEX IF NOT EXISTS idx_scrimmage_registrations_user_id ON scrimmage_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_scrimmage_registrations_status ON scrimmage_registrations(status);
CREATE INDEX IF NOT EXISTS idx_scrimmage_registrations_created_at ON scrimmage_registrations(created_at);

-- Create unique constraint to prevent duplicate registrations from the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_scrimmage_registrations_unique_user_scrimmage 
ON scrimmage_registrations(user_id, scrimmage_id);

-- Enable Row Level Security (RLS)
ALTER TABLE scrimmage_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with error handling
DO $$
BEGIN
    -- Users can view registrations for scrimmages they own
    BEGIN
        CREATE POLICY "Users can view registrations for their own scrimmages" ON scrimmage_registrations
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM scrimmages 
                    WHERE scrimmages.id = scrimmage_registrations.scrimmage_id 
                    AND scrimmages.scrimmage_owner = auth.uid()
                )
            );
        RAISE NOTICE 'Successfully created policy: Users can view registrations for their own scrimmages';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Users can view registrations for their own scrimmages": %', SQLERRM;
    END;

    -- Users can view their own registrations
    BEGIN
        CREATE POLICY "Users can view their own registrations" ON scrimmage_registrations
            FOR SELECT USING (user_id = auth.uid());
        RAISE NOTICE 'Successfully created policy: Users can view their own registrations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Users can view their own registrations": %', SQLERRM;
    END;

    -- Users can insert their own registrations
    BEGIN
        CREATE POLICY "Users can insert their own registrations" ON scrimmage_registrations
            FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Successfully created policy: Users can insert their own registrations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Users can insert their own registrations": %', SQLERRM;
    END;

    -- Users can update their own registrations (only if status is pending)
    BEGIN
        CREATE POLICY "Users can update their own pending registrations" ON scrimmage_registrations
            FOR UPDATE USING (
                user_id = auth.uid() AND status = 'pending'
            );
        RAISE NOTICE 'Successfully created policy: Users can update their own pending registrations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Users can update their own pending registrations": %', SQLERRM;
    END;

    -- Users can delete their own registrations (only if status is pending)
    BEGIN
        CREATE POLICY "Users can delete their own pending registrations" ON scrimmage_registrations
            FOR DELETE USING (
                user_id = auth.uid() AND status = 'pending'
            );
        RAISE NOTICE 'Successfully created policy: Users can delete their own pending registrations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Users can delete their own pending registrations": %', SQLERRM;
    END;

    -- Scrimmage owners can update any registration for their scrimmages
    BEGIN
        CREATE POLICY "Scrimmage owners can update registrations" ON scrimmage_registrations
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM scrimmages 
                    WHERE scrimmages.id = scrimmage_registrations.scrimmage_id 
                    AND scrimmages.scrimmage_owner = auth.uid()
                )
            );
        RAISE NOTICE 'Successfully created policy: Scrimmage owners can update registrations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Scrimmage owners can update registrations": %', SQLERRM;
    END;

    -- Scrimmage owners can delete any registration for their scrimmages
    BEGIN
        CREATE POLICY "Scrimmage owners can delete registrations" ON scrimmage_registrations
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM scrimmages 
                    WHERE scrimmages.id = scrimmage_registrations.scrimmage_id 
                    AND scrimmages.scrimmage_owner = auth.uid()
                )
            );
        RAISE NOTICE 'Successfully created policy: Scrimmage owners can delete registrations';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create policy "Scrimmage owners can delete registrations": %', SQLERRM;
    END;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_scrimmage_registrations_updated_at 
    BEFORE UPDATE ON scrimmage_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Final status message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed! Check the notices above for any issues.';
    RAISE NOTICE 'If foreign key constraints failed, the table will still work but without referential integrity.';
    RAISE NOTICE 'You can manually add constraints later once the table structures are compatible.';
END $$;
