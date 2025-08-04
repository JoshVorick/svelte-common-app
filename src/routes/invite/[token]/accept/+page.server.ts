import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const { token } = params;
  const authToken = url.searchParams.get('token');
  const type = url.searchParams.get('type');

  // Handle magic link verification if present
  if (authToken && type === 'magiclink') {
    const { data, error } = await locals.supabase.auth.verifyOtp({
      token_hash: authToken,
      type: 'magiclink'
    });

    if (error) {
      console.error('Magic link verification error:', error);
      throw redirect(303, `/invite/${token}?error=` + encodeURIComponent('Invalid or expired magic link'));
    }

    if (!data.user) {
      throw redirect(303, `/invite/${token}?error=` + encodeURIComponent('Authentication failed'));
    }

    // User is now authenticated, ensure their profile exists
    const { data: existingProfile } = await locals.supabase
      .from('user_profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      const { error: profileError } = await locals.supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || null
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw redirect(303, `/invite/${token}?error=` + encodeURIComponent('Failed to create user profile'));
      }
    }
  }

  // If we have a session, try to accept the invite automatically
  if (locals.session) {
    try {
      const { data: result, error } = await locals.supabase.rpc('accept_invite', {
        p_token: token
      });

      if (error) {
        console.error('Error accepting invite:', error);
        throw redirect(303, `/invite/${token}?error=` + encodeURIComponent(error.message));
      }

      // Success! Redirect to the organization
      const successMessage = result.already_member 
        ? 'You were already a member of this organization' 
        : 'Successfully joined the organization!';
        
      throw redirect(303, `/team/${result.organization_id}?success=` + encodeURIComponent(successMessage));
    } catch (err) {
      if (err instanceof Response) throw err; // Re-throw redirects
      console.error('Error accepting invite:', err);
      throw redirect(303, `/invite/${token}?error=` + encodeURIComponent('Failed to accept invite'));
    }
  }

  // No session, redirect back to invite page
  throw redirect(303, `/invite/${token}`);
};