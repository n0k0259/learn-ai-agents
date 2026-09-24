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

test('lessons carry no per-page attribution; credits live on the About page', async ({ page }) => {
	await page.goto('chapter-1/01-what-is-an-agent/');
	await expect(page.getByText('Read the original section')).toHaveCount(0);
	await page.goto('chapter-2/01-context-and-message-roles/');
	await expect(page.getByText('Read the original section')).toHaveCount(0);
	await page.goto('about/');
	await expect(page.locator('main')).toContainText('Bojie Li');
	await expect(page.locator('main a[href*="apache.org/licenses/LICENSE-2.0"]')).toHaveCount(1);
});

test('the author name appears only on the About page', async ({ request }) => {
	const sitemap = await (await request.get('sitemap-0.xml')).text();
	const paths = [...sitemap.matchAll(/<loc>[^<]*\/learn-ai-agents\/([^<]*)<\/loc>/g)].map((m) => m[1]);
	expect(paths.length).toBeGreaterThan(20);
	for (const path of [...paths, '404.html']) {
		if (path === 'about/') continue;
		const html = await (await request.get(path)).text();
		expect(html, path).not.toMatch(/Bojie|AI Agent Book/);
	}
});
