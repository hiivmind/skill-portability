# Gemini CLI Platform Reference

> Google's open-source AI agent for the terminal. Repository: [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli).
> Extensions announced October 2025 ([blog.google](https://blog.google/technology/developers/gemini-cli-extensions/)).
> This document targets Gemini CLI v0.28+ (April 2026).

---

## 1. Plugin Structure

Gemini CLI calls its plugin unit an **extension**. An extension is a directory containing a `gemini-extension.json` manifest at its root ([reference](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)).

### Canonical directory layout

```
my-extension/
  gemini-extension.json        # required manifest
  GEMINI.md                    # context file (auto-loaded if present)
  skills/                      # agent skills (SKILL.md per skill)
    code-reviewer/
      SKILL.md
      scripts/
      references/
      assets/
  agents/                      # subagent definitions (.md with YAML frontmatter)
    frontend-specialist.md
  commands/                    # custom slash commands (.toml)
    deploy.toml
    gcs/
      sync.toml                # becomes /gcs:sync
  policies/                    # policy engine rules (.toml)
    security.toml
  hooks/                       # hook scripts and hooks.json
    hooks.json
  themes/                      # custom themes
  src/                         # TypeScript source for MCP servers
  dist/                        # compiled JS output
  package.json                 # Node.js project metadata
```

[Source: best-practices.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/best-practices.md), [writing-extensions.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md)

### Deployment shapes

An extension can bundle **any combination** of: MCP servers, context files, custom commands, skills, subagents, policies, hooks, and themes. No single component is required beyond the manifest ([blog.google](https://blog.google/technology/developers/gemini-cli-extensions/)).

### Required vs optional files

| File | Required | Notes |
|------|----------|-------|
| `gemini-extension.json` | **Yes** | Must be in directory root. Name field must match directory name exactly ([best-practices.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/best-practices.md)) |
| `GEMINI.md` | No | Auto-loaded if present; can be customized via `contextFileName` |
| `package.json` | No | Needed only for Node.js/TypeScript extensions |
| `skills/` | No | Auto-discovered |
| `commands/` | No | Auto-discovered |
| `policies/` | No | Auto-discovered |
| `hooks/` | No | Default hooks directory; customizable via `hooksDir` |

### Custom directory names

Extensions can override default `hooks/` and `skills/` paths using `hooksDir` and `skillsDir` manifest fields. Paths are validated to prevent escaping the extension root ([PR #25008](https://github.com/google-gemini/gemini-cli/pull/25008)).

---

## 2. Manifest

The manifest file is `gemini-extension.json`, located at the extension root ([reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)).

### Full schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | **Yes** | Unique identifier. Must match directory name exactly. Lowercase, numbers, dashes |
| `version` | `string` | **Yes** | Semver string |
| `description` | `string` | No | Shown in gallery and `/extensions list` |
| `contextFileName` | `string` | No | Context file to load. Default: `GEMINI.md` if present ([writing-extensions.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md)) |
| `mcpServers` | `object` | No | Map of server name to MCP server config. All options except `trust` supported ([reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)) |
| `excludeTools` | `string[]` | No | Tools to exclude. Supports command-specific restrictions: `"run_shell_command(rm -rf)"` |
| `settings` | `array` | No | Structured user settings. Each: `{ name, description, envVar, sensitive? }`. Sensitive values stored in system keychain ([engineering.fyi](https://www.engineering.fyi/article/making-gemini-cli-extensions-easier-to-use)) |
| `plan` | `object` | No | `{ directory: string }` for planning artifacts. Fallback if user has no plan dir configured ([PR #20354](https://github.com/google-gemini/gemini-cli/pull/20354)) |
| `migratedTo` | `string` | No | URL pointing to new location if extension has moved |
| `hooksDir` | `string` | No | Custom relative path for hooks directory (default: `hooks/`) ([PR #25008](https://github.com/google-gemini/gemini-cli/pull/25008)) |
| `skillsDir` | `string` | No | Custom relative path for skills directory (default: `skills/`) ([PR #25008](https://github.com/google-gemini/gemini-cli/pull/25008)) |

### Variable substitution

Variables are expanded in `gemini-extension.json` string values ([reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)):

| Variable | Description |
|----------|-------------|
| `${extensionPath}` | Absolute path to extension install directory. Does not unwrap symlinks |
| `${workspacePath}` | Absolute path to current workspace |
| `${/}` or `${pathSeparator}` | OS-specific path separator |

### Example manifest

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My awesome extension",
  "contextFileName": "GEMINI.md",
  "settings": [
    {
      "name": "API Key",
      "description": "The API key for the service.",
      "envVar": "MY_SERVICE_API_KEY",
      "sensitive": true
    }
  ],
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"],
      "cwd": "${extensionPath}"
    }
  },
  "excludeTools": ["run_shell_command(rm -rf)"],
  "plan": {
    "directory": ".gemini/plans"
  }
}
```

[Source: getting-started-extensions](https://google-gemini.github.io/gemini-cli/docs/extensions/getting-started-extensions.html)

---

## 3. Skills

Gemini CLI has a native skills system based on the open **SKILL.md** standard. Skills provide specialized procedural expertise loaded on demand via the `activate_skill` tool ([geminicli.com/docs/cli/skills](https://geminicli.com/docs/cli/skills/)).

### Skill structure

A skill is a directory containing a `SKILL.md` file at its root ([geminicli.com/docs/cli/creating-skills](https://geminicli.com/docs/cli/creating-skills/)):

```
my-skill/
  SKILL.md           # required: instructions and metadata
  scripts/           # optional: executable scripts
  references/        # optional: static documentation
  assets/            # optional: templates and other resources
```

### SKILL.md frontmatter

```yaml
---
name: code-reviewer
description: >
  Use this skill to review code. It supports both local changes
  and remote Pull Requests.
---

# Instructions

(Markdown body with detailed procedural instructions)
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | **Yes** | Unique identifier. Should match directory name |
| `description` | **Yes** | When and why to use the skill. Used by the agent for activation routing |

[Source: creating-skills](https://geminicli.com/docs/cli/creating-skills/)

### Skill discovery

Gemini CLI discovers skills from three tiers ([geminicli.com/docs/cli/skills](https://geminicli.com/docs/cli/skills/)):

| Tier | Paths | Notes |
|------|-------|-------|
| Workspace | `.gemini/skills/`, `.agents/skills/` | Committed to version control, shared with team |
| User | `~/.gemini/skills/`, `~/.agents/skills/` | Personal skills across all workspaces |
| Extension | `skills/` (or custom `skillsDir`) in installed extensions | Bundled with extensions |

Within the same tier, `.agents/skills/` takes precedence over `.gemini/skills/` ([PR #18151](https://github.com/google-gemini/gemini-cli/pull/18151)). This alias provides cross-platform agent tool compatibility.

### Skill lifecycle

1. **Discovery**: At startup, Gemini CLI scans all skill directories. Only `name` and `description` from frontmatter are injected into the system prompt.
2. **Activation**: When the agent determines a task matches a skill, it calls `activate_skill(name="skill-name")`. The full SKILL.md body and associated resources are loaded.
3. **Execution**: The agent's behavior is guided by the skill's instructions. Skills can grant access to task-specific tools and scripts.
4. **Deactivation**: The skill remains active until the task completes or the session ends.

[Source: activate-skill tool docs](https://geminicli.com/docs/tools/activate-skill/)

### The `activate_skill` tool

- **Name**: `activate_skill`
- **Arguments**: `name` (enum, required) -- the skill name
- **Agent-only**: Cannot be invoked manually by the user; the agent decides when to activate
- **Dynamic capability**: Activating a skill can grant new task-specific tools

[Source: geminicli.com/docs/tools/activate-skill](https://geminicli.com/docs/tools/activate-skill/)

### Skill management CLI

```bash
# List all discovered skills
gemini skills list [--all]
/skills list              # in interactive mode

# Install from Git repo, local dir, or .skill archive
gemini skills install <source> [--scope user|workspace] [--path <subdir>]

# Link skills from local directory (symlink)
gemini skills link /path/to/skills-repo [--scope workspace]

# Uninstall
gemini skills uninstall <name> [--scope user|workspace]

# Enable/disable
/skills enable <name>
/skills disable <name>
```

[Source: PR #16377](https://github.com/google-gemini/gemini-cli/pull/16377), [skills.md](https://geminicli.com/docs/cli/skills/)

### Built-in skills

Gemini CLI ships with a built-in `skill-creator` skill that assists in generating new skills via AI-guided scaffolding ([PR #16394](https://github.com/google-gemini/gemini-cli/pull/16394)).

---

## 4. Context Files

`GEMINI.md` is the primary context file. It provides instructional context to the Gemini model, loaded into every prompt ([geminicli.com/docs/cli/gemini-md](https://geminicli.com/docs/cli/gemini-md/)).

### Hierarchical loading order

The CLI concatenates context from multiple locations, sent with every prompt ([geminicli.com/docs/cli/gemini-md](https://geminicli.com/docs/cli/gemini-md/)):

| Priority | Location | Scope |
|----------|----------|-------|
| 1 (lowest) | `~/.gemini/GEMINI.md` | Global -- all projects |
| 2 | CWD and parent dirs up to `.git` boundary | Project root and ancestors |
| 3 | Subdirectories below CWD | Component/module-specific (respects `.gitignore`, `.geminiignore`) |
| 4 (highest) | JIT discovery when tools access new directories | Discovered on demand during execution |

Content from more-specific files supplements or overrides more-general files. Inspect with `/memory show`.

### `@` include resolution

GEMINI.md supports file import directives using `@` syntax ([github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)):

```markdown
@./components/instructions.md
@../shared/style-guide.md
@/absolute/path/to/file.md
```

Behavior:
- Relative paths resolved from the GEMINI.md file's location
- Recursive imports supported (imported files can import others)
- Circular import prevention built in
- Import depth limit: 5 levels
- `@` inside code blocks is ignored
- Path validation prevents traversal outside project tree

The `@` symbol in interactive prompts triggers the `read_many_files` tool for file content inclusion ([tools reference](https://www.geminicli.com/docs/reference/tools/)).

### Configurable filename

The default `GEMINI.md` can be changed or extended via `settings.json` ([configuration.md](https://geminicli.com/docs/reference/configuration/)):

```json
{
  "context": {
    "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
  }
}
```

### Context configuration options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `context.fileName` | `string \| string[]` | `undefined` (falls back to `GEMINI.md`) | Context file name(s) |
| `context.includeDirectoryTree` | `boolean` | -- | Include CWD tree in initial request |
| `context.discoveryMaxDirs` | `number` | 200 | Max dirs to scan for context files |
| `context.memoryBoundaryMarkers` | `string[]` | `[".git"]` | Stops upward traversal at these markers |
| `context.includeDirectories` | `string[]` | `[]` | Additional dirs to include |
| `context.loadMemoryFromIncludeDirectories` | `boolean` | `false` | Scan include dirs on `/memory reload` |
| `context.fileFiltering.respectGitIgnore` | `boolean` | `true` | Respect `.gitignore` |
| `context.fileFiltering.respectGeminiIgnore` | `boolean` | `true` | Respect `.geminiignore` |
| `context.fileFiltering.enableRecursiveFileSearch` | `boolean` | `true` | Recursive `@` file search |
| `context.fileFiltering.customIgnoreFilePaths` | `string[]` | `[]` | Additional ignore files |

[Source: configuration reference](https://geminicli.com/docs/reference/configuration/)

### Extension context delivery

Extensions provide context via their `contextFileName` manifest field. If omitted but a `GEMINI.md` file exists in the extension root, it is loaded automatically ([writing-extensions.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md)).

### Memory commands

| Command | Action |
|---------|--------|
| `/memory show` | Display full concatenated context |
| `/memory reload` (or `/memory refresh`) | Re-scan and reload all context files |
| `/memory add <text>` | Append to `~/.gemini/GEMINI.md` |

---

## 5. Hooks

Gemini CLI has a comprehensive hook system with 11 event types. Hooks are configured in `settings.json` and execute shell commands synchronously before/after agent actions ([geminicli.com/docs/hooks](https://geminicli.com/docs/hooks/)).

### Hook events

| Event | Fires When | Capabilities |
|-------|-----------|--------------|
| `SessionStart` | Session or `/clear` start | Advisory |
| `SessionEnd` | CLI exit or `/clear` | Advisory (best-effort) |
| `BeforeAgent` | Before agent turn | Block turn |
| `AfterAgent` | After agent completes turn | Block/retry turn |
| `BeforeModel` | Before LLM request | Block request |
| `AfterModel` | After LLM response (per chunk) | Block/redact responses |
| `BeforeToolSelection` | Before LLM selects tools | Filter available tools |
| `BeforeTool` | Before a tool executes | Block tool / rewrite args |
| `AfterTool` | After a tool executes | Block result / add context / tail tool calls |
| `PreCompress` | Before context compression | Advisory (save state) |
| `Notification` | System notification | Advisory (forward to alerts, logging) |

[Source: hooks reference](https://geminicli.com/docs/hooks/reference/), [types.ts](https://github.com/google-gemini/gemini-cli/blob/07ab16db/packages/core/src/hooks/types.ts)

Event names use **PascalCase** (e.g., `BeforeTool`, `AfterTool`). This matches Claude Code's casing convention.

### Configuration format

Hooks are defined in `settings.json` under the `hooks` object ([hooks reference](https://geminicli.com/docs/hooks/reference/)):

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace",
        "sequential": true,
        "hooks": [
          {
            "name": "security-check",
            "type": "command",
            "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/security.sh",
            "timeout": 5000,
            "description": "Prevent committing secrets"
          }
        ]
      }
    ]
  }
}
```

### Hook definition fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `matcher` | `string` | No | Regex for tool events, exact string for lifecycle events. `"*"` or `""` matches all |
| `sequential` | `boolean` | No | If `true`, hooks in group run sequentially |
| `hooks` | `array` | Yes | Array of hook configurations |

### Individual hook fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `string` | Yes | Execution engine. Currently only `"command"` |
| `command` | `string` | Yes* | Shell command to execute (*required when type is command) |
| `name` | `string` | No | Friendly name for logs and CLI commands |
| `timeout` | `number` | No | Timeout in ms (default: 60000) |
| `description` | `string` | No | Brief explanation of purpose |

### Hook I/O protocol

- **Input**: JSON on stdin with `session_id`, `cwd`, `hook_event_name`, `tool_name`, `tool_input`, `tool_response`, `mcp_context`
- **Exit 0**: Success. CLI parses stdout for JSON decisions
- **Exit 2**: System block. `stderr` used as reason
- **Output fields**: `decision` (`"deny"`/`"block"`), `reason`, `continue` (`false` to kill agent loop), `hookSpecificOutput`

### AfterTool tail calls

`AfterTool` hooks can return `hookSpecificOutput.tailToolCallRequest` to chain another tool execution immediately. The tail call result replaces the original tool response ([PR #18486](https://github.com/google-gemini/gemini-cli/pull/18486)).

### Extension hooks

Extensions can bundle hooks in a `hooks/hooks.json` file (or custom `hooksDir`). There is an open proposal to allow hooks directly in `gemini-extension.json` ([Issue #25630](https://github.com/google-gemini/gemini-cli/issues/25630), closed as duplicate of #19969).

### Hook loading precedence

Project `.gemini/settings.json` > User `~/.gemini/settings.json` > System > Extensions. Hooks from all sources are merged ([hooks best practices](https://geminicli.com/docs/hooks/best-practices/)).

---

## 6. Tool Mapping

Gemini CLI has 17+ built-in tools. The table below maps every known tool to its Claude Code equivalent ([tools reference](https://www.geminicli.com/docs/reference/tools/), [tool-names.ts](https://github.com/google-gemini/gemini-cli/blob/07ab16db/packages/core/src/tools/tool-names.ts)).

### File system tools

| Gemini CLI Tool | Kind | Claude Code Equivalent | Notes |
|-----------------|------|----------------------|-------|
| `read_file` | Read | `Read` | Supports text, images, audio, PDF. Takes `absolute_path`, optional `start_line`/`end_line` |
| `read_many_files` | Read | Multiple `Read` calls | Triggered by `@` in prompt. Concatenates multiple files |
| `list_directory` | Read | `Bash` with `ls` | Lists files and subdirectories |
| `write_file` | Edit | `Write` | Creates or overwrites. Requires confirmation |
| `replace` | Edit | `Edit` | Precise text replacement. Requires confirmation |
| `glob` | Search | `Glob` | Finds files matching glob patterns |
| `grep_search` | Search | `Grep` | Regex search in file contents. Legacy alias: `search_file_content` |

### Execution tools

| Gemini CLI Tool | Kind | Claude Code Equivalent | Notes |
|-----------------|------|----------------------|-------|
| `run_shell_command` | Execute | `Bash` | Supports interactive pty, background processes. Requires confirmation. `!` prompt shortcut |

### Web tools

| Gemini CLI Tool | Kind | Claude Code Equivalent | Notes |
|-----------------|------|----------------------|-------|
| `google_web_search` | Search | `WebSearch` | Google Search via Gemini API. Returns summary with citations |
| `web_fetch` | Fetch | `WebFetch` | Retrieves URL content. Can access localhost (security note) |

### Agent/planning tools

| Gemini CLI Tool | Kind | Claude Code Equivalent | Notes |
|-----------------|------|----------------------|-------|
| `activate_skill` | Other | `Skill` | Loads skill procedural expertise. Agent-only (not user-invocable) |
| `write_todos` | Other | `TodoWrite` | Maintains internal subtask list. Progress shown via Ctrl+T |
| `ask_user` | Communicate | N/A (inline) | Requests clarification via interactive dialog |
| `save_memory` | Think | N/A | Persists facts to GEMINI.md |
| `get_internal_docs` | Think | N/A | Accesses Gemini CLI's own documentation |
| `complete_task` | Other | N/A | Subagent-only: finalizes mission and returns result to parent |
| `enter_plan_mode` | Other | N/A | Enters plan mode |
| `exit_plan_mode` | Other | N/A | Exits plan mode |
| `browser_agent` | Other | N/A | Experimental: web browser automation via accessibility tree |

### Prompt shortcuts

| Shortcut | Triggers Tool | Example |
|----------|--------------|---------|
| `@path` | `read_many_files` | `@./src/main.ts` |
| `!command` | `run_shell_command` | `!git status` |

[Source: tools reference](https://www.geminicli.com/docs/reference/tools/)

---

## 7. Install and Distribution

### Installation methods

```bash
# From GitHub repository (requires git)
gemini extensions install https://github.com/user/my-extension

# From specific ref (branch, tag, commit)
gemini extensions install https://github.com/user/my-extension --ref v2.0.0

# From local path
gemini extensions install /path/to/local/extension

# With auto-update enabled
gemini extensions install <source> --auto-update

# Skip settings prompts
gemini extensions install <source> --skip-settings

# Pre-release versions
gemini extensions install <source> --pre-release
```

[Source: reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)

### Scopes

| Scope | Path | Behavior |
|-------|------|----------|
| User (default) | `~/.gemini/extensions/<name>/` | Available across all projects |
| Workspace | `.gemini/extensions/<name>/` | Project-specific |

Extensions can be enabled/disabled per scope without uninstalling:

```bash
gemini extensions enable <name> [--scope workspace]
gemini extensions disable <name>
```

### Management commands

| Command | Description |
|---------|-------------|
| `gemini extensions install <source>` | Install from GitHub or local path |
| `gemini extensions uninstall <name>` | Remove extension |
| `gemini extensions update [name]` | Pull latest version |
| `gemini extensions list` | List installed extensions |
| `gemini extensions enable <name>` | Enable extension |
| `gemini extensions disable <name>` | Disable extension |
| `gemini extensions new <path> [template]` | Scaffold new extension from template |
| `gemini extensions link <path>` | Symlink for local development |
| `gemini extensions config <name>` | Configure extension settings |
| `/extensions list` | List extensions in interactive mode |

Note: Management commands (install, uninstall, update) are **not** available in interactive CLI mode. Use your terminal ([reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)).

### Local development

Use `gemini extensions link <path>` to create a symlink from the extensions directory to your development path. Changes are reflected immediately without reinstalling ([writing-extensions.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md)).

### Extensions gallery

The gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) indexes **908+ extensions** (as of April 2026). There is no manual submission process:

1. Host your extension in a **public GitHub repository**
2. Add the `gemini-cli-extension` topic to the repository's About section
3. Ensure `gemini-extension.json` is at the repository root
4. The crawler indexes tagged repositories daily; listing appears within ~1 week

[Source: releasing.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/releasing.md), [GitHub Discussions #12875](https://github.com/google-gemini/gemini-cli/discussions/12875)

### Release methods

1. **Git repository** (simplest): Users install directly via repo URL
2. **GitHub Releases**: Ship platform-specific archives (tar.gz/zip). Supports `darwin`, `linux`, `win32` with architecture variants

[Source: extension-releasing](https://geminicli.com/docs/extensions/extension-releasing/)

### Official extensions

Google maintains extensions under the [gemini-cli-extensions](https://github.com/gemini-cli-extensions) GitHub organization, including: `workspace` (Google Workspace), `security`, `code-review`, `conductor`, `oracle-db`, and others.

---

## 8. Runtime Components

### Subagents

Gemini CLI has full subagent support. Agents are defined as Markdown files with YAML frontmatter ([geminicli.com/docs/core/subagents](https://geminicli.com/docs/core/subagents/)).

**Built-in subagents**:
- `generalist` -- general-purpose with all tools
- `cli_help` -- Gemini CLI features expert
- `codebase_investigator` -- codebase exploration specialist
- `browser_agent` -- experimental web browser automation (disabled by default)

**Custom agent definition** (`.gemini/agents/my-agent.md`):

```yaml
---
name: frontend-specialist
description: Expert frontend developer for React/TypeScript
kind: local
tools:
  - read_file
  - write_file
  - run_shell_command
model: gemini-3-preview
temperature: 0.7
max_turns: 30
timeout_mins: 10
---

You are a frontend specialist...
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Unique slug |
| `description` | `string` | Yes | Routing description |
| `kind` | `string` | No | `local` (default) or `remote` |
| `tools` | `string[]` | No | Tool allowlist. `*` = all, `mcp_*` = all MCP |
| `mcpServers` | `object` | No | Isolated MCP servers for this agent |
| `model` | `string` | No | Model override |
| `temperature` | `number` | No | 0.0-2.0 |
| `max_turns` | `number` | No | Default: 30 |
| `timeout_mins` | `number` | No | Default: 10 |

Discovery: `.gemini/agents/` (project), `~/.gemini/agents/` (user), `agents/` in extensions.

Invocation: `@agent-name <task>` in prompt, or automatic routing. Supports parallel subagents. Frontmatter is mandatory.

Agent management: `/agents` interactive command or `agents.overrides` in `settings.json`.

### Policy engine

Fine-grained control over tool execution via declarative rules ([geminicli.com/docs/reference/policy-engine](https://geminicli.com/docs/reference/policy-engine/)):

```toml
[[rules]]
name = "Block destructive commands"
toolName = "run_shell_command"
commandPrefix = "rm -rf"
decision = "deny"
priority = 100
```

**Priority tiers** (highest wins):

| Tier | Base Priority | Description |
|------|--------------|-------------|
| Default | 1 | Built-in policies |
| Extension | 2 | Extension-contributed policies |
| Workspace | 3 | Project `.gemini/policies/` (currently disabled) |
| User | 4 | User `~/.gemini/policies/` |
| Admin | 5 | Enterprise administrator |

**Decisions**: `allow`, `deny`, `ask_user`.

**Extension restrictions**: Extensions cannot set `allow` decisions or contribute rules for `yolo` mode ([PR #20049](https://github.com/google-gemini/gemini-cli/pull/20049)).

**Approval modes**: Rules can be scoped to operational modes: `yolo`, `autoEdit`, `plan`.

**Subagent-scoped rules**: Add `subagent = "agent-name"` to restrict a rule to a specific agent ([subagents docs](https://geminicli.com/docs/core/subagents/)).

### Custom slash commands

TOML-based reusable prompts ([custom-commands.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md)):

```toml
# commands/deploy.toml -> /deploy
description = "Deploy to production"
prompt = """
Deploy the application with: {{args}}
Build output: !{npm run build}
Config: @{./deploy.config.json}
"""
```

**Features**:
- `{{args}}` -- argument substitution
- `!{command}` -- shell command execution, output injected into prompt
- `@{path}` -- file content injection

**Locations**: `~/.gemini/commands/` (global), `.gemini/commands/` (project), `commands/` in extensions.

**Naming**: Directory structure maps to colon-separated names: `commands/gcs/sync.toml` becomes `/gcs:sync`.

**Conflict resolution**: User > Project > Extension. Conflicting extension commands get prefixed with extension name: `/gcp.deploy` ([reference.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md)).

**MCP Prompts**: MCP server prompts are also exposed as slash commands automatically ([Google Cloud Blog](https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands)).

### MCP server support

Full MCP (Model Context Protocol) support for custom tool integrations. Configured in `gemini-extension.json` for extensions or `~/.gemini/settings.json` globally ([github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)):

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"],
      "cwd": "${extensionPath}",
      "env": { "API_KEY": "..." }
    }
  }
}
```

- All MCP config options supported except `trust` for extension-bundled servers
- `@server-name` syntax for addressing specific MCP servers in prompts
- Subagents can define their own isolated `mcpServers`

### Sandboxing

Gemini CLI supports Docker-based sandboxing. All tools (including MCP servers) must be available within the sandbox. Configure via `tools.sandbox` in `settings.json`.

### Model configuration

```json
{
  "model": {
    "name": "gemini-2.5-pro",
    "maxSessionTurns": 10,
    "compressionThreshold": 0.3,
    "summarizeToolOutput": {
      "run_shell_command": { "tokenBudget": 100 }
    }
  }
}
```

### Plan mode

Gemini CLI has a dedicated plan mode for multi-step task planning. Extensions can provide default plan directories via the `plan.directory` manifest field ([PR #20354](https://github.com/google-gemini/gemini-cli/pull/20354)). Tools: `enter_plan_mode`, `exit_plan_mode`.

### IDE integration

Gemini CLI has a VS Code companion extension ("Gemini CLI Companion") available on VS Code Marketplace and Open VSX Registry. It is also available via the ACP Agent Registry for supporting IDEs ([IDE integration docs](https://www.geminicli.com/docs/ide-integration)).

---

## 9. Sources

### Official documentation
- [Gemini CLI extensions overview](https://geminicli.com/docs/extensions/) -- main extensions docs
- [Extension reference (manifest, CLI commands)](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md) -- manifest schema and CLI commands
- [Writing extensions guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md) -- step-by-step authoring
- [Getting started with extensions](https://google-gemini.github.io/gemini-cli/docs/extensions/getting-started-extensions.html) -- tutorial
- [Best practices](https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/best-practices.md) -- security, structure, distribution
- [Extension releasing](https://geminicli.com/docs/extensions/extension-releasing/) -- release and gallery listing
- [GEMINI.md context files](https://geminicli.com/docs/cli/gemini-md/) -- hierarchical context system
- [Configuration reference](https://geminicli.com/docs/reference/configuration/) -- all settings.json options
- [Tools reference](https://www.geminicli.com/docs/reference/tools/) -- complete tool listing
- [Hooks overview](https://geminicli.com/docs/hooks/) -- hook events and configuration
- [Hooks reference](https://geminicli.com/docs/hooks/reference/) -- detailed I/O schemas
- [Hooks best practices](https://geminicli.com/docs/hooks/best-practices/) -- performance and security
- [Agent Skills overview](https://geminicli.com/docs/cli/skills/) -- skill discovery and management
- [Creating Agent Skills](https://geminicli.com/docs/cli/creating-skills/) -- authoring guide
- [Skills tutorial](https://www.geminicli.com/docs/cli/tutorials/skills-getting-started/) -- hands-on walkthrough
- [activate_skill tool](https://geminicli.com/docs/tools/activate-skill/) -- tool reference
- [write_todos tool](https://geminicli.com/docs/tools/todos/) -- todo management tool
- [Shell tool (run_shell_command)](https://geminicli.com/docs/tools/shell/) -- shell execution
- [Custom commands](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md) -- TOML command format
- [Subagents](https://geminicli.com/docs/core/subagents/) -- subagent system
- [Policy engine](https://geminicli.com/docs/reference/policy-engine/) -- policy rules and tiers
- [IDE integration](https://www.geminicli.com/docs/ide-integration) -- VS Code companion
- [Memory management tutorial](https://geminicli.com/docs/cli/tutorials/memory-management/) -- context and memory

### GitHub repository
- [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) -- main repository
- [gemini-cli-extensions organization](https://github.com/gemini-cli-extensions) -- official extensions
- [tool-names.ts](https://github.com/google-gemini/gemini-cli/blob/07ab16db/packages/core/src/tools/tool-names.ts) -- canonical tool name definitions
- [hooks/types.ts](https://github.com/google-gemini/gemini-cli/blob/07ab16db/packages/core/src/hooks/types.ts) -- hook event enum
- [PR #25008: Custom hooksDir/skillsDir](https://github.com/google-gemini/gemini-cli/pull/25008)
- [PR #18151: .agents/skills alias](https://github.com/google-gemini/gemini-cli/pull/18151)
- [PR #18486: AfterTool tail calls](https://github.com/google-gemini/gemini-cli/pull/18486)
- [PR #20354: Plan directory in manifest](https://github.com/google-gemini/gemini-cli/pull/20354)
- [PR #20049: Extension policy engine](https://github.com/google-gemini/gemini-cli/pull/20049)
- [PR #16377: Skill install/uninstall](https://github.com/google-gemini/gemini-cli/pull/16377)
- [PR #16394: skill-creator built-in](https://github.com/google-gemini/gemini-cli/pull/16394)
- [PR #4703: Extension custom commands](https://github.com/google-gemini/gemini-cli/pull/4703)
- [Issue #25630: Hooks in manifest](https://github.com/google-gemini/gemini-cli/issues/25630)
- [Discussion #12875: Gallery publishing](https://github.com/google-gemini/gemini-cli/discussions/12875)

### Blog posts and articles
- [Gemini CLI extensions announcement (blog.google)](https://blog.google/technology/developers/gemini-cli-extensions/)
- [Making extensions easier to use (engineering.fyi)](https://www.engineering.fyi/article/making-gemini-cli-extensions-easier-to-use)
- [Custom slash commands (Google Cloud Blog)](https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands)
- [Hooks announcement (Google Developers Blog)](https://developers.googleblog.com/tailor-gemini-cli-to-your-workflow-with-hooks/)
- [Extensions gallery](https://geminicli.com/extensions/)
