-- Drop existing policies if they exist
drop policy if exists "Allow all operations for authenticated users" on public.enriched_emails;
drop policy if exists "Authenticated users can read enriched emails" on public.enriched_emails;
drop policy if exists "Users can insert enriched emails" on public.enriched_emails;
drop policy if exists "Authenticated users can update enriched emails" on public.enriched_emails;
drop policy if exists "Users can update their own enriched emails" on public.enriched_emails;

-- Drop existing table
drop table if exists public.enriched_emails;

-- Create simple table structure
create table public.enriched_emails (
  id uuid default gen_random_uuid() primary key,
  github_username text not null,
  email text not null,
  enriched_by uuid references auth.users(id),
  source text check (source in ('github_commit', 'github_profile', 'manual', 'generated')) not null
);

-- Enable RLS
alter table public.enriched_emails enable row level security;

-- Simple policy for authenticated users
create policy "Allow all operations for authenticated users"
  on public.enriched_emails
  for all
  to authenticated
  using (true)
  with check (true);
