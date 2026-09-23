import { test, expect, type Page } from '@playwright/test';
import { DIAGRAM_PAGES } from './diagram-pages';

const THEMES = ['light', 'dark'] as const;
const VIEWPORTS = {
	desktop: { width: 1280, height: 900 },
	mobile: { width: 360, height: 800 },
} as const;

// Runs in the browser. Returns human-readable problems; an empty array means every diagram passes.
function auditDiagrams(page: Page) {
	return page.evaluate(() => {
		type RGBA = { r: number; g: number; b: number; a: number };
		const problems: string[] = [];
		const parse = (c: string): RGBA | null => {
			const m = c.match(/rgba?\(([^)]+)\)/);
			if (!m) return null;
			const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
			return { r, g, b, a };
		};
		const lum = ({ r, g, b }: RGBA) => {
			const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
			return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
		};
		const contrast = (a: RGBA, b: RGBA) => {
			const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};
		const inside = (i: DOMRect, o: { x: number; y: number; width: number; height: number }, pad: number) =>
			i.x >= o.x + pad - 0.5 &&
			i.y >= o.y + pad - 0.5 &&
			i.x + i.width <= o.x + o.width - pad + 0.5 &&
			i.y + i.height <= o.y + o.height - pad + 0.5;
		const snippet = (t: Element) => `"${(t.textContent ?? '').trim().slice(0, 40)}"`;
		const pageBg = parse(getComputedStyle(document.body).backgroundColor)!;

		document.querySelectorAll<SVGSVGElement>('svg.dg').forEach((svg, i) => {
			const name = svg.querySelector(':scope > title')?.textContent?.trim() || `diagram #${i + 1}`;
			const vb = svg.viewBox.baseVal;
			const scale = svg.getBoundingClientRect().width / vb.width;

			if (!svg.querySelector(':scope > title') || !svg.querySelector(':scope > desc'))
				problems.push(`${name}: missing direct <title> or <desc>`);
			const ids = (svg.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
			if (ids.length < 2 || ids.some((id) => !document.getElementById(id)))
				problems.push(`${name}: aria-labelledby must reference the title and desc ids`);
			if (svg.getAttribute('role') !== 'img') problems.push(`${name}: role="img" missing`);
			if (vb.width > 720) problems.push(`${name}: viewBox width ${vb.width} exceeds 720`);

			svg.querySelectorAll<SVGTextElement>('text').forEach((t) => {
				const px = parseFloat(getComputedStyle(t).fontSize) * scale;
				if (px < 13.9) problems.push(`${name}: text ${snippet(t)} renders at ${px.toFixed(1)}px (< 14px)`);
				if (!inside(t.getBBox(), vb, 2)) problems.push(`${name}: text ${snippet(t)} overflows the viewBox`);
				const owner = t.parentElement?.closest('g.dg-node, g.dg-container');
				if (owner && t.parentElement !== owner)
					problems.push(`${name}: text ${snippet(t)} must be a direct child of its dg-node/dg-container`);
				if (!owner) {
					const c = parse(getComputedStyle(t).fill);
					if (c && contrast(c, pageBg) < 4.5)
						problems.push(`${name}: text ${snippet(t)} contrast ${contrast(c, pageBg).toFixed(2)} < 4.5 vs page`);
				}
			});

			svg.querySelectorAll<SVGGElement>('g.dg-node, g.dg-container').forEach((g) => {
				const rect = g.querySelector<SVGRectElement>(':scope > rect');
				if (!rect) {
					problems.push(`${name}: ${g.getAttribute('class')} has no direct <rect>`);
					return;
				}
				const fill = parse(getComputedStyle(rect).fill);
				const bg = fill && fill.a > 0 ? fill : pageBg;
				g.querySelectorAll<SVGTextElement>(':scope > text').forEach((t) => {
					if (!inside(t.getBBox(), rect.getBBox(), 4)) problems.push(`${name}: text ${snippet(t)} overflows its box`);
					const c = parse(getComputedStyle(t).fill);
					if (c && contrast(c, bg) < 4.5)
						problems.push(`${name}: text ${snippet(t)} contrast ${contrast(c, bg).toFixed(2)} < 4.5 vs its box`);
				});
			});

			const nodes = [...svg.querySelectorAll<SVGGElement>('g.dg-node')];
			for (let a = 0; a < nodes.length; a++) {
				for (let b = a + 1; b < nodes.length; b++) {
					if (nodes[a].contains(nodes[b]) || nodes[b].contains(nodes[a])) continue;
					const ra = nodes[a].querySelector(':scope > rect')?.getBoundingClientRect();
					const rb = nodes[b].querySelector(':scope > rect')?.getBoundingClientRect();
					if (!ra || !rb) continue;
					const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
					const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
					if (w > 1 && h > 1)
						problems.push(`${name}: boxes ${snippet(nodes[a].querySelector('text')!)} and ${snippet(nodes[b].querySelector('text')!)} overlap`);
				}
			}
		});
		return problems;
	});
}

for (const path of DIAGRAM_PAGES) {
	for (const theme of THEMES) {
		for (const [viewport, size] of Object.entries(VIEWPORTS)) {
			test(`diagrams pass audit: ${path} (${theme}, ${viewport})`, async ({ page }) => {
				await page.setViewportSize(size);
				await page.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme);
				await page.goto(path);
				await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
				expect(await page.locator('svg.dg').count()).toBeGreaterThan(0);

				const slug = path.replace(/\/$/, '').replace(/\//g, '_') || 'home';
				const figures = page.locator('figure.dg-figure');
				for (let i = 0; i < (await figures.count()); i++) {
					await figures.nth(i).screenshot({ path: `diagram-shots/${slug}-${i + 1}-${theme}-${viewport}.png` });
				}
				expect(await auditDiagrams(page)).toEqual([]);
			});
		}
	}
}
