# Gemini CLI Extension Ecosystem

This document describes the Gemini CLI extension ecosystem as it relates to portability assessment and uplift.

## Extension structure

A Gemini CLI extension is a directory containing a `gemini-extension.json` manifest. Extensions can bundle MCP servers, skills, subagents, commands, policies, hooks, and context files.

### Canonical layout

```
my-extension/
  gemini-extension.json      # required manifest
  GEMINI.md                  # context/instructions for the model
  skills/
    <skill-name>/
      SKILL.md               # skill entrypoint (open standard)
      references/
      scripts/
  agents/                    # subagent definitions (.md files)
    frontend-specialist.md
  commands/                  # custom slash commands (.toml files)
    plan.toml
  policies/                  # policy engine rules (.toml files)
    security.toml
  hooks/                     # hook scripts
  src/                       # source code for MCP servers
  dist/                      # built JS output
  package.json               # Node.js dependencies
```

## Manifest schema (`gemini-extension.json`)

Required fields: `name` and `version`.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique ID; lowercase, numbers, dashes only. Must match directory name |
| `version` | string | Semver |
| `description` | string | Shown on extension listing pages |
| `contextFileName` | string | Name of context file to load (defaults to `GEMINI.md`) |
| `mcpServers` | object | Map of MCP server name to config |
| `excludeTools` | array | Tools to exclude |
| `settings` | array | Structured settings with `name`, `description`, `envVar`, `sensitive` |
| `migratedTo` | string | URL pointing to new location if extension moved |
| `plan` | object | Plan directory configuration |

### Variable substitution

| Variable | Description |
|----------|-------------|
| `${extensionPath}` | Absolute path to extension directory |
| `${workspacePath}` | Absolute path to current workspace |
| `${/}` or `${pathSeparator}` | OS-specific path separator |

## Installation and discovery

Three installation tiers:

| Tier | Path | Scope |
|------|------|-------|
| System | System-wide | Administrator-managed |
| User | `~/.gemini/extensions/` | Personal |
| Project | `<project>/.gemini/extensions/` | Project-specific |

Precedence: Project > User > System.

CLI commands:
- `gemini extensions install <source>` — from GitHub repo or local path
- `gemini extensions list` — list installed
- `gemini extensions uninstall <name>` — remove
- `gemini extensions enable|disable <name> [--scope <scope>]` — toggle without uninstalling
- `gemini extensions update [name]` — pull latest
- `gemini extensions new <path> [template]` — scaffold new extension
- `gemini extensions link <path>` — symlink for local development

Extensions loaded at session start; changes require CLI restart.

### Extensions gallery

Gemini CLI has an extensions gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) with 897+ extensions. Extensions are not vetted by Google — review before installing.

## Skills system

Gemini CLI has a native skills system based on the open SKILL.md standard.

### Skill discovery paths

Three tiers:

| Tier | Paths |
|------|-------|
| Workspace | `.gemini/skills/`, `.agents/skills/` (alias, takes precedence) |
| User | `~/.gemini/skills/`, `~/.agents/skills/` (alias) |
| Extension | `skills/` directory in extension |

### SKILL.md frontmatter

```yaml
---
name: code-reviewer           # required, lowercase/numbers/hyphens, max 64 chars
description: >                 # required
  Use this skill to review code
---
```

At startup, only name and description are injected into the system prompt. Full content loads on demand when the agent determines relevance.

Skills can include `scripts/`, `references/`, and `assets/` subdirectories. Extension settings are hydrated into skills via `${VAR_NAME}` placeholders.

CLI commands: `gemini skills list`, `gemini skills install <url>`, `gemini skills link <path>`, `/skills list`

## Context files (GEMINI.md)

### Hierarchical loading

1. Global: `~/.gemini/GEMINI.md`
2. Project root and ancestors: walks up from CWD to `.git` boundary
3. Subdirectories: scans below CWD (respects `.gitignore` and `.geminiignore`)
4. Just-in-time: auto-discovered when tools access files in new directories

