# Platform-Neutral Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite both skill-portability skills so they detect and infer plugin metadata from any platform's manifest (or bare SKILL.md files), treating Claude Code as an equally valid target rather than a required prerequisite.

**Architecture:** Both `uplifting-a-plugin` and `auditing-plugin-portability` SKILL.md files are rewritten in place. Each gains a shared **Detection Algorithm** section (D1–D4) that replaces the old hard-coded "read .claude-plugin/plugin.json" Step 1. The uplift skill adds Claude Code manifests to its write targets. The audit skill adds Claude Code manifests to its check list and gains an "Inferred metadata warnings" section in its report template. No new files; no code — these are pure markdown skill files.

**Tech Stack:** Markdown, YAML frontmatter. No build step.

---

## File Map

| File | Change |
|---|---|
| `skills/uplifting-a-plugin/SKILL.md` | Full rewrite — platform-neutral detection phase replaces Step 1; Claude Code added as write target; report gains inferred metadata warnings section |
| `skills/auditing-plugin-portability/SKILL.md` | Full rewrite — hard-fail on missing Claude manifest removed; detection phase added; Claude Code added to audit checklist; report updated |

No other files change. Templates already cover Claude Code (`assets/templates/claude-plugin/`).

---

## Task 1: Rewrite `uplifting-a-plugin` SKILL.md

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (full replacement)

- [ ] **Step 1: Write the new SKILL.md**

Write `~/git/github/skill-portability/skills/uplifting-a-plugin/SKILL.md` with exactly this content:

```markdown
---
name: uplifting-a-plugin
description: Use when you need to add multi-platform portability to a plugin. Accepts any starting state — a Claude plugin, a Cursor plugin, a Gemini extension, an npx skills repo, or a bare directory of SKILL.md files. Detects what is already present, infers a canonical metadata model, and emits every missing platform artifact: Claude Code, Cursor, Gemini CLI, OpenCode, AGENTS.md, per-skill tool-mapping sidecars.
---

# Uplifting a Plugin to Multi-Platform Portability

This skill transforms any plugin — regardless of its starting platform — into a fully portable plugin following the superpowers portability pattern. No platform is assumed to already exist. Claude Code manifests are an equally valid *target* as Cursor or Gemini manifests.

## What this skill produces

For a source plugin at `<plugin-path>`, this skill writes every missing artifact:

| Platform | Files written if missing |
|---|---|
| Claude Code | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CLAUDE.md` |
| Cursor | `.cursor-plugin/plugin.json` |
| Gemini CLI | `gemini-extension.json`, `GEMINI.md` |
| OpenCode | `package.json`, `.opencode/plugins/<name>.js` |
| Generic (Codex/Copilot CLI) | `AGENTS.md` |
| All skills | `skills/<name>/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md` |
| Hook portability | `hooks/hooks-cursor.json`, `hooks/run-hook.cmd` (if hooks exist) |
| npx skills compat | Validates every `skills/<name>/SKILL.md` has `name` + `description` frontmatter |

## Minimum starting state

At least ONE of the following must exist:
- One or more `skills/*/SKILL.md` files with `name` and `description` YAML frontmatter
- Any platform manifest: `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json`, or `package.json`

If neither is found, stop and report an error (see Step 1).

## Detection Algorithm

Both phases below rely on a shared detection routine. Run it once at the start.

### Step D1: Scan for metadata sources

Check which of these exist at `<plugin-path>`:

| Source | Fields extractable |
|---|---|
| `.claude-plugin/plugin.json` | `name`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `.cursor-plugin/plugin.json` | `name`, `displayName`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `gemini-extension.json` | `name`, `description`, `version` |
| `package.json` | `name`, `version`, `description` |
| `AGENTS.md` | `name` (from H1 heading — first `# Heading` line), `description` (first non-heading paragraph) |
| `skills/*/SKILL.md` frontmatter | `name` (YAML `name:` field, or skill directory name as fallback), `description` (YAML `description:` field) |

If **none** of these are found, stop and report:
> "No recognisable plugin signals found in `<plugin-path>`. Provide at least one platform manifest or one `skills/*/SKILL.md` with `name` and `description` frontmatter."

