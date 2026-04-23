# Cross-Platform Skill Portability: Ecosystem Friction Points

This document names the structural gaps that make true plugin portability hard across today's agent platforms, and describes how the superpowers self-bootstrapping pattern addresses (or fails to address) each one. The `uplifting-a-plugin` skill generates these mechanisms where it can.

---

## The Core Mechanism: Session-Start Injection

The central insight in the superpowers pattern is that **every platform needs the `using-superpowers` skill body delivered to the model at session start** — not installed as a file for the model to maybe discover, but injected as context before any user message is processed. The plugin ships a separate injection mechanism for each platform, since no platform agrees on how this should work:

| Platform | Injection mechanism |
|----------|-------------------|
| Claude Code | `hooks/hooks.json` → `SessionStart` → `hooks/run-hook.cmd` → `hooks/session-start` |
| Cursor | `hooks/hooks-cursor.json` → `sessionStart` → same script, different hook schema |
| Copilot CLI | Same hook script; detects `COPILOT_CLI=1` env var, emits top-level `additionalContext` |
| OpenCode | `.opencode/plugins/<name>.js` → `experimental.chat.messages.transform` prepends content to first user message |
| Gemini CLI | `GEMINI.md` with `@./skills/using-superpowers/SKILL.md` include — context files substitute for hooks |
| Codex | No hook system; relies on passive skill auto-discovery. Weakest guarantee. |

This parallel-adapters approach is not elegant, but it works. Every platform except Codex gets guaranteed session-start delivery.

---

## Gap 1: Shared context files are not installed by `npx skills`

**Status: Worked around by not using `npx skills` for whole-plugin installation.**

`npx skills add owner/repo` installs individual skill directories — it does not install the repo. For a plugin like superpowers, this would mean losing hooks, context files, platform manifests, and the `references/` sidecars that live in each skill directory but depend on the full repo being present for the hook scripts to read them.

**The superpowers answer:** Every supported install path is a whole-repo install:
- Claude Code: plugin marketplace or git install — full repo under `${CLAUDE_PLUGIN_ROOT}`
- Cursor: `.cursor-plugin/plugin.json` points to repo-relative paths — full repo required
- Gemini CLI: git clone + `gemini-extension.json` — full repo tree required for `@`-includes to resolve
- OpenCode: `opencode.json` pulls `git+https://...` via Bun — full repo installed
- Codex: `git clone` + symlink `~/.agents/skills/superpowers` → the full `skills/` dir

`npx skills` single-skill install mode is explicitly unsupported for this plugin. The `.codex/INSTALL.md` and `.opencode/INSTALL.md` each document the correct install path.

**What this means for plugin authors:** If your plugin has shared context, hooks, or cross-skill tooling, `npx skills` is the wrong distribution mechanism. You need to give each platform a whole-repo install path. The `uplifting-a-plugin` skill generates the per-platform manifests that make this possible — but cannot make `npx skills` installable for rich plugins.

**What would actually fix this:** `npx skills` needs a plugin-level install mode that can write shared context to a platform-appropriate location (e.g., appending to `~/.agents/AGENTS.md` or writing a plugin context file a harness reads at session start). Until then, `npx` is only suitable for standalone skills with no shared state.

---

## Gap 2: Platform manifests are four parallel formats for the same data

**Status: Addressed by shipping all formats in parallel.**

The repo carries six coexisting manifest files, each in the format its platform requires:
- `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`
- `.cursor-plugin/plugin.json` (with explicit `skills`, `agents`, `commands`, `hooks` fields — Claude auto-discovers these; Cursor does not)
- `gemini-extension.json`
- `package.json` (for OpenCode)
- `.codex/INSTALL.md` (Codex has no manifest system — symlink-based discovery)

Every metadata change must be made in all files. There is no single source of truth. The `uplifting-a-plugin` skill's Detection Algorithm (D1–D4) is a workaround for the input side of this problem — it elects the most complete existing manifest as canonical so you don't have to pick one. But there is no output-side solution: the files stay separate.

**What would actually fix this:** A single `plugin.json` standard that all platforms read, treating unknown fields as no-ops.

---

## Gap 3: Session context files are three parallel formats

**Status: Partially addressed — per-platform injection substitutes for a unified format.**

Each platform reads a different file for session context:

