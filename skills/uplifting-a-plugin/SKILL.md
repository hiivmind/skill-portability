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
| npx skills compat | Validates every `skills/<name>/SKILL.md` has `name` + `description` frontmatter |

## Prerequisites

The source plugin MUST have `.claude-plugin/plugin.json`. If it doesn't exist, stop and report an error.

## Checklist

- [ ] **Step 1: Read source metadata**

Read `<plugin-path>/.claude-plugin/plugin.json`. Extract these fields:
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

- [ ] **Step 3: Check for conflicts (do not overwrite without --force)**

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

Locate this plugin's install path: use Glob with pattern `~/.claude/plugins/cache/**/skill-portability/*/assets/templates/cursor-plugin/plugin.json.tmpl` to find the template. Read it. Substitute all `{{fields}}` with values from Step 1. Write to `<plugin-path>/.cursor-plugin/plugin.json`.

The `"skills"`, `"agents"`, `"commands"` fields should point at directories that exist in the source. Omit `"agents"` if `agents/` doesn't exist; omit `"commands"` if `commands/` doesn't exist.

- [ ] **Step 5: Render and write `gemini-extension.json`**

Read template `assets/templates/gemini-extension.json.tmpl` from plugin install path. Substitute `{{fields}}`. Write to `<plugin-path>/gemini-extension.json`.

- [ ] **Step 6: Render and write `GEMINI.md`**

Build `{{skillIncludes}}` block — for each skill name detected in Step 2:
```
@./skills/<skillname>/SKILL.md
@./skills/<skillname>/references/gemini-tools.md
```

Build `{{agentIncludes}}` block (omit entirely if no agents) — for each agent file:
```
@./agents/<agentfile>.md
```

Build `{{commandIncludes}}` block (omit entirely if no commands) — for each command file:
```
@./commands/<commandfile>.md
```

Write the assembled content to `<plugin-path>/GEMINI.md`.

- [ ] **Step 7: Render and write `AGENTS.md`**

Build skill bullet list for `{{skillIncludes}}`:
```
- skills/<skillname>/SKILL.md
```
(one line per skill)

Build command bullet list for `{{commandIncludes}}` (omit entire "Commands" section if no commands):
```
- commands/<commandfile>.md
```

Read `assets/templates/AGENTS.md.tmpl` from plugin install path. Substitute all fields. Write to `<plugin-path>/AGENTS.md`.

- [ ] **Step 8: Render and write `package.json`**

Read `assets/templates/package.json.tmpl`. Substitute `{{fields}}`. Write to `<plugin-path>/package.json`.

- [ ] **Step 9: Render and write OpenCode plugin shim**

Create directory `<plugin-path>/.opencode/plugins/` if it doesn't exist. Read `assets/templates/opencode-plugin.js.tmpl`. Substitute `{{fields}}`. Write to `<plugin-path>/.opencode/plugins/<name>.js`.

- [ ] **Step 10: Port hooks (if source has hooks)**

If `<plugin-path>/hooks/hooks.json` exists and contains non-empty hook entries:

Read `hooks/hooks.json`. For each Claude hook event, derive the Cursor equivalent:

| Claude hook event | Cursor hook event |
|---|---|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userMessage` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |

Build and write `hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {
    "<cursorEventName>": [
      { "command": "<same command as hooks.json>" }
    ]
  }
}
```

Write to `<plugin-path>/hooks/hooks-cursor.json`.

**Flag in report:** Any hook command containing `$CLAUDE_PLUGIN_ROOT` needs manual review — Cursor uses a different env var.

If source has no hooks, write empty `hooks/hooks-cursor.json` from template.

- [ ] **Step 11: Note about `hooks/run-hook.cmd`**

The `run-hook.cmd` Windows wrapper is not auto-written in v1. Flag in the report:

> `hooks/run-hook.cmd` not written — copy manually from: `~/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/hooks/run-hook.cmd`

- [ ] **Step 12: Validate `npx skills` frontmatter for every skill**

For each skill directory detected in Step 2, read `skills/<skillname>/SKILL.md` and check:
- Does the YAML frontmatter block exist (delimited by `---`)?
- Is `name:` present and non-empty?
- Is `description:` present and non-empty?

For any skill failing this check, flag it in the "Needs manual review" section of the final report:

> `skills/<skillname>/SKILL.md` is not `npx skills`-compatible: missing frontmatter field(s): `<name|description>`. Add a YAML block at the top of the file:
> ```yaml
> ---
> name: <skillname>
> description: <what this skill does and when to invoke it>
> ---
> ```

Do NOT auto-write these — frontmatter content requires human authorship to be meaningful. Only report.

- [ ] **Step 13: Seed per-skill tool-mapping sidecars**

For each skill name detected in Step 2, check whether `skills/<skillname>/references/` exists and whether each of the three sidecar files is present.

For each missing sidecar, read from this plugin's `assets/templates/skill-references/<platform>-tools.md` and write to `<plugin-path>/skills/<skillname>/references/<platform>-tools.md`. Create `references/` directory if needed.

- [ ] **Step 14: Emit final report**

Print a summary with three sections:

**Created:**
List every file written (full paths relative to `<plugin-path>`).

**Skipped (already exists):**
List every file skipped due to conflict.

**Needs manual review:**
- Any hook command containing `$CLAUDE_PLUGIN_ROOT`
- `hooks/run-hook.cmd` copy instruction
- Any skill with missing `name` or `description` frontmatter in SKILL.md

## Running the skill

Invoke with: `"Use the uplifting-a-plugin skill on <path/to/plugin>"`

The skill is idempotent: running it twice produces no diff on the second run.

## Locating this plugin's assets

Use `Glob` with pattern `~/.claude/plugins/cache/**/skill-portability/*/assets/templates/` to find the install root.
