# Skill and Plugin Portability Patterns

This document defines the repository patterns, assessment criteria, uplift targets, and installation flows needed to make a skill or plugin repo portable across agent platforms.

It is written for two audiences:

- plugin authors who want to understand how to structure a portable repo
- future portability skills that need a concrete model for assessing, uplifting, and documenting installation

## Core terms

The same words are used differently across ecosystems. For portability work, use these definitions consistently:

- **Skill**: a task-focused instruction bundle, usually centered on a `SKILL.md` file and optional `references/`, `scripts/`, and assets.
- **Plugin**: a distributable package that may contain one or more skills plus platform-specific manifests, hooks, apps, MCP servers, commands, and context files.
- **Portable plugin repo**: a single repository that can be consumed by multiple agent platforms through parallel manifests and adapter files.
- **Uplift**: adding the missing manifests, context files, tool mappings, and install guidance needed to make an existing repo portable.
- **Assessment**: determining what shape a repo is currently in, what platforms it already supports, and what gaps block portability.

## The three common starting shapes

Most inputs fall into one of these shapes.

### 1. Bare skill repo

This shape has one or more `SKILL.md` files but no real plugin packaging.

Typical signals:

- `skills/<name>/SKILL.md`
- optional `references/` beside skills
- no `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `gemini-extension.json`, or OpenCode plugin files

This is the easiest shape to uplift. The repo already contains the core behavior, but it lacks distribution and platform metadata.

### 2. Single-platform plugin repo

This shape targets one ecosystem and leaves the rest implicit or unsupported.

Typical examples:

- Claude-focused: `.claude-plugin/plugin.json`
- Cursor-focused: `.cursor-plugin/plugin.json`
- Gemini-focused: `gemini-extension.json` and `GEMINI.md`
- Codex-focused: `.codex-plugin/plugin.json` or a documented `~/.agents/skills` install path

This is the most common real-world case. The repo has enough metadata to infer name, description, authorship, and component layout, but uplift still requires generating the missing platform artifacts.

### 3. Multi-platform source repo

This shape already carries multiple manifests and adapter files.

Typical signals:

- multiple platform manifests in parallel
- shared `skills/`, `hooks/`, `agents/`, `commands/`
- platform context files such as `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`
- platform-specific hook or plugin shims

This is the target state for a portable plugin repo.

## Codex-specific distinction: skills vs plugins

Codex supports two materially different consumption patterns.

### Codex skill discovery pattern

This is the lighter-weight path. A skill repo is made available directly through Codex skill discovery.

Typical install shapes:

- `~/.codex/skills/<skill-name>/SKILL.md`
- `~/.agents/skills/<namespace>/<skill-name>/SKILL.md`
- a symlink from `~/.agents/skills/<name>` to a repo `skills/` directory

Use this pattern when:

- the repo is mostly instructions
- there is no need for plugin UI metadata
- there are no bundled apps, MCP servers, or installable plugin surfaces
- the lowest-friction Codex path matters more than packaging completeness

### Codex plugin packaging pattern

This is the proper Codex plugin package shape.

Minimal structure:

```text
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

- the plugin has a manifest at `.codex-plugin/plugin.json`
- the plugin is registered in a marketplace file
- the plugin can bundle `skills`, `hooks`, `mcpServers`, `apps`, and UI metadata
- install/discovery happens at the plugin level, not only through raw skill discovery

Use this pattern when:

- you want a first-class Codex plugin package
- you want one installable unit for multiple capabilities
- you need Codex plugin metadata or marketplace presentation
- you want the repo to model plugin packaging explicitly, not only skill loading

For a single-plugin GitHub repo, `.agents/plugins/marketplace.json` should point to the repo root with `source.path: "."`.
Use the `plugins/<name>/` layout only for curated marketplace repos that contain multiple plugins.

### Important portability note

An upstream repo may support Codex without being laid out as a native Codex plugin repo.

The Superpowers repo is the canonical example:

- the upstream repo is a multi-platform source repo
- Codex support is provided through a Codex-specific install path and native skill discovery
- the OpenAI-curated cached copy is separately packaged for Codex marketplace consumption

Assessment must distinguish between:

- **upstream source shape**
- **Codex install shape**
- **curated distribution shape**

Do not assume they are identical.

## Assessment pattern

Assessment should classify the input repo, identify reusable metadata, and report portability gaps without writing files.

### Assessment goals

A good assessment answers:

1. What kind of repo is this now?
2. What platforms does it already support?
3. What is the canonical metadata source?
4. Are the skills already portable in content, or only in packaging?
5. What files are missing to reach the target portable shape?
6. What platform limits are structural and cannot be solved in-repo?
7. How should users install the uplifted result on each platform?

### Assessment inventory

Check for these categories.

#### Skill content

- `skills/**/SKILL.md`
- root-level `SKILL.md`
- `references/` beside skills
- scripts or assets used by skills

#### Platform manifests

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.cursor-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `gemini-extension.json`
- `package.json`
- `.opencode/plugins/*.js`

