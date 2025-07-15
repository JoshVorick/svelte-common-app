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
</script>

<Card>
	<CardHeader>
		<CardTitle>Sign In</CardTitle>
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
				{#if form?.error}
					<div class="text-red-500 text-sm">{form.error}</div>
				{/if}
				<Button type="submit" disabled={loading} class="w-full">
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