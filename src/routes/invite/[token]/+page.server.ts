import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { token } = params;

  // Get invite details (can be accessed by anyone)
  const { data: invite, error: inviteError } = await locals.supabase
    .from('organization_invites')
    .select(`
      id,
      email,
      role,
      expires_at,
      status,
      organizations!organization_id(name)
    `)
    .eq('token', token)
    .single();

  if (inviteError || !invite) {
    throw error(404, 'Invite not found');
  }

  if (invite.status !== 'pending') {
    throw error(400, `This invite has already been ${invite.status}`);
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw error(400, 'This invite has expired');
  }

  // If user is already logged in, check if they can accept the invite
  if (locals.session) {
    // Get user's email to check if it matches the invite
    const { data: profile } = await locals.supabase
      .from('user_profiles')
      .select('email')
      .eq('id', locals.session.user.id)
      .single();

    if (profile && profile.email === invite.email) {
      // User is logged in with matching email, they can accept immediately
      return {
        invite,
        canAcceptDirectly: true,
        currentUserEmail: profile.email
      };
    } else {
      // User is logged in but with wrong email
      return {
        invite,
        canAcceptDirectly: false,
        wrongUser: true,
        currentUserEmail: profile?.email
      };
    }
  }

  // User is not logged in, show signup/login options
  return {
    invite,
    canAcceptDirectly: false,
    wrongUser: false
  };
};

export const actions: Actions = {
  // Accept invite for already authenticated user
  accept: async ({ locals, params, request }) => {
    if (!locals.session) {
      return fail(401, { message: 'Must be logged in to accept invite' });
    }

    const { token } = params;

    try {
      const { data: result, error } = await locals.supabase.rpc('accept_invite', {
        p_token: token
      });

      if (error) {
        console.error('Error accepting invite:', error);
        return fail(400, { message: error.message });
      }

      // Redirect to the organization they just joined
      throw redirect(303, `/team/${result.organization_id}`);
    } catch (err) {
      if (err instanceof Response) throw err; // Re-throw redirects
      console.error('Error accepting invite:', err);
      return fail(500, { message: 'Failed to accept invite' });
    }
  },

  // Sign up with magic link and include invite token for later processing
  signup: async ({ locals, params, request }) => {
    const { token } = params;
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return fail(400, { message: 'Email is required' });
    }

    // Get invite details to verify email matches
    const { data: invite } = await locals.supabase
      .from('organization_invites')
      .select('email')
      .eq('token', token)
      .single();

    if (!invite || invite.email !== email) {
      return fail(400, { message: 'Email does not match the invitation' });
    }

    // Send magic link with redirect to invite acceptance
    const { error } = await locals.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${new URL(`/invite/${token}/accept`, request.url).href}`
      }
    });

    if (error) {
      console.error('Magic link error:', error);
      return fail(400, { message: error.message });
    }

    return { 
      success: true, 
      message: 'Check your email for a sign-in link!'
    };
  }
};