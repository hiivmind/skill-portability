# Cursor Platform Reference

> Cursor 2.5+ plugin system. Plugins package rules, skills, agents, commands, MCP servers, and hooks into distributable bundles for the Cursor IDE. Cursor is a VS Code fork with integrated AI agent capabilities.
>
> Last updated: 2026-04-26

---

## 1. Plugin Structure

### Canonical directory layout

```
my-plugin/
├── .cursor-plugin/
│   └── plugin.json            # Required: plugin manifest
├── rules/                     # Cursor rules (.mdc or .md files)
│   ├── coding-standards.mdc
│   └── review-checklist.mdc
├── skills/                    # Agent skills (SKILL.md per subdirectory)
│   └── code-reviewer/
│       └── SKILL.md
├── agents/                    # Custom agent/subagent definitions (.md)
│   └── security-reviewer.md
├── commands/                  # Agent-executable commands (.md, .mdc, .txt)
│   └── deploy.md
├── hooks/                     # Hook definitions
│   └── hooks.json
├── mcp.json                   # MCP server definitions
├── assets/                    # Logos and static assets
│   └── logo.svg
├── scripts/                   # Hook and utility scripts
│   └── format-code.py
└── README.md
```

[source](https://cursor.com/docs/reference/plugins)

### Deployment shapes

| Shape | Description |
|-------|-------------|
| **Single-plugin repo** | One `.cursor-plugin/plugin.json` at repo root. Components auto-discovered from default directories. |
| **Multi-plugin repo** | `.cursor-plugin/marketplace.json` at repo root listing multiple plugin subdirectories. Each subdirectory has its own `.cursor-plugin/plugin.json`. |
| **Root skill** | A `SKILL.md` at plugin root is treated as a single-skill plugin (only if no `skills/` directory and no manifest `skills` field). |

[source](https://cursor.com/docs/reference/plugins)

### Required vs optional files

Only `.cursor-plugin/plugin.json` is required (and within it, only the `name` field). All component directories are optional and auto-discovered. For marketplace submission, a README and proper frontmatter on all components are expected.

### Environment variables

Hook scripts and plugin components have access to these environment variables at runtime:

| Variable | Description | Always Present |
|----------|-------------|----------------|
| `CURSOR_PROJECT_DIR` | Workspace root directory | Yes |
| `CURSOR_VERSION` | Cursor version string | Yes |
| `CURSOR_USER_EMAIL` | Authenticated user email | If logged in |
| `CURSOR_TRANSCRIPT_PATH` | Path to conversation transcript file | If transcripts enabled |
| `CURSOR_CODE_REMOTE` | `"true"` when running in a remote workspace | Remote workspaces only |
| `CLAUDE_PROJECT_DIR` | Alias for `CURSOR_PROJECT_DIR` (Claude Code compatibility) | Yes |
| `${CURSOR_PLUGIN_ROOT}` | Absolute path to the installed plugin directory (for use in hook scripts and skill bodies) | Within plugin context |

[source](https://cursor.com/docs/hooks)

The `sessionStart` hook can inject session-scoped environment variables via its `env` output field; these are passed to all subsequent hook executions within that session.

---

## 2. Manifest

### Schema: `.cursor-plugin/plugin.json`

#### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier. Lowercase, kebab-case (alphanumerics, hyphens, periods). Must start and end with alphanumeric. Examples: `my-plugin`, `prompts.chat` |

#### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief plugin description |
| `version` | string | Semantic version (e.g. `1.0.0`) |
| `author` | object | `{ "name": "...", "email": "..." }` (`name` required, `email` optional) |
| `homepage` | string | URL to plugin homepage |
| `repository` | string | URL to plugin repository |
| `license` | string | License identifier (e.g. `MIT`) |
| `keywords` | array | Tags for discovery and categorization |
| `logo` | string | Relative path to a logo file in the repo (e.g. `assets/logo.svg`) or absolute URL. Relative paths resolve to `raw.githubusercontent.com` URLs. |
| `rules` | string or array | Path(s) to rule files or directories |
| `agents` | string or array | Path(s) to agent files or directories |
| `skills` | string or array | Path(s) to skill directories |
| `commands` | string or array | Path(s) to command files or directories |
| `hooks` | string or object | Path to hooks config file, or inline hook config |
| `mcpServers` | string, object, or array | Path to MCP config file, inline MCP server config, or array of either. Overrides default `mcp.json` discovery. |

[source](https://cursor.com/docs/reference/plugins)

#### Example

```json
{
  "name": "enterprise-plugin",
  "version": "1.2.0",
  "description": "Enterprise development tools with security scanning and compliance checks",
  "author": {
    "name": "ACME DevTools",
    "email": "devtools@acme.com"
  },
  "keywords": ["enterprise", "security", "compliance"],
  "logo": "assets/logo.svg"
}
```

### Marketplace manifest: `.cursor-plugin/marketplace.json`

Used for multi-plugin repositories. Placed at the repository root.

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Your Org", "email": "plugins@yourorg.com" },
  "metadata": {
    "description": "A collection of developer tool plugins",
    "version": "1.0.0",
    "pluginRoot": ""
  },
  "plugins": [
    {
      "name": "plugin-one",
      "source": "plugin-one",
      "description": "First plugin"
    }
  ]
}
```

#### Marketplace manifest fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | **Required.** Marketplace identifier (kebab-case) |
| `owner` | object | **Required.** `name` (required), `email` (optional) |
| `plugins` | array | **Required.** Array of plugin entries (max 500) |
| `metadata` | object | Optional. `description`, `version`, `pluginRoot` (prefix path for all plugin sources) |

#### Plugin entry fields (within `plugins` array)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | **Required.** Plugin identifier (kebab-case) |
| `source` | string or object | Path to plugin directory, or object with `path` and options |
| `description` | string | Plugin description |
| `version` | string | Semantic version |
| `author` | object | Author info |
| `homepage` | string | URL |
| `repository` | string | URL |
| `license` | string | License identifier |
| `keywords` | array | Search tags |
| `logo` | string | Relative path or URL to logo |
| `category` | string | Plugin category |
| `tags` | array | Additional tags |
| `skills`, `rules`, `agents`, `commands` | string or array | Path(s) to component files |
| `hooks` | string or object | Path to hooks config or inline config |
| `mcpServers` | string or object | Path to MCP config or inline config |

[source](https://cursor.com/docs/reference/plugins)

### Resolution order for marketplace entries

1. Parser looks for `<source>/.cursor-plugin/plugin.json`
2. If found, per-plugin manifest is merged with marketplace entry (manifest values take precedence)
3. Component discovery runs within the `<source>/` directory using manifest paths if specified, or folder-based discovery as fallback

### Variable substitution

| Variable | Scope | Description |
|----------|-------|-------------|
| `${CURSOR_PLUGIN_ROOT}` | Hook scripts, MCP configs | Resolves to the absolute path of the installed plugin directory |
| `${CLAUDE_PLUGIN_ROOT}` | Hook scripts (compatibility) | Alias for plugin root, for Claude Code compatibility |
| `${POSTGRES_URL}` etc. | MCP `env` values | Standard environment variable references in MCP server configs |

[source](https://github.com/cursor/plugins/issues/32/linked_closing_reference?reference_location=REPO_ISSUES_INDEX), [source](https://github.com/yandy-r/claude-plugins)

---

## 3. Skills

### SKILL.md frontmatter fields

Skills follow the [Agent Skills open standard](https://agentskills.io/specification). Each skill is a subdirectory containing a `SKILL.md` file.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier. Lowercase letters, numbers, and hyphens only. Must match the parent folder name. Max 64 chars. |
| `description` | Yes | Describes what the skill does and when to use it. Max 1024 chars. Used by the agent to determine relevance. Should include trigger keywords. |
| `license` | No | License name or reference to a bundled license file |
| `compatibility` | No | Environment requirements (system packages, network access, etc.) |
| `metadata` | No | Arbitrary key-value mapping for additional metadata |
| `disable-model-invocation` | No | When `true`, skill is only included when explicitly invoked via `/skill-name`. Agent will not auto-apply. **Cursor-specific; preserved during conversion.** |

[source](https://www.cursor.com/docs/context/skills), [source](https://agentskills.io/specification)

Note: The `allowed-tools` field from the Agent Skills spec is **not supported** by Cursor; agents inherit tool access from the parent agent. [source](https://github.com/OrcaQubits/agentic-commerce-skills-plugins/blob/main/INSTALL-CURSOR.md)

### Skill discovery paths

Skills are automatically loaded from these locations (in order):

| Location | Scope |
|----------|-------|
| `.agents/skills/` | Project-level |
| `.cursor/skills/` | Project-level |
| `~/.agents/skills/` | User-level (global) |
| `~/.cursor/skills/` | User-level (global) |

For compatibility, Cursor also loads skills from Claude and Codex directories:

| Location | Scope |
|----------|-------|
| `.claude/skills/` | Project-level (Claude compatibility) |
| `.codex/skills/` | Project-level (Codex compatibility) |
| `~/.claude/skills/` | User-level (Claude compatibility) |
| `~/.codex/skills/` | User-level (Codex compatibility) |

For plugins, skills are discovered from the `skills/` directory within the plugin, or from paths specified by the `skills` field in `plugin.json`.

[source](https://www.cursor.com/docs/context/skills)

### Skill lifecycle

1. **Discovery**: On startup, Cursor scans skill directories and loads YAML frontmatter from each `SKILL.md`. Only `name` and `description` are loaded (budget: ~100 tokens per skill).
2. **Relevance determination**: Agent is presented with available skills and decides when they are relevant based on context and description keywords.
3. **Activation**: When the agent decides a skill is relevant (or user types `/skill-name`), the full `SKILL.md` body is loaded into context.
4. **Execution**: Agent follows skill instructions, executing referenced scripts and using referenced files.

[source](https://www.cursor.com/docs/context/skills), [source](https://agentskills.io/specification)

### Optional skill directories

| Directory | Purpose |
|-----------|---------|
| `scripts/` | Executable code that agents can run. Reference via relative paths from skill root. |
| `references/` | Additional documentation loaded on demand |
| `assets/` | Static resources like templates, images, or data files |

[source](https://www.cursor.com/docs/context/skills)

### String substitutions in skill bodies

| Pattern | Resolves to |
|---------|-------------|
| `${CURSOR_PLUGIN_ROOT}` | Absolute path to the installed plugin root |
| `scripts/deploy.sh` | Relative path resolved from the skill directory |

---

## 4. Context Files

### AGENTS.md

`AGENTS.md` is a plain markdown file for defining agent instructions. Place it in the project root as a simple alternative to `.cursor/rules`.

- **No frontmatter required** -- plain markdown
- Cursor supports `AGENTS.md` in the project root **and** subdirectories (nested)
- Instructions from nested `AGENTS.md` files are combined with parent directories; more specific instructions take precedence

```
project/
  AGENTS.md              # Global instructions
  frontend/
    AGENTS.md            # Frontend-specific instructions
    components/
      AGENTS.md          # Component-specific instructions
  backend/
    AGENTS.md            # Backend-specific instructions
```

[source](https://cursor.com/docs/rules)

### Rules load order and precedence

Rules are applied in this order (highest to lowest priority):

1. **Enterprise** (MDM-managed, system-wide)
2. **Team Rules** (Cloud-distributed, Team/Enterprise plans only)
3. **Project Rules** (`.cursor/rules/*.mdc` -- version-controlled)
4. **User Rules** (Cursor Settings > Rules -- global preferences)
5. **Legacy Rules** (`.cursorrules` file -- deprecated, still supported)
6. **AGENTS.md** (simple markdown alternative)

All applicable rules are merged; earlier sources take precedence when guidance conflicts.

[source](https://cursor.com/docs/rules), [source](https://design.dev/guides/cursor-rules/)

### Context isolation

- Rules only apply to Agent (Chat) and Cmd+K. They do **not** impact Cursor Tab or other AI features.
- User Rules do **not** apply to Inline Edit (Cmd/Ctrl+K); they are only used by Agent Chat.
- Each subagent operates in its own context window -- it does not inherit the parent's conversation history. The parent must include relevant information in the subagent prompt.

[source](https://cursor.com/docs/rules), [source](https://cursor.com/docs/agent/subagents)

---

## 5. Hooks

### Event names (camelCase)

Cursor uses camelCase for all hook event names. There are two categories:

#### Agent hooks (Cmd+K / Agent Chat)

| Event | Phase | Can block? |
|-------|-------|------------|
| `sessionStart` | Session lifecycle | No (fire-and-forget) |
| `sessionEnd` | Session lifecycle | No (fire-and-forget) |
| `preToolUse` | Before any tool execution | Yes (`permission: "deny"`) |
| `postToolUse` | After successful tool execution | No (observational + context injection) |
| `postToolUseFailure` | After tool failure/timeout/denial | No (observational) |
| `subagentStart` | Before spawning a subagent | Yes (`permission: "deny"`) |
| `subagentStop` | After subagent completes/errors/aborts | No (can trigger `followup_message`) |
| `beforeShellExecution` | Before shell command | Yes (`permission: "allow"/"deny"/"ask"`) |
| `afterShellExecution` | After shell command | No (observational) |
| `beforeMCPExecution` | Before MCP tool call | Yes (`permission: "allow"/"deny"/"ask"`) |
| `afterMCPExecution` | After MCP tool call | No (observational) |
| `beforeReadFile` | Before file read | Yes (`permission: "allow"/"deny"`) |
| `afterFileEdit` | After file edit | No (observational) |
| `beforeSubmitPrompt` | Before prompt submission | Yes (`continue: false` to block) |
| `preCompact` | Before context compaction | No (observational) |
| `stop` | Agent loop ends | No (can trigger `followup_message`) |
| `afterAgentResponse` | After assistant message | No (observational) |
| `afterAgentThought` | After thinking block | No (observational) |

#### Tab hooks (inline completions)

| Event | Phase | Can block? |
|-------|-------|------------|
| `beforeTabFileRead` | Before Tab reads a file | Yes (`permission: "allow"/"deny"`) |
| `afterTabFileEdit` | After Tab edits a file | No (observational) |

[source](https://cursor.com/docs/hooks)

### Configuration format (`hooks.json`)

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [
      {
        "command": ".cursor/hooks/format.sh",
        "timeout": 30
      }
    ],
    "beforeShellExecution": [
      {
        "command": ".cursor/hooks/approve-network.sh",
        "matcher": "curl|wget|nc",
        "failClosed": true
      }
    ]
  }
}
```

#### Configuration locations and priority (highest to lowest)

| Level | Location | Working directory |
|-------|----------|-------------------|
| Enterprise | macOS: `/Library/Application Support/Cursor/hooks.json`; Linux/WSL: `/etc/cursor/hooks.json`; Windows: `C:\ProgramData\Cursor\hooks.json` | Enterprise config dir |
| Team | Cloud dashboard (Enterprise only, synced every 30 min) | Managed hooks dir |
| Project | `<project>/.cursor/hooks.json` | Project root |
| User | `~/.cursor/hooks.json` | `~/.cursor/` |
| Plugin | `hooks/hooks.json` within plugin directory | Plugin root |

All matching hooks from every source run. When responses conflict, higher-priority sources take precedence during merge.

[source](https://cursor.com/docs/hooks)

### Per-script configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `command` | string | **required** | Script path or shell command |
| `type` | `"command"` or `"prompt"` | `"command"` | Hook execution type |
| `timeout` | number | platform default | Execution timeout in seconds |
| `loop_limit` | number or null | `5` | Per-script loop limit for `stop`/`subagentStop` hooks. `null` = no limit. Default is `5` for Cursor hooks, `null` for Claude Code hooks. |
| `failClosed` | boolean | `false` | When `true`, hook failures (crash, timeout, invalid JSON) block the action instead of allowing through. Recommended for security-critical hooks. |
| `matcher` | string | -- | Pipe-delimited filter pattern. What it matches depends on the hook event. |

### Hook types

**Command-based** (default): Execute shell scripts. Receive JSON via stdin, return JSON via stdout.
- Exit code `0`: Hook succeeded, use JSON output
- Exit code `2`: Block the action (equivalent to `permission: "deny"`)
- Other exit codes: Hook failed, action proceeds (fail-open by default)

**Prompt-based**: Use an LLM to evaluate a natural language condition.
- Returns `{ ok: boolean, reason?: string }`
- `$ARGUMENTS` placeholder is auto-replaced with hook input JSON
- Optional `model` field to override the default LLM

[source](https://cursor.com/docs/hooks)

### Matcher syntax

Matchers are pipe-delimited strings matched against hook-specific values:

| Hook event | Matched against |
|------------|----------------|
| `preToolUse` / `postToolUse` / `postToolUseFailure` | Tool type: `Shell`, `Read`, `Write`, `Grep`, `Delete`, `Task`, `MCP: <name>` |
| `subagentStart` / `subagentStop` | Subagent type: `generalPurpose`, `explore`, `shell`, etc. |
| `beforeShellExecution` / `afterShellExecution` | Full shell command string |
| `beforeReadFile` | Tool type: `TabRead`, `Read`, etc. |
| `afterFileEdit` | Tool type: `TabWrite`, `Write`, etc. |
| `beforeSubmitPrompt` | `UserPromptSubmit` |
| `stop` | `Stop` |
| `afterAgentResponse` | `AgentResponse` |
| `afterAgentThought` | `AgentThought` |

[source](https://cursor.com/docs/hooks)

### Common input schema (all hooks)

All hooks receive these base fields in addition to event-specific fields:

```json
{
  "conversation_id": "string",
  "generation_id": "string",
  "model": "string",
  "hook_event_name": "string",
  "cursor_version": "string",
  "workspace_roots": ["<path>"],
  "user_email": "string | null",
  "transcript_path": "string | null"
}
```

[source](https://cursor.com/docs/hooks)

### Output format by event

| Event | Key output fields |
|-------|-------------------|
| `preToolUse` | `permission`, `user_message`, `agent_message`, `updated_input` |
| `postToolUse` | `updated_mcp_tool_output`, `additional_context` |
| `postToolUseFailure` | (none) |
| `subagentStart` | `permission`, `user_message` |
| `subagentStop` | `followup_message` (only on `status: "completed"`) |
| `beforeShellExecution` / `beforeMCPExecution` | `permission` (`"allow"/"deny"/"ask"`), `user_message`, `agent_message` |
| `afterShellExecution` / `afterMCPExecution` | (observational only) |
| `beforeReadFile` | `permission`, `user_message` |
| `afterFileEdit` | (observational only) |
| `beforeSubmitPrompt` | `continue`, `user_message` |
| `sessionStart` | `env`, `additional_context` |
| `sessionEnd` | (fire-and-forget, no output consumed) |
| `preCompact` | `user_message` |
| `stop` | `followup_message` |
| `afterAgentResponse` / `afterAgentThought` | (observational only) |

[source](https://cursor.com/docs/hooks)

### Platform-specific events (not in Claude Code)

These hook events exist in Cursor but not Claude Code:

- `subagentStart` / `subagentStop` -- subagent lifecycle
- `beforeMCPExecution` / `afterMCPExecution` -- MCP-specific hooks
- `beforeReadFile` -- file access control for agent reads
- `beforeSubmitPrompt` -- prompt validation
- `preCompact` -- context compaction observation
- `afterAgentResponse` / `afterAgentThought` -- response/thinking observation
- `beforeTabFileRead` / `afterTabFileEdit` -- Tab (inline completion) hooks

### Claude Code hook compatibility

Cursor explicitly supports loading hooks from Claude Code. Event name mapping:

| Claude Code (PascalCase) | Cursor (camelCase) |
|--------------------------|--------------------|
| `PreToolUse` | `preToolUse` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `stop` |

Tool names in matchers (`Shell`, `Read`, `Write`, `Edit`, etc.) are the same across both platforms. The `${CLAUDE_PLUGIN_ROOT}` variable is mapped to `${CURSOR_PLUGIN_ROOT}`. Exit code `2` blocks the action on both platforms.

[source](https://cursor.com/docs/agent/third-party-hooks), [source](https://github.com/OrcaQubits/agentic-commerce-skills-plugins/blob/main/INSTALL-CURSOR.md)

---

## 6. Tool Mapping

Cursor's built-in tools use the same names as Claude Code. Matchers in hooks reference tools by these names:

| Tool name | Description |
|-----------|-------------|
| `Shell` | Execute shell commands |
| `Read` | Read file contents |
| `Write` | Write/create files |
| `Grep` | Search file contents |
| `Delete` | Delete files |
| `Task` | Spawn subagent |
| `MCP: <server>/<tool>` | MCP tool calls (prefixed with `MCP: `) |

Cursor also has `TabRead` and `TabWrite` for inline completions (Tab), with separate hook events.

[source](https://cursor.com/docs/hooks)

---

## 7. Install and Distribution

### Install commands and scopes

| Method | Scope | How |
|--------|-------|-----|
| Marketplace (IDE) | User or project | Browse `cursor.com/marketplace` or search in marketplace panel. Install with `/add-plugin` in chat. |
| MCP deeplinks | User | `cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG` |
| Extension API | Programmatic | `vscode.cursor.plugins.registerPath()` registers plugin directories from VS Code extensions |
| GitHub import (rules) | Project | Cursor Settings > Rules > Add Rule > Remote Rule (GitHub). Synced to `.cursor/rules/imported/`. |

[source](https://cursor.com/docs/plugins)

### Local development

Place plugins in `~/.cursor/plugins/local/`:

```bash
# Copy method
mkdir -p ~/.cursor/plugins/local/my-plugin
cp -r /path/to/my-plugin/* ~/.cursor/plugins/local/my-plugin/

# Symlink method (recommended for development)
ln -s /path/to/my-plugin ~/.cursor/plugins/local/my-plugin
```

Restart Cursor or run `Developer: Reload Window` to load the plugin.

[source](https://cursor.com/docs/plugins), [source](https://github.com/cursor/plugins/blob/08c2bbe2ae8a022a21dc6c32faf611f14a6e8343/create-plugin/skills/create-plugin-scaffold/SKILL.md)

**Note**: The Cursor CLI (`agent` command) has limited plugin discovery from `plugins/local/` -- it finds agents but may not discover skills and rules. For full CLI support, copy components directly into project-level directories (`.cursor/skills/`, `.cursor/rules/`, `.cursor/agents/`). [source](https://github.com/OrcaQubits/agentic-commerce-skills-plugins/blob/main/INSTALL-CURSOR.md)

### Marketplace submission

1. Create plugin with valid `.cursor-plugin/plugin.json` manifest
2. Host in a public Git repository
3. Submit at `cursor.com/marketplace/publish`
4. Every plugin is **manually reviewed** before listing
5. All plugins must be **open source**; each update is reviewed before publishing

Submission checklist:
- `name` is unique, lowercase, kebab-case
- `description` clearly explains the plugin's purpose
- All rules, skills, agents, and commands have proper frontmatter metadata
- Logo committed to repo and referenced by relative path (if provided)
- `README.md` documents usage and configuration
- All paths relative and valid (no `..`, no absolute paths)
- Plugin tested locally
- For multi-plugin repos: `.cursor-plugin/marketplace.json` at repo root with unique plugin names

[source](https://cursor.com/docs/reference/plugins)

### Team distribution

| Method | Plan | Description |
|--------|------|-------------|
| **Team Marketplaces** | Teams (1 marketplace) / Enterprise (unlimited) | Import GitHub repo as team marketplace. Set plugins as Required (auto-install) or Optional. SCIM-synced distribution groups. |
| **Project hooks/rules** | All plans | Commit `.cursor/hooks.json` and `.cursor/rules/` to repo. Auto-loaded in trusted workspaces. |
| **MDM** | All plans (self-managed) | Deploy `hooks.json` and scripts to `~/.cursor/` (per-user) or system dirs (global) |
| **Cloud Distribution** | Enterprise only | Configure hooks in web dashboard. Auto-synced every 30 minutes. OS targeting. |
| **Team Rules** | Teams/Enterprise | Managed from dashboard. Can be enforced (cannot be disabled by users). Glob-scoped. |

[source](https://cursor.com/docs/plugins), [source](https://cursor.com/docs/hooks), [source](https://cursor.com/docs/rules)

---

## 8. Runtime Components

### Agents (Subagents)

Agents are markdown files with YAML frontmatter defining custom agent configurations. They are used as **subagents** -- specialized AI assistants the parent agent can delegate to.

#### File locations

| Location | Scope |
|----------|-------|
| `.cursor/agents/` | Project |
| `.claude/agents/` | Project (Claude compatibility) |
| `.codex/agents/` | Project (Codex compatibility) |
| `~/.cursor/agents/` | User (global) |
| `~/.claude/agents/` | User (Claude compatibility) |
| `~/.codex/agents/` | User (Codex compatibility) |

`.cursor/` takes precedence over `.claude/` or `.codex/` when names conflict.

[source](https://cursor.com/docs/agent/subagents)

#### Agent frontmatter fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | No | Derived from filename | Display name and identifier. Lowercase + hyphens. |
| `description` | string | No | -- | Short description shown in Task tool hints. Agent reads this to decide delegation. |
| `model` | string | No | `inherit` | `fast`, `inherit`, or a specific model ID (e.g. `claude-4-sonnet`, `gpt-5-mini`) |
| `readonly` | boolean | No | `false` | If `true`, subagent has restricted write permissions (no file edits, no state-changing shell commands) |
| `is_background` | boolean | No | `false` | If `true`, subagent runs in background without blocking parent |

[source](https://cursor.com/docs/agent/subagents)

#### Model configuration

| Value | Behavior |
|-------|----------|
| `inherit` | Uses the same model as the parent agent (default) |
| `fast` | Uses a smaller, faster model optimized for speed and cost |
| Specific model ID | Uses the exact model specified (e.g. `claude-opus-4-6`) |

Model may be overridden by team admin restrictions, Max Mode requirements, or plan limitations.

[source](https://cursor.com/docs/agent/subagents)

#### Built-in subagents

| Subagent | Purpose | Default model |
|----------|---------|---------------|
| `explore` | Codebase search and analysis | `fast` |
| `bash` | Shell command series | -- |
| `browser` | Browser control via MCP | -- |

These are used automatically by the agent and do not need configuration.

[source](https://cursor.com/docs/agent/subagents)

### Async subagents (Cursor 2.5+)

Subagents can run asynchronously (background mode). The parent agent continues working while subagents run independently. Subagents can also spawn their own subagents, creating a tree of coordinated work.

- Background subagents write state to `~/.cursor/subagents/`
- Subagents can be resumed by passing the returned agent ID
- Parallel execution: Agent sends multiple Task tool calls in a single message

[source](https://www.cursor.so/changelog/2-5), [source](https://cursor.com/docs/agent/subagents)

### Rules

Rules are `.mdc` or `.md` files in `.cursor/rules/` providing persistent AI guidance. They have YAML frontmatter controlling activation.

#### Rule frontmatter fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief description of what the rule does |
| `alwaysApply` | boolean | If `true`, rule applies to every chat session |
| `globs` | string or array | File patterns the rule applies to (e.g. `"**/*.ts"`) |

#### Activation modes

| Mode | Configuration |
|------|---------------|
| Always Apply | `alwaysApply: true` |
| Apply Intelligently | `alwaysApply: false`, `description` set, no `globs` |
| Apply to Specific Files | `globs` patterns defined |
| Apply Manually | No `description`, no `globs`, no `alwaysApply` -- user must `@mention` in chat |

[source](https://cursor.com/docs/rules)

### Commands

Commands are markdown or text files in `commands/` defining agent-executable actions. Supported extensions: `.md`, `.mdc`, `.markdown`, `.txt`.

```markdown
---
name: deploy-staging
description: Deploy the current branch to the staging environment
---

# Deploy to staging
Steps to deploy to staging:
1. Run tests
2. Build the project
3. Push to staging branch
```

[source](https://cursor.com/docs/reference/plugins)

### MCP support

MCP servers are configured via `mcp.json` at the plugin root (auto-discovered) or via the `mcpServers` field in `plugin.json`.

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${POSTGRES_URL}"
      }
    }
  }
}
```

MCP servers can be toggled on/off from Cursor Settings > Features > Model Context Protocol. Disabled servers are not loaded. MCP install deeplinks are supported: `cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG`.

[source](https://cursor.com/docs/reference/plugins), [source](https://cursor.com/docs/plugins)

### Sandbox

Cursor 2.5 introduced sandbox network access controls:
- **User config only**: restricted to domains in `sandbox.json`
- **User config with defaults**: user allowlist plus Cursor built-in defaults
- **Allow all**: unrestricted network access within sandbox
- Enterprise admins can enforce network allowlists/denylists from dashboard

Common operations (`git clone`, `npm install`, `pip install`) work out of the box in the sandbox.

[source](https://www.cursor.so/changelog/2-5)

### Unique Cursor features (not in Claude Code)

| Feature | Description |
|---------|-------------|
| **Prompt-based hooks** | Hooks that use LLM evaluation instead of scripts |
| **Tab hooks** | Separate hook events for inline completions (`beforeTabFileRead`, `afterTabFileEdit`) |
| **`disable-model-invocation`** | Skill frontmatter field to prevent auto-invocation |
| **Team Rules** | Dashboard-managed rules with enforcement |
| **Cloud Agents** | Background agents that run in the cloud, loading project hooks |
| **Sandbox controls** | Fine-grained network and filesystem access in sandboxed commands |
| **Rule globs** | File-pattern-scoped rules (`.mdc` frontmatter) |
| **`/migrate-to-skills`** | Built-in skill to convert dynamic rules and slash commands to skills |
| **Extension API** | `vscode.cursor.plugins.registerPath()` for programmatic plugin registration |
| **MCP deeplinks** | Share MCP configs via install URLs |
| **Subagent resume** | Resume previous subagent conversations by agent ID |

---

## 9. Sources

### Primary documentation

- https://cursor.com/docs/plugins -- Plugin overview
- https://cursor.com/docs/reference/plugins -- Full manifest schema, component discovery, marketplace manifest, submission checklist
- https://cursor.com/docs/hooks -- Complete hooks reference (events, schemas, config, examples)
- https://cursor.com/docs/agent/third-party-hooks -- Third-party hooks compatibility (Claude Code)
- https://cursor.com/docs/rules -- Rules format, AGENTS.md, Team Rules, import
- https://www.cursor.com/docs/context/skills -- Agent Skills documentation
- https://cursor.com/docs/agent/subagents -- Subagents reference (formats, model config, built-ins)

### Announcements and changelogs

- https://www.cursor.com/blog/marketplace -- Cursor 2.5 announcement: plugins, subagents, marketplace
- https://www.cursor.so/changelog/2-5 -- Cursor 2.5 changelog: plugins, sandbox, async subagents

### Official GitHub repos

- https://github.com/cursor/plugins -- Official plugins repository (multi-plugin marketplace)
- https://github.com/cursor/plugin-template -- Starter template for plugin development
- https://github.com/cursor/plugins/blob/08c2bbe2ae8a022a21dc6c32faf611f14a6e8343/create-plugin/skills/create-plugin-scaffold/SKILL.md -- Create-plugin scaffold skill
- https://github.com/cursor/plugin-template/issues/4 -- Local plugin testing discussion

### Community and third-party

- https://cursor.directory/plugins -- Community plugin directory
- https://github.com/OrcaQubits/agentic-commerce-skills-plugins/blob/main/INSTALL-CURSOR.md -- Real-world plugin conversion guide (Claude Code to Cursor)
- https://github.com/yandy-r/claude-plugins -- Multi-platform plugin generator with Cursor support
- https://github.com/tech-leads-club/agent-skills/blob/main/packages/skills-catalog/skills/(creation)/cursor-subagent-creator/SKILL.md -- Subagent creator skill
- https://github.com/obra/superpowers/issues/912 -- Windows hook path issues with `CURSOR_PLUGIN_ROOT`
- https://github.com/cursor/plugins/issues/32/linked_closing_reference?reference_location=REPO_ISSUES_INDEX -- Plugin root path fix

### Standards

- https://agentskills.io/specification -- Agent Skills open standard (SKILL.md specification)
- https://agentskills.io/integrate-skills -- Integration guide for Agent Skills

### Forum discussions

- https://forum.cursor.com/t/cursor-2-5-plugins/152124 -- Cursor 2.5 release discussion
- https://forum.cursor.com/t/task-tool-model-parameter-only-accepts-fast-cannot-specify-model-ids-for-subagents/156736 -- Subagent model limitation bug report
- https://forum.cursor.com/t/subagents-that-are-configured-as-read-only-fail-to-start-and-return-a-refusal-response/153490 -- Read-only subagent issues

### Guides

- https://design.dev/guides/cursor-rules/ -- Comprehensive Cursor rules guide
