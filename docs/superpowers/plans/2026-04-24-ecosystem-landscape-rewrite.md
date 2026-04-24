# Ecosystem Landscape Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `docs/ecosystem-friction.md` as `docs/ecosystem-landscape.md` with balanced two-perspective coverage (consumer/single-skill author vs. cross-platform plugin author), and update all references.

**Architecture:** Git-rename the old file to preserve history, then rewrite its content with 6 ecosystem areas (each covering what works, where it breaks down, and how skill-portability solves it). Update live references in README.md, INSTALL.md, and the whole-repo-note template.

**Tech Stack:** Markdown

---

### Task 1: Rename the file and commit

**Files:**
- Rename: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`

- [ ] **Step 1: Git-rename the file**

```bash
git mv docs/ecosystem-friction.md docs/ecosystem-landscape.md
```

- [ ] **Step 2: Commit the rename**

```bash
git add docs/ecosystem-landscape.md
git commit -m "refactor: rename ecosystem-friction.md to ecosystem-landscape.md"
```

---

### Task 2: Rewrite the document content

**Files:**
- Modify: `docs/ecosystem-landscape.md` (full rewrite)

- [ ] **Step 1: Replace the entire file with the new content**

Write the following to `docs/ecosystem-landscape.md`:

````markdown
# Cross-Platform Skill & Plugin Ecosystem

The agent skills ecosystem is thriving — multiple platforms, growing registries, one-command installs. For consumers installing skills and for authors publishing standalone skills, the tooling works well. The friction appears when an author needs to deliver a cross-platform plugin with shared resources and patterns (hooks, context files, platform manifests, cross-skill references).

This document maps both sides: what works today, and where cross-platform plugin delivery hits real limits. The `uplifting-a-plugin` skill generates the cross-platform artifacts where it can. For what cannot be fixed at the plugin layer, platform-level changes are needed.

---

## At a Glance

| Area | Consumer / single-skill author | Cross-platform plugin author |
|------|-------------------------------|------------------------------|
| Distribution | ✅ One-command install via `npx skills`, `gh skill`, platform CLIs | ⚠️ `npx skills` loses shared resources; whole-repo install required |
| Discovery | ✅ Multiple registries, CLI search, gallery browsing | ⚠️ No cross-platform registry; must publish to each separately |
| Manifests | ✅ Invisible to consumers; one file per platform for authors | ❌ Six parallel formats, no single source of truth |
| Context files | ✅ One file per platform, reliable delivery | ⚠️ Parallel adapters needed for cross-platform delivery |
| Hooks | ✅ Rich event systems on 4 platforms | ⚠️ Event names, schemas, env vars all differ |
| Tool names | ✅ Each platform's names work natively | ⚠️ Static sidecars + model-time translation; no runtime rewriter |
| Subagents | ✅ Available on 4/6 platforms | ❌ Gemini has none; Codex requires config flag |

---

## 1. Skill & Plugin Distribution

### What works

The ecosystem has converged on a shared skill format (`SKILL.md` with YAML frontmatter) and multiple install tools that consume it:

- **`npx skills`** (Vercel Labs) — One-command install for standalone skills. `npx skills add owner/repo` copies the skill into your agent's config directory. Works across Claude Code, Cursor, Codex, Copilot, Gemini CLI, and more. For a user who has a single SKILL.md with name/description frontmatter and wants to share it, this is the simplest path: publish to GitHub, and consumers install with one command.

- **`gh skill`** (GitHub CLI v2.90.0+) — Install, search, preview, publish, and version-pin skills from any GitHub repository. `gh skill publish` validates against the Agent Skills specification. `gh skill install owner/repo` installs by repo. `gh skill search <keyword>` discovers across GitHub.

- **`gemini extensions install`** — One-command GitHub-based install for Gemini CLI extensions. Supports version pinning via `--ref`.

- **Codex `$skill-installer`** — Built-in skill that installs from the curated catalog by name or from GitHub by URL.

- **OpenSkills** (`npm i -g openskills`) — Universal loader that brings Anthropic's skills system to every major agent. Installs from local paths or git repos.

- **Cursor marketplace** — Browse and install plugins at `cursor.com/marketplace` or via `/add-plugin owner/repo` in chat.

- **npm** — OpenCode's distribution channel. Add a package name to `opencode.json` and Bun auto-installs at startup.

For a single-skill author, the publish-and-install flow works today. Write a SKILL.md, push to GitHub, and any consumer on any platform can install it.

### Where it breaks down

`npx skills add` copies only the `skills/` directory — it does not install the repo. Plugins with shared hooks, context files, platform manifests, and cross-skill references lose those assets when installed this way. This is the fundamental install-granularity mismatch: **skills are files, plugins are repos.**

Each platform's native install tool (`gh skill install`, `gemini extensions install`, Codex `$skill-installer`) also installs at skill granularity, not plugin granularity. Only Cursor's marketplace and Claude Code's plugin system install the full repo.

### How skill-portability solves this

Whole-repo install on every platform. The uplift skill generates per-platform manifests and install docs that give each platform a full-repo install path:
- Claude Code: plugin marketplace or `--plugin-dir` — full repo under `${CLAUDE_PLUGIN_ROOT}`
- Cursor: `.cursor-plugin/plugin.json` points to repo-relative paths — full repo required
- Gemini CLI: git clone + `gemini-extension.json` — full repo tree required for `@`-includes to resolve
- OpenCode: `opencode.json` pulls `git+https://...` via Bun — full repo installed
- Codex: `git clone` + symlink `~/.agents/skills/<name>` → the full `skills/` dir
- Copilot CLI: `git clone` — skills auto-discovered from `skills/` directory

