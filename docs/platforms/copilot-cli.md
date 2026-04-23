# GitHub Copilot CLI Ecosystem

This document describes the GitHub Copilot CLI and Copilot Extensions ecosystem as it relates to portability assessment and uplift.

## Two distinct extension concepts

The Copilot ecosystem has two extension models that must not be confused:

### Copilot Extensions (server-side)

GitHub App-based integrations invoked via `@extension-name` in Copilot Chat. Two flavors:

- **Skillsets**: up to 5 API endpoints. Copilot handles prompt crafting and response generation. Configured through GitHub App settings UI — no repo files.
- **Extension Agents**: full-control server-side agents. Your server receives conversations, processes with your own logic, and returns SSE-formatted responses.

Both are installed via GitHub Marketplace. These are not relevant to file-based portability.

### Custom Agents (repo-based)

Markdown files at `.github/agents/` that customize Copilot's behavior. This is the relevant model for portability.

## Plugin-equivalent structure

Copilot does not have a plugin manifest like `.claude-plugin/plugin.json`. Instead, it uses a collection of dotfile conventions within `.github/`:

### Canonical layout

```
my-repo/
  .github/
    copilot-instructions.md    # repo-wide context (always loaded)
    instructions/              # path-specific instructions
      typescript.instructions.md
      python.instructions.md
    agents/                    # custom agent definitions
      security-reviewer.agent.md
    skills/                    # agent skills (open standard)
      <skill-name>/
        SKILL.md
    hooks/                     # lifecycle hooks
      pre-tool-use.json
    prompts/                   # reusable prompt templates (VS Code only)
      plan.prompt.md
  AGENTS.md                    # cross-platform context (Copilot reads this)
  CLAUDE.md                    # cross-platform context (Copilot reads this)
  GEMINI.md                    # cross-platform context (Copilot reads this)
```

## No manifest file

Copilot does not use a plugin manifest. Components are auto-discovered from `.github/` directories. There is no equivalent of `plugin.json` or `gemini-extension.json`.

For portability purposes, the repo's existing manifests for other platforms serve as the metadata source.

## Installation and discovery

### Custom agents

| Scope | Path |
|-------|------|
| Repository | `.github/agents/<name>.agent.md` or `.github/agents/<name>.md` |
| Organization | `agents/<name>.agent.md` in `.github-private` repo |
| Personal (CLI) | `~/.copilot/agents/<name>.agent.md` |

### Skills

| Scope | Path |
|-------|------|
| Repository | `.github/skills/<name>/SKILL.md` |
| Personal (CLI) | `~/.copilot/skills/<name>/SKILL.md` |
| Cross-platform | `.claude/skills/`, `.agents/skills/` also discovered |

Skills follow the open Agent Skills spec at agentskills.io — works across Copilot, Claude Code, Cursor, Codex, and Gemini.

CLI commands: `gh skill install`, `gh skill update`, `gh skill publish`

## Context files and instructions

Three levels of instruction customization:

### Repository-wide instructions

`.github/copilot-instructions.md` — the primary repo-wide context file. Plain markdown, no frontmatter needed. Automatically injected into every Copilot interaction.

### Path-specific instructions

`.github/instructions/*.instructions.md` — file-pattern-scoped instructions.

```markdown
---
applyTo: "**/*.ts,**/*.tsx"
excludeAgent: "code-review"
---
# TypeScript Guidelines
Use functional components with TypeScript interfaces.
```

| Field | Type | Description |
|-------|------|-------------|
| `applyTo` | string | Comma-separated glob patterns |
| `excludeAgent` | string | Exclude from `code-review` or `cloud-agent` |

### Cross-platform context

Copilot also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root as instruction files.

### Personal and org instructions

- Personal: GitHub.com UI settings
- Organization: GitHub.com org settings
- `copilot init` CLI command scaffolds instruction files

## Skills system

Skills follow the open SKILL.md standard with YAML frontmatter.

