# Antigravity Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Antigravity equivalent |
| ---------------- | ---------------------- |
| `Read` (file reading) | `view_file` |
| `Write` (file creation) | `write_to_file` |
| `Edit` (file editing) | `replace_file_content` or `multi_replace_file_content` |
| `Bash` (run commands) | `run_command` |
| `Grep` (search file content) | `grep_search` |
| `Glob` (search files by name) | `find_by_name` |
| `Task` (dispatch subagent) | No general equivalent — `browser_subagent` for browser tasks only |
| `Agent` (dispatch subagent) | No general equivalent |
| `TodoWrite` (task tracking) | No equivalent |
| `Skill` tool (invoke a skill) | Skills auto-activate via semantic matching — no explicit tool |
| `WebSearch` (web search) | `search_web` |
| `WebFetch` (fetch URL) | `read_url_content` |
| `AskUserQuestion` (structured input) | No equivalent |

## Additional Antigravity tools

These tools are available in Antigravity but have no Claude Code equivalent:

| Tool | Purpose |
| ---- | ------- |
| `codebase_search` | Semantic code search (not pattern-based like grep) |
| `search_in_file` | Semantic search within a specific file |
| `view_code_item` | View specific code node/function by name |
| `view_file_outline` | Show file structure/outline |
| `view_content_chunk` | View document chunks by position |
| `list_dir` | List directory contents |
| `command_status` | Check status of background terminal commands |
| `read_terminal` | Read terminal output by process ID |
| `send_command_input` | Send stdin to running processes |
| `generate_image` | Create or edit images from text prompts |
| `list_resources` | Show available MCP server resources |
| `read_resource` | Retrieve MCP resource contents |
| `browser_subagent` | Browser automation (click, scroll, type, screenshots, recording) |

## Key Differences from Claude Code

Antigravity uses completely different tool names from Claude Code and also diverges in these areas:

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

- `AGENTS.md` has highest priority (universal standard)
- `GEMINI.md` is Antigravity-native, loaded if present
- Additional: `.agents/rules/*.md` for rule-based agent bodies

### No hooks system

Antigravity has no hook system. The `hooks/` directory and hook config files
are not used. Session-start scripts in `hooks/session-start` are auto-discovered
and executed at session start without any separate config.

### Workflows

Antigravity uses `.agents/workflows/` for slash-command style workflows
(Markdown format, not TOML).
