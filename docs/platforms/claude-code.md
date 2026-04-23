# Claude Code Plugin Ecosystem

This document describes the Claude Code plugin ecosystem as it relates to portability assessment and uplift.

## Plugin structure

A Claude Code plugin is a directory with an optional `.claude-plugin/plugin.json` manifest. Claude auto-discovers components in default directories without a manifest.

### Canonical layout

```
my-plugin/
  .claude-plugin/
    plugin.json              # optional manifest
    marketplace.json         # optional marketplace definition
  skills/
    <skill-name>/
      SKILL.md               # required skill entrypoint
      references/            # optional supporting files
      scripts/               # optional scripts
  agents/                    # subagent definitions (.md files)
  commands/                  # legacy flat .md skill files
  hooks/
    hooks.json               # hook configuration
  output-styles/             # response format customization
  monitors/
    monitors.json            # background process configs
  bin/                       # executables added to Bash PATH
  scripts/                   # utility scripts for hooks
  settings.json              # default settings (agent, subagentStatusLine only)
  .mcp.json                  # MCP server definitions
  .lsp.json                  # LSP server configurations
  CLAUDE.md                  # project context file
```

Only `plugin.json` and `marketplace.json` belong inside `.claude-plugin/`. All other directories are at the plugin root.

## Manifest schema (`plugin.json`)

Location: `.claude-plugin/plugin.json`

Required fields: `name` only (kebab-case).

Full field set:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier, kebab-case |
| `version` | string | Semver |
| `description` | string | Brief description |
| `author` | object | `{ name, email, url }` |
| `homepage` | string | URL |
| `repository` | string | URL |
| `license` | string | License identifier |
| `keywords` | array | Tags for discovery |
| `skills` | string or array | Override default `skills/` path |
| `commands` | string or array | Override default `commands/` path |
| `agents` | string or array | Override default `agents/` path |
| `hooks` | string, array, or object | Hook config path or inline |
| `mcpServers` | string, array, or object | MCP config path or inline |
| `lspServers` | string, array, or object | LSP config path or inline |
| `outputStyles` | string or array | Output style path |
| `monitors` | string or array | Monitor config path |
| `userConfig` | object | User configuration schema prompted at enable time |
| `channels` | array | Message injection via MCP servers |
| `dependencies` | array | Plugin dependencies |

Custom path overrides replace defaults. To keep both, use an array: `"skills": ["./skills/", "./extras/"]`.

### Environment variables

Available in skills, hooks, and MCP/LSP configs:

- `${CLAUDE_PLUGIN_ROOT}` — plugin install directory (changes on update)
- `${CLAUDE_PLUGIN_DATA}` — persistent data directory (survives updates)
- `${user_config.KEY}` — user configuration values

## Marketplace schema (`marketplace.json`)

Location: `.claude-plugin/marketplace.json`

```json
{
  "name": "marketplace-name",
  "owner": { "name": "Maintainer", "email": "optional@email.com" },
  "metadata": {
    "description": "...",
    "version": "1.0.0",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin",
      "description": "...",
      "version": "1.0.0"
    }
  ]
}
```

Plugin source types: relative path, GitHub (`source: "github"`), Git URL (`source: "url"`), Git subdirectory (`source: "git-subdir"`), npm (`source: "npm"`).

## Installation and discovery

Three installation scopes:

| Scope | Settings file | Use case |
|-------|---------------|----------|
| `user` | `~/.claude/settings.json` | Personal, all projects |
| `project` | `.claude/settings.json` | Team-shared via VCS |
| `local` | `.claude/settings.local.json` | Project-specific, gitignored |

Installation methods:
- Marketplace: `/plugin install plugin-name@marketplace-name`
- Local development: `claude --plugin-dir ./path-to-plugin`
- CLI: `claude plugin install|uninstall|enable|disable|update|list`

Plugins are cached at `~/.claude/plugins/cache/`. Old versions removed after 7 days.

## Skills system

Location: `skills/<name>/SKILL.md` (recommended) or `commands/<name>.md` (legacy).

### SKILL.md frontmatter

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name, max 64 chars, kebab-case. Falls back to directory name |
| `description` | string | What the skill does. Truncated at 1,536 chars |
| `when_to_use` | string | Additional trigger context, appended to description |
| `argument-hint` | string | Autocomplete hint |
| `arguments` | string or list | Named positional arguments for `$name` substitution |
| `disable-model-invocation` | boolean | Only user can invoke (default: false) |
| `user-invocable` | boolean | Hidden from `/` menu when false |
| `allowed-tools` | string or list | Tools granted without permission prompts |
| `model` | string | Model override for this skill's turn |
| `effort` | string | `low`, `medium`, `high`, `xhigh`, `max` |
| `context` | string | `fork` = run in subagent |
| `agent` | string | Agent type when `context: fork` |
| `hooks` | object | Hooks scoped to this skill's lifecycle |
| `paths` | string or list | Glob patterns limiting auto-activation |
| `shell` | string | `bash` (default) or `powershell` |

### String substitutions

- `$ARGUMENTS` — all arguments
- `$ARGUMENTS[N]` or `$N` — positional argument
- `$name` — named argument from `arguments` field
- `${CLAUDE_SESSION_ID}` — current session ID
- `${CLAUDE_SKILL_DIR}` — directory containing SKILL.md
- `` !`command` `` — dynamic context injection (shell command output)

### Lifecycle

Skill content loads on invocation and stays for the session. After compaction, the first 5,000 tokens of each skill are retained, with a 25,000-token combined budget.

