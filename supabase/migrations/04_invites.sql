-- Organization invites table
create table public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role membership_role not null default 'member',
  invited_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  
  -- Prevent duplicate pending invites for same email+org
  unique(organization_id, email, status) deferrable initially deferred
);

-- Index for efficient lookups
create index on public.organization_invites (token);
create index on public.organization_invites (email);
create index on public.organization_invites (organization_id, status);
create index on public.organization_invites (expires_at) where status = 'pending';

-- Enable RLS
alter table public.organization_invites enable row level security;

-- RLS Policies

-- Users can view invites for organizations they belong to
create policy "Members can view org invites"
on public.organization_invites
for select
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = auth.uid()
  )
);

-- Only admins/owners can create invites
create policy "Admins can create invites"
on public.organization_invites
for insert
to authenticated
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

-- Only admins/owners can update invites (e.g., cancel them)
create policy "Admins can update invites"
on public.organization_invites
for update
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

-- Anyone can view invites by token (for acceptance flow)
create policy "Anyone can view invite by token"
on public.organization_invites
for select
to anon, authenticated
using (true);

-- Function to create an invite with a secure token
create or replace function public.create_invite(
  p_organization_id uuid,
  p_email text,
  p_role membership_role default 'member'
)
returns public.organization_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.organization_invites;
  v_token text;
begin
  -- Check if caller can invite
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_organization_id 
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  ) then
    raise exception 'Not permitted to invite users to this organization';
  end if;

  -- Check if user is already a member
  if exists (
    select 1 from public.organization_members om
    join public.user_profiles up on up.id = om.user_id
    where om.organization_id = p_organization_id 
      and up.email = p_email
  ) then
    raise exception 'User is already a member of this organization';
  end if;

  -- Cancel any existing pending invites for this email+org
  update public.organization_invites 
  set status = 'expired'
  where organization_id = p_organization_id 
    and email = p_email 
    and status = 'pending';

  -- Generate secure token using pgcrypto
  v_token := encode(extensions.gen_random_bytes(32), 'base64');
  -- Make URL-safe by replacing problematic characters
  v_token := replace(replace(replace(v_token, '+', '-'), '/', '_'), '=', '');

  -- Create the invite
  insert into public.organization_invites (
    organization_id,
    email,
    role,
    invited_by,
    token
  ) values (
    p_organization_id,
    p_email,
    p_role,
    auth.uid(),
    v_token
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- Function to accept an invite
create or replace function public.accept_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.organization_invites;
  v_user_id uuid;
  v_result jsonb;
begin
  -- Get the current user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User must be authenticated to accept invite';
  end if;

  -- Find and validate the invite
  select * into v_invite
  from public.organization_invites
  where token = p_token
    and status = 'pending'
    and expires_at > now();

  if not found then
    raise exception 'Invalid or expired invite token';
  end if;

  -- Get user's email to verify it matches invite
  if not exists (
    select 1 from public.user_profiles
    where id = v_user_id and email = v_invite.email
  ) then
    raise exception 'Invite email does not match authenticated user';
  end if;

  -- Check if user is already a member
  if exists (
    select 1 from public.organization_members
    where organization_id = v_invite.organization_id and user_id = v_user_id
  ) then
    -- Mark invite as accepted even though user was already a member
    update public.organization_invites
    set status = 'accepted', accepted_at = now(), accepted_by = v_user_id
    where id = v_invite.id;
    
    v_result := jsonb_build_object(
      'success', true,
      'message', 'You are already a member of this organization',
      'organization_id', v_invite.organization_id,
      'already_member', true
    );
  else
    -- Add user to organization
    insert into public.organization_members (organization_id, user_id, role)
    values (v_invite.organization_id, v_user_id, v_invite.role);

    -- Mark invite as accepted
    update public.organization_invites
    set status = 'accepted', accepted_at = now(), accepted_by = v_user_id
    where id = v_invite.id;

    v_result := jsonb_build_object(
      'success', true,
      'message', 'Successfully joined organization',
      'organization_id', v_invite.organization_id,
      'role', v_invite.role
    );
  end if;

  return v_result;
end;
$$;

-- Grant permissions
revoke all on function public.create_invite(uuid, text, membership_role) from public;
grant execute on function public.create_invite(uuid, text, membership_role) to authenticated;

revoke all on function public.accept_invite(text) from public;
grant execute on function public.accept_invite(text) to authenticated, anon;

-- Function to cleanup expired invites (can be called by a cron job)
create or replace function public.cleanup_expired_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.organization_invites
  set status = 'expired'
  where status = 'pending' and expires_at < now();
  
  get diagnostics v_count = ROW_COUNT;
  return v_count;
end;
$$;

grant execute on function public.cleanup_expired_invites() to authenticated;