# Install & Publish Template Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three overlapping template sets (install, adding-platform, publishing) with two journey-structured sets (install, publish) serving two distinct audiences (plugin user, plugin author).

**Architecture:** Delete 19 old template files across 3 directories. Create 16 new files across 2 directories plus 2 headers. Regenerate INSTALL.md and PUBLISHING.md from the new templates. Update reconciliation matrix.

**Tech Stack:** Markdown templates with `{{mustache}}` variables (`{{name}}`, `{{displayName}}`, `{{repository}}`, `{{marketplaceName}}`)

---

### Task 1: Create install/ templates (Claude Code, Cursor, Gemini CLI)

**Files:**
- Create: `lib/templates/install-docs/install/claude-code.md`
- Create: `lib/templates/install-docs/install/cursor.md`
- Create: `lib/templates/install-docs/install/gemini-cli.md`

- [ ] **Step 1: Create the install/ directory**

Run: `mkdir -p lib/templates/install-docs/install`

- [ ] **Step 2: Write claude-code.md install template**

Write to `lib/templates/install-docs/install/claude-code.md`:

```markdown
## Claude Code

### Install from GitHub

Register the plugin's marketplace, then install:

```bash
/plugin marketplace add {{repository}}
/plugin install {{name}}@{{marketplaceName}}
```

### Install from local clone

```bash
claude --plugin-dir /path/to/{{name}}
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": {
    "{{marketplaceName}}": {
      "source": {
        "source": "github",
        "repo": "{{repository}}"
      }
    }
  }
}
```

### Verify

```bash
claude plugin list
```

Look for `{{name}}` in the output.
```

- [ ] **Step 3: Write cursor.md install template**

Write to `lib/templates/install-docs/install/cursor.md`:

```markdown
## Cursor

### Install from registry

Search for **{{name}}** in the Cursor marketplace panel, visit `cursor.com/marketplace`, or run in Agent chat:

```
/add-plugin {{repository}}
```

### Install from GitHub

```
/add-plugin {{repository}}
```

### Install from local clone

Symlink or copy the plugin directory and restart Cursor (Developer: Reload Window):

```bash
ln -s /path/to/{{name}} ~/.cursor/plugins/local/{{name}}
```

### Verify

Open Cursor and check that skills from {{name}} appear when typing `/` in chat. Rules should appear in Cursor Settings > Rules with the plugin name prefix.
```

- [ ] **Step 4: Write gemini-cli.md install template**

Write to `lib/templates/install-docs/install/gemini-cli.md`:

```markdown
## Gemini CLI

### Install from registry

Browse the gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) and search for **{{name}}**, or install directly:

```bash
gemini extensions install {{repository}}
```

With version pin:

```bash
gemini extensions install {{repository}} --ref <tag>
```

### Install from GitHub

```bash
gemini extensions install {{repository}}
```

### Install from local clone

```bash
gemini extensions link /path/to/{{name}}
```

Changes are reflected immediately without reinstalling.

### Verify

```bash
gemini extensions list
```

Look for `{{name}}` in the output.
```

- [ ] **Step 5: Commit**

```bash
git add lib/templates/install-docs/install/claude-code.md lib/templates/install-docs/install/cursor.md lib/templates/install-docs/install/gemini-cli.md
git commit -m "feat: add journey-structured install templates for Claude Code, Cursor, Gemini CLI"
```

---

### Task 2: Create install/ templates (Codex, Antigravity, OpenClaw)

**Files:**
- Create: `lib/templates/install-docs/install/codex.md`
- Create: `lib/templates/install-docs/install/antigravity.md`
- Create: `lib/templates/install-docs/install/openclaw.md`

- [ ] **Step 1: Write codex.md install template**

Write to `lib/templates/install-docs/install/codex.md`:

```markdown
## Codex

### Install from registry

Open `/plugins` in Codex, search for **{{name}}**, and install it.

### Install from GitHub

Register the repo as a marketplace source:

```bash
codex plugin marketplace add {{repository}}
```

Then open `/plugins` in Codex and install `{{name}}`.

### Install from local clone

```bash
codex plugin marketplace add /path/to/{{name}}
```

Then open `/plugins` in Codex and install `{{name}}`.

### Platform notes

**Context file:** Codex uses `AGENTS.md` as its primary context file.

**Hooks:** If this plugin includes hooks, enable the Codex hooks feature flag:

```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

