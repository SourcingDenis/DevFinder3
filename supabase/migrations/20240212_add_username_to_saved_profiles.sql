-- Add username column to saved_profiles
ALTER TABLE saved_profiles 
ADD COLUMN username TEXT;

-- Create an index for faster username lookups
CREATE INDEX idx_saved_profiles_username ON saved_profiles(username);

-- Update policy to include username
CREATE POLICY "Users can manage their saved profile usernames" ON saved_profiles
    FOR UPDATE USING (auth.uid() = user_id);
