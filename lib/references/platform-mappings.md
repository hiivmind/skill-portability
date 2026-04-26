# Platform Mappings — Canonical Lookup Tables

> **Purpose**: Single source of truth for every cross-platform mapping used by
> the rubric engine. Rubric YAML files reference these tables via
> `LOOKUP["table_name"]["platform"]` pseudocode in their conditions and uplift
> actions.
>
> **Platforms**: Claude Code, Codex, Cursor, Gemini, Antigravity, OpenClaw.
>
> **Do not duplicate** these values elsewhere. If a rubric condition or uplift
> action needs a mapping, it must point here.

---

## Table 1: Model Mapping

Maps Claude Code model shortnames to platform equivalents.

| Claude Model | Gemini | Codex | OpenClaw | Cursor | Antigravity |
|---|---|---|---|---|---|
| opus | gemini-2.5-pro | gpt-5.4 | anthropic/claude-opus-4-6 | inherit | (removed) |
| sonnet | gemini-2.5-flash | gpt-5.4-mini | anthropic/claude-sonnet-4-5 | inherit | (removed) |
| haiku | gemini-2.0-flash-lite | gpt-5.4-mini | anthropic/claude-haiku-4-5 | inherit | (removed) |

**Rules**:
- Cursor always uses `inherit` (defers to user's model selection).
- Antigravity strips the model field entirely.
- Codex maps both sonnet and haiku to `gpt-5.4-mini`.

---

## Table 2: Tool Name Mapping

| Claude Tool | Gemini | Codex | Cursor | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| Read | read_file | (same) | (same) | (same) | (same) |
| Write | write_file | (same) | (same) | (same) | (same) |
| Edit | replace | (same) | (same) | (same) | (same) |
| Bash | run_shell_command | (same) | (same) | (same) | (same) |
| Grep | grep_search | (same) | (same) | (same) | (same) |
| Glob | list_files | (same) | (same) | (same) | (same) |
| Task | @agent-name | spawn_agent | (same) | (same) | agents.list[] |
| Agent | @agent-name | spawn_agent | (same) | (same) | agents.list[] |
| TodoWrite | (N/A) | update_plan | (same) | (same) | (N/A) |
| Skill | (N/A) | (N/A) | (same) | (same) | (N/A) |

**Rules**:
- `(same)` means platform uses same tool name as Claude Code.
- Gemini has no Task/Agent tool — uses `@agent-name` syntax in prompts.
- Codex replaces Task/Agent with `spawn_agent` and TodoWrite with `update_plan`.
- OpenClaw manages agents via `agents.list[]` in runtime config, not a tool.

---

## Table 3: Hook Event Mapping

| Claude Event | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| SessionStart | sessionStart | SessionStart | N/A | N/A | gateway:startup (plugin SDK) |
| PreToolUse | preToolUse | BeforeTool | N/A | N/A | before_tool_call (plugin SDK) |
| PostToolUse | postToolUse | AfterTool | N/A | N/A | tool_result_persist (plugin SDK) |
| PostToolUseFailure | postToolUseFailure | (N/A) | N/A | N/A | N/A |
| SubagentStart | subagentStart | (N/A) | N/A | N/A | N/A |
| SubagentStop | subagentStop | (N/A) | N/A | N/A | N/A |
| PreCompact | preCompact | PreCompress | N/A | N/A | session:compact:before (plugin SDK) |
| Stop | stop | AfterAgent | N/A | N/A | N/A |
| UserPromptSubmit | beforeSubmitPrompt | (N/A) | N/A | N/A | N/A |

**Rules**:
- Codex and Antigravity have no hook systems.
- Gemini hooks go in user `settings.json`, not repo files — generate guidance only.
- OpenClaw hooks use TypeScript plugin SDK (`api.registerHook()`), not file-based config.
- Cursor uses camelCase; Gemini uses PascalCase.

---

## Table 4: Path Variable Mapping

| Claude Variable | Cursor | Gemini | Codex | Antigravity | OpenClaw |
|---|---|---|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | `${CURSOR_PLUGIN_ROOT}` | `${extensionPath}${/}` | N/A | N/A | N/A |
| `/hooks/scripts/` | `/scripts/` | `/scripts/` | N/A | N/A | N/A |

---

## Table 5: Field Stripping Sets

| Field | Gemini | Codex | OpenClaw | Cursor | Antigravity |
|---|---|---|---|---|---|
| `disable-model-invocation` | strip | strip | strip | **keep** | strip |
| `allowed-tools` | strip | strip | strip | strip | strip |

**Rules**:
- Cursor keeps `disable-model-invocation` (supported natively).
- All platforms strip `allowed-tools` (Claude-specific).

---

## Table 6: Manifest Required Fields

| Platform | Manifest Path | Required Fields |
|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` | name, version, description, author.name, author.email |
| Cursor | `.cursor-plugin/plugin.json` | name, displayName, description, version, author |
| Gemini | `gemini-extension.json` | name, version, description, contextFileName |
| Codex (native) | `.codex-plugin/plugin.json` | name, version, description |
| Antigravity | `package.json` | name, displayName, version, description, publisher |
| OpenClaw | `openclaw.plugin.json` | id, configSchema |

**Notes**:
- Antigravity: For skill-only distribution, no `package.json` needed — drop into `.agents/skills/`.
- OpenClaw: Full plugins also need `package.json` with `openclaw.extensions` and `openclaw.compat`.
- Gemini: `contextFileName` is always `"GEMINI.md"`.

---

## Table 7: Hook Format Rules

| Rule | Claude Code | Cursor | Gemini | OpenClaw |
|---|---|---|---|---|
| Event name case | PascalCase | camelCase | PascalCase | snake_case (SDK) |
| Timeout unit | seconds | seconds | milliseconds | N/A (SDK-managed) |
| Async support | yes (optional) | no (strip) | no (strip) | yes (async handlers) |
| Structure | nested (matcher → hooks[]) | flat (matcher at hook level) | settings.json (user-configured) | `api.registerHook()` (TypeScript) |
| Output key | `hookSpecificOutput.additionalContext` | `additional_context` | N/A | return value from handler |

**Notes**: Codex and Antigravity have no hook systems — omitted from this table.

---

## Table 8: Skill Output Directory

| Platform | Skills Path | Agents Path |
|---|---|---|
| Claude Code | `skills/` | `agents/` |
| Cursor | `skills/` | `agents/` |
| Gemini | `skills/` | `agents/` |
| Codex | `.agents/skills/` | `.codex/agents/` |
| Antigravity | `.agents/skills/` (preferred) or `.agent/skills/` (legacy) | `.agent/rules/` |
| OpenClaw | `skills/` | in manifest `agents.list[]` |

---

## Table 9: Agent Output Format

| Platform | Format | Model Field | Tools Field |
|---|---|---|---|
| Claude Code | Markdown (`agents/*.md`) | Claude model name | Claude tool names |
| Cursor | Markdown (`agents/*.md`) + `.mdc` rule | `inherit` | stripped |
| Gemini | Markdown (`agents/*.md`) | Gemini model name | `["*"]` (wildcard) |
| Codex | TOML (`.codex/agents/*.toml`) | Codex model name | stripped |
| Antigravity | Combined `AGENTS.md` + `.agent/rules/*.md` | (removed) | (removed) |
| OpenClaw | Listed in manifest `agents.list[]` | OpenClaw `provider/model` | stripped |
