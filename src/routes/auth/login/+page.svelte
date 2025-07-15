<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { analytics } from '$lib/analytics';
	import { logger } from '$lib/logger';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let email = $state('');
	let password = $state('');

	onMount(() => {
		analytics.ui.componentMounted('LoginPage');
		analytics.ui.pageViewed('login');
		logger.info('Login page loaded', { component: 'LoginPage' });
	});

	function handleSubmit() {
		analytics.auth.loginAttempt(email);
		analytics.ui.formSubmitted('login-form', 'LoginPage');
		logger.info('Login form submitted', { 
			component: 'LoginPage',
			metadata: { email: email.split('@')[0] + '@***' }
		});
		loading = true;
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Sign In</CardTitle>
	</CardHeader>
	<CardContent>
		<form method="POST" use:enhance={() => {
			handleSubmit();
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'redirect') {
					analytics.auth.loginSuccess('user_id_placeholder');
					logger.info('Login successful, redirecting', { 
						component: 'LoginPage',
						metadata: { redirectTo: result.location }
					});
					goto(result.location);
				} else if (result.type === 'failure') {
					analytics.auth.loginFailure(email, result.data?.error || 'Unknown error');
					logger.warn('Login failed', { 
						component: 'LoginPage',
						metadata: { error: result.data?.error }
					});
					await update();
				}
			};
		}}>
			<div class="space-y-4">
				<div>
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						required
						bind:value={email}
						placeholder="Enter your email"
					/>
				</div>
				<div>
					<Label for="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						required
						bind:value={password}
						placeholder="Enter your password"
					/>
				</div>
				{#if form?.error}
					<div class="text-red-500 text-sm">{form.error}</div>
				{/if}
				<Button 
					type="submit" 
					disabled={loading} 
					class="w-full"
					onclick={() => analytics.ui.buttonClicked('login-submit', 'LoginPage')}
				>
					{loading ? 'Signing in...' : 'Sign In'}
				</Button>
			</div>
		</form>
		<div class="mt-4 text-center">
			<span class="text-sm text-gray-600">Don't have an account?</span>
			<a href="/auth/signup" class="text-blue-600 hover:text-blue-500 ml-1">Sign up</a>
		</div>
	</CardContent>
</Card>