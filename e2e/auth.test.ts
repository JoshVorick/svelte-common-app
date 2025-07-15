import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Start from the home page
		await page.goto('/');
	});

	test('should redirect to login page when not authenticated', async ({ page }) => {
		// Should redirect to login page
		await expect(page).toHaveURL('/auth/login');
		
		// Should show login form
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
	});

	test('should show validation errors for invalid login', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Try to submit with empty fields
		await page.getByRole('button', { name: 'Sign In' }).click();
		
		// HTML5 validation should prevent submission
		await expect(page.getByLabel('Email')).toHaveAttribute('required');
		await expect(page.getByLabel('Password')).toHaveAttribute('required');
	});

	test('should navigate to signup page', async ({ page }) => {
		await page.goto('/auth/login');
		
		// Click sign up link
		await page.getByRole('link', { name: 'Sign up' }).click();
		
		// Should navigate to signup page
		await expect(page).toHaveURL('/auth/signup');
		await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
	});

	test('should show validation errors for invalid signup', async ({ page }) => {
		await page.goto('/auth/signup');
		
		// Fill in mismatched passwords
		await page.getByLabel('Email').fill('test@example.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByLabel('Confirm Password').fill('password456');
		
		// Try to submit
		await page.getByRole('button', { name: 'Sign Up' }).click();
		
		// Should show password mismatch error
		await expect(page.getByText('Passwords do not match')).toBeVisible();
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
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByLabel('Confirm Password')).not.toBeVisible();
		
		// Signup page
		await page.goto('/auth/signup');
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByLabel('Confirm Password')).toBeVisible();
	});
});