`npx skills` is explicitly not used for plugins with shared resources. For standalone skills without shared resources, `npx skills` remains the recommended distribution path.

### What would actually fix this

`npx skills` (or a successor) needs a plugin-level install mode that installs the full repo, writes shared context to a platform-appropriate location, and wires hooks per-platform.

---

## 2. Discovery & Registries

### What works

A growing ecosystem of registries and discovery tools means consumers can find skills easily:

- **skills.sh** (Vercel) — 1,000+ skills, 300k+ monthly views, leaderboard, one-command installs. The largest cross-platform skill directory.
- **geminicli.com/extensions** — 897+ Gemini CLI extensions, browsable gallery ranked by GitHub stars. Copy-to-clipboard install commands.
- **github.com/openai/skills** — Curated Codex skill catalog with `.curated/` (vetted) and `.experimental/` (community) folders.
- **Cursor marketplace** (cursor.com/marketplace) — Curated, manually reviewed plugin directory. 30+ partner plugins from Atlassian, Datadog, GitLab, and others.
- **npm** — OpenCode's distribution channel. Standard publish/discover/install flow.
- **`gh skill search`** — CLI-native discovery across all GitHub repositories.
- **SkillsMP.com**, **Smithery.ai** — Community aggregators.
- **github/awesome-copilot**, **VoltAgent/awesome-agent-skills** — Curated community collections (1,000+ skills).

For consumers, discovery is solved. Multiple registries with different curation models, one-command installs, preview-before-install on platforms that support it.

### Where it breaks down

Each registry is platform-native. There is no cross-platform registry. A plugin author who wants to be discoverable on Cursor, Gemini, Codex, and Copilot must publish to each platform's registry separately — or rely on consumers finding their GitHub repo directly.

### Security note

GitHub and most registries do not vet third-party skills. A Snyk study ("ToxicSkills", Feb 2026) found that 13.4% of 3,984 skills from third-party registries carry critical security issues including prompt injections, hidden instructions, and malicious scripts. Always run `gh skill preview` or inspect skill content before installing.

---

## 3. Manifest Formats

### What works

Consumers never see manifests — install a plugin and the platform reads its own format automatically. Authors targeting a single platform write one manifest and move on. Each platform's manifest format is well-documented and stable:

- Claude Code: `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`
- Cursor: `.cursor-plugin/plugin.json` (with explicit `skills`, `agents`, `commands`, `hooks` fields)
- Codex: `.codex-plugin/plugin.json`
- Gemini CLI: `gemini-extension.json`
- OpenCode: `package.json`
- Copilot CLI: `.github/copilot-instructions.md`

### Where it breaks down

Six coexisting manifest files for the same metadata. Every metadata change — name, version, description, author — must be made in all files. There is no single source of truth.

Cursor requires explicit `skills`, `agents`, `commands`, and `hooks` fields that Claude Code auto-discovers. Gemini requires skill declarations with `description` and `executionInstructions`. OpenCode uses npm's `package.json` conventions. The formats overlap enough to be frustrating but differ enough that no simple transform covers all cases.

### How skill-portability solves this

The detection algorithm (D1–D4) scans all existing manifests, elects the most complete one as canonical, and builds a unified metadata model. The uplift skill then generates every missing manifest from that canonical source — so authors maintain one, and the tool generates the rest.

