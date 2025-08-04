import { createSupabaseLoadClient } from '$lib/supabase';
import { invalidateAll } from '$app/navigation';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event, status, message }) => {
	console.error('Client error:', error);
	return {
		message: 'An error occurred'
	};
};

// Set up auth listener
const supabase = createSupabaseLoadClient();

supabase.auth.onAuthStateChange(async (event) => {
	if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
		// Validate the auth state with getUser() for security
		await supabase.auth.getUser();
		invalidateAll();
	}
});