# Portable Plugin Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a standalone plugin repo (`portable-plugin-uplift`) containing a skill that takes any Claude-only plugin and emits the full multi-platform manifest set matching the superpowers portability pattern.

**Architecture:** Hybrid template model — canonical manifest templates live in `assets/templates/` seeded from superpowers 5.0.7; the uplift skill reads source plugin metadata from `.claude-plugin/plugin.json`, renders templates with `{{field}}` substitution, ports hooks across platforms, seeds per-skill tool-mapping sidecars, and writes platform context files. A companion audit skill reports gaps without writing. The uplift repo itself follows the pattern it produces (dogfooding demo).

**Tech Stack:** Bash (hook scripts), JSON (manifests), Markdown (skills, context files, templates). Zero runtime dependencies — all rendering done by the skill instructing the AI agent to perform string substitution.

---

## File Map

**New repo root: `~/git/github/portable-plugin-uplift/`**

| Path | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code plugin manifest |
| `.claude-plugin/marketplace.json` | Claude Code marketplace listing |
| `.cursor-plugin/plugin.json` | Cursor plugin manifest |
| `gemini-extension.json` | Gemini CLI extension descriptor |
| `GEMINI.md` | Gemini CLI context file (skill `@` includes) |
| `AGENTS.md` | Generic harness context (Codex, Copilot CLI) |
| `CLAUDE.md` | Claude Code context file |
| `README.md` | Human-readable docs |
| `package.json` | OpenCode plugin registration |
| `.opencode/plugins/portable-plugin-uplift.js` | OpenCode skill registration shim |
| `hooks/hooks.json` | Claude hooks (empty — no hooks needed) |
| `hooks/hooks-cursor.json` | Cursor hooks (empty) |
| `hooks/run-hook.cmd` | Windows cross-platform hook wrapper (verbatim copy from superpowers) |
| `skills/uplifting-a-plugin/SKILL.md` | Primary uplift skill |
| `skills/uplifting-a-plugin/references/copilot-tools.md` | Tool mapping sidecar |
| `skills/uplifting-a-plugin/references/codex-tools.md` | Tool mapping sidecar |
| `skills/uplifting-a-plugin/references/gemini-tools.md` | Tool mapping sidecar |
| `skills/auditing-plugin-portability/SKILL.md` | Read-only gap-report skill |
| `skills/auditing-plugin-portability/references/copilot-tools.md` | Tool mapping sidecar |
| `skills/auditing-plugin-portability/references/codex-tools.md` | Tool mapping sidecar |
| `skills/auditing-plugin-portability/references/gemini-tools.md` | Tool mapping sidecar |
| `assets/templates/claude-plugin/plugin.json.tmpl` | Template for `.claude-plugin/plugin.json` |
| `assets/templates/claude-plugin/marketplace.json.tmpl` | Template for `.claude-plugin/marketplace.json` |
| `assets/templates/cursor-plugin/plugin.json.tmpl` | Template for `.cursor-plugin/plugin.json` |
| `assets/templates/gemini-extension.json.tmpl` | Template for `gemini-extension.json` |
| `assets/templates/GEMINI.md.tmpl` | Template for `GEMINI.md` |
| `assets/templates/AGENTS.md.tmpl` | Template for `AGENTS.md` |
| `assets/templates/CLAUDE.md.tmpl` | Template for `CLAUDE.md` |
| `assets/templates/package.json.tmpl` | Template for `package.json` |
| `assets/templates/opencode-plugin.js.tmpl` | Template for `.opencode/plugins/<name>.js` |
| `assets/templates/hooks/hooks.json.tmpl` | Template for `hooks/hooks.json` |
| `assets/templates/hooks/hooks-cursor.json.tmpl` | Template for `hooks/hooks-cursor.json` |
| `assets/templates/skill-references/copilot-tools.md` | Canonical Copilot tool-name table (seeded from superpowers) |
| `assets/templates/skill-references/codex-tools.md` | Canonical Codex tool-name table |
| `assets/templates/skill-references/gemini-tools.md` | Canonical Gemini tool-name table |
| `assets/UPSTREAM.md` | Superpowers version pin + re-seed instructions |

---

## Template substitution fields

All templates use `{{double-brace}}` syntax. These are resolved by the AI agent performing string substitution during uplift execution (no runtime build step needed).

