# Publishing Wiring & README Audience Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update this repo's README to state its target audience, and wire PUBLISHING.md generation into the uplift skill so target plugins get author-facing publishing guidance.

**Architecture:** Change A is a single README edit. Change B creates 8 new template files and adds Phase 6.4 + an extended README flag to the uplift skill. Templates follow the same `{{variable}}` pattern as existing install templates.

**Tech Stack:** Markdown, pseudocode (SKILL.md)

---

### Task 1: Update README.md opening to state target audience

**Files:**
- Modify: `README.md:1-5`

- [ ] **Step 1: Replace the opening two paragraphs**

In `README.md`, replace:

```markdown
An agent skill — not a CLI, not a framework — that makes any plugin fully portable across all agent platforms.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place. No install step, no sync daemon, no registry. The agent itself is the portability engine.
```

With:

```markdown
A plugin for agent skill and plugin authors who have built for one platform — often Claude Code — and need to go cross-platform.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place — platform manifests, context files, tool mappings, install docs, and publishing guidance. No CLI to install, no sync daemon, no registry. The agent itself is the portability engine.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README opening to state target audience — plugin authors"
```

---

### Task 2: Create PUBLISHING.md header template

**Files:**
- Create: `lib/templates/install-docs/publishing.md`

- [ ] **Step 1: Write the header template**

Create `lib/templates/install-docs/publishing.md`:

```markdown
# Publishing & Discoverability

How to get **{{displayName}}** discovered and installed on each platform.

See [INSTALL.md](INSTALL.md) for end-user installation instructions.
```

- [ ] **Step 2: Commit**

```bash
git add lib/templates/install-docs/publishing.md
git commit -m "feat: add PUBLISHING.md header template"
```

---

### Task 3: Create per-platform publishing templates

**Files:**
- Create: `lib/templates/install-docs/publishing/claude-code.md`
- Create: `lib/templates/install-docs/publishing/cursor.md`
- Create: `lib/templates/install-docs/publishing/gemini-cli.md`
- Create: `lib/templates/install-docs/publishing/codex.md`
- Create: `lib/templates/install-docs/publishing/copilot-cli.md`
- Create: `lib/templates/install-docs/publishing/opencode.md`

- [ ] **Step 1: Create Claude Code publishing template**

Create `lib/templates/install-docs/publishing/claude-code.md`:

```markdown
## Claude Code

No public marketplace — distribution is via Git repositories.

### Publishing

Create a `.claude-plugin/marketplace.json` in your repo. No submission or review process — any Git repo with a valid marketplace manifest can be consumed.

### How users find and install {{displayName}}

1. Register the marketplace: `/plugin marketplace add {{repository}}`
2. Install: `/plugin install {{name}}@{{marketplaceName}}`

### Team distribution

Teams can auto-register the marketplace by adding to their project `.claude/settings.json`:

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
```

- [ ] **Step 2: Create Cursor publishing template**

Create `lib/templates/install-docs/publishing/cursor.md`:

```markdown
## Cursor

Public marketplace at `cursor.com/marketplace` (curated, manually reviewed).

### Publishing

1. Ensure the plugin is open-source in a Git repository
2. `.cursor-plugin/plugin.json` manifest must be present
3. Submit at `cursor.com/marketplace/publish`
4. Every plugin and update is manually reviewed

### How users find and install {{displayName}}

- Browse the marketplace at `cursor.com/marketplace`
- In Agent chat: `/add-plugin {{repository}}`

### Team distribution

Cursor 2.6+ (Teams/Enterprise): admins import GitHub repos as team marketplaces via Dashboard Settings.
```

- [ ] **Step 3: Create Gemini CLI publishing template**

Create `lib/templates/install-docs/publishing/gemini-cli.md`:

```markdown
## Gemini CLI

Extensions gallery at [geminicli.com/extensions](https://geminicli.com/extensions/).

### Publishing

Publish as a GitHub repository with a `gemini-extension.json` manifest (requires `name`, `version`, `description`). Extensions are not vetted by Google.

### How users find and install {{displayName}}

```bash
gemini extensions install {{repository}}
```

Users can browse the gallery or install directly from the GitHub URL.
```

- [ ] **Step 4: Create Codex publishing template**

Create `lib/templates/install-docs/publishing/codex.md`:

```markdown
## Codex

Two publishing paths — choose based on what you're distributing.

### Skill discovery (lightweight)

For repos that are mostly instructions with no plugin UI metadata:

- Submit a PR to `github.com/openai/skills` for inclusion in the curated catalog
- Or publish as a standalone GitHub repo — users install via `$skill-installer install {{repository}}`

### Plugin packaging (full)

For first-class plugin packages with marketplace metadata:

- Create `.codex-plugin/plugin.json` and a `marketplace.json` listing the plugin
- Users register via `codex plugin marketplace add {{repository}}`
- Public self-serve plugin publishing is coming soon per OpenAI docs

### How users find and install {{displayName}}

**Skills path:**
```bash
$skill-installer install {{repository}}
```

**Plugin path:**
```bash
codex plugin marketplace add {{repository}}
```
```

