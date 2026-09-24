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

test('chapter 2 overview links to all 10 lessons', async ({ page }) => {
	await page.goto('chapter-2/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chapter 2: Context Engineering');
	await expect(page.locator('main a[href*="/chapter-2/"]:not([rel])')).toHaveCount(10);
});

test('sidebar shows the chapter 2 group', async ({ page }) => {
	await page.goto('chapter-2/01-context-and-message-roles/');
	await expect(page.locator('nav[aria-label="Main"]')).toContainText('Chapter 2: Context Engineering');
});

test('home page links to chapter 2', async ({ page }) => {
	await page.goto('');
	await expect(page.locator('main a[href="/learn-ai-agents/chapter-2/"]').first()).toBeVisible();
});
