# Learn AI Agents — Chapter 2 (Context Engineering) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chapter 2, "Context Engineering", to the live Starlight site as 10 lessons with 25 custom SVG diagrams (5 animated) and 35 quizzes. Everything goes on branch `feat/chapter-2`, ready to merge.

**Architecture:**
- Lessons are MDX files in `src/content/docs/chapter-2/`.
- Diagrams are inline-SVG Astro components in `src/components/diagrams/chapter-2/`. They use the existing concept-color system, `Figure`, and `StepAnimator`.
- The lesson checker is generalized so it validates both chapters and ignores headings inside code fences.
- Playwright's diagram audit runs on every Chapter 2 lesson page.

**Tech Stack:** Node 22, Astro 7.3.x, @astrojs/starlight 0.42.3, starlight-links-validator, @playwright/test 1.63, yaml, `node:test` (built in).

**Spec:** `docs/superpowers/specs/2026-09-23-chapter2-context-engineering-design.md`. The per-lesson working detail is `docs/superpowers/specs/chapter2-outline-draft.md` (the "outline"). The spec wins wherever they disagree.

**Source material:**
- `source/book-en/chapter2.md` (1,122 lines). The line numbers below refer to this file.
- `source/book-en/reference-answers.md`. Lines 53–89 are the Chapter 2 Thought Question answers.
- There are no Chapter 2 images locally. Figures are redrawn from their alt text and the surrounding prose.

## Global Constraints

- Site: `site: 'https://n0k0259.github.io'`, `base: '/learn-ai-agents'`. Internal links include the base, e.g. `/learn-ai-agents/chapter-2/02-tool-calls-core-loop/`.
- Work on branch `feat/chapter-2`. Never push, merge or deploy. The controller asks the owner before merging.
- **No per-page attribution footer or "Read the original section" link. No reader-credit or GitHub-issue thank-you notes.** Credits live only on `about.mdx`.
- Audience: software engineers. Be concise and precise. Use second person and active voice, with paragraphs of at most 4 sentences. Write **1,200–2,200 words of body prose** per lesson; code, tables, quizzes and captions don't count.
- **Fidelity:**
  - Every claim, number, name and example comes from the lesson's source line range, quoted exactly.
  - No invented emphasis. No stronger wording than the book uses: keep its hedges ("often", "roughly", "for example").
  - No filler or meta sentences ("In this lesson we will…").
  - Prose must not restate an adjacent table or list.
  - Cross-references must point to the correct lesson.
  - "Engineer additions" (tables, checklists, illustrative code) only restate or concretize source concepts. Label illustrative code in the fence title, e.g. `title="SKILL.md (illustrative)"`.
- Source inconsistencies:
  - Use **150K** characters (line 1058). Never mention 148K, including in the Thought Question 3 quiz.
  - Q8's reference answer is overridden by the body; see Task 8.
