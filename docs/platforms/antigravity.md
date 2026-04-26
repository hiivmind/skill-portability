# Google Antigravity Plugin Ecosystem

This document describes the Google Antigravity IDE plugin ecosystem as it relates to portability assessment and uplift.

Google Antigravity is an agent-first development platform released November 18, 2025, built on a VS Code fork and powered by Google's Gemini 3 model family. It features a dual-view architecture: an Editor view (AI-powered IDE) and an Agent Manager view (mission control for orchestrating multiple agents across workspaces). [source](https://antigravity.google/blog/introducing-google-antigravity)

## 1. Plugin Structure

Antigravity does not have a formal "plugin" packaging system equivalent to Claude Code's `.claude-plugin/plugin.json`. Instead, agent capabilities are extended through a combination of **Skills**, **Rules**, **Workflows**, and **MCP servers**, organized in well-known directories at workspace and global scopes.

### Canonical layout (workspace scope)

```
<workspace-root>/
  .agents/                        # primary workspace config directory
    skills/                       # skill directories
      <skill-name>/
        SKILL.md                  # skill definition (required)
        scripts/                  # optional helper scripts
        examples/                 # optional reference implementations
        references/               # optional documentation/templates
        assets/                   # optional static assets
    rules/                        # workspace rules (.md files)
      coding-standards.md
      security-policy.md
  AGENTS.md                       # universal context file (cross-platform)
```

### Global layout

```
~/.gemini/
  GEMINI.md                       # global rules (Antigravity-native)
  antigravity/
    skills/                       # global skills directory
      <skill-name>/
        SKILL.md
  global_workflows/               # global workflow definitions
    <workflow-name>.md
```

### Deployment shapes

| Shape | Description |
|-------|-------------|
| Workspace skills | `.agents/skills/<name>/SKILL.md` -- project-specific |
| Global skills | `~/.gemini/antigravity/skills/<name>/SKILL.md` -- all workspaces |
| Workspace rules | `.agents/rules/<name>.md` -- project-specific guardrails |
| Global rules | `~/.gemini/GEMINI.md` -- user-wide guardrails |
| Workflows | `~/.gemini/antigravity/global_workflows/<name>.md` (global) or workspace-level |
| MCP servers | Configured via Antigravity settings UI |

### Backward compatibility

