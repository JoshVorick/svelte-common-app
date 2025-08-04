import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long')
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    throw redirect(303, '/auth/login');
  }

  return {};
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    if (!locals.session) {
      throw redirect(303, '/auth/login');
    }

    const formData = await request.formData();
    const data = {
      name: formData.get('name')
    };

    // Validate input
    const result = createOrgSchema.safeParse(data);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    // Ensure user profile exists first
    const { data: existingProfile } = await locals.supabase
      .from('user_profiles')
      .select('id')
      .eq('id', locals.session.user.id)
      .single();

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      const { error: profileError } = await locals.supabase
        .from('user_profiles')
        .insert({
          id: locals.session.user.id,
          email: locals.session.user.email || '',
          full_name: locals.session.user.user_metadata?.full_name || null
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return fail(500, {
          message: 'Failed to create user profile: ' + profileError.message,
          data
        });
      }
    }

    // Create organization using the RPC function
    const { data: organization, error } = await locals.supabase.rpc('create_organization', {
      p_name: result.data.name
    });

    if (error) {
      console.error('Error creating organization:', error);
      return fail(500, {
        message: 'Failed to create organization: ' + error.message,
        data
      });
    }

    // Redirect to the new organization's team page with a flag to skip access check
    throw redirect(303, `/team/${organization.id}?created=true`);
  }
};