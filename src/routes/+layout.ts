import { createSupabaseLoadClient } from '$lib/supabase';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient();

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return {
		session,
		supabase
	};
};