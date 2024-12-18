-- Create saved_searches table if not exists
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    search_params jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Create recent_searches table if not exists
CREATE TABLE IF NOT EXISTS public.recent_searches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    query text NOT NULL,
    search_params jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_searches if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'saved_searches' 
        AND policyname = 'Users can view their own saved searches'
    ) THEN
        CREATE POLICY "Users can view their own saved searches" 
            ON public.saved_searches FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'saved_searches' 
        AND policyname = 'Users can insert their own saved searches'
    ) THEN
        CREATE POLICY "Users can insert their own saved searches" 
            ON public.saved_searches FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'saved_searches' 
        AND policyname = 'Users can update their own saved searches'
    ) THEN
        CREATE POLICY "Users can update their own saved searches" 
            ON public.saved_searches FOR UPDATE 
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'saved_searches' 
        AND policyname = 'Users can delete their own saved searches'
    ) THEN
        CREATE POLICY "Users can delete their own saved searches" 
            ON public.saved_searches FOR DELETE 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create policies for recent_searches if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'recent_searches' 
        AND policyname = 'Users can view their own recent searches'
    ) THEN
        CREATE POLICY "Users can view their own recent searches" 
            ON public.recent_searches FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'recent_searches' 
        AND policyname = 'Users can insert their own recent searches'
    ) THEN
        CREATE POLICY "Users can insert their own recent searches" 
            ON public.recent_searches FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'recent_searches' 
        AND policyname = 'Users can delete their own recent searches'
    ) THEN
        CREATE POLICY "Users can delete their own recent searches" 
            ON public.recent_searches FOR DELETE 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create or replace the function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'handle_saved_searches_updated_at'
    ) THEN
        CREATE TRIGGER handle_saved_searches_updated_at
            BEFORE UPDATE ON public.saved_searches
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'handle_recent_searches_updated_at'
    ) THEN
        CREATE TRIGGER handle_recent_searches_updated_at
            BEFORE UPDATE ON public.recent_searches
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'saved_searches' 
        AND indexname = 'idx_saved_searches_user_id'
    ) THEN
        CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'recent_searches' 
        AND indexname = 'idx_recent_searches_user_id'
    ) THEN
        CREATE INDEX idx_recent_searches_user_id ON public.recent_searches(user_id);
    END IF;
END $$;

-- Add indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'recent_searches' AND indexname = 'idx_recent_searches_created_at') THEN
        CREATE INDEX idx_recent_searches_created_at ON public.recent_searches(created_at DESC);
    END IF;
END $$;

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'handle_saved_searches_updated_at'
    ) THEN
        CREATE TRIGGER handle_saved_searches_updated_at
            BEFORE UPDATE ON public.saved_searches
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'handle_recent_searches_updated_at'
    ) THEN
        CREATE TRIGGER handle_recent_searches_updated_at
            BEFORE UPDATE ON public.recent_searches
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Add function to limit recent searches if not exists
CREATE OR REPLACE FUNCTION public.limit_recent_searches()
RETURNS trigger AS $$
BEGIN
    -- Delete old searches if count exceeds 50
    DELETE FROM public.recent_searches
    WHERE id IN (
        SELECT id
        FROM public.recent_searches
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        OFFSET 50
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to limit recent searches if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'limit_recent_searches_trigger'
    ) THEN
        CREATE TRIGGER limit_recent_searches_trigger
            AFTER INSERT ON public.recent_searches
            FOR EACH ROW
            EXECUTE FUNCTION public.limit_recent_searches();
    END IF;
END $$;
