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

		// Resolves ANY computed CSS color (rgb(), oklch(), color(), color-mix(), ...) to concrete
		// sRGB bytes via the canvas 2D color parser, instead of regex-matching rgb()/rgba() text
		// (which silently misses the non-rgb serializations Chromium can return for computed `fill`).
		const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
		const UNRESOLVED = 'rgba(1, 2, 3, 0.502)'; // sentinel: no real computed color should equal this
		const parse = (input: string): RGBA | null => {
			if (!input || input === 'none') return null;
			probe.fillStyle = UNRESOLVED;
			probe.fillStyle = input;
			// Per the Canvas2D spec, an unparseable value leaves fillStyle unchanged.
			if ((probe.fillStyle as unknown as string) === UNRESOLVED) return null;
			probe.clearRect(0, 0, 1, 1);
			probe.fillRect(0, 0, 1, 1);
			const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
			return { r, g, b, a: a / 255 };
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

		// Multiplies an element's own computed opacity with every ancestor <g>'s computed opacity,
		// up to (not including) the svg root. The audit always runs with no step active, so
		// StepAnimator's dimming classes (which set opacity < 1) must never apply at rest.
		const effectiveOpacity = (el: Element): number => {
			let node: Element | null = el;
			let total = 1;
			while (node && node.tagName.toLowerCase() !== 'svg') {
				total *= parseFloat(getComputedStyle(node).opacity || '1');
				node = node.parentElement;
			}
			return total;
		};

		// Every source of alpha that can make a fill render less than fully solid: ancestor + own
		// CSS opacity (effectiveOpacity), the element's own fill-opacity property, and the alpha
		// channel baked into its resolved fill color itself (e.g. an rgba()/hsla() fill). Missing
		// any one of these lets a genuinely translucent fill pass a full-opacity contrast check
		// silently. `fillColor` is null for `fill: none`, which contributes no color alpha (nothing
		// to blend), so only the opacity/fill-opacity factors apply there — the existing fill:none
		// exemption from color-alpha checks is preserved.
		const totalAlpha = (el: Element, fillColor: RGBA | null): number => {
			const fillOpacity = parseFloat(getComputedStyle(el).fillOpacity || '1');
			return effectiveOpacity(el) * fillOpacity * (fillColor?.a ?? 1);
		};

		// Alpha-composites a foreground color over a background with the standard "over" operator,
		// so contrast checks evaluate the color that actually renders, not the raw (possibly
		// translucent) fill.
		const composite = (fg: RGBA, bg: RGBA, alpha: number): RGBA => ({
			r: fg.r * alpha + bg.r * (1 - alpha),
			g: fg.g * alpha + bg.g * (1 - alpha),
			b: fg.b * alpha + bg.b * (1 - alpha),
			a: 1,
		});
		const visibleColor = (fg: RGBA, bg: RGBA, alpha: number) => (alpha < 1 - 1e-3 ? composite(fg, bg, alpha) : fg);

		const rawPageBg = parse(getComputedStyle(document.body).backgroundColor);
		if (!rawPageBg || rawPageBg.a === 0)
			problems.push(
				`page background color could not be resolved for contrast checks (got "${getComputedStyle(document.body).backgroundColor}")`,
			);
		const pageBg: RGBA = rawPageBg && rawPageBg.a > 0 ? rawPageBg : { r: 255, g: 255, b: 255, a: 1 };

		document.querySelectorAll<SVGSVGElement>('svg.dg').forEach((svg, i) => {
			const titleEl = svg.querySelector(':scope > title');
			const descEl = svg.querySelector(':scope > desc');
			const name = titleEl?.textContent?.trim() || `diagram #${i + 1}`;
			const vb = svg.viewBox.baseVal;
			const svgRect = svg.getBoundingClientRect();
			const scale = svgRect.width / vb.width;

			if (!titleEl || !descEl) problems.push(`${name}: missing direct <title> or <desc>`);
			const ids = (svg.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
			const expectedIds = [titleEl?.id, descEl?.id].filter((x): x is string => Boolean(x));
			if (ids.length !== 2 || expectedIds.length !== 2 || [...ids].sort().join(' ') !== [...expectedIds].sort().join(' '))
				problems.push(`${name}: aria-labelledby must reference exactly the title and desc ids`);
			if (svg.getAttribute('role') !== 'img') problems.push(`${name}: role="img" missing`);
			if (vb.width > 720) problems.push(`${name}: viewBox width ${vb.width} exceeds 720`);

			svg.querySelectorAll<SVGElement>('rect[transform], text[transform]').forEach((el) => {
				problems.push(`${name}: <${el.tagName.toLowerCase()}> ${snippet(el)} must not have a transform attribute (only <g> may)`);
			});

			svg.querySelectorAll<SVGTextElement>('text').forEach((t) => {
				const style = getComputedStyle(t);
				const px = parseFloat(style.fontSize) * scale;
				if (px < 13.9) problems.push(`${name}: text ${snippet(t)} renders at ${px.toFixed(1)}px (< 14px)`);
				if (!inside(t.getBoundingClientRect(), svgRect, 2 * scale))
					problems.push(`${name}: text ${snippet(t)} overflows the viewBox`);
				const owner = t.parentElement?.closest('g.dg-node, g.dg-container');
				if (owner && t.parentElement !== owner)
					problems.push(`${name}: text ${snippet(t)} must be a direct child of its dg-node/dg-container`);

				const raw = style.fill;
				const c = raw === 'none' ? null : parse(raw);
				if (!owner && raw !== 'none' && !c) problems.push(`${name}: text ${snippet(t)} has an unparseable fill "${raw}"`);

				// Own + ancestor opacity, own fill-opacity, AND the fill color's own alpha channel (e.g.
				// `fill: rgba(15,23,42,0.3)`) all count toward "not fully opaque".
				const alpha = totalAlpha(t, c);
				if (alpha < 1 - 1e-3)
					problems.push(
						`${name}: text ${snippet(t)} has effective opacity ${alpha.toFixed(2)} (< 1); contrast checks assume full opacity`,
					);

				if (!owner && c) {
					const visible = visibleColor(c, pageBg, alpha);
					const ratio = contrast(visible, pageBg);
					if (ratio < 4.5) problems.push(`${name}: text ${snippet(t)} contrast ${ratio.toFixed(2)} < 4.5 vs page`);
				}
			});

			svg.querySelectorAll<SVGGElement>('g.dg-node, g.dg-container').forEach((g) => {
				const rect = g.querySelector<SVGRectElement>(':scope > rect');
				if (!rect) {
					problems.push(`${name}: ${g.getAttribute('class')} has no direct <rect>`);
					return;
				}
				const rawFill = getComputedStyle(rect).fill;
				const fill = rawFill === 'none' ? null : parse(rawFill);
				if (rawFill !== 'none' && !fill) problems.push(`${name}: ${g.getAttribute('class')} rect has an unparseable fill "${rawFill}"`);

				// Own + ancestor opacity, the rect's own fill-opacity property, AND the fill color's own
				// alpha channel all count — e.g. `fill: rgb(200,50,50); fill-opacity: 0.3` must be caught
				// even though the resolved fill color itself is fully opaque. `fill: none` contributes no
				// color alpha (nothing to blend), preserving the existing exemption there.
				const rectAlpha = totalAlpha(rect, fill);
				if (rectAlpha < 1 - 1e-3)
					problems.push(
						`${name}: ${g.getAttribute('class')} rect has effective opacity ${rectAlpha.toFixed(2)} (< 1); contrast checks assume full opacity`,
					);
				const bg = fill && fill.a > 0 ? visibleColor(fill, pageBg, rectAlpha) : pageBg;

				g.querySelectorAll<SVGTextElement>(':scope > text').forEach((t) => {
					if (!inside(t.getBBox(), rect.getBBox(), 4)) problems.push(`${name}: text ${snippet(t)} overflows its box`);
					const raw = getComputedStyle(t).fill;
					const c = raw === 'none' ? null : parse(raw);
					if (raw !== 'none' && !c) problems.push(`${name}: text ${snippet(t)} has an unparseable fill "${raw}"`);
					if (c) {
						const alpha = totalAlpha(t, c);
						const visible = visibleColor(c, bg, alpha);
						const ratio = contrast(visible, bg);
						if (ratio < 4.5) problems.push(`${name}: text ${snippet(t)} contrast ${ratio.toFixed(2)} < 4.5 vs its box`);
					}
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
