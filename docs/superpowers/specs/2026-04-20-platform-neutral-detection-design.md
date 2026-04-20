# Platform-Neutral Detection Design

## Context

The original `uplifting-a-plugin` and `auditing-plugin-portability` skills assumed `.claude-plugin/plugin.json` as the canonical starting state, treating Claude Code as the source of truth and all other platforms as targets. This is wrong: any platform could be the starting point, and Claude Code is just as valid a *target* as Cursor or Gemini CLI. A plugin repo with only `skills/*/SKILL.md` files and no manifests at all should be equally acceptable as input.

This spec redesigns both skills to use a **detect-first, infer-second, fill-gaps-third** model where no platform is privileged.

---

## Goals

1. Accept any of the following as a valid starting state:
   - One or more `skills/*/SKILL.md` files with `name` + `description` frontmatter (minimum viable state)
   - Any platform manifest (`.claude-plugin/`, `.cursor-plugin/`, `gemini-extension.json`, `package.json`)
   - Any combination of the above
2. Infer a single canonical metadata model from whatever is present, with deterministic conflict resolution.
3. Emit every missing platform artifact — including `.claude-plugin/` if it was absent.
4. Treat Claude Code as an equally valid target, not an assumed prerequisite.

---

## Detection Algorithm (shared by both skills)

Both skills run this phase before doing anything else.

### Step D1: Scan for metadata sources

Check for the following sources in the plugin directory. Note which are present:

| Source | Fields extractable |
|---|---|
| `.claude-plugin/plugin.json` | `name`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `.cursor-plugin/plugin.json` | `name`, `displayName`, `description`, `version`, `author.name`, `author.email`, `homepage`, `repository`, `license`, `keywords` |
| `gemini-extension.json` | `name`, `description`, `version` |
| `package.json` | `name`, `version`, `description` |
| `AGENTS.md` | `name` (from H1 heading), `description` (from first non-heading paragraph) |
| `skills/*/SKILL.md` frontmatter | `name` (from YAML `name:` field, or directory name as fallback), `description` (from YAML `description:` field) |

If **none** of these sources exist, stop and report:
> "No recognisable plugin signals found in `<plugin-path>`. Need at least one platform manifest or one `skills/*/SKILL.md` with `name` and `description` frontmatter."

### Step D2: Score and elect canonical source

For each source found, count the number of populated fields from the table above. The source with the **most populated fields** becomes the **canonical source**.

Tie-breaking order (highest priority first):
1. `.claude-plugin/plugin.json`
2. `.cursor-plugin/plugin.json`
3. `gemini-extension.json`
4. `package.json`
5. `AGENTS.md`
6. First `skills/*/SKILL.md` alphabetically

### Step D3: Build canonical metadata model

Start with all fields from the canonical source. For each field that is empty or absent, check remaining sources in descending score order and take the first non-empty value.

**Canonical metadata fields:**

| Field | Fallback if not found anywhere |
|---|---|
| `name` | Directory basename of `<plugin-path>` |
| `displayName` | Title-case `name` (replace `-`/`_` with spaces, capitalise each word) |
| `description` | `""` — flag as missing in report |
| `version` | `"0.1.0"` |
| `author.name` | `""` — flag as missing |
| `author.email` | `""` — flag as missing |
| `homepage` | `""` |
| `repository` | `""` |
| `license` | `"MIT"` |
| `keywords` | `[]` |

**Derived fields** (always computed, never read from sources):
- `marketplaceName` = `<name>-dev`
- `opencodeMain` = `.opencode/plugins/<name>.js`

### Step D4: Report what was inferred

Before proceeding, print a brief inference summary:

```
## Metadata inferred from: <canonical source name>
  name:        skill-portability       (from .claude-plugin/plugin.json)
  version:     0.1.0                   (from .cursor-plugin/plugin.json)
  author.name: [missing — not found in any source]
  ...
```

Fields that could not be inferred from any source are flagged here and again in the final report.

---

## `uplifting-a-plugin` — revised skill

### Phase 1: Detection
Run the Detection Algorithm (Steps D1–D4) above.

### Phase 2: Conflict check (no overwrite without --force)

Check whether each target file already exists. Skip and report any that do.

Complete target file list (all platforms, including Claude Code):
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

Also check per-skill sidecars: `skills/<name>/references/{copilot,codex,gemini}-tools.md`.

### Phase 3: Write missing platform artifacts

For each file missing (not skipped), render from the corresponding template in `assets/templates/` and write. This is identical to the current Steps 4–11, except:

- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` are now also rendered and written if absent.
- The Cursor manifest omits `"agents"` or `"commands"` keys if those directories don't exist in the source.

### Phase 4: npx skills frontmatter validation, sidecar seeding, final report
Identical to current Steps 12–14.

**Final report additions** — new "Inferred metadata" section listing any fields that fell back to defaults and any fields that were left blank.

---

## `auditing-plugin-portability` — revised skill

### Phase 1: Detection
Run the Detection Algorithm (Steps D1–D4) above.

### Phase 2: Audit all platforms

Check PRESENT or MISSING for every platform artifact, including Claude Code:

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

### Phase 3–5: Skill sidecar audit, GEMINI/AGENTS completeness, hooks, npx frontmatter
Identical to current Steps 4–8, except the report no longer assumes any platform is already present.

### Updated report format

```
# Portability Audit: <name> v<version>
Metadata inferred from: <canonical source>

## Platform manifests
PRESENT  .claude-plugin/plugin.json
MISSING  .claude-plugin/marketplace.json
PRESENT  .cursor-plugin/plugin.json
MISSING  gemini-extension.json
...

## Skill sidecars
skills/my-skill/
  PRESENT  references/copilot-tools.md
  MISSING  references/codex-tools.md
  MISSING  references/gemini-tools.md
...

## npx skills compatibility
skills/my-skill/SKILL.md   COMPATIBLE
...

## Context file completeness
...

## Hooks
...

## Inferred metadata warnings
  author.name: not found in any source — will be written as empty string
  description: not found in any source — platform manifests will have empty description

## Summary
<N> files present, <M> missing.
<K> skills npx-compatible, <J> missing frontmatter.
Run the uplifting-a-plugin skill to generate all missing files automatically.
```

---

## Template additions required

Two new templates are needed (Claude Code manifests were previously assumed to already exist):

- `assets/templates/claude-plugin/plugin.json.tmpl` — already exists ✅
- `assets/templates/claude-plugin/marketplace.json.tmpl` — already exists ✅
- `assets/templates/CLAUDE.md.tmpl` — already exists ✅

No new template files needed. The uplift skill just needs to check and write these if absent.

---

## What changes vs. current

| Current behaviour | New behaviour |
|---|---|
| Requires `.claude-plugin/plugin.json` to exist | Accepts any valid starting state |
| Hard-fails if Claude manifest absent | Infers metadata from whatever is present |
| Never writes `.claude-plugin/` files | Writes `.claude-plugin/plugin.json`, `marketplace.json`, `CLAUDE.md` if missing |
| Audit assumes Claude manifest present | Audit checks all platforms including Claude Code |
| Metadata sourced from Claude manifest only | Metadata merged from all present sources, most-complete wins |

---

## Out of scope

- Translating Cursor-specific hook script internals (e.g., Cursor env vars → Claude env vars). Flagged in report as manual review items.
- Reading metadata from README.md (too unstructured).
- Inferring `author.*` from git config (out of scope for v1 — flag as missing and let user fill in).
