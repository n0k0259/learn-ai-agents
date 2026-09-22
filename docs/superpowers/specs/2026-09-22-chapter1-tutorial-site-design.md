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
- **Mermaid** for new diagrams (rendered at build time via a remark/rehype Mermaid integration).
- **GitHub Pages** hosting, deployed by GitHub Actions on push to `main`.

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
│   └── KeyTakeaways.astro         # Styled takeaway box
├── public/images/chapter-1/       # fig1-1.svg … fig1-6.svg, n8n-workflow.png
├── LICENSE                        # Apache 2.0 text
├── NOTICE                         # Attribution + modification statement
├── astro.config.mjs               # Title, sidebar, GitHub Pages `site` + `base`
└── .github/workflows/deploy.yml   # Build + deploy to GitHub Pages
```

### Components

- **`Quiz.astro`** — props: `question` (string). Slot: answer content. Renders a styled `<details>`/`<summary>` so it works with zero client-side JavaScript.
- **`KeyTakeaways.astro`** — slot: bullet list. Renders a bordered, titled box consistent with Starlight theme variables (works in light and dark mode).

### Extending to Later Chapters

Add `src/content/docs/chapter-N/` with the same lesson template, copy figures into `public/images/chapter-N/`, and add a sidebar group in `astro.config.mjs` (autogenerated from the directory).

## Deployment

- GitHub Actions workflow using the official `withastro/action` + `actions/deploy-pages`.
- `astro.config.mjs` sets `site: https://<username>.github.io` and `base: /<repo-name>`; values are filled in once the user provides the GitHub username and repo name.
- Custom domain is out of scope for now (can be added later via `public/CNAME`).

## Testing & Verification

- `npm run build` succeeds with no errors.
- All internal links and image paths resolve (Starlight build link checks, plus a check that every referenced image exists under `public/`).
- Each lesson previewed locally (`npm run dev`) in a browser: figures render, Mermaid diagrams render, quizzes expand, light/dark mode both readable.
- Content check: every original Chapter 1 section heading is covered by one lesson (per mapping table above).

## Out of Scope

- Chapters 2–10 (structure supports them; content later).
- Runnable in-browser code, user accounts, progress tracking, comments.
- Custom domain setup.
