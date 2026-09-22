import { test, expect } from '@playwright/test';

test('home page renders the site title', async ({ page }) => {
	await page.goto('');
	await expect(page).toHaveTitle(/Learn AI Agents/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Learn AI Agents');
});

test('about page credits the original author and license', async ({ page }) => {
	await page.goto('about/');
	await expect(page.getByText('Bojie Li').first()).toBeVisible();
	await expect(page.getByRole('link', { name: 'Apache License 2.0' }).first()).toBeVisible();
});
