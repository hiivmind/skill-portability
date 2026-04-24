# Ecosystem Landscape Rewrite

**Date:** 2026-04-24

## Problem

`docs/ecosystem-friction.md` frames the cross-platform ecosystem purely through friction — what breaks, what's missing, what can't be fixed. This is accurate but incomplete. Each platform's ecosystem tools (`npx skills`, `gh skill`, `gemini extensions install`, Codex `$skill-installer`, Cursor marketplace, npm, OpenSkills) work well for consumers and single-skill authors. The friction only appears when an author tries to deliver a cross-platform plugin with shared state (hooks, context files, multiple skills).

The doc needs to tell both stories: what works for consumers and single-skill authors, and where cross-platform plugin delivery hits real limits.

## Scope

- Rename `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`
- Rewrite the content with two-perspective treatment per section
- Update all references to the old filename (README.md, INSTALL.md, whole-repo-note template, historical specs/plans)

## What changes

### File rename

`docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md`

### Title

"Cross-Platform Skill & Plugin Ecosystem" (replacing "Cross-Platform Skill Portability: Ecosystem Friction Points")

### Structure

Replace the 7 "Gap" sections with 6 ecosystem areas. Each area covers:

1. **What the ecosystem offers** — the positive story for consumers and single-skill authors
2. **Where it breaks down for cross-platform delivery** — friction for multi-platform plugin authors
3. **What would actually fix it** — retained from original (useful for platform teams)

The 6 areas:

#### 1. Skill & Plugin Distribution

**What works:** `npx skills add owner/repo` is a one-command install for standalone skills. Works across Claude Code, Cursor, Codex, Copilot, Gemini CLI, and more. `gh skill install` (GitHub CLI v2.90.0+) provides install, search, preview, publish, and version pinning. `gemini extensions install` gives Gemini CLI users one-command GitHub-based install. Codex `$skill-installer` installs from the curated catalog by name. OpenSkills (`npm i -g openskills`) provides a universal loader across all major agents.

For a user who has a single SKILL.md with name/description frontmatter and wants to share it, this ecosystem works. Publish to GitHub, run `gh skill publish`, and consumers can `npx skills add` or `gh skill install` from anywhere.

**Where it breaks down:** `npx skills add` copies only the `skills/` directory — it doesn't install the repo. Plugins with shared hooks, context files, platform manifests, and cross-skill references lose those assets. This is the fundamental install-granularity mismatch: skills are files, plugins are repos.

**Superpowers mechanism:** Whole-repo install on every platform. `npx skills` is explicitly not used for plugins with shared state.

**What would fix it:** `npx skills` (or a successor) needs a plugin-level install mode that installs the full repo, writes shared context, and wires hooks per-platform.

#### 2. Discovery & Registries

**What works:** A growing ecosystem of registries and discovery tools:
- **skills.sh** (Vercel) — 1000+ skills, 300k+ monthly views, leaderboard, one-command installs
- **geminicli.com/extensions** — 897+ Gemini CLI extensions, browsable gallery ranked by GitHub stars
- **github.com/openai/skills** — Curated Codex skill catalog (`.curated/` and `.experimental/` folders)
- **Cursor marketplace** (cursor.com/marketplace) — Curated, manually reviewed plugin directory
- **npm** — OpenCode's distribution channel; standard publish/install flow
- **SkillsMP.com**, **Smithery.ai** — Community aggregators
- **github/awesome-copilot**, **VoltAgent/awesome-agent-skills** — Curated community collections
- **`gh skill search`** — CLI-native discovery across GitHub

For consumers, discovery is solved. Multiple registries, one-command installs, preview before install.

**Where it breaks down:** Each registry is platform-native. There is no cross-platform registry. A plugin author who wants to be discoverable on Cursor, Gemini, Codex, and Copilot must publish to each platform's registry separately — or hope consumers find their GitHub repo.

**Security note:** GitHub does not vet third-party skills. A Snyk study ("ToxicSkills", Feb 2026) found 13.4% of 3,984 skills from third-party registries carry critical security issues. Always preview before installing.

#### 3. Manifest Formats

**What works:** Consumers never see manifests. Install a plugin and the platform reads its own format. Authors targeting a single platform write one manifest and move on.

**Where it breaks down:** Six coexisting manifest files for the same metadata:
- `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`
- `.cursor-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `gemini-extension.json`
- `package.json` (OpenCode)
- `.github/copilot-instructions.md` (Copilot)

Every metadata change must be made in all files. No single source of truth.

**Superpowers mechanism:** The detection algorithm (D1–D4) elects the most complete existing manifest as canonical. The uplift skill generates all missing formats from that canonical source.

**What would fix it:** A single `plugin.json` standard that all platforms read, treating unknown fields as no-ops.

#### 4. Context Files & Session Injection

**What works:** Each platform has a reliable way to deliver context to the model at session start:
- Claude Code: `SessionStart` hook
- Cursor: `sessionStart` hook (different schema, same mechanism)
- Copilot CLI: Same hook script, detects `COPILOT_CLI` env var
- OpenCode: JS plugin `experimental.chat.messages.transform`
- Gemini CLI: `GEMINI.md` with `@`-include directives
- Codex: Passive skill auto-discovery (weakest guarantee)

For single-platform authors, context delivery is straightforward — write one file in the platform's format and it works.

**Where it breaks down:** Each platform reads a different file (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`) with different include semantics. Cross-platform plugins need parallel adapters delivering the same payload through each platform's mechanism.