#### Context and instruction files

- `CLAUDE.md`
- `AGENTS.md`
- `GEMINI.md`
- platform install docs such as `.codex/INSTALL.md`

#### Runtime adapters

- `hooks/hooks.json`
- `hooks/hooks-cursor.json`
- hook scripts
- MCP configs
- app manifests
- command definitions
- agent prompt files

### Metadata precedence

During uplift, avoid guessing when a richer manifest already exists.

Recommended precedence:

1. platform manifest with the richest complete metadata
2. package metadata from another platform manifest
3. repo `README.md`
4. directory name as last resort

Useful fields to capture:

- `name`
- `displayName`
- `description`
- `version`
- `author`
- `homepage`
- `repository`
- `license`
- `keywords`
- declared paths to `skills`, `hooks`, `agents`, `commands`, `apps`, `mcp`

### Assessment output shape

A future assessment skill should emit a report with these sections:

- **Current shape**
- **Detected platforms**
- **Canonical metadata source**
- **Existing components**
- **Missing artifacts by platform**
- **Structural blockers**
- **Recommended uplift target**
- **Recommended install guidance**

### Common blockers

These should be reported explicitly rather than hidden:

- skills assume Claude-specific tool names with no mapping
- hooks reference environment variables from one platform only
- repo depends on whole-repo installation but ships only single-skill instructions
- named agents exist in one platform but not another
- user-facing docs describe only one install path
- no stable plugin metadata source exists

## Uplift pattern

Uplift turns an assessed repo into a portable plugin repo by adding the missing platform artifacts while preserving the original content model.

### Uplift principle

Do not rewrite the core skill behavior unless portability requires it. Prefer to:

- preserve `skills/` as the canonical content
- add manifests around it
- add tool-mapping references where platform tool names differ
- add install docs and context files
- adapt hooks and commands instead of rewriting skills wholesale

### Target portable shape

A practical uplift target looks like this:

```text
<root>/
  .claude-plugin/
    plugin.json
    marketplace.json
  .cursor-plugin/
    plugin.json
  .codex-plugin/
    plugin.json
  .codex/
    INSTALL.md
  .opencode/
    plugins/
      <name>.js
  skills/
    <skill-a>/
      SKILL.md
      references/
        codex-tools.md
        copilot-tools.md
        gemini-tools.md
  hooks/
    hooks.json
    hooks-cursor.json
    run-hook.cmd
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  gemini-extension.json
  package.json
  README.md
```

Not every repo needs every file, but this is the right mental model for a full uplift target.

### Uplift work items

#### 1. Normalize shared content layout

Ensure the repo has stable locations for:

- skills
- hook configs and scripts
- commands
- agents
- assets
- optional MCP and app manifests

If a repo stores skills in unusual locations, either preserve that with explicit manifest paths or move them once and document the new canonical layout.

#### 2. Generate missing platform manifests

Typical uplift outputs:

- Claude: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Cursor: `.cursor-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json` if packaging as a native Codex plugin
- Gemini: `gemini-extension.json`
- OpenCode: `package.json` and `.opencode/plugins/<name>.js`

#### 3. Add platform context files

These files explain or inject the plugin behavior at session start or load time:

- `CLAUDE.md`
- `AGENTS.md`
- `GEMINI.md`
- `.codex/INSTALL.md` when Codex uses a skill-discovery install path

#### 4. Add per-skill tool mapping sidecars

Where skills speak in one platform’s tool vocabulary, add sidecars such as:

- `references/codex-tools.md`
- `references/copilot-tools.md`
- `references/gemini-tools.md`

This is essential for portable skills that refer to tools like `Skill`, `Task`, `Read`, `Edit`, or hook mechanisms.

#### 5. Port hooks carefully

Hook portability often needs:

- different hook config schemas per platform
- environment variable branching
- a wrapper script for Windows
- explicit documentation for platforms with no hook system

#### 6. Add install guidance

An uplift is incomplete if users cannot install the result. The uplifted repo must explain:

- plugin installation flows
- skill-only installation flows where supported
- the difference between upstream source layout and packaged distribution layout

### Codex uplift decision tree

For Codex specifically, an uplift skill should choose between two supported outputs.

#### Option A: Codex skill-first support

Choose this when:

- the repo is primarily a skills library
- there is no need for plugin UI packaging
- the simplest install path is cloning and exposing `skills/`

Typical output:

- `AGENTS.md`
- Codex tool mapping references
- `.codex/INSTALL.md`
- documented install path via `~/.agents/skills`

#### Option B: Native Codex plugin packaging

Choose this when:

- the repo should be installable as a Codex plugin
- it bundles more than plain skill content
- the user wants marketplace-style packaging and metadata

Typical output:

- `.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json` with `source.path: "."` for single-plugin repos
- repo-local or home-local `marketplace.json` using `plugins/<name>/` for curated multi-plugin repos
- optional bundled `skills`, `hooks`, `.mcp.json`, `.app.json`
- install guidance for plugin registration and discovery

