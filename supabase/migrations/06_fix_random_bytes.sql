-- Enable pgcrypto extension for secure random generation
create extension if not exists pgcrypto;

-- Update the create_invite function to use pgcrypto's gen_random_bytes
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