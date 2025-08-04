<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
  
  let email = $page.url.searchParams.get('email') || '';
  let sending = false;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email to receive a magic link
      </p>
    </div>
    
    <form method="POST" use:enhance={() => {
      sending = true;
      return async ({ update }) => {
        sending = false;
        await update();
      };
    }} class="mt-8 space-y-6">
      <div>
        <label for="email" class="sr-only">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          placeholder="you@company.com"
          required
          class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={sending}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send magic link'}
        </button>
      </div>

      <div class="text-center">
        <a href="/auth/login" class="text-sm text-indigo-600 hover:text-indigo-500">
          Already have an account? Sign in
        </a>
      </div>
    </form>
    
    {#if form?.success}
      <div class="rounded-md bg-green-50 p-4">
        <div class="text-sm text-green-700">
          Check your email for the magic link to complete signup.
        </div>
      </div>
    {/if}
    
    {#if form?.message}
      <div class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {form.message}
        </div>
      </div>
    {/if}

    {#if form?.errors?.email}
      <div class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {form.errors.email[0]}
        </div>
      </div>
    {/if}
  </div>
</div>