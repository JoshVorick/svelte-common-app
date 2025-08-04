import type { Handle } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event.cookies);
  
  // Use getUser() instead of getSession() for security
  const {
    data: { user },
    error
  } = await event.locals.supabase.auth.getUser();
  
  if (user && !error) {
    // Create a minimal session object from user data
    event.locals.session = {
      user,
      access_token: '', // We don't need the token for our purposes
      refresh_token: '',
      expires_in: 0,
      expires_at: 0,
      token_type: 'bearer'
    };
  } else {
    event.locals.session = null;
  }
  
  return resolve(event);
};

declare module '@sveltejs/kit' {
  interface Locals {
    supabase: ReturnType<typeof createSupabaseServerClient>;
    session: import('@supabase/supabase-js').Session | null;
  }
}