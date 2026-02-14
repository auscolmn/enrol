-- ============================================
-- ENROL Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- WORKSPACES
-- ============================================
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FORMS
-- ============================================
create table forms (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  title text not null,
  description text,
  slug text not null,
  fields jsonb default '[]' not null,
  settings jsonb default '{}',
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, slug)
);

-- ============================================
-- PIPELINE STAGES
-- ============================================
create table pipeline_stages (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references forms(id) on delete cascade not null,
  name text not null,
  slug text not null,
  color text default '#6B7280',
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(form_id, slug)
);

-- ============================================
-- SUBMISSIONS (Applicants)
-- ============================================
create table submissions (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references forms(id) on delete cascade not null,
  stage_id uuid references pipeline_stages(id),
  data jsonb not null,
  notes text,
  email text,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- STAGE HISTORY (Audit Trail)
-- ============================================
create table stage_history (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references submissions(id) on delete cascade not null,
  from_stage_id uuid references pipeline_stages(id),
  to_stage_id uuid references pipeline_stages(id),
  changed_by uuid references auth.users(id),
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- FILES
-- ============================================
create table files (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references submissions(id) on delete cascade not null,
  field_id text not null,
  filename text not null,
  storage_path text not null,
  size_bytes integer,
  mime_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table workspaces enable row level security;
alter table forms enable row level security;
alter table pipeline_stages enable row level security;
alter table submissions enable row level security;
alter table stage_history enable row level security;
alter table files enable row level security;

-- Workspace policies
create policy "Users can manage own workspaces" on workspaces
  for all using (auth.uid() = owner_id);

-- Forms policies
create policy "Users can manage forms in own workspaces" on forms
  for all using (workspace_id in (
    select id from workspaces where owner_id = auth.uid()
  ));

-- Pipeline stages policies
create policy "Users can manage stages in own forms" on pipeline_stages
  for all using (form_id in (
    select f.id from forms f
    join workspaces w on f.workspace_id = w.id
    where w.owner_id = auth.uid()
  ));

-- Submissions policies (owner can manage)
create policy "Users can manage submissions in own forms" on submissions
  for all using (form_id in (
    select f.id from forms f
    join workspaces w on f.workspace_id = w.id
    where w.owner_id = auth.uid()
  ));

-- Public can submit to published forms
create policy "Anyone can submit to published forms" on submissions
  for insert with check (form_id in (
    select id from forms where published = true
  ));

-- Stage history policies
create policy "Users can view history in own submissions" on stage_history
  for all using (submission_id in (
    select s.id from submissions s
    join forms f on s.form_id = f.id
    join workspaces w on f.workspace_id = w.id
    where w.owner_id = auth.uid()
  ));

-- Files policies
create policy "Users can manage files in own submissions" on files
  for all using (submission_id in (
    select s.id from submissions s
    join forms f on s.form_id = f.id
    join workspaces w on f.workspace_id = w.id
    where w.owner_id = auth.uid()
  ));

-- ============================================
-- INDEXES
-- ============================================
create index idx_forms_workspace on forms(workspace_id);
create index idx_submissions_form on submissions(form_id);
create index idx_submissions_stage on submissions(stage_id);
create index idx_stage_history_submission on stage_history(submission_id);
create index idx_pipeline_stages_form on pipeline_stages(form_id);

-- ============================================
-- FUNCTION: Auto-create workspace on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.workspaces (name, slug, owner_id)
  values (
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    replace(lower(split_part(new.email, '@', 1)), '.', '-') || '-' || substr(gen_random_uuid()::text, 1, 4),
    new.id
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create workspace
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
