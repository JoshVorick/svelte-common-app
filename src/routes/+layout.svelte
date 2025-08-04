<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Toaster } from 'svelte-sonner';
	import type { LayoutData } from './$types';
	
	let { children, data }: { children: any; data: LayoutData } = $props();

	onMount(() => {
		const { data: { subscription } } = data.supabase.auth.onAuthStateChange(() => {
			invalidateAll();
		});

		return () => subscription.unsubscribe();
	});
</script>

{@render children()}

<Toaster 
	richColors 
	position="top-right"
	theme="light"
	closeButton
/>
