<script lang="ts">
  import { enhance } from '$app/forms';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Separator } from '$lib/components/ui/separator';
  import { Mail, Building2, UserPlus, AlertCircle, CheckCircle2 } from '@lucide/svelte';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let loading = false;
  let signupEmail = data.invite.email;

  function getRoleDisplayName(role: string) {
    switch (role) {
      case 'owner': return 'Owner';
      case 'admin': return 'Administrator';
      case 'member': return 'Member';
      default: return role;
    }
  }
</script>

<svelte:head>
  <title>Join {data.invite.organizations?.[0]?.name} - Organization Invite</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <Card>
      <CardHeader class="text-center space-y-4">
        <div class="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <Building2 class="h-8 w-8 text-indigo-600" />
        </div>
        
        <div>
          <CardTitle class="text-2xl">You've been invited!</CardTitle>
          <CardDescription class="text-base mt-2">
            Join <strong>{data.invite.organizations?.[0]?.name}</strong> as a {getRoleDisplayName(data.invite.role)}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Invite Details -->
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <Mail class="h-4 w-4 text-gray-500" />
            <span class="text-gray-600">Invited email:</span>
            <span class="font-medium">{data.invite.email}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <UserPlus class="h-4 w-4 text-gray-500" />
            <span class="text-gray-600">Role:</span>
            <span class="font-medium">{getRoleDisplayName(data.invite.role)}</span>
          </div>
        </div>

        <!-- Success/Error Messages -->
        {#if form?.success}
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="h-5 w-5 text-green-600" />
              <p class="text-green-700 font-medium">Success!</p>
            </div>
            <p class="text-green-600 text-sm mt-1">{form.message}</p>
          </div>
        {/if}

        {#if form?.message && !form?.success}
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <AlertCircle class="h-5 w-5 text-red-600" />
              <p class="text-red-700 font-medium">Error</p>
            </div>
            <p class="text-red-600 text-sm mt-1">{form.message}</p>
          </div>
        {/if}

        <!-- Different UI based on user state -->
        {#if data.canAcceptDirectly}
          <!-- User is logged in with correct email -->
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-blue-700 text-sm">
                You're logged in as <strong>{data.currentUserEmail}</strong>
              </p>
            </div>
            
            <form method="POST" action="?/accept" use:enhance={() => {
              loading = true;
              return async ({ update }) => {
                loading = false;
                await update();
              };
            }}>
              <Button type="submit" disabled={loading} class="w-full gap-2">
                <Building2 class="h-4 w-4" />
                {loading ? 'Joining...' : `Join ${data.invite.organizations?.[0]?.name}`}
              </Button>
            </form>
          </div>

        {:else if data.wrongUser}
          <!-- User is logged in with wrong email -->
          <div class="space-y-4">
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div class="flex items-center gap-2">
                <AlertCircle class="h-5 w-5 text-orange-600" />
                <p class="text-orange-700 font-medium">Wrong account</p>
              </div>
              <p class="text-orange-600 text-sm mt-1">
                You're logged in as <strong>{data.currentUserEmail}</strong>, but this invite is for <strong>{data.invite.email}</strong>.
              </p>
            </div>
            
            <div class="space-y-3">
              <Button href="/auth/logout" variant="outline" class="w-full">
                Sign out and use different account
              </Button>
              <p class="text-xs text-gray-500 text-center">
                Or contact your administrator if you think this is a mistake
              </p>
            </div>
          </div>

        {:else}
          <!-- User not logged in - show signup/login options -->
          <div class="space-y-4">
            <p class="text-sm text-gray-600 text-center">
              To accept this invitation, sign up or log in with the invited email address
            </p>
            
            <Separator />
            
            <!-- Sign up form -->
            <form method="POST" action="?/signup" use:enhance={() => {
              loading = true;
              return async ({ update }) => {
                loading = false;
                await update();
              };
            }} class="space-y-4">
              <div>
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  bind:value={signupEmail}
                  placeholder="Enter your email"
                  required
                  readonly
                  class="bg-gray-50"
                />
                <p class="text-xs text-gray-500 mt-1">
                  This must match the invited email address
                </p>
              </div>
              
              <Button type="submit" disabled={loading} class="w-full gap-2">
                <Mail class="h-4 w-4" />
                {loading ? 'Sending...' : 'Sign up & Join Organization'}
              </Button>
            </form>
            
            <div class="text-center">
              <p class="text-sm text-gray-500">
                Already have an account? <a href="/auth/login" class="text-indigo-600 hover:text-indigo-500">Sign in instead</a>
              </p>
            </div>
          </div>
        {/if}

        <!-- Expiry info -->
        <div class="text-center pt-4 border-t">
          <p class="text-xs text-gray-500">
            This invitation expires on {new Date(data.invite.expires_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</div>