Without this flag, hooks are silently ignored.

**Multi-agent:** If this plugin's skills use subagent dispatch, confirm multi-agent mode is enabled:

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### Verify

Start a new Codex session and check one of:

- `/plugins` shows `{{name}}` as installed
- `~/.codex/config.toml` contains both the marketplace entry and the enabled plugin entry
- the relevant `$` skill resolves in a fresh session
```

- [ ] **Step 2: Write antigravity.md install template**

Write to `lib/templates/install-docs/install/antigravity.md`:

```markdown
## Antigravity

### Install from GitHub

```bash
git clone {{repository}}
cp -R {{name}}/.agents/skills/{{name}} .agents/skills/
```

Or for global scope:

```bash
cp -R {{name}}/.agents/skills/{{name}} ~/.gemini/antigravity/skills/
```

### Install from local clone

```bash
cp -R /path/to/{{name}}/.agents/skills/{{name}} .agents/skills/
```

Or for global scope:

```bash
cp -R /path/to/{{name}}/.agents/skills/{{name}} ~/.gemini/antigravity/skills/
```

### Verify

Start a new Antigravity session and check that skills from {{displayName}} appear in the skill listing at conversation start.
```

- [ ] **Step 3: Write openclaw.md install template**

Write to `lib/templates/install-docs/install/openclaw.md`:

```markdown
## OpenClaw

### Install from registry

Install from ClawHub:

```bash
openclaw plugins install clawhub:{{name}}
```

Or from npm:

```bash
openclaw plugins install @org/{{name}}
```

### Install from GitHub

Clone the repo and install locally:

```bash
git clone {{repository}}
openclaw plugins install -l ./{{name}}
```

### Install from local clone

Add to `plugins.load.paths` in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "load": {
      "paths": ["/path/to/{{name}}"]
    }
  }
}
```

### Verify

```bash
openclaw plugins list
```

Skills from {{displayName}} should appear in the plugin listing.
```

- [ ] **Step 4: Commit**

```bash
git add lib/templates/install-docs/install/codex.md lib/templates/install-docs/install/antigravity.md lib/templates/install-docs/install/openclaw.md
git commit -m "feat: add journey-structured install templates for Codex, Antigravity, OpenClaw"
```

---

### Task 3: Create publish/ templates (all 6 platforms)

**Files:**
- Create: `lib/templates/install-docs/publish/claude-code.md`
- Create: `lib/templates/install-docs/publish/cursor.md`
- Create: `lib/templates/install-docs/publish/gemini-cli.md`
- Create: `lib/templates/install-docs/publish/codex.md`
- Create: `lib/templates/install-docs/publish/antigravity.md`
- Create: `lib/templates/install-docs/publish/openclaw.md`

- [ ] **Step 1: Create the publish/ directory**

Run: `mkdir -p lib/templates/install-docs/publish`

- [ ] **Step 2: Write claude-code.md publish template**

Write to `lib/templates/install-docs/publish/claude-code.md`:

```markdown
## Claude Code

### Prerequisites

Create `.claude-plugin/marketplace.json` listing the plugins the repo contains. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### Team / org distribution

Add to the team's project `.claude/settings.json` so teammates get the marketplace automatically:

```json
{
  "extraKnownMarketplaces": {
    "{{marketplaceName}}": {
      "source": {
        "source": "github",
        "repo": "{{repository}}"
      }
    }
  }
}
```

Auto-enable plugins via `"enabledPlugins"` in the same settings file.
```

- [ ] **Step 3: Write cursor.md publish template**

Write to `lib/templates/install-docs/publish/cursor.md`:

```markdown
## Cursor

### Prerequisites

- Plugin must be open-source in a Git repository
- `.cursor-plugin/plugin.json` manifest required (minimum: `name` field)

### Submit to registry

1. Go to `cursor.com/marketplace/publish`
2. Submit the plugin for review
3. Every plugin and update is manually reviewed before listing

### Team / org distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings. Admins set plugins as required or optional.
```

