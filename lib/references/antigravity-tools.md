# Antigravity Tool Mapping

Skills use Claude Code tool names. Antigravity uses the **same tool names** for all operations.

| Skill references | Antigravity equivalent |
| ---------------- | ---------------------- |
| `Read` (file reading) | `Read` |
| `Write` (file creation) | `Write` |
| `Edit` (file editing) | `Edit` |
| `Bash` (run commands) | `Bash` |
| `Grep` (search file content) | `Grep` |
| `Glob` (search files by name) | `Glob` |
| `Task` (dispatch subagent) | `Task` |
| `Agent` (dispatch subagent) | `Agent` |
| `TodoWrite` (task tracking) | `TodoWrite` |
| `Skill` tool (invoke a skill) | `Skill` |
| `WebSearch` (web search) | `WebSearch` |
| `WebFetch` (fetch URL) | `WebFetch` |
| `AskUserQuestion` (structured input) | `AskUserQuestion` |

## Key Differences from Claude Code

Antigravity shares all of Claude Code's tool names but diverges in these areas:

### Frontmatter stripping

All skill and agent frontmatter must have these fields **removed**:
- `model` — Antigravity does not support model selection; strip entirely
- `tools` — Antigravity does not support per-agent tool restrictions; strip entirely
- `disable-model-invocation` — not supported; strip
- `allowed-tools` — not supported; strip
- `user-invocable` — Antigravity uses Workflows for slash-command invocation, not skills; strip

### Skill discovery paths

- **Preferred**: `.agents/skills/*/SKILL.md`
- **Legacy**: `.agent/skills/*/SKILL.md` (also works but prefer plural `.agents/`)
- Standard `skills/` path is **not** auto-discovered

### Context files

- Primary: `AGENTS.md`
- `GEMINI.md` takes higher priority when both exist
- Additional: `.agent/rules/*.md` for rule-based agent bodies

### No hooks system

Antigravity has no hook system. The `hooks/` directory and hook config files
are not used. Session-start scripts in `hooks/session-start` are auto-discovered
and executed at session start without any separate config.

### Workflows

Antigravity uses `.agents/workflows/` for slash-command style workflows
(Markdown format, not TOML).
