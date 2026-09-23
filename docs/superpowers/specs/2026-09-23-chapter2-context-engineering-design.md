# AI Agent Book Tutorial Site — Chapter 2 (Context Engineering) Design

**Date:** 2026-09-23
**Status:** Approved in chat (sections 1–4), awaiting spec review
**Base:** extends `2026-09-22-chapter1-tutorial-site-design.md`. Everything there still applies unless this spec overrides it.
**Source:** `source/book-en/chapter2.md` (1,122 lines, identical to upstream `bojieli/ai-agent-book/main/book-en/chapter2.md`). Reference answers: `source/book-en/reference-answers.md`, lines 53–89.
**Detailed outline:** `docs/superpowers/specs/chapter2-outline-draft.md` is the per-lesson working detail: source line ranges, figure descriptions, code excerpts, hazards and quiz drafts. Where the outline and this spec disagree, **this spec wins**. The outline's diagram list is superseded by §3 below.

## Goal

Add Chapter 2, "Context Engineering", to the live site (https://n0k0259.github.io/learn-ai-agents/) as 10 lessons. They use the same format, quality bar and diagram style as Chapter 1.

## Licensing & Attribution (overrides the Chapter 1 spec)

- Credits live **only** on the About & credits page (`src/content/docs/about.mdx`). Lessons carry **no** per-page attribution footer and no "Read the original section" link.
- Lessons include **no** reader-credit or GitHub-issue thank-you notes. Chapter 2 has none in the source anyway.
- `about.mdx` stays as it is. Its wording is already chapter-neutral.

## 1. Lesson Breakdown (Chapter 2 → 10 lessons)

The boundaries follow source order, and each lesson starts at a source heading. Four shifts from the original 10-topic split balance the lengths:
- "How Context Is Composed" moves to 2.2.
- "Chat Template" moves to 2.3.
- "Few-Shot" moves to 2.5.
- The compression section splits across 2.9 and 2.10.

| # | Title | Slug | Source lines | Source headings claimed (`##`–`####`, outside code fences) |
|---|---|---|---|---|
| 2.1 | Context & the Four Message Roles | `01-context-and-message-roles` | 1–94 | Context: What Determines an Agent’s Capabilities · How Agents Call LLMs: The API-Level Context Structure · The Four Message Roles · Single-Turn Request: The Simplest API Call |
| 2.2 | Tool Calls: The Agent's Core Loop | `02-tool-calls-core-loop` | 95–437 | Multi-Turn Interaction with Tool Calls: The Core Loop of an Agent · Implementing the Agent's Core Loop in Code · How Context Is Composed at the API Level |
| 2.3 | Attention, KV Cache Intuition & Chat Templates | `03-attention-kv-cache-chat-template` | 438–531 | KV Cache-Friendly Context Design · From API Messages to Model Tokens: Chat Template |
| 2.4 | KV Cache, Prompt Cache & Caching as Architecture | `04-kv-cache-and-prompt-cache` | 532–607 | Principles and Constraints of KV Cache · KV Cache and Prompt Cache: Two Levels of Caching · Caching as an Architectural Constraint · Rethinking KV Cache: Editable, Composable "Notes" · Looking Ahead: From Cache Mechanics to Designing Context Content |
| 2.5 | System Prompts: Tone, Structure, Rules & Examples | `05-system-prompts` | 608–705 | Prompt Engineering: Optimizing the System Prompt · Tone and Style: Behavioral Framing · Structured Prompts: The "Format" of the System Prompt · Process-Driven vs. Rule Stacking: The "Organization" of the System Prompt · Translating Business Rules into Executable Instructions · Few-Shot Examples: When to Show the Model Examples |
| 2.6 | Tool Definitions & Prompt Injection | `06-tool-definitions-and-prompt-injection` | 706–771 | Tool Definition Design · Prompt Injection: The Core Threat to Context Security |
| 2.7 | Dynamic Prompts & Agent Skills | `07-dynamic-prompts-and-skills` | 772–863 | Dynamic Prompts and Agent Skills · Skills: Composable Units of Domain Capability · How to Write a Usable Skill · Skills in Context · Relationship Between Skills and Tools |
| 2.8 | The Agent Status Bar | `08-agent-status-bar` | 864–998 | Agent Status Bar: Keeping the Model Aware of Task Progress · Theoretical Basis of the Agent Status Bar · Composition of the Agent Status Bar · Specific Position of the Agent Status Bar in the Context · Two Implementations of Status Updates and Their Cache Costs |
| 2.9 | Why and How to Compress Context | `09-context-compression` | 999–1074 | Context Compression Strategies · Why Compression Is Needed: Not Just a Length Issue · The Internal Mechanism of In-Context Learning: Retrieval, Not Reasoning · Compression and KV Cache: Apparent Contradiction, Practical Complementarity |
| 2.10 | Compression in Production, Sub-Agent Isolation & the Big Picture | `10-compression-in-production-and-isolation` | 1075–1122 | Production-Grade Hierarchical Compression Mechanism · Design Principles for Compression Strategies · Isolation Over Compression: Sub-Agent Context Isolation · Chapter Summary · Thought Questions |

The table claims all 41 real headings, each exactly once. Heading strings in `source.sections` must be copied **exactly** from `chapter2.md`, including the curly `’` on line 7, and single-quoted in YAML. The fenced pseudo-headings at lines 629, 631 and 637 are not headings.

Sidebar labels use the form `2.N <short title>`, matching `1.N …` in Chapter 1. `sidebar.order` is N. `source.url` is `https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter2.md#<anchor of the lesson's first heading>`. The outline §1 lists each anchor.

## 2. Lesson Template

It's the same as Chapter 1, minus the attribution footer. The order is:

1. **Frontmatter:** `title`, `description`, `sidebar.order`, `sidebar.label`, `source.url`, `source.sections`.
2. A **`:::tip[TL;DR]`** block before the first `##`, 2–3 lines on what the reader will learn.
3. **Content** in source order. Figures go at the positions the book uses. Book code goes in code blocks, and any trimming is marked with visible `# …` comments. The 2.2 loop is the book's real OpenAI SDK code. The book's experiments go in an `<Aside>`, each covering what was tested, the result, and the takeaway. Tables use Markdown.
4. **Engineer's Note** asides where they help (see the reconciliations in §4).
5. **`<KeyTakeaways>`**: 3–5 bullets.
6. An optional **`### References`**, placed after KeyTakeaways and before Check yourself. It holds the source's external links only.
7. **`## Check yourself`**: 3–4 `<Quiz>` items with explanations.

**Length:** each lesson has 1,200–2,200 words of body prose. Code, tables, quizzes and figure captions don't count. The longer source ranges (2.4, 2.8) get tighter summaries rather than new splits.

## 3. Diagrams (25 in total, 5 animated)

All diagrams live in `src/components/diagrams/chapter-2/`, one `.astro` inline-SVG file each. They use the Chapter 1 concept classes (`dg-model`, `dg-context`, `dg-tools`, `dg-harness`, `dg-env`, `dg-guard`, `dg-neutral`), the self-hosted Inter / JetBrains Mono fonts, `viewBox` width ≤720, `aria-labelledby` with `<title>` and `<desc>`, and the `Figure` and `StepAnimator` wrappers. Captions name the book figure they redraw ("Redrawn from Figure 2-N") or say "New diagram".

**The book's 17 figures, redrawn** (the outline §2 describes each one):

| Lesson | Figures |
|---|---|
| 2.1 | Fig 2-1 context window composition · Fig 2-2 single-turn request/response |
| 2.2 | Fig 2-3 two-call interaction sequence (**animated**) · Fig 2-4 context composition per call · Fig 2-5 local LLM tool-calling architecture |
| 2.3 | Fig 2-6 attention intuition · Fig 2-7 attention heatmap · Fig 2-8 chat template token structure · Fig 2-9 API messages → token stream |
| 2.4 | Fig 2-10 prompt cache prefix reuse (**animated**) |
| 2.7 | Fig 2-11 Skills progressive disclosure · Fig 2-12 trajectory with Skills (tall; stacked mobile layout) · Fig 2-13 KV cache growth as the trajectory grows (**animated**) |
| 2.8 | Fig 2-14 status bar architecture · Fig 2-15 status bar insertion position |
| 2.9 | Fig 2-16 compression strategy comparison · Fig 2-17 six-strategy processing flow |

Special cases:
- **Fig 2-7** is a PNG in the source, and we have no data for it. Draw a *schematic* lower-triangular grid with labelled bands (system/tools, user, `<think>`, answer) and four callouts: attention sink, reasoning triangle, output triangle, and position bias. The caption must include "schematic, not measured values". Add a text legend so the figure doesn't rely on color alone.
- **Fig 2-6** gives values for only the 怎么样 row (天气 0.55, 北京 0.35, 的 0.05, itself ≈0.05). Print those as text. Shade the other rows as illustrative and label them so. Invent no other numbers.
- **Fig 2-16** uses the numbers at source lines 1054–1068 exactly.

**8 new diagrams:**

| Lesson | Component | Kind | Content |
|---|---|---|---|
| 2.2 | `MessagesGrowth` | static | Three side-by-side `messages` snapshots (initial, after call 1, after call 2). Added rows are tagged "+ model" or "+ framework". Built from the snapshots at source lines 340–368. |
| 2.3 | `TimestampIncident` | static | Two token rows. One has a stable prefix and a long cached span. The other has `Current time: {{now}}` early, so everything after it is uncached. |
| 2.4 | `PrefixChangePropagation` | **animated** | A layers × tokens grid with token k changed. The steps light up column k and everything to its right, layer by layer. Earlier columns stay cached. |
| 2.5 | `RulesVsSOP` | static | Unordered rule cards with a "which applies?" marker, versus the book's step-by-step SOP chain. |
| 2.6 | `InstructionDataBoundary` | static | Trusted channels (`system`, `user`) versus untrusted inputs wrapped and labelled by source, with the boundary drawn between them. |
| 2.8 | `StatusReplaceVsAppend` | **animated** | Two trajectory lanes through three status updates. "Replace" invalidates the suffix. "Append" keeps the prefix cached but grows. |
| 2.9 | `LookupVsAggregation` | static | The book's 100-cage example: a lookup is one hop, an aggregation scans every cell. |
| 2.10 | `ContextEngineeringMap` | static | The chapter cheat sheet: the full request layout (system prompt · tools · trajectory · status bar at the tail), each region labelled with the lesson that covers it. |

The outline's other proposed diagrams are **out of scope**: RolesToComponents, ContextAssemblyPipeline, KVCacheDecodeSteps, BillingDecisionRules, DeferredToolLoading, SkillTriggerPaths, DistillImplicitState, CompressionTimingCache, IsolationVsCompression, and CacheBoundaryVariants. Tables, lists or code cover their content.

Every lesson has at least one `<Figure>`.

## 4. Content Rules

**Fidelity** (lessons from the Chapter 1 reviews):
- No claims, emphasis or strength of wording beyond what the book says. No invented numbers.
- No filler or meta sentences ("In this lesson we will…").
- Prose doesn't repeat an adjacent table or list.
- Cross-references point to the correct lesson. Links to Chapter 1 point to the lesson that actually teaches the point.
- Numbers are copied exactly from the book.

**Source inconsistencies:**
- 150K (line 1058) vs ≈148K (Thought Question 3, line 1116): use the body's 150K and don't mention the other figure.
- The Q8 reference answer says Skill content is recomputed or injected via the system prompt. This contradicts the body (lines 718–720, 794, 835: Skill content is appended to the trajectory, and the prefix stays cached). Follow the body. The Q8 quiz explanation must match the body.
- There is no math rendering. Write the formulas at lines 33 and 968 in Unicode or inline code.

**Overlap with Chapter 1:**
- Don't re-teach Chapter 1 material. Link to it instead:
  - 1.4 for the five context components and the static prefix/dynamic history split;
  - 1.5 for Thought/Action/Observation and the trajectory;
  - 1.2 for tool schemas;
  - 1.3 for contextual adaptation;
  - 1.8 for the other guardrail layers.
- Add **Engineer's Note reconciliations** where Chapter 2 refines Chapter 1:
  1. 2.3: historical reasoning. Some model families expect reasoning to be passed back. This refines 1.4's "reasoning can be dropped at little cost".
  2. 2.8: dynamic state goes at the **tail** of the context, as a status bar in a `user` message, for cache reasons. This refines 1.4's "system prompt carries … dynamically injected environmental state".
  3. 2.4: 1.5's quiz counts cache-read charges *with* caching, while line 540's N² is recompute *without* caching.
  4. 2.5: few-shot guidance vs 1.7's "internalized by instruction tuning". Present the book's Chapter 2 guidance on when to use examples, and note that it's consistent with 1.7.
- Prompt caching is fully explained once, in 2.3 (intuition and rules) and 2.4 (mechanics). Lessons 2.6–2.9 apply it in one or two sentences and link back.
- Experiment 2-4 (the prompt-engineering ablation) is presented once, in 2.6. Lesson 2.5 gives a one-line forward pointer.

**Chapter 1 forward references:** where a Chapter 1 page says something is covered in Chapter 2, make that phrase a link to the right Chapter 2 lesson. For example, 1.6's "the complete API message loop is in Chapter 2" links to 2.2, and 1.8's "source labelling … covered in Chapter 2" links to 2.6. Change no other Chapter 1 wording.

**Quizzes:** 35 in total (per lesson 3, 3, 4, 4, 3, 4, 3, 4, 4, 3). All 9 Thought Questions are used, each once: Q1 → 2.10, Q2 → 2.3, Q3 → 2.9, Q4 → 2.8, Q5 → 2.5, Q6 → 2.9, Q7 → 2.7, Q8 → 2.7, Q9 → 2.6. The rest test the lesson's main points. The outline §2 has drafts. Answers must be supported by the lesson text.

## 5. Site Structure & Tooling

```
src/content/docs/chapter-2/
├── index.mdx                 # Overview: intro paragraph + CardGrid of 10 LinkCards (like chapter-1/index.mdx)
└── 01-…10-*.mdx              # Lessons (slugs from §1)
src/components/diagrams/chapter-2/   # 25 diagram components
```

- **`astro.config.mjs`:** add the sidebar group `{ label: 'Chapter 2: Context Engineering', items: [{ autogenerate: { directory: 'chapter-2' } }] }` after Chapter 1 and before About & credits.
- **Home page (`src/content/docs/index.mdx`):** add a Chapter 2 card next to Chapter 1's (for example, "Chapter 2 in ten short lessons…"). Keep the "Start Chapter 1" hero action.
- **The last Chapter 1 lesson (1.8):** its "next" pagination should lead to Chapter 2. Starlight's automatic prev/next already follows sidebar order, so check it rather than hard-coding it.
- **`scripts/check-lessons.mjs`:** generalize it.
  - Add a `CHAPTERS` table with entries `{ dir, source, urlPrefix, expected }`. Chapter 1 is 8 lessons, Chapter 2 is 10.
  - Loop over the table. Messages name the chapter's source file.
  - Match lesson files with `/^\d{2}-.*\.mdx$/`.
  - Heading extraction skips lines inside code fences. A line matching `/^(>\s*)?```/` toggles the fence state, which covers fences inside blockquotes such as lines 900–906.
  - Move heading extraction into an exported function in `scripts/lib/source-headings.mjs`.
  - Test it with `scripts/source-headings.test.mjs`, which uses Node's built-in `node:test` so no new dependency is needed. The test uses a small fixture markdown file and shows that a fenced `## Heading` is ignored, including a fence inside a blockquote.
  - Add `node --test scripts/` to the `npm test` script, before `check:lessons`.
- **Tests:**
  - `tests/diagram-pages.ts`: add every Chapter 2 page that has diagrams, so the diagram audit covers them. The checks are unchanged: text ≥13.9px, overflow, containment, overlap, WCAG contrast, opacity, aria-labelledby, viewBox ≤720, all waiting for fonts to load.
  - `tests/smoke.spec.ts`: the Chapter 2 index has 10 lesson links, and the sidebar shows the Chapter 2 group.
  - `tests/components.spec.ts`: extend the no-attribution test to a Chapter 2 lesson.
  - Animated diagrams keep the StepAnimator behaviour tests: Play/Step/Reset, reduced motion, and button alignment.

## 6. Verification & Delivery

- `npm test` passes locally. That covers `check-lessons`, the build with the links validator, and all Playwright suites. Local agent runs set `ASTRO_PREVIEW_BACKGROUND=1`, which is never committed.
- The same suite passes on Linux in `mcr.microsoft.com/playwright:v1.63.0-noble` via colima before merging. The CI failure over Chapter 1 fonts showed that macOS-only runs aren't enough.
- Diagram screenshots are inspected for light and dark mode and for 360px mobile.
- Each lesson gets a fidelity review against its source line range before it's accepted.
- Work happens on the `feat/chapter-2` branch. Merging to `main`, which deploys the live site, happens **only after the owner approves**.

## Out of Scope

- Chapters 3–10.
- The deferred Chapter 1 polish: favicon/OG image, mobile layouts for ContextAblation and TrajectoryRounds, CI artifact upload, L1.6 quiz overlap.
- The diagrams listed as out of scope in §3.
- Math rendering (KaTeX/remark-math).