- [ ] **Step 4: Write gemini-cli.md publish template**

Write to `lib/templates/install-docs/publish/gemini-cli.md`:

```markdown
## Gemini CLI

### Prerequisites

Include `gemini-extension.json` at the repo root with `name`, `version`, and `description` fields. The repo must be public on GitHub.

### Submit to registry

No manual submission process. To get listed in the gallery:

1. Add the `gemini-cli-extension` topic to the repository's About section on GitHub
2. The gallery crawler indexes tagged repos daily; listing appears within ~1 week

Browse existing extensions at [geminicli.com/extensions](https://geminicli.com/extensions/).
```

- [ ] **Step 5: Write codex.md publish template**

Write to `lib/templates/install-docs/publish/codex.md`:

```markdown
## Codex

### Prerequisites

- `.codex-plugin/plugin.json` manifest
- `.agents/plugins/marketplace.json` listing the plugin with source path, description, version
- For a single-plugin GitHub repo, the marketplace entry should point at the repo root with `source.path: "./"`

Self-serve publishing to the official Plugin Directory is coming soon. In the meantime, plugins are distributed via Git repos with marketplace manifests.
```

- [ ] **Step 6: Write antigravity.md publish template**

Write to `lib/templates/install-docs/publish/antigravity.md`:

```markdown
## Antigravity

### Prerequisites

- `.agents/skills/{{name}}/SKILL.md` with standard frontmatter (`name`, `description`)
- Optional: `AGENTS.md` context file

Antigravity auto-discovers skills from `.agents/skills/` directories — no platform-specific manifest or registry submission required. Share the Git repository URL to distribute.
```

- [ ] **Step 7: Write openclaw.md publish template**

Write to `lib/templates/install-docs/publish/openclaw.md`:

