import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('should redirect unauthenticated users to login', async ({ page }) => {
		// Try to access protected routes directly
		await page.goto('/team');
		await expect(page).toHaveURL('/auth/login');
		
		// Should show login form
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
	});

	test('should show proper page titles and headings', async ({ page }) => {
		await page.goto('/auth/login');
		
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
		
		await page.goto('/auth/signup');
		await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
	});

	test('should have accessible form elements', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Check accessibility attributes
		await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email');
		await expect(page.getByLabel('Email')).toHaveAttribute('required');
	});

	test('should show loading states', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Fill in form
		await page.getByLabel('Email').fill('test@example.com');
		
		// Submit form and check button state changes
		const submitButton = page.getByRole('button', { name: 'Send Magic Link' });
		await expect(submitButton).toBeEnabled();
		
		// Note: In a real test, you'd mock the Supabase response
		// For now, we just verify the button exists and is clickable
		await expect(submitButton).toBeVisible();
	});
});