# Learn AI Agents — Chapter 1 Tutorial Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish an Astro Starlight site at https://n0k0259.github.io/learn-ai-agents/ that teaches Chapter 1 of Bojie Li's *AI Agent Book* to software engineers as 8 short lessons with custom color-coded SVG diagrams, callouts, key takeaways, and quizzes.

**Architecture:** Static Starlight site. Lessons are MDX files in `src/content/docs/chapter-1/`. Diagrams are hand-written inline SVG Astro components that share one CSS color system with light and dark themes. A `Figure` wrapper handles captions and mobile scrolling, and a `StepAnimator` wrapper adds Play/Step/Reset controls. A Footer override adds Apache 2.0 attribution to every page that declares a `source` in its frontmatter. Quality gates:
- a Node script that checks lesson structure and that every original section is covered;
- Playwright tests for components and animation;
- an automated diagram audit (text overflow, overlap, font size, contrast, accessibility) that runs in light and dark themes on desktop and mobile and saves screenshots for visual review.

**Tech Stack:** Node 22, Astro ^7.2.10, @astrojs/starlight ^0.42.3, starlight-links-validator ^0.26.0, @playwright/test ^1.63.0, yaml ^2.9.1, GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-22-chapter1-tutorial-site-design.md`

**Source material (already in repo, Apache 2.0):**
- `source/book-en/chapter1.md` — the original chapter (572 lines). Line numbers below refer to this file.
- `source/book-en/reference-answers.md` — lines 5–51 are the Chapter 1 thought-question answers.
- `source/book-en/images/` — original figures (for reference only; they are all redrawn).
- `source/LICENSE` — original Apache 2.0 license.

## Global Constraints

- Site URL: `site: 'https://n0k0259.github.io'`, `base: '/learn-ai-agents'`. GitHub repo: `n0k0259/learn-ai-agents`.
- Internal Markdown/MDX links and hero `link:` values include the base: `/learn-ai-agents/...`.
- Audience is software engineers: concise and precise, focused on interfaces, data flow, trade-offs, and failure modes. Use second person, active voice, and paragraphs of at most 4 sentences. Target 1,200–2,200 words per lesson.
- Preserve every concept, named example, number, and table from each lesson's mapped source sections. Do not add facts that are not in the source. "Engineer additions" (code, tables, checklists) must only restate or concretize source concepts. Label illustrative code in the code block title, e.g. `title="react_loop.py (illustrative)"`.
- When the text and the original figures disagree, follow the text (the original Fig 1-3 and Fig 1-4 are out of date).
- Keep source footnote URLs as inline links or in a `### References` list.
- Book cross-references stay as plain text, e.g. "(covered in Chapter 4 of the book)".
- No Mermaid, no React/Vue/Svelte, no client JS framework. Client JS is only allowed in `Figure.astro` and `StepAnimator.astro`.
- Lesson template, in order: `:::tip[TL;DR]` block → content (with `:::note[Engineer's note]` callouts where relevant) → `<KeyTakeaways>` → optional `### References` → `## Check yourself` with 2–4 `<Quiz>` items. The attribution footer is automatic.
- Attribution for redrawn original figures: `credit="Redrawn from Figure 1-N, AI Agent Book by Bojie Li (Apache 2.0)."`. New diagrams have no credit.
- **Diagram rules** (enforced by `tests/diagrams.spec.ts`):
  - Root is `<svg class="dg" viewBox="0 0 W H" role="img" aria-labelledby="{prefix}-title {prefix}-desc" style="min-width: Mpx">` with `<title id="{prefix}-title">` and `<desc id="{prefix}-desc">` as its first children.
  - `W ≤ 720`, and `M = ceil(0.875 × W)`.
  - Minimum font size is 16 (viewBox units) and titles are 20. Rendered text must be ≥ 14px at every viewport.
  - Every labelled box is `<g class="dg-node dg-{concept}">` with one direct `<rect>` and direct `<text>` children. Grouping boxes are `<g class="dg-container dg-{concept}">`.
  - Text never goes deeper than a direct child of its node or container. Put `transform` attributes only on `<g>`, never on `rect` or `text`.
  - Concepts: `model`, `context`, `tools`, `env`, `harness`, `guard`, `neutral`.
  - Edges: `<g class="dg-edge">` holding a `<path>` or `<line>` with `marker-end="url(#{prefix}-arrow)"`. Edge labels use `<text class="dg-edge-label">`.
  - Element ids are prefixed with the diagram's kebab-case prefix (e.g. `d-ael-`), so several diagrams can share one page.
  - Text contrast must be ≥ 4.5:1 against its box fill, or against the page background for free text.
  - Nodes must not overlap each other unless one is nested inside the other.
  - Animated diagrams put `data-step="n"` (1-based) on nodes and edges, and `data-step-label="…"` on exactly one element per step.
- Concept colors are defined once in `src/styles/diagrams.css` (Task 3). Never hard-code hex values in diagram components.
- Every task ends with a commit whose message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## File Structure

```
ai_agent_book/
├── astro.config.mjs                     # site/base, Starlight config, sidebar, plugins, overrides
├── package.json                         # scripts: dev, build, preview, check:lessons, test:e2e, test
├── tsconfig.json                        # "~/*" → "src/*" import alias
├── playwright.config.ts                 # runs tests against `astro preview` at the base path
├── LICENSE / NOTICE                     # Apache 2.0 + attribution/modification statement
├── .gitignore
├── .github/workflows/deploy.yml         # verify (checks + tests) → build → deploy Pages
├── scripts/check-lessons.mjs            # lesson structure + section-coverage checker
├── source/                              # original book material (read-only reference)
├── src/
│   ├── content.config.ts                # docs collection with `source` frontmatter extension
│   ├── content/docs/
│   │   ├── index.mdx                    # landing page (splash)
│   │   ├── about.mdx                    # credits + license + what changed
│   │   ├── style-guide.mdx              # hidden: component demos, color legend, all diagrams
│   │   └── chapter-1/
│   │       ├── index.mdx                # chapter overview + lesson cards
│   │       └── 01-…08-*.mdx             # lessons
│   ├── components/
│   │   ├── overrides/Footer.astro       # attribution footer (pages with `source` frontmatter)
│   │   ├── Quiz.astro                   # <details> question/answer
│   │   ├── KeyTakeaways.astro           # labelled takeaway box
│   │   ├── Figure.astro                 # caption, credit, horizontal-scroll wrapper + hint
│   │   ├── StepAnimator.astro           # Play/Step/Reset over [data-step] elements
│   │   └── diagrams/
│   │       ├── ConceptLegend.astro      # color legend (also the animator demo)
│   │       └── chapter-1/*.astro        # 15 lesson diagrams
│   └── styles/
│       ├── custom.css                   # small site-wide tweaks
│       └── diagrams.css                 # concept color variables + diagram/animator styles
└── tests/
    ├── smoke.spec.ts
    ├── components.spec.ts
    ├── animator.spec.ts
    ├── diagram-pages.ts                 # list of pages whose diagrams get audited
    └── diagrams.spec.ts                 # diagram audit + screenshots → diagram-shots/
```

---

### Task 1: Scaffold the Starlight site with license, about page, and smoke tests

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`, `src/content/docs/index.mdx`, `src/content/docs/about.mdx`, `LICENSE`, `NOTICE`, `.gitignore`, `playwright.config.ts`, `tests/smoke.spec.ts`
- Delete (from template): `src/content/docs/guides/`, `src/content/docs/reference/`

**Interfaces:**
- Produces: `npm run build`, `npm run preview`, `npm run test:e2e`. Playwright `baseURL` is `http://localhost:4321/learn-ai-agents/`, so tests call `page.goto('about/')` with relative paths.