### What would actually fix this

A single `plugin.json` standard that all platforms read, treating unknown fields as no-ops.

---

## 4. Context Files & Session Injection

### What works

Each platform has a reliable way to deliver context to the model at session start:

| Platform | Mechanism | Reliability |
|----------|-----------|-------------|
| Claude Code | `SessionStart` hook | ✅ Guaranteed |
| Cursor | `sessionStart` hook (different schema) | ✅ Guaranteed |
| Copilot CLI | Same hook script, detects `COPILOT_CLI` env var | ✅ Guaranteed |
| OpenCode | JS plugin `experimental.chat.messages.transform` | ✅ Guaranteed |
| Gemini CLI | `GEMINI.md` with `@`-include directives | ✅ Guaranteed |
| Codex | Passive skill auto-discovery | ⚠️ Weak — model may or may not invoke the skill |

For single-platform authors, context delivery is straightforward. Write one context file in the platform's format and it works.

### Where it breaks down

Each platform reads a different file with different semantics:
- Claude Code: `CLAUDE.md` (contributor guidelines, not skill injection — hooks handle that)
- Gemini CLI: `GEMINI.md` with `@`-include syntax
- Codex / Copilot: `AGENTS.md`
- OpenCode: JS plugin prepends to first user message

Cross-platform plugins need parallel adapters delivering the same payload through each platform's mechanism. The context files become thin wrappers or stubs — the real payload lives in the skill directory and is pulled at runtime.

### How skill-portability solves this

