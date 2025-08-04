import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';
import type { OrganizationMemberWithProfile, OrganizationMemberWithOrganization, MembershipRole } from '$lib/types/database';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['member', 'admin', 'owner'] as const)
});

const updateOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long')
});

export const load: PageServerLoad = async ({ locals, params, parent, url }) => {
  if (!locals.session) {
    throw redirect(303, '/auth/login');
  }

  const { userOrganizations } = await parent();
  const isJustCreated = url.searchParams.has('created');
  
  // Check if user has access to this organization
  let currentOrgMembership = userOrganizations.find(
    (membership: any) => {
      // Handle both array and object structures
      if (Array.isArray(membership.organizations)) {
        return membership.organizations[0]?.id === params.org_id;
      } else {
        return membership.organizations?.id === params.org_id;
      }
    }
  );

  // If organization not found in user's list, check if they just created it or fetch directly
  if (!currentOrgMembership) {
    // Try to fetch the organization membership directly
    const { data: orgCheck } = await locals.supabase
      .from('organization_members')
      .select(`
        role,
        organizations!organization_id(id, name, created_at)
      `)
      .eq('organization_id', params.org_id)
      .eq('user_id', locals.session.user.id)
      .single();

    if (!orgCheck) {
      // User doesn't have access to this organization
      // Redirect to team root which will handle organization selection
      throw redirect(303, '/team');
    }

    // Use the directly fetched organization data
    currentOrgMembership = orgCheck;
  }

  // Load team members for this organization
  const { data: teamMembers, error: membersError } = await locals.supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      created_at
    `)
    .eq('organization_id', params.org_id)
    .order('created_at', { ascending: true });

  if (membersError) {
    console.error('Error loading team members:', membersError);
    throw error(500, 'Failed to load team members');
  }

  // Load user profiles separately to avoid relationship issues
  const userIds = teamMembers?.map(member => member.user_id) || [];
  const { data: profiles } = await locals.supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .in('id', userIds);

  // Combine the data
  const enrichedMembers = teamMembers?.map(member => ({
    ...member,
    user_profiles: profiles?.find(profile => profile.id === member.user_id) || null
  })) || [];

  // Extract organization data consistently
  let organizationData = null;
  if (Array.isArray(currentOrgMembership.organizations)) {
    organizationData = currentOrgMembership.organizations[0];
  } else {
    organizationData = currentOrgMembership.organizations;
  }

  return {
    currentOrganization: organizationData,
    userRole: currentOrgMembership.role,
    teamMembers: enrichedMembers
  };
};

export const actions: Actions = {
  invite: async ({ locals, params, request, url }) => {
    if (!locals.session) {
      throw redirect(303, '/auth/login');
    }

    const formData = await request.formData();
    const data = {
      email: formData.get('email'),
      role: formData.get('role') || 'member'
    };

    // Validate input
    const result = inviteSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    // Create invite using the RPC function (handles all validation)
    const { data: invite, error: inviteError } = await locals.supabase.rpc('create_invite', {
      p_organization_id: params.org_id,
      p_email: result.data.email,
      p_role: result.data.role
    });

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return fail(400, {
        message: inviteError.message,
        data
      });
    }

    // Generate the invite link using the current request origin
    const inviteUrl = new URL('/invitations/' + invite.token, url.origin).href;
    
    // TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
    // For development, the invite URL is returned to display in the UI

    return { 
      success: true, 
      inviteUrl,
      developmentMode: true // Flag to show the URL in development
    };
  },

  updateOrganization: async ({ locals, params, request }) => {
    if (!locals.session) {
      throw redirect(303, '/auth/login');
    }

    const formData = await request.formData();
    const data = {
      name: formData.get('name')
    };

    // Validate input
    const result = updateOrgSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    // Use RPC function to update organization (handles permissions and RLS)
    const { data: updatedOrg, error: updateError } = await locals.supabase
      .rpc('update_organization', {
        p_org_id: params.org_id,
        p_name: result.data.name
      });

    if (updateError) {
      console.error('Error updating organization:', updateError);
      return fail(500, {
        message: updateError.message || 'Failed to update organization name',
        data
      });
    }

    return {
      updateSuccess: true,
      message: 'Organization name updated successfully'
    };
  }
};