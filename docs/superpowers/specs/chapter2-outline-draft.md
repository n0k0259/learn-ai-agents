# Chapter 2 ("Context Engineering"): Lesson Outline Draft

**Date:** 2026-09-23
**Status:** Draft, awaiting owner review
**Source:** `source/book-en/chapter2.md`, 1,122 lines. I checked it with `diff` against upstream `bojieli/ai-agent-book/main/book-en/chapter2.md` and the two are identical.
**Reference answers:** `source/book-en/reference-answers.md`, lines 53–89 (the local copy already has a Chapter 2 section, so I didn't need the upstream copy).
**Conventions followed:** the Chapter 1 spec (`2026-09-22-chapter1-tutorial-site-design.md`), lessons 1.5 and 1.6, the `dg-*` classes in `src/styles/diagrams.css`, and `scripts/check-lessons.mjs`.

Concept classes used below: `dg-model`, `dg-context`, `dg-tools`, `dg-harness`, `dg-env` (environment), `dg-guard`, `dg-neutral`.

Word counts are whitespace-split words over the whole range, including fenced code and blockquoted experiments. Where code makes up a large share, I give the prose-only figure as well.

---

## 0. Boundary changes vs. the approved split

The approved split doesn't balance. With it, lesson 2.4 (Chat Template → "Looking Ahead", lines 508–607) comes to **3,847 words**, and there's no heading inside that range where a cut gives two lessons on the same topic. I made three small shifts in source order. All ten lessons now fall between about 1,580 and 3,010 words, and each one starts at a heading.

| Change | Why |
|---|---|
| "How Context Is Composed at the API Level" (372–437, 1,120 words, including Experiment 2-1) moves from 2.3 to **2.2** | The section opens with "The example above shows…" and follows straight on from the code loop. Experiment 2-1 is the ReAct loop running on a local model, so it belongs with the loop. |
| "From API Messages to Model Tokens: Chat Template" (508–531, 847 words) moves from 2.4 to **2.3** | It picks up the special tokens seen in Experiment 2-2 (line 510), which ends 2.3. Moving it takes 2.4 from 3,847 words down to 3,000. |
| "Few-Shot Examples" (698–705, 283 words) moves from 2.6 to **2.5** | Line 700 calls examples "another important type of system prompt content". Without it, 2.5 would be only 1,296 words. |
| The compression H2 splits as 999–1074 (**2.9**) and 1075–1122 (**2.10**) | "Isolation Over Compression" alone is only 330 words, and 890 even with the summary and Thought Questions. |

**Fallback if the owner wants the approved topic assignment:** 2.2 = 95–371 (1,771), 2.3 = 372–507 (2,836), 2.4 = 508–599 (3,578, over budget; mitigate by putting "Rethinking KV Cache", 586–599, in a collapsed optional aside), 2.5 = 600–697 (1,565), 2.6 = 698–771 (2,115). Everything else stays the same.

---

## 1. Per-lesson table

GitHub anchors for `source.url` are in parentheses. Heading strings are exact. Quote them in YAML: several contain `:` or ASCII `"`.

| # | Final title | Slug | Lines | Source headings claimed (## – ####, outside fences) | Words | One-line description |
|---|---|---|---|---|---|---|
| 2.1 | Context & the Four Message Roles | `01-context-and-message-roles` | 1–94 (`#context-what-determines-an-agents-capabilities`) | `Context: What Determines an Agent’s Capabilities` (7); `How Agents Call LLMs: The API-Level Context Structure` (41); `The Four Message Roles` (45); `Single-Turn Request: The Simplest API Call` (58) | 1,640 (1,547 prose) | Why context quality sets the capability ceiling, the ReAct definition of context c_t, and how `system`/`user`/`assistant`/`tool` + `tools` carry it on a stateless API. |
| 2.2 | Tool Calls: The Agent's Core Loop | `02-tool-calls-core-loop` | 95–437 (`#multi-turn-interaction-with-tool-calls-the-core-loop-of-an-agent`) | `Multi-Turn Interaction with Tool Calls: The Core Loop of an Agent` (95); `Implementing the Agent's Core Loop in Code` (251); `How Context Is Composed at the API Level` (372) | 2,891 (≈1,960 prose + ≈930 code) | The two-call Vancouver example in full JSON, the book's OpenAI-SDK loop, how `messages` grows, the "static prefix + trajectory" layout, and Experiment 2-1 (0.6B local tool calling). |
| 2.3 | Attention, KV Cache Intuition & Chat Templates | `03-attention-kv-cache-chat-template` | 438–531 (`#kv-cache-friendly-context-design`) | `KV Cache-Friendly Context Design` (438); `From API Messages to Model Tokens: Chat Template` (508) | 2,563 | The `{{now}}` incident, three practical cache rules, Q/K/V and attention heatmaps (Experiment 2-2), and how the Chat Template turns messages into tokens, including how different model families retain historical reasoning. |
| 2.4 | KV Cache, Prompt Cache & Caching as Architecture | `04-kv-cache-and-prompt-cache` | 532–607 (`#principles-and-constraints-of-kv-cache`) | `Principles and Constraints of KV Cache` (532); `KV Cache and Prompt Cache: Two Levels of Caching` (562); `Caching as an Architectural Constraint` (566); `Rethinking KV Cache: Editable, Composable "Notes"` (586); `Looking Ahead: From Cache Mechanics to Designing Context Content` (600) | 3,000 | Why a prefix change invalidates everything after it, the harmful patterns (Experiment 2-3), KV vs Prompt Cache, cache boundaries, sub-agent byte alignment, preserved thinking, and "KV as notes" research. |
| 2.5 | System Prompts: Tone, Structure, Rules & Examples | `05-system-prompts` | 608–705 (`#prompt-engineering-optimizing-the-system-prompt`) | `Prompt Engineering: Optimizing the System Prompt` (608); `Tone and Style: Behavioral Framing` (616); `Structured Prompts: The "Format" of the System Prompt` (620); `Process-Driven vs. Rule Stacking: The "Organization" of the System Prompt` (649); `Translating Business Rules into Executable Instructions` (678); `Few-Shot Examples: When to Show the Model Examples` (698) | 1,579 (1,458 prose) | The new-team-member test, emphasis wording, XML + Markdown structure, SOP vs rule piles, turning billing policy into executable rules, and when and where to put few-shot examples. |
| 2.6 | Tool Definitions & Prompt Injection | `06-tool-definitions-and-prompt-injection` | 706–771 (`#tool-definition-design`) | `Tool Definition Design` (706); `Prompt Injection: The Core Threat to Context Security` (737) | 1,832 | Tool descriptions as manuals, native tool search / deferred schemas appended once, the prompt-engineering ablation (Experiment 2-4), and context-level separation of instructions from data (Experiment 2-5). |
| 2.7 | Dynamic Prompts & Agent Skills | `07-dynamic-prompts-and-skills` | 772–863 (`#dynamic-prompts-and-agent-skills`) | `Dynamic Prompts and Agent Skills` (772); `Skills: Composable Units of Domain Capability` (783); `How to Write a Usable Skill` (801); `Skills in Context` (821); `Relationship Between Skills and Tools` (837) | 2,068 | Progressive disclosure in three layers, descriptions as routing conditions, the two trigger paths, how to write a Skill, where Skills sit in the trajectory and cache, and Experiments 2-6 and 2-7. |
| 2.8 | The Agent Status Bar | `08-agent-status-bar` | 864–998 (`#agent-status-bar-keeping-the-model-aware-of-task-progress`) | `Agent Status Bar: Keeping the Model Aware of Task Progress` (864); `Theoretical Basis of the Agent Status Bar` (874); `Composition of the Agent Status Bar` (915); `Specific Position of the Agent Status Bar in the Context` (927); `Two Implementations of Status Updates and Their Cache Costs` (958) | 3,009 (2,832 prose) | Distilling implicit state into explicit facts at the tail of the context: the call-counting failure, what goes in the bar, why it uses the `user` role, and replace vs append with its break-even model. |
| 2.9 | Why and How to Compress Context | `09-context-compression` | 999–1074 (`#context-compression-strategies`) | `Context Compression Strategies` (999); `Why Compression Is Needed: Not Just a Length Issue` (1003); `The Internal Mechanism of In-Context Learning: Retrieval, Not Reasoning` (1015); `Compression and KV Cache: Apparent Contradiction, Practical Complementarity` (1036) | 1,944 | Three motivations, lookup vs aggregation, context rot, compressing between calls without losing the prefix, thinking-bound compression, and the six strategies in Experiment 2-10. |
| 2.10 | Compression in Production, Sub-Agent Isolation & the Big Picture | `10-compression-in-production-and-isolation` | 1075–1122 (`#production-grade-hierarchical-compression-mechanism`) | `Production-Grade Hierarchical Compression Mechanism` (1075); `Design Principles for Compression Strategies` (1085); `Isolation Over Compression: Sub-Agent Context Isolation` (1098); `Chapter Summary` (1106); `Thought Questions` (1112) | 1,592 (1,153 without the Thought Questions list) | The five-layer compression stack, four design principles, saving progress to docs, replacing compression with isolation, and a chapter-wide map of the context layout. |

**Coverage check:** there are **41** real `##`–`####` headings outside fences, and each is claimed exactly once above. Per lesson: 4 + 3 + 2 + 5 + 6 + 2 + 5 + 5 + 4 + 5 = 41. The 2.10 count includes `Chapter Summary` and `Thought Questions`.

<details><summary>All real headings by line (for verification)</summary>

7, 41, 45, 58 (2.1) · 95, 251, 372 (2.2) · 438, 508 (2.3) · 532, 562, 566, 586, 600 (2.4) · 608, 616, 620, 649, 678, 698 (2.5) · 706, 737 (2.6) · 772, 783, 801, 821, 837 (2.7) · 864, 874, 915, 927, 958 (2.8) · 999, 1003, 1015, 1036 (2.9) · 1075, 1085, 1098, 1106, 1112 (2.10). That's 41 headings. Line 1 (`# Context Engineering`) is H1 and outside the checker's scope. 2.1 covers its intro (lines 1–6, including Fig 2-1).

</details>

**Pseudo-headings inside code fences (must NOT be claimed):**
- Python fence 257–333: lines 262, 293, 294, 301, 307, 308, 309 (all single `#` comments).
- Text fence 628–642: line 629 `# Tool Usage Guidelines`, line 631 `## File Operations`, line 637 `## Network Requests`.

---

## 2. Per-lesson detail

### 2.1 Context & the Four Message Roles (1–94)

**Key concepts**
1. Context quality, not model size, is the main lever. The three minimum context categories for a coding agent are code, process, and environment (lines 15–19). Context holds an *observation* of the environment, not the environment itself (line 19).
2. Context engineering is also an organizational problem. Teams that work well remotely are AI-friendly (Linux kernel, lines 23–27). Jiayi Weng's quote (line 29).
3. The ReAct definition: the action a_t follows policy π(a_t | c_t), with c_t = (o_1, a_1, …, o_t) (line 33). User messages and tool results are observations; replies and tool calls are actions (line 35).
4. APIs are stateless, so the framework must rebuild a sufficient c_t on every call. Summarizing is allowed; silently dropping information needed for the next action is not (line 35).
5. The four roles `system`/`user`/`assistant`/`tool`, the `tool_call_id` linkage, and the separate `tools` field. "Four roles + `tools`" = Chapter 1's five components (lines 47–56).
6. A single-turn request/response: the message list must contain everything (line 93).

**Source figures to redraw**
- **Fig 2-1** (line 5), "Overview of the Context Window Composition". It is a chapter-opening overview of what fills the context window: system instructions, tool descriptions, conversation history, and other information (line 3). Use the same color bands the chapter uses later: `dg-context` for the prefix, `dg-model` for replies, `dg-env` for observations.
- **Fig 2-2** (line 60), "Request and Response Structure of a Single-Turn API Call". The request (system + user message) goes to the model and comes back as one assistant message, as in the JSON at lines 64–91.

**New diagrams**
- `RolesToComponents` (static). Layout: left column, four role chips plus a separate `tools` field chip; right column, Chapter 1's five components. Straight connectors show the one-to-one mapping, and a bracket marks `tools` as "not a message". Classes: `dg-harness` (system), `dg-env` (user and tool results, as observations), `dg-model` (assistant), `dg-tools` (`tools` field), `dg-neutral` connectors.

**Code to include**
- The request and response JSON at lines 64–79 and 81–91. Keep the `// ← Written by developer` annotations. Tag the fences `jsonc` because they contain comments.

**Quiz candidates**
- "Chapter 1 lists five context components, but the API has four message roles. Where does the fifth go?" Answer: tool definitions go in the top-level `tools` field, not a role (lines 54–56).
- "Why must the request list contain every piece of information the model needs, even in a one-turn chat?" Answer: every call is stateless (line 93, and line 35).
- "Your coding agent's fix works locally and fails immediately in the test environment. Which context category was missing?" Answer: environment configuration (line 17).
- Thought Questions assigned: none.

**Fidelity hazards**
- Line 19 says a moderately capable model with good context "can **often** outperform" a stronger one. Don't turn that into "always".
- Line 29: quote Weng verbatim and attribute it to "OpenAI researcher Jiayi Weng". Don't paraphrase it as a general claim of the book's.
- Line 33 is a direct quote from the ReAct paper (Yao et al., ICLR 2023, footnote line 37). It contains LaTeX, and the site has no remark-math or KaTeX (see `astro.config.mjs`). Render it with Unicode (π(aₜ | cₜ), cₜ = (o₁, a₁, …, oₜ)) inside a blockquote. Don't add a math plugin as part of this chapter's work unless the owner approves.
- Line 43: OpenAI Chat Completions is *the example*. Other providers "differ in details". Don't claim every API has a `tool` role.
- Line 49 says the system message appears once "in most conversations". Later lessons append system messages (2.4, line 580) and send the status bar as `user` (2.8), so don't write "always once at the top".
- Duplication with 1.4, which already teaches the five components in depth. Here, show only the mapping at line 56 and link to 1.4. Line 3 ties context engineering to the harness "Context and Tools" layer, so link to 1.6. The observation/action vocabulary at line 35 links to 1.1 and 1.2.

---

### 2.2 Tool Calls: The Agent's Core Loop (95–437)

**Key concepts**
1. Figure 2-3 shows two **model API calls**, not two tools called in sequence. The two tools can run in parallel because their arguments are all known up front. Dependent tools must run serially across rounds (line 101).
2. The `tools` list is static metadata, identical whatever the user asks. The *model* decomposes the task into `tool_calls`, not the framework (line 151).
3. Division of labor: the model requests the calls and the framework executes them (line 185).
4. Three details of the second request: the full history is resent, the first assistant message goes back in verbatim, and results are linked by `tool_call_id` (lines 227–231). A response with no `tool_calls` ends the loop (line 247).
5. The framework's central job is maintaining the message list (lines 335–370).
6. Context = static prefix (system + tools) + growing trajectory. The prefix stays stable; later trajectory segments can be summarized or replaced (line 378). The context-construction pseudocode (lines 384–401) previews the rest of the chapter.
7. Experiment 2-1: a 0.6B model can call tools reliably. It runs at more than 100 tok/s on the author's M2. The output order is `<think>` → text → tool call, and streaming can execute the first tool early (lines 403–436).

**Source figures to redraw**
- **Fig 2-3** (line 99), "Complete Interaction Sequence for Two Model API Calls". A sequence diagram with lanes for user, framework, model API, and tools. Call 1 returns two `tool_calls`, the tools run in parallel, and call 2 returns the final text. **Animate** it (step through the arrows).
- **Fig 2-4** (line 376), "Context Composition Each Time the Agent Calls the Model". A stacked block: the static top (System Prompt + Tool Definitions) sits above the growing trajectory (user, assistant, tool …).
- **Fig 2-5** (line 406, inside Experiment 2-1), "Local LLM Tool Calling Architecture". A client or agent talks to a local server (vLLM/Ollama, line 421), which applies the chat template to Qwen3-0.6B. The model streams `<think>`, text, and tool calls, and the tools execute and return. Take the description from lines 409–429 only.

**New diagrams**
- `MessagesGrowth` (static, three columns). Layout: three side-by-side snapshots of `messages` (initial, after call 1, after call 2), with the rows added at each step highlighted and tagged "+ model" or "+ framework". Classes: `dg-harness` (system), `dg-env` (user and tool), `dg-model` (assistant), `dg-neutral`. Keep it static to avoid repeating the animated `TrajectoryRounds` from 1.5.
- `ContextAssemblyPipeline` (static). Layout: `stable_prefix` → `trajectory` → an "over budget?" diamond (yes → `compress_old_evidence` keeping decisions, constraints, failures, and citations) → `+ status_message` → request. Each block is tagged with the lesson that covers it (2.3–2.4, 2.8, 2.9–2.10). Classes: `dg-context`, `dg-harness`, `dg-guard` (budget check), `dg-model` (call_model).

**Code to include**
- The JSON exchanges at 105–149, 155–183, 191–225, and 235–245 (`jsonc`). In the lesson, show the first request in full and the rest condensed or collapsed.
- The Python loop at **257–333**, verbatim. It uses the real OpenAI SDK; it is not pseudocode (line 255).
- The `messages` state snapshots at 340–345, 348–356, and 359–368 (text). They can feed `MessagesGrowth` directly instead of being repeated as code.
- The context-construction pseudocode at **384–399**. Label it "book pseudocode", the same convention as 1.5.

**Quiz candidates**
- "The model returns `get_current_time` and `get_weather` in one response. When may the framework run them in parallel, and when must they be serial?" (line 101).
- "Who decided to split 'time and weather in Vancouver' into two lookups: the framework or the model?" (line 151, and line 185).
- "The book's loop is `while True`. What does production code need to add, and why?" Answer: a `max_iterations` cap, because agents can get stuck repeating the same tool calls (comment at lines 308–309). Link to 1.5 and 1.7 (MAX_ROUNDS).
- Thought Questions assigned: none.

**Fidelity hazards**
- The loop at 257–333 differs from 1.5. Lesson 1.5 says "the book writes this, like the rest of its code, as Python-style pseudocode", but line 255 says this chapter includes the full API loop as a protocol reference. Say that the difference is intentional.
- `client = OpenAI()` with `model="Qwen3-0.6B"` only works against an OpenAI-compatible local endpoint (line 62 "locally deployed", line 421 vLLM/Ollama). Add a note about this. Don't edit the book's code.
- `execute_tool` is a stub that ignores `arguments` (comment at lines 293–294). Don't present it as a working weather client.
- Don't add `MAX_ITERATIONS` inside the book's code block. Put it in an Engineer's note instead, because the source code itself has no cap.
- Line 425: the `<think>` → text → tool-call output order is the Qwen3-style behavior seen in this experiment. Don't generalize it to all models.
- Experiment 2-1's figures (more than 100 tok/s on an Apple M2, tokens per Chinese character and per English word at line 414) are the author's measurements and rules of thumb. Attribute them.
- Experiment 2-1 item 5 (the TTFT jump when the prefix changes) is a teaser for 2.3. Mention it in one line and don't explain KV Cache here.
- Duplication: 1.5 already covers ReAct, the trajectory, "static prefix + trajectory", and parallel calls. 1.4 has `build_context`, and 1.2 has a tool-schema JSON. Frame this lesson as "the same loop at the wire level" (line 247) and link back. Don't re-teach the ReAct stages.

---

### 2.3 Attention, KV Cache Intuition & Chat Templates (438–531)

**Key concepts**
1. KV Cache intuition: reuse holds only up to the first differing token. Prompt Cache is the cross-request layer built on top of it (line 440; the formal definitions are in 2.4).
2. The `Current time: {{now}}` incident: 100,000 conversations a day, TTFT rose from 0.5 s to 3–5 s, and the bill nearly doubled (lines 442–444).
3. Three practical rules: freeze the system prompt and tools; append dynamic info at the end; use the standard API format, never hand-concatenated strings (lines 446–454).
4. Q/K/V attention, worked through on "北京 的 天气 怎么样" (Table 2-1, lines 460–486). The weights sum to 1, and the triangular causal mask follows.
5. Experiment 2-2 heatmap patterns: attention sink, reasoning triangle, output triangle, and position bias ("Lost in the Middle") (lines 494–503).
6. The Chat Template as an "envelope". Special tokens such as `<|im_start|>` and `<|im_end|>` mark roles and boundaries, and the server applies the template (lines 510–522).
7. Two consequences: (a) misrolled tool results can reset reasoning in Qwen3's template (lines 524–526); (b) the template's fixed prefix tokens are what the cache reuses (line 530). Model families handle historical CoT differently: R1 strips it; V4 requires it back whenever `tools` is present, and returns a 400 error otherwise; Claude requires thinking blocks back with their signatures (line 528).

**Source figures to redraw**
- **Fig 2-6** (line 479), "Intuitive Understanding of the Attention Mechanism". Top: 怎么样's query matched against 天气 0.55, 北京 0.35, 的 0.05, and itself about 0.05. Bottom: a 4×4 lower-triangular heatmap, with rows as queries and columns as keys (lines 482–484).
- **Fig 2-7** (line 491), "Attention Heatmap Visualization". **A PNG.** It's a real-model heatmap from the `attention_visualization` experiment. See §4.
- **Fig 2-8** (line 512), "Token Structure of Chat Template". The envelope anatomy, with a role marker, content, and `<|im_end|>` per message.
- **Fig 2-9** (line 518), "Conversion from API Messages to Model Token Stream". Structured JSON messages on the left and the linear Qwen token stream on the right (line 520).

**New diagrams**
- `TimestampIncident` (static). Layout: two request rows of tokens. Row A has a stable system prompt, so the cached span is long. Row B has `Current time: {{now}}` early in the prompt, so everything after that token is marked "recompute every request". A side panel reads "TTFT 0.5 s → 3–5 s; bill ≈ ×2". Classes: `dg-context` (reused), `dg-guard` (recomputed), `dg-neutral`.

**Code to include**
- No fenced code in range. Render Table 2-1 (lines 466–472) as a Markdown table. Special tokens appear inline only. Don't make up a full Qwen template dump; Fig 2-9 does that job.

**Quiz candidates**
- **Thought Question 2** (line 1115): Qwen3 retains reasoning "after the last real user message". What would you change for loops of hundreds of calls, and what does the move from R1 stripping to V4 pass-back tell you? Reference answer: `reference-answers.md` line 61.
- "An engineer adds `Current time: {{now}}` to the system prompt. Why does TTFT jump across *every* conversation, and where should the time go instead?" (lines 442–450, and line 550).
- "Your harness sends tool results as ordinary `user` messages. What breaks with Qwen3's template?" Answer: the template treats them as a new user query and clears the retained `<think>` reasoning mid-task (lines 524–526, and line 748 in 2.6).
- "Why does the first token soak up so much attention?" Answer: softmax forces the weights to sum to 1, so the model parks leftover weight on a stable position (lines 496–498).

**Fidelity hazards**
- Rule 3 (line 450) is subtle. Hand-concatenation hurts *reasoning* because it departs from the training format. It does **not** break caching as long as the concatenated prefix stays byte-stable. The same nuance comes back at line 558. It's easy to overstate this as "manual formatting breaks the cache".
- The heatmap figures are only given for the 怎么样 row. Don't invent values for the other rows of Fig 2-6, and label the redraw "illustrative weights".
- Line 496 says the first token "often" absorbs attention, "sometimes exceeding 70%". Keep both hedges.
- Position bias: cite Liu et al., TACL 2024 (footnote line 506). Don't attribute the finding to this book's experiment alone.
- The vendor claims at line 528 (DeepSeek R1/V4, Kimi K2, GLM-5, Claude signatures) change fast. Attribute them to the book, keep the "consult the latest docs" caveat, and send preserved-thinking details to 2.4 (line 578) rather than explaining them twice.
- Contradiction risk with Chapter 1:
  - **1.4 quiz** "Why can the reasoning part be dropped from history at little cost?" teaches that dropping reasoning is cheap when the *why* can be reconstructed. Line 528 says that for agents, stripping reasoning loses state and that V4 and Claude *require* it back. Reconcile this explicitly in an Engineer's note: 1.4's result is an ablation finding, and the pass-back protocol is now model-family specific.
  - **1.4** says the system prompt carries "dynamically injected environmental state". Line 449 says to append dynamic information at the end instead. Add a one-line reconciliation that links forward to 2.8 (the status bar).
- Quadratic-cost claims belong in 2.4 (lines 534–542). Don't bring them in here.
- Cross-references: 1.3 (in-context learning), 1.4 (reasoning as part of assistant messages).

---

### 2.4 KV Cache, Prompt Cache & Caching as Architecture (532–607)

**Key concepts**
1. Without a cache, prefill recomputes the whole prefix every round, and the cumulative work grows about N². With KV Cache, each token's K and V are computed once. Decoding still reads every cached K and V (linear per token), so memory and bandwidth become the bottleneck (lines 534–542).
2. Layered propagation: a change at token k affects every layer's representations from k onward. The earlier the change, the bigger the recompute and the bill (line 544).
3. Experiment 2-3's harmful patterns: dynamic system prompt, dynamic user config, reordering tools, sliding-window history (it breaks the prefix *and* drops tool results, which causes loops), and text formatting (it harms reasoning, not caching) (lines 546–560).
4. KV Cache (inside a single inference) vs Prompt Cache (across requests). Cache reads cost about one-tenth of fresh computation at Anthropic, DeepSeek, and GPT-5. How caching is enabled and billed varies by provider (line 564).
5. Caching is an architectural constraint (Claude Code example):
   - a cache-boundary marker, with 2^N variants for N binary conditions placed before it;
   - sub-agents byte-aligned with the parent *when they inherit its context*;
   - frozen replacement strings (lines 568–576).
6. Preserved thinking: signatures bind each thinking block to its prefix, so "append only" becomes a correctness requirement. The fixes are to append a system message, put environment changes in the latest turn, and declare tool changes in a separate block (lines 578–582).
7. Optional research: KV as editable, composable "notes" (O(L²) → O(L) splicing), still at research stage (lines 586–598). A signpost to the rest of the chapter follows (lines 600–606).

**Source figures to redraw**
- **Fig 2-10** (line 536), "Prompt Cache: Reusing the Prefix KV Cache Across Requests". Request 1 computes and caches the prefix KV. Request 2 shares the prefix, so it hits the cache and computes only the new suffix (line 530). **Animate** it (request 1 → request 2 → request 3).

**New diagrams**
- `KVCacheDecodeSteps` (**animated**). Layout: token strip A B C D with a KV-cache shelf underneath. Step 1: D's query attends over cached K/V for A–D and predicts E. Step 2: E is sampled, its K/V is computed and appended, and the shelf grows to five. A toggle ("no cache") shows all K/V recomputed each step. Classes: `dg-model` (Q and attention), `dg-context` (cached K/V), `dg-guard` (recomputed), `dg-neutral`.
- `PrefixChangePropagation` (**animated**). Layout: a grid of layers (rows) × tokens (columns) with token k marked as changed. Each step lights up column k and everything to its right, one layer at a time; columns before k stay "reusable". Classes: `dg-context` (reusable), `dg-guard` (invalidated), `dg-neutral`.
- (Optional, if budget allows. Not counted in the totals.) `CacheBoundaryVariants`: the global-cacheable segment | boundary marker | session segment, with 3 binary conditions before the marker fanning out into 8 cache keys (line 572). Classes: `dg-context`, `dg-harness`, `dg-guard`. A small table may do the job as well.

**Code to include**
- None in source. You may render lines 572 and 580 as a short "do / don't" table; that's a table, not code.

**Quiz candidates**
- "Changing one character in the system prompt made TTFT several times slower. Why does the whole suffix get recomputed, not just that token?" (line 544).
- "Three binary runtime conditions are placed before the cache boundary. How many cache-key variants result, and what's the fix?" Answer: 2³ = 8; move dynamic elements after the boundary (line 572).
- "A sliding window of 10 messages keeps context small. Name the two problems it causes." Answer: it breaks prefix consistency, and it drops critical tool results, which leads to repeated calls (line 556).
- "With preserved thinking, why is 'append only, never rewrite' a correctness issue and not just a cost issue?" (lines 578–582).
- Thought Questions assigned: none (Q1 goes to 2.10, Q9 to 2.6). This lesson's quizzes come from source lines only.

**Fidelity hazards**
- **1.5's stretch quiz** already covers *cumulative cache-read charges* growing O(n²) with prompt caching. This lesson's N² (line 540) is the *no-cache recompute* cost. These are different quantities; say so and link back to 1.5, and don't restate 1.5's answer.
- Line 544, "severalfold increases", comes from the book's own measurements. The 0.1× cache-read price (line 564) is given "for example" for three providers. Don't turn it into a universal price.
- Line 570: Claude Code "illustrates a broader pattern". Its cache-boundary marker is a Claude Code design, not an API feature. Line 574's byte-alignment only applies *if the sub-agent inherits the parent's context*. Keep that condition, because 2.10's isolated sub-agents don't inherit it.
- Line 578 names "Claude Fable 5.1 and Claude Opus 5.5" and says preserved thinking's original purpose is to **prevent distillation**. Keep that attribution and the footnote (line 584). Don't describe it as a caching feature.
- "Rethinking KV Cache" (586–598) is the author's own paper (footnote line 598, Li, Bojie, arXiv:2606.17107). Label it optional and research-stage (lines 588 and 596). Keep the figures exact: p90 TTFT tens to hundreds of times faster, 98.5% hit rate, cosine 0.90–0.999 across 12 models. Put it in a collapsed `<details>` or a `:::note[Research aside]`.
- The formal KV vs Prompt Cache distinction lives here. 2.3 only previews it.
- Cross-references: 1.5 (stretch quiz), 1.8 (the append-only design pattern), 1.7 (sub-agents, only in passing).

---

### 2.5 System Prompts: Tone, Structure, Rules & Examples (608–705)

**Key concepts**
1. The system prompt is the agent's operating manual. Litmus test: would a capable new team member know what to do after reading it? (lines 610–612)
2. Tone framing and emphasis. Constraints such as "fewer than 4 lines" and "don't explain why you can't" prevent self-justification. Uppercase NEVER raises salience, but overusing it dilutes the effect (line 618).
3. Two-layer structure: XML tags give semantics (`<working_directory>`) and Markdown gives hierarchy readable by humans (lines 622–647).
4. A process-driven SOP beats rule stacking, because the model can place itself within a stage and handle exceptions locally (lines 651–676).
5. Business rules must be *executable*, which is a product-manager job. The billing example: commission only for negotiated bill reductions, never for refunds or cancellations, explicit rounding, and "savings" measured only against the existing bill (lines 680–696).
6. Few-shot examples help when rules are hard to state. Place them in the system prompt or in synthetic first turns. Keep them byte-stable, and don't retrieve them per request. Two or three well-chosen examples beat ten near-duplicates (lines 700–704).

**Source figures to redraw**
- None in range.

**New diagrams**
- `RulesVsSOP` (static; stepping through the SOP stages optionally is fine, but not counted as animated). Layout: on the left, a scatter of unordered rule cards with a "which applies?" marker. On the right, the five-step SOP chain (Validation → Classification → Preprocessing → Execution → Verification) with a "not found → log error and stop" branch at step 1. Classes: `dg-neutral` (rule cards), `dg-harness` (SOP steps), `dg-guard` (stop branch).
- `BillingDecisionRules` (static). Layout: a decision tree running task type → {negotiated reduction of an existing bill → commission; refund or cancellation → `fixed_fee`, flagged NEVER percentage-based; low-success task → prepayment}. A side note says the success-probability bands (>60% refundable, <30% rejected) are "example thresholds". Classes: `dg-harness`, `dg-guard` (NEVER rule), `dg-context`.

**Code to include**
- The XML + Markdown system prompt at **628–642** (text) and the SOP at **655–674** (text), both verbatim. Note that lines 629, 631, and 637 contain `#`/`##` inside the fence (see §6).
- The quoted rule at line 690: `NEVER use percentage_based_one_time for refunds and service cancellations. Use fixed_fee instead.`

**Quiz candidates**
- **Thought Question 5** (line 1118): how do you keep a multi-author system prompt from decaying? Reference answer: line 73. The question text states its own premise ("disorganized information cut success by over 30%"), and Experiment 2-4 is shown in 2.6. Link forward.
- "'Help me cancel my Netflix subscription.' Commission or fixed fee, and why must the prompt say so explicitly?" (lines 688–690).
- "Why does picking the 'most relevant' few-shot examples per request hurt a production agent?" Answer: examples sit early in the context, so swapping them invalidates the cache on every request (line 702).

**Fidelity hazards**
- Line 618 says uppercase increases salience "more than softer phrasing", but overuse dilutes the effect. Don't present it as a universal trick.
- The billing thresholds (>60% refundable, <30% rejected, $0.05/min, rounding to the nearest dollar) are **examples** ("might", line 692). Label them as such.
- Line 694 says prompts are "often designed by product managers" "in mature Agent teams". That describes practice; it isn't a rule.
- Few-shot examples vs Chapter 1: **1.7** (line 98 of the lesson) says few-shot examples and prompting tricks "were internalized by instruction tuning". Reconcile: line 700 limits few-shot to outputs that are hard to specify, and says it wastes tokens on tasks the model already handles.
- The mechanism behind few-shot ("temporarily customized", line 1032) is covered in 2.9. Link forward; don't explain it here.
- Experiment 2-4's results (tone had limited impact, disorganization dropped success by over 30%) support this lesson but sit at lines 724–735 in 2.6's range. Present them **only** in 2.6 and link forward from here with one sentence, so the numbers don't appear twice.
- Cross-references: 1.6 (prompt → context engineering paradigm), 1.3 (a policy change goes into a prompt or Skill, as in 1.3's "refund policy" quiz).

---

### 2.6 Tool Definitions & Prompt Injection (706–771)

**Key concepts**
1. A tool definition is an operating manual. Claude Code-style descriptions include usage boundaries ("NEVER invoke grep or rg as a Bash command"), examples, performance tips, and relationships between tools (lines 708–710).
2. Native progressive disclosure for tools (2026 onward): OpenAI `tool_search` + `defer_loading: true`, Anthropic `tool_reference`, Claude Code deferring MCP tools, and Codex CLI BM25 search (line 712).
3. Why appending a schema doesn't break the cache: causal attention means earlier K/V never depend on later tokens. A discovered schema is appended **once**, stays where it was added, and is not moved to the end every turn (lines 718–720). It needs models trained for mid-conversation definitions (GPT-5.4+, Claude 4.5+) (line 722).
4. Experiment 2-4 (a Tau-Bench ablation): tone had limited effect, removing structure cut success by over 30%, and stripping tool descriptions raised tool-call errors by 45% (lines 724–735).
5. Prompt injection: instructions disguised inside external content. It's worse in agents because they have tools and can take irreversible actions. Every perception tool is an entry point: hidden page elements, PDF metadata, EXIF (lines 741–743).
6. Context-level defenses: source tagging (`<external_content source="webpage">`), structured roles, and input sanitization (auxiliary only). Skills and status bars are new injection surfaces (lines 745–751). These are only the first line of defense (line 753).
7. Experiment 2-5: direct, indirect, and memory injection × four defense configurations (lines 755–769).

**Source figures to redraw**
- None in range.

**New diagrams**
- `DeferredToolLoading` (**animated**). Layout: at the top, a static prefix holding the system prompt and tool *names only*. Below it, a trajectory strip. Step 1: the model emits `tool_search_call`. Step 2: `tool_search_output` appends the full schema at the tail as a one-time cache write. Step 3: new turns are appended *after* it, and the schema is shown pinned in place and marked cached. Classes: `dg-context` (prefix and cached), `dg-tools` (schema), `dg-model` (search call), `dg-neutral`.
- `InstructionDataBoundary` (static). Layout: on the left, trusted channels (`system`, `user`). On the right, untrusted inputs (web page, email, PDF metadata, EXIF, third-party Skill, status-bar source), each wrapped in an `<external_content source=…>` frame before it enters the context. At the bottom, a banner reads "context layer = first line; execution-level defenses → Chapters 4–5 / lesson 1.8". Classes: `dg-harness` (trusted), `dg-env` (external), `dg-guard` (tags and sanitization), `dg-context`.

**Code to include**
- No fenced code. Inline: the `<external_content source="webpage">…</external_content>` wrapper (lines 747 and 767), and the API names at line 712. If you add an illustrative tool JSON, reuse 2.2's `get_weather` schema and don't invent Claude Code tool text beyond the fragments quoted at line 710.

**Quiz candidates**
- **Thought Question 9** (line 1122): design a context layout for a large, frequently changing tool set that maximizes cache hits. Reference answer: line 89. It draws on 2.4 (fixed order, sub-agent alignment) and previews 2.7 (Skills).
- "A discovered tool schema is appended mid-session. Why don't the earlier cached tokens need recomputing, and does the schema move to the end each turn?" (lines 718–720).
- "Which of the three context-level defenses is weakest, and why?" Answer: input sanitization, which is easily bypassed by rewording (line 749).
- "Experiment 2-4 removed tool descriptions but kept the signatures. What happened?" Answer: tool-call errors rose 45%, with invalid values and misunderstood parameters (line 734).

**Fidelity hazards**
- Line 712 lists vendor API names and flags "since 2026". Quote them as the book states them, with the footnotes at lines 714–716. Line 722's model list (GPT-5.4+, Claude 4.5+) says "currently". Keep that hedge.
- Line 718 explicitly says this is "not pre-compilation but append-only injection". Keep the wording.
- Experiment 2-4 applies Chapter 1's ablation *method* (line 728); its data is not Experiment 1-1's. Don't mix them. Keep the numbers exactly: "over 30%", "45%". Tone's impact was "relatively limited", not zero.
- Prompt injection overlaps **1.8** (context-layer guardrails, the safety classifier, and "an agent cannot reliably detect its own compromise"), which says source labelling is "covered in Chapter 2". This lesson delivers that content. Don't re-teach classifiers or the three guardrail layers; link to 1.8 for the execution and data layers. **1.7**'s "workflows confine injection to one node" can be linked too.
- Line 751 says Skill and status-bar injection risks are *mentioned* here and explained in 2.7 and 2.8. Keep both mentions to one line each.
- Line 753 defers retrieval poisoning to Chapter 3 and execution defenses to Chapters 4–5. Say "later chapters"; don't expand on them.
- Experiment 2-5 is a **design** with acceptance criteria, not a set of reported results. Don't invent success rates.

---

### 2.7 Dynamic Prompts & Agent Skills (772–863)

**Key concepts**
1. A monolithic system prompt wastes tokens and dilutes attention. Hence on-demand loading (lines 776–781).
2. Progressive disclosure has three layers: metadata (`SKILL.md` frontmatter with `name` + `description`), the core workflow (the full `SKILL.md`), and details (referenced sub-docs such as `html2pptx.md` and `reference.md`) (lines 785–799).
3. Write `description` as a routing condition ("Use when / Do not use when", with negative examples), not a feature summary (line 792).
4. Two trigger paths:
   - A slash command such as `/pptx` is expanded by the client, with no tool call.
   - A model-triggered Skill tool costs one extra ReAct round.
   - In Claude Code, both inject the body as a **user message** at the invocation point; the tool result is only a placeholder. Runtimes without a Skill tool read it as a file (tool result) (line 794).
5. Writing a Skill: role and reader, core principles, prohibitions, and references. Rules take the form "scope + action + exception + verification". Iterate from real edits (lines 803–813).
6. Standard vs harness: the standard fixes the loading *order*. Roles and wrappers are harness choices. Codex renders the catalog as developer context and wraps an explicitly selected Skill in `<skill>` (lines 823–829). "KV-friendly" does not mean zero cost (line 835).
7. Skill + a generic executor keeps the tool set small (seven core tools, per Chapter 5). Align with the vendor's training patterns (lines 815–817 and 839).

**Source figures to redraw**
- **Fig 2-11** (line 774), "Skills Progressive Disclosure Mechanism". Three layers: an always-visible catalog, then the `SKILL.md` body loaded on selection, then sub-documents read selectively.
- **Fig 2-12** (line 831, `{height=55%}`, tall), "Complete Structure of the Agent Trajectory After Enabling Skills". The model-triggered case: `Skill(skill: "pptx")` tool_use, then a placeholder tool_result, then the body appended as a separate user message (line 826). Needs a stacked mobile layout.
- **Fig 2-13** (line 833), "Evolution of KV Cache as the Agent Trajectory Grows". The cached prefix extends as the catalog and then Skill bodies are appended, with nothing earlier rewritten. **Animate** it (step through the trajectory growth).

**New diagrams**
- `SkillTriggerPaths` (static). Layout: two parallel lanes. Lane 1, "user types `/pptx`": the client expands it locally and the body arrives as a user message. Lane 2, "model decides": `Skill` tool_use, placeholder tool_result, then the body as a user message, with a "+1 ReAct round" badge. Both lanes end in the same trajectory slot. Classes: `dg-harness` (client/runtime), `dg-model`, `dg-tools` (Skill tool), `dg-context` (body).

**Code to include**
- No fenced code in source. Optionally show an **illustrative** `SKILL.md` frontmatter with only `name` and `description`, written in "Use when / Do not use when" form. Label it illustrative; line 792 says this is "writing advice", not a required field.

**Quiz candidates**
- **Thought Question 7** (line 1120): the metacognition problem, where a model doesn't know what it doesn't know. Reference answer: line 81.
- **Thought Question 8** (line 1121): do agents reliably follow a loaded `SKILL.md`, and how does model support differ? Reference answer: line 85 (see the hazards).
- "`/pptx` typed by the user vs the model deciding it needs PPTX: what ends up in the trajectory in each case?" (lines 794 and 826).

**Fidelity hazards**
- **The reference answer to Q8 conflicts with the body.** The answer says that "injecting at the end of the context… the KV for the skill portion must be recomputed on every tool call". Lines 718–720 and 835 say appended content is written to the cache once and reused afterwards. Only a replace-each-turn design (like 2.8's Implementation 1) would recompute. Its "injecting into the system prompt" option also contradicts line 794 (Claude Code injects as a user message). In the quiz answer, present the three placements as trade-offs and correct the recompute claim to "if re-injected every turn". Add the model-support part from lines 722 and 817, which the reference answer skips.
- Line 794 describes **Claude Code** specifically, and line 827 describes **Codex**. Line 829 says harness details change quickly. Don't claim every client uses a `system` role or a user message for Skills (line 826).
- Line 815 compares Skills to pip/npm "in spirit" only.
- Baoyu's four-part guidance (line 805) needs attribution and its footnote (line 819).
- The context-rot concept is only foreshadowed at line 779 and defined in 2.9. Don't define it here.
- Experiment 2-6 lets readers use Kimi Code instead (line 845). Keep it vendor-neutral.
- Overlap: **1.8** calls Skills "the archetype" of progressive disclosure, **1.1** lists Skills as a form of Tools, and **1.3** covers the "Prompt or Skill" update path. Link to them; don't re-teach them.

---

### 2.8 The Agent Status Bar (864–998)

**Key concepts**
1. The status bar is a framework-generated state summary at the tail of the context, like a phone's status bar. It is not user input, model output, or a tool result (lines 868–872).
2. In-context use is retrieval-like: there is no automatic distillation layer, so aggregates (counts, limits, progress) get recomputed from raw records on every decision (lines 876–882). This refers to a single forward pass; it doesn't deny CoT (line 876).
3. The phone-call failure: the agent miscounts calls. Adding "This is the third call to this merchant" to the result fixes it (lines 880–886). Placing the bar at the end steers attention (lines 888–890). Experiment 2-8 compares Qwen3-0.6B with and without the bar (lines 892–909). The companion paper reports near-frontier accuracy for small open models and about 10× fewer reasoning tokens, with roughly constant per-query cost (line 911).
4. Composition: task planning (TODO), side-channel event metadata, and an environment observation summary (lines 917–925).
5. Position: the bar is appended as a `user`-role message wrapped in `<agent_status>`. That's a protocol slot, not end-user input (lines 931–956).
6. Replace each round (invalidates only the short suffix since the last injection) vs persistent append (fully cache-friendly, but stale entries pile up; Claude Code's `<system-reminder>`). Break-even: prefer append when αSN/2 < (1−α)R (lines 960–968).
7. Experiment 2-9's five techniques, which work much better together (lines 970–986). Maintenance rules: have code maintain the bar, because models trust it almost unconditionally (the poisoning risk); and the bar is a lossy projection, so be careful about deleting the raw records (lines 991–995).

**Source figures to redraw**
- **Fig 2-14** (line 866), "Agent Status Bar Architecture". The framework derives state (counters, TODOs, environment) from the trajectory and injects `<agent_status>` at the tail, next to the model's next tokens.
- **Fig 2-15** (line 929), "Insertion Position of the Agent Status Bar in the API Message List". The message list from lines 935–952: a fixed cached system message, the rounds, the user follow-up, and the status bar as the final `user` message.

**New diagrams**
- `StatusReplaceVsAppend` (**animated**). Layout: two trajectory lanes stepping through three status updates. In the top lane ("replace"), the old status block is deleted and the suffix after it flashes as invalidated. In the bottom lane ("append"), status blocks pile up, older ones greyed out as stale, and nothing is invalidated. A footer shows the break-even inequality. Classes: `dg-context` (cached), `dg-harness` (status blocks), `dg-guard` (invalidated), `dg-neutral` (stale).
- `DistillImplicitState` (static). Layout: on the left, a long trajectory with three `phone_call` records scattered among web searches, and the model's query attention spread across them. On the right, the same trajectory with `<agent_status> phone_call 3/3 </agent_status>` at the tail, attention concentrated there. Classes: `dg-env` (tool records), `dg-harness` (status bar), `dg-model` (query), `dg-neutral`.

**Code to include**
- The `<agent_status>` block at **900–906** (xml, inside the Experiment 2-8 blockquote).
- The message list at **935–952** (text).
- The cost model at line 968. It uses LaTeX and there's no math plugin, so render it as a small code block or with Unicode: `C_replace ≈ (N−1)(1−α)R`, `C_append ≈ αS·N(N−1)/2`.

**Quiz candidates**
- **Thought Question 4** (line 1117): a buggy counter feeds the status bar false information. How do you make meta-information reliable? Reference answer: line 69.
- "S = 200 tokens, R = 5,000 tokens between updates, N = 20 updates, α = 0.1. Replace or append?" Worked answer: αSN/2 = 0.1·200·20/2 = 200 < (1−α)R = 4,500, so **append** (line 968).
- "The status bar is sent with `role: "user"`. Is it user input, and why not update the system message instead?" (line 931).
- "The status bar covers call counts. Can you delete the raw call logs?" Answer: only if every future question falls within the bar's dimensions, because it is a lossy projection (line 995).

**Fidelity hazards**
- Line 876: "retrieval-like" describes a single forward pass. Keep the sentence saying this doesn't negate CoT reasoning. 2.9's heading "Retrieval, Not Reasoning" has the same hazard; share the caveat and don't repeat the explanation.
- Line 911's results come from the author's co-authored paper (Li & Shi, 2026, footnote line 913). Keep the hedges: "close to", "roughly an order of magnitude", "roughly constant".
- The numbers in Experiment 2-9 (15 vs 21 iterations, error recovery from 60% to 95%) are the book's experimental results. Attribute them, and keep "emergent effect" as the book defines it at line 984.
- The TODO technique is "inspired by Manus" (line 978). Keep that attribution.
- Line 964: Claude Code's `<system-reminder>` is the persistent-append example. Don't claim other harnesses do the same.
- The break-even formula ignores context occupancy and ambiguity from stale entries (line 968). State that limit.
- **1.4**'s "system prompt carries dynamically injected environmental state" conflicts with this lesson's approach. Resolve it here: this is where dynamic state *should* go. The "status-bar poisoning" mentioned at line 993 was introduced at line 751 (2.6), so link back. Line 997, "the status bar is one form of compression", bridges to 2.9.
- Cross-references: 1.4 (loop quiz: repeated-call detection), 1.7 (stop conditions).

---

### 2.9 Why and How to Compress Context (999–1074)

**Key concepts**
1. Three motivations: length and cost; reasoning quality, because distilled knowledge is easier for the model to use than raw text; and context anxiety, where the model wraps up early (lines 1005–1011).
2. Status bar vs compression: the status bar *adds* conclusions, usually maintained by code, while compression *replaces* raw text with conclusions, usually via an LLM (line 1017).
3. Lookup vs aggregation: "which cat is in cage 37?" vs "how many black cats?". Summarize once so the count becomes retrievable (lines 1019–1024).
4. Context rot ("fits but can't be found") vs overflow ("can't fit") (lines 1026–1030). In-context learning is temporary customization that doesn't carry over to the next session (line 1032).
5. Compression happens *between* calls. It never touches the system prompt or tools; it targets tool results. The cache stays valid up to the replacement point. Batch it near a threshold instead of every round (lines 1038–1044).
6. When thinking is bound to the prefix, "summarize old turns, keep the last few verbatim" invalidates the kept thinking. Instead, summarize the whole session into one message, or use server-side compaction (line 1046).
7. Experiment 2-10's six strategies (lines 1050–1068).

**Source figures to redraw**
- **Fig 2-16** (line 1048), "Comparison of Context Compression Strategies". The strategies compared by outcome. Use the numbers at lines 1054–1068: no compression overflows at iteration 5; individual summaries 10.9% / 12 iterations / 276,608 tokens; combined 4.3% / 10 / 93,449; context-aware ≈3.0% / 7 / 40,157; adaptive 174,601 tokens.
- **Fig 2-17** (line 1071), "Processing Flow of Six Compression Strategies". A per-strategy pipeline from tool result to compression step to context, including the citation branch and the 80% threshold with the `[COMPRESSED]` marker.

**New diagrams**
- `LookupVsAggregation` (static). Layout: a strip of 100 cage cells (90 black, 10 white). The "lookup" arrow points at cage 37 with one hop. "Aggregation" is shown as a scan across every cell with a running counter. A third panel shows the precomputed line "90 black, 10 white" retrieved in one hop. Classes: `dg-context` (records), `dg-model` (query), `dg-harness` (distilled summary).
- `CompressionTimingCache` (**animated**). Layout: a context bar split into static prefix | older tool results | recent turns, with a token gauge. Steps: the context grows each call; the gauge crosses 80%; *between* calls, all uncompressed tool results are batch-replaced with `[COMPRESSED]` summaries; the cache stays valid up to the first replacement and is rebuilt after it. Classes: `dg-context`, `dg-tools` (tool results), `dg-guard` (threshold and invalidated span), `dg-harness` (compressor).

**Code to include**
- No code fences. The pet-store log (lines 1021–1022) is a blockquote; keep it. Optionally show the context-aware compression prompt fragments quoted at line 1058 (`Given the search query: {query}`, `Current context: {context}`). Don't write a full prompt.

**Quiz candidates**
- **Thought Question 3** (line 1116): the extreme compression from about 148K to about 2K characters. Is information lost irreversibly, and how do you mitigate it? Reference answer: line 65.
- **Thought Question 6** (line 1119): if in-context learning is retrieval rather than reasoning, how do we get past that limit? Reference answer: line 77.
- "The Agent has plenty of window left but keeps missing a fact it saw earlier. Overflow or rot? What helps?" (lines 1026–1030).
- "Why batch-compress near a threshold instead of compressing every round?" Answer: each compression invalidates the cache after the replacement point (line 1044).

**Fidelity hazards**
- **The numbers don't match across sources.** Line 1058 says "roughly 150K characters were compressed to 2K", Thought Question 3 (line 1116) says "approximately 148K", and the answer says 148K. Use "≈150K (≈148K)" once and link the two, or quote each source verbatim in its own context.
- Line 1052: Kimi K3 had its 1M-token window artificially limited to 128K. Mention the limit so no one thinks K3 has a 128K window.
- Strategy 1's figures are 367,000 characters, 7 calls, and about 52,000 characters average. It overflowed at the fifth iteration (≈165,000 tokens). Keep characters and tokens separate.
- The book defines compression ratio as compressed / original, so smaller means more aggressive (line 1056). State the definition before quoting percentages.
- Strategy 5 is lossy content with a *lossless index*, and only "theoretically" (line 1060).
- The heading "Retrieval, Not Reasoning" repeats 2.8's point (line 1017 says "as described above"). Keep it short, add the CoT caveat (line 1024: CoT *can* count, at a repeated cost), and link to 2.8.
- The "Learning without training" citation (Dherin et al., 2025, line 1034) supports the "temporarily customized" analogy. It isn't a proof.
- Line 1046 repeats the preserved-thinking constraint from 2.4. Link to it; don't explain it again.
- Cross-references: 1.3 (contextual adaptation is temporary: the same point as line 1032), 1.5 (stretch quiz: batch-compress at thresholds), 1.4 (loop quiz: "context compression drops critical state"), 1.6 ("multi-layer context compression" in the harness code list).

---

### 2.10 Compression in Production, Sub-Agent Isolation & the Big Picture (1075–1122)

**Key concepts**
1. The five-layer production stack, "using Claude Code's approach as a reference":
   1. tool-result budget, with output stored on disk and frozen previews;
   2. direct noise deletion;
   3. API-level micro-compression, which still invalidates the cache after the removal point;
   4. archival summaries, "git log, not git squash";
   5. full compression, first trying session memory, with a circuit breaker for repeated failures.

   (lines 1077–1083)
2. Four design principles: information value is unevenly distributed, semantic integrity ("Sutskever left OpenAI in May 2024"), task relevance, and "compression is understanding" (the compressor should be close to the main model) (lines 1087–1092).
3. Context-aware compression cut token use by more than 75%. The things most easily lost are early decisions, the reasons behind constraints, and failed paths, so the agent should save progress to documents (lines 1094–1096).
4. Isolation over compression: a sub-agent explores in its own context and returns a few hundred tokens, and the main agent's KV prefix is untouched. The cost is that the task description must be self-contained (lines 1100–1104).
5. Chapter through-line: the message structure is the skeleton; a stable prefix raises cache hits; prompts, Skills, and the status bar carry rules, on-demand knowledge, and current state; compression raises information density (line 1108). This is scoped to a single task, and Chapter 3 moves to persistent memory (line 1110).

**Source figures to redraw**
- None in range.

**New diagrams**
- `IsolationVsCompression` (static). Layout: two main-agent context bars for "find the payment-callback handler". In the top bar ("search in-context"), tens of thousands of tokens of files remain as noise, marked "compress later". In the bottom bar ("delegate"), a sub-agent box with its own large context sits alongside, and the main bar gains only two messages: a task and the conclusion (`handle_callback` in `src/payment/callbacks.py`). Classes: `dg-model` (agents), `dg-context`, `dg-harness` (sub-agent boundary), `dg-guard` (noise).
- `ContextEngineeringMap` (static, chapter cheat sheet). Layout: the full request layout (system prompt | tools | trajectory (catalog, Skill bodies, deferred schemas, compressed results) | status bar at the tail), with each region labeled by technique and lesson number (2.1–2.10). A side rail notes "append-only", "freeze prefix", and "distill, don't retrieve". Classes: all the context-bearing classes: `dg-context`, `dg-tools`, `dg-harness`, `dg-model`, `dg-guard` (for the injection surfaces).

Render the five compression layers as a **table**, not a diagram.

**Code to include**
- None.

**Quiz candidates**
- **Thought Question 1** (line 1114): the sliding window causes repeated calls, and full history grows without bound. Design a strategy that loses no information, controls length, and keeps the KV prefix. Reference answer: line 57. It draws on 2.4 (Experiment 2-3), 2.9, and this lesson.
- "A main agent needs 'the function that handles payment callbacks'. What enters its context if it delegates, and what does delegation cost?" (lines 1102–1104).
- "Why does full compression need a circuit breaker?" Answer: production data shows many sessions loop on repeated compression failures (line 1083).

**Fidelity hazards**
- Line 1077: the five layers are "using Claude Code's approach as a reference", and "a mature context management system usually includes" them. That's a pattern, not a spec.
- Line 1081, API-level micro-compression: local cost is zero, but the cache after the removal point is still invalidated. Use it only near overflow. Don't call it free.
- Line 1094: ">75%" is for *context-aware* compression. Don't apply it to compression in general.
- Isolation vs 2.4's byte-alignment: an isolated sub-agent does **not** inherit the parent context, so the alignment rule (line 574) doesn't apply to it. State this to prevent an apparent contradiction.
- Sub-agents as tools and multi-agent context are deferred to Chapters 4 and 10 (line 1104). Link to **1.2** (collaboration tools: sub-agents) and **1.7** (orchestration). Don't design a multi-agent system here.
- The "Thought Questions" heading is claimed here for the checker, but its nine questions are spread across the lessons (see §2 and §4). Don't list them all again in this lesson.
- The Chapter Summary (lines 1108–1110) is a closing section, the same pattern as 1.8's "Chapter 1 cheat sheet".

---

## 3. Overlap with Chapter 1 and how to handle it

| Chapter 1 lesson | What it already teaches | Where Chapter 2 repeats it | Handling |
|---|---|---|---|
| 1.4 Context: The Working Set | The five components; static prefix vs dynamic history; `build_context` code; "system prompt carries … dynamically injected environmental state"; the quiz "reasoning can be dropped at little cost" | 2.1 (lines 47–56 mapping), 2.2 (line 378 static prefix + trajectory, Fig 2-4), 2.3 (line 528 reasoning pass-back), 2.8 (dynamic state) | 2.1 shows only the role → component mapping and links to 1.4. 2.2 presents Fig 2-4 as the *API-level* view of 1.4's split. **Two conflicts to reconcile with an Engineer's note:** (a) 2.3's reasoning pass-back vs 1.4's quiz; (b) 2.3 and 2.8's "dynamic state at the tail" vs 1.4's "in the system prompt". |
| 1.5 The ReAct Loop | The loop, the trajectory, "context = static prefix + trajectory", parallel calls, the minimal loop with `MAX_ROUNDS`, animated `TrajectoryRounds`; the stretch quiz on prompt caching (cumulative cache reads O(n²), batch compression, sub-agent isolation) | 2.2 (lines 95–370, 409–429), 2.4 (N² at line 540), 2.9–2.10 (batch compression, isolation) | 2.2 = "the same loop on the wire". It doesn't re-teach Thought/Action/Observation, uses a static `MessagesGrowth` rather than a second trajectory animation, and says why this code is SDK-real while 1.5's is pseudocode. 2.4 points out that 1.5's quiz counts *cache-read charges with caching*, while line 540 is *recompute without caching*. 2.9 and 2.10 link back to the 1.5 quiz as "now explained in full". |
| 1.2 Observation & Action Spaces, Tools | A tool definition as a JSON schema; the model decides and the developer executes; sub-agents as collaboration tools | 2.2 (lines 151 and 185), 2.6 (tool descriptions), 2.10 (sub-agents) | Link to 1.2. 2.6 goes further (description quality, deferred loading); it doesn't re-define tools. |
| 1.3 The LLM as Reasoning Engine | Contextual adaptation is fast and temporary; "Prompt or Skill" as an external artifact | 2.5 (few-shot), 2.7 (Skills), 2.9 (line 1032) | Link to 1.3 once from 2.9 and once from 2.7. |
| 1.6 Harness Engineering | The Context and Tools layer; multi-layer context compression; prompt → context engineering; "the complete API message loop is in Chapter 2" | 2.1 (line 3), 2.2 (the loop), 2.10 (the compression stack) | 2.2 delivers the promised API loop: link from 1.6's sentence. 2.10's five-layer stack expands 1.6's one-line bullet. |
| 1.7 Orchestration | `MAX_ROUNDS` as a stop condition; few-shot "internalized by instruction tuning"; the obsolescence quiz (fixed-position prompts/tools vs Skills) | 2.2 (lines 308–309), 2.5 (few-shot), 2.6–2.7 (deferred tools, Skills) | Link for stop conditions. Reconcile the few-shot point (2.5 hazard). |
| 1.8 Guardrails | Context-layer guardrails; "source labelling … covered in Chapter 2"; the progressive-disclosure and append-only patterns | 2.6 (injection), 2.7 (Skills), 2.4 (append-only) | 2.6 delivers the source-labelling content and links to 1.8 for the other layers. 2.4 and 2.7 cite 1.8's pattern table instead of re-stating it. |

**Prompt caching specifically:** it appears at a teaser level in 1.5 (quiz) and 1.8 (append-only). The one full explanation is 2.3 (intuition and rules) plus 2.4 (mechanics and the KV vs Prompt Cache distinction). 2.6, 2.7, 2.8, and 2.9 each apply the rule to their own mechanism in one or two sentences and link back to 2.4. They shouldn't re-explain it.

---

## 4. Totals

| | Count |
|---|---|
| Redrawn source figures | **17** (Fig 2-1 … 2-17) |
| New diagrams | **17** (2.1: 1, 2.2: 2, 2.3: 1, 2.4: 2, 2.5: 2, 2.6: 2, 2.7: 1, 2.8: 2, 2.9: 2, 2.10: 2). The optional `CacheBoundaryVariants` is not counted. |
| **Total diagrams** | **34** |
| Animated (StepAnimator) | **8**: Fig 2-3, Fig 2-10, Fig 2-13, `KVCacheDecodeSteps`, `PrefixChangePropagation`, `DeferredToolLoading`, `StatusReplaceVsAppend`, `CompressionTimingCache` |
| Quizzes | **35**: 2.1: 3, 2.2: 3, 2.3: 4, 2.4: 4, 2.5: 3, 2.6: 4, 2.7: 3, 2.8: 4, 2.9: 4, 2.10: 3. Every lesson is within the checker's 2–4 limit. |
| Thought Questions mapped | All 9, once each: Q1 → 2.10, Q2 → 2.3, Q3 → 2.9, Q4 → 2.8, Q5 → 2.5, Q6 → 2.9, Q7 → 2.7, Q8 → 2.7, Q9 → 2.6 |
| Figures per lesson (checker needs ≥1) | 2.1: 3 · 2.2: 5 · 2.3: 5 · 2.4: 3 · 2.5: 2 · 2.6: 2 · 2.7: 4 · 2.8: 4 · 2.9: 4 · 2.10: 2 |

**Raster and heatmap figures:**
- **Fig 2-7** (line 491, `images/fig2-7.png`) is the **only PNG**. It's a real-model attention heatmap from `attention_visualization`, and the image file isn't in `source/book-en/images/`. Redraw it as a *schematic* SVG:
  - a lower-triangular grid (about 24×24 cells) with fill opacity mapped to `--dg-context-stroke`;
  - labeled bands along the axis: system/tools | user | `<think>` | answer;
  - four callouts matching lines 496–501: a first-token **attention sink** column, the **reasoning triangle**, the **output triangle**, and **position bias** (edges vs middle).
  - The caption must say "schematic, not measured values — redrawn from Figure 2-7", because we don't have the underlying data.
  - Add a text legend so the figure doesn't rely on color alone, and give it a `<desc>` listing the four patterns.
- **Fig 2-6** (line 479) is an SVG in the source, but its lower half is a heatmap. Render it as a 4×4 lower-triangular grid using only the one given row (怎么样: 0.35 / 0.05 / 0.55 / 0.05). Show the other rows as schematic shading with a note, and print the cell values as text for accessibility.
- **Fig 2-12** carries `{height=55%}` (line 831): it's a tall figure and needs the stacked mobile variant from the Chapter 1 spec.
- Every Chapter 2 figure other than 2-7 is referenced as `.svg`, but none of the files are present locally. All are described from their alt text and the surrounding prose only.

---

## 5. Reader-credit / GitHub-issue thank-you notes

**None in Chapter 2.** I searched `source/book-en/chapter2.md` for "thank", "Issue", "reader", "pointed out", "credit", and "acknowledg", and got no credit notes. The upstream copy is byte-identical. `reference-answers.md` has none either. For contrast, the only such note in the source is in **Chapter 1**, line 242 (`[^ch1-2]: Thanks to reader asdlem … GitHub Issue #30 …`), which is already out of scope. Nothing needs omitting for Chapter 2.

---

## 6. Structural problems found

1. **The checker counts fenced pseudo-headings.** `check-lessons.mjs` filters raw lines with `/^#{2,4} /` and ignores fences. For Chapter 2, **lines 631 (`## File Operations`) and 637 (`## Network Requests`)**, both inside the ```` ```text ```` fence at 628–642, would be treated as source headings. The checker would then report them as "original section not covered", or force a lesson to claim fake sections. The single-`#` lines (262, 293, 294, 301, 307–309, and 629) don't match `#{2,4}`, so they're harmless as it stands, but they would break if the pattern were widened. **Fix:** toggle a fence flag on lines matching `/^(>\s*)?```/` (Chapter 2 has fences inside blockquotes, for example 900–906) and skip lines inside fences before matching headings.
2. **The checker is hard-coded to Chapter 1.** `LESSON_DIR = 'src/content/docs/chapter-1'`, `SOURCE = 'source/book-en/chapter1.md'`, the chapter1 URL prefix, `EXPECTED_LESSONS = 8`, and the error strings all name chapter1.md. It has to be parameterized per chapter, or loop over chapters.
3. **The file-name filter excludes lesson 10.** `/^0[1-8]-.*\.mdx$/` wouldn't match `09-…` or `10-…`. Use `/^\d{2}-.*\.mdx$/`. Two-digit prefixes sort correctly.
4. **YAML quoting.** The headings at 586, 620, and 649 contain ASCII `"`, and most contain `:`, so single-quote them in `source.sections`. Line 7 has a curly `’`. The checker's `norm()` handles it, but copy it exactly anyway.
5. **Balance.** The approved split puts 3,847 words in 2.4. The adjusted split (§0) brings every lesson between 1,579 and 3,009. Lesson 2.10 is 1,592 words, but only about 1,150 of that is lesson prose (the rest is the Thought Questions list). It's lighter, and the `ContextEngineeringMap` cheat sheet makes up for it.
6. **No math rendering.** Lines 33 and 968 use LaTeX, and the site has no remark-math or KaTeX. Render them in Unicode or as code (decided per lesson above).
7. **Inconsistent source numbers.** 150K vs 148K characters (lines 1058 and 1116). The Q8 reference answer contradicts the body's cache claims (lines 718–720 and 835). Both are handled in the lesson hazards.
