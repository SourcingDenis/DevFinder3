-- Enable RLS for user_emails table
ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for user_emails
CREATE POLICY "Users can view their own email data"
    ON public.user_emails FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email data"
    ON public.user_emails FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email data"
    ON public.user_emails FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email data"
    ON public.user_emails FOR DELETE
    USING (auth.uid() = user_id);

-- Enable RLS for user_tokens_backup table
ALTER TABLE public.user_tokens_backup ENABLE ROW LEVEL SECURITY;

-- Create policies for user_tokens_backup
CREATE POLICY "Users can view their own token backups"
    ON public.user_tokens_backup FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token backups"
    ON public.user_tokens_backup FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own token backups"
    ON public.user_tokens_backup FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own token backups"
    ON public.user_tokens_backup FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger to automatically set user_id on insert for both tables
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to user_emails
DROP TRIGGER IF EXISTS set_user_id_on_insert_emails ON public.user_emails;
CREATE TRIGGER set_user_id_on_insert_emails
    BEFORE INSERT ON public.user_emails
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

-- Add triggers to user_tokens_backup
DROP TRIGGER IF EXISTS set_user_id_on_insert_tokens_backup ON public.user_tokens_backup;
CREATE TRIGGER set_user_id_on_insert_tokens_backup
    BEFORE INSERT ON public.user_tokens_backup
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();
