-- Create user_tokens table
create table if not exists public.user_tokens (
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

-- Set up RLS policies
alter table public.user_tokens enable row level security;

create policy "Users can view their own tokens"
    on public.user_tokens for select
    using (auth.uid() = user_id);

create policy "Users can insert their own tokens"
    on public.user_tokens for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tokens"
    on public.user_tokens for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Function to update updated_at on token updates
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at
create trigger handle_updated_at
    before update on public.user_tokens
    for each row
    execute function public.handle_updated_at();