### Step D2: Score and elect canonical source

For each present source, count the number of populated (non-empty) fields from the table above. The source with the **most populated fields** becomes the **canonical source**.

Tie-breaking order when scores are equal (highest priority first):
1. `.claude-plugin/plugin.json`
2. `.cursor-plugin/plugin.json`
3. `gemini-extension.json`
4. `package.json`
5. `AGENTS.md`
6. First `skills/*/SKILL.md` alphabetically by directory name

### Step D3: Build canonical metadata model

Start with all fields from the canonical source. For each field that is empty or absent, check the remaining sources in descending score order and take the first non-empty value found.

| Field | Hard fallback (used only when not found anywhere) |
|---|---|
| `name` | Directory basename of `<plugin-path>` |
| `displayName` | Title-case `name`: replace `-` and `_` with spaces, capitalise each word |
| `description` | `""` — flag as missing |
| `version` | `"0.1.0"` |
| `author.name` | `""` — flag as missing |
| `author.email` | `""` — flag as missing |
| `homepage` | `""` |
| `repository` | `""` |
| `license` | `"MIT"` |
| `keywords` | `[]` |

Always derive (never read from sources):
- `marketplaceName` = `<name>-dev`
- `opencodeMain` = `.opencode/plugins/<name>.js`

### Step D4: Print inference summary

Before writing any files, print:

```
## Metadata inferred
  canonical source: .claude-plugin/plugin.json  (9 fields)
  name:          my-plugin        (from .claude-plugin/plugin.json)
  description:   Does X for Y.   (from .claude-plugin/plugin.json)
  version:       1.2.0            (from .cursor-plugin/plugin.json)
  author.name:   [missing — not found in any source]
  author.email:  [missing — not found in any source]
  homepage:                       (empty string — not found)
  repository:                     (empty string — not found)
  license:       MIT              (hard fallback)
  keywords:      []               (hard fallback)
```

Fields still missing after all sources are checked are flagged here and repeated in the final report.

## Checklist

- [ ] **Step 1: Run Detection Algorithm (D1–D4)**

Execute Steps D1–D4 above. If no signals found, stop with the error message. Otherwise proceed with the inferred canonical metadata.

- [ ] **Step 2: Inventory source assets**

Detect which asset types exist at `<plugin-path>`:
- Does `skills/` exist? List all skill subdirectory names.
- Does `commands/` exist? List all `.md` filenames.
- Does `agents/` exist? List all `.md` filenames.
- Does `hooks/hooks.json` exist? Read and parse it.

- [ ] **Step 3: Check for conflicts (do not overwrite without --force)**

Before writing any file, check whether each target already exists. Skip and note in the final report any that do.

Full target file list:
```
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
.cursor-plugin/plugin.json
gemini-extension.json
GEMINI.md
AGENTS.md
CLAUDE.md
package.json
.opencode/plugins/<name>.js
hooks/hooks-cursor.json
hooks/run-hook.cmd
```

Also check each `skills/<skillname>/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`.

- [ ] **Step 4: Render and write `.claude-plugin/plugin.json`** (if missing)

Locate this plugin's install path via Glob: `~/.claude/plugins/cache/**/skill-portability/*/assets/templates/claude-plugin/plugin.json.tmpl`. Read the template. Substitute all `{{fields}}` with inferred metadata values. Write to `<plugin-path>/.claude-plugin/plugin.json`. Create `.claude-plugin/` directory if needed.

- [ ] **Step 5: Render and write `.claude-plugin/marketplace.json`** (if missing)

Read `assets/templates/claude-plugin/marketplace.json.tmpl` from the plugin install path. Substitute fields. Write to `<plugin-path>/.claude-plugin/marketplace.json`.

- [ ] **Step 6: Render and write `CLAUDE.md`** (if missing)

Read `assets/templates/CLAUDE.md.tmpl`. Substitute `{{displayName}}` and `{{description}}`. Write to `<plugin-path>/CLAUDE.md`.

- [ ] **Step 7: Render and write `.cursor-plugin/plugin.json`** (if missing)

Read `assets/templates/cursor-plugin/plugin.json.tmpl`. Substitute fields. Write to `<plugin-path>/.cursor-plugin/plugin.json`. Create `.cursor-plugin/` directory if needed.