- [ ] **Step 1: Scaffold into a temp dir and copy it in** (the project dir is not empty, so create-astro can't target it directly)

```bash
cd /Users/neeraj.kumar/Documents/personal_project/ai_agent_book
rm -rf /tmp/learn-ai-agents-scaffold
npm create astro@latest /tmp/learn-ai-agents-scaffold -- --template starlight --no-install --no-git --skip-houston --yes
rsync -a --exclude node_modules --exclude .git /tmp/learn-ai-agents-scaffold/ ./
rm -rf src/content/docs/guides src/content/docs/reference
npm pkg set name=learn-ai-agents
npm install
npm install -D @playwright/test@^1.63.0 starlight-links-validator@^0.26.0 yaml@^2.9.1
npx playwright install chromium
```

- [ ] **Step 2: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
test-results/
playwright-report/
diagram-shots/
.DS_Store
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
	site: 'https://n0k0259.github.io',
	base: '/learn-ai-agents',
	integrations: [
		starlight({
			title: 'Learn AI Agents',
			description: 'An engineer-focused guided tutorial of AI Agent Book by Bojie Li.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/n0k0259/learn-ai-agents' }],
			plugins: [starlightLinksValidator()],
			sidebar: [{ label: 'About & credits', slug: 'about' }],
		}),
	],
});
```

- [ ] **Step 4: Add scripts and the Playwright config**

```bash
npm pkg set scripts.check:lessons="node scripts/check-lessons.mjs"
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.test="astro build && npm run check:lessons && playwright test"
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	reporter: 'list',
	use: { baseURL: 'http://localhost:4321/learn-ai-agents/' },
	webServer: {
		command: 'npm run preview -- --port 4321',
		url: 'http://localhost:4321/learn-ai-agents/',
		reuseExistingServer: !process.env.CI,
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

The `test` script references `scripts/check-lessons.mjs`, which is created in Task 2. Until then, run `npx astro build && npx playwright test` directly.

- [ ] **Step 5: Write the failing smoke test** `tests/smoke.spec.ts`

```ts
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
```

- [ ] **Step 6: Run it and confirm it fails**

Run: `npx astro build && npx playwright test tests/smoke.spec.ts`
Expected: the build fails, either because the sidebar entry `about` has no page or because the template `index.mdx` links to deleted pages. If the build does pass, both tests fail (wrong title / 404).

- [ ] **Step 7: Write the landing page** `src/content/docs/index.mdx` (replaces the template's)

```mdx
---
title: Learn AI Agents
description: An engineer-focused guided tutorial of AI Agent Book by Bojie Li — short lessons, clear diagrams, and self-check quizzes.
template: splash
hero:
  tagline: A guided, engineer-focused walkthrough of Bojie Li's AI Agent Book — short lessons, clear diagrams, and self-check quizzes.
  actions:
    - text: About this tutorial
      link: /learn-ai-agents/about/
      icon: right-arrow
---
```

- [ ] **Step 8: Write the about page** `src/content/docs/about.mdx`

```mdx
---
title: About & credits
description: Where this tutorial's content comes from and how it is licensed.
---

This site is an engineer-focused tutorial adaptation of **AI Agent Book** by **Bojie Li** ([github.com/bojieli/ai-agent-book](https://github.com/bojieli/ai-agent-book)).

## License

The original book is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). This site is distributed under the same license; see `LICENSE` and `NOTICE` in the [site repository](https://github.com/n0k0259/learn-ai-agents).

## What was changed

- The original chapters were split into short lessons, and the prose was rewritten and condensed for software engineers.
- Every figure was redrawn in a new visual style, and several new diagrams were added.
- Illustrative code snippets, comparison tables, key-takeaway boxes, and quizzes were added. Quiz answers are based on the book's reference answers.
- Any errors introduced in the adaptation are ours, not the original author's.

This tutorial is not affiliated with or endorsed by the original author.
```

- [ ] **Step 9: Add `LICENSE` and `NOTICE`**

```bash
cp source/LICENSE LICENSE
head -3 LICENSE   # expect "Apache License" / "Version 2.0, January 2004"
```

`NOTICE`:

```
Learn AI Agents
Copyright 2026 n0k0259

This product includes material adapted from "AI Agent Book" by Bojie Li
(https://github.com/bojieli/ai-agent-book), licensed under the Apache License 2.0.

Modifications: the original text was split into lessons, rewritten and condensed;
all figures were redrawn; code examples, tables, diagrams and quizzes were added.
```

- [ ] **Step 10: Run the tests and confirm they pass**

Run: `npx astro build && npx playwright test tests/smoke.spec.ts`
Expected: build completes with no link-validator errors, and 2 tests pass.
If the links validator rejects `/learn-ai-agents/about/`, follow its error message about the base path (the fix is to adjust the link format, never to disable the validator).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Starlight site with about page, license and smoke tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Lesson infrastructure — attribution footer, Quiz, KeyTakeaways, lesson checker

**Files:**
- Modify: `src/content.config.ts`, `astro.config.mjs`, `tsconfig.json`
- Create: `src/components/overrides/Footer.astro`, `src/components/Quiz.astro`, `src/components/KeyTakeaways.astro`, `src/styles/custom.css`, `src/content/docs/style-guide.mdx`, `src/content/docs/chapter-1/index.mdx`, `scripts/check-lessons.mjs`, `tests/components.spec.ts`

**Interfaces:**
- Consumes: Task 1 config and test setup.
- Produces:
  - Frontmatter field `source: { url: string (URL), sections: string[] }`, optional.
  - `<Quiz question="…">answer markdown</Quiz>` renders `details.quiz > summary` + `.quiz-answer`.
  - `<KeyTakeaways>- bullets</KeyTakeaways>` renders `aside.key-takeaways[aria-label="Key takeaways"]`.
  - `.lesson-attribution` footer paragraph on any page with `source`.
  - `npm run check:lessons` exits non-zero on structure or coverage errors.
  - Import alias `~/…` → `src/…`.

- [ ] **Step 1: Write the failing component tests** `tests/components.spec.ts`

```ts
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
	await page.goto('chapter-1/');
	const attribution = page.locator('.lesson-attribution');
	await expect(attribution).toContainText('Bojie Li');
	await expect(attribution.getByRole('link', { name: 'Read the original section →' })).toHaveAttribute(
		'href',
		/github\.com\/bojieli\/ai-agent-book\/blob\/main\/book-en\/chapter1\.md/,
	);
});

test('pages without a source have no attribution footer', async ({ page }) => {
	await page.goto('about/');
	await expect(page.locator('.lesson-attribution')).toHaveCount(0);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx astro build && npx playwright test tests/components.spec.ts`
Expected: 3 of 4 tests FAIL (404 for `style-guide/` and `chapter-1/`). "pages without a source" passes.

- [ ] **Step 3: Extend the content schema** — replace `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Where this page's content comes from in the original book (drives the attribution footer)
				source: z
					.object({
						url: z.string().url(),
						sections: z.array(z.string()),
					})
					.optional(),
			}),
		}),
	}),
};
```

- [ ] **Step 4: Add the attribution footer override** `src/components/overrides/Footer.astro`

```astro
---
import Default from '@astrojs/starlight/components/Footer.astro';

const { entry } = Astro.locals.starlightRoute;
const source = entry.data.source;
---

{
	source && (
		<p class="lesson-attribution">
			Adapted from <cite>AI Agent Book</cite> by Bojie Li (
			<a href="https://github.com/bojieli/ai-agent-book">GitHub</a>), licensed under the{' '}
			<a href="https://www.apache.org/licenses/LICENSE-2.0">Apache License 2.0</a>. This lesson rewrites and
			restructures the original text. <a href={source.url}>Read the original section →</a>
		</p>
	)
}
<Default><slot /></Default>

<style>
	.lesson-attribution {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--sl-color-hairline);
		font-size: var(--sl-text-sm);
		color: var(--sl-color-gray-3);
	}
</style>
```

- [ ] **Step 5: Add `Quiz.astro` and `KeyTakeaways.astro`**

`src/components/Quiz.astro`:

```astro
---
interface Props {
	question: string;
}
const { question } = Astro.props;
---

<details class="quiz">
	<summary><span class="quiz-tag">Question</span> {question}</summary>
	<div class="quiz-answer"><slot /></div>
</details>

<style>
	.quiz {
		border: 1px solid var(--sl-color-gray-5);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		margin: 1rem 0;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		color: var(--sl-color-white);
	}
	.quiz-tag {
		font-size: var(--sl-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--sl-color-accent-high);
		margin-inline-end: 0.5rem;
	}
	.quiz-answer {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px dashed var(--sl-color-gray-5);
	}
</style>
```

`src/components/KeyTakeaways.astro`:

```astro
<aside class="key-takeaways" aria-label="Key takeaways">
	<p class="key-takeaways-title">Key takeaways</p>
	<slot />
</aside>

<style>
	.key-takeaways {
		border: 1px solid var(--sl-color-accent);
		border-inline-start-width: 4px;
		border-radius: 0.5rem;
		padding: 1rem 1.25rem;
		background: var(--sl-color-accent-low);
		margin: 2rem 0;
	}
	.key-takeaways-title {
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: var(--sl-color-white);
	}
</style>
```

- [ ] **Step 6: Add the import alias, custom CSS, and config changes**

In `tsconfig.json`, add `compilerOptions` (keep the existing `extends`/`include`/`exclude`):

```json
"compilerOptions": {
  "baseUrl": ".",
  "paths": { "~/*": ["src/*"] }
}
```

`src/styles/custom.css`:

```css
/* Site-wide tweaks. Diagram styles live in diagrams.css. */
.sl-markdown-content table {
	display: block;
	overflow-x: auto;
}
```

In `astro.config.mjs`, update the `starlight({...})` options:

```js
			customCss: ['./src/styles/custom.css'],
			components: { Footer: './src/components/overrides/Footer.astro' },
			sidebar: [
				{ label: 'Chapter 1: Getting Started with AI Agents', items: [{ autogenerate: { directory: 'chapter-1' } }] },
				{ label: 'About & credits', slug: 'about' },
			],
```

- [ ] **Step 7: Add the style guide page and chapter overview**

`src/content/docs/style-guide.mdx`:

```mdx
---
title: Style guide
description: Reference for the components and diagram conventions used in the lessons.
pagefind: false
---
import Quiz from '~/components/Quiz.astro';
import KeyTakeaways from '~/components/KeyTakeaways.astro';

This page documents the building blocks every lesson uses. It is not part of the tutorial itself.

## Lesson components

:::tip[TL;DR]
Every lesson opens with a two-to-three line summary like this one.
:::

:::note[Engineer's note]
Practical implications and pitfalls go in callouts like this.
:::

<KeyTakeaways>
- Takeaways are a short bullet list.
- One idea per bullet.
</KeyTakeaways>

<Quiz question="What does a quiz look like?">
A question with a click-to-reveal answer.
</Quiz>
```

`src/content/docs/chapter-1/index.mdx` (the lesson list is added in Task 12):

```mdx
---
title: "Chapter 1: Getting Started with AI Agents"
description: The conceptual map for the whole book — what an agent is, how its loop runs, and how to engineer it for production.
sidebar:
  order: 0
  label: Overview
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md
  sections: []
---

This chapter is the conceptual map for the rest of the book. It covers the core formula, the operating loop, the engineering framework, and the design patterns later chapters build on. Aim for the big picture on your first pass; each later chapter expands one idea introduced here.
```

- [ ] **Step 8: Write the lesson checker** `scripts/check-lessons.mjs`

```js
// Checks lesson structure and that every original Chapter 1 section is covered by exactly one lesson.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const LESSON_DIR = 'src/content/docs/chapter-1';
const SOURCE = 'source/book-en/chapter1.md';
const SOURCE_URL_PREFIX = 'https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#';
const EXPECTED_LESSONS = 8;

const norm = (s) =>
	s
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.trim();

const sourceHeadings = readFileSync(SOURCE, 'utf8')
	.split('\n')
	.filter((line) => /^#{2,4} /.test(line))
	.map((line) => norm(line.replace(/^#+ /, '')));

const errors = [];
const claimed = new Map();
const files = existsSync(LESSON_DIR)
	? readdirSync(LESSON_DIR)
			.filter((f) => /^0[1-8]-.*\.mdx$/.test(f))
			.sort()
	: [];

for (const file of files) {
	const err = (msg) => errors.push(`${file}: ${msg}`);
	const text = readFileSync(join(LESSON_DIR, file), 'utf8');
	const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		err('missing frontmatter');
		continue;
	}
	const fm = parse(match[1]) ?? {};
	const body = match[2];

	if (!fm.title) err('frontmatter.title is required');
	if (!fm.description) err('frontmatter.description is required');
	if (typeof fm.sidebar?.order !== 'number') err('frontmatter.sidebar.order must be a number');
	if (!fm.source?.url?.startsWith(SOURCE_URL_PREFIX)) err(`frontmatter.source.url must start with ${SOURCE_URL_PREFIX}`);

	const sections = (fm.source?.sections ?? []).map(norm);
	if (sections.length === 0) err('frontmatter.source.sections must list the original headings this lesson covers');
	for (const s of sections) {
		if (!sourceHeadings.includes(s)) err(`source section not found in chapter1.md: "${s}"`);
		if (claimed.has(s)) err(`section "${s}" is already covered by ${claimed.get(s)}`);
		else claimed.set(s, file);
	}

	const firstH2 = body.search(/^## /m);
	const tldr = body.indexOf(':::tip[TL;DR]');
	if (tldr === -1 || (firstH2 !== -1 && tldr > firstH2)) err('must open with a :::tip[TL;DR] block before the first ## heading');
	if (!body.includes('<Figure')) err('must include at least one <Figure>');
	if (!body.includes('<KeyTakeaways>')) err('must include <KeyTakeaways>');
	const check = body.indexOf('## Check yourself');
	if (check === -1) err('must include a "## Check yourself" section');
	else if ((body.slice(check).match(/<Quiz /g) ?? []).length < 2) err('"## Check yourself" needs at least 2 <Quiz> items');
	if (/\b(TODO|TBD|lorem ipsum)\b/i.test(body)) err('contains placeholder text');
}

const uncovered = sourceHeadings.filter((h) => !claimed.has(h));
if (files.length === EXPECTED_LESSONS) {
	for (const h of uncovered) errors.push(`original section not covered by any lesson: "${h}"`);
} else if (uncovered.length) {
	console.warn(`${files.length}/${EXPECTED_LESSONS} lessons present; ${uncovered.length} original sections not yet covered.`);
}

if (errors.length) {
	console.error(errors.map((e) => `✗ ${e}`).join('\n'));
	process.exit(1);
}
console.log(`✓ ${files.length} lesson(s) pass structure checks`);
```

- [ ] **Step 9: Check that the checker catches a bad lesson, then remove the probe**

```bash
printf -- '---\ntitle: Bad\n---\nTODO\n' > src/content/docs/chapter-1/01-probe.mdx
node scripts/check-lessons.mjs; echo "exit=$?"
rm src/content/docs/chapter-1/01-probe.mdx
node scripts/check-lessons.mjs; echo "exit=$?"
```

Expected: the first run prints several `✗ 01-probe.mdx: …` lines and `exit=1`. The second run prints `0/8 lessons present; 27 original sections not yet covered.`, then `✓ 0 lesson(s) pass structure checks`, and `exit=0`.

- [ ] **Step 10: Run all tests and confirm they pass**

Run: `npm test`
Expected: build OK, checker OK, and all tests in `smoke.spec.ts` and `components.spec.ts` pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add attribution footer, quiz and takeaway components, lesson checker

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Diagram design system — colors, Figure, StepAnimator, legend, automated diagram audit

**Files:**
- Create: `src/styles/diagrams.css`, `src/components/Figure.astro`, `src/components/StepAnimator.astro`, `src/components/diagrams/ConceptLegend.astro`, `tests/diagram-pages.ts`, `tests/diagrams.spec.ts`, `tests/animator.spec.ts`
- Modify: `astro.config.mjs` (add `diagrams.css` to `customCss`), `src/content/docs/style-guide.mdx`

**Interfaces:**
- Consumes: the `~/` alias and the style guide page from Task 2.
- Produces:
  - `<Figure caption="…" credit?="…">{svg diagram}</Figure>` renders `figure.dg-figure > .dg-scroll`, a `.dg-scroll-hint`, and a `figcaption`. It sets `data-overflowing` when the diagram scrolls.
  - `<StepAnimator label="…">{Figure}</StepAnimator>` renders `[data-animator]` with Play/Step/Reset buttons and a `[data-status]`. Classes: `.is-stepping` on the root, `.is-current` / `.is-past` on `[data-step]` elements.
  - CSS classes from the Global Constraints (`dg`, `dg-node`, `dg-container`, `dg-{concept}`, `dg-edge`, `dg-edge-label`, `dg-title`, `dg-sub`, `dg-mono`, `dg-accent`, `dg-arrowhead`, `dg-ok`, `dg-fail`, `dg-partial`).
  - `DIAGRAM_PAGES: string[]` in `tests/diagram-pages.ts`. Each lesson task appends its slug.

- [ ] **Step 1: Write the failing tests**

`tests/diagram-pages.ts`:

```ts
// Pages whose diagrams are audited. Each lesson task appends its page.
export const DIAGRAM_PAGES: string[] = ['style-guide/'];
```

`tests/diagrams.spec.ts`:

```ts
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
```

`tests/animator.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx astro build && npx playwright test tests/diagrams.spec.ts tests/animator.spec.ts`
Expected: FAIL. The style guide has no `svg.dg` (count is 0) and no `[data-animator]`.

- [ ] **Step 3: Write `src/styles/diagrams.css`**

```css
/* Concept color system for all diagrams. Change colors here only. */
:root,
:root[data-theme='light'] {
	--dg-ink: #0f172a;
	--dg-muted: #475569;
	--dg-line: #334155;
	--dg-model-fill: #ede9fe;
	--dg-model-stroke: #6d28d9;
	--dg-context-fill: #e0f2fe;
	--dg-context-stroke: #0369a1;
	--dg-tools-fill: #d1fae5;
	--dg-tools-stroke: #065f46;
	--dg-env-fill: #fef3c7;
	--dg-env-stroke: #92400e;
	--dg-harness-fill: #f1f5f9;
	--dg-harness-stroke: #475569;
	--dg-guard-fill: #ffe4e6;
	--dg-guard-stroke: #be123c;
	--dg-neutral-fill: #ffffff;
	--dg-neutral-stroke: #94a3b8;
}

:root[data-theme='dark'] {
	--dg-ink: #f1f5f9;
	--dg-muted: #cbd5e1;
	--dg-line: #cbd5e1;
	--dg-model-fill: #2e1065;
	--dg-model-stroke: #c4b5fd;
	--dg-context-fill: #082f49;
	--dg-context-stroke: #7dd3fc;
	--dg-tools-fill: #022c22;
	--dg-tools-stroke: #6ee7b7;
	--dg-env-fill: #451a03;
	--dg-env-stroke: #fcd34d;
	--dg-harness-fill: #1e293b;
	--dg-harness-stroke: #94a3b8;
	--dg-guard-fill: #4c0519;
	--dg-guard-stroke: #fda4af;
	--dg-neutral-fill: #0f172a;
	--dg-neutral-stroke: #64748b;
}

svg.dg {
	display: block;
	width: 100%;
	height: auto;
	font-family: var(--sl-font, system-ui, sans-serif);
}
svg.dg text {
	fill: var(--dg-ink);
	font-size: 16px;
}
svg.dg .dg-title {
	font-size: 20px;
	font-weight: 700;
}
svg.dg .dg-sub,
svg.dg .dg-edge-label {
	fill: var(--dg-muted);
}
svg.dg .dg-mono {
	font-family: var(--sl-font-mono, ui-monospace, monospace);
}
svg.dg :is(.dg-node, .dg-container) > rect {
	stroke-width: 2;
}
svg.dg .dg-harness > rect {
	stroke-dasharray: 8 6;
}
svg.dg .dg-edge :is(path, line) {
	stroke: var(--dg-line);
	stroke-width: 2;
	fill: none;
}
svg.dg .dg-arrowhead {
	fill: var(--dg-line);
}

/* One rule block per concept: box fill/stroke and accent text color. */
svg.dg .dg-model > rect { fill: var(--dg-model-fill); stroke: var(--dg-model-stroke); }
svg.dg .dg-model > .dg-accent { fill: var(--dg-model-stroke); }
svg.dg .dg-context > rect { fill: var(--dg-context-fill); stroke: var(--dg-context-stroke); }
svg.dg .dg-context > .dg-accent { fill: var(--dg-context-stroke); }
svg.dg .dg-tools > rect { fill: var(--dg-tools-fill); stroke: var(--dg-tools-stroke); }
svg.dg .dg-tools > .dg-accent { fill: var(--dg-tools-stroke); }
svg.dg .dg-env > rect { fill: var(--dg-env-fill); stroke: var(--dg-env-stroke); }
svg.dg .dg-env > .dg-accent { fill: var(--dg-env-stroke); }
svg.dg .dg-harness > rect { fill: var(--dg-harness-fill); stroke: var(--dg-harness-stroke); }
svg.dg .dg-harness > .dg-accent { fill: var(--dg-harness-stroke); }
svg.dg .dg-guard > rect { fill: var(--dg-guard-fill); stroke: var(--dg-guard-stroke); }
svg.dg .dg-guard > .dg-accent { fill: var(--dg-guard-stroke); }
svg.dg .dg-neutral > rect { fill: var(--dg-neutral-fill); stroke: var(--dg-neutral-stroke); }

/* Status marks (e.g. ablation matrix): never color alone — always paired with ✓ ✗ △ glyphs. */
svg.dg .dg-ok { fill: var(--dg-tools-stroke); font-weight: 700; }
svg.dg .dg-fail { fill: var(--dg-guard-stroke); font-weight: 700; }
svg.dg .dg-partial { fill: var(--dg-env-stroke); font-weight: 700; }

/* StepAnimator states */
.dg-anim [data-step] {
	transition: opacity 0.3s ease;
}
.dg-anim.is-stepping [data-step] {
	opacity: 0.15;
}
.dg-anim.is-stepping [data-step].is-past {
	opacity: 0.5;
}
.dg-anim.is-stepping [data-step].is-current {
	opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
	.dg-anim [data-step] {
		transition: none;
	}
}
```

In `astro.config.mjs`, set `customCss: ['./src/styles/custom.css', './src/styles/diagrams.css'],`.

- [ ] **Step 4: Write `src/components/Figure.astro`**

```astro
---
interface Props {
	caption: string;
	credit?: string;
}
const { caption, credit } = Astro.props;
---

<figure class="dg-figure">
	<div class="dg-scroll" tabindex="0" role="region" aria-label={`Diagram: ${caption}`}>
		<slot />
	</div>
	<p class="dg-scroll-hint">Scroll sideways to see the whole diagram →</p>
	<figcaption>{caption}{credit && <span class="dg-credit"> {credit}</span>}</figcaption>
</figure>

<style>
	.dg-figure {
		margin: 2rem 0;
	}
	.dg-scroll {
		overflow-x: auto;
	}
	.dg-scroll-hint {
		display: none;
		font-size: var(--sl-text-sm);
		color: var(--sl-color-gray-3);
		margin-top: 0.25rem;
	}
	.dg-figure[data-overflowing] .dg-scroll-hint {
		display: block;
	}
	figcaption {
		font-size: var(--sl-text-sm);
		color: var(--sl-color-gray-2);
		margin-top: 0.5rem;
	}
	.dg-credit {
		font-style: italic;
	}
</style>

<script>
	const update = () => {
		for (const fig of document.querySelectorAll<HTMLElement>('.dg-figure')) {
			const scroller = fig.querySelector<HTMLElement>('.dg-scroll')!;
			fig.toggleAttribute('data-overflowing', scroller.scrollWidth > scroller.clientWidth + 1);
		}
	};
	update();
	window.addEventListener('resize', update);
</script>
```

- [ ] **Step 5: Write `src/components/StepAnimator.astro`**

```astro
---
interface Props {
	label: string;
}
const { label } = Astro.props;
---

<div class="dg-anim" data-animator>
	<slot />
	<div class="dg-anim-controls" role="group" aria-label={`Animation controls: ${label}`}>
		<button type="button" data-action="play">Play</button>
		<button type="button" data-action="step">Step</button>
		<button type="button" data-action="reset">Reset</button>
		<span class="dg-anim-status" data-status aria-live="polite"></span>
	</div>
</div>

<style>
	.dg-anim-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-top: -1rem;
		margin-bottom: 2rem;
	}
	.dg-anim-controls button {
		font: inherit;
		font-size: var(--sl-text-sm);
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--sl-color-gray-4);
		border-radius: 0.375rem;
		background: var(--sl-color-gray-6);
		color: var(--sl-color-white);
		cursor: pointer;
	}
	.dg-anim-controls button[hidden] {
		display: none;
	}
	.dg-anim-status {
		font-size: var(--sl-text-sm);
		color: var(--sl-color-gray-2);
	}
</style>

<script>
	const INTERVAL_MS = 1400;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	for (const root of document.querySelectorAll<HTMLElement>('[data-animator]')) {
		const els = [...root.querySelectorAll<SVGElement>('[data-step]')];
		const max = Math.max(...els.map((el) => Number(el.dataset.step)));
		const status = root.querySelector<HTMLElement>('[data-status]')!;
		const play = root.querySelector<HTMLButtonElement>('[data-action="play"]')!;
		let current = 0;
		let timer: number | undefined;

		const labelFor = (n: number) =>
			els.find((el) => Number(el.dataset.step) === n && el.dataset.stepLabel)?.dataset.stepLabel ?? '';
		const render = () => {
			root.classList.toggle('is-stepping', current > 0);
			for (const el of els) {
				const s = Number(el.dataset.step);
				el.classList.toggle('is-current', s === current);
				el.classList.toggle('is-past', current > 0 && s < current);
			}
			status.textContent = current > 0 ? `Step ${current} of ${max}: ${labelFor(current)}` : '';
		};
		const stop = () => {
			if (timer !== undefined) clearInterval(timer);
			timer = undefined;
			play.textContent = 'Play';
		};
		const step = () => {
			current = current >= max ? 1 : current + 1;
			render();
		};

		play.hidden = reducedMotion.matches;
		play.addEventListener('click', () => {
			if (timer !== undefined) return stop();
			if (current >= max) current = 0;
			step();
			play.textContent = 'Pause';
			timer = window.setInterval(() => (current >= max ? stop() : step()), INTERVAL_MS);
		});
		root.querySelector('[data-action="step"]')!.addEventListener('click', () => {
			stop();
			step();
		});
		root.querySelector('[data-action="reset"]')!.addEventListener('click', () => {
			stop();
			current = 0;
			render();
		});
	}
</script>
```

- [ ] **Step 6: Write the reference diagram** `src/components/diagrams/ConceptLegend.astro`

This is the pattern every diagram follows.

```astro
---
// Color legend for the concept system. Also used as the StepAnimator demo on the style guide.
---

<svg
	class="dg"
	viewBox="0 0 720 152"
	role="img"
	aria-labelledby="d-legend-title d-legend-desc"
	style="min-width: 630px"
>
	<title id="d-legend-title">Diagram color legend</title>
	<desc id="d-legend-desc">
		Six colored boxes: Model (LLM), Context, Tools, Environment, Harness with a dashed border, and Guardrails or human
		checkpoints. Each color means the same thing in every diagram.
	</desc>
	<g class="dg-node dg-model" data-step="1" data-step-label="Model — the reasoning core">
		<rect x="12" y="16" width="216" height="52" rx="10"></rect>
		<text x="120" y="48" text-anchor="middle" class="dg-accent">Model (LLM)</text>
	</g>
	<g class="dg-node dg-context" data-step="2" data-step-label="Context — the working set">
		<rect x="252" y="16" width="216" height="52" rx="10"></rect>
		<text x="360" y="48" text-anchor="middle" class="dg-accent">Context</text>
	</g>
	<g class="dg-node dg-tools" data-step="3" data-step-label="Tools — the action interfaces">
		<rect x="492" y="16" width="216" height="52" rx="10"></rect>
		<text x="600" y="48" text-anchor="middle" class="dg-accent">Tools</text>
	</g>
	<g class="dg-node dg-env" data-step="4" data-step-label="Environment — outside the agent">
		<rect x="12" y="84" width="216" height="52" rx="10"></rect>
		<text x="120" y="116" text-anchor="middle" class="dg-accent">Environment</text>
	</g>
	<g class="dg-node dg-harness" data-step="5" data-step-label="Harness — runtime and governance">
		<rect x="252" y="84" width="216" height="52" rx="10"></rect>
		<text x="360" y="116" text-anchor="middle" class="dg-accent">Harness</text>
	</g>
	<g class="dg-node dg-guard" data-step="6" data-step-label="Guardrails and human checkpoints">
		<rect x="492" y="84" width="216" height="52" rx="10"></rect>
		<text x="600" y="116" text-anchor="middle" class="dg-accent">Guardrails / human</text>
	</g>
</svg>
```

- [ ] **Step 7: Add the diagram sections to the style guide** — append to `src/content/docs/style-guide.mdx`, and add these imports after the existing ones:

```mdx
import Figure from '~/components/Figure.astro';
import StepAnimator from '~/components/StepAnimator.astro';
import ConceptLegend from '~/components/diagrams/ConceptLegend.astro';
```

Content to append at the end of the file:

```mdx
## Diagram conventions

Every diagram uses the same color for the same concept. Press **Step** to walk through the legend.

<StepAnimator label="Concept legend">
<Figure caption="The concept color legend used by every diagram.">
<ConceptLegend />
</Figure>
</StepAnimator>

- Colors come only from `src/styles/diagrams.css`; each color is always paired with a text label.
- Boxes are `g.dg-node` elements (one `rect` + direct `text` children); groups are `g.dg-container`.
- Wide diagrams scroll sideways on phones rather than shrinking text below 14px.

## All diagrams

Each lesson adds its diagrams below, grouped by lesson.
```

- [ ] **Step 8: Run the tests and confirm they pass**

Run: `npx astro build && npx playwright test`
Expected: all tests pass: smoke (2), components (4), animator (4), and diagrams (4 = style guide × 2 themes × 2 viewports).

- [ ] **Step 9: Visual review**

Open each file in `diagram-shots/` (`style-guide-1-{light,dark}-{desktop,mobile}.png`) with the Read tool. Confirm:
- all six boxes are clearly different colors;
- labels are centered and readable;
- the Harness border is dashed;
- the dark theme is readable;
- the mobile shot shows the left part of the diagram at full size.

Fix and re-run if anything looks wrong.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add diagram color system, Figure and StepAnimator with automated diagram audit

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Lesson tasks (Tasks 4–11): shared procedure

Every lesson task follows these steps. Each task lists only its specifics: file, frontmatter, diagrams, outline, and quizzes.

1. **Skeleton first (failing check).** Create the lesson MDX with the exact frontmatter given, the imports, and `:::tip[TL;DR]` only. Add the lesson path to `tests/diagram-pages.ts`. Run `node scripts/check-lessons.mjs`. Expected: FAIL, listing missing `<Figure>`, `<KeyTakeaways>`, and `## Check yourself`.
2. **Build the diagrams.** Write each diagram component to its spec below, following the Global Constraints and the `ConceptLegend.astro` pattern. Choose prefixes as listed. Add each diagram to the style guide under `## All diagrams` → `### Lesson N`, wrapped in `<Figure caption=…>` (and `<StepAnimator>` if animated), with its import.
3. **Write the lesson.** Follow the outline. Rewrite from the given source line range; never paste long passages verbatim (short defining quotes are fine). Embed diagrams as `<Figure caption="…" credit="…">` (credit only for redrawn originals). Animated diagrams go inside `<StepAnimator label="…">`. Include the engineer additions exactly as given (they may be lightly adapted to flow). Write the quizzes as specified.
4. **Run all checks.** `npm test`. Expected: checker passes for this lesson, the build has no link errors, and every Playwright test passes, including the new lesson's 4 diagram-audit runs.
5. **Visual review.** Open every new `diagram-shots/<lesson-slug>-*.png` with the Read tool. Check:
   - labels are legible and not clipped;
   - arrows start and end at the correct boxes;
   - colors match the concept legend;
   - dark mode is readable;
   - animated diagrams make sense as static images.

   For animated diagrams, also run `npm run dev`, open the lesson, press Step through every step, and confirm the status text and highlights match the step labels. Fix and repeat step 4 until clean.
6. **Commit.** `git add -A && git commit` with message `feat: add lesson 1.N — <title>` plus the Co-Authored-By line.

Standard imports block for every lesson (drop any that aren't used):

```mdx
import Figure from '~/components/Figure.astro';
import StepAnimator from '~/components/StepAnimator.astro';
import KeyTakeaways from '~/components/KeyTakeaways.astro';
import Quiz from '~/components/Quiz.astro';
```

Text width budget for diagram labels: about 8.5 viewBox units per character at 16px, plus 16 units of padding. The audit is the final judge.

---

### Task 4: Lesson 1.1 — What an Agent Actually Is

**Files:**
- Create: `src/content/docs/chapter-1/01-what-is-an-agent.mdx`, `src/components/diagrams/chapter-1/AgentFormula.astro`, `src/components/diagrams/chapter-1/AgentEnvironmentLoop.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/01-what-is-an-agent/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: What an Agent Actually Is
description: The core formula Agent = LLM + Context + Tools, the agent–environment boundary, and how the pieces map to reinforcement learning.
sidebar:
  order: 1
  label: 1.1 What an Agent Actually Is
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#modern-agent--llm--context--tools
  sections:
    - Modern Agent = LLM + Context + Tools
---
```

**Source:** lines 1–35 (the chapter intro before the first heading is included in this lesson).

**Diagram A — `AgentFormula.astro`** (new, static, prefix `d-af`). viewBox `0 0 720 250`, min-width 630.
- Container `dg-container dg-neutral`, rect x=12 y=12 w=500 h=226. Title text "Agent boundary" (`dg-title`) at top-left inside.
- Three `dg-node`s in a row inside the container, each about 140×110, with a `+` text (`dg-title`, free text inside the container) between them:
  - `dg-model`: "LLM" (`dg-accent`, bold) / "reasoning" / "engine" (`dg-sub`)
  - `dg-context`: "Context" / "working" / "set"
  - `dg-tools`: "Tools" / "action" / "interfaces"
- `dg-node dg-env` outside the container on the right (x≈540, w≈168): "Environment" (`dg-accent`) / "outside the" / "boundary" (`dg-sub`).
- Edge (two-headed, `marker-start` and `marker-end` with the same marker) between the container and the Environment, label "interacts" (`dg-edge-label`) above it.
- Title "Agent = LLM + Context + Tools". Desc explains that the three components sit inside the agent boundary and the environment sits outside it.

**Diagram B — `AgentEnvironmentLoop.astro`** (redraw of Fig 1-1, animated, prefix `d-ael`). Full implementation:

```astro
---
// Redraw of Figure 1-1: agent–environment loop with the Model–Harness structure inside the agent.
---

<svg
	class="dg"
	viewBox="0 0 720 460"
	role="img"
	aria-labelledby="d-ael-title d-ael-desc"
	style="min-width: 630px"
>
	<title id="d-ael-title">The agent–environment loop and the Model–Harness structure</title>
	<desc id="d-ael-desc">
		Inside the agent, a harness contains Context, the Model, and Tools. The environment sends an observation into the
		context; the model reads the context and decides; tools send an action to the environment, which changes state and
		produces the next observation. The harness mediates the interaction but is not the environment.
	</desc>
	<defs>
		<marker id="d-ael-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
			<path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"></path>
		</marker>
	</defs>

	<g class="dg-container dg-neutral">
		<rect x="10" y="10" width="420" height="440" rx="14"></rect>
		<text x="30" y="42" class="dg-title">Agent</text>
	</g>
	<g class="dg-container dg-harness">
		<rect x="30" y="58" width="380" height="372" rx="12"></rect>
		<text x="46" y="86">Harness: runtime &amp; governance</text>
		<text x="220" y="414" text-anchor="middle" class="dg-sub">constrain · verify · correct</text>
	</g>

	<g class="dg-node dg-context" data-step="2" data-step-label="The harness builds the context">
		<rect x="60" y="106" width="320" height="76" rx="10"></rect>
		<text x="220" y="137" text-anchor="middle" class="dg-accent" font-weight="700">Context</text>
		<text x="220" y="164" text-anchor="middle" class="dg-sub">history · memory · task state</text>
	</g>
	<g class="dg-edge" data-step="3">
		<line x1="220" y1="182" x2="220" y2="204" marker-end="url(#d-ael-arrow)"></line>
	</g>
	<g class="dg-node dg-model" data-step="3" data-step-label="The model reads the context and decides the next action">
		<rect x="60" y="206" width="320" height="76" rx="10"></rect>
		<text x="220" y="237" text-anchor="middle" class="dg-accent" font-weight="700">Model (LLM)</text>
		<text x="220" y="264" text-anchor="middle" class="dg-sub">reason · decide next action</text>
	</g>
	<g class="dg-edge" data-step="4">
		<line x1="220" y1="282" x2="220" y2="304" marker-end="url(#d-ael-arrow)"></line>
	</g>
	<g class="dg-node dg-tools" data-step="4" data-step-label="The harness validates and runs the tool call">
		<rect x="60" y="306" width="320" height="76" rx="10"></rect>
		<text x="220" y="337" text-anchor="middle" class="dg-accent" font-weight="700">Tools</text>
		<text x="220" y="364" text-anchor="middle" class="dg-sub">action interfaces</text>
	</g>

	<g class="dg-node dg-env" data-step="5" data-step-label="The action changes the environment's state">
		<rect x="500" y="106" width="210" height="276" rx="12"></rect>
		<text x="605" y="140" text-anchor="middle" class="dg-accent" font-weight="700">Environment</text>
		<text x="605" y="188" text-anchor="middle">files · databases</text>
		<text x="605" y="220" text-anchor="middle">web · APIs · apps</text>
		<text x="605" y="252" text-anchor="middle">users · other agents</text>
		<text x="605" y="284" text-anchor="middle">real or simulated world</text>
		<text x="605" y="340" text-anchor="middle" class="dg-sub">state changes here</text>
	</g>

	<g class="dg-edge" data-step="1" data-step-label="The environment returns an observation">
		<line x1="500" y1="144" x2="382" y2="144" marker-end="url(#d-ael-arrow)"></line>
		<text x="441" y="132" text-anchor="middle" class="dg-edge-label">observation</text>
	</g>
	<g class="dg-edge" data-step="5">
		<line x1="380" y1="344" x2="498" y2="344" marker-end="url(#d-ael-arrow)"></line>
		<text x="439" y="332" text-anchor="middle" class="dg-edge-label">action</text>
	</g>
</svg>
```

**Outline:**
1. TL;DR: An agent is a loop, not a single answer. An LLM decides, context gives it a working set, and tools let it act on an environment that sits outside the agent.
2. `## From chat to agents`: the product examples (Cursor, Deep Research, Manus, Doubao phone assistant, Pine AI) and the shared trait: plan, call tools, adapt. **Engineer addition**, the "Chat assistant vs. agent" table:

   | | Chat assistant | Agent |
   |---|---|---|
   | Control flow | One request → one response | Loop until the task is done |
   | Who picks the next step | The user | The model |
   | Side effects | None (text only) | Tools act on external systems |
   | State | The conversation | Trajectory plus task state |
   | Typical failure | A wrong answer | A wrong action with real effects |
3. `## The formula`: Agent = LLM + Context + Tools. Cover the three broad definitions and the intuitive form (reasoning engine + working context + action interfaces). The plus signs mean engineering composition, not an RL definition. The formula excludes the Environment. Figure A.
4. `## Two levels: agent ↔ environment, model ↔ harness`: the closed loop, then Figure B inside `<StepAnimator label="Agent–environment loop">`. Cover the Environment's contents, the Harness responsibilities, "create, isolate or proxy an environment", and "LLM = Model; Context + Tools = the minimum Harness; production adds constraints, verification, correction". `:::note[Engineer's note]`: when an agent fails, first locate which side of the boundary failed: the model's decision, the harness (missing context or tool), or the environment. This connects to reference answer 1: analyze failure trajectories to find whether the bottleneck is perception, decision, or action.
5. `## Mapping to reinforcement learning`: the source table (lines 31–35), rewritten compactly, plus the "not one-to-one" caveat (line 29).
6. `<KeyTakeaways>`: 4–5 bullets.

**Quizzes (`## Check yourself`):**
1. "If you could add only one thing to an agent (a stronger model, richer context, or more tools), which would you choose, and when would that change?" Answer from reference answer 1 (reference-answers.md line 9): find the weak link first. Usually enrich context (the observation space). Switch to a stronger model when the task exceeds its reasoning ability. Add tools when the action space is insufficient. Judge by analyzing failure trajectories.
2. "Is the file system your agent edits part of the harness?" Answer: No. The files are the Environment. Tool definitions, call adapters, sandbox permissions, and reset mechanisms that touch them are the Harness (lines 25, 270).
3. "Why is 'Agent = LLM + Context + Tools' not a reinforcement-learning definition?" Answer: The plus signs are engineering composition. Context is observations and history inside the agent, not the whole observation space. Tools define interfaces, while the things they act on stay in the environment (lines 13, 29).

---

### Task 5: Lesson 1.2 — Observation & Action Spaces, Tools

**Files:**
- Create: `src/content/docs/chapter-1/02-observation-action-tools.mdx`, `src/components/diagrams/chapter-1/ObservationActionSpaces.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/02-observation-action-tools/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: Observation & Action Spaces, Tools
description: Why widening what an agent can see and do is the main lever for capability, the five kinds of tools, and how tool calling works.
sidebar:
  order: 2
  label: 1.2 Observation & Action Spaces, Tools
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#observation-and-action-spaces-the-interface-between-model-and-world
  sections:
    - "Observation and Action Spaces: The Interface Between Model and World"
    - "Tools: The Agent's Action Interfaces"
---
```

**Source:** lines 37–107.

**Diagram — `ObservationActionSpaces.astro`** (new, static, prefix `d-oas`). viewBox `0 0 720 330`, min-width 630.
- Left: `dg-node dg-env` (x≈12, w≈170, tall) with "Environment" / "files · web" / "apps · users".
- Center: `dg-node dg-model` "Model" / "reasons and decides".
- Between them, two lanes:
  - Top lane: `dg-node dg-context` "Observation space" / "world → context". Edge from Environment → Observation space → Model.
  - Bottom lane: `dg-node dg-tools` "Action space" / "decision → operation". Edge from Model → Action space → Environment.
- Right column: two `dg-node dg-neutral` note boxes. The first is next to the top lane: "Outside the observation" / "space: doesn't exist" / "for the model". The second is next to the bottom lane: "Outside the action space:" / "can only suggest" / "in words".
- Title "Observation and action spaces". Desc describes both lanes and both notes.

**Outline:**
1. TL;DR: The model only knows what enters its observation space and can only do what its action space exposes. Widening those two interfaces is often a bigger lever than a smarter model.
2. `## The interface between model and world`: definitions (line 39) and the Figure.
3. `## The main lever: widen the interface`: line 41, then the two cases.
   - Manus (line 43): the union of Deep Research, Coding, and Computer Use. The virtual browser grows the observation space; the file system, code execution, and commands grow the action space.
   - OpenClaw (line 45): messaging channels, the local Gateway, Google Drive and Notion, explicit authorization. Manus later added a Drive connector and My Computer.
   - Put the footnote links from line 47 in `### References`.
4. `## Five agent products, three dimensions`: the source table (lines 51–57) and the three shared features (line 59).
5. `## Five kinds of tools`: **engineer addition** table with columns Type | Direction | Who starts it | Examples:
   - Perception | reads the world | agent calls it | search, file read, APIs/databases
   - Execution | changes the world | agent calls it | code execution, file operations, system commands, external APIs
   - Collaboration | divides work | agent calls it | sub-agents, human confirmation, multi-agent coordination
   - Event trigger | wakes the agent | the outside world | new email, schedule, webhook
   - User communication | carries information to the user | agent calls it | text message, voice call, email

   Then the consequences of tool design quality (line 77: vague interface → misuse; poor error handling → stuck; broad permissions → irreversible damage) and MCP.
6. `## Tool calling in four steps`: the four steps (line 81), the source weather code block (lines 85–99, keep as `text`), and **engineer addition** "the same tool as a JSON Schema definition":

   ```json title="get_weather tool definition (illustrative)"
   {
     "name": "get_weather",
     "description": "Get today's weather for a city. Use for questions about current conditions.",
     "parameters": {
       "type": "object",
       "properties": {
         "city": { "type": "string", "description": "City name, e.g. \"Beijing\"" }
       },
       "required": ["city"]
     }
   }
   ```

   Then line 101 (the developer defines and executes; the model decides). `:::note[Engineer's note]`: treat a tool definition like a public API contract. Its name, description, and parameter docs are the only documentation the model gets.
7. `## Designing tools: start narrow`, from lines 103–107:
   - calculator → sandboxed code interpreter, with the sandbox checklist as a bullet list (isolated sandbox; network off by default; only the authorized working directory; limits on time, CPU, memory, and output size);
   - logging → a controlled virtual working directory (restricted paths, capacity, and file types; no path traversal);
   - dedicated tools for high-risk operations (payments, deletion, email, deployment);
   - end with the bolded principle.
8. `<KeyTakeaways>`, then `### References`.

**Quizzes:**
1. "When would a constrained action space (choose from predefined options) beat an open-ended one?" Answer from reference answer 8 (line 37): high-compliance, high-risk, irreversible scenarios such as refunds and payments. Constrained options are mistake-proof by design.
2. "Your agent keeps replying 'I can't see your calendar.' Is that a model problem or an interface problem?" Answer: An interface problem. The calendar is outside the observation space. With the user's authorization, add a perception tool or put the data into context (lines 39–41).
3. "Pick an AI product you use daily and describe it along the three dimensions: working context, action interfaces, strategy." Answer from reference answer 5 (line 25): open-ended. List what it can see, whether its action space is open-ended and whether it reasons internally, and the pattern of its execution loop.

---

### Task 6: Lesson 1.3 — The LLM as Reasoning Engine

**Files:**
- Create: `src/content/docs/chapter-1/03-llm-reasoning-engine.mdx`, `src/components/diagrams/chapter-1/CapabilityUpdateLevels.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/03-llm-reasoning-engine/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: The LLM as Reasoning Engine
description: What the model contributes, the Model-as-Agent shift, why the harness still matters, and the three ways an agent's behavior can change.
sidebar:
  order: 3
  label: 1.3 The LLM as Reasoning Engine
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#llm-the-agents-reasoning-engine
  sections:
    - "LLM: The Agent's Reasoning Engine"
    - "Model as Agent: When the Model Itself Becomes the Product"
    - "Agent Learning Mechanisms: From Contextual Adaptation to Persistent Updates"
---
```

**Source:** lines 109–135.

**Diagram — `CapabilityUpdateLevels.astro`** (redraw of Fig 1-2, static, prefix `d-cul`). viewBox `0 0 720 400`, min-width 630.
- Three columns of `dg-node`s, about 220 wide each. Top line is the name (`dg-accent`, bold); the other lines are regular text:
  1. `dg-context`: "Contextual adaptation" / "inference time" / "temporary · instant" / "bounded by the" / "context window" / "e.g. learn a format" / "from 3 examples"
  2. `dg-harness` (solid border: put `style="stroke-dasharray: none"` on this rect; a presentation attribute would lose to the stylesheet rule): "External artifacts" / "runtime" / "persistent · auditable" / "knowledge, prompts," / "Skills, programs" / "e.g. freeze a" / "workflow into a tool"
  3. `dg-model`: "Model parameters" / "training time" / "permanent · general" / "high cost · slow" / "to update" / "e.g. learn when" / "to call a tool"
- Under the columns, a full-width edge (arrow pointing left) labelled "faster to update (milliseconds)" at the left end and "slower (weeks)" at the right end.
- A second label row: "most reversible → least reversible" (from line 537).
- Title "Three levels of agent capability updates". Desc lists the three levels.

**Outline:**
1. TL;DR: The LLM infers intent, plans, and picks each next action. Models are absorbing more of the agent loop, but that makes the harness more important, not less. Behavior can change in three places: context, external artifacts, and weights.
2. `## What the model contributes`: intent inference, decomposition, per-step decisions (line 111). Internal reasoning plans without touching the environment, and reasons over structured knowledge instead of blind trial and error (line 113).
3. `## Model as Agent`: post-training internalizes tool calling. Stronger model → the harness matters more. The horse-and-reins metaphor, and why more decision authority means finer constraints and checks. Providers co-optimize model and harness (lines 117–119).
4. `## Will the harness be absorbed? The Bitter Lesson` (line 121): Sutton's argument (link from line 123 in References), the book's position, what has already been absorbed (tool calling, long-horizon planning), the months-long training timescale, and "Harness engineering is the Bitter Lesson practiced on an engineering timescale". `:::note[Engineer's note]`: build harness layers so they can be deleted. When a model internalizes a layer, removing it should be a small, isolated change (this restates "the Harness sheds that layer").
5. `## Three ways an agent's behavior changes`: Figure, then **engineer addition** table with columns Path | Where it lives | Persists across sessions? | Speed / cost | Best for | Covered in:
   - Contextual adaptation | the current context (examples, state, retrieval results) | No | Instant and cheap; bounded by the context window | per-task adjustment | Chapter 2
   - External artifacts | knowledge docs, prompts/Skills, programs and harness code | Yes; auditable and revisable | Must be loaded through context or tools at run time | facts, strategies expressible in language, deterministic procedures | Chapters 3–5, 9
   - Model parameters | weights, via post-training | Yes; broad generalization | High deployment cost, slow | high-dimensional skills rules can't express (medical images, style, implicit policies) | Chapter 8

   Then: the three are coordinated mechanisms on different timescales (line 135).
6. `<KeyTakeaways>`, then `### References`.

**Quizzes:**
1. "Models are taking over tool-calling decisions, yet the book says harness engineering matters more. How do both hold?" Answer from reference answer 3 (line 17): horse and reins. More autonomy means a bigger blast radius for mistakes, so more need for constraint, verification, and correction. Framework value shifts to the assurance layer: permissions, circuit breakers, error recovery, context compression, and the tool ecosystem.
2. "Your team must make the agent follow a new refund policy by tomorrow. Which update path do you use?" Answer: An external artifact, such as a prompt or Skill, or a deterministic harness rule for hard limits. It takes effect at the next run, is auditable, and is reversible. Fine-tuning is slow and costly, and context-only changes don't persist (lines 131–135).
3. "What does the model's internal reasoning change in the environment?" Answer: Nothing. It changes no external state, but it improves the actions that follow (line 113).

---

### Task 7: Lesson 1.4 — Context: The Working Set

**Files:**
- Create: `src/content/docs/chapter-1/04-context-working-set.mdx`, `src/components/diagrams/chapter-1/ContextAblation.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/04-context-working-set/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: "Context: The Working Set"
description: The five parts of an agent's context, the static prefix vs. the growing history, and what an ablation study reveals about each part.
sidebar:
  order: 4
  label: "1.4 Context: The Working Set"
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#context-the-agents-working-set
  sections:
    - "Context: The Agent's Working Set"
---
```

**Source:** lines 137–159.

**Diagram — `ContextAblation.astro`** (redraw of Fig 1-3, following the text, static, prefix `d-abl`). viewBox `0 0 720 380`, min-width 630.
- A matrix. Header row is a `dg-node dg-neutral` per column, each with two text lines:
  - "System" / "prompt" and "Tool" / "definitions" (both `dg-context`: static prefix)
  - "Tool" / "results", "Reasoning" / "(assistant)", "History" / "messages" (all `dg-harness`: dynamic history)
  - "Outcome" (`dg-neutral`)
- Five data rows. Each row has a `dg-node dg-neutral` label cell, five mark cells (free text), and an outcome `dg-node`:
  - "Full baseline": all five ✓ → `dg-tools` outcome "✓ works"
  - "No tool definitions": ✗ in Tool definitions → `dg-guard` outcome "✗ can't act," / "fabricates answer"
  - "No tool results": ✗ in Tool results → `dg-guard` outcome "✗ blind retry loop"
  - "No reasoning": ✗ in Reasoning → `dg-env` outcome "△ little cost if" / "reconstructable"
  - "No history": ✗ in History → `dg-env` outcome "△ repeats" / "operations"
- Marks are free text with classes `dg-ok` (✓), `dg-fail` (✗), `dg-partial` (△). Each mark cell is a `dg-node dg-neutral` so contrast is checked against its fill.
- Above the columns, two brackets drawn as `dg-edge` lines with `dg-edge-label`: "static prefix" over columns 1–2 and "dynamic history" over columns 3–5.
- Title "Experiment 1-1: context ablation study". Desc explains the rows and outcomes.

**Outline:**
1. TL;DR: Each LLM call sees a static prefix (system prompt + tool definitions) plus a growing history. Remove a part and the agent often doesn't crash; it returns a confident, wrong-but-plausible answer.
2. `## Five parts of every call`: the five components (lines 141–145), including user memory in the system prompt, RAG content in user messages, the reasoning/content/tool_calls combinations, and the note on on-demand tool schemas since 2026. Then the static prefix vs. dynamic history split (line 147). **Engineer addition:**

   ```python title="build_context.py (illustrative)"
   def build_context(system_prompt, tool_definitions, trajectory):
       # Static prefix: identical on every call in this conversation
       prefix = [{"role": "system", "content": system_prompt}]
       # Dynamic history: user, assistant and tool messages, appended in order
       return {"messages": prefix + trajectory, "tools": tool_definitions}
   ```

   Plus the table Component | Part of | What it carries | Book chapter:
   - System prompt | static prefix | identity, permissions, rules, user memory, injected environment state | Chapters 2–3
   - Tool definitions | static prefix | names, descriptions, parameter formats | Chapters 2, 4
   - User messages | dynamic history | the request, plus RAG-retrieved knowledge | Chapter 3
   - Assistant messages | dynamic history | reasoning, content, tool_calls | Chapter 2
   - Tool results | dynamic history | what actually happened | Chapter 2
3. `## Experiment 1-1: remove one part at a time`: the ablation method (line 149), the design (line 153; the system prompt was exempt), the Figure, and the findings for each component (line 157), including the confident fabricated answer and why a prompt constraint lowers but doesn't eliminate fabrication.
4. `## What the experiment teaches` (line 159): context decides what the agent can see. Components are not equivalent; the test is whether the information can be reconstructed elsewhere. Results may differ on newer models. "Produced an answer" is not "completed the task". `:::note[Engineer's note]`: evaluate task completion against ground truth (were the tools actually called, do the numbers match tool output), not whether a well-formatted answer came back.
5. `<KeyTakeaways>`.

**Quizzes:**
1. "You remove tool definitions from the context. What does the agent do?" Answer: It can't call tools, but it doesn't go silent. It returns a neatly formatted, confident answer whose numbers come from parametric memory. A "don't estimate" instruction lowers the odds of this but doesn't eliminate it (line 157).
2. "Why can the reasoning part be dropped from history at little cost?" Answer: Reasoning records *why*; tool results record *what happened*. When the why can be reconstructed from the what, dropping it costs almost nothing (line 157).
3. "Besides missing tool results, what can trap an agent in a loop in production, and how do you detect and stop it?" Answer from reference answer 4 (line 21):
   - Causes: a tool repeatedly returns the same error; calls to hallucinated tools; compression drops critical state; stripped reasoning makes the API error; the task is unsolvable.
   - Mechanisms: a maximum iteration count; detecting repeated calls (same tool + argument fingerprint); escalating to a human past a failure threshold.

---

### Task 8: Lesson 1.5 — The ReAct Loop

**Files:**
- Create: `src/content/docs/chapter-1/05-react-loop.mdx`, `src/components/diagrams/chapter-1/ReActLoop.astro`, `src/components/diagrams/chapter-1/TrajectoryRounds.astro`, `src/components/diagrams/chapter-1/ModelAsAgent.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/05-react-loop/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: The ReAct Loop
description: How reason → act → observe ties model, context and tools together, what a trajectory looks like, and where the loop runs when the model is the agent.
sidebar:
  order: 5
  label: 1.5 The ReAct Loop
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#the-react-loop
  sections:
    - The ReAct Loop
---
```

**Source:** lines 161–260. This includes Experiments 1-2 and 1-3.

**Diagram A — `ReActLoop.astro`** (new, animated, prefix `d-rl`). viewBox `0 0 720 340`, min-width 630.
- Three `dg-node`s arranged as a triangle cycle:
  - `dg-model` "Reason" / "decide the next step"
  - `dg-tools` "Act" / "call a tool"
  - `dg-context` "Observe" / "result joins context"
- Curved `dg-edge` arrows: Reason → Act → Observe → Reason.
- A fourth `dg-node dg-neutral` "Final answer" to the right of Reason, with an edge labelled "no tool call".
- Steps:
  1. Reason ("The model reasons about what to do next")
  2. edge + Act ("It calls a tool to act")
  3. edge + Observe ("The tool result is appended to the context")
  4. edge back to Reason ("The model reasons again with the new observation")
  5. "no tool call" edge + Final answer ("With no tool call left, the loop returns the answer")
- Title "The ReAct loop: reason, act, observe".

**Diagram B — `TrajectoryRounds.astro`** (redraw of Fig 1-4 using the text's numbers, animated, prefix `d-tr`). viewBox `0 0 720 640`, min-width 630.
- A left column (x 12–480) of stacked message `dg-node`s. The first line is the role (`dg-accent`); the other lines are content (`dg-mono` for calls and results):
  - `dg-neutral` "user" / "Q1 2.5M USD · Q2 2.1M EUR ·" / "Q3 1.8M GBP · Q4 380M JPY"
  - `dg-model` "assistant.reasoning" / "Convert all currencies to USD"
  - `dg-tools` "assistant.tool_calls ×3" / "convert_currency(EUR / GBP / JPY)"
  - `dg-context` "tool results" / "EUR→USD 2,282,608.70" / "GBP→USD 2,278,481.01" / "JPY→USD 2,541,806.02"
  - `dg-model` "assistant.reasoning" / "Aggregate with code"
  - `dg-tools` "assistant.tool_calls" / "code_interpreter(total = …)"
  - `dg-context` "tool result" / "Total $9,602,895.73" / "Average $2,400,723.93"
  - `dg-model` "assistant.content" / "FINAL ANSWER: total" / "$9,602,895.73 …"
- Round labels "Round 1", "Round 2", "Round 3" as free `dg-title` text to the left of their first message. Group messages under their round.
- Right column (x 500–708):
  - `dg-node dg-harness` "Static prefix" / "system prompt +" / "tool definitions"
  - a "+" text
  - a `dg-container dg-neutral` bracket box labelled "Trajectory" / "grows every round"
  - a final `dg-node dg-neutral` "= context of" / "every LLM call"
- Steps: 1 = Round 1 messages ("Round 1: reason, then three parallel conversions"), 2 = Round 2 ("Round 2: aggregate with the code interpreter"), 3 = Round 3 ("Round 3: final answer"), 4 = right column ("Every call sees static prefix + full trajectory").

**Diagram C — `ModelAsAgent.astro`** (redraw of Fig 1-5, static, prefix `d-maa`). viewBox `0 0 720 470`, min-width 630.
- Top: `dg-node dg-neutral` "User: search Bitcoin's price" / "trend over the last month".
- Middle: `dg-container dg-harness` "ReAct loop (server-side on the" / "Responses API path)" containing:
  - `dg-model` "Thought" / "search real-time data," / "then analyze with code"
  - `dg-tools` "Round 1: web_search" / "\"BTC price last month\""
  - `dg-context` "Observation" / "$67,230 → $71,450"
  - `dg-tools` "Round 2: code_interpreter"
  - edges forming the cycle, with an edge label "observation feeds the next round"
- Left of the container: `dg-node dg-model` "LLM (Kimi K3 / GPT-5.6)" / "native agent capability" / "from RL training".
- Right of the container: `dg-node dg-tools` "Native tools" / "web_search" / "code_interpreter" / "more tools…".
- Bottom: `dg-node dg-neutral` "Final output: analysis" / "report + chart".
- Footer note box `dg-node dg-env` "Kimi path: tools run server-side," / "but client code drives the loop".
- Title "Model as Agent: native tool calling".

**Outline:**
1. TL;DR: ReAct is a loop of reason → act → observe that appends every step to a trajectory. Each LLM call sees the static prefix plus the full trajectory. When the "model is the agent", the decision policy moves into the weights but the loop still runs somewhere.
2. `## Reason, act, observe` (line 165) + Figure A in `<StepAnimator label="ReAct loop">`.
3. `## The trajectory is the agent's working memory` (line 167): definition, and **Agent context = static prefix + trajectory**.
4. `## A minimal loop`: the source pseudocode (lines 172–188, keep as `python` with title "react_loop (book pseudocode)"), then who does what: Model decides, Harness assembles and validates, Environment executes (line 170). **Engineer addition**:

   ```python title="react_loop.py (illustrative — adapt to your SDK)"
   MAX_ROUNDS = 20

   def run_agent(llm, tools, system_prompt, user_request):
       trajectory = [{"role": "user", "content": user_request}]
       for _ in range(MAX_ROUNDS):
           reply = llm.chat(
               messages=[{"role": "system", "content": system_prompt}] + trajectory,
               tools=[tool.schema for tool in tools.values()],
           )
           trajectory.append(reply.as_message())
           if not reply.tool_calls:                    # no tool call -> final answer
               return reply.content
           for call in reply.tool_calls:               # independent calls may run in parallel
               tool = tools.get(call.name)
               result = tool.run(**call.arguments) if tool else f"Error: unknown tool {call.name}"
               trajectory.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})
       raise RuntimeError("Stopped: reached MAX_ROUNDS without a final answer")
   ```

   Follow it with a short bullet list mapping lines to Model / Harness / Environment. Note that `MAX_ROUNDS` is the stop condition covered in lesson 1.7 (`[lesson 1.7](/learn-ai-agents/chapter-1/07-orchestration-patterns/)`). Add this link only in Task 10, after that page exists; before then, write it as plain text "lesson 1.7".
5. `## Walkthrough: multi-currency revenue`: Figure B in `<StepAnimator label="Trajectory, round by round">`, the source trajectory block (lines 192–228, keep as `text`), 3 iterations and 4 tool calls (line 232), the system prompt not shown (line 230), and why this makes the loop interpretable and debuggable (line 234).
6. `## When the model drives the loop: Experiments 1-2 and 1-3` (lines 238–260):
   - Kimi K3: MoE with ~2.8T parameters, 1M-token context, always-on thinking mode; RL internalizes the decision policy, not the tools; tools run server-side via Formula but the client drives the loop; 200–300 stable consecutive calls; K3 Max and K3 Swarm Max.
   - GPT-5.6: freeform tool calling (`type: "custom"`), Responses API web search + code interpreter, the ASEAN capitals and Bitcoin examples, intent clarification, the server-side loop, and the alternatives (Bailian qwen3.7-plus, Kimi Formula).
   - Figure C.
   - **Engineer addition** table "Where does each piece run?" with columns | Kimi K3 path | Responses API path:
     - Tool-call decision: model | model
     - Tool execution: server-side (Formula) | server-side (built-in tools)
     - Loop driver: client code (`while` loop) | API server
   - `:::note[Engineer's note]`: RL gives the model the decision policy, not the tools. Tool implementations, sandboxes, and call infrastructure still live outside the weights (line 244).
   - Footnote link (GitHub issue #30) in References.
7. `<KeyTakeaways>`, `### References`.

**Quizzes:**
1. "Cumulative cache reads in a ReAct loop grow roughly quadratically with rounds. Why, and how do you reduce it?" Answer from reference answer 2 (line 13): round *i* rereads a prefix proportional to *i*, so the total is 1+2+…+n = O(n²). Trajectory length and KV-cache footprint grow only linearly. Batch-compress early trajectory at token thresholds, externalize large intermediate results, or isolate them in sub-agents. Don't compress every round.
2. "On the Kimi K3 path, what runs on the server and what runs on the client?" Answer: The model decides and the tools (web_search, code_runner) execute server-side via Formula. The call model → append result → call again loop is still driven by client code (line 240).
3. "Why does every call get the full trajectory in the basic design?" Answer: So the model knows which stage it is in, what it tried, and what happened. The structured roles also make the system interpretable and debuggable (line 234).

---

### Task 9: Lesson 1.6 — Harness Engineering

**Files:**
- Create: `src/content/docs/chapter-1/06-harness-engineering.mdx`, `src/components/diagrams/chapter-1/ModelHarnessSplit.astro`, `src/components/diagrams/chapter-1/EngineeringParadigms.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/06-harness-engineering/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: Harness Engineering
description: Agent = Model + Harness — the five harness responsibilities, where production code actually goes, the evolution from prompt to graph engineering, and how to choose a model.
sidebar:
  order: 6
  label: 1.6 Harness Engineering
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#harness-engineering-building-reliable-systems-around-the-model
  sections:
    - "Harness Engineering: Building Reliable Systems Around the Model"
    - "From Prompt Engineering to Loop Engineering: The Evolution of Engineering Paradigms"
    - Core Principles for Building Effective Agents
    - How to Choose a Model
---
```

**Source:** lines 262–370.

**Diagram A — `ModelHarnessSplit.astro`** (new, static, prefix `d-mhs`). viewBox `0 0 720 400`, min-width 630.
- `dg-container dg-neutral` "Agent" (x 12–540).
- Inside it, on the left: `dg-node dg-model` "Model" / "decides".
- Inside it, a `dg-container dg-harness` "Harness" holding five stacked `dg-node`s:
  - `dg-context` "Context management"
  - `dg-tools` "Tool interfaces"
  - `dg-guard` "Constrain" / "what it may do"
  - `dg-guard` "Verify" / "did it work?"
  - `dg-guard` "Correct" / "recover or roll back"
- A bracket label next to the first two: "minimal demo"; next to all five: "production".
- Outside, on the right: `dg-node dg-env` "Environment" / "DBs · files · users".
- A two-headed edge between the Harness and the Environment, labelled "mediates".
- Title "Agent = Model + Harness".

**Diagram B — `EngineeringParadigms.astro`** (new, static, prefix `d-ep`). viewBox `0 0 720 400`, min-width 630.
- Five nested `dg-container`s, outermost to innermost, with titles top-left:
  - `dg-neutral` "Graph engineering: explicit execution graph"
  - `dg-harness` "Loop engineering: sustained runs"
  - `dg-guard` "Harness engineering: the system around the model"
  - `dg-context` "Context engineering: everything the model sees"
  - `dg-model` "Prompt engineering"
- Each inner container is inset about 24 units and starts about 40 units lower.
- Title "Nested engineering paradigms". Desc states that each layer contains the previous one.

**Outline:**
1. TL;DR: A demo needs a model plus context and tools. A product needs a harness that also constrains, verifies, and corrects. Most production harness code is those safeguards, and that is where the competitive edge now lies.
2. `## From demo to product` (line 264): the fragilities (hallucinated tools or parameters, the wrong tool, no recovery).
3. `## Agent = Model + Harness` (lines 266–276): the formulas as a blockquote, the refund-agent example, the boundary (inside the agent, outside the model), and what belongs where. Figure A. The five-component table (lines 280–286), kept with all columns.
4. `## The control loop`: the source pseudocode (lines 290–302), then **engineer addition**, the refund agent made concrete:

   ```python title="refund_agent_step.py (illustrative)"
   def apply_refunds(actions, env, harness):
       allowed = [a for a in actions if harness.constrain(a)]   # permission + amount rules from policy
       for action in allowed:
           result = env.apply(action)                            # call the refund API
           if not harness.verify(action, env):                   # read back database state, not model text
               result = harness.correct(action, env)             # retry, fall back after timeout, or escalate
           yield action, result
   ```
5. `## Where production harness code goes` (lines 306–318): the shift toward Constrain/Verify/Correct, the list of Claude Code mechanisms, and the bolded conclusion.
6. `## Prompt → context → harness → loop → graph` (lines 320–338): Figure B, each stage, Graph Engineering (footnote links in References), and LangChain Terminal Bench 2.0 going from 52.8% to 66.5% with only harness changes.
7. `## Three principles` (lines 340–352): keep it simple, keep it transparent, design the ACI with poka-yoke (SIM card, microwave, Toyota). Links in References.
8. `## Choosing a model` (lines 356–370): **engineer addition** as a checklist:
   - Evaluate on your own tasks, not leaderboards.
   - Closed models (OpenAI, Anthropic) usually lead but cost more and follow vendor API policies. Open models (DeepSeek, Kimi, GLM) lag by ≤6 months, are cheaper, and support private deployment and fine-tuning. Test tool calling specifically.
   - Check policy boundaries: is the model willing, does the interface expose the capability, and do the terms permit the use? Prepare a fallback (human handoff or another compliant model).
   - Use a reasoning model for anything multi-step. The exceptions are a single simple step or fixed-position GUI clicks.
   - Output token speed: 20 rounds × 2 s slower = +40 s end-to-end.
   - Multimodal support, if you need images, audio, or video.
9. `<KeyTakeaways>`, `### References`.

**Quizzes:**
1. "Sandbox permissions vs. the files changing inside the sandbox: which is harness and which is environment?" Answer: Tool definitions, call adapters, sandbox permissions, and reset mechanisms are harness. Files and processes changing inside the sandbox are environment. Where things are deployed doesn't change the boundary (line 278).
2. "LangChain's coding agent jumped from 52.8% to 66.5% on Terminal Bench 2.0. What changed?" Answer: Only the harness. The agent checked its own results, detected repetitive loops, and refined its reasoning strategy, with the same model (line 338).
3. "Where should a security check read its input from?" Answer: From structured data such as fields returned by tools, not from model-generated text that prompt injection can influence. This is the input-isolation principle (Verification row of the table, line 285).
4. "Model A is 2 s/round slower than Model B but a bit more accurate. Your agent averages 20 rounds. What's the latency cost?" Answer: About 40 s more end-to-end, because rounds run sequentially. Weigh that against the accuracy gain measured on your own tasks (line 370).

---

### Task 10: Lesson 1.7 — Orchestration: Workflow vs. Autonomous

**Files:**
- Create: `src/content/docs/chapter-1/07-orchestration-patterns.mdx`, `src/components/diagrams/chapter-1/WorkflowVsAutonomous.astro`, `src/components/diagrams/chapter-1/AutonomousLoop.astro`, `src/components/diagrams/chapter-1/N8nWorkflow.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/07-orchestration-patterns/'`), `src/content/docs/style-guide.mdx`, `src/content/docs/chapter-1/05-react-loop.mdx` (turn the plain-text "lesson 1.7" into the link `/learn-ai-agents/chapter-1/07-orchestration-patterns/`)

**Frontmatter:**

```yaml
---
title: "Orchestration: Workflow vs. Autonomous"
description: When to use a single call, a deterministic workflow, or an autonomous agent — with the flight-booking example both ways, stop conditions, mixing patterns, and frameworks.
sidebar:
  order: 7
  label: "1.7 Orchestration: Workflow vs. Autonomous"
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#orchestration-patterns-workflow-vs-autonomous
  sections:
    - "Orchestration Patterns: Workflow vs. Autonomous"
    - "Workflow Pattern: Deterministic Orchestration"
    - "Autonomous Agent: Runtime Decision-Making"
    - Choosing and Mixing the Two Patterns
    - Brief Comparison of Mainstream Agent Frameworks
---
```

**Source:** lines 372–464.

**Diagram A — `WorkflowVsAutonomous.astro`** (new, static, prefix `d-wva`). viewBox `0 0 720 420`, min-width 630.
- Two `dg-container`s side by side, each about 340 wide.
- Left, `dg-neutral` "Workflow: path fixed in code": four stacked `dg-tools` nodes "1 Verify identity", "2 Search flights", "3 Complete payment", "4 Confirm booking", joined by straight edges. Footer text (`dg-sub`) "LLM works inside each node".
- Right, `dg-neutral` "Autonomous: path chosen at run time": a `dg-model` node "Agent" at the center, with edges out to and back from `dg-tools` nodes "search", "verify identity", and "ask user". Edge labels "login required", "layover OK?". Footer text "stops on a stop condition".
- Title "Workflow vs. autonomous agent for flight booking".

**Diagram B — `AutonomousLoop.astro`** (redraw of Fig 1-6, animated, prefix `d-al`). viewBox `0 0 720 380`, min-width 630.
- Left column of three `dg-node`s joined by edges:
  - `dg-model` "① Think" / "\"need more info\""
  - `dg-tools` "② Act" / "web_search(…)"
  - `dg-context` "③ Observe" / "tool_result: …"
- A diamond-like decision, drawn as a `dg-node dg-neutral` rounded rect: "Exit condition met?".
- Edge "No" loops back to Think, labelled "continue the loop".
- Edge "Yes" goes to `dg-node dg-tools` "Return final result".
- Right: `dg-node dg-guard` list box "Exit conditions (any one)" / "task complete" / "final_answer called" / "no tool call" / "error limit exceeded" / "max rounds reached".
- Steps: 1 Think ("The agent reasons about the next step"), 2 Act ("It calls a tool"), 3 Observe ("It reads the result"), 4 decision + exit box ("It checks the exit conditions"), 5 No-edge ("Not done: loop again"), 6 Yes-edge + Return ("Done: return the final result").
- Title "Execution loop of an autonomous agent".

**Diagram C — `N8nWorkflow.astro`** (schematic redraw of the Fig 1-7 screenshot, static, prefix `d-n8n`). viewBox `0 0 720 430`, min-width 630.
- Row 1:
  - `dg-node dg-env` "Telegram trigger" / "incoming message"
  - edge to `dg-container dg-neutral` "Process request", containing `dg-tools` "Voice or text?", then `dg-tools` "If voice", then `dg-tools` "Get voice file"
- Row 2, continuing via an edge from the container:
  - `dg-tools` "Speech to text"
  - edge to `dg-model` "AI agent node" / "(\"Angie\" assistant)"
  - edge to `dg-env` "Telegram" / "send reply"
- Row 3, dashed edges up to the agent node, each with an edge label:
  - `dg-model` "Chat model", label "model"
  - `dg-context` "Window memory", label "memory"
  - four `dg-tools` "Get email", "Calendar", "Tasks", "Contacts", label "tools"
- Legend text (free): "workflow nodes and an autonomous agent node in one system".
- Title "An n8n workflow mixing deterministic nodes with an agent node".

**Outline:**
1. TL;DR: Start with the simplest thing that works: a single call, then a workflow, and only then an autonomous agent. Workflows buy ordering guarantees and a small attack surface; autonomy buys flexibility at the cost of latency, money, and compounding errors. Most real systems mix both.
2. `## Start simple` (lines 374–380): the progression, the latency/cost trade-off, the million-message memory pipeline counterexample, "Less structure, more intelligence" (link), hard-coding only invariant boundaries, and promoting a step only when constraints or evals demand it. **Engineer addition**, a decision table with columns Situation | Start with:
   - One transformation, solvable with better prompts or examples | a single LLM call
   - Fixed, decomposable steps; ordering is a compliance rule | workflow
   - Unknown number of steps; open-ended exploration | autonomous agent
   - Strict core process with flexible edges | workflow backbone + autonomous nodes
   - Unfamiliar tasks where you want deterministic execution | agent writes the workflow, then the workflow runs
3. `## Workflows: the path lives in code` (lines 386–416): the definition; the flight example with four nodes; the advantages (strict control; security, since the attack surface is confined to one node); the limitation; the text-to-image example and the adapter layer; native image generation (Nano Banana 2, GPT-Image 2); a short summary of Experiment 1-4; and the three internalization examples as a bullet list.
4. `## Autonomous agents: the path is chosen at run time` (lines 420–432): the definition, the dynamic flight example, stop conditions, exit conditions, Figure B in `<StepAnimator label="Autonomous agent loop">`, use cases (SWE-bench, Computer Use, research), and the costs and required safeguards.
5. `## The same task, both ways`: Figure A, then **engineer addition**:

   ```python title="flight_workflow.py (illustrative)"
   def book_flight_workflow(request, user):
       identity = verify_identity(user)                          # node 1 — order is enforced by code
       options = search_flights(llm_extract_criteria(request))  # node 2 — the LLM only parses the request
       payment = charge(identity, choose_flight(options))       # node 3
       return confirm_booking(payment)                          # node 4 — can never run before payment
   ```

   ```python title="flight_autonomous.py (illustrative)"
   tools = {t.name: t for t in [search_flights, verify_identity, charge, confirm_booking, ask_user]}
   answer = run_agent(llm, tools, system_prompt=FLIGHT_POLICY,
                      user_request="Book me a flight to Shanghai next Wednesday")
   # The model chooses the order at run time. Rules like "no booking before payment"
   # are no longer guaranteed by the code path — the harness must enforce them (lesson 1.8).
   ```

   Note that `run_agent` is the loop from lesson 1.5 (link `/learn-ai-agents/chapter-1/05-react-loop/`).
6. `## Mixing the two` (lines 436–440): n8n, Figure C (`credit="Redrawn from Figure 1-7 (n8n screenshot), AI Agent Book by Bojie Li (Apache 2.0)."`), and "the agent writes the workflow, the workflow executes".
7. `## Frameworks at a glance` (lines 444–462): all 9 rows of the table, the Codex Harness integration paths (`codex exec`, the Codex SDK, the app-server over JSON-RPC), the Claude Agent SDK analogy, and "choose the thinnest abstraction that lets you focus on business logic".
8. `<KeyTakeaways>`, `### References`.
9. Also edit lesson 1.5 as listed under Files.

**Quizzes:**
1. "Would you build a flight-booking customer-service system as a workflow or an autonomous agent? Can you mix them?" Answer from reference answer 6 (line 29): use a workflow backbone (identity → search → payment → booking) to guarantee ordering and confine prompt injection to a single node. Switch to autonomous segments for open-ended parts (understanding requirements, rebooking, alternatives when a flight is canceled). Add human confirmation for large payments and refunds.
2. "Why is a workflow more resistant to prompt injection?" Answer: The path is deterministic. An injection or model error can only affect processing inside the current node; it can't make the system jump to a branch it shouldn't reach (line 397).
3. "Name an agent engineering method likely to become obsolete as models improve, and explain why." Answer from reference answer 10 (lines 45–51). Summarize two examples:
   - Constrained sampling to force a strict tool-call format: its benefit shrinks as models follow formats reliably, though high-risk paths keep deterministic validation.
   - Requiring prompts and tool definitions at the start of context: Skills and dynamic tool discovery load them mid-trajectory as models are post-trained for it.

---

### Task 11: Lesson 1.8 — Guardrails, Safety & the Big Picture

**Files:**
- Create: `src/content/docs/chapter-1/08-guardrails-and-big-picture.mdx`, `src/components/diagrams/chapter-1/GuardrailLayers.astro`, `src/components/diagrams/chapter-1/HarnessElementsMap.astro`
- Modify: `tests/diagram-pages.ts` (append `'chapter-1/08-guardrails-and-big-picture/'`), `src/content/docs/style-guide.mdx`

**Frontmatter:**

```yaml
---
title: Guardrails, Safety & the Big Picture
description: Three guardrail layers ordered by how hard they are to bypass, when to bring in a human, how the harness maps onto the book, and the five design patterns that recur throughout.
sidebar:
  order: 8
  label: 1.8 Guardrails, Safety & the Big Picture
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md#guardrails-and-safety
  sections:
    - Guardrails and Safety
    - Types of Guardrails
    - Human Intervention
    - The Five Harness Elements and the "Building" Part
    - Design Patterns That Run Through the Book
    - Chapter Summary
    - Thought Questions
---
```

**Source:** lines 466–572.

**Diagram A — `GuardrailLayers.astro`** (new, static, prefix `d-gl`). viewBox `0 0 720 430`, min-width 630.
- Three full-width stacked `dg-node dg-guard` bands, top to bottom:
  1. "Context layer: what the model sees" / "relevance & safety classifiers ·" / "moderation · rules · source labels"
  2. "Execution layer: what the model does" / "tool risk rating · human confirm ·" / "PII filter · output validation"
  3. "Data layer: what may change" / "row-level security · constraints ·" / "controlled views · trusted context"
- Along the right edge, a vertical `dg-edge` arrow pointing down, labelled "harder to bypass" (the label goes in the gutter between bands and the edge; keep the viewBox wide enough).
- A small `dg-node dg-neutral` note at the bottom: "Lower layers don't depend on" / "the model's judgment".
- Title "Three guardrail layers, ordered by how hard they are to bypass".

**Diagram B — `HarnessElementsMap.astro`** (new, static, prefix `d-hem`). viewBox `0 0 720 380`, min-width 630.
- Left column of `dg-node`s for the harness focus areas:
  - `dg-context` "Context management"
  - `dg-context` "Context across sessions"
  - `dg-tools` "Tool interfaces & constraints"
  - `dg-guard` "Verification & correction"
- Edges from each to right-column `dg-node dg-neutral` chapter boxes:
  - "Ch 2 Context engineering"
  - "Ch 3 Memory & knowledge"
  - "Ch 4 Tools"
  - "Ch 5 Coding & general agents"
- A bottom band of `dg-node dg-neutral` boxes:
  - "Ch 6 Interaction: widens obs/action spaces"
  - "Ch 7–9 Evaluate & improve"
  - "Ch 10 Multi-agent"
- Title "How the five harness elements map to the book".

**Outline:**
1. TL;DR: No single guardrail is enough. Layer them by how hard each is to bypass: what the model sees, what it does, and what data may change. The lowest layer holds even when the upper ones fail. Bring in a human for failure thresholds and high-risk actions.
2. `## Defense in depth` (lines 468–472): purposes (privacy, e.g. system prompt leakage; reputation), starting from known risks, no single guardrail being enough, and false refusal (test that permitted requests still work).
3. `## Three layers` (lines 476–488): Figure A.
   - Context layer: the four mechanisms, jailbreak vs. prompt injection, source labelling, Constitutional Classifiers (three design elements, link), and the structural ceiling.
   - Execution layer: tool risk rating (reversibility, privilege, financial impact); review must happen outside the context; output checks (PII filter, output validation).
   - Data layer: row-level security, constraints and validators, controlled views and stored procedures, a trusted access context. It holds even if the layers above fail.

   **Engineer addition** (restates reference answer 7):

   ```python title="risk.py (illustrative)"
   import os

   WORKDIR = "/srv/agent/workspace/"
   PROTECTED = ("/etc/", "/usr/", "/System/")
   TOOL_BASE_RISK = {"read_file": "low", "search": "low", "delete_file": "medium", "send_email": "high"}

   def risk_of(call):
       """Rate the tool *and* its arguments with deterministic rules on structured fields."""
       if call.name == "delete_file":
           path = os.path.realpath(call.arguments["path"])
           if path.startswith(PROTECTED) or not path.startswith(WORKDIR):
               return "high"                       # outside the authorized directory: escalate
       return TOOL_BASE_RISK.get(call.name, "high")  # unknown tools default to high (fail-safe)
   ```
4. `## Bringing in a human` (lines 492–502): graceful handoff (customer service → human agent; coding agent → developer) and the two triggers (exceeding failure thresholds; high-risk operations).
5. `## How the harness maps onto the book` (lines 506–523): the two formulas at different levels of detail, Figure B, the source table (lines 512–517, all columns), Chapters 6/7–9/10, security as a cross-cutting concern, and Anthropic's Initialization Agent / Execution Agent split for long-running agents.
6. `## Five design patterns you'll see again` (lines 525–537): **engineer addition**, a table with columns Pattern | Rule | What it buys you:
   - Proposer–Reviewer | Creator and reviewer use separate contexts; review the artifact, not the reasoning | Catches blind spots and injected context that self-review misses
   - Progressive Disclosure | Show a searchable catalogue first, load details on demand | Smaller context budget, more accurate selection
   - Append-only | Evolve state by appending, never editing in place | Cacheability, replayability, auditability
   - Boundary Set + Retention Set | Validate on what should change *and* what must not | Separates real progress from overfitting and no-op changes
   - Minimal Diff, Reversible | Small, attributed, independently revertible changes | Failures trace to one change

   Then one line per pattern on where the book uses it.
7. `## Chapter 1 cheat sheet` (lines 541–557): the seven summary points as a tight bullet list.
8. `<KeyTakeaways>` for this lesson, `### References`.

**Quizzes:**
1. "A tool is usually low-risk but dangerous with certain arguments (`delete_file` on a system file). How do you assess risk dynamically?" Answer from reference answer 7 (line 33): rate "tool + arguments" at call time based on reversibility, permissions, and blast radius. Use deterministic rules (path allow/block lists, regexes), not model judgment, and inspect only structured data.
2. "Prompt injection succeeded and the generated code skipped its permission check. Which layer still stops the unauthorized write?" Answer: The data layer. Row-level security, constraints, and trusted access context reject it regardless of the layers above (line 488).
3. "Why must high-risk reviews happen outside the agent's context?" Answer: Otherwise the same attack could compromise both the agent and its safeguard. Use independent review, least-privilege credentials, sandboxing, or a human in the loop (line 486).
4. "The agent needs a human to confirm, but the user is offline, slow, or vague. What should it do?" Answer from reference answer 9 (line 41): fail safe. Pause high-risk operations rather than executing by default, do the reversible low-risk parts, and document the rest for the human. Notify asynchronously with a timeout policy, and clarify intent when instructions are vague.

---

### Task 12: Chapter overview, landing page, and full-chapter verification

**Files:**
- Modify: `src/content/docs/chapter-1/index.mdx`, `src/content/docs/index.mdx`, `tests/smoke.spec.ts`

**Interfaces:**
- Consumes: all 8 lesson pages (Tasks 4–11).

- [ ] **Step 1: Write the failing tests** — append to `tests/smoke.spec.ts`

```ts
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
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx astro build && npx playwright test tests/smoke.spec.ts`
Expected: the 2 new tests fail (no "Start Chapter 1" link; 0 lesson links in the overview).

- [ ] **Step 3: Add lesson cards to the chapter overview** — append to `src/content/docs/chapter-1/index.mdx`, with the import directly under the frontmatter:

```mdx
import { LinkCard, CardGrid } from '@astrojs/starlight/components';

## Lessons

Each lesson takes 8–12 minutes and ends with a short self-check.

<CardGrid>
	<LinkCard title="1.1 What an Agent Actually Is" description="Agent = LLM + Context + Tools, and the boundary with the environment." href="/learn-ai-agents/chapter-1/01-what-is-an-agent/" />
	<LinkCard title="1.2 Observation & Action Spaces, Tools" description="Why widening what an agent sees and does is the main lever." href="/learn-ai-agents/chapter-1/02-observation-action-tools/" />
	<LinkCard title="1.3 The LLM as Reasoning Engine" description="Model as Agent, the Bitter Lesson, and three ways behavior changes." href="/learn-ai-agents/chapter-1/03-llm-reasoning-engine/" />
	<LinkCard title="1.4 Context: The Working Set" description="Five parts of every call, and what an ablation study reveals." href="/learn-ai-agents/chapter-1/04-context-working-set/" />
	<LinkCard title="1.5 The ReAct Loop" description="Reason, act, observe — trajectories and where the loop runs." href="/learn-ai-agents/chapter-1/05-react-loop/" />
	<LinkCard title="1.6 Harness Engineering" description="Agent = Model + Harness, and where production code really goes." href="/learn-ai-agents/chapter-1/06-harness-engineering/" />
	<LinkCard title="1.7 Orchestration: Workflow vs. Autonomous" description="Choosing, combining, and stopping orchestration patterns." href="/learn-ai-agents/chapter-1/07-orchestration-patterns/" />
	<LinkCard title="1.8 Guardrails, Safety & the Big Picture" description="Three guardrail layers, humans in the loop, and recurring patterns." href="/learn-ai-agents/chapter-1/08-guardrails-and-big-picture/" />
</CardGrid>
```

- [ ] **Step 4: Update the landing page** — replace `src/content/docs/index.mdx`

```mdx
---
title: Learn AI Agents
description: An engineer-focused guided tutorial of AI Agent Book by Bojie Li — short lessons, clear diagrams, and self-check quizzes.
template: splash
hero:
  tagline: A guided, engineer-focused walkthrough of Bojie Li's AI Agent Book — short lessons, clear diagrams, and self-check quizzes.
  actions:
    - text: Start Chapter 1
      link: /learn-ai-agents/chapter-1/
      icon: right-arrow
    - text: About this tutorial
      link: /learn-ai-agents/about/
      variant: minimal
---
import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
	<Card title="Built for engineers" icon="laptop">
		Interfaces, data flow, trade-offs and failure modes — with illustrative code, not hand-waving.
	</Card>
	<Card title="Diagrams that teach" icon="puzzle">
		One consistent color language for model, context, tools, harness and environment. Step through the loops.
	</Card>
	<Card title="Short lessons" icon="open-book">
		Chapter 1 in eight 8–12 minute lessons, each ending with a self-check quiz.
	</Card>
	<Card title="Faithful to the source" icon="approve-check">
		Adapted from AI Agent Book by Bojie Li under the Apache License 2.0, with every section covered.
	</Card>
</CardGrid>
```

- [ ] **Step 5: Run the full suite, including the completeness check**

Run: `npm test`
Expected:
- the checker prints `✓ 8 lesson(s) pass structure checks` and no "not covered" errors (all 27 source headings claimed);
- the build has no link errors;
- all Playwright tests pass: smoke (4), components (4), animator (4), and diagrams (9 pages × 4 = 36).

- [ ] **Step 6: Full visual pass**

Open every PNG in `diagram-shots/` with the Read tool (15 lesson diagrams + legend, 4 variants each). Check them for consistency across lessons: the same concept should look the same everywhere, and spacing and title sizes should match. Then run `npm run dev` and read through lessons 1.1–1.8 in the browser in both themes. Confirm the prev/next links, the sidebar order (Overview, 1.1…1.8), the attribution footer on each lesson, and that the quizzes expand.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add chapter 1 overview, landing page and full-chapter checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `npm test` from Task 12.

- [ ] **Step 1: Write the workflow** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
        env:
          CI: true

  build:
    needs: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Commit the workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: verify, build and deploy to GitHub Pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 3: STOP — get the user's explicit go-ahead before publishing.** The next steps create a **public** repository `n0k0259/learn-ai-agents` and publish the site. Ask the user to confirm both.

- [ ] **Step 4: Create the repo, push, and enable Pages** (only after confirmation)

```bash
gh repo create n0k0259/learn-ai-agents --public --source . --remote origin --push \
  --description "Engineer-focused tutorial of AI Agent Book (Bojie Li), Chapter 1"
gh api -X POST repos/n0k0259/learn-ai-agents/pages -f build_type=workflow
gh workflow run deploy.yml
sleep 5 && gh run watch "$(gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

Expected: the verify, build, and deploy jobs all succeed. If the push-triggered run started before Pages was enabled and failed at deploy, the `workflow_dispatch` run is the one to watch.

- [ ] **Step 5: Verify the live site**

```bash
curl -sf -o /dev/null -w "%{http_code}\n" https://n0k0259.github.io/learn-ai-agents/
curl -sf https://n0k0259.github.io/learn-ai-agents/chapter-1/05-react-loop/ | grep -o '<title>[^<]*'
```

Expected: `200`, then `<title>The ReAct Loop | Learn AI Agents`. Report the live URL to the user.
