-- Create user_emails table
CREATE TABLE user_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    source TEXT, -- Where the email was found/generated from
    confidence_score REAL, -- Optional: to track reliability of the email
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique emails per user
    UNIQUE(user_id, email)
);

-- Create an index for faster lookups
CREATE INDEX idx_user_emails_user_id ON user_emails(user_id);

-- Optional: Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_emails_modtime
BEFORE UPDATE ON user_emails
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
