# OpenCode Plugin Ecosystem

This document describes the OpenCode plugin ecosystem as it relates to portability assessment and uplift.

## Plugin structure

An OpenCode plugin is a JavaScript or TypeScript module that exports plugin functions. There is no declarative manifest file — plugins are code files placed in the right directory or referenced from `opencode.json`.

### Plugin locations

| Scope | Path |
|-------|------|
| Project | `.opencode/plugins/<name>.ts` or `.opencode/plugins/<name>.js` |
| Global | `~/.config/opencode/plugins/<name>.ts` or `~/.config/opencode/plugins/<name>.js` |
| npm packages | Listed in `opencode.json` under `"plugin"` array |

Both `plugin/` (singular) and `plugins/` (plural) are accepted.

### Plugin code structure

```typescript
import type { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  // ctx.client   - SDK client for API calls
  // ctx.project  - Current project info
  // ctx.directory - Current working directory
  // ctx.worktree - Git worktree path
  // ctx.$        - Bun's shell API for commands
  
  return {
    // hooks go here
  };
};
```

### Broader repo layout for portability

While OpenCode itself only needs the plugin code file, a portable repo targeting OpenCode should include:

```
my-plugin/
  .opencode/
    plugins/
      <name>.js              # plugin entrypoint
  opencode.json              # configuration (optional)
  skills/
    <skill-name>/
      SKILL.md               # skill entrypoint
  AGENTS.md                  # primary context file for OpenCode
  package.json               # npm metadata
```

## Configuration (`opencode.json`)

OpenCode uses `opencode.json` (or `opencode.jsonc`) with schema at `https://opencode.ai/config.json`.

Config precedence:
1. Remote config (`.well-known/opencode`) — organizational defaults
2. Global config (`~/.config/opencode/opencode.json`)
3. Custom config (`OPENCODE_CONFIG` env var)
4. Project config (`opencode.json` in project root)
5. `.opencode` directories
6. Inline config (`OPENCODE_CONFIG_CONTENT` env var)

Key fields:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true,
  "plugin": ["plugin-name"],
  "instructions": ["CONTRIBUTING.md", "docs/guidelines.md"],
  "mcp": { ... },
  "agent": { ... },
  "permission": { ... }
}
```

## Installation and discovery

Two installation methods:

| Method | Mechanism |
|--------|-----------|
| Local files | Drop `.js`/`.ts` into `.opencode/plugins/` or `~/.config/opencode/plugins/` |
| npm packages | Add to `"plugin"` array in `opencode.json` |

npm plugins installed automatically using Bun at startup. Cached in `~/.cache/opencode/node_modules/`.

Load order: global config plugins → project config plugins → global plugin dir → project plugin dir.

Local plugin dependencies need a `package.json` within the `.opencode/` directory.

## Skills system

OpenCode has a native skills system highly compatible with Claude Code's.

### Skill discovery paths

All searched, with multi-path compatibility:

| Path | Origin |
|------|--------|
| `.opencode/skills/<name>/SKILL.md` | OpenCode native |
| `~/.config/opencode/skills/<name>/SKILL.md` | OpenCode global |
| `.claude/skills/<name>/SKILL.md` | Claude-compatible (project) |
| `~/.claude/skills/<name>/SKILL.md` | Claude-compatible (global) |
| `.agents/skills/<name>/SKILL.md` | Agent-compatible (project) |
| `~/.agents/skills/<name>/SKILL.md` | Agent-compatible (global) |

For project-local paths, OpenCode walks up from CWD to git worktree root.

### SKILL.md frontmatter

```yaml
---
name: my-skill          # required, must match folder name
description: Does X     # required
license: MIT            # optional
compatibility: opencode # optional
metadata:               # optional, string-to-string map
  key: value
