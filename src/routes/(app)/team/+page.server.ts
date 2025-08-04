import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
  if (!locals.session) {
    throw redirect(303, '/auth/login');
  }

  const { userOrganizations } = await parent();

  // If user has organizations, redirect to the first one
  if (userOrganizations && userOrganizations.length > 0) {
    const firstOrg = userOrganizations[0];
    
    // Handle both array and object structures for organizations
    let orgId = null;
    if (Array.isArray(firstOrg.organizations) && firstOrg.organizations[0]?.id) {
      orgId = (firstOrg.organizations as any)[0].id;
    } else if ((firstOrg.organizations as any)?.id) {
      orgId = (firstOrg.organizations as any).id;
    }
    
    if (orgId) {
      throw redirect(303, `/team/${orgId}`);
    }
  }

  // If no organizations, redirect to create one
  throw redirect(303, '/team/create');
};