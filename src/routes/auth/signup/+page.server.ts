import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const formData = {
      email: form.get('email')
    };

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data: formData
      });
    }

    const { email } = result.data;

    const emailRedirectTo = `${url.origin}/auth/callback`; // landing after click
    const { error } = await locals.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo, shouldCreateUser: true } // auto-signup enabled
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