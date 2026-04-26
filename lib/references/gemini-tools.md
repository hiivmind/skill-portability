# Gemini CLI Tool Mapping

Skills use Claude Code tool names. When you encounter these in a skill, use your platform equivalent:

| Skill references | Gemini CLI equivalent |
| ---------------- | --------------------- |
| `Read` (file reading) | `read_file` |
| `Write` (file creation) | `write_file` |
| `Edit` (file editing) | `replace` |
| `Bash` (run commands) | `run_shell_command` |
| `Grep` (search file content) | `grep_search` |
| `Glob` (search files by name) | `glob` |
| `TodoWrite` (task tracking) | `write_todos` |
| `Skill` tool (invoke a skill) | `activate_skill` |
| `WebSearch` (web search) | `google_web_search` |
| `WebFetch` (fetch URL) | `web_fetch` |
| `AskUserQuestion` (structured input) | `ask_user` |
| `Task` tool (dispatch subagent) | `@agent-name` in prompt (see [Subagent dispatch](#subagent-dispatch)) |

## Subagent dispatch

Gemini CLI has full subagent support. Use `@agent-name <task>` syntax in prompts or let the agent route automatically.

| Skill references | Gemini CLI equivalent |
| ---------------- | --------------------- |
| `Task` tool (dispatch subagent) | `@agent-name` in prompt, or automatic routing |
| `Agent` tool (dispatch subagent) | `@agent-name` in prompt, or automatic routing |

### Built-in agents

- `generalist` — general-purpose with all tools
- `cli_help` — Gemini CLI features expert
- `codebase_investigator` — codebase exploration specialist

### Custom agents

Define custom agents as Markdown files with YAML frontmatter in `.gemini/agents/` (project), `~/.gemini/agents/` (user), or `agents/` in extensions.

Subagents use `complete_task` to return results to the parent agent.

## Additional Gemini CLI tools

These tools are available in Gemini CLI but have no Claude Code equivalent:

| Tool | Purpose |
| ---- | ------- |
| `read_many_files` | Read multiple files at once (triggered by `@path`) |
| `list_directory` | List files and subdirectories |
| `save_memory` | Persist facts to GEMINI.md across sessions |
| `get_internal_docs` | Access Gemini CLI's own documentation |
| `complete_task` | Subagent-only: finalize mission and return result |
| `enter_plan_mode` / `exit_plan_mode` | Switch to read-only research mode |
| `browser_agent` | Experimental web browser automation |
