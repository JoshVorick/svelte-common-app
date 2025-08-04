<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
  import { Separator } from '$lib/components/ui/separator';
  import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
  import { 
    Home, 
    Building2, 
    Users, 
    Settings, 
    LogOut, 
    Menu,
    FolderOpen
  } from '@lucide/svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  // Check for pending invites when component mounts
  onMount(async () => {
    if (data.session) {
      try {
        const response = await fetch('/api/check-invites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.acceptedCount > 0) {
            // User was auto-added to organizations, refresh the data
            await invalidateAll();
            
            // Redirect to first newly joined organization if they're on a page without org context
            if (result.invites.length > 0 && $page.route.id === '/(app)/team') {
              const firstOrg = result.invites[0];
              await goto(`/team/${firstOrg.organization_id}?success=` + 
                encodeURIComponent(`Welcome! You were automatically added to ${result.acceptedCount} organization${result.acceptedCount > 1 ? 's' : ''}.`));
            }
          }
        }
      } catch (error) {
        console.error('Error checking pending invites:', error);
        // Fail silently - don't interrupt user experience
      }
    }
  });

  const navigation = [
    { name: 'Team', href: '/team', icon: Users }
  ];

  function isActive(href: string) {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }

  function getInitials(email: string) {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Desktop Sidebar -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
      <!-- Logo & Org Switcher -->
      <div class="flex h-16 shrink-0 items-center justify-between">
        <h1 class="text-xl font-bold">Your App</h1>
        {#if data.userOrganizations.length > 1}
          <div class="text-sm">
            <select 
              on:change={(e) => {
                const target = e.target as HTMLSelectElement;
                const orgId = target.value;
                if (orgId) window.location.href = `/team/${orgId}`;
              }}
              class="rounded border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {#each data.userOrganizations as membership}
                <option value={membership.organizations?.[0]?.id}>
                  {membership.organizations?.[0]?.name}
                </option>
              {/each}
            </select>
          </div>
        {/if}
      </div>

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              {#each navigation as item}
                <li>
                  <a
                    href={item.href}
                    class="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors {isActive(item.href) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
                  >
                    <svelte:component this={item.icon} class="h-5 w-5 shrink-0" />
                    {item.name}
                  </a>
                </li>
              {/each}
            </ul>
          </li>

          <!-- User section -->
          <li class="mt-auto">
            <Separator class="mb-4" />
            <div class="flex items-center gap-x-4 px-2 py-3">
              <Avatar class="h-8 w-8">
                <AvatarFallback class="text-xs">
                  {getInitials(data.user.email || '')}
                </AvatarFallback>
              </Avatar>
              <div class="flex-1 text-sm leading-6 min-w-0">
                <p class="font-semibold truncate" title={data.user.email}>{data.user.email}</p>
                <p class="text-muted-foreground text-xs">Signed in</p>
              </div>
              <Button variant="ghost" size="sm" href="/auth/logout" class="p-1">
                <LogOut class="h-4 w-4" />
              </Button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <!-- Mobile menu -->
  <div class="lg:hidden">
    <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6">
      <Sheet>
        <SheetTrigger class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden">
          <Menu class="h-5 w-5" />
          <span class="sr-only">Open sidebar</span>
        </SheetTrigger>
        <SheetContent side="left" class="w-72 p-0">
          <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4">
            <!-- Logo -->
            <div class="flex h-16 shrink-0 items-center">
              <h1 class="text-xl font-bold">Your App</h1>
            </div>

            <!-- Navigation -->
            <nav class="flex flex-1 flex-col">
              <ul role="list" class="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" class="-mx-2 space-y-1">
                    {#each navigation as item}
                      <li>
                        <a
                          href={item.href}
                          class="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors {isActive(item.href) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
                        >
                          <svelte:component this={item.icon} class="h-5 w-5 shrink-0" />
                          {item.name}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </li>

                <!-- User section -->
                <li class="mt-auto">
                  <Separator class="mb-4" />
                  <div class="flex items-center gap-x-4 px-2 py-3">
                    <Avatar class="h-8 w-8">
                      <AvatarFallback class="text-xs">
                        {getInitials(data.user.email || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div class="flex-1 text-sm leading-6 min-w-0">
                      <p class="font-semibold truncate" title={data.user.email}>{data.user.email}</p>
                      <p class="text-muted-foreground text-xs">Signed in</p>
                    </div>
                    <Button variant="ghost" size="sm" href="/auth/logout" class="p-1">
                      <LogOut class="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div class="flex items-center gap-x-4 lg:gap-x-6">
          <h1 class="text-xl font-bold">Your App</h1>
        </div>
        <div class="flex flex-1 justify-end">
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <div class="flex items-center gap-x-2 min-w-0">
              <Avatar class="h-8 w-8">
                <AvatarFallback class="text-xs">
                  {getInitials(data.user.email || '')}
                </AvatarFallback>
              </Avatar>
              <span class="text-sm font-medium truncate hidden sm:block" title={data.user.email}>
                {data.user.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" href="/auth/logout" class="p-1">
              <LogOut class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="lg:pl-72">
    <main class="py-6">
      <div class="px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</div>