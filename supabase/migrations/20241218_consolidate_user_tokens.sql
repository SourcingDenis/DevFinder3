-- Drop the table if it exists (careful with this in production!)
DROP TABLE IF EXISTS public.user_tokens;

-- Create the table with the best features from both migrations
CREATE TABLE public.user_tokens (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    provider text not null,
    access_token text not null,
    refresh_token text,
    expires_at timestamptz not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Granular RLS policies
CREATE POLICY "Users can view their own tokens"
    ON public.user_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
    ON public.user_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
    ON public.user_tokens FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX idx_user_tokens_provider ON user_tokens(provider);

-- Verification queries
DO $$
BEGIN
    -- Verify table exists
    ASSERT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_tokens'
    ), 'Table user_tokens does not exist';

    -- Verify RLS is enabled
    ASSERT EXISTS (
        SELECT FROM pg_class 
        WHERE relname = 'user_tokens' 
        AND relrowsecurity = true
    ), 'RLS is not enabled on user_tokens';

    -- Verify policies exist
    ASSERT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'user_tokens' 
        AND policyname = 'Users can view their own tokens'
    ), 'Select policy is missing';

    ASSERT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'user_tokens' 
        AND policyname = 'Users can insert their own tokens'
    ), 'Insert policy is missing';

    ASSERT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'user_tokens' 
        AND policyname = 'Users can update their own tokens'
    ), 'Update policy is missing';

    -- Verify trigger exists
    ASSERT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'handle_updated_at'
    ), 'Updated_at trigger is missing';

    -- Verify indexes exist
    ASSERT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'user_tokens' 
        AND indexname = 'idx_user_tokens_user_id'
    ), 'User ID index is missing';

    ASSERT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'user_tokens' 
        AND indexname = 'idx_user_tokens_provider'
    ), 'Provider index is missing';

    RAISE NOTICE 'All verifications passed successfully';
END;
$$;
