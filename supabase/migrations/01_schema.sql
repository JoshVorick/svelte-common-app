-- Roles enum
create type membership_role as enum ('owner','admin','member');

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Org membership (user ↔ org + role)
create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role membership_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Example tenant-scoped table (copy pattern for your data)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index on public.organization_members (user_id, organization_id);
create index on public.projects (organization_id);

-- Helper to get current auth user id
create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select auth.uid()
$$;

-- ========= RLS =========
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;

-- Organizations: members of org can SELECT it
create policy org_select
on public.organizations
for select
to authenticated
using (exists (
  select 1 from public.organization_members m
  where m.organization_id = organizations.id
    and m.user_id = auth.uid()
));

-- Organizations: no direct insert/update/delete; use RPC below
create policy org_block_iud on public.organizations
for all to authenticated using (false) with check (false);

-- Members: user can see memberships of orgs they belong to
create policy mem_select
on public.organization_members
for select
to authenticated
using (exists (
  select 1 from public.organization_members mm
  where mm.organization_id = organization_members.organization_id
    and mm.user_id = auth.uid()
));

-- Members: only Owner/Admin can add/remove/change members in their org
create policy mem_insert
on public.organization_members
for insert
to authenticated
with check (exists (
  select 1 from public.organization_members mm
  where mm.organization_id = organization_members.organization_id
    and mm.user_id = auth.uid()
    and mm.role in ('owner','admin')
));

create policy mem_update
on public.organization_members
for update
to authenticated
using (exists (
  select 1 from public.organization_members mm
  where mm.organization_id = organization_members.organization_id
    and mm.user_id = auth.uid()
    and mm.role in ('owner','admin')
))
with check (exists (
  select 1 from public.organization_members mm
  where mm.organization_id = organization_members.organization_id
    and mm.user_id = auth.uid()
    and mm.role in ('owner','admin')
));

create policy mem_delete
on public.organization_members
for delete
to authenticated
using (exists (
  select 1 from public.organization_members mm
  where mm.organization_id = organization_members.organization_id
    and mm.user_id = auth.uid()
    and mm.role in ('owner','admin')
));

-- Projects: org members can SELECT; any org member can INSERT/UPDATE/DELETE within their org
create policy proj_select
on public.projects
for select to authenticated
using (exists (
  select 1 from public.organization_members m
  where m.organization_id = projects.organization_id
    and m.user_id = auth.uid()
));

create policy proj_insert
on public.projects
for insert to authenticated
with check (exists (
  select 1 from public.organization_members m
  where m.organization_id = projects.organization_id
    and m.user_id = auth.uid()
));

create policy proj_update
on public.projects
for update to authenticated
using (exists (
  select 1 from public.organization_members m
  where m.organization_id = projects.organization_id
    and m.user_id = auth.uid()
))
with check (exists (
  select 1 from public.organization_members m
  where m.organization_id = projects.organization_id
    and m.user_id = auth.uid()
));

create policy proj_delete
on public.projects
for delete to authenticated
using (exists (
  select 1 from public.organization_members m
  where m.organization_id = projects.organization_id
    and m.user_id = auth.uid()
));

-- ========= RPCs (SECURITY DEFINER) for safe org/admin ops =========

-- 1) Create org and make caller the Owner
create or replace function public.create_organization(p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations;
begin
  insert into public.organizations (name) values (p_name)
  returning * into v_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org.id, auth.uid(), 'owner');

  return v_org;
end;
$$;

revoke all on function public.create_organization(text) from public;
grant execute on function public.create_organization(text) to authenticated;

-- 2) Add member to org (caller must be Owner/Admin)
create or replace function public.add_member(p_org uuid, p_user uuid, p_role membership_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_org and user_id = auth.uid() and role in ('owner','admin')
  ) then
    raise exception 'Not permitted';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (p_org, p_user, p_role)
  on conflict (organization_id, user_id) do update set role = excluded.role;
end;
$$;

revoke all on function public.add_member(uuid, uuid, membership_role) from public;
grant execute on function public.add_member(uuid, uuid, membership_role) to authenticated;