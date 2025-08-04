import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Start from the home page
		await page.goto('/');
	});

	test('should redirect to login page when not authenticated', async ({ page }) => {
		// Should redirect to login page
		await expect(page).toHaveURL('/auth/login');
		
		// Should show login form with magic link
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send Magic Link' })).toBeVisible();
	});

	test('should show validation errors for invalid login', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Try to submit with empty fields
		await page.getByRole('button', { name: 'Send Magic Link' }).click();
		
		// HTML5 validation should prevent submission
		await expect(page.getByLabel('Email')).toHaveAttribute('required');
	});

	test('should navigate to signup page', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Click sign up link
		await page.getByRole('link', { name: 'Sign up' }).click();
		
		// Should navigate to signup page
		await expect(page).toHaveURL('/auth/signup');
		await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
	});

	test('should show validation errors for invalid signup', async ({ page }) => {
		await page.goto('/auth/signup');
		
		// Try to submit with empty email
		await page.getByRole('button', { name: 'Send Magic Link' }).click();
		
		// HTML5 validation should prevent submission
		await expect(page.getByLabel('Email')).toHaveAttribute('required');
	});

	test('should navigate between login and signup pages', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Go to signup
		await page.getByRole('link', { name: 'Sign up' }).click();
		await expect(page).toHaveURL('/auth/signup');
		
		// Go back to login
		await page.getByRole('link', { name: 'Sign in' }).click();
		await expect(page).toHaveURL('/auth/login');
	});

	test('should show appropriate form elements on each page', async ({ page }) => {
		// Login page
		await page.goto('/auth/login');
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send Magic Link' })).toBeVisible();
		
		// Signup page  
		await page.goto('/auth/signup');
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send Magic Link' })).toBeVisible();
	});
});