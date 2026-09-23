import { test, expect } from '@playwright/test';

test('quiz reveals its answer on click', async ({ page }) => {
	await page.goto('style-guide/');
	const quiz = page.locator('details.quiz').first();
	await expect(quiz.locator('.quiz-answer')).toBeHidden();
	await quiz.locator('summary').click();
	await expect(quiz.locator('.quiz-answer')).toBeVisible();
});

test('key takeaways box is labelled for assistive tech', async ({ page }) => {
	await page.goto('style-guide/');
	await expect(page.getByRole('complementary', { name: 'Key takeaways' })).toBeVisible();
});

test('pages with a source show the attribution footer', async ({ page }) => {
	await page.goto('chapter-1/01-what-is-an-agent/');
	const attribution = page.locator('.lesson-attribution');
	await expect(attribution).toContainText('Bojie Li');
	await expect(attribution.getByRole('link', { name: 'Read the original section →' })).toHaveAttribute(
		'href',
		/github\.com\/bojieli\/ai-agent-book\/blob\/main\/book-en\/chapter1\.md/,
	);
});

test('the chapter overview footer links to the original chapter', async ({ page }) => {
	await page.goto('chapter-1/');
	const attribution = page.locator('.lesson-attribution');
	await expect(attribution).toContainText('This page summarizes the original chapter.');
	await expect(attribution.getByRole('link', { name: 'Read the original chapter →' })).toHaveAttribute(
		'href',
		/github\.com\/bojieli\/ai-agent-book\/blob\/main\/book-en\/chapter1\.md/,
	);
});

test('pages without a source have no attribution footer', async ({ page }) => {
	await page.goto('about/');
	await expect(page.locator('.lesson-attribution')).toHaveCount(0);
});