### SKILL.md frontmatter

`name` (required), `description` (required), `license` (optional).

Copilot loads skills based on task relevance — the description drives when injection happens. All files in the skill directory are auto-discovered.

### Prompt files (VS Code only)

`.github/prompts/*.prompt.md` — reusable prompt templates with input variables. Not supported in CLI or GitHub.com.

## Hooks system

Hooks execute shell commands at lifecycle events. Available in Cloud Agent (GA), Copilot CLI (GA), VS Code (preview).

### Configuration

`.github/hooks/*.json` files. Must be on default branch for Cloud Agent.

### Hook events

| Event | Trigger | Can Block? |
|-------|---------|-----------|
| `sessionStart` | New/resumed session | No |
| `sessionEnd` | Session completes | No |
| `userPromptSubmitted` | User submits prompt | No |
| `preToolUse` | Before tool call | Yes |
| `postToolUse` | After tool completes | No (can modify result) |
| `errorOccurred` | Error during execution | No |
| `agentStop` | Main agent finishes | No |
| `subagentStop` | Subagent completes | No |

VS Code uses PascalCase event names (preview): `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `SubagentStart`, `SubagentStop`, `Stop`.

### Hook JSON format

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./scripts/check-tool.sh",
        "powershell": ".\\scripts\\check-tool.ps1",
        "cwd": ".",
        "env": { "MY_VAR": "value" },
        "timeoutSec": 30
      }
    ]
  }
}
```

Key differences from Claude Code hooks:
- No `matcher` field — filtering must be done in script by inspecting `toolName`
- Separate `bash` and `powershell` fields (not a single `command`)
- Default timeout 30 seconds
- Only `preToolUse` can block (exit code to deny)
- Hooks are command-only — no prompt-based hooks

## Custom agents

`.github/agents/<name>.agent.md` — markdown files with YAML frontmatter.

