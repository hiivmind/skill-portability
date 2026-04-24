# Skill Portability

Make any plugin fully portable across all platforms. Accepts Claude, Cursor, Gemini, OpenCode, or bare SKILL.md repos as input. Emits every missing platform artifact.

## Skills

This project provides agent skills in the `skills/` directory. Skills follow the open SKILL.md standard and are auto-discovered by Copilot CLI.

## Tool Name Mapping

Skills use Claude Code tool names. Copilot CLI equivalents:

- `Read` → `view`
- `Write` → `create`
- `Edit` → `edit` / `apply_patch`
- `Bash` → `bash` / `powershell`
- `Grep` → `grep` / `rg`
- `Glob` → `glob`
- `Skill` → `skill`
- `Task` / `Agent` → subagent dispatch

See each skill's `references/copilot-tools.md` for detailed mapping.
