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

test('home page links to chapter 1', async ({ page }) => {
	await page.goto('');
	await page.getByRole('link', { name: 'Start Chapter 1' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chapter 1: Getting Started with AI Agents');
});

test('chapter overview links to all 8 lessons', async ({ page }) => {
	await page.goto('chapter-1/');
	// :not([rel]) excludes the prev/next pagination links
	await expect(page.locator('main a[href*="/chapter-1/0"]:not([rel])')).toHaveCount(8);
});
