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

supabase.auth.onAuthStateChange((event, session) => {
	if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
		invalidateAll();
	}
});