Omit `"agents"` key if `agents/` doesn't exist in source. Omit `"commands"` key if `commands/` doesn't exist.

- [ ] **Step 8: Render and write `gemini-extension.json`** (if missing)

Read `assets/templates/gemini-extension.json.tmpl`. Substitute fields. Write to `<plugin-path>/gemini-extension.json`.

- [ ] **Step 9: Render and write `GEMINI.md`** (if missing)

Build `{{skillIncludes}}` — for each skill name from Step 2:
```
@./skills/<skillname>/SKILL.md
@./skills/<skillname>/references/gemini-tools.md
```

Build `{{agentIncludes}}` (omit entirely if no agents) — for each agent file:
```
@./agents/<agentfile>.md
```

Build `{{commandIncludes}}` (omit entirely if no commands) — for each command file:
```
@./commands/<commandfile>.md
```

Write assembled content to `<plugin-path>/GEMINI.md`.

- [ ] **Step 10: Render and write `AGENTS.md`** (if missing)

Build skill bullet list for `{{skillIncludes}}`:
```
- skills/<skillname>/SKILL.md
```

Build command bullet list for `{{commandIncludes}}` (omit entire Commands section if no commands):
```
- commands/<commandfile>.md
```

Read `assets/templates/AGENTS.md.tmpl`. Substitute all fields. Write to `<plugin-path>/AGENTS.md`.

- [ ] **Step 11: Render and write `package.json`** (if missing)

Read `assets/templates/package.json.tmpl`. Substitute fields. Write to `<plugin-path>/package.json`.

- [ ] **Step 12: Render and write OpenCode plugin shim** (if missing)

Create `<plugin-path>/.opencode/plugins/` if needed. Read `assets/templates/opencode-plugin.js.tmpl`. Substitute fields. Write to `<plugin-path>/.opencode/plugins/<name>.js`.

- [ ] **Step 13: Port hooks** (if source has hooks)

If `<plugin-path>/hooks/hooks.json` exists and has non-empty entries:

Map Claude hook events to Cursor equivalents:

