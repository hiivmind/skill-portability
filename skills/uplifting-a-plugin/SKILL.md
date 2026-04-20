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
