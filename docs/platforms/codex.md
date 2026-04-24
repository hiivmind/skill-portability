# Codex Plugin Ecosystem

This document describes the OpenAI Codex plugin ecosystem as it relates to portability assessment and uplift. It consolidates the Codex-specific patterns from `plugin-portability-patterns.md` and `assessment-rubric.md` into the same format used for other platforms.

## Two consumption patterns

Codex supports two materially different consumption patterns that must not be confused:

### Skill discovery pattern

Lighter-weight path. Skills are made available through native skill discovery.

Install shapes:
- `~/.codex/skills/<skill-name>/SKILL.md`
- `~/.agents/skills/<namespace>/<skill-name>/SKILL.md`
- Symlink from `~/.agents/skills/<name>` to a repo `skills/` directory

Use when: the repo is mostly instructions, no plugin UI metadata needed, lowest friction matters.

### Plugin packaging pattern

Proper Codex plugin package.

```
<root>/
  .codex-plugin/
    plugin.json
  .agents/
    plugins/
      marketplace.json
  skills/
  hooks/
  .mcp.json
  .app.json
  assets/
```

Key properties:
- Manifest at `.codex-plugin/plugin.json`
- Registered in a marketplace file
- Can bundle skills, hooks, mcpServers, apps, and UI metadata
- Discovery at plugin level, not only through raw skill discovery

Use when: first-class Codex plugin package needed, bundles more than plain skill content, marketplace presentation desired.

For a single-plugin GitHub repo, the marketplace entry should point back to the repo root with `source.path: "."`.

Curated multi-plugin marketplace repos can still use `plugins/<name>/` packaging under one shared marketplace root.

### Upstream vs curated distinction

An upstream repo may support Codex without being laid out as a native Codex plugin repo. Assessment must distinguish:

- **Upstream source shape** — the multi-platform source repo
- **Codex install shape** — how Codex consumes it (skill discovery or plugin)
- **Curated distribution shape** — separately packaged for marketplace

## Plugin manifest (`.codex-plugin/plugin.json`)

```json
{
  "name": "my-plugin",
  "description": "Brief description",
  "version": "1.0.0",
  "skills": "./skills/",
  "hooks": "./hooks/",
  "mcpServers": "./.mcp.json",
  "apps": "./.app.json"
}
```

## Marketplace manifest

Location: `.agents/plugins/marketplace.json` (repo-local) or `~/.agents/plugins/marketplace.json` (home-local).

```json
{
  "name": "my-marketplace",
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "."
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

For a single-plugin upstream repo installed from GitHub, `path: "."` is the important detail: the marketplace entry points at the repository root because the repo itself is the plugin.

## Installation and discovery

### Skill-discovery install

1. Clone repo locally
2. Symlink or copy `skills/` to `~/.agents/skills/<name>`
3. Restart Codex
4. Verify skills are discoverable

### Native plugin install

Two shapes:

| Shape | Plugin path | Marketplace path |
|-------|-------------|------------------|
| Single-plugin upstream repo | `<repo>/` | `<repo>/.agents/plugins/marketplace.json` |
| Curated multi-plugin repo | `<repo>/plugins/<name>` | `<repo>/.agents/plugins/marketplace.json` |
| Home-local | `~/plugins/<name>` | `~/.agents/plugins/marketplace.json` |

### CLI marketplace commands

```bash
codex marketplace add owner/repo
codex marketplace add owner/repo --ref main
codex marketplace add https://github.com/owner/repo
codex marketplace add /path/to/local/marketplace-root
```

Current Codex CLI exposes marketplace registration directly. Plugin enablement then happens in the `/plugins` UI, or equivalently through `~/.codex/config.toml` by adding:

```toml
[plugins."my-plugin@my-marketplace"]
enabled = true
```

### Built-in skill commands

Codex ships with built-in skills for managing other skills:
- `$skill-installer` — install skills from the curated catalog at `github.com/openai/skills` or by GitHub URL
- `$skill-creator` — scaffold a new skill with guided prompts

## Skills system

Codex supports the open SKILL.md standard.

### Skill discovery paths

| Scope | Path |
|-------|------|
| Repo (closest) | `.agents/skills/` in current directory |
| Repo (parents) | `.agents/skills/` in parent directories |
| Repo (root) | `.agents/skills/` at repository root |
| User | `~/.agents/skills/` |
| User | `~/.codex/skills/` |
| Admin | `/etc/codex/skills/` |
| System | Bundled with Codex (e.g., `$skill-installer`, `$skill-creator`) |
| Plugin-bundled | `skills/` directory in plugin |

### SKILL.md frontmatter

`name` (required), `description` (required). Standard YAML frontmatter.

### Invocation

Skills can be invoked explicitly with the `$` prefix (`$skill-name`) or implicitly — Codex matches task descriptions to skill descriptions and loads matching skills automatically.

## Context files

Codex uses `AGENTS.md` as its primary context file.

- `AGENTS.md` at project root or in `.agents/` directories
- The `project_doc_fallback_filenames` config key can be expanded to recognize alternate names. `CLAUDE.md` is not a documented default fallback.

For Codex plugin repos, `.codex/INSTALL.md` should point to the marketplace install instructions. For skill-discovery installs, it should document the symlink or copy path.

## Tool mapping

Codex uses different tool names from Claude Code:

| Claude Code | Codex equivalent |
|-------------|-----------------|
| `Task` (dispatch subagent) | `spawn_agent` with `agent_type` and `message` |
| Multiple `Task` calls | Multiple `spawn_agent` calls |
| `TodoWrite` | `update_plan` |
| `Skill` tool | Native skill loading |
| `Read`, `Write`, `Edit` | Native file tools |
| `Bash` | Native shell tools |

### Subagent dispatch

Codex uses generic agent roles (`default`, `explorer`, `worker`) instead of named agent types.

When a skill references a named agent:
1. Find the agent's prompt file
2. Read prompt content
3. Fill template placeholders
4. Spawn a `worker` agent with filled content as `message`

Message framing:
```
Your task is to perform the following. Follow the instructions below exactly.

