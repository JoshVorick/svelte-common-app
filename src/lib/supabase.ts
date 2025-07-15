import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const createSupabaseLoadClient = () => {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
};

export const createSupabaseServerClient = (cookies: {
	get: (key: string) => string | undefined;
	set: (key: string, value: string, options: any) => void;
	remove: (key: string, options: any) => void;
}) => {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => cookies.get(key),
			set: (key, value, options) => cookies.set(key, value, options),
			remove: (key, options) => cookies.remove(key, options)
		}
	});
};