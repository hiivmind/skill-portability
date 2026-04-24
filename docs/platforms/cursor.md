# Cursor Plugin Ecosystem

This document describes the Cursor IDE plugin ecosystem as it relates to portability assessment and uplift.

## Plugin structure

A Cursor plugin is a directory with a `.cursor-plugin/plugin.json` manifest and auto-discovered component directories. The manifest is optional for local use but required for marketplace submission.

### Canonical layout

```
my-plugin/
  .cursor-plugin/
    plugin.json              # plugin manifest (required for marketplace)
  skills/
    <skill-name>/
      SKILL.md               # skill entrypoint (open standard)
  rules/                     # .mdc rule files
    coding-standards.mdc
  agents/                    # custom agent definitions (.md files)
    security-reviewer.md
  commands/                  # slash commands (.md files)
    deploy.md
  hooks/
    hooks.json               # hook configuration
  mcp.json                   # MCP server definitions
  assets/
    logo.svg
  scripts/                   # hook utility scripts
```

### Auto-discovery rules

When paths are not specified in the manifest:

| Component | Default location | File types |
|-----------|-----------------|------------|
| Skills | `skills/` | Subdirectories containing `SKILL.md` |
| Rules | `rules/` | `.md`, `.mdc`, `.markdown` |
| Agents | `agents/` | `.md`, `.mdc`, `.markdown` |
| Commands | `commands/` | `.md`, `.mdc`, `.markdown`, `.txt` |
| Hooks | `hooks/hooks.json` | JSON |
| MCP | `mcp.json` | JSON |
| Root skill | `SKILL.md` at root | Single-skill plugin only |

## Manifest schema (`plugin.json`)

Location: `.cursor-plugin/plugin.json`

Required fields: `name` only.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier, lowercase kebab-case |
| `displayName` | string | Human-readable name |
| `description` | string | Brief description |
| `version` | string | Semver |
| `author` | object | `{ name, email }` |
| `homepage` | string | URL |
| `repository` | string | URL |
| `license` | string | License identifier |
| `keywords` | array | Tags for discovery |
| `logo` | string | Relative path to logo file or URL |
| `rules` | string or array | Path(s) to rule files or directories |
| `agents` | string or array | Path(s) to agent files |
| `skills` | string or array | Path(s) to skill directories |
| `commands` | string or array | Path(s) to command files |
| `hooks` | string or object | Path to hooks config or inline |
| `mcpServers` | string, object, or array | MCP config |

### Marketplace manifest

Location: `.cursor-plugin/marketplace.json` (repo root for multi-plugin repos).

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Marketplace identifier |
| `owner` | string | Marketplace owner |
| `metadata` | object | Additional metadata |
| `plugins` | array | Plugin entries with `name`, `source`, `description`, `keywords`, `category`, `tags` |

## Installation and discovery

Three installation channels:

| Channel | Path | Notes |
|---------|------|-------|
| Marketplace | `cursor.com/marketplace` | Curated, manually reviewed, open-source only |
| Local development | `~/.cursor/plugins/local/<name>/` | Restart required |
| Team/Enterprise | Distribution groups | Admins set required/optional plugins |
| GitHub install | `/add-plugin owner/repo` in Agent chat | Accepts shorthand or full URL |

Plugins are Git repositories — no binaries shipped. Submission at `cursor.com/marketplace/publish`.

## Skills system

Skills follow the open SKILL.md standard, identical to Claude Code.

### SKILL.md frontmatter

`name` (required) and `description` (required). The description drives when the agent auto-invokes the skill.

At startup, only name and description are loaded. Full content is injected on invocation.

### Skill discovery paths

- Project: `.cursor/skills/`, `.agents/skills/`
- Global: `~/.cursor/skills/`, `~/.agents/skills/`
- Compatibility: `.claude/skills/`, `.codex/skills/`, `~/.claude/skills/`, `~/.codex/skills/`

Cross-platform note: Cursor loads skills from Claude Code and Codex paths for compatibility, but this is one-way — Claude Code does not load from `.cursor/` paths.

### Invocation

`/skill-name` in chat, `@skill-name` to attach as context, or auto-invoked by agent based on relevance.

## Rules system

Cursor has a rules system separate from skills. Two formats:

### Legacy `.cursorrules`

Plain text/markdown file at project root. Applied to every interaction. Deprecated but still functional.

### Modern `.cursor/rules/*.mdc`

Modular rule files with YAML frontmatter.

| Field | Type | Purpose |
|-------|------|---------|
| `description` | string | Helps agent decide relevance |
| `globs` | string | Comma-separated file patterns (NOT YAML array syntax) |
| `alwaysApply` | boolean | Include in every session when true |

Four activation modes:

| Mode | `alwaysApply` | `globs` | `description` |
|------|:---:|:---:|:---:|
| Always Apply | `true` | ignored | optional |
| Auto-Attached | `false` | set | optional |
| Agent-Requested | `false` | empty | set |
| Manual | `false` | empty | empty |

The `globs` field accepts both comma-separated strings and YAML array syntax (e.g., `globs: ["pattern/**/*.ts"]`).

Rule precedence: Team Rules > Project Rules > User Rules.

## Hooks system

Cursor has a full hooks system. Hooks receive JSON on stdin and return JSON on stdout.

### Configuration

- Project: `.cursor/hooks.json`
- User/global: `~/.cursor/hooks.json`
- Via plugins: `hooks/hooks.json` in plugin directory

### Hook events

