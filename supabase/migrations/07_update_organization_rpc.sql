-- Add RPC function to update organization name
-- Only owners/admins can update organization details

create or replace function public.update_organization(p_org_id uuid, p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations;
begin
  -- Check if caller is owner/admin of the organization
  if not exists (
    select 1 from public.organization_members
    where organization_id = p_org_id 
      and user_id = auth.uid() 
      and role in ('owner','admin')
  ) then
    raise exception 'Not permitted to update this organization';
  end if;

  -- Validate input
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Organization name cannot be empty';
  end if;

  if length(p_name) > 100 then
    raise exception 'Organization name is too long (max 100 characters)';
  end if;

  -- Update the organization
  update public.organizations 
  set name = trim(p_name), updated_at = now()
  where id = p_org_id
  returning * into v_org;

  if not found then
    raise exception 'Organization not found';
  end if;

  return v_org;
end;
$$;

-- Grant execute permission to authenticated users
revoke all on function public.update_organization(uuid, text) from public;
grant execute on function public.update_organization(uuid, text) to authenticated;