```yaml
---
name: 'Security Auditor'
description: 'Security code review specialist'
tools: ['read', 'search', 'grep', 'glob', 'view']
model: 'Claude Sonnet 4.5'
target: 'vscode'                    # or 'github-copilot', or omit for both
user-invocable: true
disable-model-invocation: false
mcp-servers:
  my-server:
    type: http
    url: https://example.com/mcp
    tools: ['*']
metadata:
  team: security
---
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Optional display name |
| `description` | string | Required; used for auto-routing |
| `tools` | array | Tool allowlist (defaults to all) |
| `model` | string | Recommended model |
| `target` | string | `vscode`, `github-copilot`, or omit for both |
| `user-invocable` | boolean | Default true |
| `disable-model-invocation` | boolean | Prevent auto-routing |
| `mcp-servers` | object | Agent-specific MCP servers |
| `metadata` | object | Arbitrary metadata |

Prompt body limited to 30,000 characters.

### Built-in CLI subagents

`explore`, `task`, `research`, `code-review`, `general-purpose`, `plan`.

## MCP support

MCP supported across all Copilot surfaces:

| Surface | Local (stdio) | Remote (HTTP/SSE) |
|---------|--------------|-------------------|
| VS Code | Yes | Yes |
| JetBrains | Yes | Yes |
| Copilot CLI | Yes | Yes |
| Cloud Agent | No | Yes (repo settings only) |

CLI config: `~/.copilot/mcp-config.json` or `/mcp add` interactive command.

Custom agents can define their own MCP servers in frontmatter via `mcp-servers`.

GitHub MCP Server is built into CLI — provides tools for repos, issues, PRs, code security, actions.

## Copilot CLI

Full terminal-native coding agent (GA February 2026). Node.js 22+ required.

### Operational modes

- **Interactive**: conversational, approve each action
- **Plan mode** (`--plan`): creates implementation plans before coding
- **Autopilot mode** (`--autopilot`): fully autonomous

### Key flags

- `--agent=AGENT` — specify custom agent
- `--allow-tool`, `--deny-tool` — granular tool permissions
- `--allow-all` / `--yolo` — enable all permissions
- `--resume` — resume sessions

### Cloud Agent (Coding Agent)

Asynchronous, runs in GitHub Actions environment. Assign via Issues (`assignee: Copilot`), `@copilot` mentions, or CLI. Opens draft PRs, runs security scanning.

## Built-in tools

| Tool | Claude Code equivalent |
|------|----------------------|
| `bash` / `powershell` | `Bash` |
| `view` | `Read` |
| `create` | `Write` |
| `edit` / `apply_patch` | `Edit` |
| `grep` / `rg` | `Grep` |
| `glob` | `Glob` |
| `web_fetch` | `WebFetch` |
| `skill` | `Skill` |
| `ask_user` | N/A |
| `store_memory` | N/A (persistent memory) |
| `update_todo` | `TodoWrite` |
| `task_complete` | N/A (autopilot only) |

## Portability-relevant limitations

1. No plugin manifest — no `.copilot-plugin/plugin.json` equivalent
2. Extension Agents (server-side) require publicly accessible HTTPS endpoint — not file-based
3. Skillsets limited to 5 skills per GitHub App
4. Custom agent prompts limited to 30,000 characters
5. No `matcher` field on hooks — filtering in script
6. Only `preToolUse` can block; other hooks are observational
7. Hooks are command-only — no prompt-based hooks
8. Prompt files not supported in CLI or GitHub.com (VS Code only)
9. Cloud Agent: only remote MCP (no local stdio), no MCP Resources/Prompts, no OAuth auth
10. Cloud Agent hooks must be on default branch
11. VS Code and CLI/Cloud use different event naming (PascalCase vs camelCase)

## Assessment criteria

### Packaging and discovery

Score 3 when:
- `.github/copilot-instructions.md` present with accurate project context
- Skills in `.github/skills/<name>/SKILL.md` or cross-platform `skills/` path
- Custom agents in `.github/agents/` if applicable

Score 2 when:
- `AGENTS.md` or `CLAUDE.md` present (Copilot reads these) but no `.github/` structure

Score 1 when:
- Skills exist in other platform paths that Copilot auto-discovers

Score 0 when:
- No Copilot-compatible structure

### Instruction coverage

Score 3 when:
- `.github/copilot-instructions.md` for repo-wide context
- Path-specific `.github/instructions/*.instructions.md` where applicable
- Instructions match actual repo structure and conventions

Score 2 when:
- Only `AGENTS.md`/`CLAUDE.md` providing context (no Copilot-specific instructions)

Score 1 when:
- Minimal or generic instructions

Score 0 when:
- No instruction files

### Hook compatibility

Score 3 when:
- `.github/hooks/*.json` files with correct format
- Separate `bash` and `powershell` fields for cross-platform
- Scripts handle their own tool name filtering (no `matcher`)

Score 2 when:
- Hooks from other platform can be adapted
- Only bash scripts (no powershell)

Score 1 when:
- Hooks exist but use incompatible format or output structure

Score 0 when:
- No hooks or hooks cannot be adapted

### Skill compatibility

Score 3 when:
- Skills in standard `skills/<name>/SKILL.md` with frontmatter
- `references/copilot-tools.md` sidecar present per skill
- No dependency on Claude-specific tool names

Score 2 when:
- Skills present with frontmatter but missing tool mapping sidecar

Score 1 when:
- Skills reference tools not available in Copilot CLI

Score 0 when:
- Skills cannot function in Copilot CLI

### Agent compatibility

Score 3 when:
- `.github/agents/*.agent.md` with proper frontmatter
- Tool restrictions appropriate for agent role
- Description drives correct auto-routing

Score 2 when:
- Agent definitions exist in other platform format (can be adapted)

Score 1 when:
- Agent prompts exist but lack proper frontmatter

Score 0 when:
- No agent definitions