| Platform | Context file / mechanism |
|----------|--------------------------|
| Claude Code | Injected by `SessionStart` hook — no context file read at startup |
| Cursor | Same hook, different event name schema |
| Gemini CLI | `GEMINI.md` with `@`-includes, filename declared in `gemini-extension.json` |
| Codex / Copilot | `AGENTS.md` — a separate file from `CLAUDE.md` (in superpowers, `AGENTS.md` is a symlink to `CLAUDE.md`) |
| OpenCode | JS plugin prepends content to first user message |

The superpowers `CLAUDE.md` is contributor guidelines for AI agents opening PRs — it does not reference `using-superpowers` at all, because the hook does that work. `GEMINI.md` is just two `@`-include lines. `AGENTS.md` is a symlink to `CLAUDE.md`.

The shared content (`using-superpowers/SKILL.md` + the relevant tool-mapping sidecar) is delivered per-platform by the injection mechanism, not by a unified context file. The per-platform context files are thin wrappers or stubs — the real payload lives in the skill directory and is pulled at runtime.

**What would actually fix this:** A single context file standard with include/import semantics that all platforms support. Until that exists, the parallel-adapters approach is the best available option.

---

## Gap 4: Tool name fragmentation requires per-skill mapping tables

**Status: Addressed via static sidecars + model-time translation. No runtime rewriter exists.**

Every skill references Claude Code tool names. Each platform gets a mapping sidecar (`references/{codex,copilot,gemini}-tools.md`) delivered alongside the skill.

Delivery varies by platform:
- **Gemini:** `GEMINI.md` has `@./skills/using-superpowers/references/gemini-tools.md` — auto-included every session
- **OpenCode:** The JS plugin appends an inline tool-mapping block to the first user message — hardcoded in the plugin JS, not read from the sidecar file
- **Codex / Copilot:** The `using-superpowers` skill instructs the model to "see `references/...`" — passive, depends on the model following the instruction

The model does the translation at read time. Skills still say `Task`; Gemini users get told up front that `Task` has no equivalent and to fall back to `executing-plans`. Some capabilities have no mapping at all (Gemini subagents, Copilot `WebSearch`, Copilot plan mode) — the sidecars document these as capability gaps, not workarounds.

**What would actually fix this:** Standardised tool names across platforms, or a platform-level adapter that translates canonical names. This is a platform-layer problem; skill authors cannot solve it.

---

## Gap 5: Hook event names and env vars differ between Claude Code and Cursor

**Status: Addressed via parallel hook config files + polyglot hook script with env-var branching.**

