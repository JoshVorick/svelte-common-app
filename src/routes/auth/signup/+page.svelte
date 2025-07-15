<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
</script>

<Card>
	<CardHeader>
		<CardTitle>Sign Up</CardTitle>
	</CardHeader>
	<CardContent>
		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'redirect') {
					goto(result.location);
				} else {
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
				<div>
					<Label for="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						bind:value={confirmPassword}
						placeholder="Confirm your password"
					/>
				</div>
				{#if form?.error}
					<div class="text-red-500 text-sm">{form.error}</div>
				{/if}
				{#if form?.success}
					<div class="text-green-500 text-sm">{form.success}</div>
				{/if}
				<Button type="submit" disabled={loading} class="w-full">
					{loading ? 'Creating account...' : 'Sign Up'}
				</Button>
			</div>
		</form>
		<div class="mt-4 text-center">
			<span class="text-sm text-gray-600">Already have an account?</span>
			<a href="/auth/login" class="text-blue-600 hover:text-blue-500 ml-1">Sign in</a>
		</div>
	</CardContent>
</Card>