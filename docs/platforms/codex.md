# Codex Plugin Ecosystem

This document describes the OpenAI Codex CLI plugin ecosystem as it relates to portability assessment and uplift. Codex CLI is OpenAI's open-source terminal coding agent, built in Rust, installed via `npm i -g @openai/codex` or `brew install --cask codex` [source](https://github.com/openai/codex). It runs locally, reads your repository, edits files, and executes commands in a sandboxed environment [source](https://developers.openai.com/codex/cli).

## 1. Plugin Structure

Codex supports two materially different consumption patterns: lightweight **skill discovery** and full **plugin packaging**. Plugin authors must choose one or both.

### Skill discovery layout

Skills are placed directly in discovery paths without plugin packaging:

```
~/.codex/skills/<skill-name>/SKILL.md         # user-level
~/.agents/skills/<skill-name>/SKILL.md        # user-level (alternate)
.agents/skills/<skill-name>/SKILL.md          # repo-level (any dir to root)
/etc/codex/skills/<skill-name>/SKILL.md       # admin-level
```

Each skill is a directory with a required `SKILL.md` and optional subdirectories [source](https://developers.openai.com/codex/skills/create-skill):

```
skill-name/
  SKILL.md                # required: instructions + YAML frontmatter
  scripts/                # optional: executable code (Python/Bash/etc.)
  references/             # optional: documentation loaded as needed
  assets/                 # optional: templates, icons, files used in output
  agents/
    openai.yaml           # optional: UI metadata, invocation policy, dependencies
```

### Plugin packaging layout

Full plugin packages use a `.codex-plugin/` manifest directory [source](https://developers.openai.com/codex/plugins/build/):

```
my-plugin/
  .codex-plugin/
    plugin.json           # required manifest
  skills/
    <skill-name>/
      SKILL.md
      agents/
        openai.yaml
      scripts/
      references/
      assets/
  .mcp.json               # optional: MCP server configuration
  .app.json               # optional: app integrations (GitHub, Slack, etc.)
  assets/                 # optional: icons, screenshots, logos
```

Only `plugin.json` belongs inside `.codex-plugin/`. Skills, MCP config, app config, and assets live at the plugin root [source](https://developers.openai.com/codex/plugins/build/).

### Deployment shapes

| Shape | Plugin location | Marketplace location |
|-------|----------------|---------------------|
| Single-plugin upstream repo | `<repo>/` (repo root is the plugin) | `<repo>/.agents/plugins/marketplace.json` |
| Curated multi-plugin repo | `<repo>/plugins/<name>/` | `<repo>/.agents/plugins/marketplace.json` |
| Personal plugin | `~/.codex/plugins/<name>/` | `~/.agents/plugins/marketplace.json` |
| Plugin-bundled skills only | N/A (use skill discovery paths) | N/A |

### Required vs optional files

| File | Required | Purpose |
|------|----------|---------|
| `SKILL.md` | Yes (per skill) | Skill instructions and metadata |
| `.codex-plugin/plugin.json` | Yes (for plugins) | Plugin manifest |
| `marketplace.json` | Yes (for installable plugins) | Registry entry for plugin discovery |
| `agents/openai.yaml` | No | UI metadata, invocation policy, tool dependencies |
| `.mcp.json` | No | MCP server configuration |
| `.app.json` | No | App integration definitions |
| `scripts/` | No | Helper scripts for deterministic steps |
| `references/` | No | Long-form docs loaded on demand |
| `assets/` | No | Icons, logos, screenshots, templates |

## 2. Manifest

### Plugin manifest (`.codex-plugin/plugin.json`)

Every plugin requires a manifest at `.codex-plugin/plugin.json`. Codex uses the `name` field as the plugin identifier [source](https://developers.openai.com/codex/plugins/build/).

Minimal manifest:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Brief description",
  "skills": "./skills/"
}
```

Full manifest schema:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `name` | string | Yes | Plugin identifier (kebab-case) |
| `version` | string | Yes | Semver version |
| `description` | string | Yes | Brief description |
| `author` | object | No | `{ name, email, url }` |
| `homepage` | string | No | Plugin homepage URL |
| `repository` | string | No | Source repository URL |
| `license` | string | No | SPDX license identifier |
| `keywords` | string[] | No | Discovery keywords |
| `skills` | string | No | Relative path to skills directory (e.g. `"./skills/"`) |
| `mcpServers` | string | No | Relative path to `.mcp.json` |
| `apps` | string | No | Relative path to `.app.json` |
| `interface` | object | No | Install-surface presentation metadata |

The `interface` object controls how Codex presents the plugin:

| Interface field | Type | Purpose |
|----------------|------|---------|
| `displayName` | string | Title shown in plugin directory |
| `shortDescription` | string | One-line description |
| `longDescription` | string | Extended description |
| `developerName` | string | Publisher name |
| `category` | string | Category (e.g. `"Productivity"`) |
| `capabilities` | string[] | E.g. `["Read", "Write"]` |
| `websiteURL` | string | External website |
| `privacyPolicyURL` | string | Privacy policy |
| `termsOfServiceURL` | string | Terms of service |
| `defaultPrompt` | string[] | Starter prompts shown to users |
| `brandColor` | string | Hex color (e.g. `"#10A37F"`) |
| `composerIcon` | string | Path to icon asset |
| `logo` | string | Path to logo asset |
| `screenshots` | string[] | Paths to screenshot assets |

All manifest paths must be relative to the plugin root and start with `./` [source](https://developers.openai.com/codex/plugins/build/).

### Marketplace manifest

Location: `$REPO_ROOT/.agents/plugins/marketplace.json` (repo-scoped) or `~/.agents/plugins/marketplace.json` (personal) [source](https://developers.openai.com/codex/plugins/build/).

```json
{
  "name": "my-marketplace",
  "interface": {
    "displayName": "My Marketplace"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Marketplace entry fields:

| Field | Required | Values |
|-------|----------|--------|
| `source.source` | Yes | `"local"`, `"url"`, `"git-subdir"` |
| `source.path` | Yes | `./`-prefixed relative path |
| `source.url` | For remote | Git URL |
| `source.ref` / `source.sha` | No | Git ref or SHA for remote sources |
| `policy.installation` | Yes | `"AVAILABLE"`, `"INSTALLED_BY_DEFAULT"`, `"NOT_AVAILABLE"` |
| `policy.authentication` | Yes | `"ON_INSTALL"`, `"ON_FIRST_USE"` |
| `category` | Yes | Category string |

Codex reads marketplaces from four locations [source](https://developers.openai.com/codex/plugins/build/):
1. The curated official Plugin Directory
2. Repo marketplace at `$REPO_ROOT/.agents/plugins/marketplace.json`
3. Claude-style marketplace at `$REPO_ROOT/.claude-plugin/marketplace.json`
4. Personal marketplace at `~/.agents/plugins/marketplace.json`

## 3. Skills

Codex implements the open [agent skills standard](https://agentskills.io) for SKILL.md [source](https://developers.openai.com/codex/skills/create-skill). Skills are the authoring format; plugins are the distribution format.

### SKILL.md format

```markdown
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---

Skill instructions for Codex to follow.
```

Frontmatter fields:

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Lowercase letters, numbers, hyphens; max 64 chars; no leading/trailing/consecutive hyphens |
| `description` | Yes | Max 1024 chars; must describe what the skill does AND when to use it |

The file must be named exactly `SKILL.md` (case-sensitive). Avoid XML angle brackets in frontmatter [source](https://bibek-poudel.medium.com/the-skill-md-pattern-how-to-write-ai-agent-skills-that-actually-work-72a3169dd7ee).

### Discovery and loading

Codex uses **progressive disclosure** [source](https://developers.openai.com/codex/skills/create-skill):

1. At session start, Codex reads only `name`, `description`, and file path for all discovered skills
2. The initial skill list is capped at ~2% of model context window (~8,000 chars when unknown)
3. Full `SKILL.md` body loads only when Codex selects a skill
4. References and scripts load only when needed during execution

### Skill discovery paths

Codex scans these locations in order [source](https://developers.openai.com/codex/skills/create-skill):

| Scope | Location | Use case |
|-------|----------|----------|
| REPO (closest) | `$CWD/.agents/skills/` | Skills specific to current working folder |
| REPO (parents) | `$CWD/../.agents/skills/` | Skills for shared parent areas |
| REPO (root) | `$REPO_ROOT/.agents/skills/` | Root skills for everyone in the repo |
| USER | `$HOME/.agents/skills/` | Personal skills across all repos |
| USER | `~/.codex/skills/` | Alternate user skill location |
| ADMIN | `/etc/codex/skills/` | Machine/container-level skills |
| SYSTEM | Bundled with Codex | Built-in skills (`$skill-creator`, `$skill-installer`) |
| PLUGIN | `skills/` inside installed plugin | Plugin-bundled skills |

Codex follows symlinked skill folders. If two skills share the same `name`, both appear in selectors -- Codex does not merge them.

### Invocation modes

| Mode | Mechanism | Example |
|------|-----------|---------|
| Explicit | `$` prefix or `/skills` selector | `$skill-name` in prompt |
| Implicit | Codex matches task to `description` | Automatic based on prompt content |

Implicit invocation can be disabled per-skill via `agents/openai.yaml` with `policy.allow_implicit_invocation: false` [source](https://developers.openai.com/codex/skills/create-skill).

### `agents/openai.yaml`

Optional metadata file within each skill directory [source](https://developers.openai.com/codex/skills/create-skill):

```yaml
interface:
  display_name: "User-facing name"
  short_description: "Brief UI description"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Suggested prompt to invoke the skill"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

### Skill enable/disable

Use `[[skills.config]]` in `~/.codex/config.toml` [source](https://developers.openai.com/codex/skills/create-skill):

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

### Built-in skill commands

| Command | Purpose |
|---------|---------|
| `$skill-creator` | Scaffold a new skill with guided prompts |
| `$skill-installer` | Install skills from `github.com/openai/skills` or any GitHub URL |
| `$plugin-creator` | Scaffold a plugin manifest and marketplace entry |

## 4. Context Files

### AGENTS.md

Codex reads `AGENTS.md` files as project guidance before doing any work. Content is concatenated directly into the context window at session start [source](https://developers.openai.com/codex/guides/agents-md).

#### Discovery hierarchy

Codex loads AGENTS.md in this order, concatenating root-down [source](https://developers.openai.com/codex/guides/agents-md):

1. **Global**: `~/.codex/AGENTS.override.md` (if exists, skips `AGENTS.md` at this level)
2. **Global**: `~/.codex/AGENTS.md` (if no override)
3. **Project**: From project root down to CWD, checking at each directory:
   - `AGENTS.override.md` (wins over `AGENTS.md` in same directory)
   - `AGENTS.md`
   - Any fallback filenames from `project_doc_fallback_filenames`

At most one file per directory. Override files take precedence at the same level. Files closer to CWD override earlier guidance on conflicts [source](https://thepromptshelf.dev/blog/agents-md-codex-setup-guide-2026).

#### Size limits

Combined AGENTS.md content is capped at `project_doc_max_bytes` (default: **32 KiB**). Empty files are skipped [source](https://developers.openai.com/codex/guides/agents-md).

#### Configuration knobs

```toml
# ~/.codex/config.toml
project_doc_max_bytes = 65536          # Raise from 32 KiB default
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".codex/instructions.md"]
```

The `project_doc_fallback_filenames` setting tells Codex to check additional filenames when `AGENTS.md` is missing at a directory level. `CLAUDE.md` is not a default fallback but can be added [source](https://developers.openai.com/codex/config-advanced/).

#### Content guidance

A good `AGENTS.md` covers [source](https://developers.openai.com/codex/learn/best-practices):
- Repo layout and important directories
- Build, test, and lint commands
- Engineering conventions and PR expectations
- Constraints and do-not rules
- Definition of done and verification steps

The `/init` slash command scaffolds a starter `AGENTS.md` [source](https://developers.openai.com/codex/learn/best-practices).

### Memories

Codex also supports **memories** for useful context learned from prior work. These are distinct from AGENTS.md and carry local context forward across sessions [source](https://developers.openai.com/codex/concepts/customization/).

### Other context mechanisms

| Mechanism | Purpose |
|-----------|---------|
| `.codex/config.toml` | Project-scoped config overrides (trusted projects only) |
| `model_instructions_file` | Points to a file with additional model instructions |
| `CODEX_HOME` env var | Override default `~/.codex` directory |

## 5. Hooks

Codex supports a lifecycle hook system behind a feature flag [source](https://developers.openai.com/codex/hooks).

### Enabling hooks

```toml
# ~/.codex/config.toml or .codex/config.toml
[features]
codex_hooks = true
```

### Hook events

| Event | Scope | Matcher target | Purpose |
|-------|-------|---------------|---------|
| `SessionStart` | Session | Start source (`startup`, `resume`, `clear`) | Initialize context at session start |
| `PreToolUse` | Turn | Tool name (`Bash`, `apply_patch`, MCP names) | Validate/block before tool runs |
| `PermissionRequest` | Turn | Tool name | Allow/deny approval requests |
| `PostToolUse` | Turn | Tool name | Review/audit after tool runs |
| `UserPromptSubmit` | Turn | Not supported (matcher ignored) | Scan/validate user prompts |
| `Stop` | Turn | Not supported (matcher ignored) | Continue/stop at turn end |

### Configuration format

Hooks are defined in `hooks.json` files or inline `[hooks]` tables in `config.toml` [source](https://developers.openai.com/codex/hooks).

**hooks.json** (placed next to active config layers):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /path/to/pre_tool_use_policy.py",
            "timeout": 30,
            "statusMessage": "Checking Bash command..."
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /path/to/post_tool_use_review.py",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 /path/to/stop_continue.py",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**Equivalent inline TOML**:

```toml
[features]
codex_hooks = true

[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = 'python3 /path/to/pre_tool_use_policy.py'
timeout = 30
statusMessage = "Checking Bash command"
```

### Hook discovery locations

| Location | Scope |
|----------|-------|
| `~/.codex/hooks.json` | User (always loads) |
| `~/.codex/config.toml` (inline `[hooks]`) | User (always loads) |
| `<repo>/.codex/hooks.json` | Project (trusted projects only) |
| `<repo>/.codex/config.toml` (inline) | Project (trusted projects only) |

Multiple matching hooks from different files all run. Hooks from the same event are launched concurrently [source](https://developers.openai.com/codex/hooks).

### Hook protocol

Hooks receive a JSON payload on **stdin** with common fields (`session_id`, `cwd`, `hook_event_name`, `model`) plus event-specific fields. Hooks output JSON on **stdout** [source](https://developers.openai.com/codex/hooks).

Key output fields:
- `PreToolUse`: `permissionDecision: "deny"` blocks the tool call. Exit code `2` with stderr also blocks.
- `PermissionRequest`: `decision.behavior: "allow"` or `"deny"` controls approval flow.
- `PostToolUse`: `decision: "block"` replaces tool output with hook feedback.
- `Stop`: `decision: "block"` continues the session with `reason` as a new prompt.
- Default timeout: 600 seconds. Override with `timeout` field (in seconds).

### Matcher patterns

Matchers are regex strings. Use `"*"`, `""`, or omit `matcher` to match all occurrences. For `apply_patch`, matchers also accept `Edit` or `Write` as aliases [source](https://developers.openai.com/codex/hooks).

## 6. Tool Mapping

Codex uses its own tool names distinct from Claude Code [source](https://developers.openai.com/codex/cli/features/).

### Native Codex tools

| Codex tool | Purpose | Notes |
|-----------|---------|-------|
| `Bash` / shell | Execute shell commands | Primary execution tool; sandboxed |
| `apply_patch` | File edits (create, modify, delete) | Unified file write mechanism |
| `WebSearch` | Web search | Live or cached mode |
| `spawn_agent` | Dispatch subagent | With `agent_type` and `message` |
| `report_agent_job_result` | Worker result reporting | For CSV batch jobs |
| MCP tools | External tool calls | Prefixed `mcp__<server>__<tool>` |

### Claude Code to Codex mapping

| Claude Code tool | Codex equivalent | Notes |
|-----------------|-----------------|-------|
| `Bash` | `Bash` / shell | Similar, both sandboxed |
| `Read` | Native file reading | Built-in, no named tool |
| `Write` | `apply_patch` | Codex uses patch-based writes |
| `Edit` | `apply_patch` | Same unified mechanism |
| `Task` (subagent) | `spawn_agent` | Generic roles, not named agents |
| `TodoWrite` | `update_plan` | Task tracking |
| `Skill` tool | Native skill loading | `$skill-name` prefix or implicit |
| `WebSearch` | `WebSearch` | Same concept |
| `WebFetch` | Not directly equivalent | Use MCP for URL fetching |

### Key differences from Claude Code

1. **File writes**: Codex uses `apply_patch` instead of separate `Write`/`Edit` tools
2. **Subagents**: Codex uses generic agent roles (`default`, `worker`, `explorer`) rather than named agent types; custom agents defined via TOML files
3. **Plan tracking**: `update_plan` instead of `TodoWrite`
4. **Skill invocation**: `$` prefix (e.g. `$commit`) vs Claude Code's `Skill` tool call
5. **Image support**: Codex accepts image attachments (screenshots, design specs) alongside prompts [source](https://developers.openai.com/codex/cli)

## 7. Install and Distribution

### Installing Codex CLI

```bash
# npm (recommended)
npm install -g @openai/codex

# Homebrew
brew install --cask codex

# Or download binary from GitHub Releases
```

Authenticate with `codex` and sign in with a ChatGPT account or API key [source](https://github.com/openai/codex).

### Installing plugins

**From the plugin directory** [source](https://developers.openai.com/codex/plugins/):
1. Run `codex` then `/plugins` to open the plugin browser
2. Browse or search, then select install
3. Connect external apps if prompted

**Via CLI marketplace commands** [source](https://developers.openai.com/codex/cli/reference/):

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo --ref main
codex plugin marketplace add https://github.com/example/plugins.git --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root

# Manage marketplaces
codex plugin marketplace upgrade
codex plugin marketplace upgrade marketplace-name
codex plugin marketplace remove marketplace-name
```

**Manual local install**:
1. Copy plugin folder to `~/.codex/plugins/<name>/` or `$REPO_ROOT/plugins/<name>/`
2. Add entry to the appropriate `marketplace.json`
3. Restart Codex

Plugins are cached at `~/.codex/plugins/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$VERSION/`. For local plugins, `$VERSION` is `local` [source](https://developers.openai.com/codex/plugins/build/).

### Installing skills (without plugin packaging)

```bash
# Using the built-in skill installer
$skill-installer linear

# Manual: copy or symlink
cp -R skill-folder/ ~/.codex/skills/skill-name/
# or
ln -s /path/to/skill-folder ~/.agents/skills/skill-name
```

Restart Codex after adding new skills [source](https://developers.openai.com/codex/skills/create-skill).

### Plugin enable/disable

Toggle in the `/plugins` UI, or in `~/.codex/config.toml`:

```toml
[plugins."my-plugin@my-marketplace"]
enabled = false
```

### Marketplace (official)

The official curated Plugin Directory was added March 2026 [source](https://aintelligencehub.com/articles/openai-added-plugin-directory-codex-what-teams-can-reuse-now-april-2026). Self-serve publishing to the official directory is coming soon. In the meantime, plugins are distributed via repo or personal marketplaces.

## 8. Runtime Components

### Agents and subagents

Codex supports multi-agent workflows via subagents, enabled by default in current releases [source](https://developers.openai.com/codex/multi-agent/).

**Built-in agents:**

| Agent | Purpose |
|-------|---------|
| `default` | General-purpose fallback |
| `worker` | Execution-focused (implementation, fixes) |
| `explorer` | Read-heavy codebase exploration |

**Custom agents** are standalone TOML files [source](https://developers.openai.com/codex/multi-agent/):

| Location | Scope |
|----------|-------|
| `~/.codex/agents/*.toml` | Personal agents |
| `.codex/agents/*.toml` | Project-scoped agents |

Custom agent schema:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `name` | string | Yes | Agent identifier |
| `description` | string | Yes | When to use this agent |
| `developer_instructions` | string | Yes | Core behavioral instructions |
| `nickname_candidates` | string[] | No | Display nicknames for UI |
| `model` | string | No | Override model (e.g. `"gpt-5.4"`) |
| `model_reasoning_effort` | string | No | `"low"`, `"medium"`, `"high"` |
| `sandbox_mode` | string | No | Override sandbox mode |
| `mcp_servers` | table | No | Agent-specific MCP config |
| `skills.config` | array | No | Enable/disable specific skills |

Example custom agent (`.codex/agents/reviewer.toml`):

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
"""
nickname_candidates = ["Atlas", "Delta", "Echo"]
```

**Global agent settings** (`config.toml`):

| Setting | Default | Purpose |
|---------|---------|---------|
| `agents.max_threads` | 6 | Concurrent agent thread cap |
| `agents.max_depth` | 1 | Nesting depth (0 = root) |
| `agents.job_max_runtime_seconds` | 1800 | Per-worker timeout for CSV jobs |

**CSV batch processing** (`spawn_agents_on_csv`): Codex can read a CSV, spawn one worker per row, and export combined results. Experimental [source](https://developers.openai.com/codex/multi-agent/).

### Sandbox model

Codex uses OS-level sandboxing to isolate agent execution [source](https://developers.openai.com/codex/concepts/sandboxing/).

**Sandbox modes:**

| Mode | Behavior |
|------|----------|
| `read-only` | Inspect files only; all edits/commands need approval |
| `workspace-write` | Read + edit within workspace + run local commands; approval for outside-workspace or network |
| `danger-full-access` | No sandbox restrictions (filesystem + network) |

**Approval policies:**

| Policy | Behavior |
|--------|----------|
| `untrusted` | Ask before commands not in trusted set |
| `on-request` | Work inside sandbox, ask for boundary-crossing |
| `never` | No approval prompts |

**Preset:** `--full-auto` equals `--sandbox workspace-write --ask-for-approval on-request` [source](https://developers.openai.com/codex/agent-approvals-security).

```toml
# config.toml examples
sandbox_mode = "workspace-write"
approval_policy = "on-request"

[sandbox_workspace_write]
network_access = true                    # disabled by default
writable_roots = ["/home/user/.cache"]   # additional writable paths

[profiles.full_auto]
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

Protected paths: `.git/` and `.codex/` are protected even in writable modes [source](https://github.com/openai/codex/blob/13c42a077c88a0d04ae7680a9891d2daf4558577/docs/sandbox.md).

### Model selection

Codex supports multiple models, switchable mid-session with `/model` [source](https://developers.openai.com/codex/cli/features/):

| Model | Typical use |
|-------|-------------|
| `gpt-5.4` | Default, high capability |
| `gpt-5.4-mini` | Faster, lower cost |
| `gpt-5.3-codex-spark` | Optimized for code execution |

Model and reasoning effort can be set globally, per-profile, or per-agent:

```toml
model = "gpt-5.4"
model_reasoning_effort = "high"
```

### MCP support

Codex supports Model Context Protocol (MCP) for connecting to external tools [source](https://developers.openai.com/codex/cli/features/).

**Configuration in `config.toml`:**

```toml
[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"

[mcp_servers.localServer]
command = "node"
args = ["./mcp-server.js"]
startup_timeout_sec = 20
```

**Via `.mcp.json`** in plugin root for plugin-bundled MCP servers.

**CLI management:**

```bash
codex mcp add <name> <url-or-command>
codex mcp remove <name>
codex mcp list
```

Codex launches MCP servers automatically at session start. Codex can also run as an MCP server itself (`codex mcp-server`) [source](https://developers.openai.com/codex/cli/features/).

### Codex-specific features

| Feature | Description |
|---------|-------------|
| **Full-auto mode** | `--full-auto` for sandboxed autonomous execution |
| **Scripting** | `codex exec` for non-interactive automation; pipes results to stdout |
| **Resume** | `codex resume` reopens earlier sessions with full transcript |
| **Cloud tasks** | `codex cloud` for remote Codex Cloud execution |
| **Image input** | Attach screenshots/design specs to prompts |
| **Image generation** | Generate/edit images directly in CLI |
| **Web search** | Built-in web search (cached or live mode) |
| **Profiles** | Named config profiles in `config.toml` (`--profile name`) |
| **Feature flags** | `codex features enable/disable` for experimental features |
| **Code review** | Built-in local code review by a separate agent |
| **Fork** | `codex fork` for session forking |
| **Project trust** | Untrusted projects have `.codex/` layers ignored |

### Configuration hierarchy

Codex loads config in this precedence order (highest first) [source](https://developers.openai.com/codex/config-basic/):

1. CLI flags and `--config` overrides
2. Profile values (`--profile <name>`)
3. Project `.codex/config.toml` files (root to CWD, closest wins; trusted only)
4. User `~/.codex/config.toml`
5. System `/etc/codex/config.toml` (if present)
6. Built-in defaults

Project root is detected by `.git` directory presence by default, configurable via `project_root_markers` [source](https://developers.openai.com/codex/config-advanced/).

## 9. Sources

All URLs referenced in this document:

1. https://github.com/openai/codex -- Codex CLI GitHub repository (open source, Rust)
2. https://developers.openai.com/codex/cli -- Codex CLI overview and setup
3. https://developers.openai.com/codex/cli/features/ -- CLI features (interactive mode, subagents, scripting, MCP, etc.)
4. https://developers.openai.com/codex/cli/reference/ -- Command line options reference
5. https://developers.openai.com/codex/plugins/ -- Plugin overview (install and use)
6. https://developers.openai.com/codex/plugins/build/ -- Build plugins (manifest, marketplace, packaging)
7. https://developers.openai.com/codex/skills/create-skill -- Agent Skills (create, discover, configure)
8. https://developers.openai.com/codex/concepts/customization/ -- Customization layers (AGENTS.md, skills, MCP, subagents)
9. https://developers.openai.com/codex/guides/agents-md -- Custom instructions with AGENTS.md
10. https://developers.openai.com/codex/hooks -- Hooks reference (events, config, protocol)
11. https://developers.openai.com/codex/multi-agent/ -- Subagents (custom agents, CSV batch, orchestration)
12. https://developers.openai.com/codex/concepts/sandboxing/ -- Sandbox modes and approval policies
13. https://developers.openai.com/codex/agent-approvals-security -- Agent approvals and security
14. https://developers.openai.com/codex/config-basic/ -- Config basics
15. https://developers.openai.com/codex/config-advanced/ -- Advanced configuration (project config, root detection)
16. https://developers.openai.com/codex/learn/best-practices -- Best practices
17. https://developers.openai.com/codex/quickstart?setup=cli -- Quickstart guide
18. https://github.com/openai/codex/blob/13c42a077c88a0d04ae7680a9891d2daf4558577/docs/sandbox.md -- Sandbox documentation (source repo)
19. https://github.com/openai/codex/blob/eaf81d3f/codex-rs/README.md -- Rust CLI implementation README
20. https://github.com/openai/codex/blob/main/README.md -- Main repository README
21. https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md -- Built-in skill-creator source
22. https://github.com/ComposioHQ/awesome-codex-skills -- Community skill collection
23. https://aintelligencehub.com/articles/openai-added-plugin-directory-codex-what-teams-can-reuse-now-april-2026 -- Plugin Directory announcement (March 2026)
24. https://thepromptshelf.dev/blog/agents-md-codex-setup-guide-2026 -- AGENTS.md setup guide
25. https://localskills.sh/blog/codex-cli-guide -- Codex CLI guide (AGENTS.md, config)
26. https://medium.com/@jpcaparas/the-definitive-guide-to-codex-cli-from-first-install-to-production-workflows-a9f1e7c887ab -- Definitive guide to Codex CLI
27. https://bibek-poudel.medium.com/the-skill-md-pattern-how-to-write-ai-agent-skills-that-actually-work-72a3169dd7ee -- SKILL.md pattern cross-platform
28. https://zread.ai/openai/codex/19-hooks-and-lifecycle-events -- Hooks and lifecycle events deep dive
29. https://github.com/openai/codex/issues/14882 -- Proposal: PreToolUse/PostToolUse lifecycle hooks
30. https://github.com/openai/codex/issues/17532 -- Hooks repo-local config issue
31. https://github.com/openai/codex/pull/11067 -- Comprehensive hook system PR
32. https://github.com/openai/codex/issues/16732 -- ApplyPatch hook event issue
33. https://github.com/openai/codex/issues/6667 -- Sandbox mode config issue
34. https://dev-docs.moodybeard.com/en/codex/config-advanced/ -- Advanced config mirror
35. https://agent-skills.md/skills/openai/codex/skill-creator -- Skill Creator on agent-skills.md
36. https://github.com/KevinConti/skill-universe/blob/master/docs/skill-specs/openai-codex-skills.md -- Codex skill spec (skill-universe)
