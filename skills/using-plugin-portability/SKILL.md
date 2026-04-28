---
name: using-plugin-portability
description: Use when starting a session with the plugin-portability plugin. Session-start bootstrapping that lists available skills and platform-specific invocation instructions.
---

# Using Skill Portability

This plugin provides the following skills:

| Skill | Description |
| ----- | ----------- |
| `plugin-portability` | Assess or uplift a plugin for multi-platform portability. Asks intent upfront (assess/uplift, platforms, uplift target), runs condition-driven scoring, and optionally generates missing artifacts. Platforms: Claude Code, Cursor, Gemini CLI, Codex, Antigravity, OpenClaw. |

## How to Invoke

**Claude Code / Cursor:** Use the `Skill` tool with skill name `plugin-portability`.

**Gemini CLI:** Use the `activate_skill` tool with skill name `plugin-portability`.

**Antigravity / OpenClaw / Codex:** Skills are auto-discovered. Follow the SKILL.md instructions directly.

## Tool Name Mapping

Skills use Claude Code tool names. See `lib/references/` for platform-specific equivalents.
