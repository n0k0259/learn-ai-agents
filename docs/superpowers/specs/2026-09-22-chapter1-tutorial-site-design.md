# AI Agent Book Tutorial Site — Chapter 1 Design

**Date:** 2026-09-22
**Status:** Approved in brainstorming, pending spec review

## Goal

Publish an engineer-focused tutorial website that teaches Chapter 1 ("Getting Started with AI Agents") of Bojie Li's *AI Agent Book* (https://github.com/bojieli/ai-agent-book/blob/main/book-en/chapter1.md). The site is structured so later chapters can be added without restructuring.

## Audience

Software engineers. Writing is concise and precise: interfaces, data flow, trade-offs, failure modes. Uses code/pseudocode, comparison tables, and diagrams in place of narrative padding. All concepts and examples from the original chapter are preserved.

## Licensing & Attribution

Source is Apache License 2.0. Requirements we satisfy:
- Include a copy of the Apache 2.0 license (`LICENSE`) and a `NOTICE` crediting Bojie Li and linking the original repo.
- State that the content has been modified (adapted/rewritten into lessons).
- Every lesson footer: "Adapted from *AI Agent Book* by Bojie Li, licensed under Apache 2.0" with a link to the original chapter.
- Reused figures carry a caption credit.
- `about.mdx` page contains full credits and the modification statement.

## Tech Stack

- **Astro Starlight** — static docs/tutorial framework (sidebar, search, dark mode, prev/next navigation).
- **MDX** for lesson content.
- **Hand-crafted SVG diagrams** (no Mermaid) — see Visual Design below.
- **GitHub Pages** hosting, deployed by GitHub Actions on push to `main`.

## Visual Design (Diagrams)

All diagrams — the 7 original figures and every new diagram — are redrawn as custom SVGs in a single visual language. The originals are grayscale print figures with overflowing labels; they are not reused as-is.

**Concept color system** (same meaning in every lesson, defined once as CSS variables):

| Concept | Role |
|---|---|
| Model (LLM) | Reasoning core — primary accent color |
| Context | Information / working set |
| Tools | Action interfaces |
| Environment | External world, outside the agent boundary |
| Harness | Dashed container around Model + Context + Tools |
| Guardrails / human | Safety checkpoints (warning color) |

Exact hex values are chosen during implementation and validated for WCAG AA contrast in both light and dark themes.

**Rules:**
- **Theme-aware:** SVGs are inlined as Astro components and use `currentColor` + CSS variables, so they switch correctly with Starlight's light/dark mode.
- **Legible everywhere:** no text overflow; minimum 14px effective label size at a 360px-wide mobile viewport; wide diagrams get a stacked mobile variant or horizontal scroll with a visible hint.
- **Accessible:** every SVG has `<title>` and `<desc>`; color is never the only carrier of meaning (labels + shapes too).
- **Purposeful motion only:** flows/loops (ReAct loop, agent execution loop, trajectory rounds) get a step-highlight animation (Thought → Action → Observation) with Play/Step controls; honors `prefers-reduced-motion` (falls back to static). No decorative animation.
- **Attribution:** redrawn originals are captioned "Redrawn from Figure 1-x, *AI Agent Book* by Bojie Li (Apache 2.0)."

**Diagram inventory (Chapter 1):**

| Diagram | Lesson | Source | Animated |
|---|---|---|---|
| Agent–Environment loop, Model–Harness structure | 1 | Fig 1-1 | Yes (observation/action cycle) |
| Agent = LLM + Context + Tools component view | 1 | New | No |
| Observation space / action space interface | 2 | New | No |
| Three levels of capability updates | 3 | Fig 1-2 | No |
| Context ablation experiment design | 4 | Fig 1-3 | No |
| ReAct loop (Thought → Action → Observation) | 5 | New | Yes |
| Multi-currency trajectory, round by round | 5 | Fig 1-4 | Yes (step through rounds) |
| "Model as Agent" native tool calling | 5 | Fig 1-5 | No |
| Model vs. harness responsibility split | 6 | New | No |
| Prompt → context → loop engineering evolution | 6 | New | No |
| Autonomous agent execution loop | 7 | Fig 1-6 | Yes |
| Workflow pattern (n8n-style pipeline) | 7 | Fig 1-7 (screenshot → schematic) | No |
| Workflow vs. autonomous side-by-side | 7 | New | No |
| Guardrail placement (input / tool / output / human) | 8 | New | No |
| Five harness elements overview | 8 | New | No |

## Lesson Breakdown (Chapter 1 → 8 lessons, ~8–12 min each)

