-- First, drop the old constraint
ALTER TABLE saved_profiles DROP CONSTRAINT IF EXISTS saved_profiles_email_source_check;

-- Now update any existing data
UPDATE saved_profiles 
SET email_source = NULL 
WHERE email IS NULL;

UPDATE saved_profiles 
SET email_source = 'github_profile' 
WHERE email IS NOT NULL 
  AND (email_source NOT IN ('public_events_commit', 'github_profile', 'manual_input')
       OR email_source IS NULL);

-- Finally, add the new constraint
ALTER TABLE saved_profiles ADD CONSTRAINT saved_profiles_email_source_check 
    CHECK (
        (email IS NULL AND email_source IS NULL) OR
        (email IS NOT NULL AND email_source IN ('public_events_commit', 'github_profile', 'manual_input'))
    );
