import { expect, test } from '@playwright/test';

test('home page redirects to login', async ({ page }) => {
	await page.goto('/');
	// Should redirect to login page
	await expect(page).toHaveURL('/auth/login');
	await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
});
