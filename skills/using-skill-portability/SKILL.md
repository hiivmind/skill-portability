---
name: using-skill-portability
description: Use when starting a session with the skill-portability plugin. Session-start bootstrapping that lists available skills and platform-specific invocation instructions.
---

# Using Skill Portability

This plugin provides the following skills:

| Skill | Description |
|-------|-------------|
| `uplifting-a-plugin` | Add multi-platform portability to any plugin. Accepts any starting state — Claude, Cursor, Gemini, OpenCode, Copilot, Codex, or bare SKILL.md files. Detects what exists, infers canonical metadata, generates every missing platform artifact, ports hooks, produces install documentation, and optionally configures session-start bootstrapping. |
| `assessing-plugin-portability` | Assess a plugin for multi-platform portability. Classifies repo shape, scores readiness per platform using a 7-category rubric, detects structural blockers, and recommends an uplift target. Read-only — makes no changes. |

## How to Invoke Skills

**Claude Code / Cursor:** Use the `Skill` tool with the skill name.

**Copilot CLI:** Use the `skill` tool with the skill name.

**Gemini CLI:** Use the `activate_skill` tool with the skill name.

**Codex / Other:** Skills are auto-discovered. Follow the SKILL.md instructions directly.

## Tool Name Mapping

Skills use Claude Code tool names. See `lib/references/` for platform-specific equivalents.
