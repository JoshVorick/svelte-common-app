import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cookie interface for server-side Supabase client
 */
export interface CookieInterface {
	/** Get a cookie value by key */
	get: (key: string) => string | undefined;
	/** Set a cookie with value and options */
	set: (key: string, value: string, options: any) => void;
	/** Remove a cookie by key */
	remove: (key: string, options: any) => void;
}

/**
 * Creates a Supabase client for browser/client-side use
 * 
 * This client is suitable for use in:
 * - Client-side components
 * - Browser environments
 * - Load functions that run on the client
 * 
 * @returns Configured Supabase client for browser use
 * 
 * @example
 * ```typescript
 * import { createSupabaseLoadClient } from '$lib/supabase';
 * 
 * const supabase = createSupabaseLoadClient();
 * 
 * // Use in a load function
 * export const load = async () => {
 *   const { data: user } = await supabase.auth.getUser();
 *   return { user };
 * };
 * ```
 */
export const createSupabaseLoadClient = (): SupabaseClient => {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
};

/**
 * Creates a Supabase client for server-side use with cookie management
 * 
 * This client is suitable for use in:
 * - Server-side load functions
 * - Server actions
 * - API endpoints
 * - Hooks
 * 
 * The client automatically manages authentication state through cookies,
 * enabling proper SSR and session management.
 * 
 * @param cookies - Cookie interface for reading/writing cookies
 * @returns Configured Supabase client for server use
 * 
 * @example
 * ```typescript
 * import { createSupabaseServerClient } from '$lib/supabase';
 * 
 * // In a server load function
 * export const load = async ({ cookies }) => {
 *   const supabase = createSupabaseServerClient(cookies);
 *   
 *   const { data: { user } } = await supabase.auth.getUser();
 *   
 *   if (!user) {
 *     throw redirect(302, '/auth/login');
 *   }
 *   
 *   return { user };
 * };
 * 
 * // In an API endpoint
 * export const POST = async ({ request, cookies }) => {
 *   const supabase = createSupabaseServerClient(cookies);
 *   
 *   const { data, error } = await supabase
 *     .from('users')
 *     .select('*');
 *   
 *   return json({ data, error });
 * };
 * ```
 */
export const createSupabaseServerClient = (cookies: CookieInterface): SupabaseClient => {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => cookies.get(key),
			set: (key, value, options) => cookies.set(key, value, options),
			remove: (key, options) => cookies.remove(key, options)
		}
	});
};