| Field | Source |
|---|---|
| `{{name}}` | `.claude-plugin/plugin.json` → `name` |
| `{{displayName}}` | `plugin.json` → `name` title-cased, or `name` if absent |
| `{{description}}` | `plugin.json` → `description` |
| `{{version}}` | `plugin.json` → `version` |
| `{{author.name}}` | `plugin.json` → `author.name` |
| `{{author.email}}` | `plugin.json` → `author.email` |
| `{{homepage}}` | `plugin.json` → `homepage` |
| `{{repository}}` | `plugin.json` → `repository` |
| `{{license}}` | `plugin.json` → `license` (default `"MIT"` if absent) |
| `{{keywords}}` | `plugin.json` → `keywords` JSON array, or `[]` if absent |
| `{{marketplaceName}}` | Derived: `{{name}}-dev` |
| `{{opencodeMain}}` | Derived: `.opencode/plugins/{{name}}.js` |
| `{{skillIncludes}}` | Derived: `@` include lines for each `skills/*/SKILL.md` |
| `{{agentIncludes}}` | Derived: `@` include lines for each `agents/*.md` |
| `{{commandIncludes}}` | Derived: `@` include lines for each `commands/*.md` |

---

## Task 1: Init repo with git

**Files:**
- Create: `~/git/github/portable-plugin-uplift/` (directory)

- [ ] **Step 1: Create repo directory and init git**

```bash
mkdir -p ~/git/github/portable-plugin-uplift
cd ~/git/github/portable-plugin-uplift
git init
```

Expected: `Initialized empty Git repository in .../portable-plugin-uplift/.git/`

- [ ] **Step 2: Create .gitignore**

Create `~/git/github/portable-plugin-uplift/.gitignore`:
```
.DS_Store
node_modules/
*.swp
```

- [ ] **Step 3: Commit**

```bash
cd ~/git/github/portable-plugin-uplift
git add .gitignore
git commit -m "chore: init repo"
```

---

## Task 2: Seed assets/templates from superpowers 5.0.7

**Files:**
- Create: `assets/templates/claude-plugin/plugin.json.tmpl`
- Create: `assets/templates/claude-plugin/marketplace.json.tmpl`
- Create: `assets/templates/cursor-plugin/plugin.json.tmpl`
- Create: `assets/templates/gemini-extension.json.tmpl`
- Create: `assets/templates/GEMINI.md.tmpl`
- Create: `assets/templates/AGENTS.md.tmpl`
- Create: `assets/templates/CLAUDE.md.tmpl`
- Create: `assets/templates/package.json.tmpl`
- Create: `assets/templates/opencode-plugin.js.tmpl`
- Create: `assets/templates/hooks/hooks.json.tmpl`
- Create: `assets/templates/hooks/hooks-cursor.json.tmpl`
- Create: `assets/templates/skill-references/copilot-tools.md`
- Create: `assets/templates/skill-references/codex-tools.md`
- Create: `assets/templates/skill-references/gemini-tools.md`
- Create: `assets/UPSTREAM.md`

The superpowers source cache is at: `/home/nathanielramm/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/`

- [ ] **Step 1: Create directory structure**

```bash
cd ~/git/github/portable-plugin-uplift
mkdir -p assets/templates/claude-plugin
mkdir -p assets/templates/cursor-plugin
mkdir -p assets/templates/hooks
mkdir -p assets/templates/skill-references
```

- [ ] **Step 2: Write `assets/templates/claude-plugin/plugin.json.tmpl`**

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "author": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "homepage": "{{homepage}}",
  "repository": "{{repository}}",
  "license": "{{license}}",
  "keywords": {{keywords}}
}
```

- [ ] **Step 3: Write `assets/templates/claude-plugin/marketplace.json.tmpl`**

```json
{
  "name": "{{marketplaceName}}",
  "description": "Development marketplace for {{name}}",
  "owner": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "plugins": [
    {
      "name": "{{name}}",
      "description": "{{description}}",
      "version": "{{version}}",
      "source": "./",
      "author": {
        "name": "{{author.name}}",
        "email": "{{author.email}}"
      }
    }
  ]
}
```

- [ ] **Step 4: Write `assets/templates/cursor-plugin/plugin.json.tmpl`**

```json
{
  "name": "{{name}}",
  "displayName": "{{displayName}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "author": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "homepage": "{{homepage}}",
  "repository": "{{repository}}",
  "license": "{{license}}",
  "keywords": {{keywords}},
  "skills": "./skills/",
  "agents": "./agents/",
  "commands": "./commands/",
  "hooks": "./hooks/hooks-cursor.json"
}
```

- [ ] **Step 5: Write `assets/templates/gemini-extension.json.tmpl`**

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "contextFileName": "GEMINI.md"
}
```

- [ ] **Step 6: Write `assets/templates/GEMINI.md.tmpl`**

```markdown
{{skillIncludes}}
{{agentIncludes}}
{{commandIncludes}}
```

Note: `{{skillIncludes}}` expands to one `@./skills/<name>/SKILL.md` + `@./skills/<name>/references/gemini-tools.md` pair per skill in `skills/`. `{{agentIncludes}}` expands to `@./agents/<name>.md` per agent file. `{{commandIncludes}}` expands to `@./commands/<name>.md` per command file. If `agents/` or `commands/` don't exist, those lines are omitted.

