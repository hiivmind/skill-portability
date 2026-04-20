# Skill Portability

Make any plugin fully portable across all platforms. Accepts Claude, Cursor, Gemini, OpenCode, or bare SKILL.md repos as input. Emits every missing platform artifact.

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

- skills/uplifting-a-plugin/SKILL.md
- skills/auditing-plugin-portability/SKILL.md

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

- `Read` → your platform's file-read tool
- `Write` → your platform's file-write tool
- `Edit` → your platform's file-edit tool
- `Bash` → your platform's shell/command tool
- `Grep` → your platform's content-search tool
- `Glob` → your platform's file-search tool
- `Skill` tool → your platform's skill-invoke tool (or follow instructions directly)
- `Task` tool → your platform's subagent-dispatch tool (if supported)

See each skill's `references/` directory for platform-specific tool mapping tables.
