<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	let { title, value, change }: { 
		title: string; 
		value: string; 
		change?: string; 
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle class="text-sm font-medium text-gray-500">{title}</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="text-2xl font-bold">{value}</div>
		{#if change}
			<p class="text-xs text-gray-600">{change}</p>
		{/if}
	</CardContent>
</Card>