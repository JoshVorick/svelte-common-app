import { createSupabaseLoadClient } from '$lib/supabase';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	// Only get session if user is authenticated (avoids security warnings)
	let session = null;
	if (user) {
		const { data: { session: userSession } } = await supabase.auth.getSession();
		session = userSession;
	}

	return {
		session,
		supabase
	};
};