Antigravity now defaults to `.agents/` (plural) but maintains backward support for `.agent/` (singular). [source](https://antigravity.google/docs/skills)

### Required vs optional files

Only `SKILL.md` is required within a skill directory. All other subdirectories (`scripts/`, `examples/`, `references/`, `assets/`) are optional and loaded on demand. [source](https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en)

## 2. Manifest

Antigravity has **no plugin manifest file** analogous to Claude Code's `plugin.json` or Cursor's `.cursor-plugin/plugin.json`. There is no declarative manifest that enumerates skills, rules, or other components.

Instead, Antigravity uses **directory-based auto-discovery**:

| Component | Discovery mechanism |
|-----------|-------------------|
| Skills | Directories containing `SKILL.md` in `.agents/skills/` or `~/.gemini/antigravity/skills/` |
| Rules | `.md` files in `.agents/rules/` or `~/.gemini/GEMINI.md` |
| Workflows | `.md` files in `~/.gemini/antigravity/global_workflows/` or created via UI |

Skills are indexed by their `SKILL.md` frontmatter `name` and `description` fields. The agent semantic-matches user prompts against skill descriptions to decide which to activate. [source](https://antigravity.google/docs/skills)

## 3. Skills

Antigravity fully supports the SKILL.md open standard. Skills follow a progressive disclosure pattern: the agent sees only lightweight metadata (name + description) at session start and loads full instructions on demand. [source](https://antigravity.google/docs/skills)

### Skill discovery

Skills are discovered in two locations:

| Scope | Path |
|-------|------|
| Workspace | `<workspace>/.agents/skills/<skill-name>/SKILL.md` |
| Global | `~/.gemini/antigravity/skills/<skill-name>/SKILL.md` |

The agent automatically detects user intent and activates matching skills based on semantic similarity to the `description` field. No explicit invocation is required, though users can mention a skill by name to force activation. [source](https://antigravity.google/docs/skills)

### SKILL.md frontmatter

Antigravity parses standard SKILL.md YAML frontmatter:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Lowercase-hyphenated identifier. Defaults to folder name. |
| `description` | **Yes** | Semantic trigger text. The agent matches user prompts against this. Must be specific. |

### Frontmatter fields stripped by Antigravity

Antigravity strips or ignores several Claude Code-specific frontmatter fields:

- `model` -- Antigravity uses its own model selection (Gemini 3 Pro, Claude Sonnet 4.5, GPT-OSS)
- `tools` -- not recognized; Antigravity has its own tool system
- `disable-model-invocation` -- not supported
- `allowed-tools` -- not recognized by Antigravity's skill router
- `user-invocable` -- Antigravity uses Workflows for slash-command invocation, not skills

These fields are silently ignored rather than causing parse errors, so skills with these fields remain loadable but the fields have no effect. [source](https://www.agensi.io/learn/skill-md-format-reference)

### Skill folder structure

```
my-skill/
  SKILL.md           # definition file (required)
  scripts/           # Python, Bash, or Node scripts (optional)
    run.py
    util.sh
  references/        # documentation or templates (optional)
    api-docs.md
  examples/          # reference implementations (optional)
    input.json
    output.py
  assets/            # static assets (optional)
```

Scripts are referenced by relative path from within `SKILL.md` and executed via the agent's terminal tool. [source](https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en)

### Skill body conventions

The markdown body should include:

1. **Goal** -- clear statement of what the skill achieves
2. **Instructions** -- step-by-step logic
3. **Examples** -- few-shot input/output pairs
4. **Constraints** -- "do not" rules and safety boundaries

[source](https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en)

## 4. Context Files

### AGENTS.md

Antigravity supports `AGENTS.md` as a universal context file, following the cross-platform standard. Priority order:

1. `AGENTS.md` (highest -- universal standard)
2. `GEMINI.md` (Antigravity-native)
3. Built-in defaults

Most developers use `AGENTS.md` for portability across tools (Cursor, Windsurf, etc.). [source](https://antigravity.md/)

### GEMINI.md

The Antigravity-native configuration file. Lives at `~/.gemini/GEMINI.md` for global scope. Defines the agent's personality, goals, behavioral guidelines, and coding style rules. Functions as the agent's system-level instructions. [source](https://antigravity.google/docs/rules-workflows)

### Rules files

Workspace-specific context is provided via `.agents/rules/*.md` files. Each rule file is a standalone Markdown document limited to 12,000 characters. Rules support four activation modes:

| Mode | Description |
|------|-------------|
| **Manual** | Activated via `@mention` in the agent's input box |
| **Always On** | Applied to every conversation |
| **Model Decision** | Agent decides based on natural language description |
| **Glob** | Applied when matching file patterns (e.g., `*.js`, `src/**/*.ts`) |

Rules support `@filename` references to include other files. Relative paths resolve from the rule file location; absolute paths resolve from the workspace root. [source](https://antigravity.google/docs/rules-workflows)

### No CLAUDE.md equivalent

Antigravity does not read `CLAUDE.md` files. Projects targeting both platforms should maintain both `AGENTS.md` (read by Antigravity) and `CLAUDE.md` (read by Claude Code).

## 5. Hooks

Antigravity **does not support hooks**. There is no equivalent to Claude Code's `PreToolUse`, `PostToolUse`, or `Stop` hook events. [source](https://discuss.ai.google.dev/t/hooks-in-antigravity/120458)

The platform relies on:

- **Rules** (passive guardrails) for enforcement (~60% compliance vs hooks' deterministic enforcement)
- **MCP servers** for external system integration
- **Workflows** for structured multi-step automation

Community members have requested hook support via the Google AI Developers Forum, but it remains unimplemented as of April 2026. [source](https://discuss.ai.google.dev/t/hook-support-for-context-mode/129626)

### Portability impact

Skills that depend on Claude Code hooks (`hooks` frontmatter field, `settings.json` hook configurations) have no equivalent mechanism in Antigravity. Hook logic must be converted to either Rules (for passive guidance) or MCP server integrations (for active enforcement).

## 6. Tool Mapping

Antigravity agents operate across three surfaces: **editor**, **terminal**, and **browser**. The tool names differ from Claude Code.

### Available tools

| Antigravity tool | Claude Code equivalent | Description |
|-----------------|----------------------|-------------|
| File read/write | `Read`, `Write`, `Edit` | Agent can read and edit files in the editor |
| Terminal execution | `Bash` | Agent executes commands in the built-in terminal |
| Browser control | `WebSearch`, `WebFetch` (partial) | Click, scroll, type, read DOM, take screenshots, record video |
| `run_command` | `Bash` | Referenced in skill instructions for script execution |

### Tool permission model

Antigravity uses a configurable permission model for terminal commands:

- **Auto-execute**: Commands run automatically (except those on a deny list)
- **Review mode**: User must approve each command before execution

### Browser tools (unique to Antigravity)

Antigravity's browser agent has native tools for:

- Clicking, scrolling, typing on web pages
- Reading pages via DOM capture, screenshots, or markdown parsing
- Taking screenshots and recording videos
- Reading console logs

This is a significant differentiator -- Claude Code requires MCP servers (e.g., Playwright) for browser automation, while Antigravity has it built in. [source](https://antigravity.google/docs/home)

### Artifacts system (unique to Antigravity)

Agents produce **artifacts** as tangible deliverables: task plans, implementation plans, diff views, architecture diagrams, screenshots, browser recordings. These serve as verifiable proof of work. [source](https://antigravity.google/docs/home)

## 7. Install and Distribution

### Skill installation

Skills are installed by copying directories into the appropriate scope:

```bash
# Workspace scope
mkdir -p .agents/skills
cp -R /path/to/skill-name .agents/skills/

# Global scope
cp -R /path/to/skill-name ~/.gemini/antigravity/skills/
```

### npm installer (community)

The [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) project provides an npm-based installer for cross-platform skill distribution:

```bash
# Default: installs to ~/.gemini/antigravity/skills
npx antigravity-awesome-skills

# With filters
npx antigravity-awesome-skills --category development,backend --risk safe,none

# Explicit Antigravity target
npx antigravity-awesome-skills --antigravity
```

[source](https://github.com/sickn33/antigravity-awesome-skills)

### No official marketplace

Antigravity does not have an official skill marketplace or registry. Distribution is via:

1. **Git repositories** -- clone/copy skill directories
2. **npm installers** -- community tools like `antigravity-awesome-skills`
3. **Manual sharing** -- copy `SKILL.md` files directly

### VS Code extensions

As a VS Code fork, Antigravity uses the **OpenVSX** registry for IDE extensions (not the Visual Studio Marketplace). VS Code Marketplace extensions can be installed manually via `.vsix` files. This is separate from the skill/agent system. [source](https://medium.com/@agurindapalli/how-to-install-vs-code-marketplace-extensions-in-googles-antigravity-ide-example-deepblue-theme-689cdcd735eb)

### Community skill repositories

| Repository | Skills | Description |
|-----------|--------|-------------|
| [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | 1,400+ | Cross-platform skill library with npm installer |
| [rmyndharis/antigravity-skills](https://github.com/rmyndharis/antigravity-skills) | 300+ | Ported from Claude Code ecosystem |
| [xenitV1/Antigravity-Workflows](https://github.com/xenitV1/Antigravity-Workflows) | 35 categories | Workflows, agents, and skills system |
| [rominirani/antigravity-skills](https://github.com/rominirani/antigravity-skills) | Tutorial set | Official Google codelab examples |

## 8. Runtime Components

### Agents

Antigravity's core runtime is the **Agent** -- a multi-step reasoning system powered by a frontier LLM. Key properties:

- Agents can reason over existing code, use tools (including browser), and communicate via tasks and artifacts
- Multiple agent conversations can run in parallel
- Agents operate across editor, terminal, and browser surfaces simultaneously
- Supported models: Gemini 3 Pro, Gemini 3.1 Pro, Gemini 3 Flash, Claude Sonnet 4.5/Opus 4.6, GPT-OSS

[source](https://antigravity.google/docs/agent)

### Agent Manager

The Agent Manager is a unique "mission control" surface for:

- Spawning and orchestrating multiple agents across multiple workspaces
- Monitoring agent progress asynchronously
- Reviewing artifacts (plans, diffs, screenshots, recordings)
- Managing parallel development workflows

[source](https://antigravity.google/docs/home)

### Workflows

Workflows are markdown files that define a structured sequence of steps, invoked via `/workflow-name` slash commands. [source](https://antigravity.google/docs/rules-workflows)

| Scope | Location |
|-------|----------|
| Global | `~/.gemini/antigravity/global_workflows/<name>.md` |
| Workspace | Created via Antigravity UI |

Workflow files are limited to 12,000 characters each. Workflows can call other workflows (e.g., `/workflow-1` can include "Call `/workflow-2`"). The agent can also generate workflows from conversation history.

### Rules

Rules are passive, always-on (or conditionally-on) guardrails. They differ from Skills (on-demand capability) and Workflows (user-triggered sequences):

| Component | Activation | Purpose |
|-----------|-----------|---------|
| **Rules** | Passive (always-on, glob, model-decision, or manual) | Guardrails and constraints |
| **Skills** | Agent-triggered (semantic match) | On-demand capability extension |
| **Workflows** | User-triggered (`/command`) | Structured multi-step procedures |

[source](https://antigravity.google/docs/rules-workflows)

### MCP support

Antigravity supports the Model Context Protocol for connecting agents to external systems: databases (Postgres, MySQL, MongoDB), Git, Slack, Linear, and APIs. MCP servers extend agents beyond local file access. [source](https://antigravity.md/)

### Unique features

| Feature | Description |
|---------|-------------|
| **Agent Manager** | Multi-agent orchestration across workspaces |
| **Browser agent** | Native browser control (click, scroll, type, screenshot, record) |
| **Artifacts** | Structured deliverables (plans, diffs, diagrams, recordings) |
| **Swarm development** | Multiple specialized agents working in parallel |
| **Asynchronous agents** | Agents work independently while user focuses on other tasks |
| **Dual-view architecture** | Editor view + Manager view |
| **Agent-generated workflows** | Agent creates workflows from conversation history |

## 9. Sources

### Official documentation

- [Google Antigravity home](https://antigravity.google/)
- [Antigravity documentation hub](https://antigravity.google/docs/home)
- [Agent documentation](https://antigravity.google/docs/agent)
- [Skills documentation](https://antigravity.google/docs/skills)
- [Rules and Workflows documentation](https://antigravity.google/docs/rules-workflows)
- [Introducing Google Antigravity (blog)](https://antigravity.google/blog/introducing-google-antigravity)

### Google Codelabs

- [Authoring Google Antigravity Skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en)
- [Getting Started with Google Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)

### Community and third-party

- [Antigravity.md guide](https://antigravity.md/)
- [SKILL.md Format Reference (agensi.io)](https://www.agensi.io/learn/skill-md-format-reference)
- [What is Google Antigravity? Complete Guide (antigravity.im)](https://antigravity.im/blog/what-is-google-antigravity-complete-guide)
- [Build Better AI Agents with Antigravity Skills (KDnuggets)](https://www.kdnuggets.com/build-better-ai-agents-with-google-antigravity-skills-and-workflows)
- [CXO Digital Pulse coverage](https://www.cxodigitalpulse.com/google-moves-to-unify-ai-coding-tools-under-antigravity-platform/)

### GitHub repositories

- [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) -- 1,400+ cross-platform skills with npm installer
- [rmyndharis/antigravity-skills](https://github.com/rmyndharis/antigravity-skills) -- 300+ skills ported from Claude Code
- [xenitV1/Antigravity-Workflows](https://github.com/xenitV1/Antigravity-Workflows) -- Workflows, agents, and skills system
- [rominirani/antigravity-skills](https://github.com/rominirani/antigravity-skills) -- Official codelab examples

### Forum discussions

- [Hooks in Antigravity (Google AI Developers Forum)](https://discuss.ai.google.dev/t/hooks-in-antigravity/120458)
- [Hook support for context-mode (Google AI Developers Forum)](https://discuss.ai.google.dev/t/hook-support-for-context-mode/129626)
