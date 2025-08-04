<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
  import { Separator } from '$lib/components/ui/separator';
  import { UserPlus, Crown, Shield, User, CheckCircle2, Edit2, X, Check } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let inviting = false;
  let email = '';
  let role = 'member';
  
  // Organization name editing state
  let orgName = data.currentOrganization?.name || '';
  let updatingOrgName = false;

  // Check for success message from URL params
  $: successMessage = $page.url.searchParams.get('success');

  function getInitials(email: string) {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case 'owner':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'owner':
        return 'text-yellow-600 bg-yellow-50';
      case 'admin':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  $: canInvite = ['admin', 'owner'].includes(data.userRole);
  $: canEditOrg = ['admin', 'owner'].includes(data.userRole);
  
  // Update organization name when data changes
  $: orgName = data.currentOrganization?.name || '';

  // Handle form results with toasts
  $: if (form?.updateSuccess) {
    toast.success(form.message || 'Organization updated successfully');
  }
  
  $: if (form?.success) {
    if (form?.developmentMode && form?.inviteUrl) {
      toast.success('Invitation created! Check console for invite URL in development mode.');
      console.log('Invite URL:', form.inviteUrl);
    } else {
      toast.success('Invitation sent successfully!');
    }
  }
  
  $: if (form?.message && !form?.updateSuccess && !form?.success) {
    toast.error(form.message);
  }
  
  // Handle validation errors
  $: if (form?.errors) {
    if ('name' in form.errors && form.errors.name) {
      toast.error(form.errors.name[0]);
    }
    if ('email' in form.errors && form.errors.email) {
      toast.error(form.errors.email[0]);
    }
  }
</script>

<div class="space-y-6">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Team</h1>
      <p class="text-muted-foreground">{data.currentOrganization?.name}</p>
    </div>
    
    {#if canInvite}
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">
          {data.teamMembers.length} member{data.teamMembers.length !== 1 ? 's' : ''}
        </span>
      </div>
    {/if}
  </div>

  <!-- Organization Settings (Only for Admins/Owners) -->
  {#if canEditOrg}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Edit2 class="h-5 w-5" />
          Organization Settings
        </CardTitle>
        <CardDescription>
          Update your organization details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action="?/updateOrganization" use:enhance={() => {
          updatingOrgName = true;
          return async ({ result, update }) => {
            updatingOrgName = false;
            if (result.type === 'success') {
              // Force a page reload to refresh all data including layout
              await update({ invalidateAll: true });
            } else {
              await update();
            }
          };
        }} class="space-y-4">
          <div>
            <Label for="orgName">Organization Name</Label>
            <Input
              id="orgName"
              name="name"
              bind:value={orgName}
              placeholder="Organization name"
              required
              disabled={updatingOrgName}
            />
          </div>
          
          <Button type="submit" disabled={updatingOrgName} class="gap-2">
            <Check class="h-4 w-4" />
            {updatingOrgName ? 'Updating...' : 'Update Organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  {/if}

  <!-- Invite Member Form (Only for Admins/Owners) -->
  {#if canInvite}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <UserPlus class="h-5 w-5" />
          Invite Team Member
        </CardTitle>
        <CardDescription>
          Add new members to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action="?/invite" use:enhance={() => {
          inviting = true;
          return async ({ result, update }) => {
            inviting = false;
            if (result.type === 'success') {
              email = '';
              role = 'member';
            }
            await update();
          };
        }} class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <Label for="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                bind:value={email}
                placeholder="colleague@company.com"
                required
              />
            </div>
            
            <div>
              <Label for="role">Role</Label>
              <select
                id="role"
                name="role"
                bind:value={role}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                {#if data.userRole === 'owner'}
                  <option value="owner">Owner</option>
                {/if}
              </select>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <Button type="submit" disabled={inviting} class="gap-2">
              <UserPlus class="h-4 w-4" />
              {inviting ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  {/if}

  <!-- Team Members List -->
  <Card>
    <CardHeader>
      <CardTitle>Team Members</CardTitle>
      <CardDescription>
        People who have access to this organization
      </CardDescription>
    </CardHeader>
    <CardContent>
      {#if data.teamMembers.length === 0}
        <div class="text-center py-8">
          <User class="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 class="mt-2 text-sm font-semibold">No team members</h3>
          <p class="mt-1 text-sm text-muted-foreground">
            {#if canInvite}
              Get started by inviting your first team member.
            {:else}
              Contact an admin to invite team members.
            {/if}
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each data.teamMembers as member}
            <div class="flex items-center justify-between py-4">
              <div class="flex items-center space-x-4">
                <Avatar class="h-10 w-10">
                  <AvatarFallback class="text-sm">
                    {getInitials(member.user_profiles?.email || 'Unknown')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-sm font-medium">
                    {member.user_profiles?.full_name || member.user_profiles?.email || 'Unknown User'}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {member.user_profiles?.email}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleColor(member.role)}">
                  <svelte:component this={getRoleIcon(member.role)} class="h-3 w-3" />
                  {member.role}
                </span>
                
                {#if member.user_id === data.user.id}
                  <span class="text-xs text-muted-foreground">(You)</span>
                {/if}
              </div>
            </div>
            
            {#if member !== data.teamMembers[data.teamMembers.length - 1]}
              <Separator />
            {/if}
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>