| Event | Category |
|-------|----------|
| `sessionStart` | Session |
| `sessionEnd` | Session |
| `preToolUse` | Tool |
| `postToolUse` | Tool |
| `postToolUseFailure` | Tool |
| `subagentStart` | Subagent |
| `subagentStop` | Subagent |
| `beforeShellExecution` | Shell |
| `afterShellExecution` | Shell |
| `beforeMCPExecution` | MCP |
| `afterMCPExecution` | MCP |
| `beforeReadFile` | File |
| `afterFileEdit` | File |
| `beforeSubmitPrompt` | Input |
| `preCompact` | Context |
| `stop` | Lifecycle |
| `afterAgentResponse` | Response |
| `afterAgentThought` | Response |
| `beforeTabFileRead` | Tab (inline) |
| `afterTabFileEdit` | Tab (inline) |

### Hook configuration format

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "command": "./hooks/validate-tool.sh",
        "matcher": "Shell|Read|Write",
        "timeout": 30,
        "loop_limit": 5,
        "failClosed": false
      }
    ]
  }
}
```

Exit code 2 blocks the action. Cursor can load Claude Code hooks from `.claude/settings.json`, mapping event names automatically (e.g., `PreToolUse` → `preToolUse`).

### Hook output format

Cursor uses `additional_context` (snake_case) in hook output, not `additionalContext` (camelCase) as in Claude Code.

### Precedence

Enterprise > Team > Project (`.cursor/hooks.json`) > User (`~/.cursor/hooks.json`) > Claude project local > Claude project > Claude user.

## Agents

Markdown files with YAML frontmatter in `agents/` directory.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Agent identifier (kebab-case) |
| `description` | string | What the agent does |
| `model` | string | Optional model override |
| `readonly` | boolean | Prevents writes/mutations |

Scopes: project (`.cursor/agents/`) or user (`~/.cursor/agents/`).

## Commands

Slash-commands invoked via `/`. Markdown files in `commands/` directory.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Command identifier |
| `description` | string | Brief description |

Support parameterized arguments via `$1`, `$2`. The built-in `/migrate-to-skills` command (Cursor 2.4+) converts eligible rules and commands to skills.

Key difference from skills: commands are user-triggered only; skills can be auto-invoked.

## Context files

| Source | Path | Behavior |
|--------|------|----------|
| Project rules | `.cursor/rules/*.mdc` | Frontmatter-controlled activation |
| Legacy rules | `.cursorrules` | Always loaded (deprecated) |
| User rules | Cursor Settings > Rules | Global preferences |
| AGENTS.md | Project root | Loaded as context |
| Skills | Various paths | Loaded on invocation |

Cursor also reads `AGENTS.md` from the project root.

## MCP servers

Full MCP support with stdio, SSE, and Streamable HTTP transports.

Configuration: `.cursor/mcp.json` (project), `~/.cursor/mcp.json` (global), `mcp.json` at plugin root.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}" }
    }
  }
}
```

Variable substitution: `${env:VARIABLE_NAME}` and `${workspaceFolder}`.

MCP Resources not yet supported. OAuth support built-in for remote servers.

## Built-in tools

Cursor provides standard file, shell, and search tools. Tool names differ from Claude Code:

| Claude Code | Cursor equivalent |
|-------------|-------------------|
| `Read` | File read tool |
| `Write` | File write tool |
| `Edit` | File edit tool |
| `Bash` | Shell execution |
| `Grep` | Content search |
| `Glob` | File search |
| `Skill` | Skills auto-invoked or `/skill-name` |
| `Task` / `Agent` | Subagent dispatch |

## Portability-relevant limitations

1. No binary distribution — plugins are markdown and scripts only
2. Manual review bottleneck — every marketplace plugin and update manually reviewed
3. Open-source requirement for marketplace plugins
4. Not VS Code extensions — completely separate system
5. MCP Resources not supported
6. `.cursor-plugin/` is distinct from `.claude-plugin/` — copying without renaming fails
7. `.mdc` frontmatter `globs` accepts both comma-separated strings and YAML array syntax
8. No dynamic plugin loading — restart required for changes
9. Hook `additional_context` is snake_case (differs from Claude Code's camelCase)
10. Cross-platform skill paths are one-way: Cursor reads `.claude/skills/` but not vice versa

## Assessment criteria

### Plugin packaging

Score 3 when:
- `.cursor-plugin/plugin.json` present with name, displayName, description, version, author
- Skills in `skills/<name>/SKILL.md` with name and description frontmatter
- Component paths match actual directory structure

Score 2 when:
- Manifest exists but is missing fields
- Skills exist but frontmatter is incomplete

Score 1 when:
- No manifest but skills/rules exist in default locations

Score 0 when:
- No recognizable Cursor plugin structure

### Rules coverage

Score 3 when:
- Modern `.cursor/rules/*.mdc` files with proper frontmatter
- Activation modes appropriate to content (always-apply for global standards, auto-attached for file-specific)

Score 2 when:
- Rules exist but use legacy `.cursorrules` format

Score 1 when:
- No Cursor-specific rules but `CLAUDE.md` or `AGENTS.md` provides equivalent context

Score 0 when:
- No context delivery for Cursor

### Hook compatibility

Score 3 when:
- `hooks/hooks-cursor.json` present with correct event names (camelCase)
- Hook scripts are portable (not Claude-specific env vars)
- `run-hook.cmd` present for Windows

Score 2 when:
- Claude Code hooks exist and can be auto-mapped by Cursor

Score 1 when:
- Hooks exist but use Claude-specific output format

Score 0 when:
- No hooks or hooks cannot be adapted

### MCP compatibility

Score 3 when:
- `mcp.json` uses stdio transport with portable paths
- No dependency on Claude-specific MCP features (Resources)

Score 2 when:
- MCP config exists but needs path adjustment

Score 1 when:
- MCP config uses features unsupported by Cursor

Score 0 when:
- No MCP configuration