| Claude event | Cursor event |
|---|---|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userMessage` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |

Build and write `<plugin-path>/hooks/hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {
    "<cursorEventName>": [
      { "command": "<same command as in hooks.json>" }
    ]
  }
}
```

**Flag in report:** Any hook command containing `$CLAUDE_PLUGIN_ROOT` needs manual review — Cursor uses a different env var.

If no hooks exist, write empty `hooks/hooks-cursor.json` from template.

- [ ] **Step 14: Note about `hooks/run-hook.cmd`**

Do not auto-write this file in v1. Flag in the report:
> `hooks/run-hook.cmd` not written — copy manually from: `~/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/hooks/run-hook.cmd`

- [ ] **Step 15: Validate `npx skills` frontmatter**

For each skill detected in Step 2, read `skills/<skillname>/SKILL.md` and verify:
- YAML frontmatter block (`---` delimiters) present at top of file
- `name:` field present and non-empty
- `description:` field present and non-empty

Flag any failures in the "Needs manual review" section of the final report:
> `skills/<skillname>/SKILL.md` missing frontmatter field(s): `<name|description>`. Add:
> ```yaml
> ---
> name: <skillname>
> description: <what this skill does and when to invoke it>
> ---
> ```
Do NOT auto-write — frontmatter descriptions require human authorship.

- [ ] **Step 16: Seed per-skill tool-mapping sidecars**

For each skill from Step 2, check whether `skills/<skillname>/references/` exists and whether each of the three sidecar files is present. For each missing sidecar, read from `assets/templates/skill-references/<platform>-tools.md` and write to `<plugin-path>/skills/<skillname>/references/<platform>-tools.md`. Create `references/` directory if needed.

- [ ] **Step 17: Emit final report**

Print a summary with four sections:

**Metadata inferred:**
Repeat the D4 inference summary. List any fields that fell back to hard defaults or were left blank.

**Created:**
Every file written in this run, relative to `<plugin-path>`.

**Skipped (already exists):**
Every file that was present and therefore not overwritten.

**Needs manual review:**
- Any hook command containing `$CLAUDE_PLUGIN_ROOT`
- `hooks/run-hook.cmd` copy instruction
- Any skill with missing `name` or `description` frontmatter
- Any metadata field that could not be inferred from any source

## Running the skill

Invoke with: `"Use the uplifting-a-plugin skill on <path/to/plugin>"`

The skill is idempotent: running it twice on the same repo produces no diff on the second run.

## Locating this plugin's assets

Use Glob with pattern `~/.claude/plugins/cache/**/skill-portability/*/assets/templates/` to find the install root.
```

- [ ] **Step 2: Verify frontmatter updated**

Read the first 5 lines of the written file. Confirm `description:` now says "Accepts any starting state" rather than "Takes a plugin repo with only .claude-plugin/ manifests".

```bash
head -5 ~/git/github/skill-portability/skills/uplifting-a-plugin/SKILL.md
```

Expected: frontmatter description mentions "any starting state" and lists multiple platforms as inputs.

- [ ] **Step 3: Verify Prerequisites block is gone**

```bash
grep -c "Prerequisites" ~/git/github/skill-portability/skills/uplifting-a-plugin/SKILL.md
```

Expected: `0`

- [ ] **Step 4: Verify Claude Code write targets present**

```bash
grep -c "claude-plugin" ~/git/github/skill-portability/skills/uplifting-a-plugin/SKILL.md
```

Expected: `4` or more (plugin.json, marketplace.json, template paths, conflict check list).

- [ ] **Step 5: Commit**

```bash
cd ~/git/github/skill-portability
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: rewrite uplifting-a-plugin with platform-neutral detection"
```

---

## Task 2: Rewrite `auditing-plugin-portability` SKILL.md

**Files:**
- Modify: `skills/auditing-plugin-portability/SKILL.md` (full replacement)

- [ ] **Step 1: Write the new SKILL.md**

Write `~/git/github/skill-portability/skills/auditing-plugin-portability/SKILL.md` with exactly this content:

```markdown
---
name: auditing-plugin-portability
description: Use when you want to check a plugin for multi-platform portability gaps without making any changes. Accepts any starting state — Claude, Cursor, Gemini, npx skills repos, or bare SKILL.md files. Detects what metadata is available, infers the canonical plugin identity, then reports PRESENT or MISSING for every platform artifact including Claude Code manifests.
---

# Auditing Plugin Portability

This skill inspects a plugin repo and reports portability gaps across all platforms. It makes no changes. No platform is assumed to already be present — Claude Code manifests are checked just like Cursor or Gemini manifests.

## Minimum starting state

At least ONE of the following must exist:
- One or more `skills/*/SKILL.md` files with `name` and `description` YAML frontmatter
- Any platform manifest: `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json`, or `package.json`

## Detection Algorithm

### Step D1: Scan for metadata sources

Check which of these exist at `<plugin-path>`:

| Source | Fields extractable |
|---|---|
| `.claude-plugin/plugin.json` | `name`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `.cursor-plugin/plugin.json` | `name`, `displayName`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `gemini-extension.json` | `name`, `description`, `version` |
| `package.json` | `name`, `version`, `description` |
| `AGENTS.md` | `name` (from H1 heading), `description` (from first non-heading paragraph) |
| `skills/*/SKILL.md` frontmatter | `name` (YAML `name:` field, or directory name), `description` (YAML `description:` field) |

If **none** of these are found, stop and report:
> "No recognisable plugin signals found in `<plugin-path>`. Provide at least one platform manifest or one `skills/*/SKILL.md` with `name` and `description` frontmatter."

### Step D2: Score and elect canonical source

Count populated fields per source. Highest count = canonical source.

Tie-breaking (highest priority first): `.claude-plugin/plugin.json` → `.cursor-plugin/plugin.json` → `gemini-extension.json` → `package.json` → `AGENTS.md` → first `skills/*/SKILL.md` alphabetically.

### Step D3: Build canonical metadata model

Fill fields from canonical source first, then from remaining sources in descending score order for any gaps.

| Field | Hard fallback |
|---|---|
| `name` | Directory basename of `<plugin-path>` |
| `description` | `""` — flag as missing |
| `version` | `"0.1.0"` |
| `author.name` | `""` — flag as missing |
| `author.email` | `""` — flag as missing |

### Step D4: Print inference summary

```
## Metadata inferred
  canonical source: .cursor-plugin/plugin.json  (10 fields)
  name:     my-plugin      (from .cursor-plugin/plugin.json)
  version:  1.0.0          (from .cursor-plugin/plugin.json)
  author.name: [missing — not found in any source]
```

## Checklist

- [ ] **Step 1: Run Detection Algorithm (D1–D4)**

Execute Steps D1–D4 above. If no signals found, stop with the error message.

- [ ] **Step 2: Check platform manifest files**

For each file, report PRESENT or MISSING:

```
.claude-plugin/plugin.json        → Claude Code plugin manifest
.claude-plugin/marketplace.json   → Claude Code marketplace listing
.cursor-plugin/plugin.json        → Cursor support
gemini-extension.json             → Gemini CLI extension descriptor
GEMINI.md                         → Gemini CLI context file
AGENTS.md                         → Generic harness (Codex, Copilot CLI)
CLAUDE.md                         → Claude Code context file
package.json                      → OpenCode support
.opencode/plugins/<name>.js       → OpenCode skill shim
hooks/hooks-cursor.json           → Cursor hook support
hooks/run-hook.cmd                → Windows hook wrapper
```

- [ ] **Step 3: Check per-skill sidecars**

For each directory in `skills/`, report PRESENT or MISSING for each of:
- `skills/<name>/references/copilot-tools.md`
- `skills/<name>/references/codex-tools.md`
- `skills/<name>/references/gemini-tools.md`

- [ ] **Step 4: Check GEMINI.md completeness** (if present)

If `GEMINI.md` exists, verify it has an `@` include line for each skill's `SKILL.md` and each skill's `gemini-tools.md`. Report any skills missing from the include list.

- [ ] **Step 5: Check AGENTS.md completeness** (if present)

If `AGENTS.md` exists, verify it references each skill by path. Report any skills missing from the reference list.

- [ ] **Step 6: Check `npx skills` frontmatter compatibility**

For each directory in `skills/`, read `skills/<name>/SKILL.md` and verify:
- YAML frontmatter (`---` delimiters) present at top of file
- `name:` field present and non-empty
- `description:` field present and non-empty

Report COMPATIBLE or MISSING FRONTMATTER for each skill.

- [ ] **Step 7: Check hooks**

If `hooks/hooks.json` exists and is non-empty:
- Verify `hooks/hooks-cursor.json` exists
- Verify `hooks/run-hook.cmd` exists
- Report any missing files

- [ ] **Step 8: Print report**

```
# Portability Audit: <name> v<version>
Metadata inferred from: <canonical source>

## Platform manifests
PRESENT  .claude-plugin/plugin.json
MISSING  .claude-plugin/marketplace.json
PRESENT  .cursor-plugin/plugin.json
MISSING  gemini-extension.json
MISSING  GEMINI.md
MISSING  AGENTS.md
MISSING  CLAUDE.md
MISSING  package.json
MISSING  .opencode/plugins/<name>.js
MISSING  hooks/hooks-cursor.json
MISSING  hooks/run-hook.cmd

## Skill sidecars
skills/my-skill/
  PRESENT  references/copilot-tools.md
  MISSING  references/codex-tools.md
  MISSING  references/gemini-tools.md

## npx skills compatibility
skills/my-skill/SKILL.md   COMPATIBLE  (name + description present)
skills/other/SKILL.md      MISSING FRONTMATTER  (description absent)

## Context file completeness
GEMINI.md: MISSING — cannot check includes
AGENTS.md: MISSING — cannot check skill references

## Hooks
hooks/hooks.json: MISSING — no hooks to port

## Inferred metadata warnings
  author.name: not found in any source — will be written as empty string if uplifted
  author.email: not found in any source

## Summary
3 files present, 8 missing.
1 skill npx-compatible, 1 missing frontmatter.
Run the uplifting-a-plugin skill to generate all missing files automatically.
Add missing SKILL.md frontmatter manually before publishing via npx skills.
```
```

- [ ] **Step 2: Verify hard-fail on missing Claude manifest is gone**

```bash
grep -c "Verify source is a Claude plugin" ~/git/github/skill-portability/skills/auditing-plugin-portability/SKILL.md
```

Expected: `0`

- [ ] **Step 3: Verify Claude Code appears in the manifest checklist**

```bash
grep -c "claude-plugin" ~/git/github/skill-portability/skills/auditing-plugin-portability/SKILL.md
```

Expected: `3` or more (plugin.json, marketplace.json, report example).

- [ ] **Step 4: Verify Detection Algorithm section present**

```bash
grep -c "Detection Algorithm" ~/git/github/skill-portability/skills/auditing-plugin-portability/SKILL.md
```

Expected: `1` or more.

- [ ] **Step 5: Commit**

```bash
cd ~/git/github/skill-portability
git add skills/auditing-plugin-portability/SKILL.md
git commit -m "feat: rewrite auditing-plugin-portability with platform-neutral detection"
```

---

## Task 3: Update the plugin's own manifest descriptions

The plugin's own manifests still say "Claude-only plugin" in their descriptions. Update to reflect platform-neutral capability.

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.cursor-plugin/plugin.json`
- Modify: `gemini-extension.json`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: Update `.claude-plugin/plugin.json` description**

In `~/git/github/skill-portability/.claude-plugin/plugin.json`, change:
```json
"description": "Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support"
```
to:
```json
"description": "Make any plugin fully portable across all platforms. Accepts Claude, Cursor, Gemini, OpenCode, or bare SKILL.md repos as input. Emits every missing platform artifact."
```

- [ ] **Step 2: Update `.cursor-plugin/plugin.json` description**

Same description change as Step 1 in `~/git/github/skill-portability/.cursor-plugin/plugin.json`.

- [ ] **Step 3: Update `gemini-extension.json` description**

Same description change in `~/git/github/skill-portability/gemini-extension.json`.

- [ ] **Step 4: Update `AGENTS.md`**

In `~/git/github/skill-portability/AGENTS.md`, change the description paragraph under the `# Skill Portability` heading from:
```
Uplift any Claude plugin to full multi-platform portability: Cursor, Gemini CLI, OpenCode, and AGENTS.md support.
```
to:
```
Make any plugin fully portable across all platforms. Accepts Claude, Cursor, Gemini, OpenCode, or bare SKILL.md repos as input. Emits every missing platform artifact.
```

- [ ] **Step 5: Update `CLAUDE.md`**

Same description change in `~/git/github/skill-portability/CLAUDE.md`.

- [ ] **Step 6: Update `README.md` — intro and "What it does" section**

In `~/git/github/skill-portability/README.md`:

Change the intro paragraph from:
```
A Claude Code plugin that adds multi-platform portability to any Claude-only plugin.
```
to:
```
A plugin that makes any plugin fully portable across all agent platforms. Works from any starting state: Claude Code, Cursor, Gemini CLI, OpenCode, or a bare directory of SKILL.md files.
```

Change the "What it does" section opening from:
```
Takes a plugin that only has `.claude-plugin/` manifests (Claude Code only) and adds:
```
to:
```
Detects whatever platform manifests are already present, infers plugin metadata, then emits every missing artifact:
```

Add to the bullet list:
```
- **Claude Code** — `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CLAUDE.md`
```
(before the existing Cursor bullet)

- [ ] **Step 7: Verify no remaining "Claude-only" references in manifests**

```bash
grep -ri "claude-only\|claude only" ~/git/github/skill-portability/.claude-plugin/ \
  ~/git/github/skill-portability/.cursor-plugin/ \
  ~/git/github/skill-portability/gemini-extension.json \
  ~/git/github/skill-portability/AGENTS.md \
  ~/git/github/skill-portability/CLAUDE.md \
  ~/git/github/skill-portability/README.md 2>/dev/null
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
cd ~/git/github/skill-portability
git add .claude-plugin/ .cursor-plugin/ gemini-extension.json AGENTS.md CLAUDE.md README.md
git commit -m "chore: update manifest descriptions to reflect platform-neutral capability"
```

---

## Task 4: End-to-end verification

Verify both rewritten skills against two different starting states.

**Files:** None changed. Read-only verification.

- [ ] **Step 1: Simulate audit on a Cursor-only repo**

Find or construct a minimal test directory with only a `.cursor-plugin/plugin.json` (no `.claude-plugin/`):

```bash
mkdir -p /tmp/test-cursor-only/.cursor-plugin
cat > /tmp/test-cursor-only/.cursor-plugin/plugin.json <<'EOF'
{
  "name": "test-cursor-plugin",
  "displayName": "Test Cursor Plugin",
  "description": "A test plugin starting from Cursor only.",
  "version": "0.5.0",
  "author": { "name": "Test Author", "email": "test@example.com" },
  "skills": "./skills/"
}
EOF
mkdir -p /tmp/test-cursor-only/skills/my-skill
cat > /tmp/test-cursor-only/skills/my-skill/SKILL.md <<'EOF'
---
name: my-skill
description: Does something useful.
---
# My Skill
Instructions here.
EOF
```

Manually execute the audit skill's Detection Algorithm (Steps D1–D4) on `/tmp/test-cursor-only`:
- D1: should find `.cursor-plugin/plugin.json` and `skills/my-skill/SKILL.md`
- D2: `.cursor-plugin/plugin.json` scores higher (more fields) → canonical source
- D3: name=`test-cursor-plugin`, description=`A test plugin...`, version=`0.5.0`, author filled
- D4: print inference summary

Then execute Step 2 (manifest checklist). Expected results:
```
MISSING  .claude-plugin/plugin.json
MISSING  .claude-plugin/marketplace.json
PRESENT  .cursor-plugin/plugin.json
MISSING  gemini-extension.json
...
```

Confirm the audit does NOT stop with "Not a Claude plugin" error.

- [ ] **Step 2: Simulate audit on a SKILL.md-only repo**

```bash
mkdir -p /tmp/test-skills-only/skills/my-tool
cat > /tmp/test-skills-only/skills/my-tool/SKILL.md <<'EOF'
---
name: my-tool
description: Does something with tools.
---
# My Tool
EOF
```

Manually execute D1–D4 on `/tmp/test-skills-only`:
- D1: only `skills/my-tool/SKILL.md` found
- D2: only one source → it is canonical
- D3: name=`my-tool`, description=`Does something with tools.`, version=`0.1.0` (hard fallback), author.name=`""` (flagged missing)
- D4: inference summary shows version as hard fallback, author as missing

Confirm the skill does NOT stop at D1 (at least one SKILL.md exists).

- [ ] **Step 3: Simulate uplift on the SKILL.md-only repo**

Manually execute Steps 1–17 of the uplifted `uplifting-a-plugin` skill on `/tmp/test-skills-only`. With no existing manifests, all platform files should be in the "Created" list.

Verify the report includes:
- "Inferred metadata warnings" listing `author.name` and `author.email` as missing
- `hooks/run-hook.cmd` copy instruction in "Needs manual review"
- `skills/my-tool/SKILL.md` as COMPATIBLE in npx skills section

- [ ] **Step 4: Clean up**

```bash
rm -rf /tmp/test-cursor-only /tmp/test-skills-only
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Accept SKILL.md-only as starting state | Tasks 1, 2 (D1 accepts SKILL.md), Task 4 Step 2 |
| Accept any platform manifest as starting state | Tasks 1, 2 (D1 source table) |
| Most-complete source wins conflict resolution | Tasks 1, 2 (D2 scoring) |
| Build canonical metadata from all sources | Tasks 1, 2 (D3) |
| Flag fields not found anywhere | Tasks 1, 2 (D4 + final report) |
| Write `.claude-plugin/` if missing | Task 1 (Steps 4–5) |
| Write `CLAUDE.md` if missing | Task 1 (Step 6) |
| Audit checks `.claude-plugin/` | Task 2 (Step 2) |
| Audit report has "Inferred metadata warnings" section | Task 2 (Step 8 report template) |
| Remove hard-fail on missing Claude manifest | Task 2 (Step 1 replaces old Step 1) |
| Update own manifests to reflect platform-neutral capability | Task 3 |
| AGENTS.md as metadata source (H1 → name, first para → description) | Tasks 1, 2 (D1 table) |

No gaps found.