**Superpowers mechanism:** Per-platform injection delivers the `using-<plugin>` skill body + the relevant tool-mapping sidecar. Context files are thin wrappers; the real payload lives in the skill directory and is pulled at runtime.

**What would fix it:** A single context file standard with include/import semantics that all platforms support.

#### 5. Hook & Event Systems

**What works:** Four platforms now support hooks with session-start injection:
- Claude Code: 27+ hook events across 11 categories
- Cursor: Matching hook system with different event name casing and schema
- Copilot CLI: Hook support with bash/powershell fields
- OpenCode: JS lifecycle hooks via plugin entry point

**Where it breaks down:** Event names differ (`SessionStart` vs `sessionStart`), output JSON schemas differ, env vars differ (`CLAUDE_PLUGIN_ROOT` vs `CURSOR_PLUGIN_ROOT`). Hook scripts that reference one platform's env var silently break on another.

**Superpowers mechanism:** Polyglot `session-start` script with env-var branching. Two parallel hook config files (`hooks.json`, `hooks-cursor.json`). Windows support via polyglot `.cmd`/bash wrapper.

**Platforms without hooks:**
- Gemini CLI: No hook system — `GEMINI.md` `@`-includes substitute (different mechanism, same effect)
- Codex: No hook system, no context file mechanism. Relies on passive skill auto-discovery. Weakest guarantee.

**What would fix it:** A shared hook event vocabulary and unified hook output format.

#### 6. Tool Names & Subagent Support

**What works:** All platforms provide file I/O, shell access, and search. The core operations are available everywhere under different names.

**Where it breaks down:** Every skill references Claude Code tool names (`Read`, `Edit`, `Bash`, `Task`). Each platform names them differently (`read_file`, `replace`, `run_shell_command`). No runtime rewriter exists — translation happens at model-time via static sidecars.

**Subagent support:**
- Claude Code: Native `Task` tool ✅
- Copilot CLI: Native `task` tool ✅
- OpenCode: `@mention`-based subagent system ✅
- Codex: `spawn_agent`/`wait`/`close_agent` gated behind config flag ⚠️
- Gemini CLI: No equivalent ❌ — skills degrade to single-session execution

**Superpowers mechanism:** Static sidecars (`references/{copilot,codex,gemini}-tools.md`) delivered alongside skills. Model does the translation at read time.

**What would fix it:** Standardised tool names across platforms, or a platform-level adapter.

### Summary table

Expand the current summary table to two columns per area:

| Area | Consumer / single-skill author | Cross-platform plugin author |
|------|-------------------------------|------------------------------|
| Distribution | ✅ One-command install via `npx skills`, `gh skill`, platform CLIs | ⚠️ `npx skills` loses shared state; whole-repo install required |
| Discovery | ✅ Multiple registries, CLI search, gallery browsing | ⚠️ No cross-platform registry; must publish to each separately |
| Manifests | ✅ Invisible to consumers; one file per platform for authors | ❌ Six parallel formats, no single source of truth |
| Context files | ✅ One file per platform, reliable delivery | ⚠️ Parallel adapters needed for cross-platform delivery |
| Hooks | ✅ Rich event systems on 4 platforms | ⚠️ Event names, schemas, env vars all differ |
| Tool names | ✅ Each platform's names work natively | ⚠️ Static sidecars + model-time translation; no runtime rewriter |
| Subagents | ✅ Available on 4/6 platforms | ❌ Gemini has none; Codex requires config flag |

### Session-start injection section

Retain the current "Core Mechanism: Session-Start Injection" section (with the injection mechanism table) but move it from the top of the doc to after the 6 areas — it's the "how superpowers addresses all of the above" synthesis, not a standalone gap.

## References to update

| File | Change |
|------|--------|
| `README.md` | Update link text and href from `ecosystem-friction.md` to `ecosystem-landscape.md` |
| `INSTALL.md` | Update link in whole-repo note |
| `lib/templates/install-docs/whole-repo-note.md` | Update link in template |
| `docs/superpowers/specs/2026-04-24-install-doc-consolidation-design.md` | Update mentions (historical, low priority) |
| `docs/superpowers/plans/2026-04-24-install-doc-consolidation.md` | Update mentions (historical, low priority) |
| `docs/superpowers/plans/2026-04-24-install-docs-correctness.md` | Update mentions (historical, low priority) |

Historical specs/plans are low priority — they document past decisions and readers can follow git history. The live references (README, INSTALL, template) are the ones that matter.

## Files changed

- Rename: `docs/ecosystem-friction.md` → `docs/ecosystem-landscape.md` (full rewrite)
- Modify: `README.md` (link update)
- Modify: `INSTALL.md` (link update)
- Modify: `lib/templates/install-docs/whole-repo-note.md` (link update)

## Files not changed

- `lib/patterns/platforms/publishing-and-discoverability.md` — complementary reference, stays as-is
- `docs/platforms/*.md` — platform-specific docs, stay as-is
- Skills — no changes to skill pseudocode
