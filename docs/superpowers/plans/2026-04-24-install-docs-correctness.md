# Install Docs Correctness & Platform Invocation Examples — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix incorrect install commands, wrong GitHub URLs, and generic usage instructions across INSTALL.md, README.md, and `.cursor-plugin/plugin.json`.

**Architecture:** Three files edited with exact string replacements. No code, no tests — pure documentation fixes. All changes in one atomic commit to avoid the inconsistency Codex flagged.

**Tech Stack:** Markdown, JSON

---

### Task 1: Fix `.cursor-plugin/plugin.json` GitHub URLs

**Files:**
- Modify: `.cursor-plugin/plugin.json:10-11`

- [ ] **Step 1: Fix homepage and repository URLs**

Replace:
```json
  "homepage": "https://github.com/nathanielramm/skill-portability",
  "repository": "https://github.com/nathanielramm/skill-portability",
```

With:
```json
  "homepage": "https://github.com/hiivmind/skill-portability",
  "repository": "https://github.com/hiivmind/skill-portability",
```

---

### Task 2: Rewrite INSTALL.md

**Files:**
- Modify: `INSTALL.md` (full rewrite of platform sections)

- [ ] **Step 1: Replace INSTALL.md content**

Write the entire file with these corrections applied:

1. Claude Code section: `skill-portability@skill-portability-dev` → `skill-portability@skill-portability-marketplace`. Replace `extraKnownMarketplaces` array format with object format. Add "Using the skills" subsection.
2. Cursor section: Remove false marketplace claim. Replace with `/add-plugin hiivmind/skill-portability`. Add "Using the skills" subsection.
3. Gemini CLI section: Fix URL `nathanielramm` → `hiivmind`. Add "Using the skills" subsection.
4. OpenCode section: Add "Using the skills" subsection.
5. Copilot CLI section: Fix URLs `nathanielramm` → `hiivmind`. Add "Using the skills" subsection.
6. Codex section: Fix URL `nathanielramm` → `hiivmind`. Add "Using the skills" subsection.
7. "Adding Another Platform" section: Fix `extraKnownMarketplaces` format in Claude Code subsection.

Full replacement content:

```markdown
# Installation

## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-landscape.md](docs/ecosystem-landscape.md) for background on why this is
necessary across today's agent platforms.

## Fresh Install

### Claude Code

#### Marketplace install

```bash
claude plugin install skill-portability@skill-portability-marketplace
```

#### Local development

```bash
claude --plugin-dir ./path-to-skill-portability
```

#### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "skill-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/skill-portability"
      }
    }
  }
}
```

#### Verify

```bash
claude plugin list
```

Look for `skill-portability` in the output.

#### Using the skills

In Claude Code, invoke skills by describing what you want in natural language:

```
Assess the portability of /path/to/my-plugin
```

```
Use the uplifting-a-plugin skill on /path/to/my-plugin
```

### Cursor

#### Install from GitHub

In Cursor's Agent chat:

```
/add-plugin hiivmind/skill-portability
```

#### Local development

Symlink or copy the plugin directory to `~/.cursor/plugins/local/skill-portability/` and restart Cursor (Developer: Reload Window).

#### Verify

Open Cursor and check that skills from Skill Portability appear when typing `/` in chat.

#### Using the skills

In Cursor's chat, invoke skills with the `/` prefix:

```
/assessing-plugin-portability
/uplifting-a-plugin
```

### Gemini CLI

#### Install from GitHub

```bash
gemini extensions install https://github.com/hiivmind/skill-portability
```

#### Install from local path

```bash
gemini extensions link /path/to/skill-portability
```

#### Verify

```bash
gemini extensions list
```

Look for `skill-portability` in the output. Restart Gemini CLI if it was running during install.

#### Using the skills

Gemini CLI activates skills automatically when it determines they are relevant. You can also mention a skill by name:

```
Assess the portability of /path/to/my-plugin using assessing-plugin-portability
```

List available skills with `/skills list`.

### OpenCode

#### Local plugin install

Copy `.opencode/plugins/skill-portability.js` to your project's `.opencode/plugins/` directory, or to `~/.config/opencode/plugins/` for global install.

#### npm install (if published)

Add to your `opencode.json`:

```json
{
  "plugin": ["skill-portability"]
}
```

#### Context file

OpenCode uses `AGENTS.md` as its primary context file. If both `AGENTS.md` and `CLAUDE.md` exist, only `AGENTS.md` is loaded.

#### Verify

Restart OpenCode and check that skills are listed when the agent invokes the `skill` tool.

#### Requirements

