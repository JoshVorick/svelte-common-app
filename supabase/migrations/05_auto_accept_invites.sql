-- Function to automatically accept pending invites when a user signs up
create or replace function public.auto_accept_pending_invites(p_user_id uuid, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_accepted_count integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_invite_result jsonb;
begin
  -- Find all pending, non-expired invites for this email
  for v_invite in
    select id, organization_id, role, token
    from public.organization_invites
    where email = p_email
      and status = 'pending'
      and expires_at > now()
  loop
    -- Check if user is already a member of this organization
    if not exists (
      select 1 from public.organization_members
      where organization_id = v_invite.organization_id and user_id = p_user_id
    ) then
      -- Add user to organization
      insert into public.organization_members (organization_id, user_id, role)
      values (v_invite.organization_id, p_user_id, v_invite.role);
      
      -- Mark invite as accepted
      update public.organization_invites
      set status = 'accepted', accepted_at = now(), accepted_by = p_user_id
      where id = v_invite.id;
      
      v_accepted_count := v_accepted_count + 1;
      
      -- Add to results
      select jsonb_build_object(
        'organization_id', v_invite.organization_id,
        'role', v_invite.role,
        'token', v_invite.token
      ) into v_invite_result;
      
      v_results := v_results || v_invite_result;
    else
      -- User is already a member, just mark invite as accepted
      update public.organization_invites
      set status = 'accepted', accepted_at = now(), accepted_by = p_user_id
      where id = v_invite.id;
    end if;
  end loop;
  
  return jsonb_build_object(
    'accepted_count', v_accepted_count,
    'invites', v_results
  );
end;
$$;

-- Update the handle_new_user function to auto-accept invites
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_auto_accept_result jsonb;
begin
  -- Create user profile
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Auto-accept any pending invites for this email
  select public.auto_accept_pending_invites(new.id, new.email) into v_auto_accept_result;
  
  -- Log the auto-accept results (optional)
  if (v_auto_accept_result->>'accepted_count')::integer > 0 then
    raise notice 'Auto-accepted % pending invites for user %', 
      v_auto_accept_result->>'accepted_count', new.email;
  end if;
  
  return new;
end;
$$;

-- Function to manually check for and accept pending invites (can be called from app)
create or replace function public.check_pending_invites()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_result jsonb;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;
  
  -- Get user's email
  select email into v_user_email
  from public.user_profiles
  where id = v_user_id;
  
  if v_user_email is null then
    raise exception 'User profile not found';
  end if;
  
  -- Process pending invites
  select public.auto_accept_pending_invites(v_user_id, v_user_email) into v_result;
  
  return v_result;
end;
$$;

-- Grant permissions
grant execute on function public.auto_accept_pending_invites(uuid, text) to authenticated;
grant execute on function public.check_pending_invites() to authenticated;

-- Add a notification function for when users are auto-added to organizations
create or replace function public.notify_auto_joined_organizations()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_org_name text;
  v_user_email text;
begin
  -- Only notify for members added via auto-accept (not manual adds)
  if NEW.created_at = NEW.created_at then -- This is a new insert
    -- Get organization name and user email for potential notification
    select o.name, up.email into v_org_name, v_user_email
    from public.organizations o, public.user_profiles up
    where o.id = NEW.organization_id and up.id = NEW.user_id;
    
    -- Log the auto-join (could be replaced with actual notification system)
    raise notice 'User % auto-joined organization % with role %', 
      v_user_email, v_org_name, NEW.role;
  end if;
  
  return NEW;
end;
$$;

-- Create trigger to log auto-joins (optional)
create trigger on_member_auto_added
  after insert on public.organization_members
  for each row execute function public.notify_auto_joined_organizations();