The uplift skill generates a `using-<plugin>` bootstrapping skill that contains the shared payload. Per-platform injection mechanisms deliver this skill body + the relevant tool-mapping sidecar at session start. The context files (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`) are generated as platform-appropriate wrappers.

### What would actually fix this

A single context file standard with include/import semantics that all platforms support.

---

## 5. Hook & Event Systems

### What works

Four platforms now support hooks with session-start injection, giving plugins reliable lifecycle event handling:

- **Claude Code:** 27+ hook events across 11 categories (Session, Turn, Tool, File, Config, Subagent, Task, Worktree, Context, Input, Other). Rich `matcher` field for filtering.
- **Cursor:** Matching hook system with events covering session lifecycle, tool execution, and file operations.
- **Copilot CLI:** Hook support with separate `bash` and `powershell` command fields. 30-second timeout.
- **OpenCode:** JS lifecycle hooks via plugin entry point, including `experimental.chat.messages.transform` for session-start injection.

### Where it breaks down

Event names differ (`SessionStart` vs `sessionStart`), output JSON schemas differ, and env vars differ (`CLAUDE_PLUGIN_ROOT` vs `CURSOR_PLUGIN_ROOT`). A hook script that references one platform's env var will silently break on another.

Specific divergences:
- Claude Code outputs `{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "..."}}` (nested)
- Cursor expects `{"additional_context": "..."}` (flat, snake_case)
- Copilot CLI expects `{"additionalContext": "..."}` (flat, camelCase)

**Platforms without hooks:**
- **Gemini CLI:** No hook system. `GEMINI.md` `@`-includes substitute for session-start injection (different mechanism, same effect).
- **Codex:** No hook system, no context file mechanism. Relies on passive skill auto-discovery — the weakest guarantee in the ecosystem.

### How skill-portability solves this

Polyglot `session-start` script with env-var branching outputs the correct JSON format for whichever platform is running. Two parallel hook config files (`hooks.json` for Claude Code, `hooks-cursor.json` for Cursor) handle different event name schemas. Windows support via a polyglot `.cmd`/bash wrapper that tries `Git\bin\bash.exe`, falls through to `where bash`, and exits 0 silently if no bash is found.

The uplift skill flags hook scripts that reference `$CLAUDE_PLUGIN_ROOT` directly (rather than detecting the env var), since these will silently break on Cursor.

### What would actually fix this

A shared hook event vocabulary and unified hook output format across all platforms.

---

## 6. Tool Names & Subagent Support

### What works

All platforms provide the core operations: file I/O, shell access, and search. Skills work on every platform — the operations exist, just under different names.

| Operation | Claude Code | Cursor | Copilot CLI | Codex | Gemini CLI | OpenCode |
|-----------|------------|--------|-------------|-------|------------|----------|
| Read file | `Read` | `Read` | `view` | `read_file` | `read_file` | `read` |
| Write file | `Write` | `Write` | `create` | `write_file` | `write_new_file` | `write` |
| Edit file | `Edit` | `Edit` | `edit` | `apply_diff` | `replace` | `edit` |
| Run shell | `Bash` | `Bash` | `bash` | `shell` | `run_shell_command` | `bash` |

### Where it breaks down

Every skill references Claude Code tool names. No runtime rewriter exists — translation happens at model-time via static sidecars. The model reads a mapping table and mentally substitutes tool names as it works. This works surprisingly well in practice, but it's fragile: if the model ignores or forgets the mapping, it calls a tool that doesn't exist on that platform.

Some capabilities have no mapping at all:
- Gemini CLI has no `WebSearch` equivalent
- Copilot CLI has no plan mode
- Gemini CLI has no subagent support

### Subagent support

Subagent dispatch — the ability to spawn isolated agents for parallel work — varies significantly:

| Platform | Subagent support | Mechanism |
|----------|-----------------|-----------|
| Claude Code | ✅ Native | `Task` tool (formerly `Agent`) |
| Copilot CLI | ✅ Native | `task` tool |
| OpenCode | ✅ Native | `@mention`-based dispatch |
| Codex | ⚠️ Gated | `spawn_agent`/`wait`/`close_agent`; requires `[features] multi_agent = true` in config |
| Cursor | ⚠️ Unclear | Not documented in sidecars |
| Gemini CLI | ❌ None | Skills using subagents degrade to single-session `executing-plans` |

### How skill-portability solves this

Static sidecars (`references/{copilot,codex,gemini}-tools.md`) are delivered alongside skills via session-start injection. Each sidecar maps Claude Code tool names to the platform's equivalents and documents capability gaps. The model does the translation at read time.

Skills that use subagents include fallback instructions: on Gemini CLI, use `executing-plans` instead of `subagent-driven-development`.

### What would actually fix this

Standardised tool names across platforms, or a platform-level adapter that translates canonical names. This is a platform-layer problem — skill authors cannot solve it.

---

## How skill-portability Addresses All of the Above

The self-bootstrapping pattern at the core of cross-platform plugins is **six parallel delivery mechanisms for one payload** (the `using-<plugin>` skill body + the platform's tool-mapping sidecar), plus six parallel manifest formats for platform discovery. Each platform gets its own adapter because there is no shared standard:

| Platform | Injection mechanism |
|----------|-------------------|
| Claude Code | `hooks/hooks.json` → `SessionStart` → `hooks/run-hook.cmd` → `hooks/session-start` |
| Cursor | `hooks/hooks-cursor.json` → `sessionStart` → same script, different hook schema |
| Copilot CLI | Same hook script; detects `COPILOT_CLI=1` env var, emits top-level `additionalContext` |
| OpenCode | `.opencode/plugins/<name>.js` → `experimental.chat.messages.transform` prepends content to first user message |
| Gemini CLI | `GEMINI.md` with `@./skills/using-<plugin>/SKILL.md` include — context files substitute for hooks |
| Codex | No hook system; relies on passive skill auto-discovery. Weakest guarantee. |

This parallel-adapters approach is not elegant. But it works on five of six platforms with a strong guarantee (forced session-start injection), and on the sixth (Codex) with a weaker one (passive discovery).

The `uplifting-a-plugin` skill generates the manifests, hook configs, context files, tool-mapping sidecars, and install documentation that this pattern requires. The remaining unfixable gaps (Gemini subagents, Codex hook injection, the fundamental lack of a unified manifest standard) require platform-level changes.

---

## Remaining Platform-Level Gaps

| Gap | Status | Mechanism |
|-----|--------|-----------|
| `npx skills` installs skills, not plugins | ✅ Avoided | Whole-repo install on every platform; `npx skills` used only for standalone skills |
| Six parallel manifest formats | ⚠️ Lived with | All formats generated from canonical source; no unified standard exists |
| Parallel context file formats | ✅ Bypassed | Per-platform injection delivers content directly; context files are thin wrappers |
| Tool name fragmentation | ⚠️ Documented, not fixed | Static sidecars + model-time translation; no runtime rewriter |
| Hook event name fragmentation | ✅ Addressed | Parallel hook configs + polyglot script + env-var-branched output |
| Gemini has no subagents | ❌ Unfixable at plugin layer | Documented; skills degrade to single-session execution |
| Codex has no hook system | ⚠️ Partial | Passive skill auto-discovery; no forced injection |
| Skill invocation not standardised | ✅ Addressed | Per-platform instructions injected at session start via `using-<plugin>` |
| Windows hook support | ✅ Addressed | Polyglot `.cmd` / bash script with graceful fallback |
````

- [ ] **Step 2: Verify the file reads correctly**

```bash
wc -l docs/ecosystem-landscape.md
```

Expected: approximately 220-240 lines.

- [ ] **Step 3: Commit**

```bash
git add docs/ecosystem-landscape.md
git commit -m "docs: rewrite ecosystem-landscape.md with balanced two-perspective coverage