---
```

Invocation: agents invoke via the `skill` tool. Full content loads on demand. Permissions configurable: `allow`, `deny`, `ask`.

## Context files (instructions)

OpenCode uses a "first type wins" strategy:

| File Type | Priority |
|-----------|----------|
| `AGENTS.md` | Primary (recommended) |
| `CLAUDE.md` | Secondary (fallback, only if no `AGENTS.md` exists) |
| `CONTEXT.md` | Tertiary (deprecated) |

If any `AGENTS.md` is found, all `CLAUDE.md` files are ignored entirely.

Search order:
1. Local files traversing up from CWD to git root
2. `.opencode/AGENTS.md` (loaded in addition to root-level files)
3. Global `~/.config/opencode/AGENTS.md`
4. Claude Code fallback `~/.claude/CLAUDE.md` (if no global `AGENTS.md`)

Additional instruction files via config:
```json
{
  "instructions": ["CONTRIBUTING.md", "docs/guidelines.md"]
}
```

No `@`-include syntax — use the `"instructions"` array for additional files.

## Hooks (lifecycle events)

Plugins return a hooks object. Comprehensive hook system, all in code:

| Hook | Purpose | Can Modify |
|------|---------|-----------|
| `config` | Inject commands, agents, MCP servers at init | Config object |
| `tool` | Register custom tools | N/A |
| `auth` | Register auth providers | N/A |
| `event` | Subscribe to system events | N/A (observer) |
| `chat.message` | Process incoming/outgoing messages | Message and parts |
| `chat.params` | Modify LLM parameters | Temperature, topP |
| `permission.ask` | Handle permission requests | Status |
| `tool.execute.before` | Pre-execution hook | Tool arguments |
| `tool.execute.after` | Post-execution hook | Tool output |
| `experimental.text.complete` | Post-generation modification | Generated text |
| `experimental.chat.messages.transform` | Transform messages before LLM call | All messages |
| `experimental.chat.system.transform` | Transform system prompt | System prompt |
| `experimental.session.compacting` | Before compaction summary | Context |

### Event types for `event` hook

`session.created`, `session.deleted`, `session.idle`, `session.error`, `session.compacted`, `message.updated`, `message.removed`, `message.part.updated`, `tool.execute.before`, `tool.execute.after`, `file.edited`, `file.watcher.updated`, `permission.updated`, `permission.replied`, `server.connected`

### Message transform for session-start injection

```typescript
export const MyPlugin = () => ({
  "experimental.chat.messages.transform": (_input: any, output: any) => {
    if (output?.messages && Array.isArray(output.messages)) {
      for (const msg of output.messages) {
        const role = msg.info?.role || msg.role;
        if (role === "user" && msg.parts) {
          for (const part of msg.parts) {
            if (part.type === "text") {
              part.text = `PREFIX: ${part.text}`;
            }
          }
        }
      }
    }
  },
});
```

Important: message role is at `msg.info.role`, not `msg.role`.

## MCP servers

Three transport types in `opencode.json`:

```json
{
  "mcp": {
    "local-server": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-command"],
      "enabled": true,
      "environment": { "MY_VAR": "value" }
    },
    "remote-server": {
      "type": "remote",
      "url": "https://my-mcp-server.com",
      "headers": { "Authorization": "Bearer KEY" }
    },
    "http-server": {
      "type": "http",
      "url": "https://my-mcp-server.com"
    }
  }
}
```

Plugins can inject MCP servers programmatically via the `config` hook.

## Built-in tools

| Tool | Claude Code equivalent |
|------|----------------------|
| `read` | `Read` |
| `edit` | `Edit` |
| `write` | `Write` |
| `bash` | `Bash` |
| `glob` | `Glob` |
| `grep` | `Grep` |
| `list` | `Bash` with `ls` |
| `task` | `Agent` / `Task` |
| `todowrite` / `todoread` | `TodoWrite` |
| `websearch` | `WebSearch` |
| `webfetch` | `WebFetch` |
| `question` | N/A (ask user) |
| `skill` | `Skill` |

Tools use ripgrep under the hood and respect `.gitignore`.

## Portability-relevant limitations

1. No plugin manifest file — metadata is in code, not declarative JSON
2. `experimental.*` hooks are unstable and may change
3. Message structure quirk: role at `msg.info.role`, not `msg.role`
4. `chat.message` hook delivers empty `parts` array — use `experimental.chat.messages.transform` instead
5. Plugin reload requires restart
6. Skill names must be unique across all locations (duplicates silently skipped)
7. "First type wins" rule: if any `AGENTS.md` exists, all `CLAUDE.md` files are ignored
8. No `@`-include syntax in instruction files
9. Bun dependency for plugin runtime and npm installation
10. No plugin-level skill registration API — skills must be filesystem-based
11. Local plugin dependencies need explicit `package.json` in `.opencode/`

## Assessment criteria

### Plugin packaging

Score 3 when:
- `.opencode/plugins/<name>.js` plugin entrypoint present
- `opencode.json` configured with plugin reference if npm-distributed
- `package.json` present with correct `main` pointing to plugin

Score 2 when:
- Plugin code exists but `opencode.json` not configured

Score 1 when:
- No OpenCode plugin but skills are in compatible discovery paths

Score 0 when:
- No OpenCode-compatible structure

### Context delivery

Score 3 when:
- `AGENTS.md` present (preferred over `CLAUDE.md` for OpenCode)
- Skills are in discovery-compatible paths (`.opencode/skills/` or `.agents/skills/` or `skills/`)
- Context accurately describes plugin capabilities

Score 2 when:
- `CLAUDE.md` present (works as fallback if no `AGENTS.md`)

Score 1 when:
- No context file but skills are self-documenting

Score 0 when:
- No context delivery mechanism

### Session-start injection

Score 3 when:
- Plugin uses `experimental.chat.messages.transform` for bootstrap content injection
- Transform correctly uses `msg.info.role` (not `msg.role`)
- Bootstrap content is injected into first user message

Score 2 when:
- Plugin uses `config` hook to inject commands/agents but not message transform

Score 1 when:
- No session-start injection but `AGENTS.md` provides equivalent context

Score 0 when:
- No mechanism for session-start behavior

### Skill compatibility

Score 3 when:
- Skills in `skills/<name>/SKILL.md` with proper frontmatter
- Skills do not reference tools unavailable in OpenCode
- No dependency on Skill tool invocation (OpenCode uses `skill` tool natively)

Score 2 when:
- Skills present but reference Claude-specific tool names without mapping

Score 1 when:
- Skills exist but are tightly coupled to Claude Code

Score 0 when:
- Skills cannot function in OpenCode