- There is no math rendering. Write formulas in Unicode or inline code.
- Book cross-references to chapters that aren't on the site stay as plain text, e.g. "(Chapter 4 of the book)". References to Chapter 1 or 2 material are site links to the right lesson.
- Lesson template, in this order (enforced by `scripts/check-lessons.mjs`):
  1. frontmatter
  2. imports
  3. `:::tip[TL;DR]` (2–3 lines)
  4. content, with `:::note[Engineer's note]` callouts where relevant
  5. `<KeyTakeaways>` (3–5 bullets)
  6. optional `### References` (the source's external links only)
  7. `## Check yourself` with the given number of `<Quiz question="…">` items
- Book experiments are rendered as `:::note[Experiment 2-N: <name>]` asides covering what was tested, the result, and the takeaway. The research-stage "KV as notes" section (2.4) goes in a `<details>` element whose `<summary>` reads "Research aside: KV cache as editable notes (optional)".
- Frontmatter `source.sections` entries are single-quoted YAML strings copied exactly from `chapter2.md`, including the curly `’` in "Agent’s". `source.url` = `https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#<anchor>`.
- Figure credit for redrawn book figures: `credit="Redrawn from Figure 2-N, AI Agent Book by Bojie Li (Apache 2.0)."`. New diagrams have no credit.
- **Diagram rules** (enforced by `tests/diagrams.spec.ts`, same as Chapter 1):
  - The root is `<svg class="dg" viewBox="0 0 W H" role="img" aria-labelledby="{prefix}-title {prefix}-desc" style="min-width: Mpx">`, with `<title id="{prefix}-title">` and `<desc id="{prefix}-desc">` as its first children.
  - `W ≤ 720` and `M = ceil(0.875 × W)`.
  - Font sizes: minimum 16 viewBox units, titles 20. Rendered text must be ≥ 14px.
  - Every labelled box is `<g class="dg-node dg-{concept}">` with one direct `<rect>` and direct `<text>` children. Grouping boxes are `<g class="dg-container dg-{concept}">`.
  - Text is only ever a direct child of its node or container. `transform` goes only on `<g>`.
  - Concepts: `model`, `context`, `tools`, `env`, `harness`, `guard`, `neutral`.
  - Edges are `<g class="dg-edge">` wrapping a `<path>` or `<line>` with `marker-end="url(#{prefix}-arrow)"`. Edge labels are `<text class="dg-edge-label">`.
  - All ids use the diagram's kebab prefix; Chapter 2 prefixes start with `d2-`.
  - Contrast ≥ 4.5:1. Nodes don't overlap unless nested.
  - Animated diagrams put `data-step="n"` (1-based) on elements, and `data-step-label="…"` on exactly one element per step.
  - Never hard-code hex colors. Never change the diagram fonts (self-hosted InterVariable + `text-rendering: geometricPrecision`; box widths depend on them).
  - Look at `src/components/diagrams/chapter-1/AgentEnvironmentLoop.astro` (animated) and `ContextAblation.astro` (static) for working patterns.
  - Text-width budget: about 8.5 viewBox units per character at 16px, plus 16 units of padding. The audit has the final say.
- Chapter 2 diagrams are **not** copied into `style-guide.mdx`. They're audited on the lesson pages.
- Local test runs: `export ASTRO_PREVIEW_BACKGROUND=1` first (never commit it). `npm test` = `astro build` + `node --test 'scripts/*.test.mjs'` + `check:lessons` + `playwright test`.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## File Structure

```
scripts/
├── check-lessons.mjs                 # MODIFY: loops over CHAPTERS; uses lib/source-headings.mjs
├── lib/source-headings.mjs           # NEW: extractHeadings(markdown) → string[] (fence-aware)
├── source-headings.test.mjs          # NEW: node:test unit tests
└── fixtures/fenced-headings.md       # NEW: test fixture
package.json                          # MODIFY: test script adds `node --test 'scripts/*.test.mjs'`
astro.config.mjs                      # MODIFY: Chapter 2 sidebar group
src/content/docs/
├── index.mdx                         # MODIFY: Chapter 2 card
├── chapter-1/*.mdx                   # MODIFY (Task 12 only): forward references become links
└── chapter-2/
    ├── index.mdx                     # NEW (Task 12): overview + 10 LinkCards
    └── 01-…10-*.mdx                  # NEW (Tasks 2–11)
src/components/diagrams/chapter-2/*.astro   # NEW: 25 diagrams
tests/
├── diagram-pages.ts                  # MODIFY: each lesson task appends its page
├── smoke.spec.ts                     # MODIFY (Task 12)
└── components.spec.ts                # MODIFY (Task 12)
```

---

### Task 1: Generalize the lesson checker and make heading extraction fence-aware

**Files:**
- Create: `scripts/lib/source-headings.mjs`, `scripts/source-headings.test.mjs`, `scripts/fixtures/fenced-headings.md`
- Modify: `scripts/check-lessons.mjs`, `package.json` (the `test` script)

**Interfaces:**
- Produces: `export function extractHeadings(markdown: string): string[]`. It returns the normalized text of every `##`–`####` heading outside code fences. Also `export const norm = (s: string) => string` (curly quotes → straight quotes, trimmed).
- Produces: `check-lessons.mjs` validates every chapter in `CHAPTERS`. Chapter 2 starts with 0 lessons, which gives a warning, not a failure.

- [ ] **Step 1: Write the fixture**

`scripts/fixtures/fenced-headings.md`:

````markdown
# Title

## Real Heading One

```text
# Tool Usage Guidelines
## Fake Inside Fence
```

### Real Heading Two

> ```xml
> ## Fake Inside Quoted Fence
> ```

#### Real Heading “Three”

##### Too Deep
````

- [ ] **Step 2: Write the failing test**

`scripts/source-headings.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractHeadings, norm } from './lib/source-headings.mjs';

const fixture = readFileSync(new URL('./fixtures/fenced-headings.md', import.meta.url), 'utf8');

test('extracts ## to #### headings outside code fences', () => {
	assert.deepEqual(extractHeadings(fixture), ['Real Heading One', 'Real Heading Two', 'Real Heading "Three"']);
});

test('ignores headings inside plain and blockquoted fences', () => {
	const headings = extractHeadings(fixture);
	assert.ok(!headings.includes('Fake Inside Fence'));
	assert.ok(!headings.includes('Fake Inside Quoted Fence'));
});

test('norm straightens curly quotes', () => {
	assert.equal(norm(' Agent’s “x” '), `Agent's "x"`);
});

