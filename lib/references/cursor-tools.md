# Cursor Tool Mapping

Skills use Claude Code tool names. Cursor uses the **same tool names** for most operations — no renaming needed.

| Skill references | Cursor equivalent |
| ---------------- | ----------------- |
| `Read` (file reading) | `Read` |
| `Write` (file creation) | `Write` |
| `Edit` (file editing) | `Edit` |
| `Bash` (run commands) | `Bash` |
| `Grep` (search file content) | `Grep` |
| `Glob` (search files by name) | `Glob` |
| `Task` (dispatch subagent) | `Task` |
| `Agent` (dispatch subagent) | `Agent` |
| `TodoWrite` (task tracking) | `TodoWrite` |
| `Skill` tool (invoke a skill) | `Skill` — `/add-plugin` installs, skills load natively |
| `WebSearch` | `WebSearch` |
| `WebFetch` | `WebFetch` |
| `AskUserQuestion` | `AskUserQuestion` |

## Key Differences from Claude Code

Cursor shares Claude Code's tool names but diverges in these areas:

### Model handling

Cursor does not accept Claude model shortnames (`opus`, `sonnet`, `haiku`). All model references in agent and skill frontmatter must use `inherit` — Cursor defers to the user's selected model.

### Hook format

Cursor hooks go in `hooks/hooks-cursor.json` (not `hooks/hooks.json`):
- Event names are **camelCase** (`sessionStart`, `preToolUse`) not PascalCase
- **Flat structure** — no nested `hooks[]` array; each entry has `event`, `matcher`, `command` at top level
- Output key is `additional_context` (snake_case), not `hookSpecificOutput.additionalContext`
- No async hook support — strip `async: true` if present

### Subagent support

Cursor has full subagent support via the `Task` and `Agent` tools (same names as Claude Code).

**Custom agents:** Markdown files with YAML frontmatter in `.cursor/agents/` (project) or `~/.cursor/agents/` (global). Also reads `.claude/agents/` and `.codex/agents/` for compatibility.

| Field | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `name` | string | from filename | Display name and identifier |
| `description` | string | — | Shown in Task tool hints for delegation decisions |
| `model` | string | `inherit` | `fast`, `inherit`, or specific model ID |
| `readonly` | boolean | `false` | Restricts write permissions |
| `is_background` | boolean | `false` | Runs without blocking parent |

**Built-in subagents:** `explore` (codebase search), `bash` (shell commands), `browser` (MCP browser control).

**Async subagents (Cursor 2.5+):** Background mode, parallel execution (multiple Task calls in one message), nested subagents. State written to `~/.cursor/subagents/`.

### Context files

- Primary: `AGENTS.md` (not `CLAUDE.md`)
- Additional: `.cursor/rules/*.mdc` with YAML frontmatter (`description`, `alwaysApply: true`)

### Frontmatter fields

- `disable-model-invocation` is **kept** (Cursor supports it natively)
- `allowed-tools` must be **stripped** (Claude-specific)

### MCP configuration

- Cursor uses `mcp.json` (no dot prefix), not `.mcp.json`
- Cursor does not support MCP Resources — strip any `resources` blocks

### Path variables

- Hook scripts should branch on `${CURSOR_PLUGIN_ROOT}` instead of `${CLAUDE_PLUGIN_ROOT}`
