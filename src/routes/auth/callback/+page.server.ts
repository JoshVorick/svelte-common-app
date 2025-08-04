import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  // Check if user profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist, create it
  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't throw here - let the user continue even if profile creation fails
    }
  }
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type');
  const redirectTo = url.searchParams.get('redirect_to') || '/team';

  // Handle magic link verification
  if (token && type === 'magiclink') {
    const { data, error } = await locals.supabase.auth.verifyOtp({
      token_hash: token,
      type: 'magiclink'
    });

    if (error) {
      console.error('Magic link verification error:', error);
      throw redirect(303, '/auth/login?error=' + encodeURIComponent(error.message));
    }

    if (data.user) {
      // Ensure user profile exists
      await ensureUserProfile(locals.supabase, data.user);
      // Successful authentication, redirect to team
      throw redirect(303, '/team');
    }
  }

  // Handle OAuth code exchange
  if (code) {
    const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Code exchange error:', error);
      throw redirect(303, '/auth/login?error=' + encodeURIComponent(error.message));
    }

    if (data.session) {
      // Ensure user profile exists
      await ensureUserProfile(locals.supabase, data.session.user);
      throw redirect(303, '/team');
    }
  }

  // If no valid token or code, redirect to login
  throw redirect(303, '/auth/login');
};