-- Fix infinite recursion in RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "mem_select" ON public.organization_members;
DROP POLICY IF EXISTS "mem_insert" ON public.organization_members;
DROP POLICY IF EXISTS "mem_update" ON public.organization_members;
DROP POLICY IF EXISTS "mem_delete" ON public.organization_members;

-- Create new non-recursive policies for organization_members
-- Users can see their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.organization_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can see other memberships in organizations they belong to
-- Use a function to avoid recursion
CREATE OR REPLACE FUNCTION public.user_has_org_access(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid()
  );
$$;

CREATE POLICY "Users can view org members they have access to"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.user_has_org_access(organization_id)
);

-- Create a helper function to check if user is admin/owner of an org
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$;

-- Only Owner/Admin can add members (use function to avoid recursion)
CREATE POLICY "Owners and admins can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(organization_id));

-- Only Owner/Admin can update member roles
CREATE POLICY "Owners and admins can update members"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- Only Owner/Admin can remove members
CREATE POLICY "Owners and admins can remove members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (public.is_org_admin(organization_id));

-- Grant execute permission on the helper functions
GRANT EXECUTE ON FUNCTION public.user_has_org_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;