<agent-instructions>
[filled prompt content]
</agent-instructions>

Execute this now. Output ONLY the structured response.
```

### Multi-agent support

Requires `multi_agent = true` in `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

As of 2026, multi-agent is enabled by default and no longer requires manual configuration.

### Environment detection

Skills creating worktrees should detect their environment:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → already in a linked worktree
- `BRANCH` empty → detached HEAD (cannot branch/push from sandbox)

### Codex App finishing

When sandbox blocks branch/push (detached HEAD), the agent commits and informs the user to use App controls: "Create branch" or "Hand off to local."

## MCP servers

Codex supports MCP server configuration via `.mcp.json` in the plugin directory.

## Hooks

Codex supports hooks through its plugin system. Hook configuration follows a similar pattern to other platforms.

## Portability-relevant limitations

1. Two materially different consumption patterns — must decide skill-discovery vs plugin packaging
2. No named agent registry — `spawn_agent` uses generic roles, not named types
3. Plugin installation is a two-step flow: marketplace registration, then plugin enablement
4. Codex App sandbox may block branch/push operations (detached HEAD)
5. Upstream source layout may differ from curated marketplace packaging
6. `update_plan` instead of `TodoWrite` for task tracking
7. Message framing for subagents is user-level input, not system prompt

## Assessment criteria

### Packaging decision

Score 3 when:
- Explicit decision made between skill-discovery and plugin packaging
- Chosen path fully implemented
- `.codex-plugin/plugin.json` present if plugin path chosen
- `.agents/plugins/marketplace.json` present if the repo should be installable as a Codex plugin from GitHub
- Install docs match the chosen path

Score 2 when:
- One path partially implemented
- Missing marketplace.json or install docs

Score 1 when:
- Skills exist in compatible paths but no Codex-specific packaging

Score 0 when:
- No Codex-compatible structure

### Skill compatibility

Score 3 when:
- Skills in standard `skills/<name>/SKILL.md` with frontmatter
- `references/codex-tools.md` sidecar present per skill
- Subagent dispatch uses Codex message framing
- Environment detection present for worktree-aware skills

Score 2 when:
- Skills present with frontmatter but missing codex-tools sidecar

Score 1 when:
- Skills reference Claude-specific tools without mapping

Score 0 when:
- Skills cannot function in Codex

### Context delivery

Score 3 when:
- `AGENTS.md` present with complete skill listing and tool mapping guidance
- `.codex/INSTALL.md` present with install instructions
- Context file accurately describes capabilities

Score 2 when:
- `AGENTS.md` present but missing install docs

Score 1 when:
- Only `CLAUDE.md` present (Codex reads as fallback)

Score 0 when:
- No context delivery

### Install documentation

Score 3 when:
- Platform-specific install instructions present
- Verification steps included
- Distinction between skill-discovery and plugin install is explicit
- Restart requirements documented

Score 2 when:
- Install docs exist but are incomplete or generic

Score 1 when:
- Install path is inferrable but undocumented

Score 0 when:
- No install documentation