```markdown
## OpenClaw

### Prerequisites

- `openclaw/openclaw.plugin.json` manifest with `id` and `configSchema` (required for native plugins)
- `package.json` with `openclaw.extensions` and `openclaw.compat` (required for npm distribution)
- Optional: `AGENTS.md` context file, `skills/*/SKILL.md` for skill-bearing plugins

### Submit to registry

**ClawHub:**

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/{{name}}
```

**npm (alternative):**

```bash
npm publish --access public
```

Users can install from either registry. Bare names check ClawHub first, then npm.
```

- [ ] **Step 8: Commit**

```bash
git add lib/templates/install-docs/publish/
git commit -m "feat: add author-focused publish templates for all 6 platforms"
```

---

### Task 4: Create header templates and delete old files

**Files:**
- Create: `lib/templates/install-docs/install-header.md`
- Create: `lib/templates/install-docs/publish-header.md`
- Delete: `lib/templates/install-docs/adding-platform/` (6 files)
- Delete: `lib/templates/install-docs/antigravity.md`
- Delete: `lib/templates/install-docs/claude-code.md`
- Delete: `lib/templates/install-docs/codex.md`
- Delete: `lib/templates/install-docs/cursor.md`
- Delete: `lib/templates/install-docs/gemini-cli.md`
- Delete: `lib/templates/install-docs/openclaw.md`
- Delete: `lib/templates/install-docs/publishing.md`
- Delete: `lib/templates/install-docs/publishing/` (6 files)

- [ ] **Step 1: Write install-header.md**

Write to `lib/templates/install-docs/install-header.md`:

```markdown
# Installation

How to install **{{displayName}}** on each supported platform.
```

- [ ] **Step 2: Write publish-header.md**

Write to `lib/templates/install-docs/publish-header.md`:

```markdown
# Publishing & Discoverability

How to get **{{displayName}}** listed and distributed on each platform.

See [INSTALL.md](INSTALL.md) for end-user installation instructions.
```

- [ ] **Step 3: Delete old top-level install templates**

Run:

```bash
git rm lib/templates/install-docs/antigravity.md lib/templates/install-docs/claude-code.md lib/templates/install-docs/codex.md lib/templates/install-docs/cursor.md lib/templates/install-docs/gemini-cli.md lib/templates/install-docs/openclaw.md
```

- [ ] **Step 4: Delete old adding-platform/ directory**

Run:

```bash
git rm -r lib/templates/install-docs/adding-platform/
```

- [ ] **Step 5: Delete old publishing/ directory and header**

Run:

```bash
git rm -r lib/templates/install-docs/publishing/
git rm lib/templates/install-docs/publishing.md
```

- [ ] **Step 6: Commit**

```bash
git add lib/templates/install-docs/install-header.md lib/templates/install-docs/publish-header.md
git commit -m "feat: add header templates, delete old install/adding-platform/publishing templates"
```

---

### Task 5: Regenerate INSTALL.md

**Files:**
- Modify: `INSTALL.md`

Assemble from: `install-header.md` + `whole-repo-note.md` + each `install/*.md` template with variables resolved for this repo.

Variable values for this repo:
- `{{name}}` = `plugin-portability`
- `{{displayName}}` = `Plugin Portability`
- `{{repository}}` = `hiivmind/plugin-portability`
- `{{marketplaceName}}` = `plugin-portability-marketplace`

- [ ] **Step 1: Write the regenerated INSTALL.md**

Write to `INSTALL.md`:

```markdown
# Installation

How to install **Plugin Portability** on each supported platform.

## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.

## Claude Code

### Install from GitHub

Register the plugin's marketplace, then install:

```bash
/plugin marketplace add hiivmind/plugin-portability
/plugin install plugin-portability@plugin-portability-marketplace
```

### Install from local clone

```bash
claude --plugin-dir /path/to/plugin-portability
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": {
    "plugin-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/plugin-portability"
      }
    }
  }
}
```

### Verify

```bash
claude plugin list
```

Look for `plugin-portability` in the output.

## Cursor

### Install from registry

Search for **plugin-portability** in the Cursor marketplace panel, visit `cursor.com/marketplace`, or run in Agent chat:

```
/add-plugin hiivmind/plugin-portability
```

### Install from GitHub

```
/add-plugin hiivmind/plugin-portability
```

### Install from local clone

Symlink or copy the plugin directory and restart Cursor (Developer: Reload Window):

```bash
ln -s /path/to/plugin-portability ~/.cursor/plugins/local/plugin-portability
```

### Verify

Open Cursor and check that skills from plugin-portability appear when typing `/` in chat. Rules should appear in Cursor Settings > Rules with the plugin name prefix.

## Gemini CLI

### Install from registry

Browse the gallery at [geminicli.com/extensions](https://geminicli.com/extensions/) and search for **plugin-portability**, or install directly:

```bash
gemini extensions install hiivmind/plugin-portability
```

With version pin:

```bash
gemini extensions install hiivmind/plugin-portability --ref <tag>
```

### Install from GitHub

```bash
gemini extensions install hiivmind/plugin-portability
```

### Install from local clone

```bash
gemini extensions link /path/to/plugin-portability
```

Changes are reflected immediately without reinstalling.

### Verify

```bash
gemini extensions list
```

Look for `plugin-portability` in the output.

## Codex

### Install from registry

Open `/plugins` in Codex, search for **plugin-portability**, and install it.

### Install from GitHub

Register the repo as a marketplace source:

```bash
codex plugin marketplace add hiivmind/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

### Install from local clone

```bash
codex plugin marketplace add /path/to/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

### Platform notes

**Context file:** Codex uses `AGENTS.md` as its primary context file.

**Hooks:** If this plugin includes hooks, enable the Codex hooks feature flag:

```toml
# ~/.codex/config.toml
[features]
codex_hooks = true
```

Without this flag, hooks are silently ignored.

**Multi-agent:** If this plugin's skills use subagent dispatch, confirm multi-agent mode is enabled:

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### Verify

Start a new Codex session and check one of:

- `/plugins` shows `plugin-portability` as installed
- `~/.codex/config.toml` contains both the marketplace entry and the enabled plugin entry
- the relevant `$` skill resolves in a fresh session

## Antigravity

### Install from GitHub

```bash
git clone hiivmind/plugin-portability
cp -R plugin-portability/.agents/skills/plugin-portability .agents/skills/
```

Or for global scope:

```bash
cp -R plugin-portability/.agents/skills/plugin-portability ~/.gemini/antigravity/skills/
```

### Install from local clone

```bash
cp -R /path/to/plugin-portability/.agents/skills/plugin-portability .agents/skills/
```

Or for global scope:

```bash
cp -R /path/to/plugin-portability/.agents/skills/plugin-portability ~/.gemini/antigravity/skills/
```

### Verify

Start a new Antigravity session and check that skills from Plugin Portability appear in the skill listing at conversation start.

## OpenClaw

### Install from registry

Install from ClawHub:

```bash
openclaw plugins install clawhub:plugin-portability
```

Or from npm:

```bash
openclaw plugins install @org/plugin-portability
```

### Install from GitHub

Clone the repo and install locally:

```bash
git clone hiivmind/plugin-portability
openclaw plugins install -l ./plugin-portability
```

### Install from local clone

Add to `plugins.load.paths` in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "load": {
      "paths": ["/path/to/plugin-portability"]
    }
  }
}
```

### Verify

```bash
openclaw plugins list
```

Skills from Plugin Portability should appear in the plugin listing.
```

- [ ] **Step 2: Verify INSTALL.md has no old content**

Run: `grep -n "antigravity --install-extension\|Adding Another Platform\|Using the skills\|Extension install\|OpenVSX\|open-vsx.org\|skill-installer install" INSTALL.md`

Expected: no output (no matches).

- [ ] **Step 3: Commit**

```bash
git add INSTALL.md
git commit -m "feat: regenerate INSTALL.md from journey-structured templates"
```

---

### Task 6: Regenerate PUBLISHING.md

**Files:**
- Modify: `PUBLISHING.md`

Assemble from: `publish-header.md` + each `publish/*.md` template with variables resolved.

- [ ] **Step 1: Write the regenerated PUBLISHING.md**

Write to `PUBLISHING.md`:

```markdown
# Publishing & Discoverability

How to get **Plugin Portability** listed and distributed on each platform.

See [INSTALL.md](INSTALL.md) for end-user installation instructions.

## Claude Code

### Prerequisites

Create `.claude-plugin/marketplace.json` listing the plugins the repo contains. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### Team / org distribution

Add to the team's project `.claude/settings.json` so teammates get the marketplace automatically:

```json
{
  "extraKnownMarketplaces": {
    "plugin-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/plugin-portability"
      }
    }
  }
}
```

Auto-enable plugins via `"enabledPlugins"` in the same settings file.

## Cursor

### Prerequisites

- Plugin must be open-source in a Git repository
- `.cursor-plugin/plugin.json` manifest required (minimum: `name` field)

### Submit to registry

1. Go to `cursor.com/marketplace/publish`
2. Submit the plugin for review
3. Every plugin and update is manually reviewed before listing

### Team / org distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings. Admins set plugins as required or optional.

## Gemini CLI

### Prerequisites

Include `gemini-extension.json` at the repo root with `name`, `version`, and `description` fields. The repo must be public on GitHub.

### Submit to registry

No manual submission process. To get listed in the gallery:

1. Add the `gemini-cli-extension` topic to the repository's About section on GitHub
2. The gallery crawler indexes tagged repos daily; listing appears within ~1 week

Browse existing extensions at [geminicli.com/extensions](https://geminicli.com/extensions/).

## Codex

### Prerequisites

- `.codex-plugin/plugin.json` manifest
- `.agents/plugins/marketplace.json` listing the plugin with source path, description, version
- For a single-plugin GitHub repo, the marketplace entry should point at the repo root with `source.path: "./"`

Self-serve publishing to the official Plugin Directory is coming soon. In the meantime, plugins are distributed via Git repos with marketplace manifests.

## Antigravity

### Prerequisites

- `.agents/skills/plugin-portability/SKILL.md` with standard frontmatter (`name`, `description`)
- Optional: `AGENTS.md` context file

Antigravity auto-discovers skills from `.agents/skills/` directories — no platform-specific manifest or registry submission required. Share the Git repository URL to distribute.

## OpenClaw

### Prerequisites

- `openclaw/openclaw.plugin.json` manifest with `id` and `configSchema` (required for native plugins)
- `package.json` with `openclaw.extensions` and `openclaw.compat` (required for npm distribution)
- Optional: `AGENTS.md` context file, `skills/*/SKILL.md` for skill-bearing plugins

### Submit to registry

**ClawHub:**

```bash
npm i -g clawhub
clawhub login
clawhub package publish hiivmind/plugin-portability
```

**npm (alternative):**

```bash
npm publish --access public
```

Users can install from either registry. Bare names check ClawHub first, then npm.
```

