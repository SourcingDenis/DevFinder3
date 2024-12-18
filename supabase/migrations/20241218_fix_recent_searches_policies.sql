-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own recent searches" ON public.recent_searches;
DROP POLICY IF EXISTS "Users can insert their own recent searches" ON public.recent_searches;
DROP POLICY IF EXISTS "Users can delete their own recent searches" ON public.recent_searches;

-- Create updated policies
CREATE POLICY "Users can view their own recent searches"
    ON public.recent_searches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent searches"
    ON public.recent_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent searches"
    ON public.recent_searches FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger to automatically set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_id_on_insert ON public.recent_searches;
CREATE TRIGGER set_user_id_on_insert
    BEFORE INSERT ON public.recent_searches
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();
