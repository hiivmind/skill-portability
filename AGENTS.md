# Skill Portability

Make any plugin fully portable across all platforms. Accepts Claude Code, Cursor, Gemini, Codex, Antigravity, OpenClaw, or bare SKILL.md repos as input. Emits every missing platform artifact.

## Project Context

Skill Portability is a Claude Code plugin that provides skills and commands for use across multiple AI coding platforms. Skills are defined using the open SKILL.md standard and can be invoked via each platform's native skill mechanism.

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

- skills/plugin-portability/SKILL.md

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

- `Read` → your platform's file-read tool
- `Write` → your platform's file-write tool
- `Edit` → your platform's file-edit tool
- `Bash` → your platform's shell/command tool
- `Grep` → your platform's content-search tool
- `Glob` → your platform's file-search tool
- `Skill` → your platform's skill-invoke tool
- `Task` → your platform's subagent-dispatch tool (if supported)

See `lib/references/` for platform-specific tool mapping tables:
- `codex-tools.md` — Codex (spawn_agent, update_plan, message framing)
- `gemini-tools.md` — Gemini CLI (read_file, replace, run_shell_command, etc.)
- `cursor-tools.md` — Cursor (same names, different hooks/model/context)
- `antigravity-tools.md` — Antigravity (same names, stripped frontmatter)
- `openclaw-tools.md` — OpenClaw (agents.list[], no TodoWrite/Skill, SDK hooks)

## Platform Accuracy Constraint

Every platform-specific claim in this repo must be consistent with the researched
platform reference docs. Before changing any file that makes platform-specific
claims, cross-reference:

1. **Research docs** — `docs/platforms/*.md` (sourced, with inline citations)
2. **Reconciliation matrix** — `docs/reconciliation-matrix.md` (tracks known
   discrepancies and their fix status)
3. **Canonical lookup tables** — `lib/references/platform-mappings.md` (single
   source of truth consumed by rubrics)

If you find a conflict between these sources, trust the researched platform docs
(they have citations). Update the reconciliation matrix when fixing discrepancies
or discovering new ones.