| # | Slug | Title | Original sections | Engineer-focused additions |
|---|---|---|---|---|
| 1 | `01-what-is-an-agent` | What an Agent Actually Is | Intro; "Modern Agent = LLM + Context + Tools"; Fig 1-1 | Component diagram of the formula; chat app vs. agent comparison table |
| 2 | `02-observation-action-tools` | Observation & Action Spaces, Tools | "Observation and Action Spaces"; "Tools" | Example tool definition as JSON schema; "tool = API contract" framing |
| 3 | `03-llm-reasoning-engine` | The LLM as Reasoning Engine | "LLM"; "Model as Agent"; "Agent Learning Mechanisms"; Fig 1-2 | Table of three capability-update levels with cost/latency/persistence trade-offs |
| 4 | `04-context-working-set` | Context: The Working Set | "Context"; Experiment 1-1; Fig 1-3 | "Context as agent RAM" framing; what breaks when each context element is missing |
| 5 | `05-react-loop` | The ReAct Loop | "The ReAct Loop"; Fig 1-4, 1-5 | Minimal ~20-line Python agent loop; trajectory as step-by-step trace |
| 6 | `06-harness-engineering` | Harness Engineering | "Harness Engineering"; "Prompt → Loop Engineering"; "Core Principles"; "How to Choose a Model" | Model vs. harness responsibility split; model-selection checklist |
| 7 | `07-orchestration-patterns` | Orchestration: Workflow vs. Autonomous | "Orchestration Patterns" and all subsections; Fig 1-6, 1-7; framework comparison | Pattern decision matrix; same task implemented both ways in code |
| 8 | `08-guardrails-and-big-picture` | Guardrails, Safety & the Big Picture | "Guardrails and Safety"; "Human Intervention"; "Five Harness Elements"; "Design Patterns"; "Chapter Summary" | Guardrail placement diagram (input/tool/output); chapter cheat sheet |

Every section of the original chapter maps to exactly one lesson. The "Thought Questions" section and `book-en/reference-answers.md` feed the lesson quizzes.

## Lesson Template

Each lesson MDX file follows this order:
1. **TL;DR** — 2–3 lines on what the reader will learn.
2. **Content** — tightened prose, original figures, code snippets, tables.
3. **Engineer's Note** callouts (Starlight `<Aside>`) — practical implications and pitfalls, used where relevant.
4. **Key Takeaways** — `<KeyTakeaways>` component with bullets.
5. **Check Yourself** — 2–4 `<Quiz>` items with click-to-reveal answers.
6. **Attribution footer** — credit line with link to the original section.

## Project Structure

```
ai_agent_book/
├── src/content/docs/
│   ├── index.mdx                  # Landing page
│   ├── about.mdx                  # Credits + license notice
│   └── chapter-1/
│       ├── index.mdx              # Chapter overview + lesson list
│       └── 01-…08-*.mdx           # Lessons
├── src/components/
│   ├── Quiz.astro                 # Question + <details> reveal answer, no client JS
│   ├── KeyTakeaways.astro         # Styled takeaway box
│   ├── Figure.astro               # Wrapper: caption, credit, responsive sizing
│   ├── StepAnimator.astro         # Play/Step controls for animated diagrams
│   └── diagrams/chapter-1/        # One .astro file per inline SVG diagram
├── src/styles/diagrams.css        # Concept color variables (light + dark)
├── LICENSE                        # Apache 2.0 text
├── NOTICE                         # Attribution + modification statement
├── astro.config.mjs               # Title, sidebar, GitHub Pages `site` + `base`
└── .github/workflows/deploy.yml   # Build + deploy to GitHub Pages
```

### Components

- **`Quiz.astro`** — props: `question` (string). Slot: answer content. Renders a styled `<details>`/`<summary>` so it works with zero client-side JavaScript.
- **`KeyTakeaways.astro`** — slot: bullet list. Renders a bordered, titled box consistent with Starlight theme variables (works in light and dark mode).
- **`Figure.astro`** — props: `caption`, `credit?`. Slot: a diagram component. Handles caption/credit text and responsive width.
- **`StepAnimator.astro`** — wraps an animated diagram; diagram elements tagged `data-step="n"` are highlighted in sequence. Provides Play / Step / Reset buttons; small vanilla JS script; static all-steps-visible view under `prefers-reduced-motion`.
- **Diagram components** — one per diagram in `src/components/diagrams/chapter-1/`, inline SVG using only the concept color variables.

### Extending to Later Chapters

Add `src/content/docs/chapter-N/` with the same lesson template, redraw figures into `src/components/diagrams/chapter-N/` using the same color system, and add a sidebar group in `astro.config.mjs` (autogenerated from the directory).

## Deployment

- GitHub Actions workflow using the official `withastro/action` + `actions/deploy-pages`.
- `astro.config.mjs` sets `site: https://n0k0259.github.io` and `base: /learn-ai-agents`.
- GitHub repo: `n0k0259/learn-ai-agents`. Published URL: https://n0k0259.github.io/learn-ai-agents/
- Custom domain is out of scope for now (can be added later via `public/CNAME`).

## Testing & Verification

- `npm run build` succeeds with no errors.
- All internal links resolve (Starlight build link checks).
- **Diagram visual QA:** every diagram screenshotted in a real browser (Playwright) in light mode, dark mode, and at 360px mobile width; each screenshot inspected for text overflow, overlap, clipping, and contrast before the lesson is marked done.
- Animated diagrams: Play/Step/Reset work; reduced-motion shows the static version.
- Each lesson previewed locally (`npm run dev`): diagrams render, quizzes expand, light/dark mode both readable.
- Content check: every original Chapter 1 section heading is covered by one lesson (per mapping table above).

## Out of Scope

- Chapters 2–10 (structure supports them; content later).
- Runnable in-browser code, user accounts, progress tracking, comments.
- Custom domain setup.