- [ ] **Step 2: Verify PUBLISHING.md has no install commands**

Run: `grep -n "openclaw plugins install\|gemini extensions install\|codex plugin marketplace add\|/plugin install\|/add-plugin\|cp -R\|git clone" PUBLISHING.md`

Expected: no output (no install commands in the publishing doc).

- [ ] **Step 3: Commit**

```bash
git add PUBLISHING.md
git commit -m "feat: regenerate PUBLISHING.md as author-only, no install commands"
```

---

### Task 7: Update reconciliation matrix

**Files:**
- Modify: `docs/reconciliation-matrix.md` (lines around 201-214)

- [ ] **Step 1: Update the publishing-and-discoverability.md section in the matrix**

Find the `### publishing-and-discoverability.md` section and add a row documenting the template restructure:

Add after the existing table rows:

```markdown
| Template structure | Three overlapping sets (install, adding-platform, publishing) | Two audience-based sets (install/, publish/) with journey structure | Fixed (restructured per 2026-04-28 spec) |
```

- [ ] **Step 2: Verify no stale references to old paths**

Run: `grep -rn "adding-platform\|install-docs/antigravity\|install-docs/claude-code\|install-docs/codex\|install-docs/cursor\|install-docs/gemini-cli\|install-docs/openclaw\|install-docs/publishing\.md" docs/reconciliation-matrix.md`

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "docs: update reconciliation matrix for template restructure"
```

---

### Task 8: Final verification

- [ ] **Step 1: Verify file tree matches spec**

Run: `find lib/templates/install-docs -type f | sort`

Expected output:

```
lib/templates/install-docs/install-header.md
lib/templates/install-docs/install/antigravity.md
lib/templates/install-docs/install/claude-code.md
lib/templates/install-docs/install/codex.md
lib/templates/install-docs/install/cursor.md
lib/templates/install-docs/install/gemini-cli.md
lib/templates/install-docs/install/openclaw.md
lib/templates/install-docs/publish-header.md
lib/templates/install-docs/publish/antigravity.md
lib/templates/install-docs/publish/claude-code.md
lib/templates/install-docs/publish/codex.md
lib/templates/install-docs/publish/cursor.md
lib/templates/install-docs/publish/gemini-cli.md
lib/templates/install-docs/publish/openclaw.md
lib/templates/install-docs/whole-repo-note.md
```

- [ ] **Step 2: Verify no fabricated commands survive**

Run: `grep -rn "antigravity --install-extension\|antigravity publish\|antigravity package\|open-vsx.org\|OpenVSX\|openvsx\|antigravity-awesome-skills\|skill-installer install\|clawhub\.dev" lib/templates/ INSTALL.md PUBLISHING.md`

Expected: no output.

- [ ] **Step 3: Verify glob still matches for Phase 7**

Run: `find lib/templates/install-docs -name "*.md" | wc -l`

Expected: 15 (6 install + 6 publish + 2 headers + 1 whole-repo-note).

- [ ] **Step 4: Verify no install commands in PUBLISHING.md**

Run: `grep -c "```bash\|```json" PUBLISHING.md`

Expected: a small number (only the ClawHub publish commands and the Claude Code settings.json snippet — no install commands).

- [ ] **Step 5: Verify consistent journey structure in INSTALL.md**

Run: `grep "^### " INSTALL.md | sort | uniq -c | sort -rn`

Expected: "Install from GitHub" appears 6 times, "Install from local clone" appears 6 times, "Verify" appears 6 times, "Install from registry" appears 4 times (Cursor, Gemini CLI, Codex, OpenClaw), "Platform notes" appears 1 time (Codex).

- [ ] **Step 6: Commit verification results (if any fixes needed)**

Only if earlier steps revealed issues. Fix and commit with:

```bash
git add -A
git commit -m "fix: address issues found during template restructure verification"
```
