# Cross-Platform Skill Portability: Ecosystem Friction Points

This document names the structural gaps that make true plugin portability hard across today's agent platforms. The `uplifting-a-plugin` skill works around these gaps as best it can, but many of them are platform-level problems that cannot be fully solved at the plugin layer.

---

## 1. `npx skills` installs skills, not plugins

**What happens:** `npx skills add owner/repo` discovers `skills/*/SKILL.md` and installs each skill as an individual directory under `~/.agents/skills/<skillname>/`. It does not install the repo. It does not symlink. It does not copy anything outside `skills/<skillname>/`.

**What is lost:** Every piece of shared plugin infrastructure lives outside `skills/*/`:

- Plugin-level context files (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`) — not installed
- Platform manifests (`.claude-plugin/`, `gemini-extension.json`, etc.) — not installed
- Hooks — not installed
- Shared assets, templates, documentation — not installed

**The forced choice:** Plugin authors who want npx compatibility face a binary:

| Option | Cost |
|--------|------|
| Duplicate shared content into every SKILL.md | Skills bloat. Shared instructions get out of sync. Every skill is hundreds of lines longer. |
| Remove shared content and depend only on SKILL.md | Skills lose the richness that plugin-level context files provide. Platform-specific guidance, tool mappings, and session instructions are gone. |

Neither is acceptable for a rich plugin. This is the core structural gap in the npx skills ecosystem.

**What would fix it:** `npx skills add` needs a plugin-level install mode that writes shared context files into a platform-appropriate location (e.g., appending to `~/.agents/AGENTS.md`, or writing a `~/.agents/plugins/<name>/CLAUDE.md` that a harness picks up). Without this, the npx distribution model is only suitable for standalone skills, not coordinated plugin systems.

---

## 2. Platform manifests are four parallel formats for the same data

**What happens:** To register a plugin with each platform, you maintain four separate manifest files, each with its own schema:

| Platform | File | Required fields |
|----------|------|-----------------|
| Claude Code | `.claude-plugin/plugin.json` | `name`, `description`, `version`, `author`, `homepage`, `repository`, `license`, `keywords` |
| Cursor | `.cursor-plugin/plugin.json` | Same + `displayName`, `skills`, `agents`, `commands`, `hooks` |
| Gemini CLI | `gemini-extension.json` | `name`, `description`, `version`, `contextFileName` |
| OpenCode | `package.json` | `name`, `version`, `type`, `main` |

Every metadata change (new version, updated description, author email fix) must be made in four places. There is no canonical source of truth.

**What would fix it:** A single `plugin.json` standard that all platforms read, with each platform treating unknown fields as no-ops. The plugin-portability Detection Algorithm (D1–D4) is a workaround that tries to elect the most complete existing manifest as canonical — it should not need to exist.

---

## 3. Context files are three copies of similar content

**What happens:** Platforms read different files for session context:

| Platform | Context file |
|----------|-------------|
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.md` (specified in `gemini-extension.json` as `contextFileName`) |
| Codex / Copilot CLI | `AGENTS.md` |

These files serve the same purpose (load skill pointers and tool-mapping guidance into the model's context at session start) but must be authored and maintained separately. They diverge over time.

**The format divergence makes it worse:** `GEMINI.md` uses `@./path/to/file` include directives. `AGENTS.md` uses prose with bullet lists. `CLAUDE.md` is free-form prose. There is no shared syntax.

**What would fix it:** A single context file standard with include/import semantics that all platforms support. Until that exists, any plugin with rich session context must maintain three diverging copies.

---

## 4. Tool name fragmentation requires per-skill mapping tables

**What happens:** Every skill in a plugin references Claude Code tool names (`Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`, `Skill`, `Task`). Each other platform uses different names:

| Claude Code | Gemini CLI | Copilot CLI | Codex |
|-------------|------------|-------------|-------|
| `Read` | `read_file` | `view` | native |
| `Write` | `write_file` | `create` | native |
| `Edit` | `replace` | `edit` | native |
| `Bash` | `run_shell_command` | `bash` | native |
| `Task` | (no equivalent) | `task` | `spawn_agent` |

The workaround is per-skill `references/{copilot,codex,gemini}-tools.md` sidecars — mapping tables installed alongside each skill. These sidecars must live inside `skills/<skillname>/` so that npx installation includes them (see gap #1). This works, but it means every skill in every plugin carries three identical boilerplate files.

**What would fix it:** Standardised tool names across platforms, or a platform-level adapter that translates canonical names automatically. Until then, every plugin author maintains these tables, and every cross-platform skill invocation depends on the user reading the right mapping table.

---

## 5. Hook event names differ between Claude Code and Cursor

**What happens:** Claude Code and Cursor both support lifecycle hooks but use different event names:

| Claude Code | Cursor |
|-------------|--------|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userMessage` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |

A plugin with hooks must maintain two hook configuration files (`hooks/hooks.json` and `hooks/hooks-cursor.json`). Any hook command that uses `$CLAUDE_PLUGIN_ROOT` (a Claude-specific env var) is invalid in Cursor without manual editing.

Other platforms (Gemini CLI, OpenCode, Codex) have no hook mechanism at all.

**What would fix it:** A shared hook event vocabulary. Hooks are the most powerful platform extension mechanism, and their non-portability means plugin authors must choose between a rich Claude-only hook implementation and a neutered cross-platform one.

---

## 6. Gemini CLI has no subagent support

**What happens:** Claude Code skills routinely use the `Task` tool to dispatch subagents — fresh model instances with isolated context. This is foundational to skills like `subagent-driven-development` and `dispatching-parallel-agents`. Gemini CLI has no equivalent.

Skills that use subagents degrade silently in Gemini CLI: the agent either tries to execute the subagent dispatch instruction directly (which fails), or falls back to sequential single-session execution (which loses the isolation guarantees the skill was designed for).

The `gemini-tools.md` sidecar documents this limitation, but there is no runtime enforcement. A Gemini user running a skill designed for subagent parallelism will get a degraded experience with no clear error.

**What would fix it:** Gemini CLI needs a subagent/parallel-task mechanism, or skills that use subagents need a way to declare their requirements so platforms can refuse gracefully rather than degrade silently.

---

## 7. Skill invocation is not standardised

**What happens:** Every platform invokes skills differently:

| Platform | How skills are invoked |
|----------|----------------------|
| Claude Code | `Skill` tool with `skill` parameter |
| Gemini CLI | `activate_skill` tool |
| Copilot CLI | `skill` tool |
| Codex | Skills load natively — follow instructions directly |
| npx / AGENTS.md harnesses | No standard — depends on the harness |

Skills that instruct the agent to invoke other skills (e.g., `Use the superpowers:brainstorming skill`) will fail on platforms where the `Skill` tool does not exist. The `gemini-tools.md` sidecar documents the Gemini equivalent, but this only works if the user reads the sidecar before following the skill instruction.

**What would fix it:** A standardised skill invocation primitive across platforms, or a discovery mechanism so a skill can call another skill without naming a platform-specific tool.

---

## Summary: What is genuinely portable today

The honest picture of what works across platforms without hacks:

| What | Works across platforms? |
|------|------------------------|
| Skill content (SKILL.md prose and checklists) | ✅ Yes — if the skill avoids platform-specific tool names |
| Tool-mapping sidecars (references/*.md) | ✅ Yes — if installed alongside the skill |
| Platform manifests | ⚠️ Partially — each platform reads a different file; no shared standard |
| Session context (CLAUDE.md / GEMINI.md / AGENTS.md) | ❌ No — three separate files, different formats, none installed by npx |
| Hooks | ❌ No — different event names, Claude-specific env vars, most platforms have no hooks |
| Subagent dispatch (Task tool) | ❌ No — missing from Gemini CLI; different API in Codex and Copilot CLI |
| Skill invocation from within skills | ⚠️ Partially — different tool names, documented in sidecars only |

The `uplifting-a-plugin` skill generates the necessary files to make a plugin *discoverable* on each platform. It cannot close the runtime gaps listed above. Those require platform-level changes.
