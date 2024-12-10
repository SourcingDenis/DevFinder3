-- Add email column to saved_profiles
ALTER TABLE saved_profiles 
ADD COLUMN email TEXT;

-- Create an index for faster email lookups
CREATE INDEX idx_saved_profiles_email ON saved_profiles(email);

-- Update policy to allow email updates
CREATE POLICY "Users can update their saved profile emails" ON saved_profiles
    FOR UPDATE USING (auth.uid() = user_id);
