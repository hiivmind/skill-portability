# Install Doc Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate install docs into a single root INSTALL.md with whole-repo note, all 6 platforms, and cross-platform symlink guidance. Update templates and uplift skill Phase 6.

**Architecture:** Create the root INSTALL.md for this repo (dogfooding), create reusable templates for the uplift skill to generate the same structure for other plugins, update Phase 6 pseudocode.

**Tech Stack:** Markdown, pseudocode

---

### Task 1: Create adding-platform templates

**Files:**
- Create: `lib/templates/install-docs/adding-platform/claude-code.md`
- Create: `lib/templates/install-docs/adding-platform/cursor.md`
- Create: `lib/templates/install-docs/adding-platform/gemini-cli.md`
- Create: `lib/templates/install-docs/adding-platform/opencode.md`
- Create: `lib/templates/install-docs/adding-platform/copilot-cli.md`
- Create: `lib/templates/install-docs/adding-platform/codex.md`

- [ ] **Step 1: Create the adding-platform directory**

```bash
mkdir -p lib/templates/install-docs/adding-platform
```

- [ ] **Step 2: Write claude-code.md template**

Write to `lib/templates/install-docs/adding-platform/claude-code.md`:

```markdown
### Claude Code

Point Claude Code at your existing checkout:

```bash
claude --plugin-dir /path/to/existing/{{name}}
```

Or add to `.claude/settings.json` for persistent access:

```json
{
  "extraKnownMarketplaces": ["/path/to/existing/{{name}}"]
}
```
```

- [ ] **Step 3: Write cursor.md template**

Write to `lib/templates/install-docs/adding-platform/cursor.md`:

```markdown
### Cursor

Symlink your existing checkout into Cursor's plugin directory:

```bash
ln -s /path/to/existing/{{name}} ~/.cursor/plugins/local/{{name}}
```

Restart Cursor (Developer: Reload Window).
```

- [ ] **Step 4: Write gemini-cli.md template**

Write to `lib/templates/install-docs/adding-platform/gemini-cli.md`:

```markdown
### Gemini CLI

Point Gemini at your existing checkout:

```bash
gemini extensions install /path/to/existing/{{name}}
```
```

- [ ] **Step 5: Write opencode.md template**

Write to `lib/templates/install-docs/adding-platform/opencode.md`:

```markdown
### OpenCode

Symlink the plugin entrypoint from your existing checkout (do not copy — it resolves paths relative to the repo root):

```bash
ln -s /path/to/existing/{{name}}/.opencode/plugins/{{name}}.js .opencode/plugins/{{name}}.js
```

Or add the checkout path to your `opencode.json`:

```json
{
  "plugin": ["/path/to/existing/{{name}}"]
}
```

Requires [Bun](https://bun.sh).
```

- [ ] **Step 6: Write copilot-cli.md template**

Write to `lib/templates/install-docs/adding-platform/copilot-cli.md`:

```markdown
### Copilot CLI

Work from the cloned directory — skills are auto-discovered from `skills/`. Or symlink into your project:

```bash
ln -s /path/to/existing/{{name}}/skills skills/{{name}}
```
```

- [ ] **Step 7: Write codex.md template**

Write to `lib/templates/install-docs/adding-platform/codex.md`:

```markdown
### Codex

Symlink the skills directory from your existing checkout:

```bash
ln -s /path/to/existing/{{name}}/skills ~/.agents/skills/{{name}}
```

Restart Codex.
```

- [ ] **Step 8: Commit**

```bash
git add lib/templates/install-docs/adding-platform/
git commit -m "feat: add cross-platform adding-platform install doc templates"
```

---

### Task 2: Create whole-repo-note template

**Files:**
- Create: `lib/templates/install-docs/whole-repo-note.md`

- [ ] **Step 1: Write the template**

Write to `lib/templates/install-docs/whole-repo-note.md`:

```markdown
## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-friction.md](docs/ecosystem-friction.md) for background on why this is
necessary across today's agent platforms.
```

- [ ] **Step 2: Commit**

```bash
git add lib/templates/install-docs/whole-repo-note.md
git commit -m "feat: add whole-repo-note install doc template"
```

---

### Task 3: Create root INSTALL.md for this repo

**Files:**
- Create: `INSTALL.md` (root)

- [ ] **Step 1: Write the consolidated install doc**

Write to `INSTALL.md` (repo root). This combines:
- The whole-repo note (this repo has shared assets, so it applies)
- All 6 platform fresh-install sections (from current `docs/INSTALL.md` + `.github/INSTALL.md` for Copilot)
- All 6 adding-platform sections