- [ ] **Step 5: Create Copilot CLI publishing template**

Create `lib/templates/install-docs/publishing/copilot-cli.md`:

```markdown
## Copilot CLI

Skills published via GitHub CLI (v2.90.0+).

### Publishing

```bash
gh skill publish [--fix]
```

Validates against the Agent Skills spec. No formal review — skills are published to the GitHub repository.

### How users find and install {{displayName}}

```bash
gh skill search {{name}}
gh skill preview {{repository}} {{name}}
gh skill install {{repository}}
```

### Third-party registries

- [skills.sh](https://skills.sh) — community directory with 300k+ monthly views
- [github/awesome-copilot](https://github.com/github/awesome-copilot) — GitHub's curated collection

### Security note

Always recommend users run `gh skill preview` before installing. GitHub does not vet third-party skills.
```

- [ ] **Step 6: Create OpenCode publishing template**

Create `lib/templates/install-docs/publishing/opencode.md`:

```markdown
## OpenCode

No marketplace. Distribution via npm or filesystem.

### Publishing

Publish the plugin as an npm package. No submission or review process.

### How users find and install {{displayName}}

**npm:**
Add to `opencode.json`:
```json
{
  "plugin": ["{{name}}"]
}
```

**Local files:**
Copy `.opencode/plugins/{{name}}.js` to `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global).

Requires [Bun](https://bun.sh) for plugin loading.
```

- [ ] **Step 7: Commit all 6 templates**

```bash
git add lib/templates/install-docs/publishing/
git commit -m "feat: add per-platform publishing templates for PUBLISHING.md generation"
```

---

### Task 4: Wire Phase 6.4 and README flag into uplift skill

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md:476-529`

- [ ] **Step 1: Add Phase 6.4 after Phase 6.3**

In `skills/uplifting-a-plugin/SKILL.md`, after the closing ` ``` ` of Phase 6.3's WRITE_INSTALL_DOCS pseudocode block (line 529), and before the `---` separator, insert:

```markdown

### 6.4 Write Publishing Docs

```pseudocode
WRITE_PUBLISHING_DOCS(computed, platforms_with_artifacts):
  header = render(Read("lib/templates/install-docs/publishing.md"), computed.metadata)
  sections = ""
  FOR platform IN platforms_with_artifacts:
    template = read_if_exists("lib/templates/install-docs/publishing/" + platform + ".md")
    IF template:
      sections += render(template, computed.metadata) + "\n\n"

  IF sections:
    content = header + "\n\n" + sections
    Write("PUBLISHING.md", content)
    computed.created.append({ path: "PUBLISHING.md", platform: "cross" })
```
```

- [ ] **Step 2: Extend the README flag in Phase 6.3**

In `skills/uplifting-a-plugin/SKILL.md`, find the README flag block (lines 522-528):

```pseudocode
  # Flag missing Installation section in README
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to INSTALL.md."
      )
```

Replace with:

```pseudocode
  # Flag missing Installation and Publishing sections in README
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to INSTALL.md."
      )
    IF "PUBLISHING.md" NOT IN readme:
      computed.flagged.append(
        "README.md — no link to PUBLISHING.md. Add a link so plugin authors can find publishing guidance."
      )
```

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: wire PUBLISHING.md generation into uplift Phase 6.4 with README flag"
```

---

### Task 5: Verify and final commit

- [ ] **Step 1: Verify template directory structure**

Run: `find lib/templates/install-docs/publishing -type f | sort`

Expected:
```
lib/templates/install-docs/publishing/claude-code.md
lib/templates/install-docs/publishing/codex.md
lib/templates/install-docs/publishing/copilot-cli.md
lib/templates/install-docs/publishing/cursor.md
lib/templates/install-docs/publishing/gemini-cli.md
lib/templates/install-docs/publishing/opencode.md
```

- [ ] **Step 2: Verify Phase 6.4 exists in skill**

Run: `grep -n "6.4\|WRITE_PUBLISHING_DOCS\|PUBLISHING.md" skills/uplifting-a-plugin/SKILL.md`

Expected: matches for Phase 6.4 header, function name, and PUBLISHING.md references.

- [ ] **Step 3: Verify README opening mentions authors**

Run: `head -3 README.md`

Expected: first line is `# Skill Portability`, second line is empty, third starts with `A plugin for agent skill and plugin authors`.