## Hooks system

Location: `hooks/hooks.json` in plugin root, or inline in `plugin.json`.

### Events (27+)

| Category | Events |
|----------|--------|
| Session | `SessionStart`, `SessionEnd` |
| Turn | `UserPromptSubmit`, `Stop`, `StopFailure` |
| Tool | `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied` |
| File | `FileChanged`, `CwdChanged` |
| Config | `ConfigChange`, `InstructionsLoaded` |
| Subagent | `SubagentStart`, `SubagentStop` |
| Task | `TaskCreated`, `TaskCompleted` |
| Worktree | `WorktreeCreate`, `WorktreeRemove` |
| Context | `PreCompact`, `PostCompact` |
| Input | `UserPromptExpansion` |
| Other | `Notification`, `TeammateIdle`, `Elicitation`, `ElicitationResult` |

### Hook configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate.sh",
            "timeout": 600,
            "async": false,
            "statusMessage": "Validating..."
          }
        ]
      }
    ]
  }
}
```

Four handler types: `command` (shell), `http` (POST request), `prompt` (LLM evaluation), `agent` (subagent verification).

Matcher patterns: omitted or `"*"` matches all; letters/digits/`_`/`|` for exact or list match; otherwise treated as JavaScript regex.

Exit codes: 0 = success (parse JSON stdout), 2 = blocking error, other = non-blocking error.

### PreToolUse output format

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask|defer",
    "permissionDecisionReason": "...",
    "updatedInput": { "command": "modified" },
    "additionalContext": "Context for Claude"
  }
}
```

### PostToolUse output format

Uses top-level `decision` and `reason` (different from PreToolUse):

```json
{
  "decision": "block",
  "reason": "Feedback for Claude",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "..."
  }
}
```

## Agents

Location: `agents/` directory, markdown files with YAML frontmatter.

Key frontmatter fields: `name` (required), `description` (required), `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt`.

Plugin-shipped agents cannot use `hooks`, `mcpServers`, or `permissionMode` (security restriction).

## Context files

`CLAUDE.md` at project root, `~/.claude/CLAUDE.md` globally, or in nested directories. Loaded automatically on session start.

Plugins do not have their own CLAUDE.md mechanism. Use `SessionStart` hooks with `additionalContext` output for always-on plugin context.

## MCP servers

Location: `.mcp.json` at plugin root, or inline in `plugin.json`.

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": { "DB_PATH": "${CLAUDE_PLUGIN_DATA}/data" }
    }
  }
}
```

Plugin MCP servers start automatically when the plugin is enabled.

## Built-in tools

| Tool | Description |
|------|-------------|
| `Read` | Read file contents |
| `Write` | Write/create files |
| `Edit` | Edit files (string replacement) |
| `Bash` | Execute shell commands |
| `Grep` | Search file contents |
| `Glob` | Search files by pattern |
| `Skill` | Invoke a skill |
| `Agent` / `Task` | Dispatch subagents |
| `TodoWrite` | Task tracking |
| `WebSearch` | Web search |
| `WebFetch` | Fetch URL content |

## Additional components

- **LSP Servers** (`.lsp.json`): Language server integration for code intelligence
- **Monitors** (`monitors/monitors.json`): Background processes delivering notifications
- **Output Styles** (`output-styles/`): Response format customization
- **bin/** directory: Executables added to Bash PATH while plugin is enabled

## Portability-relevant limitations

1. Path traversal blocked — installed plugins cannot reference files outside their directory
2. Plugin agents cannot use `hooks`, `mcpServers`, or `permissionMode` frontmatter
3. Version bumps required for update propagation (caching)
4. Custom path overrides in manifest replace defaults, not augment
5. Skill descriptions truncated at 1,536 chars; total description budget is 1% of context window
6. Hooks deduplication — identical hooks run only once even if registered multiple times
7. PreToolUse and PostToolUse have different output formats
8. Manifest is optional — Claude auto-discovers components in default locations

## Assessment criteria

### Plugin packaging

Score 3 when:
- `.claude-plugin/plugin.json` present with name, description, version, author
- Skills in `skills/<name>/SKILL.md` with proper frontmatter
- Hooks in `hooks/hooks.json` if any hooks exist

Score 2 when:
- Manifest exists but is missing fields (no author, no version)
- Skills exist but use legacy `commands/` format

Score 1 when:
- No manifest but components exist in default locations
- Skills lack frontmatter

Score 0 when:
- No recognizable Claude Code plugin structure

### Context delivery

Score 3 when:
- `CLAUDE.md` present with accurate plugin description
- SessionStart hooks configured for always-on context if needed

Score 2 when:
- `CLAUDE.md` exists but is incomplete

Score 1 when:
- No context file but skills are self-documenting

Score 0 when:
- No context delivery mechanism

### Hook portability

Score 3 when:
- `hooks/hooks.json` uses portable event names
- Scripts handle cross-platform paths
- `run-hook.cmd` polyglot wrapper present for Windows

Score 2 when:
- Hooks exist but are platform-specific (bash only)

Score 1 when:
- Hooks exist but reference Claude-specific environment variables

Score 0 when:
- No hooks or hooks are unusable outside Claude Code

### Marketplace readiness

Score 3 when:
- `marketplace.json` present with complete plugin entries
- Source paths are valid and version-pinned

Score 2 when:
- Marketplace file exists but entries are incomplete

Score 1 when:
- No marketplace file but plugin.json is sufficient for local install

Score 0 when:
- No packaging suitable for distribution