The hook script (`hooks/session-start`) outputs different JSON depending on which env var is set:
- `CURSOR_PLUGIN_ROOT` → `{"additional_context": "..."}` (snake_case, Cursor's schema)
- `CLAUDE_PLUGIN_ROOT` and not `COPILOT_CLI` → `{"hookSpecificOutput": {"hookEventName":"SessionStart","additionalContext":"..."}}` (Claude Code's schema)
- `COPILOT_CLI=1` or unknown → `{"additionalContext": "..."}` (SDK standard, top-level)

Two separate hook config files handle the different event name schemas:
- `hooks/hooks.json` → `SessionStart` with matcher `startup|clear|compact`
- `hooks/hooks-cursor.json` → `sessionStart` (lowercase), different JSON structure

Windows support is via `hooks/run-hook.cmd` — a polyglot script valid as both CMD batch and bash. On Windows, CMD tries `Git\bin\bash.exe` then falls through to `where bash`; if no bash is found, it exits 0 silently (plugin still loads, just without session-start injection). On Unix, the CMD portion is swallowed by a heredoc and bash executes directly.

**Hook commands using `$CLAUDE_PLUGIN_ROOT`** are not valid in Cursor — Cursor sets `CURSOR_PLUGIN_ROOT` instead. Any plugin with hook scripts that reference `$CLAUDE_PLUGIN_ROOT` directly (rather than detecting the env var) will silently break on Cursor. The `uplifting-a-plugin` skill flags these in its report.

**What would actually fix this:** A shared hook event vocabulary and unified hook output format.

---

## Gap 6: Most platforms lack hook or subagent support

**Status: Mixed — hooks are covered for all major platforms; subagents remain a genuine capability gap on Gemini.**

**Session-start hooks:**
- Claude Code: `SessionStart` hook. ✅
- Cursor: `sessionStart` hook (different schema, same mechanism). ✅
- Copilot CLI: `SessionStart` hook with `COPILOT_CLI` env var detection. ✅
- OpenCode: `experimental.chat.messages.transform` JS hook in the plugin entry. ✅
- Gemini CLI: No hook system — context files with `@`-includes substitute. ✅ (different mechanism, same effect)
- Codex: No hook system, no context file mechanism. Relies on passive skill auto-discovery. ⚠️ (weaker guarantee — model may or may not invoke `using-superpowers`)

**Subagents:**
- Claude Code: Native `Task` tool. ✅
- Copilot CLI: Native `task` tool. ✅
- OpenCode: `@mention`-based subagent system. ✅
- Codex: `spawn_agent`/`wait`/`close_agent` gated behind `[features] multi_agent = true` in config; named-agent dispatch (e.g., `superpowers:code-reviewer`) requires a prompt-template workaround since Codex has no plugin-level `agents` field. ⚠️
- Cursor: Not documented in sidecars — unclear.
- Gemini CLI: **No equivalent.** Skills that use subagents degrade to single-session `executing-plans`. ❌ Cannot be fixed at the plugin layer.

---

## Gap 7: Skill invocation is not standardised

**Status: Addressed via the `using-superpowers` skill body, which includes per-platform invocation instructions.**

The `using-superpowers` SKILL.md explicitly documents how skills are invoked on each platform:

> **In Claude Code:** Use the `Skill` tool.
> **In Copilot CLI:** Use the `skill` tool.
> **In Gemini CLI:** Skills activate via the `activate_skill` tool.
> **In other environments:** Check your platform's documentation.

Because this content is injected at session start (before any other message), the model knows the correct invocation mechanism before it encounters a skill that calls another skill. It's a documentation fix delivered programmatically, not a protocol fix.

---

## What the Superpowers Pattern Actually Is

The self-bootstrapping pattern is **six parallel delivery mechanisms for one payload** (the `using-superpowers` skill body + the platform's tool-mapping sidecar), plus six parallel manifest formats for platform discovery. Each platform gets its own adapter because there is no shared standard. The adapters are:

1. Claude Code + Cursor + Copilot: shared `session-start` bash script + polyglot `.cmd` wrapper, env-var-branched output format, two separate hook config files
2. OpenCode: JS plugin with `experimental.chat.messages.transform` hook
3. Gemini: `GEMINI.md` `@`-include pointing at the skill file and its Gemini sidecar
4. Codex: passive — no forced injection, relying on skill auto-discovery

This is not elegant. But it works on five of six platforms with a strong guarantee (forced session-start injection), and on the sixth (Codex) with a weaker one (passive discovery).

---

## Summary: Gap Status After Superpowers Pattern

| Gap | Status | Mechanism |
|-----|--------|-----------|
| npx installs skills, not plugins | ✅ Avoided | Whole-repo install on every platform; npx not used |
| Four parallel manifest formats | ⚠️ Lived with | All formats shipped in parallel; no unified standard |
| Three parallel context file formats | ✅ Bypassed | Per-platform injection delivers content directly; context files are stubs |
| Tool name fragmentation | ⚠️ Documented, not fixed | Static sidecars + model-time translation; no runtime rewriter |
| Hook event name fragmentation | ✅ Addressed | Parallel hook configs + polyglot script + env-var-branched output |
| Gemini has no subagents | ❌ Unfixable at plugin layer | Documented; skills degrade to single-session execution |
| Codex has no hook system | ⚠️ Partial | Passive skill auto-discovery; no forced injection |
| Codex has no plugin `agents` field | ⚠️ Workaround | Prompt-template workaround documented in `codex-tools.md` |
| Skill invocation not standardised | ✅ Addressed | Per-platform instructions injected at session start via `using-superpowers` |
| Windows hook support | ✅ Addressed | Polyglot `.cmd` / bash script with graceful fallback (exit 0 if no bash) |

The `uplifting-a-plugin` skill generates the manifests, hook configs, context files, and tool-mapping sidecars that this pattern requires. The remaining unfixable gaps (Gemini subagents, Codex hook injection, the fundamental lack of a unified manifest standard) require platform-level changes.
