<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { analytics } from '$lib/analytics';
	import { logger } from '$lib/logger';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		analytics.ui.componentMounted('DashboardPage');
		analytics.ui.pageViewed('dashboard', data.user?.id);
		logger.info('Dashboard loaded', { 
			component: 'DashboardPage',
			userId: data.user?.id,
			metadata: { hasSession: !!data.session }
		});
	});

	function handleStatsCardClick(cardType: string) {
		analytics.ui.buttonClicked(`stats-${cardType}`, 'DashboardPage', data.user?.id);
		analytics.features.featureUsed('stats-view', data.user?.id, { cardType });
		logger.info('Stats card clicked', { 
			component: 'DashboardPage',
			userId: data.user?.id,
			metadata: { cardType }
		});
	}
</script>

<div class="px-4 sm:px-0">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-600">
			Welcome to your dashboard. Here's an overview of your account.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<!-- Stats Cards -->
		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium text-gray-500">Total Users</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">1,234</div>
				<p class="text-xs text-gray-600">+20.1% from last month</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium text-gray-500">Revenue</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">$12,345</div>
				<p class="text-xs text-gray-600">+15.3% from last month</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium text-gray-500">Active Sessions</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">567</div>
				<p class="text-xs text-gray-600">+8.2% from last month</p>
			</CardContent>
		</Card>
	</div>

	<!-- Recent Activity -->
	<div class="mt-8">
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">User john@example.com signed up</p>
							<p class="text-xs text-gray-600">2 hours ago</p>
						</div>
						<Button 
							variant="outline" 
							size="sm"
							onclick={() => handleStatsCardClick('activity-signup')}
						>
							View
						</Button>
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">Payment received from jane@example.com</p>
							<p class="text-xs text-gray-600">4 hours ago</p>
						</div>
						<Button 
							variant="outline" 
							size="sm"
							onclick={() => handleStatsCardClick('activity-payment')}
						>
							View
						</Button>
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">New feature request submitted</p>
							<p class="text-xs text-gray-600">6 hours ago</p>
						</div>
						<Button 
							variant="outline" 
							size="sm"
							onclick={() => handleStatsCardClick('activity-feature')}
						>
							View
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>