- [ ] **Step 7: Write `assets/templates/AGENTS.md.tmpl`**

```markdown
# {{displayName}}

{{description}}

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

{{skillIncludes}}

## Commands

{{commandIncludes}}

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

- `Read` → your platform's file-read tool
- `Write` → your platform's file-write tool
- `Edit` → your platform's file-edit tool
- `Bash` → your platform's shell/command tool
- `Grep` → your platform's content-search tool
- `Glob` → your platform's file-search tool
- `Skill` tool → your platform's skill-invoke tool (or follow instructions directly)
- `Task` tool → your platform's subagent-dispatch tool (if supported)

See each skill's `references/` directory for platform-specific tool mapping tables.
```

Note: `{{skillIncludes}}` here expands to `- skills/<name>/SKILL.md` bullet list. `{{commandIncludes}}` expands to `- commands/<name>.md` bullet list. If no commands, that section is omitted.

- [ ] **Step 8: Write `assets/templates/CLAUDE.md.tmpl`**

```markdown
# {{displayName}}

{{description}}

This plugin is loaded via Claude Code's plugin system. Skills are invoked via the `Skill` tool.
```

- [ ] **Step 9: Write `assets/templates/package.json.tmpl`**

```json
{
  "name": "{{name}}",
  "version": "{{version}}",
  "type": "module",
  "main": "{{opencodeMain}}"
}
```

- [ ] **Step 10: Write `assets/templates/opencode-plugin.js.tmpl`**

```javascript
// OpenCode plugin registration for {{name}}
// Skills are loaded from ./skills/ by the OpenCode runtime.
export default {
  name: "{{name}}",
  description: "{{description}}",
  skills: "./skills/",
};
```

- [ ] **Step 11: Write `assets/templates/hooks/hooks.json.tmpl`**

```json
{
  "hooks": {}
}
```

Note: This is a minimal empty hooks file. The uplift skill replaces it with a populated version when the source plugin has `hooks/hooks.json` with actual hook entries.

- [ ] **Step 12: Write `assets/templates/hooks/hooks-cursor.json.tmpl`**

```json
{
  "version": 1,
  "hooks": {}
}
```

Note: Same as above — empty placeholder. The uplift skill derives the populated version from the source's `hooks/hooks.json`.

- [ ] **Step 13: Copy tool-mapping sidecars from superpowers cache**

```bash
SP=/home/nathanielramm/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7
DEST=~/git/github/portable-plugin-uplift/assets/templates/skill-references

cp "$SP/skills/using-superpowers/references/copilot-tools.md" "$DEST/copilot-tools.md"
cp "$SP/skills/using-superpowers/references/codex-tools.md" "$DEST/codex-tools.md"
cp "$SP/skills/using-superpowers/references/gemini-tools.md" "$DEST/gemini-tools.md"
```

Verify: `ls ~/git/github/portable-plugin-uplift/assets/templates/skill-references/` shows three files.

- [ ] **Step 14: Write `assets/UPSTREAM.md`**

```markdown
# Template Upstream Source

Templates in `assets/templates/` are seeded from [superpowers](https://github.com/obra/superpowers) v5.0.7.

## Re-seeding after a superpowers release

1. Install the new superpowers version: update your Claude Code plugin config to the new version.
2. Locate the new cache path: `~/.claude/plugins/cache/claude-plugins-official/superpowers/<version>/`
3. Update tool-mapping sidecars:
   ```bash
   SP=~/.claude/plugins/cache/claude-plugins-official/superpowers/<new-version>
   cp "$SP/skills/using-superpowers/references/copilot-tools.md" assets/templates/skill-references/
   cp "$SP/skills/using-superpowers/references/codex-tools.md" assets/templates/skill-references/
   cp "$SP/skills/using-superpowers/references/gemini-tools.md" assets/templates/skill-references/
   ```
4. Compare other template files against the new superpowers manifests (`.claude-plugin/`, `.cursor-plugin/`, `gemini-extension.json`, `GEMINI.md`, hooks files) and update templates accordingly.
5. Update this file with the new version pin.

## Why templates stay in this repo

Templates are checked in so the uplift skill works offline and produces deterministic output regardless of what version of superpowers is currently installed.
```

- [ ] **Step 15: Commit**

```bash
cd ~/git/github/portable-plugin-uplift
git add assets/
git commit -m "feat: seed manifest templates from superpowers 5.0.7"
```

---

## Task 3: Write the `uplifting-a-plugin` skill

**Files:**
- Create: `skills/uplifting-a-plugin/SKILL.md`

