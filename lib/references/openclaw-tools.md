# OpenClaw Tool Mapping

Skills use Claude Code tool names. OpenClaw shares most tool names but has significant differences for agent dispatch, task tracking, and skill invocation.

| Skill references | OpenClaw equivalent |
| ---------------- | ------------------- |
| `Read` (file reading) | `Read` |
| `Write` (file creation) | `Write` |
| `Edit` (file editing) | `Edit` |
| `Bash` (run commands) | `Bash` |
| `Grep` (search file content) | `Grep` |
| `Glob` (search files by name) | `Glob` |
| `Task` (dispatch subagent) | `agents.list[]` — configured in manifest, not a tool |
| `Agent` (dispatch subagent) | `agents.list[]` — configured in manifest, not a tool |
| `TodoWrite` (task tracking) | No equivalent |
| `Skill` tool (invoke a skill) | No equivalent — skills load natively |
| `WebSearch` (web search) | `WebSearch` |
| `WebFetch` (fetch URL) | `WebFetch` |
| `AskUserQuestion` (structured input) | `AskUserQuestion` |

## No Task/Agent tool

OpenClaw does not have a Task or Agent dispatch tool. Instead, agents are
declared in the `agents.list[]` array of `openclaw.plugin.json`. Inter-agent
delegation is handled by the runtime based on manifest configuration.

Skills that use `Task` or `Agent` for subagent dispatch need their patterns
documented in AGENTS.md so OpenClaw can route via its manifest-based system.

## No TodoWrite or Skill tool

OpenClaw has no equivalent to TodoWrite (task tracking) or Skill (skill
invocation). Skills that depend on these tools should provide fallback
instructions or note the limitation.

## Key Differences from Claude Code

### Model format

OpenClaw uses `provider/model` format instead of Claude shortnames:
- `opus` → `anthropic/claude-opus-4-6`
- `sonnet` → `anthropic/claude-sonnet-4-5`
- `haiku` → `anthropic/claude-haiku-4-5`

### Frontmatter stripping

All skill and agent frontmatter must have these fields **removed**:
- `disable-model-invocation` — not supported
- `allowed-tools` — not supported

### Hooks via TypeScript SDK

OpenClaw hooks are **not file-based**. They use the TypeScript plugin SDK:
- Register handlers via `api.registerHook(eventName, handler)`
- Event names are **snake_case**: `before_tool_call`, `tool_result_persist`,
  `gateway:startup`, `session:compact:before`
- Async handlers are supported

If the source plugin has file-based hooks (e.g. Claude Code `hooks/` directory),
they must be wrapped as TypeScript handlers.

### Manifest

OpenClaw uses `openclaw.plugin.json` with required fields `id` and `configSchema`.
Full plugins also need `package.json` with `openclaw.extensions` and `openclaw.compat`.

### Distribution

- Primary: ClawHub registry (`openclaw plugins install <name>`)
- Alternative: npm publishing
- OpenClaw auto-detects Claude, Codex, and Cursor bundle layouts