All found files concatenated with path-origin separators and sent as system prompt context.

### Configurable filename

The `context.fileName` setting accepts a string or array:

```json
{
  "context": {
    "fileName": ["AGENTS.md", "GEMINI.md"]
  }
}
```

As of April 2026, `AGENTS.md` is included in the default context filename list alongside `GEMINI.md`.

### `@` import directives

```markdown
@./components/instructions.md
@../shared/style-guide.md
@/absolute/path/to/file.md
```

- Supports relative and absolute paths
- Recursive imports (files can import other files)
- Circular import prevention built in
- Import depth limit: 5 (aligned with CLAUDE.md)
- `@` inside code blocks is ignored
- Path validation prevents traversal outside project tree

### Memory commands

- `/memory show` — display loaded context
- `/memory reload` — re-scan GEMINI.md files
- `/memory add <text>` — append to `~/.gemini/GEMINI.md`

## Hooks system

Configured in `settings.json` for project/user scope, or `hooks/hooks.json` within extensions.

### Hook events (11)

| Event | When | Can Block? |
|-------|------|------------|
| `SessionStart` | Session/clear start | No |
| `SessionEnd` | CLI exit/clear | No (best-effort) |
| `BeforeAgent` | Before agent turn | Yes |
| `AfterAgent` | After agent turn | Yes (retry) |
| `BeforeModel` | Before LLM request | Yes |
| `AfterModel` | After LLM response | Yes |
| `BeforeToolSelection` | Before tool selection | Filter tools |
| `BeforeTool` | Before tool executes | Yes |
| `AfterTool` | After tool executes | Yes |
| `PreCompress` | Before context compression | Advisory |
| `Notification` | System notification | Advisory |

### Configuration format

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file",
        "sequential": true,
        "hooks": [
          {
            "name": "security-check",
            "type": "command",
            "command": "node .gemini/hooks/security.js",
            "timeout": 60000,
            "description": "Validates file writes"
          }
        ]
      }
    ]
  }
}
```

Exit code 0 = continue; exit code 2 = system block.

Hook loading precedence: Project `.gemini/settings.json` > User `~/.gemini/settings.json` > System > Extensions.

### Migration utility

Built-in `gemini hooks migrate --from-claude` converts Claude Code hooks to Gemini CLI format.

## Subagents

Full subagent support. Agents defined as markdown files with YAML frontmatter.

### Built-in subagents

- `generalist` — general-purpose with all tools
- `cli_help` — Gemini CLI features expert
- `codebase_investigator` — codebase exploration specialist

### Custom agent definition

```yaml
---
name: frontend-specialist
description: Expert frontend developer for React/TypeScript
kind: local                    # local (default) or remote
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
| `name` | string | Yes | Unique slug |
| `description` | string | Yes | What agent does; used for routing |
| `kind` | string | No | `local` or `remote` |
| `tools` | array | No | Tool allowlist. `*` = all, `mcp_*` = all MCP |
| `mcpServers` | object | No | Inline MCP servers isolated to this agent |
| `model` | string | No | Model override |
| `temperature` | number | No | 0.0-2.0 |
| `max_turns` | number | No | Max turns (default: 30) |
| `timeout_mins` | number | No | Max execution time (default: 10) |

Discovery: `.gemini/agents/*.md` (project), `~/.gemini/agents/*.md` (user), `agents/` in extensions.

Invocation: `@agent-name <task>` or automatic routing. Supports parallel subagents.

Frontmatter is mandatory — agents without YAML frontmatter fail to load.

## Custom slash commands

Defined as `.toml` files in `commands/` directories.

```toml
# plan.toml -> creates /plan command
prompt = """
Create a step-by-step implementation plan for: {{args}}
"""
description = "Create an implementation plan"
```

