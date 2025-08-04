import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const formData = {
      email: form.get('email')
    };

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data: formData
      });
    }

    const { email } = result.data;

    // Send magic link - let Supabase handle user existence securely
    // This won't reveal whether the user exists or not
    const emailRedirectTo = `${url.origin}/auth/callback`;
    const { error } = await locals.supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo,
        shouldCreateUser: true // Allow auto-signup for seamless UX
      }
    });
    
    if (error) {
      return fail(400, { 
        message: error.message,
        data: formData
      });
    }
    
    return { success: true };
  }
};