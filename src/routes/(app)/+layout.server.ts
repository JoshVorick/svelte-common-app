import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.session) {
    throw redirect(303, '/auth/login');
  }

  // Load user's organizations for the org switcher
  const { data: userOrganizations, error } = await locals.supabase
    .from('organization_members')
    .select(`
      role,
      organizations!organization_id(id, name, created_at)
    `)
    .eq('user_id', locals.session.user.id);

  if (error) {
    console.error('Error loading user organizations:', error);
  }

  return {
    session: locals.session,
    user: locals.session.user,
    userOrganizations: userOrganizations || []
  };
};