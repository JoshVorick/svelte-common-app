<script lang="ts">
  import { enhance } from '$app/forms';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Building2 } from '@lucide/svelte';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let creating = false;
  let organizationName = '';
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="w-full max-w-md">
    <Card>
      <CardHeader class="text-center">
        <div class="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Building2 class="h-6 w-6 text-indigo-600" />
        </div>
        <CardTitle>Create Your Organization</CardTitle>
        <CardDescription>
          Get started by creating your first organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action="?/create" use:enhance={() => {
          creating = true;
          return async ({ update }) => {
            creating = false;
            await update();
          };
        }} class="space-y-4">
          <div>
            <Label for="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              bind:value={organizationName}
              placeholder="Acme Inc."
              required
              class={form?.errors?.name ? 'border-red-500' : ''}
            />
            {#if form?.errors?.name}
              <p class="text-sm text-red-600 mt-1">{form.errors.name[0]}</p>
            {/if}
          </div>

          <Button type="submit" disabled={creating} class="w-full gap-2">
            <Building2 class="h-4 w-4" />
            {creating ? 'Creating...' : 'Create Organization'}
          </Button>
        </form>

        {#if form?.message}
          <div class="mt-4 rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {form.message}
            </div>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</div>