Restructured from 7 friction-focused 'Gap' sections into 6 ecosystem areas,
each covering what works for consumers/single-skill authors alongside where
cross-platform plugin delivery hits limits and how skill-portability solves it."
```

---

### Task 3: Update live references to the renamed file

**Files:**
- Modify: `README.md:38-40`
- Modify: `INSTALL.md:9-10`
- Modify: `lib/templates/install-docs/whole-repo-note.md:7-8`

- [ ] **Step 1: Update README.md**

In `README.md`, find:

```markdown
## Known ecosystem gaps

Cross-platform portability has real structural limits in today's agent platforms: `npx skills` installs individual skill directories rather than whole plugins (losing shared context files), each platform uses different manifest formats and context file names, tool names differ across platforms, and most platforms lack hook or subagent support. The `uplifting-a-plugin` skill generates everything that *can* be generated. For what cannot be fixed at the plugin layer, see [`docs/ecosystem-friction.md`](docs/ecosystem-friction.md).
```

Replace with:

```markdown
## Ecosystem landscape

Cross-platform portability has real structural limits — but the ecosystem is maturing fast. For consumers and single-skill authors, tools like `npx skills`, `gh skill`, and platform-native CLIs make distribution easy. The friction appears when delivering cross-platform plugins with shared resources (hooks, manifests, context files). The `uplifting-a-plugin` skill generates everything that *can* be generated. For the full picture — what works, what doesn't, and what needs platform-level changes — see [`docs/ecosystem-landscape.md`](docs/ecosystem-landscape.md).
```

- [ ] **Step 2: Update INSTALL.md**

In `INSTALL.md`, find:

```markdown
[docs/ecosystem-friction.md](docs/ecosystem-friction.md) for background on why this is
necessary across today's agent platforms.
```

Replace with:

```markdown
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.
```

- [ ] **Step 3: Update whole-repo-note template**

In `lib/templates/install-docs/whole-repo-note.md`, find:

```markdown
[docs/ecosystem-friction.md](docs/ecosystem-friction.md) for background on why this is
necessary across today's agent platforms.
```

Replace with:

```markdown
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.
```

- [ ] **Step 4: Commit**

```bash
git add README.md INSTALL.md lib/templates/install-docs/whole-repo-note.md
git commit -m "refactor: update all ecosystem-friction.md references to ecosystem-landscape.md"
```

---

### Task 4: Update historical specs and plans (low priority)

**Files:**
- Modify: `docs/superpowers/specs/2026-04-24-install-doc-consolidation-design.md`
- Modify: `docs/superpowers/plans/2026-04-24-install-doc-consolidation.md`
- Modify: `docs/superpowers/plans/2026-04-24-install-docs-correctness.md`

- [ ] **Step 1: Update install-doc-consolidation spec**

In `docs/superpowers/specs/2026-04-24-install-doc-consolidation-design.md`, replace all occurrences of `ecosystem-friction.md` with `ecosystem-landscape.md`.

Three occurrences:
- Line 12: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`
- Line 22: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`
- Line 32: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`

- [ ] **Step 2: Update install-doc-consolidation plan**

In `docs/superpowers/plans/2026-04-24-install-doc-consolidation.md`, replace all occurrences of `ecosystem-friction.md` with `ecosystem-landscape.md`.

Two occurrences:
- Line 161: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`
- Line 196: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`

- [ ] **Step 3: Update install-docs-correctness plan**

In `docs/superpowers/plans/2026-04-24-install-docs-correctness.md`, replace all occurrences of `ecosystem-friction.md` with `ecosystem-landscape.md`.

One occurrence:
- Line 63: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-24-install-doc-consolidation-design.md \
        docs/superpowers/plans/2026-04-24-install-doc-consolidation.md \
        docs/superpowers/plans/2026-04-24-install-docs-correctness.md
git commit -m "docs: update historical specs/plans with ecosystem-landscape.md filename"
```