Assessment should recommend one of these explicitly.

## Installation pattern for users

An uplifted cross-platform plugin should document installation by platform, not only by repo structure.

### Installation goals

The install section should answer:

1. Is this installed as a plugin or as raw skills?
2. What exact files or directories must exist after installation?
3. Is the install repo-local or home-local?
4. Is restart required?
5. How do users verify the install worked?

### Codex install patterns

#### Codex skill-discovery install

Use this when the uplifted repo exposes Codex through native skill discovery.

Typical steps:

1. clone the repo locally
2. symlink or copy the `skills/` directory into `~/.agents/skills/<name>`
3. restart Codex
4. verify the skills are discoverable

Typical verification:

- the symlink or copied directory exists
- Codex lists or uses the skills in a new session

This is the right pattern for an uplifted skills library even if the repo is not packaged as a native Codex plugin.

#### Codex native plugin install

Use this when the uplifted repo ships `.codex-plugin/plugin.json`.

Two common shapes:

- **single-plugin upstream repo**
  - plugin at `<repo>/`
  - marketplace at `<repo>/.agents/plugins/marketplace.json`
  - marketplace entry points at `.`
- **curated multi-plugin repo**
  - plugin at `<repo>/plugins/<plugin-name>`
  - marketplace at `<repo>/.agents/plugins/marketplace.json`
- **home-local marketplace**
  - plugin at `~/plugins/<plugin-name>`
  - marketplace at `~/.agents/plugins/marketplace.json`

Users need:

1. the plugin directory in the expected location
2. a valid `.codex-plugin/plugin.json`
3. a marketplace entry pointing at `.` for single-plugin repos, or `./plugins/<plugin-name>` for curated multi-plugin repos
4. `codex marketplace add <owner/repo>` or `codex marketplace add <local-path>`
5. plugin enablement in `/plugins` or an equivalent `[plugins."<plugin>@<marketplace>"]` entry in `~/.codex/config.toml`
6. a Codex restart or fresh session if the plugin is not immediately visible

This is the proper Codex plugin installation pattern.

### Claude Code install pattern

An uplifted repo should support one of:

- marketplace install
- local plugin install
- documented whole-repo install

If the repo relies on hooks or shared context, whole-repo installation is strongly preferred over single-skill copying.

### Cursor install pattern

The uplifted repo should provide `.cursor-plugin/plugin.json` and document how Cursor discovers or adds the plugin. Cursor usually needs explicit paths for skills, hooks, agents, and commands.

### Gemini CLI install pattern

The uplifted repo should provide:

- `gemini-extension.json`
- `GEMINI.md`

Install instructions should mention any required clone or extension install command and should verify that the context file is being loaded.

### OpenCode install pattern

The uplifted repo should provide:

- `package.json`
- `.opencode/plugins/<name>.js`

Install instructions should clearly state whether OpenCode consumes the repo directly or expects package metadata plus a plugin entrypoint.

## Recommended documentation set for an uplifted plugin

Every uplifted repo should document both author and user concerns.

Minimum recommended docs:

- `README.md`
  - what the plugin does
  - supported platforms
  - install section by platform
  - verification section
- platform-specific install docs where needed
  - especially `.codex/INSTALL.md` for Codex skill-discovery installs
- portability notes
  - what is fully portable
  - what still depends on platform limitations

## What a future portability skill should do

This repo is intended to automate portability work. A future `assess/uplift/install-docs` skill should follow this sequence.

### 1. Assess

- classify the repo shape
- inventory manifests, skills, hooks, and context files
- identify the best metadata source
- detect platform-specific assumptions
- recommend a portability target

### 2. Uplift

- generate missing manifests
- add or normalize context files
- add tool mapping sidecars
- adapt hooks and commands
- preserve the canonical skill content layout

### 3. Document installation

- generate platform install instructions
- distinguish skill-only installs from plugin installs
- explain Codex skill discovery versus Codex plugin packaging
- include verification steps and restart expectations

### 4. Report residual friction

- list unsupported platform capabilities
- call out partial support explicitly
- avoid claiming parity where the platform model does not allow it

## Practical recommendations

- Treat `skills/` as the canonical behavioral payload unless there is a strong reason not to.
- Model portability as parallel adapters around shared content, not as a forced single manifest standard that does not exist.
- For Codex, decide explicitly whether the repo is shipping a skills library or a native plugin package.
- Distinguish upstream repo layout from curated marketplace packaging.
- Never ship uplift work without install docs.
- Never ship install docs without verification steps.

## Summary

Portable plugin work is not only about generating manifests. It requires four separate judgments:

1. what the repo already is
2. what portable shape it should target
3. how each platform will consume it
4. how users will install and verify it

For Codex, the most important distinction is between:

- native skill discovery
- native plugin packaging with `.codex-plugin/plugin.json`
- separately curated marketplace packaging

Any assessment or uplift skill built in this repo should preserve that distinction.
