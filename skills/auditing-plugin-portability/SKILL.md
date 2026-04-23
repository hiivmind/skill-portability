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

- [ ] **Step 8: Check session-start injection** (only if `using-<name>` exists)

If `skills/using-{{name}}/SKILL.md` does not exist, skip this step entirely — bootstrapping is not configured.

If it exists, check all bootstrapping infrastructure:

| Component | Check |
|-----------|-------|
| `skills/using-{{name}}/SKILL.md` | File exists |
| `skills/using-{{name}}/references/gemini-tools.md` | File exists |
| `hooks/session-start` | File exists and is executable |
| `hooks/run-hook.cmd` | File exists and is executable |
| `hooks/hooks.json` | File exists and contains `SessionStart` entry with command containing `session-start` |
| `hooks/hooks-cursor.json` | File exists and contains `sessionStart` entry with command containing `session-start` |
| `.opencode/plugins/{{name}}.js` | File exists and contains `experimental.chat.messages.transform` |
| `GEMINI.md` | File exists and first `@./skills/` include is `using-{{name}}` |

Report status for each:
- `PRESENT` — component exists and is correctly configured
- `MISSING` — component does not exist
- `NO_TRANSFORM` — OpenCode plugin exists but lacks message transform
- `NOT_FIRST` — GEMINI.md exists but using-{{name}} is not the first skill include

- [ ] **Step 9: Print report**

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
