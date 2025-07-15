import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({
			token_hash,
			type: type as any
		});

		if (!error) {
			throw redirect(303, '/dashboard');
		}
	}

	// If there's an error or no token, redirect to login
	throw redirect(303, '/auth/login');
};