```markdown
# Installation

## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-friction.md](docs/ecosystem-friction.md) for background on why this is
necessary across today's agent platforms.

## Fresh Install

### Claude Code

#### Marketplace install

```bash
claude plugin install skill-portability@skill-portability-dev
```

#### Local development

```bash
claude --plugin-dir ./path-to-skill-portability
```

#### Project install

Add to `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": ["./path-to-marketplace"]
}
```

#### Verify

```bash
claude plugin list
```

Look for `skill-portability` in the output.

### Cursor

#### Marketplace install

Search for **Skill Portability** in the Cursor marketplace panel or visit `cursor.com/marketplace`.

#### Local development

Copy the plugin directory to `~/.cursor/plugins/local/skill-portability/` and restart Cursor (Developer: Reload Window).

#### Verify

Open Cursor and check that skills from Skill Portability appear when typing `/` in chat.

### Gemini CLI

#### Install from GitHub

```bash
gemini extensions install https://github.com/nathanielramm/skill-portability
```

#### Install from local path

```bash
gemini extensions install /path/to/skill-portability
```

#### Verify

```bash
gemini extensions list
```

Look for `skill-portability` in the output. Restart Gemini CLI if it was running during install.

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

### Copilot CLI

#### Skill install

Skills are auto-discovered from the `skills/` directory. Clone the repo and skills will be available:

```bash
git clone https://github.com/nathanielramm/skill-portability
```

Alternatively, install individual skills:

```bash
gh skill install https://github.com/nathanielramm/skill-portability
```

#### Context

Copilot reads `.github/copilot-instructions.md` for repo-wide context. It also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root.

#### Verify

Start Copilot CLI in the repo directory and check that skills appear:

```bash
copilot
```

Type `/` to see available skills.

### Codex

#### Skill-discovery install

Clone the repo and expose the skills directory:

```bash
git clone https://github.com/nathanielramm/skill-portability
ln -s $(pwd)/skill-portability/skills ~/.agents/skills/skill-portability
```

Restart Codex. Skills will be discoverable through native skill discovery.

#### Context file

Codex uses `AGENTS.md` as its primary context file.

#### Verify

Start a new Codex session and check that skills are listed.

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
  "extraKnownMarketplaces": ["/path/to/existing/skill-portability"]
}
```

### Cursor

Symlink your existing checkout into Cursor's plugin directory:

```bash
ln -s /path/to/existing/skill-portability ~/.cursor/plugins/local/skill-portability
```

Restart Cursor (Developer: Reload Window).

### Gemini CLI

Point Gemini at your existing checkout:

```bash
gemini extensions install /path/to/existing/skill-portability
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

- [ ] **Step 2: Commit**

```bash
git add INSTALL.md
git commit -m "feat: create consolidated root INSTALL.md with all 6 platforms and symlink guidance"
```

---

### Task 4: Remove old install docs and update references

**Files:**
- Delete: `docs/INSTALL.md`
- Modify: `.github/INSTALL.md`
- Modify: `README.md:34-36`

- [ ] **Step 1: Delete docs/INSTALL.md**

```bash
git rm docs/INSTALL.md
```

- [ ] **Step 2: Replace .github/INSTALL.md with pointer**

Write to `.github/INSTALL.md`:

```markdown
See [INSTALL.md](../INSTALL.md) for installation instructions.
```

- [ ] **Step 3: Update README.md link**

In `README.md`, find:

```markdown
See [docs/INSTALL.md](docs/INSTALL.md) for per-platform install instructions covering Claude Code, Cursor, Gemini CLI, OpenCode, Codex, and Copilot CLI.
```

Replace with:

```markdown
See [INSTALL.md](INSTALL.md) for per-platform install instructions covering Claude Code, Cursor, Gemini CLI, OpenCode, Codex, and Copilot CLI.
```

- [ ] **Step 4: Commit**

```bash
git add docs/INSTALL.md .github/INSTALL.md README.md
git commit -m "refactor: delete docs/INSTALL.md, update .github/INSTALL.md pointer and README link"
```

---

### Task 5: Update uplift skill Phase 6 WRITE_INSTALL_DOCS pseudocode

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md:476-504`

- [ ] **Step 1: Replace the WRITE_INSTALL_DOCS pseudocode block**

In `skills/uplifting-a-plugin/SKILL.md`, find the `### 6.3 Write Install Docs` section. Replace the entire pseudocode block (from `WRITE_INSTALL_DOCS` through the closing backticks) with:

```pseudocode
WRITE_INSTALL_DOCS(computed, sections, platforms_with_artifacts):
  # Whole-repo note: only include when plugin has shared assets that require
  # whole-repo install (hooks, session-start bootstrapping, root context files,
  # or platform manifests). Bare skill repos without these can use npx skills.
  has_shared_assets = (
    computed.existing_hooks
    OR file_exists("skills/using-" + computed.metadata.name + "/SKILL.md")
    OR any(file_exists(p) FOR p IN ["CLAUDE.md", "AGENTS.md", "GEMINI.md"])
    OR computed.uplift_target == "full-portable-plugin"
  )
  IF has_shared_assets:
    whole_repo_note = render(Read("lib/templates/install-docs/whole-repo-note.md"), computed.metadata)
  ELSE:
    whole_repo_note = ""

  fresh_install = ""
  adding_platform = ""
  FOR platform IN platforms_with_artifacts:
    fresh_install += sections[platform] + "\n\n"
    adding_tmpl = read_if_exists("lib/templates/install-docs/adding-platform/" + platform + ".md")
    IF adding_tmpl:
      adding_platform += render(adding_tmpl, computed.metadata) + "\n\n"

  content = "# Installation\n\n"
  IF whole_repo_note:
    content += whole_repo_note + "\n\n"
  content += "## Fresh Install\n\n" + fresh_install
  content += "## Adding Another Platform\n\n"
  content += "Already have the repo cloned for one platform? Add others by pointing them at the same checkout.\n\n"
  content += adding_platform

  Write("INSTALL.md", content)
  computed.created.append({ path: "INSTALL.md", platform: "cross" })

  # Platform-specific pointers (not full docs)
  IF "copilot-cli" IN platforms_with_artifacts:
    Write(".github/INSTALL.md", "See [INSTALL.md](../INSTALL.md) for installation instructions.\n")
    computed.created.append({ path: ".github/INSTALL.md", platform: "copilot-cli" })

  IF "codex" IN platforms_with_artifacts:
    Write(".codex/INSTALL.md", "See [INSTALL.md](../INSTALL.md) for installation instructions.\n")
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })

  # Flag missing Installation section in README
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to INSTALL.md."
      )
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: update Phase 6 WRITE_INSTALL_DOCS for root INSTALL.md with conditional whole-repo note"
```
