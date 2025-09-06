-- Database Structure Diagnostic Script
-- Run this first to understand your current setup

-- Check what tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if scrimmages table exists and its structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scrimmages') THEN
        RAISE NOTICE '✅ Table "scrimmages" exists';
        
        -- Show scrimmages table structure
        RAISE NOTICE 'Scrimmages table columns:';
        FOR col IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'scrimmages'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: % (nullable: %, default: %)', 
                col.column_name, col.data_type, col.is_nullable, col.column_default;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Table "scrimmages" does NOT exist';
    END IF;
END $$;

-- Check if auth.users table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE NOTICE '✅ Table "auth.users" exists';
        
        -- Show auth.users table structure
        RAISE NOTICE 'Auth users table columns:';
        FOR col IN 
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: % (nullable: %)', 
                col.column_name, col.data_type, col.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Table "auth.users" does NOT exist';
        RAISE NOTICE '💡 This suggests Supabase auth is not set up or you are not in the right schema';
    END IF;
END $$;

-- Check if scrimmage_registrations table already exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scrimmage_registrations') THEN
        RAISE NOTICE '⚠️ Table "scrimmage_registrations" already exists';
        RAISE NOTICE '💡 You may need to drop it first or the migration will fail';
    ELSE
        RAISE NOTICE '✅ Table "scrimmage_registrations" does not exist - ready for creation';
    END IF;
END $$;

-- Check for any existing foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('scrimmages', 'scrimmage_registrations');

-- Check RLS status on existing tables
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scrimmages') THEN
        IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'scrimmages') THEN
            RAISE NOTICE '✅ RLS is enabled on scrimmages table';
        ELSE
            RAISE NOTICE '⚠️ RLS is NOT enabled on scrimmages table';
        END IF;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scrimmage_registrations') THEN
        IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'scrimmage_registrations') THEN
            RAISE NOTICE '✅ RLS is enabled on scrimmage_registrations table';
        ELSE
            RAISE NOTICE '⚠️ RLS is NOT enabled on scrimmage_registrations table';
        END IF;
    END IF;
END $$;

-- Summary and recommendations
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DIAGNOSTIC SUMMARY ===';
    RAISE NOTICE 'Run this script first to understand your database structure.';
    RAISE NOTICE 'Then run the migration script to create the scrimmage_registrations table.';
    RAISE NOTICE 'If you see any ❌ errors above, fix those issues first.';
    RAISE NOTICE 'If you see ⚠️ warnings, the migration may still work but check the output.';
    RAISE NOTICE '=== END DIAGNOSTIC ===';
END $$;
