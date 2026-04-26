# Claude Code Platform Reference

Comprehensive reference for the Claude Code plugin system. Claude Code is Anthropic's CLI-based agentic coding tool. Plugins launched in public beta October 2025 and are now stable. This document covers everything a plugin author needs to build, distribute, and maintain cross-platform plugins.

## 1. Plugin Structure

### Deployment shapes

| Shape | Description | Use case |
|-------|-------------|----------|
| **Standalone skill** | Single `SKILL.md` in `.claude/skills/<name>/` | Personal or project-specific workflow |
| **Full plugin** | Directory with `.claude-plugin/plugin.json` manifest | Reusable, distributable, versioned |
| **Marketplace** | Repository with `.claude-plugin/marketplace.json` listing multiple plugins | Team/community distribution |

Standalone skills use short names (`/deploy`). Plugin skills are namespaced (`/plugin-name:deploy`) to prevent conflicts ([source](https://code.claude.com/docs/en/plugins)).

### Canonical directory layout

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest (optional if defaults used)
├── skills/                      # Skills as subdirectories
│   └── skill-name/
│       ├── SKILL.md             # Required per skill
│       └── [supporting files]   # Templates, examples, scripts, references
├── commands/                    # Legacy flat .md skill files (use skills/ for new work)
├── agents/                      # Subagent definitions (.md files)
├── hooks/
│   └── hooks.json               # Hook configuration
├── monitors/
│   └── monitors.json            # Background monitor configs
├── output-styles/               # Response format definitions
├── themes/                      # Color theme definitions
├── bin/                         # Executables added to Bash PATH while plugin enabled
├── scripts/                     # Utility scripts for hooks
├── settings.json                # Default settings (only `agent` and `subagentStatusLine` keys)
├── .mcp.json                    # MCP server definitions
└── .lsp.json                    # LSP server configurations
```

**Critical layout rules** ([source](https://code.claude.com/docs/en/plugins)):
1. Only `plugin.json` goes inside `.claude-plugin/`. All other directories are at plugin root.
2. Component directories auto-discover contents. No manifest entry needed for default paths.
3. Use kebab-case for all directory and file names.
4. Only create directories for components the plugin uses.

### Environment variables available to plugins

| Variable | Availability | Description |
|----------|-------------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Skills, hooks, MCP/LSP configs | Absolute path to plugin install directory. Changes on update — do not write state here ([source](https://codingnomads.com/claude-code-building-distributing-plugins)) |
| `${CLAUDE_PLUGIN_DATA}` | Skills, hooks, MCP/LSP configs | Persistent data directory at `~/.claude/plugins/data/{plugin-id}/`. Survives updates ([source](https://codingnomads.com/claude-code-building-distributing-plugins)) |
| `${user_config.KEY}` | Skills, hooks, MCP/LSP configs | Values from plugin `userConfig` schema prompted at enable time ([source](https://docs.claude.com/en/docs/claude-code/plugins-reference)) |
| `${CLAUDE_PROJECT_DIR}` | Hooks only | Absolute path to project root where Claude Code was started ([source](https://claude.com/blog/how-to-configure-hooks)) |
| `${CLAUDE_SKILL_DIR}` | Skills only | Absolute path to the skill's own directory ([source](https://code.claude.com/docs/en/skills)) |
| `${CLAUDE_SESSION_ID}` | Skills | Current session identifier ([source](https://code.claude.com/docs/en/skills)) |
| `CLAUDE_CODE_DISABLE_POLICY_SKILLS` | Runtime | Disable enterprise policy skills ([source](https://gist.github.com/mculp/e6a573f2a45ef7dbbf30f6a8574c7351)) |
| `CLAUDE_CODE_PLUGIN_SEED_DIR` | Enterprise | Read-only plugin seed directory ([source](https://gist.github.com/mculp/e6a573f2a45ef7dbbf30f6a8574c7351)) |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Runtime | Default model for subagents using `inherit` ([source](https://medium.com/@sathishkraju/claude-code-subagents-the-complete-guide-to-ai-agent-delegation-d0a9aba419d0)) |

## 2. Manifest

### plugin.json schema

Location: `.claude-plugin/plugin.json` ([source](https://code.claude.com/docs/en/plugins))

The manifest is optional. If absent, Claude auto-discovers components in default directories. When present, it defines metadata and can override component paths.

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes (if manifest present) | string | Unique identifier, kebab-case. Becomes skill namespace prefix |
| `description` | No | string | Shown in plugin manager when browsing/installing |
| `version` | No | string | Semantic versioning for release tracking |
| `author` | No | object/string | Attribution. Object form: `{ name, email, url }` |
| `homepage` | No | string | URL |
| `repository` | No | string | URL |
| `license` | No | string | SPDX identifier |
| `keywords` | No | array | Tags for discovery |
| `skills` | No | string/array | Override default `skills/` path |
| `commands` | No | string/array | Override default `commands/` path |
| `agents` | No | string/array | Override default `agents/` path |
| `hooks` | No | string/array/object | Hook config path or inline config |
| `mcpServers` | No | string/array/object | MCP config path or inline |
| `lspServers` | No | string/array/object | LSP config path or inline |
| `outputStyles` | No | string/array | Output style path |
| `monitors` | No | string/array | Monitor config path or inline array |
| `userConfig` | No | object | User configuration schema, prompted at enable time |
| `channels` | No | array | Message injection via MCP servers |
| `dependencies` | No | array | Plugin dependencies |
| `settings` | No | object | Inline default settings |

Custom path overrides supplement defaults — they do not replace them. Components in both default directories and custom paths load ([source](https://github.com/anthropics/claude-code/blob/bf77ee65bc2805d18a7c6fce61fa2b04cdafcf88/plugins/plugin-dev/skills/plugin-structure/SKILL.md)).

Variable substitution in all path/command values: `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, `${user_config.*}`, and any `${ENV_VAR}` from the environment ([source](https://docs.claude.com/en/docs/claude-code/plugins-reference)).

### marketplace.json schema

Location: `.claude-plugin/marketplace.json` ([source](https://code.claude.com/docs/en/plugin-marketplaces))

```json
{
  "name": "marketplace-name",
  "owner": { "name": "Maintainer", "email": "optional@email.com" },
  "metadata": {
    "description": "Marketplace description",
    "version": "1.0.0",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "description": "What this plugin does",
      "version": "1.0.0",
      "source": "./plugins/my-plugin",
      "category": "development",
      "tags": ["linting", "formatting"],
      "strict": true
    }
  ]
}
```

Each plugin entry can include any field from the `plugin.json` schema plus marketplace-specific fields: `source`, `category`, `tags`, and `strict`.

When `strict: true` (default), the plugin must include its own `plugin.json`. When `strict: false`, the marketplace entry serves as the complete manifest ([source](https://code.claude.com/docs/en/plugin-marketplaces)).

Source types: relative path, `{ "source": "github", "repo": "owner/repo" }`, Git URL, Git subdirectory, npm package ([source](https://code.claude.com/docs/en/plugin-marketplaces)).

## 3. Skills

### SKILL.md format

Every skill needs a `SKILL.md` file inside a named subdirectory under `skills/`. The directory name becomes the skill name. Alternatively, flat `.md` files in `commands/` still work but `skills/` is preferred for new plugins ([source](https://code.claude.com/docs/en/skills)).

Claude Code skills follow the [Agent Skills open standard](https://github.com/agentskills/agentskills) and extend it with platform-specific fields ([source](https://code.claude.com/docs/en/skills)).

### Frontmatter fields

| Field | Required | Type | Default | Description |
|-------|----------|------|---------|-------------|
| `name` | No | string | Directory name | Display name and `/slash-command` identifier. Max 64 chars, kebab-case ([source](https://github.com/robanderson/claude-my-skills/blob/main/README.md)) |
| `description` | Recommended | string | First paragraph | What the skill does and when to use it. Drives auto-discovery. Combined with `when_to_use`, capped at 1,536 chars ([source](https://code.claude.com/docs/en/skills)) |
| `when_to_use` | No | string | -- | Additional trigger context, appended to `description` in the skill listing ([source](https://github.com/shanraisshan/claude-code-best-practice/blob/b711123cddfe2532b27b8bc3af729b403a0faf0e/best-practice/claude-skills.md)) |
| `argument-hint` | No | string | -- | Hint shown in `/` autocomplete, e.g. `[issue-number]` ([source](https://code.claude.com/docs/en/skills)) |
| `arguments` | No | string/list | -- | Named positional arguments for `$name` substitution |
| `disable-model-invocation` | No | boolean | `false` | `true` = only user can invoke via `/name`. Prevents auto-loading and subagent preloading ([source](https://code.claude.com/docs/en/skills)) |
| `user-invocable` | No | boolean | `true` | `false` = hidden from `/` menu. Claude can still auto-invoke ([source](https://code.claude.com/docs/en/skills)) |
| `allowed-tools` | No | string/list | -- | Tools granted without permission prompts during skill execution. Supports glob patterns: `Bash(git *)` ([source](https://code.claude.com/docs/en/skills)) |
| `model` | No | string | `inherit` | Model override. Accepts aliases (`sonnet`, `opus`, `haiku`), full model IDs, or `inherit` ([source](https://code.claude.com/docs/en/skills)) |
| `effort` | No | string | -- | `low`, `medium`, `high`, `xhigh`, `max` ([source](https://github.com/shanraisshan/claude-code-best-practice/blob/b711123cddfe2532b27b8bc3af729b403a0faf0e/best-practice/claude-skills.md)) |
| `context` | No | string | -- | `fork` = run in isolated subagent context ([source](https://code.claude.com/docs/en/skills)) |
| `agent` | No | string | `general-purpose` | Subagent type when `context: fork`. Can reference built-in or custom agents ([source](https://code.claude.com/docs/en/skills)) |
| `hooks` | No | object | -- | Lifecycle hooks scoped to this skill ([source](https://github.com/anthropics/claude-code/issues/27411)) |
| `paths` | No | string/list | -- | Glob patterns limiting auto-activation to matching files ([source](https://github.com/anthropics/claude-code/issues/27411)) |
| `shell` | No | string | `bash` | Shell for `` !`command` `` blocks. `bash` or `powershell` ([source](https://github.com/shanraisshan/claude-code-best-practice/blob/b711123cddfe2532b27b8bc3af729b403a0faf0e/best-practice/claude-skills.md)) |
| `version` | No | string | -- | Informational. Part of Agent Skills standard |
| `license` | No | string | -- | SPDX identifier. Part of Agent Skills standard |
| `compatibility` | No | string | -- | Platform compatibility hint. Part of Agent Skills standard |
| `metadata` | No | object | -- | Arbitrary metadata. Part of Agent Skills standard |

**Agent Skills standard fields** (cross-platform): `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` ([source](https://github.com/anthropics/claude-code/issues/25380)).

**Claude Code extension fields**: `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `model`, `effort`, `context`, `agent`, `hooks`, `paths`, `shell` ([source](https://github.com/anthropics/claude-code/issues/25380)).

### Skill discovery paths

| Location | Path | Applies to |
|----------|------|------------|
| Enterprise/Managed | See managed settings | All users in organization |
| Personal/User | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin is enabled |

When names collide: enterprise > personal > project. Plugin skills use `plugin-name:skill-name` namespace so they cannot conflict ([source](https://code.claude.com/docs/en/skills)).

### Skill lifecycle

1. **Session start**: Skill descriptions (not full content) are loaded and presented to Claude for auto-discovery.
2. **Invocation**: Full SKILL.md content loads when the skill is used (by user `/name` or Claude auto-invocation).
3. **Persistence**: Skill content stays in context for the remainder of the session.
4. **Compaction**: After compaction, first 5,000 tokens of each skill retained, with a combined 25,000-token budget. Skills with `disable-model-invocation: true` are never preloaded ([source](https://code.claude.com/docs/en/skills)).

### String substitutions in skill content

| Pattern | Description |
|---------|-------------|
| `$ARGUMENTS` | All arguments passed when skill is invoked |
| `$ARGUMENTS[N]` or `$N` | Positional argument (0-indexed) |
| `$name` | Named argument (when `arguments` frontmatter is set) |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Absolute path to the skill's directory |
| `` !`command` `` | Dynamic context injection — shell command output inserted at load time |

## 4. Context Files

### CLAUDE.md hierarchy

Claude Code loads CLAUDE.md files by walking up the directory tree from the working directory, concatenating all discovered files. Within each directory, `CLAUDE.local.md` is appended after `CLAUDE.md` ([source](https://code.claude.com/docs/en/memory)).

**Resolution order** (all are additive, not overriding):

| Priority | Location | Loaded when | Shared |
|----------|----------|-------------|--------|
| 1 (highest) | Managed policy: macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux `/etc/claude-code/CLAUDE.md` | Always, cannot be excluded | Org-wide |
| 2 | User global: `~/.claude/CLAUDE.md` | Every session | Personal |
| 3 | Project-user: `~/.claude/projects/<hash>/CLAUDE.md` | Every session (project-specific personal) | Personal |
| 4 | Project root: `./CLAUDE.md` or `./.claude/CLAUDE.md` | Every session | Via git |
| 5 | Project local: `./CLAUDE.local.md` | Every session | No (gitignored) |
| 6 | Parent directories | At launch (walking up from cwd) | Depends |
| 7 | Subdirectories | On demand, when Claude reads files in those dirs | Depends |

([source](https://www.morphllm.com/claude-md-examples), [source](https://code.claude.com/docs/en/memory))

### Rules directory

`.claude/rules/*.md` files provide modular, topic-scoped instructions as an alternative to monolithic CLAUDE.md. Files without `paths:` frontmatter load unconditionally. Files with `paths:` (glob patterns) load only when Claude works on matching files ([source](https://claudefa.st/blog/guide/mechanics/rules-directory)).

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "src/middleware/**/*.ts"
---
# API Guidelines
...
```

Rules are also available at user scope in `~/.claude/rules/` ([source](https://code.claude.com/docs/en/claude-directory)).

### Auto-memory

Claude maintains auto-memory at `~/.claude/projects/<hash>/memory/MEMORY.md`. First 200 lines or 25KB loaded every session. Claude writes learned observations here automatically ([source](https://code.claude.com/docs/en/memory)).

### Context isolation

All CLAUDE.md files, rules, and plugin content share one context. Plugin skills are loaded into the same conversation context as everything else. There is no per-plugin context isolation — skills from different plugins and project instructions all coexist. The only isolation mechanism is `context: fork` on individual skills, which runs them in a subagent with a separate context window ([source](https://code.claude.com/docs/en/features-overview)).

## 5. Hooks

### Event names

Events use PascalCase. All hook events ([source](https://code.claude.com/docs/en/hooks-guide.md), [source](https://prg.sh/notes/Claude-Code-Hooks)):

| Event | Trigger | Can block | Matcher applies |
|-------|---------|-----------|-----------------|
| `PreToolUse` | Before tool execution | Yes | Yes |
| `PostToolUse` | After tool succeeds | Yes | Yes |
| `PostToolUseFailure` | After tool fails | Yes | Yes |
| `PostToolBatch` | After parallel tool batch resolves | No | No |
| `PermissionRequest` | Permission dialog shown | Yes | Yes |
| `PermissionDenied` | Permission denied by auto-mode classifier | No | Yes |
| `UserPromptSubmit` | User submits prompt | Yes | No |
| `UserPromptExpansion` | User prompt being expanded | Yes | No |
| `Stop` | Main agent finishes turn | Yes | No |
| `StopFailure` | Main agent fails | No | No |
| `SubagentStart` | Subagent begins | No | No |
| `SubagentStop` | Subagent finishes | Yes | No |
| `Notification` | Notification sent | No | No |
| `PreCompact` | Before context compaction | No | No |
| `PostCompact` | After context compaction | No | No |
| `SessionStart` | Session begins | No | No |
| `SessionEnd` | Session ends | No | No |
| `FileChanged` | File change detected | No | No |
| `CwdChanged` | Working directory changed | No | No |
| `ConfigChange` | Configuration changed | No | No |
| `InstructionsLoaded` | CLAUDE.md/rules loaded | No | No |
| `TaskCreated` | Task item created | No | No |
| `TaskCompleted` | Task item completed | No | No |
| `WorktreeCreate` | Git worktree created | No | No |
| `WorktreeRemove` | Git worktree removed | No | No |
| `TeammateIdle` | Teammate idle (teams mode) | No | No |
| `Elicitation` | Elicitation prompt shown | No | No |
| `ElicitationResult` | Elicitation response received | No | No |

### Configuration format

Hooks live in JSON settings files at three levels, or in plugin `hooks/hooks.json` ([source](https://claude.com/blog/how-to-configure-hooks)):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
            "timeout": 60,
            "statusMessage": "Validating...",
            "if": "Edit(*.ts|*.tsx)"
          }
        ]
      }
    ]
  }
}
```

Plugin hooks files include a top-level `description` field ([source](https://claude.yourdocs.dev/docs/claude-code/hooks)).

### Handler types

Five handler types ([source](https://dev.to/speedy_devv/mcp-tool-hooks-in-claude-code-24f6)):

| Type | Description |
|------|-------------|
| `command` | Shell subprocess. Receives event JSON on stdin, outputs JSON on stdout |
| `http` | POST to a URL endpoint |
| `mcp_tool` | Direct RPC call to a connected MCP server |
| `prompt` | Single-turn LLM evaluation (Haiku default) |
| `agent` | Multi-turn subagent with Read/Grep/Glob access |

### Matcher syntax

Matchers apply only to `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, and `PermissionRequest` events ([source](https://claude.com/blog/how-to-configure-hooks)):

- Omitted or `""` or `"*"`: matches all tools
- Simple names: `Write` matches exactly
- Pipe-separated: `Edit|Write` matches either
- Regex: any pattern with regex metacharacters (beyond `|`) treated as JavaScript regex
- MCP tool pattern: `mcp__<server>__<tool>` ([source](https://code.claude.com/docs/en/agent-sdk/hooks))
- `if` field: permission-rule syntax for additional filtering, e.g. `"Edit(*.ts|*.tsx)"` ([source](https://dev.to/speedy_devv/mcp-tool-hooks-in-claude-code-24f6))

### Output format

Hook commands receive event JSON on stdin and output JSON on stdout ([source](https://prg.sh/notes/Claude-Code-Hooks)):

```json
{
  "continue": true,
  "stopReason": "Message when continue=false",
  "suppressOutput": false,
  "systemMessage": "Warning shown to user",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Auto-approved by policy",
    "updatedInput": { "command": "modified-command" },
    "additionalContext": "Context for Claude"
  }
}
```

`permissionDecision` values: `"allow"`, `"deny"`, `"ask"`, `"defer"` (TypeScript SDK only) ([source](https://code.claude.com/docs/en/agent-sdk/hooks)).

### Timeout and execution

- Default timeout: 60 seconds. Configurable per-hook via `timeout` field (in seconds) ([source](https://prg.sh/notes/Claude-Code-Hooks))
- Exit codes: 0 = success (parse JSON stdout), 2 = blocking error, other = non-blocking error ([source](https://claude.com/blog/how-to-configure-hooks))
- All matching hooks run in parallel. Identical hooks are deduplicated ([source](https://claude.yourdocs.dev/docs/claude-code/hooks))
- Hook environment includes `CLAUDE_PROJECT_DIR` and standard env vars ([source](https://claude.com/blog/how-to-configure-hooks))

## 6. Tool Mapping

Complete list of native tools. These are the exact strings used in permission rules, subagent `tools` fields, hook matchers, and `allowed-tools` in skills ([source](https://code.claude.com/docs/en/tools-reference)):

| Tool | Description | Permission |
|------|-------------|------------|
| `Agent` | Spawns subagent with own context window | No |
| `AskUserQuestion` | Multiple-choice questions for requirements/clarification | No |
| `Bash` | Execute shell commands | Yes |
| `CronCreate` | Schedule recurring/one-shot prompt in session | No |
| `CronDelete` | Cancel scheduled task by ID | No |
| `CronList` | List scheduled tasks | No |
| `Edit` | Targeted file edits (string replacement) | Yes |
| `EnterPlanMode` | Switch to plan mode | No |
| `EnterWorktree` | Create/switch to git worktree (not available to subagents) | No |
| `ExitPlanMode` | Present plan for approval/execution | No |
| `ExitWorktree` | Return to main worktree | No |
| `Glob` | Find files by pattern | No |
| `Grep` | Search file contents with regex | No |
| `KillShell` | Terminate a running shell | No |
| `LSP` | Code intelligence: jump to def, find refs, type errors | No |
| `Monitor` | Run background command, stream output lines back | Yes |
| `NotebookEdit` | Modify Jupyter notebook cells | Yes |
| `PowerShell` | Execute PowerShell commands (requires `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`) | Yes |
| `Read` | Read file contents | No |
| `ReadMcpResourceTool` | Read MCP resource by URI | No |
| `Skill` | Invoke a skill | No |
| `TaskCreate` | Create task in session checklist (interactive mode) | No |
| `TaskGet` | Get task details (interactive mode) | No |
| `TaskList` | List tasks (interactive mode) | No |
| `TaskUpdate` | Update task (interactive mode) | No |
| `TodoWrite` | Manage session task checklist (non-interactive/SDK mode) | No |
| `ToolSearch` | Search and load deferred tools | No |
| `WebFetch` | Fetch URL content | Yes |
| `WebSearch` | Search the web | Yes |
| `Write` | Create or overwrite files | Yes |

Additional tools available in specific contexts: `BashOutput` (read background process output), `MultiEdit` (batch edits), `NotebookRead`, `TodoRead`, `SlashCommand` ([source](https://blog.thepete.net/claude-code-tools/), [source](https://gist.github.com/wong2/e0f34aac66caf890a332f7b6f9e2ba8f)).

MCP tools appear as `mcp__<server>__<tool>` in permission rules and hook matchers ([source](https://code.claude.com/docs/en/agent-sdk/hooks)).

## 7. Install and Distribution

### Installation scopes

| Scope | Settings location | Who it affects | Shared | Modifiable |
|-------|-------------------|----------------|--------|------------|
| `user` | `~/.claude/settings.json` | You, all projects | No | Yes |
| `project` | `.claude/settings.json` | All collaborators | Yes (git) | Yes |
| `local` | `.claude/settings.local.json` | You, this repo only | No | Yes |
| `managed` | Server-managed / plist / registry / `managed-settings.json` | All users on machine | Yes (IT) | No |

([source](https://code.claude.com/docs/en/settings))

### Install commands

```bash
# Interactive: browse and install from marketplace
/plugin

# Direct install (default: user scope)
/plugin install plugin-name@marketplace-name

# With scope
claude plugin install formatter@your-org --scope project

# Add a marketplace
claude plugin marketplace add owner/repo
claude plugin marketplace add owner/repo --scope project
claude plugin marketplace add ./local-path

# Local development
claude --plugin-dir ./path-to-plugin

# CLI subcommands (non-interactive)
claude plugin install|uninstall|enable|disable|update|list
claude plugin marketplace add|list|update|remove
```

([source](https://code.claude.com/docs/en/discover-plugins), [source](https://code.claude.com/docs/en/plugin-marketplaces))

### Plugin caching

Plugins are cached at `~/.claude/plugins/cache/`. Orphaned versions deleted 7 days after update/uninstall. Marketplace catalogs tracked in `~/.claude/plugins/known_marketplaces.json` ([source](https://github.com/anthropics/claude-code/issues/51806)).

### Marketplace submission

1. Create repository with `.claude-plugin/marketplace.json`
2. Host on GitHub, GitLab, or any git host
3. Users add with `/plugin marketplace add owner/repo`
4. Default built-in marketplaces: `claude-plugins-official`, `claude-code-warp` ([source](https://www.sean-weldon.com/blog/2026-01-06-how-to-install-and-discover-claude-code-plugins-through-mark))

### Team distribution

Add `extraKnownMarketplaces` to `.claude/settings.json` to auto-prompt teammates on trust ([source](https://code.claude.com/docs/en/discover-plugins)):

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}
```

### Enterprise/managed distribution

Managed settings support `strictKnownMarketplaces` (allowlist) and `blockedMarketplaces` (blocklist) for marketplace control. `strictPluginOnlyCustomization` locks skills/agents to plugin delivery only ([source](https://code.claude.com/docs/en/settings)).

## 8. Runtime Components

### Subagents

Defined as Markdown files with YAML frontmatter in `agents/` directory ([source](https://code.claude.com/docs/en/sub-agents)).

**Frontmatter fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier, lowercase + hyphens |
| `description` | Yes | When Claude should delegate. Use `"PROACTIVELY"` for auto-invocation |
| `tools` | No | Allowlist. Inherits all if omitted. Supports `Task(agent_type)` / `Agent(agent_type)` syntax |
| `disallowedTools` | No | Denylist, removed from inherited set |
| `model` | No | `sonnet`, `opus`, `haiku`, full model ID, or `inherit` (default) |
| `permissionMode` | No | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | Maximum conversation turns |
| `skills` | No | Skills preloaded at startup (full content injected) |
| `mcpServers` | No | MCP servers available to this subagent |
| `hooks` | No | Hooks scoped to this subagent |
| `initialPrompt` | No | First prompt sent to subagent |
| `memory` | No | Memory configuration |
| `effort` | No | Effort level override |
| `background` | No | Run in background |
| `isolation` | No | Context isolation mode |
| `color` | No | Display color in UI |

([source](https://code.claude.com/docs/en/sub-agents))

**Resolution priority** (name collisions): managed > CLI flag (`--agents`) > project (`.claude/agents/`) > user (`~/.claude/agents/`) > plugin ([source](https://medium.com/@sathishkraju/claude-code-subagents-the-complete-guide-to-ai-agent-delegation-d0a9aba419d0)).

**Built-in agents:**

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| `general-purpose` | inherit | All | Default for complex multi-step tasks |
| `Explore` | haiku | Read-only | Fast codebase search |
| `Plan` | inherit | Read-only | Pre-planning research |
| `Bash` | inherit | Bash only | Terminal commands in separate context |
| `statusline-setup` | sonnet | Read, Edit | Configure status line |
| `claude-code-guide` | haiku | Glob, Grep, Read, WebFetch, WebSearch | Answer Claude Code questions |

([source](https://github.com/shanraisshan/claude-code-best-practice/blob/d07e4bb3/best-practice/claude-subagents.md))

**Security restriction**: Plugin-shipped agents cannot use `hooks`, `mcpServers`, or `permissionMode` frontmatter fields.

### MCP server support

Location: `.mcp.json` at plugin root. Supports `command` (stdio), `url` (SSE/HTTP), and environment variable substitution ([source](https://code.claude.com/docs/en/plugins)):

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": { "DATA_DIR": "${CLAUDE_PLUGIN_DATA}/state" }
    }
  }
}
```

Plugin MCP servers start automatically when the plugin is enabled.

### LSP server support

Location: `.lsp.json` at plugin root. Provides code intelligence (type errors, jump-to-def, find-refs) via the `LSP` tool ([source](https://git.durrantlab.pitt.edu/boostvolt/claude-code-lsps)):

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": { ".ts": "typescript", ".tsx": "typescriptreact" },
    "transport": "stdio",
    "initializationOptions": {},
    "settings": {},
    "restartOnCrash": true,
    "maxRestarts": 3
  }
}
```

### Monitors

Location: `monitors/monitors.json` at plugin root. Background processes that feed output lines back to Claude mid-conversation ([source](https://docs.claude.com/en/docs/claude-code/plugins-reference)):

```json
[
  {
    "name": "file-watcher",
    "command": "${CLAUDE_PLUGIN_ROOT}/scripts/watch.sh",
    "description": "Watches for file changes"
  }
]
```

Plugin monitors start automatically when the plugin is active. The `Monitor` tool can also be invoked directly by Claude to start ad-hoc background processes.

### Rules

`.claude/rules/*.md` files at project or user scope. Path-gated via `paths:` or `globs:` YAML frontmatter. Files without frontmatter load unconditionally. Rules survive compaction only if they lack `paths:` targeting ([source](https://claudefa.st/blog/guide/mechanics/rules-directory), [source](https://code.claude.com/docs/en/claude-directory)).

### Output styles and themes

`output-styles/` and `themes/` directories at plugin root. Output styles control response formatting. Themes define UI colors. Applied via `settings.json` `agent` key ([source](https://docs.claude.com/en/docs/claude-code/plugins-reference)).

### Scheduled tasks (Cron)

Session-scoped via `CronCreate`/`CronDelete`/`CronList` tools. Tasks persist across `--resume`/`--continue` if unexpired ([source](https://code.claude.com/docs/en/tools-reference)).

### Settings precedence

Managed > Enterprise > User > Project > Local. Higher scopes cannot be overridden by lower scopes. Settings are merged with more specific scopes adding to or overriding broader ones ([source](https://code.claude.com/docs/en/settings)).

### Settings file features

`settings.json` supports: `permissions` (allow/deny rules), `hooks`, `env` (environment variables), `defaultShell`, `language`, `enabledPlugins`, `extraKnownMarketplaces`, `allowedMcpServers`, `deniedMcpServers`, `enableAllProjectMcpServers`, `autoMemoryDirectory`, `plansDirectory`, `fileSuggestion`, `strictPluginOnlyCustomization`, and more ([source](https://gist.github.com/mculp/c082bd1e5a439410158974de90c89db7), [source](https://code.claude.com/docs/en/settings)).

## 9. Sources

All URLs referenced in this document:

| URL | Description |
|-----|-------------|
| [code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins) | Official plugin creation guide |
| [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) | Official skills documentation |
| [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) | Official subagents documentation |
| [code.claude.com/docs/en/hooks-guide.md](https://code.claude.com/docs/en/hooks-guide.md) | Official hooks guide |
| [code.claude.com/docs/en/tools-reference](https://code.claude.com/docs/en/tools-reference) | Official tools reference |
| [code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings) | Official settings reference |
| [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory) | Official memory/CLAUDE.md documentation |
| [code.claude.com/docs/en/claude-directory](https://code.claude.com/docs/en/claude-directory) | Official .claude directory explorer |
| [code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview) | Official features overview |
| [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) | Official marketplace guide |
| [code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins) | Official plugin discovery docs |
| [code.claude.com/docs/en/agent-sdk/hooks](https://code.claude.com/docs/en/agent-sdk/hooks) | SDK hooks documentation |
| [docs.claude.com/en/docs/claude-code/plugins-reference](https://docs.claude.com/en/docs/claude-code/plugins-reference) | Official plugins reference (Anthropic docs) |
| [docs.claude.com/en/docs/claude-code/plugin-marketplaces](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces) | Marketplace docs (Anthropic docs mirror) |
| [claude.com/blog/how-to-configure-hooks](https://claude.com/blog/how-to-configure-hooks) | Anthropic blog post on hooks |
| [github.com/anthropics/claude-code/.../plugin-structure/SKILL.md](https://github.com/anthropics/claude-code/blob/bf77ee65bc2805d18a7c6fce61fa2b04cdafcf88/plugins/plugin-dev/skills/plugin-structure/SKILL.md) | Official plugin-dev skill source |
| [github.com/anthropics/claude-code/issues/25380](https://github.com/anthropics/claude-code/issues/25380) | Bug: validator vs extended frontmatter fields |
| [github.com/anthropics/claude-code/issues/27411](https://github.com/anthropics/claude-code/issues/27411) | Bug: typo in user-invocable, incomplete field list |
| [github.com/anthropics/claude-code/issues/23547](https://github.com/anthropics/claude-code/issues/23547) | Docs: Task(agent_type) syntax in tools frontmatter |
| [github.com/anthropics/claude-code/issues/51806](https://github.com/anthropics/claude-code/issues/51806) | Bug: marketplace add vs known_marketplaces.json |
| [github.com/anthropics/claude-code/issues/26455](https://github.com/anthropics/claude-code/issues/26455) | Feature request: substitute decision type |
| [github.com/robanderson/claude-my-skills/blob/main/README.md](https://github.com/robanderson/claude-my-skills/blob/main/README.md) | Community skills reference |
| [github.com/shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice/blob/b711123cddfe2532b27b8bc3af729b403a0faf0e/best-practice/claude-skills.md) | Community best practice: skills frontmatter |
| [github.com/shanraisshan/claude-code-best-practice (subagents)](https://github.com/shanraisshan/claude-code-best-practice/blob/d07e4bb3/best-practice/claude-subagents.md) | Community best practice: subagent reference |
| [git.durrantlab.pitt.edu/boostvolt/claude-code-lsps](https://git.durrantlab.pitt.edu/boostvolt/claude-code-lsps) | LSP plugin examples and .lsp.json schema |
| [medium.com/@sathishkraju (subagents guide)](https://medium.com/@sathishkraju/claude-code-subagents-the-complete-guide-to-ai-agent-delegation-d0a9aba419d0) | Subagent resolution priority and model config |
| [dev.to/speedy_devv (MCP tool hooks)](https://dev.to/speedy_devv/mcp-tool-hooks-in-claude-code-24f6) | MCP tool hook type documentation |
| [prg.sh/notes/Claude-Code-Hooks](https://prg.sh/notes/Claude-Code-Hooks) | Hook event table and output format reference |
| [agentpatterns.ai (frontmatter reference)](http://agentpatterns.ai/tool-engineering/skill-frontmatter-reference/) | SKILL.md frontmatter field reference |
| [claudecodeguides.com (frontmatter explained)](https://claudecodeguides.com/skill-md-file-frontmatter-fields-explained/) | Detailed frontmatter field explanations |
| [claudefa.st (rules directory)](https://claudefa.st/blog/guide/mechanics/rules-directory) | Rules directory guide with path-scoping |
| [morphllm.com (CLAUDE.md examples)](https://www.morphllm.com/claude-md-examples) | CLAUDE.md hierarchy and load order |
| [codewithseb.com (CLAUDE.md guide)](https://www.codewithseb.com/blog/claude-md-memory-persistent-context-guide) | CLAUDE.md hierarchy with settings integration |
| [codingnomads.com (plugin guide)](https://codingnomads.com/claude-code-building-distributing-plugins) | CLAUDE_PLUGIN_ROOT vs CLAUDE_PLUGIN_DATA |
| [sean-weldon.com (marketplace guide)](https://www.sean-weldon.com/blog/2026-01-06-how-to-install-and-discover-claude-code-plugins-through-mark) | Marketplace installation scopes |
| [gist.github.com/mculp (env vars)](https://gist.github.com/mculp/e6a573f2a45ef7dbbf30f6a8574c7351) | Complete environment variables reference |
| [gist.github.com/mculp (settings.json)](https://gist.github.com/mculp/c082bd1e5a439410158974de90c89db7) | Complete settings.json reference |
| [gist.github.com/wong2 (system prompt)](https://gist.github.com/wong2/e0f34aac66caf890a332f7b6f9e2ba8f) | Claude Code system prompt and tool list |
| [blog.thepete.net (tools)](https://blog.thepete.net/claude-code-tools/) | Full tool list captured Dec 2025 |
| [hexdocs.pm/claude_code (skills)](https://hexdocs.pm/claude_code/skills.html) | Elixir SDK skills documentation |
| [github.com/agentskills/agentskills/issues/105](https://github.com/agentskills/agentskills/issues/105) | Agent Skills standard discussion re: Claude Code fields |
| [claudelab.net (plugin guide)](https://claudelab.net/en/articles/claude-code/plugins-guide) | Plugin development tutorial |
| [docs.rs/claude-codes (Rust SDK)](https://docs.rs/claude-codes/latest/claude_codes/tool_inputs/enum.ToolInput.html) | Rust SDK tool input types |