Features: `{{args}}` argument substitution, `!{command}` shell execution, `@{path/to/file}` file injection.

Locations: `~/.gemini/commands/` (global), `.gemini/commands/` (project), `commands/` in extensions.

## Policy engine

Extensions can contribute policy rules via `.toml` files in `policies/`.

```toml
[[rule]]
toolName = "run_shell_command"
commandPrefix = "rm -rf"
decision = "deny"
priority = 100
```

Extensions cannot set `allow` decisions or enable YOLO mode (security restriction).

## MCP servers

Configured in `gemini-extension.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

The `trust` MCP config option is not supported for extension-bundled servers. MCP Prompts from configured servers are exposed as slash commands. Subagents can define their own isolated `mcpServers`.

## Built-in tools

| Tool | Claude Code equivalent |
|------|----------------------|
| `read_file` | `Read` |
| `read_many_files` | Multiple `Read` calls |
| `list_directory` | `Bash` with `ls` |
| `write_file` | `Write` |
| `replace` | `Edit` |
| `glob` | `Glob` |
| `grep_search` | `Grep` |
| `run_shell_command` | `Bash` |
| `web_fetch` | `WebFetch` |
| `google_web_search` | `WebSearch` |
| `save_memory` | N/A (built-in memory) |

No subagent dispatch tool — uses `@agent-name` syntax instead.

## Portability-relevant limitations

1. Extensions require CLI restart after changes
2. No interactive install inside CLI — must run from normal terminal
3. `GEMINI.md` instructions may not be reliably followed unless explicitly referenced
4. `@` import processor originally triggered on any `@` followed by a path-like string (improved but edge cases remain)
5. Extension `name` must exactly match directory name (lowercase, dashes only)
6. Extension policies cannot grant `allow` decisions
7. Subagent frontmatter is mandatory — files without YAML frontmatter silently fail
8. Hooks configured in `settings.json` for project/user scope, or `hooks/hooks.json` within extensions
9. No `trust` option in extension MCP servers
10. Hook event names use PascalCase (unlike Cursor's camelCase or Claude Code's PascalCase)

## Assessment criteria

### Extension packaging

Score 3 when:
- `gemini-extension.json` present with name, version, description
- `contextFileName` correctly set
- MCP servers configured if applicable

Score 2 when:
- Manifest exists but is missing optional fields
- `GEMINI.md` present but not referenced in manifest

Score 1 when:
- No manifest but `GEMINI.md` exists

Score 0 when:
- No recognizable Gemini CLI extension structure

### Context file quality

Score 3 when:
- `GEMINI.md` present with complete `@` include directives for all skills
- Each skill has both SKILL.md and gemini-tools.md includes
- Appropriate use of modular `@` imports

Score 2 when:
- `GEMINI.md` exists but missing some skill includes

Score 1 when:
- `GEMINI.md` exists but is static prose (no `@` includes)

Score 0 when:
- No `GEMINI.md` or context delivery

### Skill compatibility

Score 3 when:
- Skills in `skills/<name>/SKILL.md` with proper frontmatter
- `references/gemini-tools.md` sidecar present per skill
- No dependency on tools unavailable in Gemini CLI (e.g., `Task` / subagent dispatch)

Score 2 when:
- Skills present with frontmatter but missing gemini-tools sidecar

Score 1 when:
- Skills reference Claude-specific tools without mapping

Score 0 when:
- Skills cannot function in Gemini CLI

### Hook compatibility

Score 3 when:
- Hooks configured in `settings.json` format (not standalone hooks.json)
- Event names use Gemini's PascalCase
- `BeforeTool`/`AfterTool` used (not `PreToolUse`/`PostToolUse`)

Score 2 when:
- Claude Code hooks exist and can be migrated via `gemini hooks migrate --from-claude`

Score 1 when:
- Hooks exist but use incompatible event names or output format

Score 0 when:
- No hooks or hooks cannot be adapted
