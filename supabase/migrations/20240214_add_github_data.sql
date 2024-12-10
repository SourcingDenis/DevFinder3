-- Add github_data and updated_at columns
ALTER TABLE saved_profiles
ADD COLUMN IF NOT EXISTS github_data JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