The skill instructs the AI agent how to perform uplift. No runtime code — the agent performs all file operations using its native tools.

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/git/github/portable-plugin-uplift/skills/uplifting-a-plugin
```

- [ ] **Step 2: Write `skills/uplifting-a-plugin/SKILL.md`**

```markdown
---
name: uplifting-a-plugin
description: Use when you need to add multi-platform portability to a Claude-only plugin. Takes a plugin repo with only .claude-plugin/ manifests and emits the full superpowers portability pattern: Cursor, Gemini CLI, OpenCode, and AGENTS.md support, plus per-skill tool-mapping sidecars.
---

# Uplifting a Plugin to Multi-Platform Portability

This skill transforms a Claude-only plugin into a fully portable plugin following the superpowers portability pattern.

## What this skill produces

For a source plugin at `<plugin-path>` with only Claude manifests, this skill adds:

| Platform | Files created |
|---|---|
| Cursor | `.cursor-plugin/plugin.json` |
| Gemini CLI | `gemini-extension.json`, `GEMINI.md` |
| OpenCode | `package.json`, `.opencode/plugins/<name>.js` |
| Generic (Codex/Copilot CLI) | `AGENTS.md` |
| All skills | `skills/<name>/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md` |
| Hook portability | `hooks/hooks-cursor.json`, `hooks/run-hook.cmd` (if hooks exist) |

## Prerequisites

The source plugin MUST have `.claude-plugin/plugin.json`. If it doesn't exist, stop and report an error.

## Checklist

- [ ] **Step 1: Read source metadata**

Read `<plugin-path>/.claude-plugin/plugin.json`. Extract these fields into variables for use in later steps:
- `name`
- `description`
- `version`
- `author.name` (use `"Unknown"` if absent)
- `author.email` (use `""` if absent)
- `homepage` (use `""` if absent)
- `repository` (use `""` if absent)
- `license` (default `"MIT"` if absent)
- `keywords` (default `[]` if absent)

Derive:
- `displayName` = title-case `name` (replace `-` and `_` with spaces, capitalize each word)
- `marketplaceName` = `<name>-dev`
- `opencodeMain` = `.opencode/plugins/<name>.js`

- [ ] **Step 2: Inventory source assets**

Detect which asset types exist in the source:
- Does `skills/` directory exist? List all skill subdirectory names.
- Does `commands/` directory exist? List all `.md` filenames.
- Does `agents/` directory exist? List all `.md` filenames.
- Does `hooks/hooks.json` exist? Read and parse it.

- [ ] ] **Step 3: Check for conflicts (do not overwrite without --force)**

Before writing any file, check whether each target file already exists. For any conflict found, report it in the final summary and skip that file. Proceed with all non-conflicting files.

Files to check:
```
.cursor-plugin/plugin.json
gemini-extension.json
GEMINI.md
AGENTS.md
package.json
.opencode/plugins/<name>.js
hooks/hooks-cursor.json
hooks/run-hook.cmd
```

Also check each `skills/<name>/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`.

- [ ] **Step 4: Render and write `.cursor-plugin/plugin.json`**

Read `assets/templates/cursor-plugin/plugin.json.tmpl` from this plugin's install path. Substitute all `{{fields}}` with values from Step 1. Write to `<plugin-path>/.cursor-plugin/plugin.json`.

The `"skills"`, `"agents"`, `"commands"` fields should point at directories that exist in the source. Omit `"agents"` if `agents/` doesn't exist; omit `"commands"` if `commands/` doesn't exist.

- [ ] **Step 5: Render and write `gemini-extension.json`**

Read `assets/templates/gemini-extension.json.tmpl`. Substitute `{{fields}}`. Write to `<plugin-path>/gemini-extension.json`.

- [ ] **Step 6: Render and write `GEMINI.md`**

Build `{{skillIncludes}}` block:
For each skill name detected in Step 2:
```
@./skills/<skillname>/SKILL.md
@./skills/<skillname>/references/gemini-tools.md
```

Build `{{agentIncludes}}` block (omit if no agents):
For each agent file detected:
```
@./agents/<agentfile>.md
```

Build `{{commandIncludes}}` block (omit if no commands):
For each command file:
```
@./commands/<commandfile>.md
```

Write to `<plugin-path>/GEMINI.md`.

- [ ] **Step 7: Render and write `AGENTS.md`**

Build skill bullet list for `{{skillIncludes}}`:
```
- skills/<skillname>/SKILL.md
```
(one line per skill)

Build command bullet list for `{{commandIncludes}}`:
```
- commands/<commandfile>.md
```
(one line per command; omit entire "Commands" section if no commands)

Read `assets/templates/AGENTS.md.tmpl`. Substitute all fields. Write to `<plugin-path>/AGENTS.md`.

- [ ] **Step 8: Render and write `package.json`**

Read `assets/templates/package.json.tmpl`. Substitute `{{fields}}`. Write to `<plugin-path>/package.json`.

