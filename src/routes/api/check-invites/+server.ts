import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: result, error } = await locals.supabase.rpc('check_pending_invites');

    if (error) {
      console.error('Error checking pending invites:', error);
      return json({ error: error.message }, { status: 400 });
    }

    return json({
      success: true,
      acceptedCount: result.accepted_count,
      invites: result.invites
    });
  } catch (err) {
    console.error('Error checking pending invites:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};