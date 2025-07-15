<script lang="ts">
	import { onMount } from 'svelte';
	import { logger } from '$lib/logger';
	import { analytics } from '$lib/analytics';

	let { 
		children, 
		fallback, 
		componentName = 'Unknown' 
	}: { 
		children: any; 
		fallback?: any; 
		componentName?: string; 
	} = $props();

	let hasError = $state(false);
	let error = $state<Error | null>(null);

	onMount(() => {
		// Catch unhandled errors in this component tree
		const handleError = (event: ErrorEvent) => {
			hasError = true;
			error = event.error;
			
			analytics.performance.componentError(componentName, event.error, {
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno
			});
			
			logger.error('Component error caught', {
				component: componentName,
				error: event.error,
				metadata: {
					filename: event.filename,
					line: event.lineno,
					column: event.colno
				}
			});
		};

		const handlePromiseRejection = (event: PromiseRejectionEvent) => {
			hasError = true;
			error = new Error(event.reason);
			
			analytics.performance.componentError(componentName, error, {
				type: 'promise_rejection',
				reason: event.reason
			});
			
			logger.error('Promise rejection caught', {
				component: componentName,
				error,
				metadata: {
					reason: event.reason
				}
			});
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handlePromiseRejection);
		
		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handlePromiseRejection);
		};
	});

	function resetError() {
		hasError = false;
		error = null;
		
		logger.info('Error boundary reset', {
			component: componentName
		});
	}
</script>

{#if hasError}
	{#if fallback}
		{@render fallback({ error, resetError })}
	{:else}
		<div class="error-boundary p-4 border border-red-300 rounded-lg bg-red-50">
			<h2 class="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
			<p class="text-red-600 mb-4">An error occurred in {componentName}</p>
			<button 
				class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
				onclick={resetError}
			>
				Try again
			</button>
		</div>
	{/if}
{:else}
	{@render children()}
{/if}

<style>
	.error-boundary {
		margin: 1rem 0;
	}
</style>