- [ ] **Step 9: Render and write OpenCode plugin shim**

Create directory `<plugin-path>/.opencode/plugins/` if it doesn't exist. Read `assets/templates/opencode-plugin.js.tmpl`. Substitute `{{fields}}`. Write to `<plugin-path>/.opencode/plugins/<name>.js`.

- [ ] **Step 10: Port hooks (if source has hooks)**

If `<plugin-path>/hooks/hooks.json` exists and contains non-empty hook entries:

Read `hooks/hooks.json`. For each Claude hook event, derive the Cursor equivalent using this event-name mapping:

| Claude hook event | Cursor hook event |
|---|---|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userMessage` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |

Build `hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {
    "<cursorEventName>": [
      { "command": "<same command as hooks.json, with path adjusted>" }
    ]
  }
}
```

Write to `<plugin-path>/hooks/hooks-cursor.json`.

**Flag in report:** Any hook command containing `$CLAUDE_PLUGIN_ROOT` needs manual review — Cursor uses a different env var. Note the specific hook commands that reference it.

If source has no `hooks/hooks.json`, write empty `hooks/hooks-cursor.json` from the template.

- [ ] **Step 11: Copy `hooks/run-hook.cmd` if missing**

If `<plugin-path>/hooks/run-hook.cmd` does not already exist, copy it from `assets/templates/hooks/run-hook.cmd` (which is a verbatim copy of the superpowers Windows wrapper).

Wait — `run-hook.cmd` is not in `assets/templates/hooks/`. It is the verbatim superpowers file. For v1, instruct the user to copy it from the superpowers cache manually, and flag this in the report:

> `hooks/run-hook.cmd` not written — copy from superpowers cache: `~/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/hooks/run-hook.cmd`

**Note for repo maintainer:** In a future version, add `run-hook.cmd` to `assets/templates/hooks/` so the skill can write it directly.

- [ ] **Step 12: Seed per-skill tool-mapping sidecars**

For each skill name detected in Step 2, check whether `skills/<skillname>/references/` exists and whether each of the three sidecar files is present.

For each missing sidecar, copy from `assets/templates/skill-references/`:

Read the corresponding file from this plugin's `assets/templates/skill-references/<platform>-tools.md` and write it to `<plugin-path>/skills/<skillname>/references/<platform>-tools.md`.

If `references/` directory doesn't exist for a skill, create it first.

- [ ] **Step 13: Emit final report**

Print a summary with three sections:

**Created:**
List every file written in this run (full paths relative to `<plugin-path>`).

**Skipped (already exists):**
List every file that was skipped due to a conflict. User must review and either delete the existing file or manually merge.

**Needs manual review:**
- Any hook command containing `$CLAUDE_PLUGIN_ROOT` (list the specific commands)
- `hooks/run-hook.cmd` if it was not written (with copy instruction)
- Any `GEMINI.md` or `AGENTS.md` skill includes where the referenced SKILL.md does not have a `name` or `description` frontmatter field (these are needed for platform discovery)

## Running the skill

Invoke with: `"Use the uplifting-a-plugin skill on <path/to/plugin>"`

The skill is idempotent: running it twice on the same repo produces no diff on the second run (all files already exist → all skipped).

## Locating this plugin's assets

This skill references `assets/templates/` at the plugin install root. To find the install root from within a Claude Code session:

The plugin is installed under `~/.claude/plugins/cache/`. Use `Glob` with pattern `~/.claude/plugins/cache/**/portable-plugin-uplift/*/assets/templates/` to locate it.
```

- [ ] **Step 3: Commit**

```bash
cd ~/git/github/portable-plugin-uplift
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: add uplifting-a-plugin skill"
```

---

## Task 4: Write the `auditing-plugin-portability` skill

**Files:**
- Create: `skills/auditing-plugin-portability/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/git/github/portable-plugin-uplift/skills/auditing-plugin-portability
```

- [ ] **Step 2: Write `skills/auditing-plugin-portability/SKILL.md`**

```markdown
---
name: auditing-plugin-portability
description: Use when you want to check a Claude plugin for multi-platform portability gaps without making any changes. Produces a report listing missing manifest files, missing skill sidecars, and hook portability issues.
---

# Auditing Plugin Portability

This skill inspects a Claude plugin repo and reports what would need to be added to reach full superpowers-pattern portability. It makes no changes.

## Checklist

- [ ] **Step 1: Verify source is a Claude plugin**

Check that `<plugin-path>/.claude-plugin/plugin.json` exists. If not, report "Not a Claude plugin — .claude-plugin/plugin.json missing" and stop.

- [ ] **Step 2: Read metadata**

Read `.claude-plugin/plugin.json`. Note: `name`, `version`, `description`.

- [ ] **Step 3: Check platform manifest files**

For each of these files, report PRESENT or MISSING:

```
.cursor-plugin/plugin.json       → Cursor support
gemini-extension.json            → Gemini CLI support
GEMINI.md                        → Gemini CLI context
AGENTS.md                        → Generic harness support (Codex, Copilot CLI)
package.json                     → OpenCode support
.opencode/plugins/<name>.js      → OpenCode skill shim
hooks/hooks-cursor.json          → Cursor hook support
hooks/run-hook.cmd               → Windows hook wrapper
```

- [ ] **Step 4: Check per-skill sidecars**

For each directory in `skills/`:
- Report PRESENT or MISSING for each of:
  - `skills/<name>/references/copilot-tools.md`
  - `skills/<name>/references/codex-tools.md`
  - `skills/<name>/references/gemini-tools.md`

- [ ] **Step 5: Check GEMINI.md completeness (if present)**

If `GEMINI.md` exists, verify it has an `@` include line for each skill's SKILL.md and each skill's `gemini-tools.md`. Report any skills missing from the include list.

- [ ] **Step 6: Check AGENTS.md completeness (if present)**

If `AGENTS.md` exists, verify it references each skill by path. Report any skills missing from the reference list.

- [ ] **Step 7: Check hooks**

If `hooks/hooks.json` exists and is non-empty:
- Verify `hooks/hooks-cursor.json` exists
- Verify `hooks/run-hook.cmd` exists
- Report any missing files

- [ ] **Step 8: Print report**

```
# Portability Audit: <name> v<version>

## Platform manifests
PRESENT  .cursor-plugin/plugin.json
MISSING  gemini-extension.json
...

## Skill sidecars
skills/my-skill/
  PRESENT  references/copilot-tools.md
  MISSING  references/codex-tools.md
  MISSING  references/gemini-tools.md
...

## Context file completeness
...

## Hooks
...

## Summary
<N> files present, <M> missing.
Run the uplifting-a-plugin skill to generate all missing files automatically.
```
```

- [ ] **Step 3: Commit**

```bash
cd ~/git/github/portable-plugin-uplift
git add skills/auditing-plugin-portability/SKILL.md
git commit -m "feat: add auditing-plugin-portability skill"
```

---

## Task 5: Seed skill reference sidecars for both skills

**Files:**
- Create: `skills/uplifting-a-plugin/references/copilot-tools.md`
- Create: `skills/uplifting-a-plugin/references/codex-tools.md`
- Create: `skills/uplifting-a-plugin/references/gemini-tools.md`
- Create: `skills/auditing-plugin-portability/references/copilot-tools.md`
- Create: `skills/auditing-plugin-portability/references/codex-tools.md`
- Create: `skills/auditing-plugin-portability/references/gemini-tools.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p ~/git/github/portable-plugin-uplift/skills/uplifting-a-plugin/references
mkdir -p ~/git/github/portable-plugin-uplift/skills/auditing-plugin-portability/references
```

- [ ] **Step 2: Copy sidecars from assets/templates/skill-references/ to both skills**

```bash
SP=~/git/github/portable-plugin-uplift/assets/templates/skill-references

for skill in uplifting-a-plugin auditing-plugin-portability; do
  cp "$SP/copilot-tools.md" "skills/$skill/references/copilot-tools.md"
  cp "$SP/codex-tools.md"   "skills/$skill/references/codex-tools.md"
  cp "$SP/gemini-tools.md"  "skills/$skill/references/gemini-tools.md"
done
```

Run from `~/git/github/portable-plugin-uplift/`.

- [ ] **Step 3: Verify**

```bash
find ~/git/github/portable-plugin-uplift/skills -name "*.md" | sort
```

Expected: 8 files (2 SKILL.md + 6 sidecars).

- [ ] **Step 4: Commit**

```bash
cd ~/git/github/portable-plugin-uplift
git add skills/
git commit -m "feat: seed per-skill tool-mapping sidecars"
```

---

## Task 6: Write the repo's own multi-platform manifests (dogfooding)

The uplift repo follows the pattern it teaches. Write all manifests for `portable-plugin-uplift` itself.

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.cursor-plugin/plugin.json`
- Create: `gemini-extension.json`
- Create: `GEMINI.md`
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `package.json`
- Create: `.opencode/plugins/portable-plugin-uplift.js`
- Create: `hooks/hooks.json`
- Create: `hooks/hooks-cursor.json`
- Create: `hooks/run-hook.cmd`

Metadata for this repo:
- `name`: `portable-plugin-uplift`
- `displayName`: `Portable Plugin Uplift`
- `description`: `Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support`
- `version`: `0.1.0`
- `author.name`: Nathaniel Ramm
- `author.email`: nathaniel.ramm@discretedatascience.com
- `homepage`: `https://github.com/nathanielramm/portable-plugin-uplift` (placeholder — update when repo is created on GitHub)
- `repository`: same
- `license`: `MIT`
- `keywords`: `["skills", "portability", "multi-platform", "plugin-uplift"]`

- [ ] **Step 1: Create directories**

```bash
cd ~/git/github/portable-plugin-uplift
mkdir -p .claude-plugin .cursor-plugin .opencode/plugins hooks
```

- [ ] **Step 2: Write `.claude-plugin/plugin.json`**

```json
{
  "name": "portable-plugin-uplift",
  "description": "Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support",
  "version": "0.1.0",
  "author": {
    "name": "Nathaniel Ramm",
    "email": "nathaniel.ramm@discretedatascience.com"
  },
  "homepage": "https://github.com/nathanielramm/portable-plugin-uplift",
  "repository": "https://github.com/nathanielramm/portable-plugin-uplift",
  "license": "MIT",
  "keywords": ["skills", "portability", "multi-platform", "plugin-uplift"]
}
```

- [ ] **Step 3: Write `.claude-plugin/marketplace.json`**

```json
{
  "name": "portable-plugin-uplift-dev",
  "description": "Development marketplace for portable-plugin-uplift",
  "owner": {
    "name": "Nathaniel Ramm",
    "email": "nathaniel.ramm@discretedatascience.com"
  },
  "plugins": [
    {
      "name": "portable-plugin-uplift",
      "description": "Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support",
      "version": "0.1.0",
      "source": "./",
      "author": {
        "name": "Nathaniel Ramm",
        "email": "nathaniel.ramm@discretedatascience.com"
      }
    }
  ]
}
```

- [ ] **Step 4: Write `.cursor-plugin/plugin.json`**

```json
{
  "name": "portable-plugin-uplift",
  "displayName": "Portable Plugin Uplift",
  "description": "Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support",
  "version": "0.1.0",
  "author": {
    "name": "Nathaniel Ramm",
    "email": "nathaniel.ramm@discretedatascience.com"
  },
  "homepage": "https://github.com/nathanielramm/portable-plugin-uplift",
  "repository": "https://github.com/nathanielramm/portable-plugin-uplift",
  "license": "MIT",
  "keywords": ["skills", "portability", "multi-platform", "plugin-uplift"],
  "skills": "./skills/"
}
```

(No `agents` or `commands` fields — this plugin has neither.)

- [ ] **Step 5: Write `gemini-extension.json`**

```json
{
  "name": "portable-plugin-uplift",
  "description": "Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support",
  "version": "0.1.0",
  "contextFileName": "GEMINI.md"
}
```

- [ ] **Step 6: Write `GEMINI.md`**

```markdown
@./skills/uplifting-a-plugin/SKILL.md
@./skills/uplifting-a-plugin/references/gemini-tools.md
@./skills/auditing-plugin-portability/SKILL.md
@./skills/auditing-plugin-portability/references/gemini-tools.md
```

- [ ] **Step 7: Write `AGENTS.md`**

```markdown
# Portable Plugin Uplift

Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support.

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

- skills/uplifting-a-plugin/SKILL.md
- skills/auditing-plugin-portability/SKILL.md

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

- `Read` → your platform's file-read tool
- `Write` → your platform's file-write tool
- `Edit` → your platform's file-edit tool
- `Bash` → your platform's shell/command tool
- `Grep` → your platform's content-search tool
- `Glob` → your platform's file-search tool
- `Skill` tool → your platform's skill-invoke tool (or follow instructions directly)
- `Task` tool → your platform's subagent-dispatch tool (if supported)

See each skill's `references/` directory for platform-specific tool mapping tables.
```

- [ ] **Step 8: Write `CLAUDE.md`**

```markdown
# Portable Plugin Uplift

Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support.

This plugin is loaded via Claude Code's plugin system. Skills are invoked via the `Skill` tool.
```

- [ ] **Step 9: Write `package.json`**

```json
{
  "name": "portable-plugin-uplift",
  "version": "0.1.0",
  "type": "module",
  "main": ".opencode/plugins/portable-plugin-uplift.js"
}
```

- [ ] **Step 10: Write `.opencode/plugins/portable-plugin-uplift.js`**

```javascript
// OpenCode plugin registration for portable-plugin-uplift
export default {
  name: "portable-plugin-uplift",
  description: "Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support",
  skills: "./skills/",
};
```

- [ ] **Step 11: Write empty hooks files**

`hooks/hooks.json`:
```json
{
  "hooks": {}
}
```

`hooks/hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {}
}
```

- [ ] **Step 12: Copy `hooks/run-hook.cmd` from superpowers cache**

```bash
cp /home/nathanielramm/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/hooks/run-hook.cmd \
   ~/git/github/portable-plugin-uplift/hooks/run-hook.cmd
```

- [ ] **Step 13: Write `README.md`**

```markdown
# Portable Plugin Uplift

A Claude Code plugin that adds multi-platform portability to any Claude-only plugin.

## What it does

Takes a plugin that only has `.claude-plugin/` manifests (Claude Code only) and adds:

- **Cursor** — `.cursor-plugin/plugin.json`
- **Gemini CLI** — `gemini-extension.json` + `GEMINI.md`
- **OpenCode** — `package.json` + `.opencode/plugins/<name>.js`
- **Generic harnesses** (Codex, Copilot CLI) — `AGENTS.md`
- **Per-skill tool mapping** — `references/{copilot,codex,gemini}-tools.md` in each skill
- **Hook portability** — `hooks-cursor.json` derived from `hooks.json`

## Skills

- **`uplifting-a-plugin`** — Write all missing platform manifests for a target plugin
- **`auditing-plugin-portability`** — Report portability gaps without making changes

## Pattern source

This plugin implements the [superpowers](https://github.com/obra/superpowers) portability pattern. Templates are seeded from superpowers v5.0.7 (see `assets/UPSTREAM.md` for re-seeding instructions).

## This repo is itself an example

`portable-plugin-uplift` is structured using the exact pattern it produces. Check the root-level manifests as a reference.

## Usage

```
Use the uplifting-a-plugin skill on /path/to/your/plugin
```

Or audit first without changes:

```
Use the auditing-plugin-portability skill on /path/to/your/plugin
```
```

- [ ] **Step 14: Commit**

```bash
cd ~/git/github/portable-plugin-uplift
git add .
git commit -m "feat: add multi-platform manifests (dogfooding demo)"
```

---

## Task 7: End-to-end verification

Pick one of the user's existing Claude-only plugin repos as a test target. Use a git worktree to avoid touching the main checkout.

- [ ] **Step 1: Identify a test target**

Find a Claude-only plugin repo: look in `~/git/github/` for any directory containing `.claude-plugin/plugin.json` but missing `.cursor-plugin/`. If `hiivmind-*` repos exist, use the first one found.

```bash
find ~/git/github -maxdepth 3 -name "plugin.json" -path "*/.claude-plugin/*" | head -5
```

Note the target path as `<TARGET>`.

- [ ] **Step 2: Create a git worktree for the test**

```bash
cd <TARGET>
git worktree add ../test-uplift-worktree -b test/portability-uplift
```

Run the audit skill on the worktree:
> "Use the auditing-plugin-portability skill on `<TARGET>/../test-uplift-worktree`"

Expected: report shows MISSING for all platform manifests (since this is a Claude-only plugin).

- [ ] **Step 3: Run the uplift skill**

> "Use the uplifting-a-plugin skill on `<TARGET>/../test-uplift-worktree`"

Expected: skill prints "Created:" section listing new manifest files.

- [ ] **Step 4: Verify created files**

```bash
cd <TARGET>/../test-uplift-worktree
find . -maxdepth 3 \( -name "plugin.json" -o -name "gemini-extension.json" \
  -o -name "GEMINI.md" -o -name "AGENTS.md" -o -name "package.json" \
  -o -name "hooks-cursor.json" \) | sort
```

Expected: each platform manifest file present.

- [ ] **Step 5: Verify idempotency**

Run uplift skill again on the same worktree.

Expected: skill prints empty "Created:" section and lists all files under "Skipped (already exists):" — no diff produced.

```bash
cd <TARGET>/../test-uplift-worktree
git diff
```

Expected: no output (clean diff).

- [ ] **Step 6: Verify skill sidecars**

```bash
find <TARGET>/../test-uplift-worktree/skills -name "*.md" -path "*/references/*" | sort
```

Expected: three sidecar files per skill (`copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`).

- [ ] **Step 7: Clean up worktree**

```bash
cd <TARGET>
git worktree remove ../test-uplift-worktree
git branch -D test/portability-uplift
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Full multi-platform manifest set | Tasks 2, 6 |
| Tool-name mapping via references/ sidecars | Task 5 |
| Standalone new plugin repo | Task 1 |
| Port all asset types (skills, commands, agents, hooks) | Task 3 (skill covers all) |
| Hybrid template approach (assets/templates/) | Task 2 |
| Conflict detection / no-overwrite | Task 3 (Step 3 in skill) |
| Idempotency | Task 7 Step 5 |
| Audit skill (read-only gap report) | Task 4 |
| Repo itself follows the pattern (dogfooding) | Task 6 |
| UPSTREAM.md with re-seed instructions | Task 2 Step 14 |
| run-hook.cmd Windows wrapper | Tasks 2 (template), 6 Step 12, 3 Step 11 (flagged) |

No gaps found.
