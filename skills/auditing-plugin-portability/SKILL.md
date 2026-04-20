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
