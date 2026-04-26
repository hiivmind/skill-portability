# OpenClaw Plugin Ecosystem

This document describes the OpenClaw plugin ecosystem as it relates to portability assessment and uplift. OpenClaw is an AI agent gateway/orchestrator that receives requests from messaging channels (Telegram, Discord, Slack, etc.) and delegates work to coding agents. It has a mature plugin system built on a TypeScript SDK with in-process plugin loading.

Official docs: [docs.openclaw.ai](https://docs.openclaw.ai/plugin) | GitHub: [openclaw/openclaw](https://github.com/openclaw/openclaw) | Registry: [ClawHub](https://clawhub.ai)

## 1. Plugin Structure

OpenClaw recognizes two plugin formats: **native plugins** and **bundle plugins** ([source](https://docs.openclaw.ai/plugin)).

| Format | How it works | Examples |
|--------|-------------|----------|
| Native | `openclaw.plugin.json` + TypeScript runtime module; executes in-process | Official plugins, community npm packages |
| Bundle | Codex/Claude/Cursor-compatible layout; mapped to OpenClaw features | `.codex-plugin/`, `.claude-plugin/`, `.cursor-plugin/` |

### Native plugin layout

```
my-plugin/
  openclaw.plugin.json         # plugin manifest (required)
  package.json                 # npm package with openclaw.extensions
  index.ts                     # entry point (register function)
  skills/
    <skill-name>/
      SKILL.md                 # skill entrypoint (AgentSkills-compatible)
  src/                         # plugin source
```

### Bundle plugin layout (auto-detected)

OpenClaw auto-detects plugins that use `.claude-plugin/`, `.codex-plugin/`, or `.cursor-plugin/` directory layouts. Bundle plugins are normalized into registry records without importing runtime code. Current bundle support includes skills, Claude command-skills, Claude `settings.json` defaults, Claude `.lsp.json` entries, Cursor command-skills, and compatible Codex hook directories ([source](https://docs.openclaw.ai/plugin)).

### Plugin discovery and precedence

OpenClaw scans for plugins in this order (first match wins) ([source](https://open-claw.bot/docs/tools/plugins/)):

1. **Config paths** -- `plugins.load.paths` in `openclaw.json`
2. **Workspace extensions** -- `<workspace>/.openclaw/extensions/*.ts`
3. **Global extensions** -- `~/.openclaw/extensions/*.ts`
4. **Bundled plugins** -- shipped with OpenClaw (some enabled by default)

Workspace-origin plugins are disabled by default and must be explicitly enabled.

### Deployment shapes

| Shape | Description |
|-------|-------------|
| `plain-capability` | One capability type (e.g. provider-only) |
| `hybrid-capability` | Multiple capability types (e.g. provider + speech) |
| `hook-only` | Only hooks, no capabilities |
| `non-capability` | Tools/commands/services but no capabilities |

Inspect with `openclaw plugins inspect <id>` ([source](http://docs.openclaw.ai/plugins/sdk-entrypoints)).

## 2. Manifest

### `openclaw.plugin.json` (required)

Every native plugin needs an `openclaw.plugin.json` manifest. Missing or invalid manifests block config validation and are treated as plugin errors ([source](https://www.glukhov.org/ai-systems/openclaw/plugins/)).

Required fields: `id`, `configSchema`.

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "description": "Adds a custom tool to OpenClaw",
  "configSchema": {
    "type": "object",
    "additionalProperties": false
  }
}
```

The `id` must match the entry point's `id` field in `definePluginEntry()` ([source](http://docs.openclaw.ai/plugins/sdk-entrypoints)).

### `package.json` (required for npm distribution)

Native plugin npm packages must declare `openclaw.extensions` in `package.json`. Each entry must resolve to a readable runtime file or TypeScript source with an inferred built JavaScript peer ([source](https://docs.openclaw.ai/plugin)).

```json
{
  "name": "@myorg/openclaw-my-plugin",
  "version": "1.0.0",
  "type": "module",
  "openclaw": {
    "extensions": ["./index.ts"],
    "runtimeExtensions": ["./dist/index.js"],
    "compat": {
      "pluginApi": ">=2026.3.24-beta.2",
      "minGatewayVersion": "2026.3.24-beta.2"
    }
  }
}
```

| Field | Purpose |
|-------|---------|
| `openclaw.extensions` | Entry point paths (source) |
| `openclaw.runtimeExtensions` | Published runtime file paths (must match 1:1 with `extensions`) |
| `openclaw.compat.pluginApi` | Minimum plugin API version |
| `openclaw.compat.minGatewayVersion` | Minimum gateway version |

### `agents.list[]` configuration

Agents are declared in `openclaw.json` (not in the plugin manifest). The `agents.list[]` array configures agent identity, model, skill allowlists, and sandbox settings ([source](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)):

```json5
{
  agents: {
    defaults: {
      skills: ["github", "weather"],
    },
    list: [
      { id: "writer" },                          // inherits default skills
      { id: "docs", skills: ["docs-search"] },    // replaces defaults
      { id: "locked-down", skills: [] },          // no skills
    ],
  },
}
```

Rules:
- Omit `agents.defaults.skills` for unrestricted skills by default.
- Omit `agents.list[].skills` to inherit `agents.defaults.skills`.
- Set `agents.list[].skills: []` for no skills.
- A non-empty `agents.list[].skills` list is the **final** set for that agent -- it does not merge with defaults.

### Model format

OpenClaw uses `provider/model` format instead of Claude shortnames:

| Claude shortname | OpenClaw format |
|-----------------|-----------------|
| `opus` | `anthropic/claude-opus-4-6` |
| `sonnet` | `anthropic/claude-sonnet-4-5` |
| `haiku` | `anthropic/claude-haiku-4-5` |

OpenClaw supports 30+ model providers including Anthropic, OpenAI, Google, Mistral, OpenRouter, Together, and others ([source](https://docs.openclaw.ai/plugin)).

## 3. Skills

OpenClaw uses [AgentSkills](https://agentskills.io)-compatible skill folders. Each skill is a directory containing a `SKILL.md` with YAML frontmatter and instructions ([source](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)).

### SKILL.md format

```markdown
---
name: image-lab
description: Generate or edit images via a provider-backed image workflow
metadata: {"openclaw": {"requires": {"bins": ["uv"], "env": ["GEMINI_API_KEY"]}}}
---

Instructions for the agent...
```

The parser supports **single-line** frontmatter keys only; `metadata` must be a **single-line JSON object**. Use `{baseDir}` in instructions to reference the skill folder path ([source](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)).

### Optional frontmatter keys

| Key | Purpose |
|-----|---------|
| `name` | Skill identifier (required) |
| `description` | Brief description (required) |
| `homepage` | URL surfaced as "Website" in Skills UI |
| `command` | When `true`, exposed as a user slash command |
| `exclude-from-prompt` | When `true`, excluded from model prompt |
| `command-dispatch` | When set to `tool`, bypasses model and dispatches directly |
| `command-dispatch-tool` | Tool name to invoke for direct dispatch |
| `metadata` | Single-line JSON with gating, install specs, and config |

### Skill locations and precedence

| Priority | Source | Path |
|----------|--------|------|
| 1 (highest) | Workspace skills | `<workspace>/skills` |
| 2 | Project agent skills | `<workspace>/.agents/skills` |
| 3 | Personal agent skills | `~/.agents/skills` |
| 4 | Managed/local skills | `~/.openclaw/skills` |
| 5 | Bundled skills | shipped with the install |
| 6 (lowest) | Extra skill folders | `skills.load.extraDirs` config |

If a skill name conflicts, the highest source wins ([source](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)).

### Skill gating (load-time filters)

Skills can declare requirements under `metadata.openclaw.requires`:

| Gate | Description |
|------|-------------|
| `bins` | Each binary must exist on `PATH` |
| `binsAnyOf` | At least one must exist on `PATH` |
| `env` | Environment variable must exist or be provided in config |
| `config` | List of `openclaw.json` paths that must be truthy |

Skills without `metadata.openclaw` are always eligible unless disabled in config.

### Plugin-shipped skills

Plugins can ship their own skills by listing `skills` directories in `openclaw.plugin.json` (paths relative to the plugin root). Plugin skills load when the plugin is enabled and participate in normal skill precedence rules at the lowest tier alongside `extraDirs` ([source](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)).

### Skill discovery

Skills are snapshotted when a session starts and reused for subsequent turns. Changes take effect on the next new session. A file watcher (`skills.load.watch: true`, default) can refresh mid-session when `SKILL.md` files change ([source](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)).

## 4. Context Files

OpenClaw automatically injects workspace markdown files into the system prompt on every turn. These consume tokens and should be kept concise ([source](https://github.com/openclaw/openclaw/blob/e635cedb/docs/concepts/system-prompt.md)).

### Injected context files (all from `~/.openclaw/workspace/`)

| File | Purpose | Priority |
|------|---------|----------|
| `AGENTS.md` | Operating rules, security, workflow instructions | Highest (loaded first) |
| `SOUL.md` | Personality, values, constraints | Second |
| `TOOLS.md` | Environment info, tool configuration | Third |
| `IDENTITY.md` | Name, emoji, avatar | Fourth |
| `USER.md` | User personal context | Fifth |
| `HEARTBEAT.md` | Scheduled tasks and proactive checks | Sixth |
| `MEMORY.md` | Long-term curated memories | Seventh |
| `BOOTSTRAP.md` | First-run setup only (deleted after) | Only on new workspaces |

All files are injected into the context window on every turn ([source](https://github.com/openclaw/openclaw/blob/e635cedb/docs/concepts/system-prompt.md)).

### Truncation controls

| Config key | Default | Purpose |
|-----------|---------|---------|
| `agents.defaults.bootstrapMaxChars` | 20000 | Max per-file size |
| `agents.defaults.bootstrapTotalMaxChars` | 150000 | Total injected content cap |
| `agents.defaults.bootstrapPromptTruncationWarning` | `once` | Warning on truncation (`off`, `once`, `always`) |

### Sub-agent context

Sub-agent sessions only inject `AGENTS.md` and `TOOLS.md` (other bootstrap files are filtered out to keep the sub-agent context small) ([source](https://github.com/openclaw/openclaw/blob/e635cedb/docs/concepts/system-prompt.md)).

### Portability note

`AGENTS.md` is the primary context file for OpenClaw and the universal fallback for cross-platform plugins. Every platform except Claude Code reads `AGENTS.md`. OpenClaw does not read `CLAUDE.md` or `GEMINI.md`.

## 5. Hooks

OpenClaw hooks are **SDK-based, not file-based**. There is no `hooks.json` or `hooks/` directory. All hooks are registered via the TypeScript Plugin SDK ([source](https://openclaw-openclaw.mintlify.app/plugins/plugin-sdk)).

### Registration API

```typescript
// Single event
api.registerHook("llm_input", async (event, ctx) => {
  api.logger.info(`LLM call: ${event.provider}/${event.model}`);
});

// Multiple events
api.registerHook(["message_received", "message_sent"], handler);

// Alternative typed API
api.on("llm_input", async (event, ctx) => {
  api.logger.info(`Model: ${event.model}`);
});
```

Hooks accept an optional `{ priority?: number }` option for ordering ([source](https://github.com/openmetaloom/657c4668c09d235f8da1306e2438904b)).

### Known hook events

| Event | Description | Guard behavior |
|-------|-------------|---------------|
| `before_tool_call` | Before an agent tool executes | `{ block: true }` is terminal; stops lower-priority handlers |
| `after_tool_call` | After tool execution | Observe results |
| `tool_result_persist` | Tool result persistence | -- |
| `llm_input` | Before LLM call | Observe provider/model |
| `llm_output` | After LLM produces output | -- |
| `message_received` | Inbound message | Typed `threadId` for routing |
| `message_sent` | Outbound message | -- |
| `message_sending` | Before message send | `{ cancel: true }` is terminal |
| `before_agent_finalize` | Before agent finalizes | -- |
| `agent_end` | Agent run ends | -- |
| `before_model_resolve` | Before model resolution | Model switching |
| `before_compaction` | Before context compaction | Channel notification ([source](https://github.com/openclaw/openclaw/issues/55745)) |
| `after_compaction` | After context compaction | -- |
| `before_install` | Before plugin install | `{ block: true }` is terminal |
| `command` | Slash command issued | ([source](https://github.com/openclaw/openclaw/issues/25074)) |
| `gateway:startup` | Gateway starts | -- |
| `session:compact:before` | Session compaction | Automation hooks (shell scripts) |

### Mapping from Claude Code events

| Claude Code event | OpenClaw equivalent |
|-------------------|---------------------|
| `PreToolUse` | `before_tool_call` (plugin SDK) |
| `PostToolUse` | `tool_result_persist` (plugin SDK) |
| `SessionStart` | `gateway:startup` (plugin SDK) |
| `PreCompact` | `session:compact:before` (plugin SDK) |
| `Stop` | No direct equivalent |

Event names are **snake_case** (not PascalCase like Claude Code or camelCase like Cursor).

### Hook configuration notes

- Non-bundled conversation hooks (`llm_input`, `llm_output`, `before_agent_finalize`, `agent_end`) require `plugins.entries.<id>.hooks.allowConversationAccess=true` ([source](https://docs.openclaw.ai/plugin)).
- Async handlers are fully supported.
- Hook guard behavior: `{ block: true }` and `{ cancel: true }` are terminal -- lower-priority handlers are skipped. `{ block: false }` / `{ cancel: false }` are no-ops.
- Config changes require a gateway restart (auto-restart is default behavior).

## 6. Tool Mapping

OpenClaw shares most tool names with Claude Code but has significant differences for agent dispatch, task tracking, and skill invocation.

| Claude Code tool | OpenClaw equivalent | Notes |
|-----------------|---------------------|-------|
| `Read` | `Read` | Same |
| `Write` | `Write` | Same |
| `Edit` | `Edit` | Same |
| `Bash` | `Bash` | Same |
| `Grep` | `Grep` | Same |
| `Glob` | `Glob` | Same |
| `Task` | `agents.list[]` | Configured in manifest, not a tool |
| `Agent` | `agents.list[]` | Configured in manifest, not a tool |
| `TodoWrite` | No equivalent | Not supported |
| `Skill` (invoke a skill) | No equivalent | Skills load natively into prompt |
| `WebSearch` | `WebSearch` | Same |
| `WebFetch` | `WebFetch` | Same |
| `AskUserQuestion` | `AskUserQuestion` | Same |

### Key differences

- **No Task/Agent tool**: OpenClaw does not have a Task or Agent dispatch tool. Agents are declared in the `agents.list[]` array of `openclaw.json`. Inter-agent delegation is handled by the runtime based on config ([source](https://docs.openclaw.ai/plugin)).
- **No TodoWrite**: No task-tracking tool equivalent.
- **No Skill tool**: Skills are injected into the system prompt and invoked natively by the agent. There is no explicit skill invocation tool.
- **Custom tools via plugins**: Plugins register tools with `api.registerTool(...)`. Optional tools require user opt-in via `tools.allow` config. Tool names must not clash with core tools ([source](https://docs.openclaw.ai/plugins/agent-tools)).

### Registering custom tools

```typescript
api.registerTool({
  name: "my_tool",
  description: "Do a thing",
  parameters: Type.Object({ input: Type.String() }),
  async execute(_id, params) {
    return { content: [{ type: "text", text: `Got: ${params.input}` }] };
  },
});

// Optional tool -- user must add to allowlist
api.registerTool(myTool, { optional: true });
```

Users enable optional tools in config:
```json5
{ tools: { allow: ["workflow_tool"] } }
```

## 7. Install and Distribution

### Primary: ClawHub registry

ClawHub is the public registry for OpenClaw skills and plugins ([source](https://docs.openclaw.ai/clawhub)).

```bash
# Install a plugin from ClawHub
openclaw plugins install clawhub:<package>

# Install a skill
openclaw skills install <slug>

# Bare names check ClawHub first, then npm
openclaw plugins install openclaw-codex-app-server
```

Plugin installs validate `pluginApi` and `minGatewayVersion` compatibility before archive install runs. Incompatible hosts fail closed ([source](https://docs.openclaw.ai/clawhub)).

### Secondary: npm

```bash
# Install from npm
openclaw plugins install @openclaw/voice-call

# Publish to npm
npm publish --access public
```

### Local development

```bash
# Install from local path
openclaw plugins install ./my-plugin

# Install from archive
openclaw plugins install ./my-plugin.tgz

# Link for development (no copy)
openclaw plugins install -l ./my-plugin

# Add to config manually
# In ~/.openclaw/openclaw.json:
{
  "plugins": {
    "load": {
      "paths": ["/path/to/my-plugin"]
    }
  }
}
```

### Marketplace support

OpenClaw can install from marketplace sources including Claude known-marketplace names, local marketplace roots, GitHub shorthands, and git URLs ([source](https://docs.openclaw.ai/plugin)):

```bash
openclaw plugins install <plugin>@<marketplace>
openclaw plugins install <plugin> --marketplace https://github.com/<owner>/<repo>
```

### ClawHub CLI (for publishing)

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/your-plugin
clawhub skill publish ./my-skill-pack
clawhub sync --all
```

### CLI reference (management)

```bash
openclaw plugins list                      # compact inventory
openclaw plugins list --enabled            # only enabled plugins
openclaw plugins inspect <id>              # deep detail
openclaw plugins enable <id>               # enable a plugin
openclaw plugins disable <id>              # disable without removing
openclaw plugins uninstall <id>            # remove completely
openclaw plugins update --all              # update all plugins
openclaw plugins doctor                    # diagnostics
openclaw plugins registry --refresh        # rebuild persisted registry
```

### Bundle auto-detection

OpenClaw auto-detects Claude, Codex, and Cursor bundle layouts. If a plugin already has a `.claude-plugin/plugin.json`, OpenClaw may load it without conversion. Test with a local install first ([source](https://docs.openclaw.ai/plugin)).

### Verification

```bash
openclaw plugins list
openclaw plugins inspect <id>
openclaw logs --filter="plugin:<name>"
```

## 8. Runtime Components

### Gateway architecture

OpenClaw is a **gateway/orchestrator** -- it receives requests from messaging channels and delegates to agents. Plugins run in-process with the Gateway with the same trust boundary as core code. There is no sandbox for native plugins ([source](http://docs.openclaw.ai/plugins/architecture)).

### Plugin entry point

Plugins export a default entry object with a `register(api)` function. The SDK provides `definePluginEntry` for tool/hook/provider plugins and `defineChannelPluginEntry` for messaging channels ([source](http://docs.openclaw.ai/plugins/sdk-entrypoints)):

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  description: "Short summary",
  register(api) {
    api.registerTool({ /* ... */ });
    api.registerHook("llm_input", handler);
  },
});
```

### Registration modes

| Mode | When | What to register |
|------|------|-----------------|
| `full` | Normal gateway startup | Everything |
| `setup-only` | Disabled/unconfigured channel | Channel registration only |
| `setup-runtime` | Setup flow with runtime | Lightweight runtime |
| `cli-metadata` | Root help / CLI metadata | CLI descriptors only |
| `discovery` | Read-only capability discovery | Providers and metadata |

### TypeScript Plugin SDK

Import from focused `openclaw/plugin-sdk/` subpaths ([source](https://docs.openclaw.ai/plugins/agent-tools)):

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import type { OpenClawPluginApi, AnyAgentTool } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { Type } from "@sinclair/typebox";
```

Key `OpenClawPluginApi` properties:

| Property | Description |
|----------|-------------|
| `api.id` | Plugin identifier |
| `api.name` | Plugin display name |
| `api.version` | Plugin version from package.json |
| `api.sourcePath` | Absolute path to entry point |
| `api.config` | OpenClaw configuration object |
| `api.pluginConfig` | Plugin-specific config from `plugins.entries[id].config` |
| `api.runtime` | Runtime services (media, messaging, logging) |
| `api.logger` | Scoped logger (`.info()`, `.warn()`, `.error()`, `.debug()`) |
| `api.registrationMode` | Current registration mode |

### Full registration method table

| Method | What it registers |
|--------|-------------------|
| `registerProvider` | Model provider (LLM) |
| `registerChannel` | Chat channel |
| `registerTool` | Agent tool |
| `registerHook` / `on(...)` | Lifecycle hooks |
| `registerSpeechProvider` | Text-to-speech / STT |
| `registerRealtimeTranscriptionProvider` | Streaming STT |
| `registerRealtimeVoiceProvider` | Duplex realtime voice |
| `registerMediaUnderstandingProvider` | Image/audio analysis |
| `registerImageGenerationProvider` | Image generation |
| `registerMusicGenerationProvider` | Music generation |
| `registerVideoGenerationProvider` | Video generation |
| `registerWebFetchProvider` | Web fetch / scrape |
| `registerWebSearchProvider` | Web search |
| `registerHttpRoute` | HTTP endpoint |
| `registerCommand` / `registerCli` | CLI and plugin commands |
| `registerContextEngine` | Context engine |
| `registerService` | Background service |
| `registerGatewayMethod` | JSON-RPC gateway endpoint |
| `registerAgentToolResultMiddleware` | Tool-result middleware (bundled only) |

### MCP support

OpenClaw embeds MCP configuration in the plugin manifest (`openclaw.plugin.json`). There is no separate `.mcp.json` file -- MCP servers are declared in the manifest's `mcp` block.

### Plugin configuration

Per-plugin configuration lives under `plugins.entries.<id>.config` in `openclaw.json`:

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: ["untrusted-plugin"],
    load: { paths: ["~/my-plugins/custom"] },
    entries: {
      "voice-call": {
        enabled: true,
        config: { provider: "twilio" }
      }
    }
  }
}
```

### Exclusive plugin slots

Some categories allow only one active plugin at a time:

| Slot | What it controls | Default |
|------|-----------------|---------|
| `memory` | Active memory plugin | `memory-core` |
| `contextEngine` | Active context engine | `legacy` (built-in) |

### Official plugins

Installable via npm: `@openclaw/voice-call`, `@openclaw/msteams`, `@openclaw/matrix`, `@openclaw/nostr`, `@openclaw/zalo`, `@openclaw/zalouser` ([source](https://docs.openclaw.ai/plugin)).

Bundled model providers (enabled by default): `anthropic`, `google`, `openai`, `openrouter`, `mistral`, `together`, `huggingface`, and 20+ more.

### Frontmatter field stripping

When porting skills from Claude Code, these frontmatter fields must be **removed** for OpenClaw:
- `disable-model-invocation` -- not supported
- `allowed-tools` -- not supported (Claude-specific)

## 9. Sources

### Official documentation
- https://docs.openclaw.ai/plugin -- Plugins overview, types, configuration, discovery
- https://docs.openclaw.ai/plugins/agent-tools -- Building plugins, registering tools, pre-submission checklist
- http://docs.openclaw.ai/plugins/architecture -- Plugin internals, capability model, load pipeline
- http://docs.openclaw.ai/plugins/sdk-entrypoints -- Entry point helpers, registration modes, plugin shapes
- https://openclaw-openclaw.mintlify.app/plugins/plugin-sdk -- Plugin SDK reference, full API
- https://docs.openclaw.ai/clawhub -- ClawHub registry usage
- https://docs.openclaw.ai/tools/clawhub -- ClawHub CLI reference
- https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md -- Skills format, precedence, gating, config
- https://github.com/openclaw/openclaw/blob/e635cedb/docs/concepts/system-prompt.md -- System prompt assembly, bootstrap files

### GitHub issues and PRs (OpenClaw internals)
- https://github.com/openclaw/openclaw/issues/55745 -- Typed hooks for before_compaction / after_compaction
- https://github.com/openclaw/openclaw/issues/25074 -- Bug: api.on('command') handlers disconnected
- https://github.com/openclaw/openclaw/issues/15566 -- Feature: configurable workspace context files
- https://github.com/openclaw/openclaw/issues/48266 -- Custom skills not auto-discovered
- https://github.com/openclaw/openclaw/issues/59050 -- Configurable workspace file load order
- https://github.com/openclaw/openclaw/pull/13965 -- Configurable contextScripts for sub-agent sessions

### ClawHub registry
- https://github.com/openclaw/clawhub -- ClawHub source (skill registry + package catalog)
- https://registry.npmjs.org/clawhub -- ClawHub CLI on npm

### Community and third-party
- https://www.glukhov.org/ai-systems/openclaw/plugins/ -- Ecosystem guide (plugin discovery, packaging, security)
- https://dev.to/rosgluk/openclaw-plugins-ecosystem-guide-and-practical-picks-4an1 -- Ecosystem guide (dev.to mirror)
- https://www.openclawplaybook.ai/guides/how-to-build-openclaw-plugins/ -- Skills vs plugins guide
- https://clawdbytes.com/article/2026-03-11-show-hn-openclaw-plugin-for-claude-code-and-codex-orchestration.html -- openclaw-code-agent plugin
- https://open-claw.bot/docs/tools/plugins/ -- Plugin discovery, hooks, commands
- https://openclawdir.com/plugins/enterprise-agent-plugins-6ddq8d -- Multi-platform plugin scaffold
- https://www.reddit.com/r/openclaw/comments/1rm10f0/i_built_a_pure_typescript_sdk_for_openclaw/ -- Community TypeScript SDK
- https://gist.github.com/openmetaloom/657c4668c09d235f8da1306e2438904b -- Extended core hook system proposal
- https://openclawblog.space/articles/openclaw-plugin-development-extending-functionality -- Plugin development guide
- https://www.elegantsoftwaresolutions.com/blog/openclaw-v2026-3-22-clawhub-plugin-registry-guide -- ClawHub registry guide
- https://launchmyopenclaw.com/openclaw-agents-md-guide -- AGENTS.md guide
- https://launchmyopenclaw.com/openclaw-md-files-guide/ -- All .md context files explained
- https://openclawready.com/blog/customize-openclaw-agents-md-configuration-guide/ -- AGENTS.md templates
- https://www.reddit.com/r/openclaw/comments/1r7k9pr/the_ultimate_openclaw_setup_guide_agentsmd_soulmd/ -- Workspace setup guide
- https://openclaws.io/docs/tools/skills/ -- Skills reference
- https://openclaws.io/docs/tools/skills-config/ -- Skills config reference
- https://www.stanza.dev/cheatsheet/openclaw-skills-development -- Skills development cheatsheet
- https://www.tencentcloud.com/techpedia/141204 -- Developing custom plugins with TypeScript