OpenCode requires [Bun](https://bun.sh) for plugin loading.

#### Using the skills

OpenCode discovers skills automatically. Mention a skill by name and the agent will activate it:

```
Run assessing-plugin-portability on /path/to/my-plugin
```

### Copilot CLI

#### Skill install

Install skills via GitHub CLI:

```bash
gh skill install hiivmind/skill-portability
```

Or clone the repo — skills are auto-discovered from the `skills/` directory:

```bash
git clone https://github.com/hiivmind/skill-portability
```

#### Context

Copilot reads `.github/copilot-instructions.md` for repo-wide context. It also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root.

#### Verify

Start Copilot CLI in the repo directory and check that skills appear:

```bash
copilot
```

Type `/` to see available skills.

#### Using the skills

In Copilot CLI, invoke skills with the `/` prefix:

```
/assessing-plugin-portability
/uplifting-a-plugin
```

### Codex

#### Skill-discovery install

Clone the repo and expose the skills directory:

```bash
git clone https://github.com/hiivmind/skill-portability
ln -s $(pwd)/skill-portability/skills ~/.agents/skills/skill-portability
```

Restart Codex. Skills will be discoverable through native skill discovery.

#### Context file

Codex uses `AGENTS.md` as its primary context file.

#### Verify

Start a new Codex session and check that skills are listed.

#### Using the skills

In Codex, invoke skills with the `$` prefix:

```
$assessing-plugin-portability
$uplifting-a-plugin
```

## Adding Another Platform

Already have the repo cloned for one platform? Add others by pointing them at the same checkout.

### Claude Code

Point Claude Code at your existing checkout:

```bash
claude --plugin-dir /path/to/existing/skill-portability
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": {
    "skill-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/skill-portability"
      }
    }
  }
}
```

### Cursor

Symlink your existing checkout into Cursor's plugin directory:

```bash
ln -s /path/to/existing/skill-portability ~/.cursor/plugins/local/skill-portability
```

Restart Cursor (Developer: Reload Window).

### Gemini CLI

Link Gemini to your existing checkout:

```bash
gemini extensions link /path/to/existing/skill-portability
```

### OpenCode

Symlink the plugin entrypoint from your existing checkout (do not copy — it resolves paths relative to the repo root):

```bash
ln -s /path/to/existing/skill-portability/.opencode/plugins/skill-portability.js .opencode/plugins/skill-portability.js
```

Or add the checkout path to your `opencode.json`:

```json
{
  "plugin": ["/path/to/existing/skill-portability"]
}
```

Requires [Bun](https://bun.sh).

### Copilot CLI

Work from the cloned directory — skills are auto-discovered from `skills/`. Or symlink into your project:

```bash
ln -s /path/to/existing/skill-portability/skills skills/skill-portability
```

### Codex

Symlink the skills directory from your existing checkout:

```bash
ln -s /path/to/existing/skill-portability/skills ~/.agents/skills/skill-portability
```

Restart Codex.
```

- [ ] **Step 2: Verify no `nathanielramm` references remain**

Run: `grep -n "nathanielramm" INSTALL.md`
Expected: no output

- [ ] **Step 3: Verify no `skill-portability-dev` references remain**

Run: `grep -n "skill-portability-dev" INSTALL.md`
Expected: no output

---

### Task 3: Update README.md usage and quick-start sections

**Files:**
- Modify: `README.md:53-71`

- [ ] **Step 1: Fix quick-start marketplace name**

Replace:
```markdown
**Quick start (Claude Code):**

```bash
claude plugin install skill-portability@skill-portability-dev
```
```

With:
```markdown
**Quick start (Claude Code):**

```bash
claude plugin install skill-portability@skill-portability-marketplace
```
```

- [ ] **Step 2: Replace generic usage section with per-platform invocation table**

Replace:
```markdown
## Usage

Audit a plugin's portability gaps:

```
Use the assessing-plugin-portability skill on /path/to/your/plugin
```

Then uplift it:

```
Use the uplifting-a-plugin skill on /path/to/your/plugin
```
```

With:
```markdown
## Usage

| Platform | Assess portability | Uplift a plugin |
|----------|--------------------|-----------------|
| **Claude Code** | `Assess the portability of /path/to/plugin` | `Use the uplifting-a-plugin skill on /path/to/plugin` |
| **Cursor** | `/assessing-plugin-portability` | `/uplifting-a-plugin` |
| **Copilot CLI** | `/assessing-plugin-portability` | `/uplifting-a-plugin` |
| **Codex** | `$assessing-plugin-portability` | `$uplifting-a-plugin` |
| **Gemini CLI** | Mention skill by name — auto-activated | Same |
| **OpenCode** | Mention skill by name — auto-activated | Same |

See [INSTALL.md](INSTALL.md) for full install and usage details per platform.
```

- [ ] **Step 3: Verify no `skill-portability-dev` references remain**

Run: `grep -n "skill-portability-dev" README.md`
Expected: no output

---

### Task 4: Commit all changes atomically

**Files:**
- All modified: `.cursor-plugin/plugin.json`, `INSTALL.md`, `README.md`

- [ ] **Step 1: Stage and commit**

```bash
git add .cursor-plugin/plugin.json INSTALL.md README.md
git commit -m "fix: correct install docs — marketplace name, GitHub URLs, platform invocation examples

- Fix marketplace name: skill-portability-dev → skill-portability-marketplace
- Fix all GitHub URLs: nathanielramm → hiivmind
- Fix extraKnownMarketplaces to use correct object format
- Replace false Cursor marketplace claim with /add-plugin
- Fix Gemini local install to use 'extensions link' (not 'install')
- Add per-platform skill invocation examples (/, $, natural language)
- Replace generic README usage with per-platform invocation table"
```

- [ ] **Step 2: Verify consistency**

Run: `grep -rn "nathanielramm/skill-portability\|skill-portability-dev" README.md INSTALL.md .cursor-plugin/plugin.json .claude-plugin/plugin.json .claude-plugin/marketplace.json`
Expected: no output (all references now use `hiivmind` and `skill-portability-marketplace`)
