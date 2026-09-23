import { test, expect } from '@playwright/test';

test('step and reset drive the highlighted step', async ({ page }) => {
	await page.goto('style-guide/');
	const anim = page.locator('[data-animator]').first();
	const first = anim.locator('[data-step="1"]').first();
	await expect(anim).not.toHaveClass(/is-stepping/);
	await anim.getByRole('button', { name: 'Step' }).click();
	await expect(anim).toHaveClass(/is-stepping/);
	await expect(first).toHaveClass(/is-current/);
	await expect(anim.locator('[data-status]')).toContainText('Step 1 of');
	await anim.getByRole('button', { name: 'Step' }).click();
	await expect(first).toHaveClass(/is-past/);
	await anim.getByRole('button', { name: 'Reset' }).click();
	await expect(anim).not.toHaveClass(/is-stepping/);
	await expect(anim.locator('[data-status]')).toHaveText('');
});

test('play advances automatically and toggles to pause', async ({ page }) => {
	await page.goto('style-guide/');
	const anim = page.locator('[data-animator]').first();
	await anim.getByRole('button', { name: 'Play' }).click();
	await expect(anim.getByRole('button', { name: 'Pause' })).toBeVisible();
	await expect(anim.locator('[data-status]')).toContainText('Step 2 of', { timeout: 4000 });
});

test('reduced motion hides Play and keeps the full diagram visible', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('style-guide/');
	const anim = page.locator('[data-animator]').first();
	await expect(anim.getByRole('button', { name: 'Play' })).toBeHidden();
	await expect(anim.getByRole('button', { name: 'Step' })).toBeVisible();
	await expect(anim).not.toHaveClass(/is-stepping/);
});

test('wide diagrams scroll with a hint on mobile only', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto('style-guide/');
	const fig = page.locator('figure.dg-figure').first();
	await expect(fig).toHaveAttribute('data-overflowing', '');
	await expect(fig.locator('.dg-scroll-hint')).toBeVisible();
	await page.setViewportSize({ width: 1280, height: 900 });
	await expect(fig).not.toHaveAttribute('data-overflowing', '');
	await expect(fig.locator('.dg-scroll-hint')).toBeHidden();
});