test('chapter2.md has exactly 41 real headings, none from fences', () => {
	const headings = extractHeadings(readFileSync('source/book-en/chapter2.md', 'utf8'));
	assert.equal(headings.length, 41);
	assert.ok(!headings.includes('File Operations'));
	assert.ok(!headings.includes('Network Requests'));
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `node --test 'scripts/*.test.mjs'`
Expected: FAIL, because `lib/source-headings.mjs` can't be found.

- [ ] **Step 4: Implement `scripts/lib/source-headings.mjs`**

```js
// Heading extraction for source chapters: ##–#### headings, skipping fenced code (including fences inside blockquotes).
export const norm = (s) =>
	s
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.trim();

const FENCE = /^(>\s*)?```/;

export function extractHeadings(markdown) {
	const headings = [];
	let inFence = false;
	for (const line of markdown.split('\n')) {
		if (FENCE.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (!inFence && /^#{2,4} /.test(line)) headings.push(norm(line.replace(/^#+ /, '')));
	}
	return headings;
}
```

- [ ] **Step 5: Run it and confirm it passes**

Run: `node --test 'scripts/*.test.mjs'`
Expected: 4 tests pass.

- [ ] **Step 6: Generalize `scripts/check-lessons.mjs`**

Replace the constants and the heading extraction with a `CHAPTERS` loop. Everything inside the per-file loop stays **exactly** as it is, except that the source-file name in the "not found" message comes from the chapter entry. The new top of the file and the loop skeleton:

```js
// Checks lesson structure and that every original section of each chapter is covered by exactly one lesson.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'yaml';
import { extractHeadings, norm } from './lib/source-headings.mjs';

const BOOK_URL = 'https://github.com/bojieli/ai-agent-book/blob/main/book-en/';
const CHAPTERS = [
	{ dir: 'src/content/docs/chapter-1', source: 'source/book-en/chapter1.md', expected: 8 },
	{ dir: 'src/content/docs/chapter-2', source: 'source/book-en/chapter2.md', expected: 10 },
];

const errors = [];
let total = 0;

for (const chapter of CHAPTERS) {
	const sourceName = basename(chapter.source);
	const SOURCE_URL_PREFIX = `${BOOK_URL}${sourceName}#`;
	const sourceHeadings = extractHeadings(readFileSync(chapter.source, 'utf8'));
	const claimed = new Map();
	const files = existsSync(chapter.dir)
		? readdirSync(chapter.dir)
				.filter((f) => /^\d{2}-.*\.mdx$/.test(f))
				.sort()
		: [];
	total += files.length;

	for (const file of files) {
		const err = (msg) => errors.push(`${basename(chapter.dir)}/${file}: ${msg}`);
		const text = readFileSync(join(chapter.dir, file), 'utf8');
		// … existing per-file checks, unchanged, except:
		//     err(`source section not found in ${sourceName}: "${s}"`)
	}

	const uncovered = sourceHeadings.filter((h) => !claimed.has(h));
	if (files.length === chapter.expected) {
		for (const h of uncovered) errors.push(`${sourceName}: original section not covered by any lesson: "${h}"`);
	} else if (uncovered.length) {
		console.warn(`${sourceName}: ${files.length}/${chapter.expected} lessons present; ${uncovered.length} original sections not yet covered.`);
	}
}

if (errors.length) {
	console.error(errors.map((e) => `✗ ${e}`).join('\n'));
	process.exit(1);
}
console.log(`✓ ${total} lesson(s) pass structure checks`);
```

Delete the old `LESSON_DIR`, `SOURCE`, `SOURCE_URL_PREFIX`, `EXPECTED_LESSONS` and `norm` definitions, and the old inline `sourceHeadings` filter.

- [ ] **Step 7: Wire the unit tests into `npm test`**

In `package.json`, set:
`"test": "astro build && node --test 'scripts/*.test.mjs' && npm run check:lessons && playwright test"`

- [ ] **Step 8: Verify**

Run: `npm run check:lessons`
Expected: `chapter2.md: 0/10 lessons present; 41 original sections not yet covered.` as a warning, then `✓ 8 lesson(s) pass structure checks`, with exit code 0.

Regression check: temporarily change one Chapter 1 `source.sections` entry, run the checker, and confirm it fails with `chapter-1/…: source section not found in chapter1.md`. Then revert the change.

Run: `export ASTRO_PREVIEW_BACKGROUND=1 && npm test`. Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add scripts package.json
git commit -m "feat: generalize lesson checker per chapter and skip fenced headings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Lesson tasks (Tasks 2–11): shared procedure

Every lesson task follows these steps. Each task lists only its specifics.

**The outline is the content brief.** For lesson 2.N, read these parts of `docs/superpowers/specs/chapter2-outline-draft.md`:
- §2 "2.N" in full (key concepts, figures, code, quiz candidates, fidelity hazards);
- the 2.N row of §1;
- the relevant rows of §3 (overlap with Chapter 1).

Then read the lesson's source line range in `source/book-en/chapter2.md`, all of it. **The task's overrides take precedence over the outline.** In particular, only the diagrams listed in the task get built; ignore every other "New diagrams" entry in the outline.

1. **Skeleton first (failing check).**
   - Create the lesson MDX with the exact frontmatter given, the imports, and `:::tip[TL;DR]` only.
   - Append the lesson path to `DIAGRAM_PAGES` in `tests/diagram-pages.ts`.
   - Run `npm run check:lessons`. Expected: FAIL for this file, listing missing `<Figure>`, `<KeyTakeaways>` and `## Check yourself`.
2. **Build the diagrams** listed in the task, following the Global Constraints diagram rules and the outline's layout notes.
3. **Write the lesson.**
   - Rewrite the source range in order. Don't paste long passages verbatim; short defining quotes are fine.
   - Book code blocks are copied verbatim with the fence language given. Any trimming is marked with a visible `# …` or `// …` comment.
   - Embed diagrams as `<Figure caption="…" credit="…">`, adding `credit` only for redrawn book figures. Animated diagrams go inside `<StepAnimator label="…">…</StepAnimator>`, wrapping the `<Figure>`.
   - Write the quizzes as specified. Every answer must be supported by the lesson text.
4. **Self-check fidelity.** Reread the outline's "Fidelity hazards" for this lesson and confirm that each one is handled. Count the body prose words: exclude frontmatter, imports, code fences, tables, the `<Quiz>` blocks and captions. The count must be 1,200–2,200.
5. **Run all checks.** `export ASTRO_PREVIEW_BACKGROUND=1 && npm test`. Expected: the checker passes for this lesson, the build has no link errors, and every Playwright test passes, including the new page's diagram audits.
6. **Visual review.** Open every new `diagram-shots/<lesson-slug>-*.png` with the Read tool: light and dark themes, desktop and mobile. Check:
   - labels are legible and not clipped;
   - arrows start and end at the right boxes;
   - colors match their concepts;
   - dark mode is readable;
   - animated diagrams make sense as a static image.

   For animated diagrams, confirm that each step's `data-step-label` matches what gets highlighted. Fix any problem and repeat step 5.
7. **Commit.** `git add -A && git commit -m "feat: add lesson 2.N — <title>"` with the Co-Authored-By line.

Standard imports (drop any that aren't used):

```mdx
import Figure from '~/components/Figure.astro';
import StepAnimator from '~/components/StepAnimator.astro';
import KeyTakeaways from '~/components/KeyTakeaways.astro';
import Quiz from '~/components/Quiz.astro';
```

---

### Task 2: Lesson 2.1 — Context & the Four Message Roles (plus the Chapter 2 sidebar)

**Files:**
- Create: `src/content/docs/chapter-2/01-context-and-message-roles.mdx`, `src/components/diagrams/chapter-2/ContextWindowComposition.astro` (Fig 2-1, prefix `d2-cwc`), `src/components/diagrams/chapter-2/SingleTurnCall.astro` (Fig 2-2, prefix `d2-stc`)
- Modify: `astro.config.mjs`, `tests/diagram-pages.ts`

**Sidebar:** in `astro.config.mjs`, insert this group after Chapter 1's and before "About & credits":

```js
{ label: 'Chapter 2: Context Engineering', items: [{ autogenerate: { directory: 'chapter-2' } }] },
```

**Frontmatter:**

```yaml
---
title: Context & the Four Message Roles
description: Why context quality sets an agent's ceiling, the ReAct definition of context, and how system, user, assistant and tool messages plus the tools field carry it on a stateless API.
sidebar:
  order: 1
  label: 2.1 Context & Message Roles
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#context-what-determines-an-agents-capabilities
  sections:
    - 'Context: What Determines an Agent’s Capabilities'
    - 'How Agents Call LLMs: The API-Level Context Structure'
    - 'The Four Message Roles'
    - 'Single-Turn Request: The Simplest API Call'
---
```

**Source:** lines 1–94 (the chapter intro, lines 1–6, belongs to this lesson).

**Diagrams:** Fig 2-1 and Fig 2-2, both static. **Don't build** `RolesToComponents`. Instead, show the roles → Chapter 1 components mapping as a Markdown table with the columns *Role / field*, *What it carries*, *Chapter 1 component*.

**Overrides:** render line 33's formula in Unicode inside a blockquote: π(aₜ | cₜ), cₜ = (o₁, a₁, …, oₜ). Link to 1.4 for the five components (`/learn-ai-agents/chapter-1/04-context-working-set/`).

**Quizzes (3):** the outline's three 2.1 quiz candidates.

---

### Task 3: Lesson 2.2 — Tool Calls: The Agent's Core Loop

**Files:**
- Create: `src/content/docs/chapter-2/02-tool-calls-core-loop.mdx`
- Create these diagrams in `src/components/diagrams/chapter-2/`:
  - `TwoCallSequence.astro` (Fig 2-3, **animated**, prefix `d2-tcs`)
  - `ContextPerCall.astro` (Fig 2-4, prefix `d2-cpc`)
  - `LocalToolCalling.astro` (Fig 2-5, prefix `d2-ltc`)
  - `MessagesGrowth.astro` (new, prefix `d2-mg`)
- Modify: `tests/diagram-pages.ts`

**Frontmatter:**

```yaml
---
title: "Tool Calls: The Agent's Core Loop"
description: The two-call Vancouver example on the wire, the book's OpenAI-SDK loop, how the messages list grows, and the static prefix plus trajectory layout.
sidebar:
  order: 2
  label: 2.2 Tool Calls & the Core Loop
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#multi-turn-interaction-with-tool-calls-the-core-loop-of-an-agent
  sections:
    - 'Multi-Turn Interaction with Tool Calls: The Core Loop of an Agent'
    - "Implementing the Agent's Core Loop in Code"
    - 'How Context Is Composed at the API Level'
---
```

(The second entry contains an apostrophe, so it takes double quotes.)

**Source:** lines 95–437.

**Diagrams:**
- Fig 2-3 goes in a StepAnimator, one step per message arrow.
- Fig 2-4.
- Fig 2-5 (inside or directly after the Experiment 2-1 aside).
- `MessagesGrowth`: three columns built from the snapshots at lines 340–368, with rows tagged "+ model" or "+ framework". Use it in place of repeating the snapshots as code.
- **Don't build** `ContextAssemblyPipeline`. Keep the lines 384–399 pseudocode as a code block titled `title="build context (book pseudocode)"`.

**Code:**
- The first request JSON is shown in full (`jsonc`). The later exchanges are condensed.
- The Python loop at lines 257–333 is copied verbatim (`python`).
- An Engineer's note covers:
  - the missing iteration cap, linking to 1.5 `/learn-ai-agents/chapter-1/05-react-loop/` and 1.7 `/learn-ai-agents/chapter-1/07-orchestration-patterns/`;
  - the fact that `OpenAI()` with `Qwen3-0.6B` needs an OpenAI-compatible local endpoint.

**Quizzes (3):** the outline's three 2.2 quiz candidates.

---

### Task 4: Lesson 2.3 — Attention, KV Cache Intuition & Chat Templates

**Files:**
- Create: `src/content/docs/chapter-2/03-attention-kv-cache-chat-template.mdx`
- Create these diagrams in `src/components/diagrams/chapter-2/`:
  - `TimestampIncident.astro` (new, prefix `d2-ti`)
  - `AttentionIntuition.astro` (Fig 2-6, prefix `d2-ai`)
  - `AttentionHeatmapSchematic.astro` (Fig 2-7, prefix `d2-ahs`)
  - `ChatTemplateTokens.astro` (Fig 2-8, prefix `d2-ctt`)
  - `MessagesToTokens.astro` (Fig 2-9, prefix `d2-mtt`)
- Modify: `tests/diagram-pages.ts`

**Frontmatter:**

```yaml
---
title: Attention, KV Cache Intuition & Chat Templates
description: The {{now}} incident, three cache-friendly rules, how attention works and what heatmaps show, and how a chat template turns messages into tokens.
sidebar:
  order: 3
  label: 2.3 Attention & Chat Templates
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#kv-cache-friendly-context-design
  sections:
    - 'KV Cache-Friendly Context Design'
    - 'From API Messages to Model Tokens: Chat Template'
---
```

**Source:** lines 438–531.

**Diagram overrides:**
- **Fig 2-6:** print the real row as text: 天气 0.55, 北京 0.35, 的 0.05, 怎么样 ≈0.05. Shade the other rows lightly, with a visible label reading "other rows illustrative". Caption: "…(illustrative weights except the 怎么样 row)".
- **Fig 2-7:** a schematic lower-triangular grid (around 12×12 cells is enough) with axis bands system/tools | user | `<think>` | answer. Four text callouts: attention sink, reasoning triangle, output triangle, position bias. Caption must include "schematic, not measured values". Credit: "Redrawn from Figure 2-7, AI Agent Book by Bojie Li (Apache 2.0)." Its `<desc>` lists the four patterns.
- The CJK text in diagrams uses the site font stack. Check in the screenshots that it renders without tofu.

**Content overrides:** add two Engineer's notes, following the outline's hazards.
- **(a) Reasoning pass-back vs lesson 1.4's quiz.** 1.4's point is an ablation result. The pass-back protocol is model-family specific.
- **(b) Dynamic info at the end vs 1.4's "system prompt carries … dynamically injected environmental state".** Give a one-line reconciliation and link forward to 2.8 (`/learn-ai-agents/chapter-2/08-agent-status-bar/`). That page doesn't exist until Task 9, so until then write the forward reference as **plain text**. Task 9 turns it into a link.
- Table 2-1 becomes a Markdown table.

**Quizzes (4):** Thought Question 2 plus the outline's other three 2.3 candidates.

---

### Task 5: Lesson 2.4 — KV Cache, Prompt Cache & Caching as Architecture

**Files:**
- Create: `src/content/docs/chapter-2/04-kv-cache-and-prompt-cache.mdx`
- Create these diagrams in `src/components/diagrams/chapter-2/`:
  - `PrefixChangePropagation.astro` (new, **animated**, prefix `d2-pcp`)
  - `PromptCacheReuse.astro` (Fig 2-10, **animated**, prefix `d2-pcr`)
- Modify: `tests/diagram-pages.ts`

**Frontmatter:**

```yaml
---
title: KV Cache, Prompt Cache & Caching as Architecture
description: Why a prefix change invalidates everything after it, the cache-hostile patterns, KV Cache vs Prompt Cache, and how caching shapes harness design.
sidebar:
  order: 4
  label: 2.4 KV & Prompt Cache
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#principles-and-constraints-of-kv-cache
  sections:
    - 'Principles and Constraints of KV Cache'
    - 'KV Cache and Prompt Cache: Two Levels of Caching'
    - 'Caching as an Architectural Constraint'
    - 'Rethinking KV Cache: Editable, Composable "Notes"'
    - 'Looking Ahead: From Cache Mechanics to Designing Context Content'
---
```

**Source:** lines 532–607. This is the longest range, so summarize tightly to stay within 2,200 words of prose.

**Diagrams:**
- `PrefixChangePropagation`: a layers × tokens grid. Each step invalidates column k and everything after it, one layer at a time.
- Fig 2-10: request 1 → request 2 → request 3.
- **Don't build** `KVCacheDecodeSteps` or `CacheBoundaryVariants`. Explain decode in prose, and show the cache-boundary variants as a short do/don't table.

**Content overrides:**
- Add an Engineer's note that separates 1.5's stretch quiz (cumulative cache-read charges *with* caching) from line 540's N² recompute *without* caching. Link to `/learn-ai-agents/chapter-1/05-react-loop/`.
- Link to 1.8's append-only pattern (`/learn-ai-agents/chapter-1/08-guardrails-and-big-picture/`).
- Put "Rethinking KV Cache" (lines 586–598) inside the `<details>` research aside described in the Global Constraints. It needs no heading of its own. The checker reads coverage from frontmatter only.

**Quizzes (4):** the outline's four 2.4 candidates.

---

### Task 6: Lesson 2.5 — System Prompts: Tone, Structure, Rules & Examples

**Files:**
- Create: `src/content/docs/chapter-2/05-system-prompts.mdx`, `src/components/diagrams/chapter-2/RulesVsSOP.astro` (new, static, prefix `d2-rvs`)
- Modify: `tests/diagram-pages.ts`

**Frontmatter:**

```yaml
---
title: "System Prompts: Tone, Structure, Rules & Examples"
description: The new-team-member test, emphasis and tone, XML plus Markdown structure, SOPs over rule piles, executable business rules, and when to use few-shot examples.
sidebar:
  order: 5
  label: 2.5 System Prompts
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#prompt-engineering-optimizing-the-system-prompt
  sections:
    - 'Prompt Engineering: Optimizing the System Prompt'
    - 'Tone and Style: Behavioral Framing'
    - 'Structured Prompts: The "Format" of the System Prompt'
    - 'Process-Driven vs. Rule Stacking: The "Organization" of the System Prompt'
    - 'Translating Business Rules into Executable Instructions'
    - 'Few-Shot Examples: When to Show the Model Examples'
---
```

**Source:** lines 608–705.

**Diagrams:** `RulesVsSOP` only. **Don't build** `BillingDecisionRules`. Present the billing rules as a Markdown table (task type → fee model), with the thresholds labelled "example values".

**Code:** copy the system prompt at lines 628–642 and the SOP at lines 655–674 verbatim as `text` fences, along with the quoted NEVER rule at line 690.

**Content overrides:**
- Add a one-sentence forward pointer to Experiment 2-4 in 2.6 (plain text until Task 7 exists; Task 7 turns it into a link). Don't give its numbers here.
- Add an Engineer's note reconciling this lesson's few-shot guidance with 1.7's "internalized by instruction tuning" (`/learn-ai-agents/chapter-1/07-orchestration-patterns/`).

**Quizzes (3):** Thought Question 5 plus the outline's other two 2.5 candidates.

---

### Task 7: Lesson 2.6 — Tool Definitions & Prompt Injection

**Files:**
- Create: `src/content/docs/chapter-2/06-tool-definitions-and-prompt-injection.mdx`, `src/components/diagrams/chapter-2/InstructionDataBoundary.astro` (new, static, prefix `d2-idb`)
- Modify: `tests/diagram-pages.ts`, `src/content/docs/chapter-2/05-system-prompts.mdx` (turn the Experiment 2-4 forward pointer into a link to `/learn-ai-agents/chapter-2/06-tool-definitions-and-prompt-injection/`)

**Frontmatter:**

```yaml
---
title: Tool Definitions & Prompt Injection
description: Tool descriptions as operating manuals, deferred tool loading that stays cache-friendly, the prompt-engineering ablation, and separating instructions from data.
sidebar:
  order: 6
  label: 2.6 Tools & Prompt Injection
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#tool-definition-design
  sections:
    - 'Tool Definition Design'
    - 'Prompt Injection: The Core Threat to Context Security'
---
```

**Source:** lines 706–771.

**Diagrams:** `InstructionDataBoundary` only. **Don't build** `DeferredToolLoading`. Explain deferred loading in prose, plus a three-row table (turn / what's appended / cache effect).

**Content overrides:**
- Experiment 2-4 is presented here, once, with its exact numbers.
- Experiment 2-5 is a design, not results: don't invent success rates.
- Link to 1.8 for the other guardrail layers (`/learn-ai-agents/chapter-1/08-guardrails-and-big-picture/`).
- The Skill and status-bar injection surfaces get one line each; forward references to 2.7 and 2.8 stay plain text.

**Quizzes (4):** Thought Question 9 plus the outline's other three 2.6 candidates.

---

### Task 8: Lesson 2.7 — Dynamic Prompts & Agent Skills

**Files:**
- Create: `src/content/docs/chapter-2/07-dynamic-prompts-and-skills.mdx`
- Create these diagrams in `src/components/diagrams/chapter-2/`:
  - `SkillsDisclosure.astro` (Fig 2-11, prefix `d2-sd`)
  - `SkillsTrajectory.astro` (Fig 2-12, tall, prefix `d2-st`)
  - `KVCacheGrowth.astro` (Fig 2-13, **animated**, prefix `d2-kcg`)
- Modify: `tests/diagram-pages.ts`, `src/content/docs/chapter-2/06-tool-definitions-and-prompt-injection.mdx` (turn the 2.7 forward reference into a link)

**Frontmatter:**

```yaml
---
title: Dynamic Prompts & Agent Skills
description: Progressive disclosure in three layers, descriptions as routing conditions, the two trigger paths, writing a usable Skill, and how Skills sit in the trajectory and the cache.
sidebar:
  order: 7
  label: 2.7 Dynamic Prompts & Skills
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#dynamic-prompts-and-agent-skills
  sections:
    - 'Dynamic Prompts and Agent Skills'
    - 'Skills: Composable Units of Domain Capability'
    - 'How to Write a Usable Skill'
    - 'Skills in Context'
    - 'Relationship Between Skills and Tools'
---
```

**Source:** lines 772–863.

**Diagrams:**
- Fig 2-12 is tall. Keep the viewBox width ≤ 720 and stack it vertically so it reads at 360px.
- Fig 2-13 steps through the trajectory growth.
- **Don't build** `SkillTriggerPaths`. Show the two trigger paths as a two-row table (trigger / what enters the trajectory / extra round?).

**Content overrides:**
- **Thought Question 8's answer must follow the body, not the reference answer.** Content appended to the trajectory is cached once and reused (lines 718–720, 835). It's recomputed only if it's re-injected every turn. Claude Code injects the Skill body as a user message (line 794). Include model support (lines 722, 817).
- Link to 1.3 (`/learn-ai-agents/chapter-1/03-llm-reasoning-engine/`) and 1.8 (progressive disclosure).

**Quizzes (3):** Thought Questions 7 and 8, plus the outline's `/pptx` candidate.

---

### Task 9: Lesson 2.8 — The Agent Status Bar

**Files:**
- Create: `src/content/docs/chapter-2/08-agent-status-bar.mdx`
- Create these diagrams in `src/components/diagrams/chapter-2/`:
  - `StatusBarArchitecture.astro` (Fig 2-14, prefix `d2-sba`)
  - `StatusBarPosition.astro` (Fig 2-15, prefix `d2-sbp`)
  - `StatusReplaceVsAppend.astro` (new, **animated**, prefix `d2-rva`)
- Modify: `tests/diagram-pages.ts`
- Modify: in `03-attention-kv-cache-chat-template.mdx` and `06-tool-definitions-and-prompt-injection.mdx`, turn the plain-text 2.8 references into links to `/learn-ai-agents/chapter-2/08-agent-status-bar/`.

**Frontmatter:**

```yaml
---
title: The Agent Status Bar
description: Distilling implicit state into explicit facts at the tail of the context — what goes in the bar, why it uses the user role, and replace vs append with its break-even cost.
sidebar:
  order: 8
  label: 2.8 The Agent Status Bar
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#agent-status-bar-keeping-the-model-aware-of-task-progress
  sections:
    - 'Agent Status Bar: Keeping the Model Aware of Task Progress'
    - 'Theoretical Basis of the Agent Status Bar'
    - 'Composition of the Agent Status Bar'
    - 'Specific Position of the Agent Status Bar in the Context'
    - 'Two Implementations of Status Updates and Their Cache Costs'
---
```

**Source:** lines 864–998. This is a long range, so summarize tightly.

**Diagrams:** Fig 2-14, Fig 2-15, and `StatusReplaceVsAppend` (three updates in two lanes, with the footer `prefer append when α·S·N/2 < (1−α)·R`). **Don't build** `DistillImplicitState`.

**Code:**
- The `<agent_status>` block at lines 900–906 (`xml`).
- The message list at lines 935–952 (`text`).
- The cost model as a `text` block: `C_replace ≈ (N−1)(1−α)R` and `C_append ≈ αS·N(N−1)/2`.

**Content overrides:** add an Engineer's note resolving 1.4's "system prompt carries dynamically injected environmental state" (`/learn-ai-agents/chapter-1/04-context-working-set/`): dynamic state belongs at the tail.

**Quizzes (4):** Thought Question 4 plus the outline's other three 2.8 candidates. The worked numeric quiz must show its arithmetic.

---

### Task 10: Lesson 2.9 — Why and How to Compress Context

**Files:**
- Create: `src/content/docs/chapter-2/09-context-compression.mdx`
- Create these diagrams in `src/components/diagrams/chapter-2/`:
  - `LookupVsAggregation.astro` (new, prefix `d2-lva`)
  - `CompressionComparison.astro` (Fig 2-16, prefix `d2-cc`)
  - `CompressionFlows.astro` (Fig 2-17, prefix `d2-cf`)
- Modify: `tests/diagram-pages.ts`

**Frontmatter:**

```yaml
---
title: Why and How to Compress Context
description: Three reasons to compress, lookup vs aggregation, context rot, compressing between calls without losing the prefix cache, and six strategies compared.
sidebar:
  order: 9
  label: 2.9 Context Compression
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#context-compression-strategies
  sections:
    - 'Context Compression Strategies'
    - 'Why Compression Is Needed: Not Just a Length Issue'
    - 'The Internal Mechanism of In-Context Learning: Retrieval, Not Reasoning'
    - 'Compression and KV Cache: Apparent Contradiction, Practical Complementarity'
---
```

**Source:** lines 999–1074.

**Diagrams:**
- `LookupVsAggregation`: 100 cells at a readable size may not fit, so draw a strip of representative cells with an ellipsis and label it "100 cages: 90 black, 10 white".
- Fig 2-16 uses the exact numbers from lines 1054–1068.
- Fig 2-17.
- **Don't build** `CompressionTimingCache`. Explain the between-calls timing in prose.

**Content overrides:**
- **Use 150K only.** The outline's "≈150K (≈148K)" suggestion is overridden.
- State the compression-ratio definition (compressed / original) before quoting any percentages.
- Link to 2.8 for the retrieval-not-reasoning point, to 2.4 for preserved thinking, and to 1.3 and 1.5.

**Quizzes (4):** Thought Question 3 (phrased with ≈150K → ≈2K characters) and Thought Question 6, plus the outline's other two 2.9 candidates.

---

### Task 11: Lesson 2.10 — Compression in Production, Sub-Agent Isolation & the Big Picture

**Files:**
- Create: `src/content/docs/chapter-2/10-compression-in-production-and-isolation.mdx`, `src/components/diagrams/chapter-2/ContextEngineeringMap.astro` (new, prefix `d2-cem`)
- Modify: `tests/diagram-pages.ts`

**Frontmatter:**

```yaml
---
title: Compression in Production, Sub-Agent Isolation & the Big Picture
description: The five-layer production compression stack, four design principles, isolating exploration in sub-agents instead of compressing it, and a map of the whole chapter.
sidebar:
  order: 10
  label: 2.10 Isolation & Big Picture
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#production-grade-hierarchical-compression-mechanism
  sections:
    - 'Production-Grade Hierarchical Compression Mechanism'
    - 'Design Principles for Compression Strategies'
    - 'Isolation Over Compression: Sub-Agent Context Isolation'
    - 'Chapter Summary'
    - 'Thought Questions'
---
```

**Source:** lines 1075–1122.

**Diagrams:**
- `ContextEngineeringMap`: the full request layout, with each region labelled by technique and lesson number (2.1–2.10).
- **Don't build** `IsolationVsCompression`. Show the payment-callback example as a two-row table (approach / what enters the main context / cost).
- Show the five compression layers as a table.

**Content overrides:**
- Add a "Chapter 2 cheat sheet" section, the same pattern as 1.8's.
- The Thought Questions are **not** listed again. Add one sentence noting that they appear as quizzes throughout the chapter.
- State that isolated sub-agents don't inherit the parent context, so 2.4's byte-alignment rule doesn't apply to them.

**Quizzes (3):** Thought Question 1 plus the outline's other two 2.10 candidates.

---

### Task 12: Chapter overview, home page, Chapter 1 forward links, tests, and full verification

**Files:**
- Create: `src/content/docs/chapter-2/index.mdx`
- Modify:
  - `src/content/docs/index.mdx`
  - `src/content/docs/chapter-1/04-context-working-set.mdx`
  - `src/content/docs/chapter-1/05-react-loop.mdx`
  - `src/content/docs/chapter-1/06-harness-engineering.mdx`
  - `src/content/docs/chapter-1/08-guardrails-and-big-picture.mdx`
  - `tests/smoke.spec.ts`
  - `tests/components.spec.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/smoke.spec.ts`:

```ts
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
```

In `tests/components.spec.ts`, extend the no-attribution test by adding these two lines after the Chapter 1 check:

```ts
	await page.goto('chapter-2/01-context-and-message-roles/');
	await expect(page.getByText('Read the original section')).toHaveCount(0);
```

If the sidebar `nav` label differs in this Starlight version, find the real one in the built HTML (`grep -o 'aria-label="[^"]*"' dist/chapter-2/01-context-and-message-roles/index.html`) and use it.

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx astro build && npx playwright test tests/smoke.spec.ts`
Expected: the chapter 2 overview and home-page tests FAIL (404 / not found).

- [ ] **Step 3: Write `src/content/docs/chapter-2/index.mdx`**

```mdx
---
title: "Chapter 2: Context Engineering"
description: How an agent's context is structured, cached, written and compressed — from API message roles to status bars and sub-agent isolation.
sidebar:
  order: 0
  label: Overview
source:
  url: https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md
  sections: []
---
import { LinkCard, CardGrid } from '@astrojs/starlight/components';

<one paragraph, 2–4 sentences, restating chapter2.md lines 1–3 and the chapter summary at line 1108: context engineering as the harness's central job, and the chapter's path from message structure to caching, prompts, Skills, the status bar, and compression>

## Lessons

Each lesson takes about 5–15 minutes and ends with a short self-check.

<CardGrid>
	<LinkCard title="2.1 Context & the Four Message Roles" description="Why context sets the ceiling, and how four roles plus tools carry it." href="/learn-ai-agents/chapter-2/01-context-and-message-roles/" />
	<LinkCard title="2.2 Tool Calls: The Agent's Core Loop" description="The two-call example on the wire and the book's SDK loop." href="/learn-ai-agents/chapter-2/02-tool-calls-core-loop/" />
	<LinkCard title="2.3 Attention, KV Cache Intuition & Chat Templates" description="The {{now}} incident, attention basics, and how messages become tokens." href="/learn-ai-agents/chapter-2/03-attention-kv-cache-chat-template/" />
	<LinkCard title="2.4 KV Cache, Prompt Cache & Caching as Architecture" description="Why prefixes must stay stable, and how caching shapes the harness." href="/learn-ai-agents/chapter-2/04-kv-cache-and-prompt-cache/" />
	<LinkCard title="2.5 System Prompts" description="Tone, structure, SOPs over rule piles, executable rules, and few-shot." href="/learn-ai-agents/chapter-2/05-system-prompts/" />
	<LinkCard title="2.6 Tool Definitions & Prompt Injection" description="Tool descriptions as manuals, deferred loading, and instruction/data separation." href="/learn-ai-agents/chapter-2/06-tool-definitions-and-prompt-injection/" />
	<LinkCard title="2.7 Dynamic Prompts & Agent Skills" description="Progressive disclosure, trigger paths, and Skills in the cache." href="/learn-ai-agents/chapter-2/07-dynamic-prompts-and-skills/" />
	<LinkCard title="2.8 The Agent Status Bar" description="Explicit state at the tail of the context, and replace vs append." href="/learn-ai-agents/chapter-2/08-agent-status-bar/" />
	<LinkCard title="2.9 Why and How to Compress Context" description="Lookup vs aggregation, context rot, and six strategies compared." href="/learn-ai-agents/chapter-2/09-context-compression/" />
	<LinkCard title="2.10 Compression in Production & Sub-Agent Isolation" description="The five-layer stack, isolation over compression, and the chapter map." href="/learn-ai-agents/chapter-2/10-compression-in-production-and-isolation/" />
</CardGrid>
```

Write the intro paragraph from the source; it's the only prose on this page. The LinkCard `title`s may differ from the lesson titles in punctuation. Keep them as given.

The checker only reads files matching `\d{2}-*.mdx`, so it ignores `index.mdx`. The Chapter 1 index has the same `source` shape, so the content schema accepts it.

- [ ] **Step 4: Home page**

In `src/content/docs/index.mdx`:
- Add a second hero action directly after "Start Chapter 1":
  ```yaml
      - text: Chapter 2 — Context Engineering
        link: /learn-ai-agents/chapter-2/
        icon: right-arrow
        variant: secondary
  ```
- In the "Short lessons" card, replace the text with: `Chapter 1 in eight and Chapter 2 in ten short lessons of about 5–15 minutes, each ending with a self-check quiz.`

Change nothing else.

- [ ] **Step 5: Chapter 1 forward links**

Each change turns an existing phrase into a link. Change no other words.

| File | Current phrase | Link target |
|---|---|---|
| `04-context-working-set.mdx` line 25 | "detailed in Chapter 2 of the book" | `/learn-ai-agents/chapter-2/01-context-and-message-roles/` |
| `05-react-loop.mdx` line 255 (quiz question attribute) | leave as it is (quiz `question` is a string prop) | none |
| `06-harness-engineering.mdx` line 96 | "the complete API message loop in Chapter 2" | `/learn-ai-agents/chapter-2/02-tool-calls-core-loop/` |
| `08-guardrails-and-big-picture.mdx` line 53 | "covered in Chapter 2 of the book" | `/learn-ai-agents/chapter-2/06-tool-definitions-and-prompt-injection/` |
| `08-guardrails-and-big-picture.mdx` line 155 | "Agent Skills in Chapter 2" | `/learn-ai-agents/chapter-2/07-dynamic-prompts-and-skills/` |
| `08-guardrails-and-big-picture.mdx` line 156 | "Chapter 2 shows" (link the words "Chapter 2") | `/learn-ai-agents/chapter-2/04-kv-cache-and-prompt-cache/` |
| `08-guardrails-and-big-picture.mdx` line 172 | "Chapter 2 of the book" | `/learn-ai-agents/chapter-2/` |

Line numbers are approximate. Match on the phrase.

- [ ] **Step 6: Sweep for leftover plain-text forward references**

Run: `grep -n "lesson 2\.[0-9]\|in 2\.[0-9]" src/content/docs/chapter-2/*.mdx`
Every intra-chapter lesson reference must now be a link. Fix any that aren't.

- [ ] **Step 7: Full verification on macOS**

Run: `export ASTRO_PREVIEW_BACKGROUND=1 && npm test`
Expected:
- the build succeeds with no link-validator errors;
- `node --test` passes 4/4;
- the checker reports `✓ 18 lesson(s) pass structure checks`;
- every Playwright test passes.

- [ ] **Step 8: Linux parity check**

```bash
colima start 2>/dev/null || true
rm -rf /tmp/ch2-linux && rsync -a --exclude node_modules --exclude dist --exclude .astro ./ /tmp/ch2-linux/
docker run --rm -v /tmp/ch2-linux:/work -w /work -e CI=1 mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -lc "npm ci && npx astro build && node --test 'scripts/*.test.mjs' && npm run check:lessons && npx playwright test"
```

Expected: all green. The run uses a copy of the repo, so the host `node_modules` is untouched. If any diagram audit fails on Linux only, widen the offending box (never shrink the font), then rerun on both platforms.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Chapter 2 overview, home card, cross-links, and tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Stop here. **Don't push or merge.** The controller asks the owner to approve the merge, which triggers the deploy.
